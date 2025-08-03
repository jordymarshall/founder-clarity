import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, X, ChevronLeft } from 'lucide-react';
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
  status: 'identified' | 'contacted' | 'scheduled' | 'completed';
  contactedDate?: Date;
  activities: Activity[];
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
      source: 'The Daily Grind',
      status: 'identified',
      activities: []
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
      ]
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
      ]
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

  const addProspect = () => {
    const newProspect: Prospect = {
      id: Date.now().toString(),
      name: '',
      source: '',
      status: 'identified',
      activities: []
    };
    setProspects(prev => [newProspect, ...prev]);
    setFocusedIndex(0);
    setEditingProspect(newProspect.id);
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
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="space-y-4 mb-8">
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Ideas
            </Button>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-page-title">Module 2: The Search for Evidence</h1>
              <p className="text-foreground-secondary">Find real people to test your beliefs with.</p>
            </div>
            <Button onClick={addProspect} className="flex items-center gap-2">
              + Add Prospect
            </Button>
          </div>
        </div>

        <div className="flex gap-0 relative">
          {/* Command Center - Prospect List */}
          <div className={`transition-all duration-300 ${selectedProspectId ? 'w-1/2 opacity-75' : 'w-full'}`}>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b border-border pb-3 mb-2">
              <div className="col-span-4">PROSPECT</div>
              <div className="col-span-3">STATUS</div>
              <div className="col-span-3">CONTACTED</div>
              <div className="col-span-2">SOURCE</div>
            </div>

            {/* Prospect Rows */}
            <div className="space-y-1">
              {prospects.map((prospect, index) => (
                <div
                  key={prospect.id}
                  className={`grid grid-cols-12 gap-4 py-3 px-2 rounded-lg cursor-pointer transition-colors ${
                    focusedIndex === index ? 'bg-muted' : 'hover:bg-muted/50'
                  } ${selectedProspectId === prospect.id ? 'bg-primary/10' : ''}`}
                  onClick={() => setSelectedProspectId(prospect.id)}
                >
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
                        className="border-0 bg-transparent px-0 focus-visible:ring-0"
                        placeholder="Prospect name"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="font-medium cursor-text"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProspect(prospect.id);
                        }}
                      >
                        {prospect.name || 'Untitled Prospect'}
                      </span>
                    )}
                  </div>
                  <div className={`col-span-3 text-sm font-medium ${getStatusColor(prospect.status)}`}>
                    {prospect.status.charAt(0).toUpperCase() + prospect.status.slice(1)}
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground">
                    {prospect.contactedDate ? formatDate(prospect.contactedDate) : '-'}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {prospect.source || '-'}
                  </div>
                </div>
              ))}
            </div>

            {prospects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Press <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘+N</kbd> to add your first prospect
                </p>
              </div>
            )}
          </div>

          {/* Focus View Panel */}
          {selectedProspect && (
            <div className="w-1/2 border-l border-border bg-card">
              <div className="h-full flex flex-col">
                {/* Panel Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedProspectId(null)}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-semibold">{selectedProspect.name}</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedProspectId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Outreach Composer */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Outreach Composer</h4>
                      <span className="text-primary">✨</span>
                    </div>
                    
                    <div className="bg-background-subtle rounded-lg p-4 text-sm whitespace-pre-line">
                      {generateOutreachTemplate(selectedProspect.name)}
                    </div>

                    <Button 
                      onClick={() => handleCopyAndMarkContacted(selectedProspect)}
                      className="w-full flex items-center gap-2"
                      disabled={selectedProspect.status !== 'identified'}
                    >
                      <Copy className="h-4 w-4" />
                      {selectedProspect.status === 'identified' ? 'Copy & Mark as Contacted' : 'Already Contacted'}
                    </Button>
                  </div>

                  {/* Activity Feed */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Activity</h4>
                    
                    {/* Add Note */}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a note or log an activity..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1 min-h-[80px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.metaKey) {
                            addNote(selectedProspect.id);
                          }
                        }}
                      />
                      <Button 
                        onClick={() => addNote(selectedProspect.id)}
                        disabled={!newNote.trim()}
                        className="self-end"
                      >
                        Add
                      </Button>
                    </div>

                    {/* Activity List */}
                    <div className="space-y-3">
                      {selectedProspect.activities.map((activity) => (
                        <div key={activity.id} className="flex gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-foreground">{activity.message}</p>
                            <p className="text-muted-foreground text-xs">
                              {formatDate(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {selectedProspect.activities.length === 0 && (
                        <p className="text-muted-foreground text-sm italic">No activity yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground">
                    <strong>Remember:</strong> You're a student asking to learn from an expert. The goal is to be curious, not to sell.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}