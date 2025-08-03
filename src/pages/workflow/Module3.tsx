import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, ArrowLeft, MessageCircle, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Module3() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const interviewScript = `# Customer Problem Discovery Interview Script

## Pre-Interview Setup
**Duration:** 30-45 minutes
**Goal:** Understand the customer's real-world experience and validate our problem hypothesis

## 1. Frame the Encounter (2-3 minutes)

"Thank you for taking the time to speak with me today. I want to be completely transparent about why we're talking. I'm doing research to understand how people like yourself currently handle [the problem area]. This is purely research - I'm not here to pitch or sell you anything. I'm genuinely interested in learning from your experience, and there are no wrong answers. Does that sound good?"

## 2. Establish the Anchor (5 minutes)

**Goal:** Ground the conversation in specific, recent behavior

"To help me understand your world, could you tell me what you're currently using or doing to [insert your hypothesized JTBD]?"

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

"This has been incredibly helpful. Based on what you've shared, I'm exploring the idea of [high-level concept]. 

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

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(interviewScript);
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

  const handleNext = () => {
    navigate('/workflow/module4');
  };

  const handleBack = () => {
    navigate('/workflow/module2');
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Module 3</Badge>
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">The Art of Inquiry - Problem Discovery Interviews</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Execute structured conversations that systematically uncover the ground truth of a customer's past struggle.
            </p>
          </div>
        </div>

        <Tabs defaultValue="script" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="script">Interview Script</TabsTrigger>
            <TabsTrigger value="process">5-Step Process</TabsTrigger>
            <TabsTrigger value="tips">Best Practices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="script" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Customer Discovery Interview Script</CardTitle>
                  <CardDescription>
                    A structured approach to uncovering customer problems and validating your hypotheses
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyScript}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Script
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                  {interviewScript}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process" className="space-y-6">
            <div className="grid gap-6">
              {[
                {
                  step: 1,
                  title: "Frame the Encounter",
                  duration: "2-3 minutes",
                  goal: "Establish trust and set expectations",
                  description: "Create an environment for truth-telling by positioning yourself as a researcher, not a salesperson."
                },
                {
                  step: 2,
                  title: "Establish the Anchor",
                  duration: "5 minutes", 
                  goal: "Ground conversation in specific events",
                  description: "Ask about current behavior to identify their existing alternative and create a concrete anchor point."
                },
                {
                  step: 3,
                  title: "Reconstruct the Backstory",
                  duration: "10-15 minutes",
                  goal: "Find the switching trigger",
                  description: "Work backward to uncover what caused them to change their behavior and what was at stake."
                },
                {
                  step: 4,
                  title: "Explore the Experience", 
                  duration: "10-15 minutes",
                  goal: "Identify friction points",
                  description: "Walk through their current process to find inefficiencies, workarounds, and gaps."
                },
                {
                  step: 5,
                  title: "Conclude and Open the Door",
                  duration: "2-3 minutes",
                  goal: "Maintain relationship for follow-up",
                  description: "Thank them, tease your concept, and ask for referrals to expand your network."
                }
              ].map((item) => (
                <Card key={item.step}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {item.step}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>{item.duration} • {item.goal}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Before the Interview</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• Review their background and recent activity</li>
                      <li>• Prepare your hypotheses but stay open to being wrong</li>
                      <li>• Set up recording (with permission) for accurate notes</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">During the Interview</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• Listen 80%, talk 20%</li>
                      <li>• Ask "why" and "how" questions, avoid leading questions</li>
                      <li>• Focus on specific stories, not general opinions</li>
                      <li>• Take notes on exact quotes and emotional reactions</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Red Flags to Avoid</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• Pitching your solution during discovery</li>
                      <li>• Asking hypothetical "would you" questions</li>
                      <li>• Leading them to the answers you want to hear</li>
                      <li>• Forgetting to ask for referrals at the end</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Module 2
          </Button>
          <Button onClick={handleNext} className="flex items-center gap-2">
            Continue to Module 4: Synthesizing Truth
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}