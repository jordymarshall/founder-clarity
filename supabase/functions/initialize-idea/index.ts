import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple utility to detect obvious generic filler patterns
function isGeneric(items: unknown): boolean {
  if (!Array.isArray(items) || items.length === 0) return true;
  const genericPattern = /(initial|additional|another)\s.+(insight|angle|to explore)/i;
  return items.some((t) => typeof t === 'string' && genericPattern.test(t));
}

async function fetchPerplexityResearch(idea: string): Promise<string> {
  if (!perplexityApiKey) return '';
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
          { role: 'system', content: 'Be precise and concise. Cite concrete products, tools, jobs, and contexts when possible.' },
          {
            role: 'user',
            content:
              `Do quick scoping research for the startup idea below. Summarize only verifiable, concrete information.

Idea: ${idea}

Return a compact research brief with these sections and bullet points (no more than 5 bullets each):
[Customer Segments] - Archetypes, roles, environments
[Problems] - Pain points, friction, costly workarounds
[Existing Alternatives] - Named tools/brands/processes used today
[Early Adopters] - Who feels the pain most acutely and experiments early
[JTBD Clues] - Desired outcomes and moments of progress

Keep it factual, specific, and web-informed. No filler.`
          }
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
      console.error('Perplexity error', await res.text());
      return '';
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || '';
    return text;
  } catch (e) {
    console.error('Perplexity fetch failed', e);
    return '';
  }
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

    // Optional: web-informed scoping via Perplexity
    const researchBrief = await fetchPerplexityResearch(idea);

    const system = `You are a senior startup validation coach.
- Apply the Validation Masterclass and Startup Methodology principles:
  • Lean Canvas: Problem, Existing Alternatives, Customer Segments, Early Adopters, UVP
  • Customer/Problem Fit as primary objective
  • JTBD (desired progress) and switching triggers
  • Customer Forces Canvas: Push, Pull, Inertia, Friction
- Use any provided research as grounding. Prefer concrete nouns, roles, tools, brands, and contexts.
- Output STRICT JSON only.`;

    const userBase = (exactCount: number | null) => `Deconstruct the startup idea into structured sections using the methodology above.

Idea: ${idea}

Web-informed Research (optional, may be empty):\n${researchBrief || 'No external research available.'}

Return JSON with this schema:
{
  "problem": string[],
  "existingAlternatives": string[],
  "customerSegments": string[],
  "earlyAdopters": string[],
  "jobToBeDone": string[]
}

Guidelines:
- Provide ${exactCount ? exactCount : '3-5'} crisp, concrete bullets per section
- Avoid generic phrasing and filler; use specific roles, contexts, tools, examples, and outcomes
- Each bullet states ONE idea; avoid conjunctions that bundle multiple ideas
- Align to JTBD and Forces where relevant (push, pull, inertia, friction)
- If the research contradicts common assumptions, side with research
- Do not include placeholders like "Initial insight" or "Another angle"`;

    async function callOpenAI(prompt: string) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-mini',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
          max_tokens: 900,
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      return content;
    }

    function parseJSON(content: string): any {
      try { return JSON.parse(content); } catch { return {}; }
    }

    function invalid(obj: any): boolean {
      if (!obj || typeof obj !== 'object') return true;
      const sections = ['problem','existingAlternatives','customerSegments','earlyAdopters','jobToBeDone'] as const;
      return sections.some((k) => !Array.isArray(obj[k]) || obj[k].length === 0 || isGeneric(obj[k]));
    }

    async function synthesizeSection(label: string, count: number): Promise<string[]> {
      const sectionPrompt = `Using the idea and research below, write ${count} specific, concrete bullets for the section "${label}" only. No preamble, STRICT JSON array only.
Idea: ${idea}
Research: ${researchBrief || 'None'}
Constraints:
- Avoid generic phrasing and placeholders
- Use concrete roles, examples, tools, brands, or contexts when possible
- ONE idea per bullet`;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-mini',
          messages: [
            { role: 'system', content: 'Return STRICT JSON only.' },
            { role: 'user', content: sectionPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.35,
          max_tokens: 400,
        }),
      });
      const data = await res.json();
      // Expecting an array JSON; if object, try to coerce
      let arr: any;
      try { arr = JSON.parse(data.choices?.[0]?.message?.content || '[]'); } catch { arr = []; }
      if (Array.isArray(arr)) return arr.filter((s) => typeof s === 'string');
      // If we got an object like { items: [...] }
      if (Array.isArray(arr?.items)) return arr.items.filter((s: unknown) => typeof s === 'string');
      return [];
    }

    // First attempt (3-5 items)
    let content = await callOpenAI(userBase(null));
    let parsed: any = parseJSON(content);

    // If empty/missing or generic, try again requiring exactly 4
    const needsRetry = invalid(parsed);
    if (needsRetry) {
      content = await callOpenAI(userBase(4));
      parsed = parseJSON(content);
    }

    // If still invalid, fill missing sections via targeted synthesis grounded in research
    const sections = ['problem','existingAlternatives','customerSegments','earlyAdopters','jobToBeDone'] as const;
    for (const sec of sections) {
      if (!Array.isArray(parsed?.[sec]) || parsed[sec].length === 0 || isGeneric(parsed[sec])) {
        parsed[sec] = await synthesizeSection(sec, 4);
      }
    }

    // Final guard: ensure arrays exist (may still be empty if all else failed)
    const ensured = {
      problem: Array.isArray(parsed.problem) ? parsed.problem : [],
      existingAlternatives: Array.isArray(parsed.existingAlternatives) ? parsed.existingAlternatives : [],
      customerSegments: Array.isArray(parsed.customerSegments) ? parsed.customerSegments : [],
      earlyAdopters: Array.isArray(parsed.earlyAdopters) ? parsed.earlyAdopters : [],
      jobToBeDone: Array.isArray(parsed.jobToBeDone) ? parsed.jobToBeDone : [],
    };

    return new Response(
      JSON.stringify({ success: true, data: ensured, meta: { usedPerplexity: Boolean(researchBrief), revised: needsRetry, strategy: 'perplexity+openai' } }),
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
