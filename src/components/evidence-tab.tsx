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
  customerSegment: string;        // Broad customer segment - focus on 90-day recency
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
        existingAlternative: alternatives[0]?.text || 'Manual processes',
        hypothesizedJTBD: jobs[0]?.text || '',
        recencyFilter: 'People who used alternatives within the last 90 days for accurate recall',
        rationale: 'Focus on broad customer segment with recent alternative usage for factual insights'
      });
      setProfileDefined(true);
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
                <Target className="h-5 w-5 text-primary" />
                Ideal Customer Profile
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-generated checklist of what to search for to find the right interview candidates
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileDefined && candidateProfile.customerSegment ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Look for people who match this profile:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span><strong>Customer Type:</strong> {candidateProfile.customerSegment}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span><strong>Current Solution:</strong> Using {candidateProfile.existingAlternative}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span><strong>Recent Activity (90 days):</strong> {candidateProfile.recencyFilter}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span><strong>Why This Segment:</strong> {candidateProfile.rationale}</span>
                    </li>
                  </ul>
                  
                  <Button 
                    onClick={generateApolloSearchCriteria}
                    className="w-full mt-4"
                    disabled={isGeneratingCriteria}
                  >
                    {isGeneratingCriteria ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate Search
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Complete your Hypothesis Canvas first to generate the Ideal Customer Profile</p>
                </div>
              )}
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
                      Based on Customer Segment: "{candidateProfile.customerSegment}"
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