import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Prospect {
  id: string;
  name: string;
  source: string;
  status: 'identified' | 'contacted' | 'scheduled' | 'completed';
}

interface InvestigationCanvasProps {
  idea: string;
  onBack?: () => void;
}

export function InvestigationCanvas({ idea, onBack }: InvestigationCanvasProps) {
  const { toast } = useToast();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  
  // Mock data from Module 1 - in real app this would come from props/context
  const customerSegment = "Coffee shop owners 1-3 years in business";
  const jtbd = "Attracting new customers to grow the business";

  const addProspect = () => {
    const newProspect: Prospect = {
      id: Date.now().toString(),
      name: '',
      source: '',
      status: 'identified'
    };
    setProspects(prev => [newProspect, ...prev]);
  };

  const updateProspect = (id: string, field: keyof Prospect, value: string) => {
    setProspects(prev => prev.map(prospect => 
      prospect.id === id ? { ...prospect, [field]: value } : prospect
    ));
  };

  const getStatusColor = (status: Prospect['status']) => {
    switch (status) {
      case 'identified': return 'bg-muted text-muted-foreground';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const generateOutreachTemplate = () => {
    return `Subject: Research into the world of ${customerSegment}

Hi [Prospect Name],

My name is [Your Name], and I'm currently researching the process that ${customerSegment}s use for ${jtbd}.

My goal is simply to learn from people with firsthand experience like you. This is not a sales pitch.

Would you be open to a 30-minute chat in the next week to share your perspective? As a thank you, I can offer a $50 gift card.

Best,
[Your Name]`;
  };

  const handleCopyTemplate = async () => {
    const template = generateOutreachTemplate();
    try {
      await navigator.clipboard.writeText(template);
      toast({
        title: "Template copied!",
        description: "The outreach template has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the template manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
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
            <div className="text-center space-y-2">
              <h1 className="text-page-title">The Search for Evidence</h1>
              <p className="text-foreground-secondary">Find real people to test your beliefs against</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center">1</div>
                  <span className="text-sm text-muted-foreground">Beliefs</span>
                </div>
                <div className="w-8 h-px bg-border"></div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</div>
                  <span className="text-sm font-medium">Evidence</span>
                </div>
                <div className="w-8 h-px bg-border"></div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center">3</div>
                  <span className="text-sm text-muted-foreground">Insights</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Left Column - Prospect List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-section-head">Prospects</h2>
                <Button onClick={addProspect} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Prospect
                </Button>
              </div>

              {/* Empty State or Prospect List */}
              {prospects.length === 0 ? (
                <div className="bg-card rounded-lg p-8 text-center border border-dashed border-border">
                  <p className="text-foreground-secondary mb-4">
                    Time to find your first interviewees. Start by adding people who match your{' '}
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Early Adopter Segment: {customerSegment}
                    </Badge>
                  </p>
                  <Button onClick={addProspect} variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Prospect
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b border-border pb-2">
                    <div className="col-span-4">Name</div>
                    <div className="col-span-4">Source</div>
                    <div className="col-span-4">Status</div>
                  </div>

                  {/* Prospect Rows */}
                  {prospects.map((prospect) => (
                    <div key={prospect.id} className="grid grid-cols-12 gap-4 py-3 border-b border-border/50">
                      <div className="col-span-4">
                        <Input
                          placeholder="Name"
                          value={prospect.name}
                          onChange={(e) => updateProspect(prospect.id, 'name', e.target.value)}
                          className="border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          placeholder="Source"
                          value={prospect.source}
                          onChange={(e) => updateProspect(prospect.id, 'source', e.target.value)}
                          className="border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                      <div className="col-span-4">
                        <Select
                          value={prospect.status}
                          onValueChange={(value: Prospect['status']) => updateProspect(prospect.id, 'status', value)}
                        >
                          <SelectTrigger className={`border-0 bg-transparent px-0 focus:ring-0 ${getStatusColor(prospect.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="identified">Identified</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Outreach Helper */}
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-section-head mb-4 flex items-center gap-2">
                  Outreach Template
                  <span className="text-primary">✨</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-background-subtle rounded-lg p-4 text-sm">
                    <div className="whitespace-pre-line">
                      Subject: Research into the world of{' '}
                      <Badge variant="secondary" className="bg-primary/10 text-primary mx-1">
                        {customerSegment}
                      </Badge>
                      <br />
                      <br />
                      Hi [Prospect Name],
                      <br />
                      <br />
                      My name is [Your Name], and I'm currently researching the process that{' '}
                      <Badge variant="secondary" className="bg-primary/10 text-primary mx-1">
                        {customerSegment}
                      </Badge>
                      s use for{' '}
                      <Badge variant="secondary" className="bg-primary/10 text-primary mx-1">
                        {jtbd}
                      </Badge>
                      .
                      <br />
                      <br />
                      My goal is simply to learn from people with firsthand experience like you. This is not a sales pitch.
                      <br />
                      <br />
                      Would you be open to a 30-minute chat in the next week to share your perspective? As a thank you, I can offer a $50 gift card.
                      <br />
                      <br />
                      Best,
                      <br />
                      [Your Name]
                    </div>
                  </div>

                  <Button onClick={handleCopyTemplate} className="w-full flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy Template
                  </Button>

                  <div className="pt-4 border-t border-border">
                    <p className="text-subtle text-sm">
                      <strong>Remember:</strong> You're a student asking to learn from an expert. The goal is to be curious, not to sell.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}