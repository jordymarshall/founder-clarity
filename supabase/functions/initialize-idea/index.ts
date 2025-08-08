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
    existingAlternatives: `List named tools, vendors, open-source projects, DIY workflows people use today. Include brand/tool names and briefly why they are used.`,
    customerSegments: `Identify archetypes/roles/industries and environments. Include seniority bands or company sizes if relevant.`,
    earlyAdopters: `Pinpoint who feels the problem most acutely and experiments first; communities and contexts where early adoption happens.`,
    jobToBeDone: `Describe desired outcomes and moments of progress; use JTBD language (switching trigger, desired outcome, anxieties, habits).`,
  };

  const content = `Do focused web scoping for section: [${section}].\nIdea: ${idea}\nMethodology cues: Lean Canvas, JTBD, Customer Forces Canvas. Be factual and specific.\nReturn a compact brief: max 5 bullets for this section only.`;

  // Prefer latest non-pro sonar model with graceful fallbacks
  const envModel = Deno.env.get('PERPLEXITY_MODEL');
  const modelCandidates = [
    envModel || 'sonar-small-online',
    'llama-3.1-sonar-small-128k-online',
    'llama-3.1-sonar-large-128k-online',
  ];

  for (const model of modelCandidates) {
    try {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
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
        const errText = await res.text();
        console.error('Perplexity error', section, model, errText);
        // try next model on invalid model errors
        if (res.status === 400 && /invalid_model/i.test(errText)) continue;
        // For other errors, do not continue through candidates
        return '';
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim() || '';
      if (text) return text;
    } catch (e) {
      console.error('Perplexity fetch failed', section, model, e);
      // Try next model
      continue;
    }
  }

  return '';
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
Ground every response in:
- Validation Masterclass (Modules 1–5): deconstruct beliefs; prospect & interview with a Learning Frame; Customer Forces Canvas (push, pull, inertia, friction); synthesize recurring patterns; design the Offer (Promise/Ask/Demo).
- Startup Methodology: Victims (segments), Crime (problem), Existing Alternatives; JTBD (switching trigger, what's at stake, consideration set, desired outcome, anxieties, habits).
Rules:
- Prefer concrete roles, tools, brands, contexts and time/place details.
- No fluff. Output MUST be STRICT JSON: { "items": string[] }`;

      const prompt = `Write ${count} crisp bullets for section "${section}" for the idea below.
Idea: ${idea}
Section-specific research (may be empty):\n${research || 'None'}
Section mapping:
- problem → concrete pains, friction, costly workarounds, what's at stake (time, money, risk)
- existingAlternatives → named tools/DIY with brief why people choose them (axes of better)
- customerSegments → archetypes/roles, industry, company size/seniority, context of occurrence
- earlyAdopters → who feels it acutely, where they congregate (communities/channels), signs of experimentation
- jobToBeDone → switching trigger, desired outcome, constraints, anxieties, habits/inertia
Guidelines:
- ONE idea per bullet; avoid conjunctions
- Avoid generic phrasing or placeholders
- Align to JTBD & Forces; use first-principles if research is thin`;


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
      }, meta: { usedPerplexity, strategy: 'perplexity sonar (non-pro) per section + methodology-guided gpt synthesis' } }),
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
