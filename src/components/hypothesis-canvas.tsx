import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Sparkles, RefreshCw, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasCard {
  id: string;
  title: string;
  content: string[];
  aiGenerated: boolean;
  reasoning?: string;
  dependsOn?: string[];
  needsUpdate?: boolean;
}

interface HypothesisCanvasProps {
  idea: string;
  isInitialized?: boolean;
  onInitialized?: () => void;
  persistedCards?: CanvasCard[];
  onCardsChange?: (cards: CanvasCard[]) => void;
}

export function HypothesisCanvas({ idea, isInitialized = false, onInitialized, persistedCards = [], onCardsChange }: HypothesisCanvasProps) {
  // All state declarations together
  const [inputValue, setInputValue] = useState(idea || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [refinementInput, setRefinementInput] = useState('');
  const [cards, setCards] = useState<CanvasCard[]>([]);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock AI analysis function
  const mockAnalyzeIdea = async (ideaText: string): Promise<CanvasCard[]> => {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return [
      {
        id: 'customer-segment',
        title: 'Customer Segment',
        content: [
          'Early-stage startup founders (pre-seed to Series A)',
          'Entrepreneurs who have built products before but struggled with product-market fit',
          'Technical founders who excel at building but struggle with customer discovery',
          'Solo founders or small teams (2-5 people) with limited validation resources'
        ],
        aiGenerated: true,
        reasoning: 'Based on analysis of 500+ startup forums and YC posts, this segment shows highest engagement with validation-related content. Technical founders consistently report customer discovery as their biggest weakness.',
        dependsOn: []
      },
      {
        id: 'core-problem',
        title: 'Core Problem', 
        content: [
          'Building features based on assumptions rather than validated customer problems',
          'Spending months developing products that customers don\'t actually want',
          'Difficulty translating technical capabilities into customer value propositions',
          'Wasting limited runway on wrong priorities due to lack of customer insight'
        ],
        aiGenerated: true,
        reasoning: 'Primary pain point mentioned in 73% of startup failure post-mortems. Strong correlation with lack of customer validation. CB Insights reports 42% of startups fail due to "no market need."',
        dependsOn: ['customer-segment']
      },
      {
        id: 'existing-alternatives',
        title: 'Existing Alternatives',
        content: [
          'Basic survey tools like Google Forms or Typeform for customer feedback',
          'Expensive consultants ($5K-50K) for market research and validation',
          'Trial and error approach with rapid prototyping and A/B testing',
          'Following generic startup advice from books like "Lean Startup"'
        ],
        aiGenerated: true,
        reasoning: 'Most common solutions mentioned in 200+ founder interviews. None provide systematic approach with AI guidance. Current alternatives either lack depth (surveys) or are cost-prohibitive (consultants).',
        dependsOn: ['core-problem']
      },
      {
        id: 'job-to-be-done',
        title: 'Job to be Done',
        content: [
          'Quickly validate if there\'s real market demand before building',
          'Understand customer problems deeply enough to build the right solution',
          'Get actionable insights without spending months or tens of thousands on research',
          'Build confidence in their direction to secure funding and team buy-in'
        ],
        aiGenerated: true,
        reasoning: 'Core JTBD extracted from Jobs-to-be-Done theory applied to early-stage validation process. Validated through 50+ founder interviews and analysis of successful validation case studies.',
        dependsOn: ['customer-segment', 'core-problem', 'existing-alternatives']
      }
    ];
  };

  // Canvas generation function
  const handleGenerateCanvas = useCallback(async (ideaText: string) => {
    setIsGenerating(true);
    setShowCanvas(true);
    setCards([]); // Clear existing cards first
    onCardsChange?.([]); // Clear persisted cards too
    
    try {
      const generatedCards = await mockAnalyzeIdea(ideaText);
      
      // Animate cards appearing one by one
      for (let i = 0; i < generatedCards.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setCards(prev => {
          const newCards = [...prev, generatedCards[i]];
          onCardsChange?.(newCards);
          return newCards;
        });
      }
      
      onInitialized?.();
    } catch (error) {
      console.error('Error generating canvas:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [onInitialized, onCardsChange]);

  // Refinement function
  const handleRefineCanvas = async () => {
    if (!refinementInput.trim()) return;
    
    setIsGenerating(true);
    // Simulate refinement process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock refinement - in reality this would call AI with the refinement prompt
    const updatedCards = cards.map(card => ({
      ...card,
      needsUpdate: false,
      aiGenerated: true
    }));
    
    setCards(updatedCards);
    onCardsChange?.(updatedCards);
    setRefinementInput('');
    setIsGenerating(false);
  };

  // Toggle card expansion
  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  // Card editing functions
  const handleCardEdit = (cardId: string, newContent: string[]) => {
    const updatedCards = cards.map(card => {
      if (card.id === cardId) {
        return { ...card, content: newContent, aiGenerated: false };
      }
      return card.dependsOn?.includes(cardId) ? { ...card, needsUpdate: true } : card;
    });
    
    setCards(updatedCards);
    onCardsChange?.(updatedCards);
    setEditingCard(null);
  };

  const handleUpdateDependentCard = async (cardId: string) => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedCards = cards.map(card => 
      card.id === cardId ? { ...card, needsUpdate: false, aiGenerated: true } : card
    );
    
    setCards(updatedCards);
    onCardsChange?.(updatedCards);
    setIsGenerating(false);
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setCards([]); // Clear existing cards
      handleGenerateCanvas(inputValue.trim());
    }
  };

  // Effects
  useEffect(() => {
    if (!showCanvas && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCanvas]);

  useEffect(() => {
    if (isInitialized && persistedCards.length > 0 && !hasGenerated) {
      setShowCanvas(true);
      setCards(persistedCards);
      setHasGenerated(true);
    } else if (idea && !isInitialized && !hasGenerated) {
      setHasGenerated(true);
      handleGenerateCanvas(idea);
    }
  }, [idea, isInitialized, persistedCards.length, hasGenerated, handleGenerateCanvas]);

  // Render initial state (input form)
  if (!showCanvas) {
    return (
      <div className="max-w-2xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-page-title">AI-Powered Hypothesis Canvas</h1>
          <p className="text-foreground-secondary text-lg">
            Transform your idea into sharp, testable beliefs
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe your startup idea in a sentence or two..."
                className="text-lg py-4 h-auto bg-card border-border focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={!inputValue.trim() || isGenerating}
              className="w-full py-3 text-base font-medium"
            >
              {isGenerating ? 'Analyzing...' : 'Generate Hypothesis Canvas'}
            </Button>
        </form>
      </div>
    );
  }

  // Render canvas view
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">AI-Powered Hypothesis Canvas</h2>
        <p className="text-muted-foreground">Your idea, structured for validation</p>
        <p className="text-sm text-muted-foreground italic">"{inputValue}"</p>
      </div>

      {/* AI Research Status */}
      {isGenerating && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            Analyzing your idea... Searching for market signals...
          </div>
        </div>
      )}

      {/* Canvas Rows */}
      <div className="max-w-6xl mx-auto space-y-4">
        {cards.map((card, index) => (
          <Card 
            key={card.id}
            className={cn(
              "transition-all duration-300",
              "animate-fade-in",
              card.needsUpdate && "ring-2 ring-yellow-500/20"
            )}
            style={{ 
              animationDelay: `${index * 150}ms`,
              animationFillMode: 'both'
            }}
          >
            <Collapsible
              open={expandedCards.includes(card.id)}
              onOpenChange={() => toggleCard(card.id)}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-subtle uppercase tracking-wide text-sm font-medium">
                          {card.title}
                        </h3>
                        {card.aiGenerated && (
                          <Sparkles className="h-4 w-4 text-primary" />
                        )}
                        {card.needsUpdate && (
                          <RefreshCw className="h-4 w-4 text-yellow-500 animate-pulse" />
                        )}
                      </div>
                      <div className="space-y-2">
                        {card.content.slice(0, 2).map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center justify-center mt-0.5">
                              {pointIndex + 1}
                            </span>
                            <p className="text-sm leading-relaxed text-foreground">
                              {point}
                            </p>
                          </div>
                        ))}
                        {card.content.length > 2 && (
                          <p className="text-xs text-muted-foreground ml-7">
                            +{card.content.length - 2} more insights...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Rationale */}
                    <div className="space-y-3">
                      <h4 className="text-subtle uppercase tracking-wide text-sm font-medium">
                        AI Rationale
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {card.reasoning}
                      </p>
                    </div>
                  </div>
                  
                  <ChevronRight 
                    className={cn(
                      "h-5 w-5 transition-transform duration-200 ml-4 flex-shrink-0",
                      expandedCards.includes(card.id) && "rotate-90"
                    )}
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="px-6 pb-6">
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Expanded Content */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground">Complete Analysis</h4>
                      <div className="space-y-2">
                        {card.content.map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center justify-center mt-0.5">
                              {pointIndex + 1}
                            </span>
                            <p className="text-sm leading-relaxed text-foreground">
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sources & Evidence (Placeholder) */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground">Sources & Evidence</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• YC Startup School data (500+ companies)</p>
                        <p>• CB Insights failure analysis</p>
                        <p>• Customer discovery interviews</p>
                        <p>• Lean Startup methodology studies</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        disabled
                      >
                        <Info className="h-4 w-4 mr-2" />
                        View Detailed Sources (Coming Soon)
                      </Button>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Continuous Discovery Input */}
      {cards.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex gap-2">
                <Input
                  value={refinementInput}
                  onChange={(e) => setRefinementInput(e.target.value)}
                  placeholder="Refine or add more detail..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleRefineCanvas();
                    }
                  }}
                />
                <Button 
                  onClick={handleRefineCanvas}
                  disabled={!refinementInput.trim() || isGenerating}
                  size="sm"
                >
                  Refine
                </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Try: "Focus more on university students" or "What if the main problem is finding sustainable packaging?"
          </p>
        </div>
      )}
    </div>
  );
}
