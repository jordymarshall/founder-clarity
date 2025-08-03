import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { 
  Copy, 
  Download, 
  RefreshCw, 
  ChevronRight, 
  Info,
  ArrowLeft 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface InterviewScriptScreenProps {
  idea: string;
  customerSegment?: string;
  problem?: string;
  existingAlternative?: string;
  jtbd?: string;
  onBack?: () => void;
}

interface ScriptModule {
  id: string;
  title: string;
  description: string;
  questions: Array<{
    text: string;
    variables?: string[];
    coaching: {
      purpose: string;
      listenFor: string;
      personalizedCue: string;
    };
  }>;
}

export function InterviewScriptScreen({ 
  idea, 
  customerSegment = "small coffee shop owners",
  problem = "struggle with effective marketing",
  existingAlternative = "manual social media posting",
  jtbd = "attract new customers to grow the business",
  onBack 
}: InterviewScriptScreenProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showAnimation, setShowAnimation] = useState(true);
  const { toast } = useToast();

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const VariablePill = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-block px-2 py-1 mx-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-md">
      {children}
    </span>
  );

  const CoachingPopover = ({ coaching }: { coaching: any }) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-2 opacity-60 hover:opacity-100">
          <Info className="h-3 w-3" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-popover border border-border">
        <div className="space-y-3">
          <div>
            <strong className="text-sm">Purpose:</strong>
            <p className="text-sm text-muted-foreground mt-1">{coaching.purpose}</p>
          </div>
          <div>
            <strong className="text-sm">Listen For:</strong>
            <p className="text-sm text-muted-foreground mt-1">{coaching.listenFor}</p>
          </div>
          <div>
            <strong className="text-sm">Your Cue:</strong>
            <p className="text-sm text-muted-foreground mt-1">{coaching.personalizedCue}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  const scriptModules: ScriptModule[] = [
    {
      id: 'frame',
      title: 'Frame the Encounter',
      description: 'Set the stage and build trust to ensure an honest conversation.',
      questions: [
        {
          text: `Thank you for taking the time to speak with me today. I want to be completely transparent - I'm doing research to understand how ${customerSegment} currently handle their challenges. This is purely research, not a sales pitch.`,
          coaching: {
            purpose: 'Establish trust and set expectations for a learning-focused conversation.',
            listenFor: 'Their tone relaxing and becoming more open to sharing.',
            personalizedCue: 'Emphasize that you\'re genuinely curious about their experience, not trying to sell anything.'
          }
        }
      ]
    },
    {
      id: 'anchor',
      title: 'Establish the Anchor',
      description: 'Ground the conversation in a recent, specific, factual event.',
      questions: [
        {
          text: `To help me understand your world, could you tell me what you're currently using or doing to ${jtbd}?`,
          variables: [jtbd],
          coaching: {
            purpose: 'Ground the conversation in specific, recent behavior rather than general opinions.',
            listenFor: 'Concrete actions they\'ve taken, not just intentions or plans.',
            personalizedCue: `Ask about their current approach to ${jtbd} and when they started using it.`
          }
        },
        {
          text: 'When did you start using that approach? Can you remember roughly when that was?',
          coaching: {
            purpose: 'Establish a timeline and ensure the story is recent enough to be reliable.',
            listenFor: 'A specific timeframe, ideally within the last 90 days.',
            personalizedCue: 'If it was more than 6 months ago, ask about more recent attempts.'
          }
        }
      ]
    },
    {
      id: 'backstory',
      title: 'Reconstruct the Backstory',
      description: 'Work backward to uncover the cause that forced them to act.',
      questions: [
        {
          text: `Can you take me back to the time right before you decided to try ${existingAlternative}?`,
          variables: [existingAlternative],
          coaching: {
            purpose: 'Find the switching trigger - the specific event that broke their satisfaction with the status quo.',
            listenFor: 'A bad experience, change in circumstance, or new awareness that created urgency.',
            personalizedCue: `Look for the moment they realized ${existingAlternative} was worth trying.`
          }
        },
        {
          text: 'What was the specific event or frustration that made you realize the old way wasn\'t working anymore?',
          coaching: {
            purpose: 'Identify the exact trigger that caused them to seek a new solution.',
            listenFor: 'A specific incident, not general dissatisfaction.',
            personalizedCue: 'Dig for the "straw that broke the camel\'s back" moment.'
          }
        },
        {
          text: 'Before settling on that, what other options did you look at? And what did you fear would happen if you did nothing?',
          coaching: {
            purpose: 'Understand their consideration set and quantify what was at stake.',
            listenFor: 'Alternative solutions they evaluated and the negative consequences they wanted to avoid.',
            personalizedCue: 'This reveals who they think your competition is and how urgent the problem felt.'
          }
        }
      ]
    },
    {
      id: 'experience',
      title: 'Explore the Experience',
      description: 'Find the hidden problems and frustrations in their current solution.',
      questions: [
        {
          text: `Can you walk me through how you typically use ${existingAlternative}? What does that process look like step by step?`,
          variables: [existingAlternative],
          coaching: {
            purpose: 'Uncover friction points and workarounds in their current process.',
            listenFor: 'Steps that seem cumbersome, manual workarounds, or expressions of frustration.',
            personalizedCue: 'Pay attention to their tone when describing certain steps - frustration often reveals opportunity.'
          }
        },
        {
          text: 'When you first started, what were you hoping to achieve? How has reality compared to those expectations?',
          coaching: {
            purpose: 'Measure the gap between their desired outcome and actual results.',
            listenFor: 'Specific goals they had and areas where the current solution falls short.',
            personalizedCue: 'This gap between expectation and reality is where new solutions can add value.'
          }
        },
        {
          text: 'What takes longer than expected? What do you find yourself working around?',
          coaching: {
            purpose: 'Identify specific inefficiencies and pain points in their workflow.',
            listenFor: 'Time-consuming steps, manual processes, or things they\'ve learned to "just deal with."',
            personalizedCue: 'These workarounds often become features in successful solutions.'
          }
        }
      ]
    },
    {
      id: 'conclude',
      title: 'Conclude and Open the Door',
      description: 'Thank them and create opportunities for follow-up and referrals.',
      questions: [
        {
          text: `This has been incredibly helpful. Based on what you've shared, I'm exploring the idea of a solution that could help ${customerSegment} ${jtbd} more effectively.`,
          variables: [customerSegment, jtbd],
          coaching: {
            purpose: 'Plant a seed about your solution without making a sales pitch.',
            listenFor: 'Their reaction - interest, skepticism, or questions about your approach.',
            personalizedCue: 'Keep it high-level and focused on the value they\'d receive.'
          }
        },
        {
          text: 'Would it be okay if I followed up with you as this develops? And do you know anyone else who might have similar experiences?',
          coaching: {
            purpose: 'Secure permission for future contact and get referrals to similar customers.',
            listenFor: 'Willingness to stay engaged and names of potential referrals.',
            personalizedCue: 'Referrals are the highest-leverage way to find more interview subjects.'
          }
        }
      ]
    }
  ];

  const handleCopyScript = async () => {
    const scriptText = generateFullScript();
    try {
      await navigator.clipboard.writeText(scriptText);
      toast({
        title: "Script copied!",
        description: "The complete interview script has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the script manually.",
        variant: "destructive",
      });
    }
  };

  const generateFullScript = () => {
    let script = `# Customer Problem Discovery Interview Script\n\n`;
    script += `**Idea:** ${idea}\n`;
    script += `**Target Customer:** ${customerSegment}\n`;
    script += `**Duration:** 30-45 minutes\n\n`;
    
    scriptModules.forEach((module, index) => {
      script += `## ${index + 1}. ${module.title}\n\n`;
      script += `*${module.description}*\n\n`;
      
      module.questions.forEach((question, qIndex) => {
        script += `${qIndex + 1}. ${question.text}\n\n`;
      });
      
      script += `\n`;
    });
    
    return script;
  };

  useEffect(() => {
    // Trigger cascade animation
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            {onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="flex items-center gap-2 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Canvas
              </Button>
            )}
            <h1 className="text-2xl font-semibold">
              Interview Script: <span className="text-muted-foreground">{idea}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyScript}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
          </div>
        </div>

        {/* Script Modules */}
        <div className="space-y-4">
          {scriptModules.map((module, index) => (
            <Card 
              key={module.id} 
              className={`transition-all duration-300 ${
                showAnimation ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
              style={{
                animationDelay: showAnimation ? `${index * 100}ms` : '0ms'
              }}
            >
              <Collapsible
                open={expandedSections.includes(module.id)}
                onOpenChange={() => toggleSection(module.id)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">
                        {index + 1}. {module.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                    <ChevronRight 
                      className={`h-5 w-5 transition-transform duration-200 ${
                        expandedSections.includes(module.id) ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="px-6 pb-6">
                  <div className="space-y-4 pt-4 border-t">
                    {module.questions.map((question, qIndex) => (
                      <div key={qIndex} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center justify-center mt-0.5">
                            {qIndex + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed">
                              {question.text.split(/(\[[^\]]+\])/).map((part, i) => {
                                if (part.startsWith('[') && part.endsWith(']')) {
                                  const variable = part.slice(1, -1);
                                  return <VariablePill key={i}>{variable}</VariablePill>;
                                }
                                return part;
                              })}
                            </p>
                          </div>
                          <CoachingPopover coaching={question.coaching} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Post-Interview Notes */}
        <Card className="mt-8 p-6">
          <h3 className="font-medium mb-3">Post-Interview Action Items</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Debrief immediately</strong> (within 15 minutes): Fill out Customer Forces Canvas</p>
            <p>• <strong>Note key quotes</strong> and friction points mentioned</p>
            <p>• <strong>Look for patterns</strong> across multiple interviews</p>
            <p>• <strong>Ask for referrals</strong> to similar customers</p>
          </div>
        </Card>
      </div>
    </div>
  );
}