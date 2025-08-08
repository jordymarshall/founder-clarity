import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const system = `You are a senior startup validation coach. Return STRICT JSON only.`;
    const userBase = (exactCount: number | null) => `Deconstruct the startup idea into structured sections.
Idea: ${idea}

Return JSON with this schema:
{
  "problem": string[],
  "existingAlternatives": string[],
  "customerSegments": string[],
  "earlyAdopters": string[],
  "jobToBeDone": string[]
}

Guidelines:
- Provide ${exactCount ? exactCount : '3-5'} crisp bullet insights per section
- Be specific, actionable, and non-generic
- Tailor to the idea domain and likely users`;

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

    function ensureArrays(obj: any) {
      const fallback = (label: string): string[] => [
        `Initial ${label} insight for ${idea}`,
        `Additional ${label} angle for ${idea}`,
        `Another ${label} to explore for ${idea}`,
      ];
      const out = {
        problem: Array.isArray(obj?.problem) && obj.problem.length ? obj.problem : fallback('problem'),
        existingAlternatives: Array.isArray(obj?.existingAlternatives) && obj.existingAlternatives.length ? obj.existingAlternatives : fallback('existing alternative'),
        customerSegments: Array.isArray(obj?.customerSegments) && obj.customerSegments.length ? obj.customerSegments : fallback('customer segment'),
        earlyAdopters: Array.isArray(obj?.earlyAdopters) && obj.earlyAdopters.length ? obj.earlyAdopters : fallback('early adopter'),
        jobToBeDone: Array.isArray(obj?.jobToBeDone) && obj.jobToBeDone.length ? obj.jobToBeDone : fallback('job to be done'),
      };
      return out;
    }

    // First attempt (3-5 items)
    let content = await callOpenAI(userBase(null));
    let parsed: any;
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    // If empty or missing, try again requiring exactly 4
    const needsRetry = !parsed || Object.keys(parsed).length === 0 ||
      [parsed.problem, parsed.existingAlternatives, parsed.customerSegments, parsed.earlyAdopters, parsed.jobToBeDone]
        .some((arr: any) => !Array.isArray(arr) || arr.length === 0);

    if (needsRetry) {
      content = await callOpenAI(userBase(4));
      try { parsed = JSON.parse(content); } catch { parsed = {}; }
    }

    const ensured = ensureArrays(parsed);

    return new Response(JSON.stringify({ success: true, data: ensured }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('initialize-idea error', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
