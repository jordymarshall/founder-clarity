import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const clearbitApiKey = Deno.env.get('CLEARBIT_API_KEY');

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
    let queryParam = '';

    switch (type) {
      case 'company':
        endpoint = 'https://company.clearbit.com/v2/companies/find';
        queryParam = `domain=${encodeURIComponent(query)}`;
        break;
      case 'person':
        endpoint = 'https://person.clearbit.com/v2/people/find';
        queryParam = `email=${encodeURIComponent(query)}`;
        break;
      case 'prospector':
        endpoint = 'https://prospector.clearbit.com/v1/people/search';
        queryParam = `domain=${encodeURIComponent(query.domain)}&role=${encodeURIComponent(query.role || 'founder')}`;
        break;
      case 'discovery':
        endpoint = 'https://discovery.clearbit.com/v1/companies/search';
        queryParam = `query=${encodeURIComponent(query.keywords)}&limit=20`;
        break;
      default:
        throw new Error('Invalid search type');
    }

    console.log(`Making Clearbit API call to: ${endpoint}?${queryParam}`);

    const response = await fetch(`${endpoint}?${queryParam}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${clearbitApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Clearbit API error:', response.status, errorText);
      throw new Error(`Clearbit API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Clearbit API response received');

    // Format the data based on type
    let formattedData;
    switch (type) {
      case 'company':
        formattedData = {
          name: data.name,
          domain: data.domain,
          description: data.description,
          industry: data.category?.industry,
          employees: data.metrics?.employees,
          funding: data.metrics?.raised,
          location: data.geo?.city + ', ' + data.geo?.country,
          linkedin: data.linkedin?.handle,
          twitter: data.twitter?.handle,
          founded: data.foundedYear,
          tags: data.tags
        };
        break;
      case 'person':
        formattedData = {
          name: data.name?.fullName,
          email: data.email,
          title: data.employment?.title,
          company: data.employment?.name,
          industry: data.employment?.domain,
          location: data.geo?.city + ', ' + data.geo?.country,
          linkedin: data.linkedin?.handle,
          twitter: data.twitter?.handle,
          bio: data.bio
        };
        break;
      case 'prospector':
        formattedData = data.results?.map((person: any) => ({
          name: person.name?.fullName,
          email: person.email,
          title: person.employment?.title,
          company: person.employment?.name,
          linkedin: person.linkedin?.handle,
          verified: person.verified
        })) || [];
        break;
      case 'discovery':
        formattedData = data.results?.map((company: any) => ({
          name: company.name,
          domain: company.domain,
          description: company.description,
          industry: company.category?.industry,
          employees: company.metrics?.employees,
          location: company.geo?.city + ', ' + company.geo?.country,
          founded: company.foundedYear
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