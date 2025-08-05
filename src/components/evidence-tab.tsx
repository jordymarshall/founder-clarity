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
import { Sparkles, RefreshCw, ExternalLink, Mail, Phone, MapPin, Building, User, Loader2, Target, Users, CheckCircle, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Following Validation Masterclass Module 2 methodology
interface InterviewCandidateProfile {
  customerSegment: string;        // Broad customer segment
  earlyAdopterSegment: string;    // Specific subset who feels pain most intensely  
  existingAlternative: string;    // What they're currently doing to solve the problem
  hypothesizedJTBD: string;       // Job to be Done they're trying to accomplish
  recencyFilter: string;          // How to find people who took action recently (90 days)
  rationale: string;              // Why focus on this segment first
}

interface ApolloSearchCriteria {
  person_titles: string[];
  person_seniorities: string[];
  organization_num_employees_ranges: string[];
  organization_industries: string[];
  person_locations: string[];
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
  existingAlternatives?: any;
}

export function EvidenceTab({ idea, customerSegment, coreProblem, jobToBeDone, existingAlternatives }: EvidenceTabProps) {
  // Step 1: Define Interview Target Profile (Module 2 methodology)
  const [candidateProfile, setCandidateProfile] = useState<InterviewCandidateProfile>({
    customerSegment: '',
    earlyAdopterSegment: '',
    existingAlternative: '',
    hypothesizedJTBD: '',
    recencyFilter: '',
    rationale: ''
  });
  const [profileDefined, setProfileDefined] = useState(false);

  // Step 2: Apollo Search Criteria Generation
  const [apolloCriteria, setApolloCriteria] = useState<ApolloSearchCriteria | null>(null);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);

  // Step 3: Candidate Search & CRM
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [savedCandidates, setSavedCandidates] = useState<InterviewCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [activeTab, setActiveTab] = useState('profile');

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

  // Generate Apollo criteria from interview candidate profile
  const generateApolloSearchCriteria = async () => {
    if (!profileDefined) return;

    setIsGeneratingCriteria(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-criteria', {
        body: {
          idea,
          candidateProfile,
          customerSegment,
          coreProblem,
          jobToBeDone,
          existingAlternatives
        }
      });

      if (error) throw error;

      setApolloCriteria(data.criteria);
      setActiveTab('search');
      toast.success('Apollo search criteria generated successfully');
    } catch (error) {
      console.error('Error generating criteria:', error);
      toast.error('Failed to generate criteria');
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

  // Search candidates using Apollo
  const searchCandidates = async (page = 1, loadMore = false) => {
    if (!apolloCriteria) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('apollo-research', {
        body: {
          type: 'people_search',
          query: {
            person_titles: apolloCriteria.person_titles,
            person_seniorities: apolloCriteria.person_seniorities,
            organization_num_employees_ranges: apolloCriteria.organization_num_employees_ranges,
            organization_industries: apolloCriteria.organization_industries,
            person_locations: apolloCriteria.person_locations,
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

  // Auto-populate interview profile from hypothesis canvas (following methodology)
  useEffect(() => {
    if (customerSegment && !candidateProfile.customerSegment) {
      const segments = customerSegment.content || [];
      const problems = coreProblem?.content || [];
      const jobs = jobToBeDone?.content || [];
      const alternatives = existingAlternatives?.content || [];

      setCandidateProfile({
        customerSegment: segments[0]?.text || '',
        earlyAdopterSegment: segments[1]?.text || segments[0]?.text || '',
        existingAlternative: alternatives[0]?.text || 'Manual processes',
        hypothesizedJTBD: jobs[0]?.text || '',
        recencyFilter: 'Recent activity on social media, job postings, or funding announcements within 90 days',
        rationale: 'Based on hypothesis canvas analysis - this segment shows highest engagement and pain intensity'
      });
    }
  }, [customerSegment, coreProblem, jobToBeDone, existingAlternatives, candidateProfile.customerSegment]);

  useEffect(() => {
    loadSavedCandidates();
  }, [idea]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Interview Profile
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2" disabled={!profileDefined}>
            <Sparkles className="h-4 w-4" />
            Find Candidates
          </TabsTrigger>
          <TabsTrigger value="crm" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Interview CRM ({savedCandidates.length})
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Interview Candidate Profile (Following Module 2) */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Module 2: Define Interview Candidate Profile
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Following validation masterclass methodology - identify people who match your customer segment and have recent, relevant experience.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    CUSTOMER SEGMENT: Broad group who has the problem
                  </label>
                  <Input
                    placeholder="e.g., Small, independent coffee shop owners"
                    value={candidateProfile.customerSegment}
                    onChange={(e) => setCandidateProfile(prev => ({ ...prev, customerSegment: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">The broad group of people or businesses you believe have the problem</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    EARLY ADOPTER SEGMENT: Who feels the pain most intensely?
                  </label>
                  <Input
                    placeholder="e.g., Coffee shop owners in business 1-3 years in competitive urban areas"
                    value={candidateProfile.earlyAdopterSegment}
                    onChange={(e) => setCandidateProfile(prev => ({ ...prev, earlyAdopterSegment: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Specific subset who feels the problem most acutely and is already trying to solve it</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    EXISTING ALTERNATIVE: What are they doing now to solve it?
                  </label>
                  <Input
                    placeholder="e.g., Manually posting on Instagram, hiring freelance social media managers"
                    value={candidateProfile.existingAlternative}
                    onChange={(e) => setCandidateProfile(prev => ({ ...prev, existingAlternative: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Evidence the problem is real - never "nothing" (could be competitor, spreadsheet, manual process)</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    HYPOTHESIZED JOB TO BE DONE: What progress are they trying to make?
                  </label>
                  <Input
                    placeholder="e.g., Attract new customers to grow the business"
                    value={candidateProfile.hypothesizedJTBD}
                    onChange={(e) => setCandidateProfile(prev => ({ ...prev, hypothesizedJTBD: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">The bigger context - underlying progress the customer is trying to make</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    RECENCY FILTER: How to find people with fresh stories (90 days)?
                  </label>
                  <Input
                    placeholder="e.g., Recent social media activity, job postings, funding announcements"
                    value={candidateProfile.recencyFilter}
                    onChange={(e) => setCandidateProfile(prev => ({ ...prev, recencyFilter: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Focus on people who took action recently - their memories will be fresh and detailed</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    RATIONALE: Why focus on this segment first?
                  </label>
                  <Textarea
                    placeholder="e.g., This segment shows highest engagement with validation content and rates customer discovery as biggest weakness..."
                    value={candidateProfile.rationale}
                    onChange={(e) => setCandidateProfile(prev => ({ ...prev, rationale: e.target.value }))}
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Evidence-based reasoning for why this is the right segment to interview first</p>
                </div>
              </div>

              <Button 
                onClick={() => {
                  if (candidateProfile.customerSegment && candidateProfile.earlyAdopterSegment && 
                      candidateProfile.existingAlternative && candidateProfile.hypothesizedJTBD) {
                    setProfileDefined(true);
                    generateApolloSearchCriteria();
                  } else {
                    toast.error('Please fill in all required fields');
                  }
                }}
                className="w-full"
                disabled={!candidateProfile.customerSegment || !candidateProfile.earlyAdopterSegment || 
                         !candidateProfile.existingAlternative || !candidateProfile.hypothesizedJTBD}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Profile & Generate Apollo Search Criteria
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Apollo Search Criteria */}
        <TabsContent value="search" className="space-y-6">
          {apolloCriteria && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Apollo Search Criteria (Generated from Interview Profile)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI translated your interview candidate profile into Apollo API search parameters
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Target Job Titles</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {apolloCriteria.person_titles.map((title, index) => (
                        <Badge key={index} variant="secondary">{title}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on Early Adopter Segment: "{candidateProfile.earlyAdopterSegment}"
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Company Size</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {apolloCriteria.organization_num_employees_ranges.map((range, index) => (
                        <Badge key={index} variant="outline">{range} employees</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Matching Customer Segment: "{candidateProfile.customerSegment}"
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Industries</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {apolloCriteria.organization_industries.map((industry, index) => (
                        <Badge key={index} variant="secondary">{industry}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supporting JTBD: "{candidateProfile.hypothesizedJTBD}"
                    </p>
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

          {/* Apollo Search Results */}
          {candidates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interview Candidates ({totalEntries} total found)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  These candidates match your interview profile criteria and recency filter
                </p>
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

        {/* Step 3: Interview CRM Pipeline */}
        <TabsContent value="crm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Interview Pipeline Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your interview candidates through the validation process
              </p>
            </CardHeader>
            <CardContent>
              {savedCandidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No interview candidates saved yet. Add candidates from your Apollo search results above.
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