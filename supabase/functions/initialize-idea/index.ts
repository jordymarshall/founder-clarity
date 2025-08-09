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
    jobToBeDone: `LEVEL UP from the existing alternatives to infer the underlying progress customers seek. Avoid tool/solution words; focus on desired outcome, context, and triggers (push/pull/inertia/friction). Phrase as a single crisp JTBD statement.`,
  };

  const content = `Do focused web scoping for section: [${section}].\nIdea: ${idea}\nMethodology cues: Lean Canvas, JTBD, Customer Forces Canvas. Be factual and specific.\nReturn a compact brief: max 5 bullets for this section only, and include an inline source URL in each bullet (http...) to ground facts.`;

  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-small-online',
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
      const allowedUrls = Array.from(new Set((research.match(/https?:\/\/[^\s)\]]+/g) || []).slice(0, 25)));
      const methodology = `Ground in our Startup Methodology: focus on customer progress (JTBD), Customer Forces (push, pull, inertia, friction), and avoid solution-speak.`;
      const system = `You are a senior startup validation coach.\n- Apply Validation Masterclass & Startup Methodology: Lean Canvas, JTBD, Customer Forces (push, pull, inertia, friction).\n- Use ONLY facts explicitly present in the Inputs and (if provided) Allowed sources URLs.\n- If evidence is insufficient, output 'UNKNOWN' rather than guessing.\n- Return STRICT JSON object: { "items": string[] } and nothing else.`;

      const jtbdGuidelines = section === 'jobToBeDone' ? `\n- Derive by LEVELING UP from listed existing alternatives to the underlying progress sought\n- Abstract away tools/solutions; focus on desired outcome, trigger/context, anxieties/habits\n- Use format: "Help [segment] [achieve progress] when [situation], so they can [desired outcome] without [major friction]"\n- Produce ONE single-line JTBD (<= 140 chars)` : '';

      const prompt = `Write ${count} crisp, concrete bullets for the section "${section}" for the idea below.\nIdea: ${idea}\nMethodology: ${methodology}\nInputs (may be empty):\n${research || 'None'}\nAllowed sources (URLs):\n${allowedUrls.length ? allowedUrls.map((u,i)=>`[${i+1}] ${u}`).join('\n') : '(none)'}\nGuidelines:\n- ONE idea per bullet; avoid conjunctions\n- Avoid generic phrasing or placeholders\n- Align to JTBD and Forces where relevant${jtbdGuidelines}\n- If no research, reason from first principles but DO NOT invent facts beyond the inputs; if uncertain, write 'UNKNOWN'`;


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
      const isJTBD = sec === 'jobToBeDone';
      const count = isJTBD ? 1 : 4;
      // For JTBD, combine prior sections to explicitly level up from alternatives
      const combinedResearch = isJTBD
        ? (() => {
            const parts: string[] = [];
            parts.push(researchBySection[sec] || '');
            parts.push('Existing alternatives (for leveling up):');
            (result.existingAlternatives || []).forEach((b) => parts.push(`- ${b}`));
            parts.push('Customer segments (who):');
            (result.customerSegments || []).forEach((b) => parts.push(`- ${b}`));
            parts.push('Core problems (context/triggers):');
            (result.problem || []).forEach((b) => parts.push(`- ${b}`));
            return parts.join('\n');
          })()
        : (researchBySection[sec] || '');

      const first = await synthesizeSection(sec, combinedResearch, count);
      if (!first.length || isGeneric(first)) {
        const second = await synthesizeSection(sec, combinedResearch, count);
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
