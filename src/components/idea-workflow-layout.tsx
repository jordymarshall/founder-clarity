import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InterviewScriptScreen } from '@/components/interview-script-screen';
import { EvidenceTab } from '@/components/evidence-tab';
import { HypothesisCanvas } from '@/components/hypothesis-canvas';
import { SynthesisCanvas } from '@/components/synthesis-canvas';
import { ArrowLeft } from 'lucide-react';

interface IdeaWorkflowLayoutProps {
  idea: string;
  onBack?: () => void;
}

export function IdeaWorkflowLayout({ idea, onBack }: IdeaWorkflowLayoutProps) {
  const [showInterviewScript, setShowInterviewScript] = useState(false);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const [canvasCards, setCanvasCards] = useState<any[]>([]);

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

          {/* Module 1: Hypothesis Canvas */}
          <TabsContent value="module1" className="space-y-6">
            <HypothesisCanvas 
              idea={idea} 
              isInitialized={canvasInitialized}
              onInitialized={() => setCanvasInitialized(true)}
              persistedCards={canvasCards}
              onCardsChange={setCanvasCards}
            />
          </TabsContent>

          {/* Module 2: Finding Evidence */}
          <TabsContent value="module2" className="space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Module 2: The Search for Evidence</h2>
                <p className="text-muted-foreground">Find and connect with your target customers</p>
              </div>
              
              <EvidenceTab 
                idea={idea}
                customerSegment={canvasCards.find(card => card.id === 'customer-segment')}
                coreProblem={canvasCards.find(card => card.id === 'core-problem')}
                jobToBeDone={canvasCards.find(card => card.id === 'job-to-be-done')}
                existingAlternatives={canvasCards.find(card => card.id === 'existing-alternatives')}
              />
            </div>
          </TabsContent>

          {/* Module 3: Problem Discovery */}
          <TabsContent value="module3" className="space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Module 3: Problem Discovery Interviews</h2>
                <p className="text-muted-foreground">Execute structured customer conversations</p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3">Interview Framework</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-primary/10 text-primary text-sm font-medium rounded-full flex items-center justify-center">
                        1
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">Frame (2-3 min)</h4>
                        <p className="text-sm text-muted-foreground">Establish trust and learning context</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-primary/10 text-primary text-sm font-medium rounded-full flex items-center justify-center">
                        2
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">Anchor (5 min)</h4>
                        <p className="text-sm text-muted-foreground">Ground in specific recent behavior</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-primary/10 text-primary text-sm font-medium rounded-full flex items-center justify-center">
                        3
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">Backstory (10-15 min)</h4>
                        <p className="text-sm text-muted-foreground">Find switching triggers</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-primary/10 text-primary text-sm font-medium rounded-full flex items-center justify-center">
                        4
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">Experience (10-15 min)</h4>
                        <p className="text-sm text-muted-foreground">Explore current solution friction</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-primary/10 text-primary text-sm font-medium rounded-full flex items-center justify-center">
                        5
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">Conclude (2-3 min)</h4>
                        <p className="text-sm text-muted-foreground">Thank and ask for referrals</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => setShowInterviewScript(true)}
                >
                  Generate Interview Script
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Module 4: Synthesizing Truth */}
          <TabsContent value="module4" className="space-y-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Module 4: Synthesizing Truth</h2>
                <p className="text-muted-foreground">Turn interview data into actionable insights</p>
              </div>
              
              <SynthesisCanvas />
            </div>
          </TabsContent>

          {/* Module 5: Designing the Offer */}
          <TabsContent value="module5" className="space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Module 5: Designing the Offer</h2>
                <p className="text-muted-foreground">Create a compelling value proposition</p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3">Unique Value Proposition</h3>
                  <div className="min-h-[80px] bg-muted rounded p-3 text-sm">
                    [How will you be 3-10x better than existing alternatives?]
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3">Pricing Floor</h3>
                    <div className="min-h-[60px] bg-muted rounded p-3 text-sm">
                      [Cost of existing alternatives]
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3">Pricing Ceiling</h3>
                    <div className="min-h-[60px] bg-muted rounded p-3 text-sm">
                      [Value delivered to customer]
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3">MVP Design</h3>
                  <div className="min-h-[100px] bg-muted rounded p-3 text-sm">
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