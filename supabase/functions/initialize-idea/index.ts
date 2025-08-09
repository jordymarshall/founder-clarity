import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sections
const sections = ['problem','existingAlternatives','customerSegments','earlyAdopters','jobToBeDone'] as const;

// Detect generic filler patterns
function isGeneric(items: unknown): boolean {
  if (!Array.isArray(items) || items.length === 0) return true;
  const genericPattern = /(initial|additional|another)\s.+(insight|angle|to explore)/i;
  return items.some((t) => typeof t === 'string' && genericPattern.test(t));
}

// Perplexity: tailored prompt per section using latest non-pro sonar model
async function fetchPerplexityForSection(idea: string, section: typeof sections[number]): Promise<string> {
  if (!perplexityApiKey) return '';
  const instructionsBySection: Record<typeof sections[number], string> = {
    problem: `Find concrete pain points, friction, and costly workarounds users face for this idea domain. Prefer verbatim phrases from sources when possible.`,
    existingAlternatives: `List named tools, vendors, open-source projects, DIY workflows people use today. Include brand/tool names and brief why they are used.`,
    customerSegments: `Identify archetypes/roles/industries and environments. Include seniority bands or company sizes if relevant.`,
    earlyAdopters: `Pinpoint who feels the problem most acutely and experiments first; communities and contexts where early adoption happens.`,
    jobToBeDone: `Describe desired outcomes and moments of progress; use JTBD language (switching trigger, desired outcome, anxieties, habits).`,
  };

  const content = `Do focused web scoping for section: [${section}].\nIdea: ${idea}\nMethodology cues: Lean Canvas, JTBD, Customer Forces Canvas. Be factual and specific.\nReturn a compact brief: max 5 bullets for this section only.`;

  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'system', content: 'Be precise and concise. Cite concrete products, roles, and contexts. No filler.' },
          { role: 'user', content: instructionsBySection[section] + '\n\n' + content }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 700,
        return_images: false,
        return_related_questions: false,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!res.ok) {
      console.error('Perplexity error', section, await res.text());
      return '';
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || '';
    return text;
  } catch (e) {
    console.error('Perplexity fetch failed', section, e);
    return '';
  }
}

async function fetchPerplexityAll(idea: string): Promise<Record<string, string>> {
  const entries: [typeof sections[number], Promise<string>][] = sections.map((s) => [s, fetchPerplexityForSection(idea, s)]);
  const results = await Promise.all(entries.map(([, p]) => p));
  const out: Record<string, string> = {};
  entries.forEach(([s], i) => { out[s] = results[i]; });
  return out;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { idea } = await req.json();

    // Web-informed scoping per section via Perplexity (optional)
    const researchBySection = await fetchPerplexityAll(idea);
    const usedPerplexity = Object.values(researchBySection).some((v) => v && v.length > 0);

    async function synthesizeSection(section: typeof sections[number], research: string, count: number): Promise<string[]> {
      const system = `You are a senior startup validation coach.
- Apply Validation Masterclass & Startup Methodology: Lean Canvas, JTBD, Customer Forces (push, pull, inertia, friction).
- Use provided research when available. Prefer concrete roles, tools, brands, and contexts.
- Return STRICT JSON object: { "items": string[] } and nothing else.`;

      const prompt = `Write ${count} crisp, concrete bullets for the section "${section}" for the idea below.
Idea: ${idea}
Section-specific research (may be empty):\n${research || 'None'}
Guidelines:
- ONE idea per bullet; avoid conjunctions
- Avoid generic phrasing or placeholders
- Align to JTBD and Forces where relevant
- If no research, reason from first principles in this domain`;

      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.35,
            max_tokens: 500,
          }),
        });
        if (!res.ok) {
          console.error('OpenAI synthesizeSection error', section, await res.text());
          return [];
        }
        const data = await res.json();
        let obj: any = {};
        try { obj = JSON.parse(data.choices?.[0]?.message?.content || '{}'); } catch { obj = {}; }
        const arr = Array.isArray(obj?.items) ? obj.items.filter((s: unknown) => typeof s === 'string') : [];
        return arr;
      } catch (e) {
        console.error('OpenAI synthesizeSection exception', section, e);
        return [];
      }
    }

    const result: Record<string, string[]> = {};
    // Synthesize each section with research; retry once if generic/empty
    for (const sec of sections) {
      const first = await synthesizeSection(sec, researchBySection[sec] || '', 4);
      if (!first.length || isGeneric(first)) {
        const second = await synthesizeSection(sec, researchBySection[sec] || '', 5);
        result[sec] = second.length ? second : first;
      } else {
        result[sec] = first;
      }
    }

    // Final guard
    for (const sec of sections) {
      if (!Array.isArray(result[sec])) result[sec] = [];
    }

    return new Response(
      JSON.stringify({ success: true, data: {
        problem: result.problem,
        existingAlternatives: result.existingAlternatives,
        customerSegments: result.customerSegments,
        earlyAdopters: result.earlyAdopters,
        jobToBeDone: result.jobToBeDone,
      }, meta: { usedPerplexity, strategy: 'perplexity-per-section + gpt-4.1 synthesis' } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('initialize-idea error', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
