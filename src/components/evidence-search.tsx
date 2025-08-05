import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Sparkles, RefreshCw, ExternalLink, Mail, Phone, MapPin, Building, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  exclude_current_companies: string[];
  exclusion_rationale: string;
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

interface EvidenceSearchProps {
  idea: string;
  customerSegment?: any;
  coreProblem?: any;
  jobToBeDone?: any;
}

export function EvidenceSearch({ idea, customerSegment, coreProblem, jobToBeDone }: EvidenceSearchProps) {
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const generateCriteria = async () => {
    setIsGeneratingCriteria(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-criteria', {
        body: {
          idea,
          customerSegment,
          coreProblem,
          jobToBeDone
        }
      });

      if (error) throw error;

      setCriteria(data.criteria);
      toast.success('Interview criteria generated successfully');
    } catch (error) {
      console.error('Error generating criteria:', error);
      toast.error('Failed to generate criteria');
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

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
        setHasSearched(true);
      }
      
      setCurrentPage(page);
      setTotalEntries(data.data.total_entries);
      toast.success(`Found ${data.data.people.length} candidates`);
    } catch (error) {
      console.error('Error searching candidates:', error);
      toast.error('Failed to search candidates');
    } finally {
      setIsSearching(false);
    }
  };

  const loadMoreCandidates = () => {
    searchCandidates(currentPage + 1, true);
  };

  // Auto-generate criteria when component mounts if we have hypothesis data
  useEffect(() => {
    if (idea && customerSegment && !criteria) {
      generateCriteria();
    }
  }, [idea, customerSegment, criteria]);

  return (
    <div className="space-y-6">
      {/* AI Criteria Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Interview Criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!criteria ? (
            <div className="text-center py-8">
              <Button 
                onClick={generateCriteria}
                disabled={isGeneratingCriteria}
                size="lg"
                className="gap-2"
              >
                {isGeneratingCriteria ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isGeneratingCriteria ? 'Analyzing Hypothesis...' : 'Generate Interview Criteria'}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                AI will analyze your hypothesis canvas to define optimal interview targets
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Job Titles */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Target Job Titles
                </h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {criteria.person_titles.map((title, index) => (
                    <Badge key={index} variant="secondary">{title}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{criteria.person_titles_rationale}</p>
              </div>

              <Separator />

              {/* Seniority Levels */}
              <div>
                <h4 className="font-medium mb-2">Seniority Levels</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {criteria.person_seniorities.map((seniority, index) => (
                    <Badge key={index} variant="outline">{seniority.replace('_', ' ')}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{criteria.person_seniorities_rationale}</p>
              </div>

              <Separator />

              {/* Company Size */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Company Size
                </h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {criteria.organization_num_employees_ranges.map((range, index) => (
                    <Badge key={index} variant="outline">{range} employees</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{criteria.company_size_rationale}</p>
              </div>

              <Separator />

              {/* Industries */}
              <div>
                <h4 className="font-medium mb-2">Target Industries</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {criteria.organization_industries.map((industry, index) => (
                    <Badge key={index} variant="secondary">{industry}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{criteria.industry_rationale}</p>
              </div>

              <Separator />

              {/* Locations */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Geographic Focus
                </h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {criteria.person_locations.map((location, index) => (
                    <Badge key={index} variant="outline">{location}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{criteria.location_rationale}</p>
              </div>

              <div className="pt-4">
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Interview Candidates ({totalEntries} total found)</span>
              <Button 
                onClick={generateCriteria}
                variant="outline"
                size="sm"
                disabled={isGeneratingCriteria}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate Criteria
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No candidates found. Try adjusting your criteria.
              </div>
            ) : (
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
                            {candidate.email && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={`mailto:${candidate.email}`}>
                                  <Mail className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
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
                          {candidate.location && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="text-xs">{candidate.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {candidate.email && (
                          <div className="flex items-center gap-2 text-xs">
                            <Mail className="h-3 w-3" />
                            <span>{candidate.email}</span>
                            {candidate.email_status && (
                              <Badge 
                                variant={candidate.email_status === 'verified' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {candidate.email_status}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {candidate.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{candidate.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                
                {candidates.length < totalEntries && (
                  <div className="text-center pt-4">
                    <Button 
                      onClick={loadMoreCandidates}
                      disabled={isSearching}
                      variant="outline"
                      className="gap-2"
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Load More Candidates ({totalEntries - candidates.length} remaining)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}