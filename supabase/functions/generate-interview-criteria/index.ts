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
    const { idea, candidateProfile, customerSegment, coreProblem, jobToBeDone, existingAlternatives } = await req.json();

    console.log('Generating Apollo search criteria for interview candidate profile:', candidateProfile);

    // AI-powered criteria generation based on validation masterclass methodology
    const criteria = generateApolloSearchCriteria(candidateProfile, customerSegment, coreProblem, jobToBeDone, existingAlternatives);

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

function generateApolloSearchCriteria(candidateProfile: any, customerSegment: any, coreProblem: any, jobToBeDone: any, existingAlternatives: any) {
  // Following validation masterclass Module 2 methodology
  // Transform interview candidate profile into Apollo API search parameters
  
  const criteria = {
    // Job titles based on early adopter segment analysis
    person_titles: extractJobTitlesFromProfile(candidateProfile),
    
    // Seniority levels based on customer segment and JTBD
    person_seniorities: extractSenioritiesFromProfile(candidateProfile),
    
    // Company size criteria based on customer segment
    organization_num_employees_ranges: extractCompanySizesFromProfile(candidateProfile),
    
    // Industry focus based on customer segment and existing alternatives
    organization_industries: extractIndustriesFromProfile(candidateProfile, existingAlternatives),
    
    // Geographic focus based on early adopter segment
    person_locations: extractLocationsFromProfile(candidateProfile)
  };

  return criteria;
}

function extractJobTitlesFromProfile(candidateProfile: any): string[] {
  const titles: string[] = [];
  
  const earlyAdopterText = candidateProfile.earlyAdopterSegment?.toLowerCase() || '';
  const customerSegmentText = candidateProfile.customerSegment?.toLowerCase() || '';
  
  // Founder/Leadership roles
  if (earlyAdopterText.includes('founder') || earlyAdopterText.includes('ceo') || 
      earlyAdopterText.includes('entrepreneur') || customerSegmentText.includes('founder')) {
    titles.push('founder', 'ceo', 'co-founder', 'entrepreneur');
  }
  
  // Technical roles
  if (earlyAdopterText.includes('technical') || earlyAdopterText.includes('engineer') || 
      earlyAdopterText.includes('developer') || earlyAdopterText.includes('cto')) {
    titles.push('cto', 'head of engineering', 'engineering manager', 'lead developer', 'software engineer');
  }
  
  // Product roles
  if (earlyAdopterText.includes('product') || candidateProfile.hypothesizedJTBD?.toLowerCase().includes('product')) {
    titles.push('product manager', 'head of product', 'chief product officer', 'product owner');
  }
  
  // Business/Operations roles
  if (earlyAdopterText.includes('business') || earlyAdopterText.includes('operations') ||
      customerSegmentText.includes('owner') || customerSegmentText.includes('manager')) {
    titles.push('business owner', 'operations manager', 'general manager', 'director');
  }
  
  // Marketing/Growth roles if JTBD involves customer acquisition
  if (candidateProfile.hypothesizedJTBD?.toLowerCase().includes('customer') ||
      candidateProfile.hypothesizedJTBD?.toLowerCase().includes('growth') ||
      candidateProfile.hypothesizedJTBD?.toLowerCase().includes('marketing')) {
    titles.push('marketing manager', 'head of marketing', 'growth manager', 'head of growth');
  }
  
  // Default titles if none detected
  if (titles.length === 0) {
    titles.push('founder', 'ceo', 'owner', 'manager');
  }
  
  return [...new Set(titles)]; // Remove duplicates
}

function extractSenioritiesFromProfile(candidateProfile: any): string[] {
  const seniorities: string[] = [];
  
  const earlyAdopterText = candidateProfile.earlyAdopterSegment?.toLowerCase() || '';
  const jtbdText = candidateProfile.hypothesizedJTBD?.toLowerCase() || '';
  
  // If targeting business growth or strategic decisions, need decision makers
  if (jtbdText.includes('grow') || jtbdText.includes('business') || jtbdText.includes('strategy') ||
      earlyAdopterText.includes('owner') || earlyAdopterText.includes('founder')) {
    seniorities.push('c_suite', 'founder', 'vp', 'director');
  }
  
  // If targeting operational efficiency or daily workflows, include managers and ICs
  if (jtbdText.includes('efficiency') || jtbdText.includes('process') || jtbdText.includes('workflow') ||
      candidateProfile.existingAlternative?.toLowerCase().includes('manual')) {
    seniorities.push('manager', 'senior');
  }
  
  // Default to decision makers for early-stage validation
  if (seniorities.length === 0) {
    seniorities.push('c_suite', 'founder', 'vp', 'director', 'manager');
  }
  
  return seniorities;
}

