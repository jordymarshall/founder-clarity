import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Copy, X, ChevronLeft, Globe, Mail, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Activity {
  id: string;
  type: 'contacted' | 'note' | 'scheduled' | 'completed';
  message: string;
  timestamp: Date;
}

interface Prospect {
  id: string;
  name: string;
  source: string;
  status: 'enriching' | 'identified' | 'contacted' | 'scheduled' | 'completed';
  contactedDate?: Date;
  activities: Activity[];
  // AI-enriched data
  company?: string;
  jobTitle?: string;
  email?: string;
  fitScore?: 'strong' | 'moderate' | 'weak';
  aiSummary?: string;
  evidenceOfStruggle?: string;
  evidenceSource?: string;
}

interface InvestigationCanvasProps {
  idea: string;
  onBack?: () => void;
}

export function InvestigationCanvas({ idea, onBack }: InvestigationCanvasProps) {
  const { toast } = useToast();
  const [prospects, setProspects] = useState<Prospect[]>([
    {
      id: '1',
      name: 'Maria Rodriguez',
      source: 'linkedin.com/in/maria-rodriguez',
      status: 'identified',
      activities: [],
      company: 'The Daily Grind',
      jobTitle: 'Owner',
      email: 'maria@thedailygrind.com',
      fitScore: 'strong',
      aiSummary: 'Maria Rodriguez, owner of The Daily Grind, fits your Customer Segment: Small, independent coffee shop owners. Recent blog posts indicate a focus on community events, suggesting a potential struggle with attracting new, regular customers.',
      evidenceOfStruggle: "Company blog post from July 15, 2025, titled 'Our New Fall Events Lineup' shows investment in non-digital marketing efforts to solve the JTBD.",
      evidenceSource: 'Blog post: Our New Fall Events Lineup'
    },
    {
      id: '2',
      name: 'David Chen',
      source: 'LinkedIn',
      status: 'completed',
      contactedDate: new Date('2025-07-28'),
      activities: [
        {
          id: '1',
          type: 'contacted',
          message: 'You contacted David Chen',
          timestamp: new Date('2025-07-28')
        }
      ],
      company: 'Corner Coffee Co.',
      jobTitle: 'Founder',
      email: 'david@cornercoffee.com',
      fitScore: 'moderate',
      aiSummary: 'David Chen founded Corner Coffee Co. 2 years ago. Shows some alignment with customer segment but limited evidence of current struggle.',
      evidenceOfStruggle: 'Recent LinkedIn post about hiring challenges suggests focus on operations rather than customer acquisition.',
      evidenceSource: 'LinkedIn post: Hiring Update'
    },
    {
      id: '3',
      name: 'Sarah Jenkins',
      source: 'Referral',
      status: 'scheduled',
      contactedDate: new Date('2025-08-01'),
      activities: [
        {
          id: '1',
          type: 'contacted',
          message: 'You contacted Sarah Jenkins',
          timestamp: new Date('2025-08-01')
        }
      ],
      company: 'Roasted Dreams',
      jobTitle: 'Co-owner',
      email: 'sarah@roasteddreams.cafe',
      fitScore: 'strong',
      aiSummary: 'Sarah Jenkins co-owns Roasted Dreams, a 18-month-old coffee shop. Perfect fit for customer segment with clear evidence of JTBD struggle.',
      evidenceOfStruggle: 'Recent Yelp reviews mention slow business during weekdays. Owner actively seeking marketing solutions.',
      evidenceSource: 'Yelp business profile analysis'
    }
  ]);
  
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [newNote, setNewNote] = useState('');
  const [editingProspect, setEditingProspect] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mock data from Module 1
  const customerSegment = "Coffee shop owners 1-3 years in business";
  const jtbd = "Attracting new customers to grow the business";

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedProspectId) return; // Don't handle navigation when focus panel is open
      
      if ((e.key === 'n' || e.key === 'N') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        addProspect();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, prospects.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (prospects[focusedIndex]) {
          setSelectedProspectId(prospects[focusedIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prospects, focusedIndex, selectedProspectId]);

  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const addProspect = () => {
    setShowUrlInput(true);
  };

  const enrichProspectFromUrl = async (url: string) => {
    if (!url.trim()) return;
    
    const newProspect: Prospect = {
      id: Date.now().toString(),
      name: 'Enriching...',
      source: url,
      status: 'enriching',
      activities: []
    };
    
    setProspects(prev => [newProspect, ...prev]);
    setFocusedIndex(0);
    setUrlInput('');
    setShowUrlInput(false);
    
    // Simulate AI enrichment (replace with actual API calls)
    setTimeout(() => {
      const enrichedData = mockEnrichProspect(url);
      setProspects(prev => prev.map(p => 
        p.id === newProspect.id ? { ...p, ...enrichedData, status: 'identified' } : p
      ));
    }, 2000);
  };

  const mockEnrichProspect = (url: string): Partial<Prospect> => {
    // Mock AI-enriched data - replace with actual API integration
    if (url.includes('linkedin')) {
      return {
        name: 'Maria Rodriguez',
        company: 'The Daily Grind',
        jobTitle: 'Owner',
        email: 'maria@thedailygrind.com',
        fitScore: 'strong',
        aiSummary: 'Maria Rodriguez, owner of The Daily Grind, fits your Customer Segment: Small, independent coffee shop owners. Recent blog posts indicate a focus on community events, suggesting a potential struggle with attracting new, regular customers.',
        evidenceOfStruggle: "Company blog post from July 15, 2025, titled 'Our New Fall Events Lineup' shows investment in non-digital marketing efforts to solve the JTBD.",
        evidenceSource: 'Blog post: Our New Fall Events Lineup'
      };
    }
    
    return {
      name: 'Extracted Contact',
      company: 'Company Name',
      jobTitle: 'Position',
      fitScore: 'moderate',
      aiSummary: 'AI-generated prospect summary based on URL analysis.',
      evidenceOfStruggle: 'Evidence of struggle based on content analysis.',
      evidenceSource: 'Website content analysis'
    };
  };

  const updateProspect = (id: string, field: keyof Prospect, value: any) => {
    setProspects(prev => prev.map(prospect => 
      prospect.id === id ? { ...prospect, [field]: value } : prospect
    ));
  };

  const addActivity = (prospectId: string, activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString()
    };
    
    setProspects(prev => prev.map(prospect => 
      prospect.id === prospectId 
        ? { ...prospect, activities: [newActivity, ...prospect.activities] }
        : prospect
    ));
  };

  const handleCopyAndMarkContacted = async (prospect: Prospect) => {
    const template = generateOutreachTemplate(prospect.name);
    
    try {
      await navigator.clipboard.writeText(template);
      
      // Update status and add activity
      const now = new Date();
      setProspects(prev => prev.map(p => 
        p.id === prospect.id 
          ? { 
              ...p, 
              status: 'contacted' as const,
              contactedDate: now
            }
          : p
      ));
      
      addActivity(prospect.id, {
        type: 'contacted',
        message: `You contacted ${prospect.name}`,
        timestamp: now
      });
      
      toast({
        title: "Success!",
        description: `Message copied and ${prospect.name} marked as contacted.`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the template manually.",
        variant: "destructive",
      });
    }
  };

  const addNote = (prospectId: string) => {
    if (!newNote.trim()) return;
    
    addActivity(prospectId, {
      type: 'note',
      message: newNote,
      timestamp: new Date()
    });
    
    setNewNote('');
  };

  const generateOutreachTemplate = (prospectName: string) => {
    return `Subject: Research into the world of ${customerSegment}

Hi ${prospectName},

My name is [Your Name], and I'm currently researching the process that ${customerSegment}s use for ${jtbd}.

My goal is simply to learn from people with firsthand experience like you. This is not a sales pitch.

Would you be open to a 30-minute chat in the next week to share your perspective? As a thank you, I can offer a $50 gift card.

Best,
[Your Name]`;
  };

  const generatePersonalizedOutreach = (prospect: Prospect) => {
    if (prospect.evidenceSource) {
      return `Subject: Research into the world of ${customerSegment}

Hi ${prospect.name},

I saw your recent ${prospect.evidenceSource.toLowerCase()} - ${prospect.evidenceOfStruggle?.split('.')[0]}. It's great to see how you're thinking about ${jtbd.toLowerCase()}.

My name is [Your Name], and I'm currently researching how ${customerSegment}s approach ${jtbd}. Your experience with ${prospect.company || 'your business'} would provide valuable insights.

My goal is simply to learn from people with firsthand experience like you. This is not a sales pitch.

Would you be open to a 30-minute chat in the next week to share your perspective? As a thank you, I can offer a $50 gift card.

Best,
[Your Name]`;
    }
    
    return generateOutreachTemplate(prospect.name);
  };

  const getStatusColor = (status: Prospect['status']) => {
    switch (status) {
      case 'identified': return 'text-muted-foreground';
      case 'contacted': return 'text-blue-600';
      case 'scheduled': return 'text-purple-600';
      case 'completed': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const selectedProspect = prospects.find(p => p.id === selectedProspectId);

  return (
    <div className="min-h-screen bg-background" ref={containerRef}>
      <div className="container mx-auto py-8 px-6">
        {/* Header */}
        <div className="space-y-6 mb-12">
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2 text-foreground-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Ideas
            </Button>
          )}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-page-title">Module 2: The Search for Evidence</h1>
              <p className="text-foreground-secondary text-body">Find real people to test your beliefs with.</p>
            </div>
            <Button onClick={addProspect} className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              + Add Prospect
            </Button>
          </div>
        </div>

        <div className="relative">
          {/* Command Center - Prospect List */}
          <div className={`transition-all duration-200 ${selectedProspectId ? 'opacity-50' : ''}`}>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-6 text-subtle font-medium text-foreground-secondary border-b border-border pb-4 mb-4">
              <div className="col-span-1">FIT</div>
              <div className="col-span-4">PROSPECT</div>
              <div className="col-span-2">STATUS</div>
              <div className="col-span-3">CONTACTED</div>
              <div className="col-span-2">SOURCE</div>
            </div>

            {/* Prospect Rows */}
            <div className="space-y-2">
              {prospects.map((prospect, index) => (
                <div
                  key={prospect.id}
                  className={`grid grid-cols-12 gap-6 py-4 px-4 rounded border transition-all duration-200 cursor-pointer ${
                    focusedIndex === index ? 'bg-card border-border' : 'border-transparent hover:bg-card/50 hover:border-border'
                  } ${selectedProspectId === prospect.id ? 'bg-primary/10 border-primary/20' : ''}`}
                  onClick={() => setSelectedProspectId(prospect.id)}
                >
                  <div className="col-span-1 flex items-center">
                    {prospect.fitScore && prospect.status !== 'enriching' ? (
                      <div className={`w-2 h-2 rounded-full ${
                        prospect.fitScore === 'strong' ? 'bg-green-500' :
                        prospect.fitScore === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    ) : prospect.status === 'enriching' ? (
                      <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
                    ) : null}
                  </div>
                  <div className="col-span-4">
                    {editingProspect === prospect.id ? (
                      <Input
                        value={prospect.name}
                        onChange={(e) => updateProspect(prospect.id, 'name', e.target.value)}
                        onBlur={() => setEditingProspect(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'Tab') {
                            setEditingProspect(null);
                          }
                        }}
                        className="border-0 bg-transparent px-0 focus-visible:ring-0 text-body"
                        placeholder="Prospect name"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className={`font-medium cursor-text text-body ${prospect.status === 'enriching' ? 'animate-pulse' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProspect(prospect.id);
                        }}
                      >
                        {prospect.name || 'Untitled Prospect'}
                      </span>
                    )}
                  </div>
                  <div className={`col-span-2 text-subtle font-medium ${getStatusColor(prospect.status)}`}>
                    {prospect.status.charAt(0).toUpperCase() + prospect.status.slice(1)}
                  </div>
                  <div className="col-span-3 text-subtle text-foreground-secondary">
                    {prospect.contactedDate ? formatDate(prospect.contactedDate) : '-'}
                  </div>
                  <div className="col-span-2 text-subtle text-foreground-secondary">
                    {prospect.source || '-'}
                  </div>
                </div>
              ))}
            </div>

            {prospects.length === 0 && (
              <div className="text-center py-16">
                <p className="text-foreground-secondary mb-4 text-body">
                  Press <kbd className="px-2 py-1 bg-card rounded text-subtle border border-border">⌘+N</kbd> to add your first prospect
                </p>
              </div>
            )}
          </div>

          {/* Centered Modal for Focus View */}
          {selectedProspect && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setSelectedProspectId(null)}
              />
              
              {/* Centered Modal */}
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                <div className="bg-card border border-border rounded shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedProspectId(null)}
                        className="flex items-center gap-2 text-foreground-secondary hover:text-foreground"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <h3 className="text-section-head">{selectedProspect.name}</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedProspectId(null)}
                      className="text-foreground-secondary hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <Tabs defaultValue="profile" className="h-full">
                      <TabsList className="grid w-full grid-cols-3 mx-6 mt-6 bg-background-subtle border border-border">
                        <TabsTrigger value="profile" className="text-button">Profile & Fit</TabsTrigger>
                        <TabsTrigger value="outreach" className="text-button">Outreach</TabsTrigger>
                        <TabsTrigger value="interview" className="text-button">Interview</TabsTrigger>
                      </TabsList>

                      <TabsContent value="profile" className="p-6 space-y-8">
                        {/* AI-Generated Summary */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-body">AI-Generated Summary</h4>
                            <Sparkles className="h-4 w-4 text-primary" />
                          </div>
                          
                          <div className="bg-background-subtle rounded border border-border p-6">
                            <p className="text-body text-foreground leading-relaxed">
                              {selectedProspect.aiSummary || 'AI analysis will appear here once prospect is enriched.'}
                            </p>
                          </div>
                        </div>

                        {/* AI-Generated Fit Score */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-body">AI-Generated Fit Score</h4>
                          
                          {selectedProspect.fitScore && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  selectedProspect.fitScore === 'strong' ? 'bg-green-500' :
                                  selectedProspect.fitScore === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                                }`} />
                                <span className="font-medium text-body">
                                  {selectedProspect.fitScore === 'strong' ? 'Strong Fit' :
                                   selectedProspect.fitScore === 'moderate' ? 'Moderate Fit' : 'Weak Fit'}
                                </span>
                                <span className="text-foreground-secondary text-body">
                                  - Matches your target segment and shows recent struggle.
                                </span>
                              </div>
                              
                              {selectedProspect.evidenceOfStruggle && (
                                <div className="bg-background-subtle rounded border border-border p-4">
                                  <p className="text-subtle font-medium text-foreground-secondary uppercase tracking-wide mb-3">
                                    Evidence of Struggle
                                  </p>
                                  <p className="text-body text-foreground">
                                    {selectedProspect.evidenceOfStruggle}
                                  </p>
                                  {selectedProspect.evidenceSource && (
                                    <p className="text-subtle text-primary mt-2 cursor-pointer hover:underline">
                                      Source: {selectedProspect.evidenceSource}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Contact Information */}
                        {(selectedProspect.email || selectedProspect.company || selectedProspect.jobTitle) && (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-body">AI-Discovered Contact Info</h4>
                            
                            <div className="space-y-3">
                              {selectedProspect.email && (
                                <div className="flex items-center gap-3 text-body">
                                  <Mail className="h-4 w-4 text-foreground-secondary" />
                                  <span className="text-foreground">{selectedProspect.email}</span>
                                </div>
                              )}
                              {selectedProspect.company && (
                                <div className="flex items-center gap-3 text-body">
                                  <Globe className="h-4 w-4 text-foreground-secondary" />
                                  <span className="text-foreground">{selectedProspect.jobTitle} at {selectedProspect.company}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="outreach" className="p-6 space-y-8">
                        {/* Personalized Outreach Composer */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-body">Hyper-Personalized Outreach</h4>
                            <Sparkles className="h-4 w-4 text-primary" />
                          </div>
                          
                          <div className="bg-background-subtle rounded border border-border p-6 text-body font-mono whitespace-pre-line">
                            {generatePersonalizedOutreach(selectedProspect)}
                          </div>

                          <Button 
                            onClick={() => handleCopyAndMarkContacted(selectedProspect)}
                            className="w-full flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={selectedProspect.status !== 'identified'}
                          >
                            <Copy className="h-4 w-4" />
                            {selectedProspect.status === 'identified' ? 'Copy & Mark as Contacted' : 'Already Contacted'}
                          </Button>
                        </div>

                        {/* AI Writing Tools */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-body">AI Writing Tools</h4>
                          
                          <div className="flex gap-3">
                            <Button variant="outline" size="sm" className="flex items-center gap-2 text-button border-border">
                              <Sparkles className="h-3 w-3" />
                              Rewrite Casual
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-2 text-button border-border">
                              <Sparkles className="h-3 w-3" />
                              Rewrite Formal
                            </Button>
                          </div>
                          
                          <Button variant="outline" size="sm" className="w-full flex items-center gap-2 text-button border-border">
                            <Sparkles className="h-3 w-3" />
                            Suggest Talking Points
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="interview" className="p-6 space-y-8">
                        {/* Activity Feed */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-body">Interview Notes & Activity</h4>
                          
                          {/* Add Note */}
                          <div className="flex gap-3">
                            <Textarea
                              placeholder="Add interview notes, call summary, or log an activity..."
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              className="flex-1 min-h-[120px] text-body bg-background-subtle border-border"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.metaKey) {
                                  addNote(selectedProspect.id);
                                }
                              }}
                            />
                            <Button 
                              onClick={() => addNote(selectedProspect.id)}
                              disabled={!newNote.trim()}
                              className="self-end bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              Add
                            </Button>
                          </div>

                          {/* Activity List */}
                          <div className="space-y-4">
                            {selectedProspect.activities.map((activity) => (
                              <div key={activity.id} className="flex gap-4 text-body">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                  <p className="text-foreground">{activity.message}</p>
                                  <p className="text-foreground-secondary text-subtle">
                                    {formatDate(activity.timestamp)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            
                            {selectedProspect.activities.length === 0 && (
                              <p className="text-foreground-secondary text-body italic">No activity yet. Interview evidence will appear here.</p>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-border bg-background-subtle">
                    <p className="text-subtle text-foreground-secondary">
                      <strong>Remember:</strong> You're a student asking to learn from an expert. The goal is to be curious, not to sell.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* URL Input Overlay */}
          {showUrlInput && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-card border border-border rounded shadow-2xl p-8 w-96 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-section-head">Add Prospect</h3>
                  <p className="text-foreground-secondary text-body">
                    Enter a LinkedIn profile, company website, or news article URL...
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://linkedin.com/in/prospect..."
                    className="text-body bg-background-subtle border-border"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        enrichProspectFromUrl(urlInput);
                      } else if (e.key === 'Escape') {
                        setShowUrlInput(false);
                        setUrlInput('');
                      }
                    }}
                  />
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => enrichProspectFromUrl(urlInput)}
                      disabled={!urlInput.trim()}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enrich with AI
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowUrlInput(false);
                        setUrlInput('');
                      }}
                      className="border-border text-foreground-secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}