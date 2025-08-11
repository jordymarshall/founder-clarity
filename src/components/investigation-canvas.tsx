import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CanvasSection {
  id: string;
  title: string;
  content: string;
}

interface InvestigationCanvasProps {
  idea: string;
  onBack?: () => void;
  initialCustomerSegment?: string;
  initialProblem?: string;
  initialAlternatives?: string;
  initialJTBD?: string;
}

export function InvestigationCanvas({ idea, onBack, initialCustomerSegment, initialProblem, initialAlternatives, initialJTBD }: InvestigationCanvasProps) {
  const [showScript, setShowScript] = useState(false);
  const { toast } = useToast();
  const [sections, setSections] = useState<CanvasSection[]>([
    {
      id: 'customer-segment',
      title: 'Customer Segment',
      content: 'Early-stage startup founders who struggle with product-market fit and waste time building features nobody wants.'
    },
    {
      id: 'problem',
      title: 'The Problem',
      content: 'Founders often build based on assumptions rather than validated customer problems, leading to failed products and wasted resources.'
    },
    {
      id: 'current-solutions',
      title: 'Current Solutions',
      content: 'Basic survey tools, expensive consultants, trial and error approach, or following generic startup advice from books.'
    },
    {
      id: 'hypothesis',
      title: 'Solution Hypothesis',
      content: 'An AI-powered coach that guides founders through systematic customer discovery with templates, analysis, and actionable insights.'
    }
  ]);

  const updateSection = (id: string, content: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, content } : section
    ));
  };

  const handleGenerateScript = () => {
    setShowScript(true);
  };

  const generateInterviewScript = () => {
    const customerSegment = sections.find(s => s.id === 'customer-segment')?.content || '';
    const problem = sections.find(s => s.id === 'problem')?.content || '';
    const currentSolutions = sections.find(s => s.id === 'current-solutions')?.content || '';
    
    return `# Customer Problem Discovery Interview Script

## Pre-Interview Setup
**Duration:** 30-45 minutes
**Goal:** Understand the customer's real-world experience and validate our problem hypothesis

## 1. Frame the Encounter (2-3 minutes)

"Thank you for taking the time to speak with me today. I want to be completely transparent about why we're talking. I'm doing research to understand how people like yourself currently handle [the problem area]. This is purely research - I'm not here to pitch or sell you anything. I'm genuinely interested in learning from your experience, and there are no wrong answers. Does that sound good?"

## 2. Establish the Anchor (5 minutes)

**Goal:** Ground the conversation in specific, recent behavior

"To help me understand your world, could you tell me what you're currently using or doing to ${problem.toLowerCase().replace(/\.$/, '')}?"

**Listen for:** Their current solution (existing alternative)
**Follow-up:** "When did you start using [their solution]?" / "Can you remember roughly when that was?"

## 3. Reconstruct the Backstory (10-15 minutes)

**Goal:** Work backward to find their switching trigger

"Can you take me back to the time *before* you started using [their current solution]?"

**Hunt for the Switching Trigger:**
- "When was the first time you realized you needed a new approach?"
- "What prompted you to look for a solution?"
- "Do you remember what was happening in your business/life at that time?"

**Quantify What's at Stake:**
- "What would have happened if you had done nothing?"
- "What were you worried about?"

**Explore Consideration Set:**
- "What other options did you consider?"
- "How did you evaluate your choices?"

## 4. Explore the Experience (10-15 minutes)

**Goal:** Find friction points in their current process

"Can you walk me through how you typically use [their current solution]?"

**Listen for friction points:**
- Steps that seem cumbersome
- Workarounds they've created
- Things that take longer than expected
- Frustrations or pet peeves

**Measure the gap:**
- "When you first started, what were you hoping to achieve?"
- "How has [their solution] lived up to those expectations?"
- "What's working well? What's not working as well as you'd hoped?"

## 5. Conclude and Open the Door (2-3 minutes)

"This has been incredibly helpful. Based on what you've shared, I'm exploring the idea of ${sections.find(s => s.id === 'hypothesis')?.content?.toLowerCase() || 'a solution that addresses these challenges'}. 

Would it be okay if I followed up with you as this develops? And do you know anyone else in your network who might have similar experiences and would be willing to share their perspective?"

## Post-Interview Action Items

1. **Immediately debrief** (within 15 minutes):
   - Fill out Customer Forces Canvas
   - Note key quotes and friction points
   - Identify patterns compared to previous interviews

2. **Look for patterns across interviews:**
   - Common switching triggers
   - Shared friction points  
   - Similar existing alternatives
   - Recurring desired outcomes

## Key Questions Bank

**For deeper exploration:**
- "Help me understand what you mean by [their term]"
- "Can you give me a specific example?"
- "Walk me through that process step by step"
- "How did that make you feel?"
- "What did you do next?"
- "Who else was involved in that decision?"

**Remember:** Stay curious, listen more than you talk, and dig into specific stories rather than general opinions.`;
  };

  const handleCopyScript = async () => {
    const script = generateInterviewScript();
    try {
      await navigator.clipboard.writeText(script);
      toast({
        title: "Interview script copied!",
        description: "The script has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the script manually.",
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
              <h1 className="text-page-title">Investigation Canvas</h1>
              <p className="text-foreground-secondary">Structure your idea for systematic validation</p>
              <p className="text-sm text-muted-foreground italic">"{idea}"</p>
            </div>
          </div>

          {/* Canvas Sections */}
          <div className="max-w-3xl mx-auto space-y-6">
            {sections.map((section) => (
              <div key={section.id} className="space-y-3">
                <h3 className="text-subtle uppercase tracking-wide">{section.title}</h3>
                <Textarea
                  value={section.content}
                  onChange={(e) => updateSection(section.id, e.target.value)}
                  className="min-h-[100px] bg-card border-0 resize-none text-body leading-relaxed focus:ring-2 focus:ring-primary/20"
                  placeholder={`Describe the ${section.title.toLowerCase()}...`}
                />
              </div>
            ))}
          </div>

          {/* Generate Script CTA */}
          <div className="max-w-3xl mx-auto pt-8">
            <Button 
              onClick={handleGenerateScript}
              className="w-full py-3 text-base font-medium"
            >
              Generate Interview Script
            </Button>
          </div>
        </div>
      </div>

      {/* Interview Script Dialog */}
      <Dialog open={showScript} onOpenChange={setShowScript}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Customer Discovery Interview Script
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyScript}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Script
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-muted p-4 rounded-lg">
              {generateInterviewScript()}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}