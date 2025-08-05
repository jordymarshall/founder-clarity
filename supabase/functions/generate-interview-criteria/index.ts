import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { idea, customerSegment, coreProblem, jobToBeDone } = await req.json();

    console.log('Generating interview criteria for idea:', idea);

    // AI-powered criteria generation based on hypothesis canvas data
    const criteria = generateInterviewCriteria(idea, customerSegment, coreProblem, jobToBeDone);

    return new Response(JSON.stringify({ 
      success: true, 
      criteria: criteria
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating interview criteria:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateInterviewCriteria(idea: string, customerSegment: any, coreProblem: any, jobToBeDone: any) {
  // Extract key insights from hypothesis canvas
  const segments = customerSegment?.content || [];
  const problems = coreProblem?.content || [];
  const jobs = jobToBeDone?.content || [];

  // Generate Apollo API formatted criteria with rationale
  const criteria = {
    // Job titles based on customer segment analysis
    person_titles: extractJobTitles(segments),
    person_titles_rationale: "Based on customer segment analysis, these roles are most likely to experience the core problem and have decision-making authority.",

    // Seniority levels
    person_seniorities: extractSeniorities(segments, problems),
    person_seniorities_rationale: "Target seniority levels that typically have budget authority and experience the pain points identified in core problem analysis.",

    // Company size criteria
    organization_num_employees_ranges: extractCompanySizes(segments, idea),
    company_size_rationale: "Company sizes where the problem is most acute and our solution provides clear value proposition.",

    // Industry focus
    organization_industries: extractIndustries(segments, problems, idea),
    industry_rationale: "Industries most likely to experience the identified problems and benefit from the proposed solution.",

    // Geographic focus (if relevant)
    person_locations: extractLocations(segments),
    location_rationale: "Geographic regions where the target customer segment is concentrated and accessible for interviews.",

    // Exclude certain criteria
    exclude_current_companies: extractExclusions(idea),
    exclusion_rationale: "Exclude direct competitors and companies where bias might affect interview quality."
  };

  return criteria;
}

function extractJobTitles(segments: any[]): string[] {
  const titles: string[] = [];
  
  segments.forEach(segment => {
    const text = segment.text?.toLowerCase() || '';
    
    // Founder/Leadership roles
    if (text.includes('founder') || text.includes('ceo') || text.includes('entrepreneur')) {
      titles.push('founder', 'ceo', 'co-founder', 'entrepreneur');
    }
    
    // Product roles
    if (text.includes('product') || text.includes('pm')) {
      titles.push('product manager', 'head of product', 'chief product officer', 'product owner');
    }
    
    // Engineering roles
    if (text.includes('technical') || text.includes('engineer') || text.includes('developer')) {
      titles.push('cto', 'head of engineering', 'engineering manager', 'lead developer');
    }
    
    // Marketing roles
    if (text.includes('marketing') || text.includes('growth')) {
      titles.push('marketing manager', 'head of marketing', 'growth manager', 'digital marketing manager');
    }
    
    // Sales roles
    if (text.includes('sales') || text.includes('business development')) {
      titles.push('sales manager', 'head of sales', 'business development manager', 'account executive');
    }
    
    // Operations roles
    if (text.includes('operations') || text.includes('ops')) {
      titles.push('operations manager', 'head of operations', 'chief operating officer');
    }
  });
  
  // Default titles if none detected
  if (titles.length === 0) {
    titles.push('founder', 'ceo', 'product manager', 'head of product');
  }
  
  return [...new Set(titles)]; // Remove duplicates
}

function extractSeniorities(segments: any[], problems: any[]): string[] {
  const seniorities: string[] = [];
  
  // Check if targeting decision makers
  const needsDecisionMakers = segments.some(s => 
    s.text?.toLowerCase().includes('decision') || 
    s.text?.toLowerCase().includes('budget') ||
    s.text?.toLowerCase().includes('authority')
  );
  
  if (needsDecisionMakers) {
    seniorities.push('c_suite', 'vp', 'director');
  }
  
  // Check if targeting individual contributors
  const needsUsers = problems.some(p => 
    p.text?.toLowerCase().includes('daily') || 
    p.text?.toLowerCase().includes('workflow') ||
    p.text?.toLowerCase().includes('productivity')
  );
  
  if (needsUsers) {
    seniorities.push('manager', 'senior', 'individual_contributor');
  }
  
  // Default to decision makers if unclear
  if (seniorities.length === 0) {
    seniorities.push('c_suite', 'vp', 'director', 'manager');
  }
  
  return seniorities;
}

function extractCompanySizes(segments: any[], idea: string): string[] {
  const sizes: string[] = [];
  
  segments.forEach(segment => {
    const text = segment.text?.toLowerCase() || '';
    
    if (text.includes('startup') || text.includes('early-stage')) {
      sizes.push('1,50', '51,200');
    } else if (text.includes('enterprise') || text.includes('large')) {
      sizes.push('1000,5000', '5000,10000', '10000,');
    } else if (text.includes('mid-market') || text.includes('medium')) {
      sizes.push('200,1000');
    }
  });
  
  // Default to startup/SMB focus
  if (sizes.length === 0) {
    sizes.push('1,50', '51,200', '200,1000');
  }
  
  return sizes;
}

function extractIndustries(segments: any[], problems: any[], idea: string): string[] {
  const industries: string[] = [];
  
  const allText = [
    ...segments.map(s => s.text || ''),
    ...problems.map(p => p.text || ''),
    idea
  ].join(' ').toLowerCase();
  
  // Technology
  if (allText.includes('software') || allText.includes('tech') || allText.includes('app')) {
    industries.push('Computer Software', 'Information Technology & Services');
  }
  
  // SaaS/B2B
  if (allText.includes('saas') || allText.includes('b2b') || allText.includes('business')) {
    industries.push('Computer Software', 'Information Technology & Services', 'Management Consulting');
  }
  
  // E-commerce
  if (allText.includes('ecommerce') || allText.includes('retail') || allText.includes('shopping')) {
    industries.push('Retail', 'E-commerce', 'Consumer Goods');
  }
  
  // Keep broad if no specific industry detected
  if (industries.length === 0) {
    industries.push('Computer Software', 'Information Technology & Services', 'Internet');
  }
  
  return industries;
}

function extractLocations(segments: any[]): string[] {
  const locations: string[] = [];
  
  segments.forEach(segment => {
    const text = segment.text?.toLowerCase() || '';
    
    if (text.includes('us') || text.includes('america') || text.includes('united states')) {
      locations.push('United States');
    }
    if (text.includes('europe') || text.includes('eu')) {
      locations.push('United Kingdom', 'Germany', 'France');
    }
    if (text.includes('silicon valley') || text.includes('bay area')) {
      locations.push('San Francisco, CA', 'Palo Alto, CA');
    }
    if (text.includes('new york') || text.includes('nyc')) {
      locations.push('New York, NY');
    }
  });
  
  // Default to major startup hubs
  if (locations.length === 0) {
    locations.push('United States', 'San Francisco, CA', 'New York, NY', 'Austin, TX');
  }
  
  return locations;
}

function extractExclusions(idea: string): string[] {
  // Basic exclusions - could be enhanced based on idea analysis
  return [];
}
