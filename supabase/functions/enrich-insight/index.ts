import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Category = 'problem' | 'existingAlternatives' | 'customerSegments' | 'earlyAdopters' | 'jobToBeDone';

function categoryGuidance(category: Category): string {
  switch (category) {
    case 'problem':
      return '- Clarify friction, costs, and measurable impact. Tie to specific contexts and triggers.';
    case 'existingAlternatives':
      return '- Explain why people hire current tools/workarounds despite gaps. What jobs are they really doing?';
    case 'customerSegments':
      return '- Explain who (role, seniority, industry, company size) and environment constraints that shape behavior.';
    case 'earlyAdopters':
      return '- Explain why this group feels the pain most (push), what pulls them to try, and what reduces inertia/friction.';
    case 'jobToBeDone':
      return '- LEVEL UP from alternatives to progress sought. Use forces (push/pull/inertia/friction). Keep solution-agnostic.';
  }
}

async function fetchPerplexityBrief(topic: string): Promise<string> {
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
          { role: 'system', content: 'Be precise and concise. Include concrete facts. Provide 3-6 bullets with inline source URLs.' },
          { role: 'user', content: `Research this topic and provide 3–6 highly factual bullets with inline citations (URLs):\n${topic}\nReturn markdown bullets that include the source URL in each bullet.` }
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
      console.error('Perplexity enrich-insight error', await res.text());
      return '';
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || '';
    return text;
  } catch (e) {
    console.error('Perplexity enrich-insight exception', e);
    return '';
  }
}

function extractUrls(markdown: string): string[] {
  const urls = new Set<string>();
  const regex = /(https?:\/\/[^\s)\]]+)/g;
  let m;
  while ((m = regex.exec(markdown)) !== null) {
    urls.add(m[1]);
  }
  return Array.from(urls).slice(0, 8);
}

function toTitleFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, block, context } = await req.json();
    const category: Category = block?.category;
    const content: string = block?.content || '';

    const topic = `Idea: ${idea}\nCategory: ${category}\nInsight: ${content}\nContext:\n- Problem: ${(context?.problem || []).join('\n- ')}\n- Existing Alternatives: ${(context?.existingAlternatives || []).join('\n- ')}\n- Customer Segments: ${(context?.customerSegments || []).join('\n- ')}\n- Early Adopters: ${(context?.earlyAdopters || []).join('\n- ')}\n- JTBD: ${(context?.jobToBeDone || []).join('\n- ')}`;

    const brief = await fetchPerplexityBrief(topic);

    let rationale = '';
    let sources: { title: string; url: string }[] = [];

    if (openAIApiKey) {
      const system = `You are a senior startup validation coach. Apply Validation Masterclass & Startup Methodology (Lean Canvas, JTBD, Customer Forces). Return STRICT JSON: { "rationale": string, "sources": {"title": string, "url": string}[] }.`;
      const guidance = categoryGuidance(category);
      const prompt = `Craft a deep rationale for this insight so a founder understands the why behind it.\n- Use evidence and causal reasoning.\n- Tie to forces (push, pull, inertia, friction) and measurable impact.\n- Avoid solution-speak; be customer-progress centric.\n- Write 1–2 concise paragraphs.\n\nInputs:\n${topic}\n\nWeb brief (may include URLs):\n${brief || '—'}\n\nExtract sources from the web brief URLs if present. If none, leave sources empty. Return JSON only.`;

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
          temperature: 0.3,
          max_tokens: 600,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        try {
          const obj = JSON.parse(data.choices?.[0]?.message?.content || '{}');
          if (obj?.rationale && typeof obj.rationale === 'string') rationale = obj.rationale.trim();
          if (Array.isArray(obj?.sources)) {
            sources = obj.sources
              .filter((s: any) => s && typeof s.url === 'string')
              .map((s: any) => ({ title: (s.title || '').toString().slice(0, 140) || toTitleFromUrl(s.url), url: s.url }))
              .slice(0, 8);
          }
        } catch {}
      } else {
        console.error('OpenAI enrich-insight error', await res.text());
      }
    }

    // Fallbacks if needed
    if (!rationale) {
      rationale = `This insight indicates progress customers are trying to make within ${category}. It matters because it reveals the push (triggers), the pull (desired outcomes), and the inertia/frictions that keep current behavior in place. Clarifying this helps focus discovery on high-impact constraints and measurable value.`;
    }

    if (!sources.length && brief) {
      const urls = extractUrls(brief);
      sources = urls.map((u) => ({ title: toTitleFromUrl(u), url: u })).slice(0, 5);
    }

    return new Response(JSON.stringify({ success: true, data: { rationale, sources } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('enrich-insight error', error);
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});