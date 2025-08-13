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
    const { cardTitle, existingPoints, idea } = await req.json();

    const existingPointsText = existingPoints.map((point: any, index: number) => 
      `${index + 1}. ${point.text}`
    ).join('\n');

    const prompt = `
You are helping analyze a startup idea: "${idea}"

For the "${cardTitle}" section, I already have these insights:
${existingPointsText}

Generate 1 additional, unique insight for this section that:
- Is different from the existing points
- Provides new valuable perspective
- Is specific and actionable
- Follows the same format and depth as existing points

Respond with a JSON object containing:
{
  "text": "The new insight text",
  "rationale": "Detailed explanation of why this insight is important, including specific data, research, or reasoning that supports it"
}

Make the rationale evidence-based with specific details, statistics, or research findings when possible.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: 'You are an expert startup strategist and market analyst. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // Parse the JSON response
    let bulletPoint;
    try {
      bulletPoint = JSON.parse(generatedContent);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      bulletPoint = {
        text: "Generated insight based on market analysis",
        rationale: "This insight was generated to provide additional perspective on your hypothesis"
      };
    }

    return new Response(JSON.stringify({ bulletPoint }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-hypothesis-point function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});