function extractCompanySizesFromProfile(candidateProfile: any): string[] {
  const sizes: string[] = [];
  
  const customerSegmentText = candidateProfile.customerSegment?.toLowerCase() || '';
  const earlyAdopterText = candidateProfile.earlyAdopterSegment?.toLowerCase() || '';
  
  if (customerSegmentText.includes('startup') || customerSegmentText.includes('small') ||
      earlyAdopterText.includes('early-stage') || earlyAdopterText.includes('startup')) {
    sizes.push('1,10', '11,50', '51,200');
  } else if (customerSegmentText.includes('enterprise') || customerSegmentText.includes('large')) {
    sizes.push('1000,5000', '5000,10000', '10000,');
  } else if (customerSegmentText.includes('mid') || customerSegmentText.includes('medium')) {
    sizes.push('200,1000');
  }
  
  // Default to small-medium companies for easier validation
  if (sizes.length === 0) {
    sizes.push('1,50', '51,200', '200,1000');
  }
  
  return sizes;
}

function extractIndustriesFromProfile(candidateProfile: any, existingAlternatives: any): string[] {
  const industries: string[] = [];
  
  const allText = [
    candidateProfile.customerSegment || '',
    candidateProfile.earlyAdopterSegment || '',
    candidateProfile.hypothesizedJTBD || '',
    candidateProfile.existingAlternative || ''
  ].join(' ').toLowerCase();
  
  // Add industries from existing alternatives analysis
  const alternatives = existingAlternatives?.content || [];
  const alternativeText = alternatives.map((alt: any) => alt.text || '').join(' ').toLowerCase();
  
  // Technology/Software
  if (allText.includes('software') || allText.includes('tech') || allText.includes('app') ||
      allText.includes('digital') || alternativeText.includes('tool')) {
    industries.push('Computer Software', 'Information Technology & Services');
  }
  
  // E-commerce/Retail
  if (allText.includes('ecommerce') || allText.includes('retail') || allText.includes('shop') ||
      allText.includes('store') || allText.includes('commerce')) {
    industries.push('Retail', 'E-commerce', 'Consumer Goods');
  }
  
  // Professional Services
  if (allText.includes('consulting') || allText.includes('agency') || allText.includes('service') ||
      allText.includes('professional')) {
    industries.push('Management Consulting', 'Professional Services');
  }
  
  // Healthcare
  if (allText.includes('health') || allText.includes('medical') || allText.includes('clinic')) {
    industries.push('Healthcare', 'Medical Practice');
  }
  
  // SaaS/B2B (common for startup tools)
  if (allText.includes('business') || allText.includes('b2b') || allText.includes('saas') ||
      candidateProfile.hypothesizedJTBD?.toLowerCase().includes('grow')) {
    industries.push('Computer Software', 'Information Technology & Services', 'Internet');
  }
  
  // Default to tech/software for most startup validation
  if (industries.length === 0) {
    industries.push('Computer Software', 'Information Technology & Services', 'Internet');
  }
  
  return [...new Set(industries)]; // Remove duplicates
}

function extractLocationsFromProfile(candidateProfile: any): string[] {
  const locations: string[] = [];
  
  const allText = [
    candidateProfile.customerSegment || '',
    candidateProfile.earlyAdopterSegment || ''
  ].join(' ').toLowerCase();
  
  // Specific geographic mentions
  if (allText.includes('urban') || allText.includes('city') || allText.includes('metropolitan')) {
    locations.push('United States', 'New York, NY', 'San Francisco, CA', 'Los Angeles, CA');
  }
  
  if (allText.includes('us') || allText.includes('america') || allText.includes('united states')) {
    locations.push('United States');
  }
  
  if (allText.includes('silicon valley') || allText.includes('bay area') || allText.includes('tech hub')) {
    locations.push('San Francisco, CA', 'Palo Alto, CA', 'Mountain View, CA');
  }
  
  // Default to major business centers for easier interview access
  if (locations.length === 0) {
    locations.push('United States', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Boston, MA');
  }
  
  return locations;
}
