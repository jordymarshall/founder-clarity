import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InterviewScriptScreen } from '@/components/interview-script-screen';
import { InvestigationCanvas } from '@/components/investigation-canvas';
import { ArrowLeft } from 'lucide-react';

interface IdeaWorkflowLayoutProps {
  idea: string;
  onBack?: () => void;
}

export function IdeaWorkflowLayout({ idea, onBack }: IdeaWorkflowLayoutProps) {
  const [showInterviewScript, setShowInterviewScript] = useState(false);

  if (showInterviewScript) {
    return (
      <InterviewScriptScreen 
        idea={idea}
        onBack={() => setShowInterviewScript(false)}
      />
    );
  }
  return (
    <div className="min-h-screen bg-background">
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
          <div>
            <h1 className="text-2xl font-semibold">Idea Investigation</h1>
            <p className="text-sm text-muted-foreground italic">"{idea}"</p>
          </div>
        </div>

        {/* Workflow Tabs */}
        <Tabs defaultValue="module1" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="module1" className="text-xs">
              1. Deconstruct
            </TabsTrigger>
            <TabsTrigger value="module2" className="text-xs">
              2. Evidence
            </TabsTrigger>
            <TabsTrigger value="module3" className="text-xs">
              3. Discovery
            </TabsTrigger>
            <TabsTrigger value="module4" className="text-xs">
              4. Synthesis
            </TabsTrigger>
            <TabsTrigger value="module5" className="text-xs">
              5. Design
            </TabsTrigger>
          </TabsList>

          {/* Module 1: Deconstructing Ideas */}
          <TabsContent value="module1" className="space-y-8">
            <div className="max-w-6xl mx-auto space-y-8 px-6">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-semibold">Module 1: Deconstructing Your Idea</h2>
                <p className="text-muted-foreground text-lg">Translate your idea into testable beliefs</p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Customer Segments</h3>
                  <div className="p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">Broad Customer Segment:</p>
                    <div className="min-h-[80px] bg-muted rounded p-4 text-sm">
                      [Who is your target market?]
                    </div>
                  </div>
                  <div className="p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">Early Adopter Segment:</p>
                    <div className="min-h-[80px] bg-muted rounded p-4 text-sm">
                      [Who feels this problem most intensely?]
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Problem Definition</h3>
                  <div className="p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">Core Problem:</p>
                    <div className="min-h-[80px] bg-muted rounded p-4 text-sm">
                      [What prevents them from achieving their desired outcome?]
                    </div>
                  </div>
                  <div className="p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">Existing Alternatives:</p>
                    <div className="min-h-[80px] bg-muted rounded p-4 text-sm">
                      [What are they currently doing to solve this?]
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border rounded-lg">
                <h3 className="font-medium mb-4 text-lg">Job to be Done (JTBD)</h3>
                <div className="min-h-[100px] bg-muted rounded p-4 text-sm">
                  [What is the customer ultimately trying to accomplish?]
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Module 2: Finding Evidence */}
          <TabsContent value="module2" className="p-0">
            <InvestigationCanvas idea={idea} />
          </TabsContent>

          {/* Module 3: Problem Discovery */}
          <TabsContent value="module3" className="space-y-8">
            <div className="max-w-5xl mx-auto space-y-8 px-6">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-semibold">Module 3: Problem Discovery Interviews</h2>
                <p className="text-muted-foreground text-lg">Execute structured customer conversations</p>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 border rounded-lg">
                  <h3 className="font-medium mb-4 text-lg">Interview Framework</h3>
                  <div className="grid gap-4 text-sm">
                    <div className="p-4 bg-muted rounded">
                      <strong>1. Frame (2-3 min):</strong> Establish trust and learning context
                    </div>
                    <div className="p-4 bg-muted rounded">
                      <strong>2. Anchor (5 min):</strong> Ground in specific recent behavior
                    </div>
                    <div className="p-4 bg-muted rounded">
                      <strong>3. Backstory (10-15 min):</strong> Find switching triggers
                    </div>
                    <div className="p-4 bg-muted rounded">
                      <strong>4. Experience (10-15 min):</strong> Explore current solution friction
                    </div>
                    <div className="p-4 bg-muted rounded">
                      <strong>5. Conclude (2-3 min):</strong> Thank and ask for referrals
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full max-w-md mx-auto"
                  onClick={() => setShowInterviewScript(true)}
                >
                  Generate Interview Script
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Module 4: Synthesizing Truth */}
          <TabsContent value="module4" className="space-y-8">
            <div className="max-w-6xl mx-auto space-y-8 px-6">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-semibold">Module 4: Synthesizing Truth</h2>
                <p className="text-muted-foreground text-lg">Turn interview data into actionable insights</p>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 border rounded-lg">
                  <h3 className="font-medium mb-4 text-lg">Customer Forces Canvas</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Push Forces:</label>
                      <div className="min-h-[80px] bg-muted rounded p-4 text-sm">
                        [Switching triggers & problems]
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Pull Forces:</label>
                      <div className="min-h-[80px] bg-muted rounded p-4 text-sm">
                        [Desired outcomes]
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Inertia:</label>
                      <div className="min-h-[80px] bg-muted rounded p-4 text-sm">
                        [Resistance to change]
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Friction:</label>
                      <div className="min-h-[80px] bg-muted rounded p-4 text-sm">
                        [Pain points with current solution]
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg">
                  <h3 className="font-medium mb-4 text-lg">Pattern Recognition</h3>
                  <div className="min-h-[120px] bg-muted rounded p-4 text-sm">
                    [What common patterns emerge across interviews?]
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Module 5: Designing the Offer */}
          <TabsContent value="module5" className="space-y-8">
            <div className="max-w-6xl mx-auto space-y-8 px-6">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-semibold">Module 5: Designing the Offer</h2>
                <p className="text-muted-foreground text-lg">Create a compelling value proposition</p>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 border rounded-lg">
                  <h3 className="font-medium mb-4 text-lg">Unique Value Proposition</h3>
                  <div className="min-h-[100px] bg-muted rounded p-4 text-sm">
                    [How will you be 3-10x better than existing alternatives?]
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-medium mb-4 text-lg">Pricing Floor</h3>
                    <div className="min-h-[80px] bg-muted rounded p-4 text-sm">
                      [Cost of existing alternatives]
                    </div>
                  </div>
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-medium mb-4 text-lg">Pricing Ceiling</h3>
                    <div className="min-h-[80px] bg-muted rounded p-4 text-sm">
                      [Value delivered to customer]
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg">
                  <h3 className="font-medium mb-4 text-lg">MVP Design</h3>
                  <div className="min-h-[120px] bg-muted rounded p-4 text-sm">
                    [What's the smallest thing that can deliver the promised value?]
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}