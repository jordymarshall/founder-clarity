import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, ArrowLeft, BarChart3, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Interview {
  id: string;
  name: string;
  switchingTrigger: string;
  existingAlternative: string;
  desiredOutcome: string;
  friction: string;
  quotes: string;
}

export default function Module4() {
  const navigate = useNavigate();
  
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [patterns, setPatterns] = useState({
    commonSwitchingTrigger: '',
    commonExistingAlternative: '',
    commonFrictionPattern: '',
    evidenceBackedHypothesis: ''
  });

  const addInterview = () => {
    const newInterview: Interview = {
      id: Date.now().toString(),
      name: '',
      switchingTrigger: '',
      existingAlternative: '',
      desiredOutcome: '',
      friction: '',
      quotes: ''
    };
    setInterviews([...interviews, newInterview]);
  };

  const updateInterview = (id: string, field: keyof Interview, value: string) => {
    setInterviews(prev => prev.map(interview => 
      interview.id === id ? { ...interview, [field]: value } : interview
    ));
  };

  const removeInterview = (id: string) => {
    setInterviews(prev => prev.filter(interview => interview.id !== id));
  };

  const updatePattern = (field: keyof typeof patterns, value: string) => {
    setPatterns(prev => ({ ...prev, [field]: value }));
  };

  const generateHypothesis = () => {
    if (patterns.commonSwitchingTrigger && patterns.commonExistingAlternative && patterns.commonFrictionPattern) {
      const hypothesis = `We have evidence to believe that [Early Adopter Segment] consistently struggles to achieve [Desired Outcome]. When a ${patterns.commonSwitchingTrigger} occurs, they currently hire a ${patterns.commonExistingAlternative}, but find it inadequate. Their primary struggle is characterized by ${patterns.commonFrictionPattern}, which prevents them from making the progress they want. This is a significant problem because they are already investing [Time/Money/Effort] into these suboptimal alternatives.`;
      
      updatePattern('evidenceBackedHypothesis', hypothesis);
    }
  };

  const isComplete = interviews.length >= 5 && patterns.evidenceBackedHypothesis;

  const handleNext = () => {
    navigate('/workflow/module5');
  };

  const handleBack = () => {
    navigate('/workflow/module3');
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Module 4</Badge>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Synthesizing Truth - From Raw Data to Actionable Insight</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Systematically process raw interview data to identify recurring patterns and avoid cognitive biases.
            </p>
          </div>
        </div>

        <Tabs defaultValue="interviews" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="interviews">Interview Canvas</TabsTrigger>
            <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
            <TabsTrigger value="hypothesis">Evidence-Backed Hypothesis</TabsTrigger>
          </TabsList>

          <TabsContent value="interviews" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Customer Forces Canvas</CardTitle>
                  <CardDescription>
                    Within 15 minutes of each interview, fill out a canvas to prevent memory decay and bias
                  </CardDescription>
                </div>
                <Button onClick={addInterview} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Interview
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {interviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No interviews added yet. Add at least 5-10 interviews to identify patterns.
                    </div>
                  ) : (
                    interviews.map((interview) => (
                      <div key={interview.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Interview #{interviews.indexOf(interview) + 1}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInterview(interview.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="col-span-full">
                            <label className="text-sm font-medium">Interviewee Name/Title</label>
                            <Textarea
                              value={interview.name}
                              onChange={(e) => updateInterview(interview.id, 'name', e.target.value)}
                              placeholder="Name and brief context"
                              className="min-h-[60px]"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Switching Trigger (Push)</label>
                            <Textarea
                              value={interview.switchingTrigger}
                              onChange={(e) => updateInterview(interview.id, 'switchingTrigger', e.target.value)}
                              placeholder="What forced them to act? Bad experience, change in circumstance, or new awareness?"
                              className="min-h-[80px]"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Desired Outcome (Pull)</label>
                            <Textarea
                              value={interview.desiredOutcome}
                              onChange={(e) => updateInterview(interview.id, 'desiredOutcome', e.target.value)}
                              placeholder="What were they hoping to achieve?"
                              className="min-h-[80px]"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Existing Alternative (Inertia)</label>
                            <Textarea
                              value={interview.existingAlternative}
                              onChange={(e) => updateInterview(interview.id, 'existingAlternative', e.target.value)}
                              placeholder="What were they doing before? What made it hard to change?"
                              className="min-h-[80px]"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Friction/Workarounds (Friction)</label>
                            <Textarea
                              value={interview.friction}
                              onChange={(e) => updateInterview(interview.id, 'friction', e.target.value)}
                              placeholder="What problems did they experience with their chosen solution?"
                              className="min-h-[80px]"
                            />
                          </div>
                          
                          <div className="col-span-full">
                            <label className="text-sm font-medium">Key Quotes & Notes</label>
                            <Textarea
                              value={interview.quotes}
                              onChange={(e) => updateInterview(interview.id, 'quotes', e.target.value)}
                              placeholder="Important quotes, emotional reactions, specific details..."
                              className="min-h-[80px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pattern Identification</CardTitle>
                <CardDescription>
                  Look across your {interviews.length} interviews to identify recurring themes. A pattern across multiple interviews indicates a market opportunity.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Common Switching Trigger</label>
                  <Textarea
                    value={patterns.commonSwitchingTrigger}
                    onChange={(e) => updatePattern('commonSwitchingTrigger', e.target.value)}
                    placeholder="Do most interviews start for the same reason? What pattern emerges?"
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Common Existing Alternative</label>
                  <Textarea
                    value={patterns.commonExistingAlternative}
                    onChange={(e) => updatePattern('commonExistingAlternative', e.target.value)}
                    placeholder="Are most people hiring the same type of solution?"
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Common Pattern of Friction/Workarounds (The Gold Mine)</label>
                  <Textarea
                    value={patterns.commonFrictionPattern}
                    onChange={(e) => updatePattern('commonFrictionPattern', e.target.value)}
                    placeholder="What are the top 2-3 frustrations that appear again and again?"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={generateHypothesis} disabled={!patterns.commonSwitchingTrigger || !patterns.commonExistingAlternative || !patterns.commonFrictionPattern}>
                    Generate Evidence-Backed Hypothesis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hypothesis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evidence-Backed Customer/Problem Fit Hypothesis</CardTitle>
                <CardDescription>
                  Your synthesized understanding of a recurring problem worth solving
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={patterns.evidenceBackedHypothesis}
                  onChange={(e) => updatePattern('evidenceBackedHypothesis', e.target.value)}
                  placeholder="We have evidence to believe that [Early Adopter Segment] consistently struggles to achieve [Desired Outcome]..."
                  className="min-h-[150px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validation Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border ${interviews.length >= 5 ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`} />
                    <span className="text-sm">Conducted at least 5-10 interviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border ${patterns.commonSwitchingTrigger ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`} />
                    <span className="text-sm">Identified common switching trigger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border ${patterns.commonFrictionPattern ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`} />
                    <span className="text-sm">Found recurring friction patterns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border ${patterns.evidenceBackedHypothesis ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`} />
                    <span className="text-sm">Formulated evidence-backed hypothesis</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Module 3
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!isComplete}
            className="flex items-center gap-2"
          >
            Continue to Module 5: Designing Offers
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}