import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, RefreshCw, ExternalLink, Mail, Phone, MapPin, Building, User, Loader2, Target, Users, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SegmentFocus {
  who: string;
  situation: string;
  struggle: string;
  outcome: string;
  rationale: string;
}

interface SearchCriteria {
  person_titles: string[];
  person_titles_rationale: string;
  person_seniorities: string[];
  person_seniorities_rationale: string;
  organization_num_employees_ranges: string[];
  company_size_rationale: string;
  organization_industries: string[];
  industry_rationale: string;
  person_locations: string[];
  location_rationale: string;
}

interface Candidate {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  seniority: string;
  company: string;
  company_domain: string;
  industry: string;
  company_size: number;
  location: string;
  linkedin: string;
  twitter: string;
  phone: string;
  email_status: string;
  photo_url: string;
  headline: string;
}

interface InterviewCandidate extends Candidate {
  status: 'prospect' | 'contacted' | 'responded' | 'scheduled' | 'interviewed' | 'converted' | 'rejected';
  notes?: string;
  contact_attempts: number;
  last_contact_date?: string;
  interview_date?: string;
}

interface EvidenceTabProps {
  idea: string;
  customerSegment?: any;
  coreProblem?: any;
  jobToBeDone?: any;
}

export function EvidenceTab({ idea, customerSegment, coreProblem, jobToBeDone }: EvidenceTabProps) {
  // Step 1: Segment Definition
  const [segmentFocus, setSegmentFocus] = useState<SegmentFocus>({
    who: '',
    situation: '',
    struggle: '',
    outcome: '',
    rationale: ''
  });
  const [segmentDefined, setSegmentDefined] = useState(false);

  // Step 2: Interview Criteria
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);

  // Step 3: Candidate Search & CRM
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [savedCandidates, setSavedCandidates] = useState<InterviewCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [activeTab, setActiveTab] = useState('segment');

  // Load saved candidates from database
  const loadSavedCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('interview_candidates')
        .select('*')
        .eq('idea', idea)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to component interface
      const mappedData = (data || []).map(item => ({
        ...item,
        linkedin: item.linkedin_url || '',
        twitter: item.twitter_url || '',
        photo_url: item.photo_url || ''
      }));
      
      setSavedCandidates(mappedData as InterviewCandidate[]);
    } catch (error) {
      console.error('Error loading saved candidates:', error);
    }
  };

  // Save candidate to CRM
  const saveCandidateToDatabase = async (candidate: Candidate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to save candidates');
        return;
      }

      const { error } = await supabase
        .from('interview_candidates')
        .insert({
          user_id: user.id,
          idea,
          apollo_id: candidate.id,
          name: candidate.name,
          first_name: candidate.first_name,
          last_name: candidate.last_name,
          email: candidate.email,
          title: candidate.title,
          seniority: candidate.seniority,
          company: candidate.company,
          company_domain: candidate.company_domain,
          industry: candidate.industry,
          company_size: candidate.company_size,
          location: candidate.location,
          linkedin_url: candidate.linkedin,
          twitter_url: candidate.twitter,
          phone: candidate.phone,
          email_status: candidate.email_status,
          photo_url: candidate.photo_url,
          headline: candidate.headline,
          status: 'prospect'
        });

      if (error) throw error;
      
      toast.success('Candidate saved to CRM');
      loadSavedCandidates();
    } catch (error) {
      console.error('Error saving candidate:', error);
      toast.error('Failed to save candidate');
    }
  };

  // Update candidate status
  const updateCandidateStatus = async (id: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('interview_candidates')
        .update({ 
          status, 
          notes,
          contact_attempts: status === 'contacted' ? candidates.length + 1 : undefined,
          last_contact_date: status === 'contacted' ? new Date().toISOString() : undefined
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Candidate status updated');
      loadSavedCandidates();
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error('Failed to update candidate');
    }
  };

  // Generate criteria from segment focus
  const generateCriteria = async () => {
    if (!segmentDefined) return;

    setIsGeneratingCriteria(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-criteria', {
        body: {
          idea,
          segmentFocus,
          customerSegment,
          coreProblem,
          jobToBeDone
        }
      });

      if (error) throw error;

      setCriteria(data.criteria);
      setActiveTab('search');
      toast.success('Interview criteria generated successfully');
    } catch (error) {
      console.error('Error generating criteria:', error);
      toast.error('Failed to generate criteria');
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

  // Search candidates
  const searchCandidates = async (page = 1, loadMore = false) => {
    if (!criteria) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('apollo-research', {
        body: {
          type: 'people_search',
          query: {
            person_titles: criteria.person_titles,
            person_seniorities: criteria.person_seniorities,
            organization_num_employees_ranges: criteria.organization_num_employees_ranges,
            organization_industries: criteria.organization_industries,
            person_locations: criteria.person_locations,
            page,
            per_page: 5
          }
        }
      });

      if (error) throw error;

      if (loadMore) {
        setCandidates(prev => [...prev, ...data.data.people]);
      } else {
        setCandidates(data.data.people);
      }
      
      setCurrentPage(page);
      setTotalEntries(data.data.total_entries);
      toast.success(`Found ${data.data.people.length} candidates`);
    } catch (error) {
      console.error('Error searching candidates:', error);
      toast.error('Failed to search candidates - check Apollo API key');
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-populate segment from hypothesis canvas
  useEffect(() => {
    if (customerSegment && !segmentFocus.who) {
      const segments = customerSegment.content || [];
      const problems = coreProblem?.content || [];
      const jobs = jobToBeDone?.content || [];

      setSegmentFocus({
        who: segments[0]?.text || '',
        situation: segments[1]?.text || '',
        struggle: problems[0]?.text || '',
        outcome: jobs[0]?.text || '',
        rationale: 'Based on hypothesis canvas analysis'
      });
    }
  }, [customerSegment, coreProblem, jobToBeDone, segmentFocus.who]);

  useEffect(() => {
    loadSavedCandidates();
  }, [idea]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="segment" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Define Segment
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2" disabled={!segmentDefined}>
            <Sparkles className="h-4 w-4" />
            Find Candidates
          </TabsTrigger>
          <TabsTrigger value="crm" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Interview CRM ({savedCandidates.length})
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Segment Definition */}
        <TabsContent value="segment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Define Your Interview Target Segment
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Following validation masterclass methodology, clearly define who you want to interview and why.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    WHO: Describe your specific target person
                  </label>
                  <Input
                    placeholder="e.g., Early-stage B2B SaaS founders with 2-10 employees"
                    value={segmentFocus.who}
                    onChange={(e) => setSegmentFocus(prev => ({ ...prev, who: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    SITUATION: What situation are they in?
                  </label>
                  <Input
                    placeholder="e.g., Building their first product, struggling with customer discovery"
                    value={segmentFocus.situation}
                    onChange={(e) => setSegmentFocus(prev => ({ ...prev, situation: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    STRUGGLE: What specific problem do they face?
                  </label>
                  <Input
                    placeholder="e.g., Wasting time building features customers don't want"
                    value={segmentFocus.struggle}
                    onChange={(e) => setSegmentFocus(prev => ({ ...prev, struggle: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    OUTCOME: What do they want to achieve?
                  </label>
                  <Input
                    placeholder="e.g., Validate product-market fit before burning runway"
                    value={segmentFocus.outcome}
                    onChange={(e) => setSegmentFocus(prev => ({ ...prev, outcome: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    RATIONALE: Why focus on this segment first?
                  </label>
                  <Textarea
                    placeholder="e.g., This segment has the highest urgency and decision-making authority..."
                    value={segmentFocus.rationale}
                    onChange={(e) => setSegmentFocus(prev => ({ ...prev, rationale: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <Button 
                onClick={() => {
                  if (segmentFocus.who && segmentFocus.situation && segmentFocus.struggle && segmentFocus.outcome) {
                    setSegmentDefined(true);
                    generateCriteria();
                  } else {
                    toast.error('Please fill in all fields');
                  }
                }}
                className="w-full"
                disabled={!segmentFocus.who || !segmentFocus.situation || !segmentFocus.struggle || !segmentFocus.outcome}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Segment & Generate Search Criteria
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Search Candidates */}
        <TabsContent value="search" className="space-y-6">
          {criteria && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Generated Search Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Target Job Titles</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {criteria.person_titles.map((title, index) => (
                        <Badge key={index} variant="secondary">{title}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Company Size</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {criteria.organization_num_employees_ranges.map((range, index) => (
                        <Badge key={index} variant="outline">{range} employees</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Industries</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {criteria.organization_industries.map((industry, index) => (
                        <Badge key={index} variant="secondary">{industry}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => searchCandidates(1)}
                  disabled={isSearching}
                  className="w-full gap-2"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isSearching ? 'Searching Apollo...' : 'Find Interview Candidates'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {candidates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interview Candidates ({totalEntries} total found)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidates.map((candidate, index) => (
                    <Card key={candidate.id || index} className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={candidate.photo_url} alt={candidate.name} />
                          <AvatarFallback>
                            {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{candidate.name}</h3>
                              <p className="text-sm text-muted-foreground">{candidate.title}</p>
                              {candidate.headline && (
                                <p className="text-xs text-muted-foreground mt-1">{candidate.headline}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => saveCandidateToDatabase(candidate)}
                                size="sm"
                                variant="default"
                              >
                                Add to CRM
                              </Button>
                              {candidate.linkedin && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              <span>{candidate.company}</span>
                              {candidate.company_size && (
                                <Badge variant="outline" className="text-xs">
                                  {candidate.company_size} employees
                                </Badge>
                              )}
                            </div>
                            {candidate.industry && (
                              <Badge variant="secondary" className="text-xs">
                                {candidate.industry}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {candidates.length < totalEntries && (
                    <div className="text-center pt-4">
                      <Button 
                        onClick={() => searchCandidates(currentPage + 1, true)}
                        disabled={isSearching}
                        variant="outline"
                      >
                        Load More ({totalEntries - candidates.length} remaining)
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Step 3: Interview CRM */}
        <TabsContent value="crm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Interview Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedCandidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No candidates saved yet. Add candidates from the search results.
                </div>
              ) : (
                <div className="space-y-4">
                  {savedCandidates.map((candidate) => (
                    <Card key={candidate.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={candidate.photo_url || ''} alt={candidate.name} />
                          <AvatarFallback>
                            {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{candidate.name}</h3>
                              <p className="text-sm text-muted-foreground">{candidate.title} at {candidate.company}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select 
                                value={candidate.status} 
                                onValueChange={(value) => updateCandidateStatus(candidate.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="prospect">Prospect</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="responded">Responded</SelectItem>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="interviewed">Interviewed</SelectItem>
                                  <SelectItem value="converted">Converted</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                              {candidate.email && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={`mailto:${candidate.email}`}>
                                    <Mail className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {candidate.email && <span>{candidate.email}</span>}
                            {candidate.location && <span>{candidate.location}</span>}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}