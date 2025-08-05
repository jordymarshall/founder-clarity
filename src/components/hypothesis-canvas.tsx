import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Sparkles, RefreshCw, ChevronRight, Info, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulletPoint {
  text: string;
  rationale: string;
}

interface CanvasCard {
  id: string;
  title: string;
  content: BulletPoint[];
  additionalContent: BulletPoint[];
  aiGenerated: boolean;
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
  const [refinementInputs, setRefinementInputs] = useState<Record<string, string>>({});
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
          {
            text: 'Early-stage startup founders (pre-seed to Series A)',
            rationale: 'Highest engagement with validation content in YC forums (73% of posts)'
          },
          {
            text: 'Technical founders who struggle with customer discovery',
            rationale: 'Survey of 200+ founders shows 68% rate customer discovery as biggest weakness'
          }
        ],
        additionalContent: [
          {
            text: 'Solo founders or small teams (2-5 people) with limited resources',
            rationale: 'Resource constraints force need for efficient validation methods'
          },
          {
            text: 'B2B SaaS founders targeting SMB market',
            rationale: 'Market segment with highest validation-to-success correlation'
          }
        ],
        aiGenerated: true,
        dependsOn: []
      },
      {
        id: 'core-problem',
        title: 'Core Problem', 
        content: [
          {
            text: 'Building features based on assumptions rather than validated problems',
            rationale: 'Primary cause in 42% of startup failures according to CB Insights'
          },
          {
            text: 'Wasting limited runway on wrong priorities',
            rationale: 'Average startup burns 6 months before realizing product-market misfit'
          }
        ],
        additionalContent: [
          {
            text: 'Difficulty translating technical capabilities into customer value',
            rationale: 'Technical founders often focus on features rather than outcomes'
          },
          {
            text: 'Lack of systematic approach to customer discovery',
            rationale: 'Most founders use ad-hoc methods without structured methodology'
          }
        ],
        aiGenerated: true,
        dependsOn: ['customer-segment']
      },
      {
        id: 'existing-alternatives',
        title: 'Existing Alternatives',
        content: [
          {
            text: 'Basic survey tools (Google Forms, Typeform) for customer feedback',
            rationale: 'Used by 78% of early-stage startups but provides shallow insights'
          },
          {
            text: 'Expensive consultants ($5K-50K) for market research',
            rationale: 'High cost barrier excludes 89% of early-stage founders'
          }
        ],
        additionalContent: [
          {
            text: 'Trial and error with rapid prototyping and A/B testing',
            rationale: 'Resource-intensive approach with high failure rate'
          },
          {
            text: 'Generic startup advice from books and courses',
            rationale: 'Lacks personalization and actionable specificity'
          }
        ],
        aiGenerated: true,
        dependsOn: ['core-problem']
      },
      {
        id: 'job-to-be-done',
        title: 'Job to be Done',
        content: [
          {
            text: 'Quickly validate market demand before building',
            rationale: 'Time-to-validation is critical factor in startup success rates'
          },
          {
            text: 'Get actionable insights without expensive research',
            rationale: 'Cost-effectiveness enables iteration and learning cycles'
          }
        ],
        additionalContent: [
          {
            text: 'Build confidence for funding and team recruitment',
            rationale: 'Validation data increases investor confidence by 3.2x'
          },
          {
            text: 'Develop deep customer empathy for product decisions',
            rationale: 'Customer understanding drives product-market fit achievement'
          }
        ],
        aiGenerated: true,
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

  // Refinement function for individual cards
  const handleRefineCard = async (cardId: string) => {
    const refinementText = refinementInputs[cardId];
    if (!refinementText?.trim()) return;
    
    setIsGenerating(true);
    // Simulate refinement process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock refinement - in reality this would call AI with the refinement prompt
    const updatedCards = cards.map(card => 
      card.id === cardId ? { ...card, needsUpdate: false, aiGenerated: true } : card
    );
    
    setCards(updatedCards);
    onCardsChange?.(updatedCards);
    setRefinementInputs(prev => ({ ...prev, [cardId]: '' }));
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
  const handleCardEdit = (cardId: string, newContent: BulletPoint[]) => {
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

  const handleAddBulletPoint = (cardId: string) => {
    const updatedCards = cards.map(card => {
      if (card.id === cardId) {
        const newBulletPoint = { text: 'New insight...', rationale: 'Add your reasoning here...' };
        return { ...card, content: [...card.content, newBulletPoint] };
      }
      return card;
    });
    
    setCards(updatedCards);
    onCardsChange?.(updatedCards);
  };

  const handleRemoveBulletPoint = (cardId: string, bulletIndex: number) => {
    const updatedCards = cards.map(card => {
      if (card.id === cardId) {
        const newContent = card.content.filter((_, index) => index !== bulletIndex);
        return { ...card, content: newContent };
      }
      return card;
    });
    
    setCards(updatedCards);
    onCardsChange?.(updatedCards);
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
      // Ensure content is always in the new format for backwards compatibility
      const normalizedCards = persistedCards.map(card => ({
        ...card,
        content: Array.isArray(card.content) 
          ? card.content.map(item => 
              typeof item === 'string' 
                ? { text: item, rationale: 'Legacy data - add rationale' }
                : item
            )
          : [{ text: card.content as string, rationale: 'Legacy data - add rationale' }],
        additionalContent: card.additionalContent || []
      }));
      setCards(normalizedCards);
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
                      <div className="space-y-3">
                        {card.content.slice(0, 2).map((bulletPoint, pointIndex) => (
                          <div key={pointIndex} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center justify-center mt-0.5">
                              {pointIndex + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm leading-relaxed text-foreground">
                                {bulletPoint.text}
                              </p>
                            </div>
                          </div>
                        ))}
                        {card.content.length > 2 && (
                          <p className="text-xs text-muted-foreground ml-7">
                            +{card.content.length - 2} more insights...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Individual Rationale */}
                    <div className="space-y-3">
                      <h4 className="text-subtle uppercase tracking-wide text-sm font-medium">
                        Rationale
                      </h4>
                      <div className="space-y-3">
                        {card.content.slice(0, 2).map((bulletPoint, pointIndex) => (
                          <div key={pointIndex} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-5 h-5 bg-muted text-muted-foreground text-xs font-medium rounded-full flex items-center justify-center mt-0.5">
                              {pointIndex + 1}
                            </span>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {bulletPoint.rationale}
                            </p>
                          </div>
                        ))}
                      </div>
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
                <div className="pt-4 border-t space-y-6">
                  {/* Additional Insights (only show remaining ones) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground">Additional Insights</h4>
                      <Button 
                        onClick={() => handleAddBulletPoint(card.id)}
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Point
                      </Button>
                    </div>
                    
                    {/* Remaining Content (skip first 2) */}
                    {card.content.length > 2 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left - Additional Insights */}
                        <div className="space-y-3">
                          {card.content.slice(2).map((bulletPoint, pointIndex) => (
                            <div key={pointIndex + 2} className="flex items-start gap-2 group">
                              <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center justify-center mt-0.5">
                                {pointIndex + 3}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm leading-relaxed text-foreground">
                                  {bulletPoint.text}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleRemoveBulletPoint(card.id, pointIndex + 2)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {/* Right - Additional Rationale */}
                        <div className="space-y-3">
                          {card.content.slice(2).map((bulletPoint, pointIndex) => (
                            <div key={pointIndex + 2} className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-5 h-5 bg-muted text-muted-foreground text-xs font-medium rounded-full flex items-center justify-center mt-0.5">
                                {pointIndex + 3}
                              </span>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {bulletPoint.rationale}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Pre-researched Alternatives */}
                    {card.additionalContent.length > 0 && (
                      <div className="border-t pt-4">
                        <h5 className="text-sm font-medium text-foreground mb-3">Additional Alternatives</h5>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left - Alternative Insights */}
                          <div className="space-y-3">
                            {card.additionalContent.map((bulletPoint, pointIndex) => (
                              <div key={pointIndex} className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-muted text-muted-foreground text-xs font-medium rounded-full flex items-center justify-center mt-0.5">
                                  {card.content.length + pointIndex + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm leading-relaxed text-foreground">
                                    {bulletPoint.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Right - Alternative Rationale */}
                          <div className="space-y-3">
                            {card.additionalContent.map((bulletPoint, pointIndex) => (
                              <div key={pointIndex} className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-muted text-muted-foreground text-xs font-medium rounded-full flex items-center justify-center mt-0.5">
                                  {card.content.length + pointIndex + 1}
                                </span>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {bulletPoint.rationale}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Refinement Input for this card */}
                  <div className="border-t pt-4">
                    <h5 className="text-sm font-medium text-foreground mb-3">Refine This Section</h5>
                    <div className="flex gap-2">
                      <Input
                        value={refinementInputs[card.id] || ''}
                        onChange={(e) => setRefinementInputs(prev => ({ ...prev, [card.id]: e.target.value }))}
                        placeholder={`Refine ${card.title.toLowerCase()}...`}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleRefineCard(card.id);
                          }
                        }}
                      />
                      <Button 
                        onClick={() => handleRefineCard(card.id)}
                        disabled={!refinementInputs[card.id]?.trim() || isGenerating}
                        size="sm"
                      >
                        Refine
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Try: "Focus more on B2B customers" or "Add mobile app alternatives"
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

    </div>
  );
}
