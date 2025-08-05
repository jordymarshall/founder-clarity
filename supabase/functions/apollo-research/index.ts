import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const apolloApiKey = Deno.env.get('APOLLO_API_KEY');

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
    const { type, query } = await req.json();

    let endpoint = '';
    let requestBody = {};

    switch (type) {
      case 'company':
        endpoint = 'https://api.apollo.io/v1/organizations/enrich';
        requestBody = { domain: query };
        break;
      case 'person':
        endpoint = 'https://api.apollo.io/v1/people/match';
        requestBody = { email: query };
        break;
      case 'people_search':
        endpoint = 'https://api.apollo.io/v1/mixed_people/search';
        requestBody = {
          person_titles: query.person_titles || [],
          person_seniorities: query.person_seniorities || [],
          organization_num_employees_ranges: query.organization_num_employees_ranges || [],
          organization_industries: query.organization_industries || [],
          person_locations: query.person_locations || [],
          page: query.page || 1,
          per_page: query.per_page || 5
        };
        break;
      case 'prospector':
        endpoint = 'https://api.apollo.io/v1/mixed_people/search';
        requestBody = {
          organization_domains: [query.domain],
          person_titles: [query.role || 'founder'],
          page: 1,
          per_page: 10
        };
        break;
      case 'discovery':
        endpoint = 'https://api.apollo.io/v1/mixed_companies/search';
        requestBody = {
          q_keywords: query.keywords,
          page: 1,
          per_page: 20
        };
        break;
      default:
        throw new Error('Invalid search type');
    }

    console.log(`Making Apollo API call to: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': apolloApiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apollo API error:', response.status, errorText);
      throw new Error(`Apollo API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Apollo API response received');

    // Format the data based on type
    let formattedData;
    switch (type) {
      case 'company':
        const org = data.organization || data;
        formattedData = {
          name: org.name,
          domain: org.website_url,
          description: org.short_description,
          industry: org.industry,
          employees: org.estimated_num_employees,
          funding: org.total_funding,
          location: `${org.city || ''}, ${org.country || ''}`.replace(/^, |, $/, ''),
          linkedin: org.linkedin_url,
          twitter: org.twitter_url,
          founded: org.founded_year,
          tags: org.keywords
        };
        break;
      case 'person':
        const person = data.person || data;
        formattedData = {
          name: person.name,
          email: person.email,
          title: person.title,
          company: person.organization?.name,
          industry: person.organization?.industry,
          location: `${person.city || ''}, ${person.country || ''}`.replace(/^, |, $/, ''),
          linkedin: person.linkedin_url,
          twitter: person.twitter_url,
          bio: person.headline
        };
        break;
      case 'people_search':
        formattedData = {
          people: data.people?.map((person: any) => ({
            id: person.id,
            name: person.name,
            first_name: person.first_name,
            last_name: person.last_name,
            email: person.email,
            title: person.title,
            seniority: person.seniority,
            company: person.organization?.name,
            company_domain: person.organization?.website_url,
            industry: person.organization?.industry,
            company_size: person.organization?.estimated_num_employees,
            location: `${person.city || ''}, ${person.state || ''}, ${person.country || ''}`.replace(/^, |, $|, ,/g, ''),
            linkedin: person.linkedin_url,
            twitter: person.twitter_url,
            phone: person.sanitized_phone,
            email_status: person.email_status,
            photo_url: person.photo_url,
            headline: person.headline
          })) || [],
          pagination: data.pagination || {},
          total_entries: data.pagination?.total_entries || 0
        };
        break;
      case 'prospector':
        formattedData = data.people?.map((person: any) => ({
          name: person.name,
          email: person.email,
          title: person.title,
          company: person.organization?.name,
          linkedin: person.linkedin_url,
          verified: person.email_status === 'verified'
        })) || [];
        break;
      case 'discovery':
        formattedData = data.organizations?.map((company: any) => ({
          name: company.name,
          domain: company.website_url,
          description: company.short_description,
          industry: company.industry,
          employees: company.estimated_num_employees,
          location: `${company.city || ''}, ${company.country || ''}`.replace(/^, |, $/, ''),
          founded: company.founded_year
        })) || [];
        break;
      default:
        formattedData = data;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: formattedData,
      type: type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in clearbit-research function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});