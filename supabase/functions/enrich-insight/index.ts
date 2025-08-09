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

async function fetchPerplexityBrief(topic: string): Promise<{ bullets: { text: string; urls: string[] }[]; raw: string }> {
  if (!perplexityApiKey) return { bullets: [], raw: '' };
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
          { role: 'system', content: 'Be precise and concise. Provide evidence-backed bullets with source URLs.' },
          { role: 'user', content: `Research this topic and return STRICT JSON: {"bullets":[{"text": string, "urls": string[]}]}.\n- 3 to 6 bullets.\n- Each bullet MUST include at least one HTTP(S) URL in urls.\nTopic to research:\n${topic}` }
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
      return { bullets: [], raw: '' };
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || '';
    try {
      const obj = JSON.parse(content);
      if (Array.isArray(obj?.bullets)) {
        return { bullets: obj.bullets, raw: content };
      }
    } catch {}
    // Fallback: return as raw text to parse URLs later
    return { bullets: [], raw: content };
  } catch (e) {
    console.error('Perplexity enrich-insight exception', e);
    return { bullets: [], raw: '' };
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
    let structured: any = null;

    if (openAIApiKey) {
      const evidenceBullets = brief.bullets.map((b) => `- ${b.text}`).join('\n');
      const allowedUrls = Array.from(new Set([
        ...brief.bullets.flatMap((b) => Array.isArray(b.urls) ? b.urls : []),
        ...extractUrls(brief.raw)
      ])).slice(0, 12);
      const system = `You are a senior startup validation coach. Apply our Startup Methodology (Lean Canvas, JTBD, Customer Forces).\nReturn STRICT JSON only with this schema:\n{\n  "rationale": string,\n  "sources": {"title": string, "url": string}[],\n  "structure": {\n    "context": string,\n    "forces": {"push": string[], "pull": string[], "inertia": string[], "friction": string[]},\n    "evidence": {"text": string, "urls": string[]}[],\n    "implications": string[],\n    "conclusion": string\n  }\n}`;
      const guidance = categoryGuidance(category);
      const prompt = `We are evaluating an insight within the category: ${category}. ${guidance}\n\nTask:\n- Write a clear, structured rationale that explains the WHY behind the insight.\n- Populate the Customer Forces (push/pull/inertia/friction) with short bullet phrases.\n- Use ONLY the inputs and allowed sources. Do not invent facts.\n- If evidence is thin, state the limitation in context and keep forces minimal.\n\nInputs:\n${topic}\n\nEvidence bullets (from web):\n${evidenceBullets || '—'}\n\nAllowed sources (URLs):\n${allowedUrls.length ? allowedUrls.map((u,i)=>`[${i+1}] ${u}`).join('\n') : '(none)'}\n\nOutput requirements:\n- rationale: 1–2 concise paragraphs, customer-progress centric\n- structure.context: one paragraph summarizing the situation and who/when\n- structure.forces: arrays of short phrases (2–4 each when evidence supports)\n- structure.evidence: reference the specific URLs used per bullet\n- structure.implications: 2–4 practical takeaways for discovery/validation\n- structure.conclusion: a single, crisp sentence that captures the essence`;

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
              .slice(0, 12);
          }
          if (obj?.structure && typeof obj.structure === 'object') {
            structured = obj.structure;
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

    if (!sources.length && (brief.raw && brief.raw.length)) {
      const urls = extractUrls(brief.raw);
      sources = urls.map((u) => ({ title: toTitleFromUrl(u), url: u })).slice(0, 5);
    }

    if (!structured) {
      structured = {
        context: `Context not fully established; evidence limited.`,
        forces: { push: [], pull: [], inertia: [], friction: [] },
        evidence: (brief.bullets || []).slice(0, 4).map((b: any) => ({ text: b.text || '', urls: Array.isArray(b.urls) ? b.urls : [] })),
        implications: [],
        conclusion: ''
      };
    }

    return new Response(JSON.stringify({ success: true, data: { rationale, sources, structure: structured } }), {
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