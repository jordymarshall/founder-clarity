import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Sparkles, RefreshCw, ChevronRight, Plus, X, Database } from 'lucide-react';
import { CRMResearch } from '@/components/crm-research';
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
  const [showAnimation, setShowAnimation] = useState(true);
  const [refinementInput, setRefinementInput] = useState('');
  const [cards, setCards] = useState<CanvasCard[]>([]);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editingBullet, setEditingBullet] = useState<{ cardId: string; bulletIndex: number } | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const [expandedBullets, setExpandedBullets] = useState<string[]>([]);
  const [generatingPoints, setGeneratingPoints] = useState<string[]>([]);
  const [showResearch, setShowResearch] = useState<string[]>([]);
  const [refinementInputs, setRefinementInputs] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle bullet point expansion
  const toggleBullet = (cardId: string, bulletIndex: number) => {
    const bulletId = `${cardId}-${bulletIndex}`;
    setExpandedBullets(prev => 
      prev.includes(bulletId) 
        ? prev.filter(id => id !== bulletId)
        : [...prev, bulletId]
    );
  };

  // Toggle research panel
  const toggleResearch = (cardId: string) => {
    setShowResearch(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  // Handle adding evidence from CRM research
  const handleAddEvidence = (evidence: string, source: string, cardId: string) => {
    const newBulletPoint = { 
      text: evidence, 
      rationale: `Source: ${source} - Market research data supporting this insight`
    };
    
    const updatedCards = cards.map(card => {
      if (card.id === cardId) {
        return { ...card, content: [...card.content, newBulletPoint] };
      }
      return card;
    });
    
    setCards(updatedCards);
    onCardsChange?.(updatedCards);
  };

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
        additionalContent: [],
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
        additionalContent: [],
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
        additionalContent: [],
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
        additionalContent: [],
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

  // Continuous Discovery Input
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

  const handleGenerateBulletPoint = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    setGeneratingPoints(prev => [...prev, cardId]);

    try {
      const response = await fetch('/functions/v1/generate-hypothesis-point', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardTitle: card.title,
          existingPoints: card.content,
          idea: inputValue
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate point');
      }

      const { bulletPoint } = await response.json();

      const updatedCards = cards.map(c => {
        if (c.id === cardId) {
          return { ...c, content: [...c.content, bulletPoint] };
        }
        return c;
      });

      setCards(updatedCards);
      onCardsChange?.(updatedCards);
    } catch (error) {
      console.error('Error generating bullet point:', error);
      // Fallback to manual addition
      handleAddBulletPoint(cardId);
    } finally {
      setGeneratingPoints(prev => prev.filter(id => id !== cardId));
    }
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

  const handleBulletEdit = (cardId: string, bulletIndex: number, field: 'text' | 'rationale', value: string) => {
    const updatedCards = cards.map(card => {
      if (card.id === cardId) {
        const newContent = card.content.map((bullet, index) => 
          index === bulletIndex ? { ...bullet, [field]: value } : bullet
        );
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
    // Trigger cascade animation
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 1000);
    return () => clearTimeout(timer);
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
        additionalContent: []
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
          <h1 className="text-page-title">Hypothesis Canvas</h1>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-semibold">Hypothesis Canvas</h2>
          <p className="text-muted-foreground">Your idea, structured for validation</p>
          <p className="text-sm text-muted-foreground italic">"{inputValue}"</p>
        </div>

        {/* AI Research Status */}
        {isGenerating && (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Analyzing your idea... Searching for market signals...
            </div>
          </div>
        )}

        {/* Canvas Cards */}
        <div className="space-y-4">
          {cards.map((card, index) => (
            <Card 
              key={card.id}
              className={`transition-all duration-300 ${
                showAnimation ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              } ${card.needsUpdate ? 'ring-2 ring-yellow-500/20' : ''}`}
              style={{
                animationDelay: showAnimation ? `${index * 150}ms` : '0ms'
              }}
            >
              <Collapsible
                open={expandedCards.includes(card.id)}
                onOpenChange={() => toggleCard(card.id)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">
                          {index + 1}. {card.title}
                        </h3>
                        {card.needsUpdate && (
                          <RefreshCw className="h-4 w-4 text-yellow-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Key insights from analysis and research
                      </p>
                    </div>
                    <ChevronRight 
                      className={`h-5 w-5 transition-transform duration-200 ${
                        expandedCards.includes(card.id) ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="px-6 pb-6">
                  <div className="space-y-4 pt-4 border-t">
                    {/* Bullet Points */}
                    {card.content.map((bulletPoint, pointIndex) => {
                      const bulletId = `${card.id}-${pointIndex}`;
                      const isBulletExpanded = expandedBullets.includes(bulletId);
                      
                      return (
                        <div key={pointIndex} className="space-y-2">
                          <Collapsible
                            open={isBulletExpanded}
                            onOpenChange={() => toggleBullet(card.id, pointIndex)}
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex items-start gap-2 group cursor-pointer hover:bg-muted/30 rounded p-2 -m-2 transition-colors">
                                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center justify-center mt-0.5">
                                  {pointIndex + 1}
                                </span>
                                <div className="flex-1">
                                  {editingBullet?.cardId === card.id && editingBullet?.bulletIndex === pointIndex ? (
                                    <Textarea
                                      value={bulletPoint.text}
                                      onChange={(e) => handleBulletEdit(card.id, pointIndex, 'text', e.target.value)}
                                      onBlur={() => setEditingBullet(null)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          setEditingBullet(null);
                                        }
                                        if (e.key === 'Escape') {
                                          setEditingBullet(null);
                                        }
                                      }}
                                      className="min-h-[60px] text-sm"
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : (
                                    <p 
                                      className="text-sm leading-relaxed cursor-pointer hover:bg-muted/30 rounded p-1 -m-1 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingBullet({ cardId: card.id, bulletIndex: pointIndex });
                                      }}
                                    >
                                      {bulletPoint.text}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <ChevronRight 
                                    className={`h-4 w-4 transition-transform duration-200 ${
                                      isBulletExpanded ? 'rotate-90' : ''
                                    }`}
                                  />
                                  {card.content.length > 1 && (
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveBulletPoint(card.id, pointIndex);
                                      }}
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent className="ml-8 pb-2">
                              <div className="bg-muted/30 rounded-lg p-3 border-l-2 border-primary/20">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                  Rationale
                                </p>
                                {editingBullet?.cardId === card.id && editingBullet?.bulletIndex === pointIndex ? (
                                  <Textarea
                                    value={bulletPoint.rationale}
                                    onChange={(e) => handleBulletEdit(card.id, pointIndex, 'rationale', e.target.value)}
                                    onBlur={() => setEditingBullet(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        setEditingBullet(null);
                                      }
                                      if (e.key === 'Escape') {
                                        setEditingBullet(null);
                                      }
                                    }}
                                    className="min-h-[40px] text-xs bg-background"
                                    autoFocus
                                  />
                                ) : (
                                  <p 
                                    className="text-xs text-muted-foreground leading-relaxed cursor-pointer hover:text-foreground transition-colors"
                                    onClick={() => setEditingBullet({ cardId: card.id, bulletIndex: pointIndex })}
                                  >
                                    {bulletPoint.rationale}
                                  </p>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      );
                    })}

                    {/* Add Point & Research Buttons */}
                    <div className="pt-2 flex gap-2 flex-wrap">
                      <Button 
                        onClick={() => handleAddBulletPoint(card.id)}
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Point
                      </Button>
                      <Button 
                        onClick={() => handleGenerateBulletPoint(card.id)}
                        disabled={generatingPoints.includes(card.id)}
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs"
                      >
                        {generatingPoints.includes(card.id) ? (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3 mr-1" />
                        )}
                        {generatingPoints.includes(card.id) ? 'Generating...' : 'Generate Point'}
                      </Button>
                    </div>

                    {/* CRM Research Panel */}
                    {showResearch.includes(card.id) && (
                      <div className="border-t pt-4 mt-4">
                        <CRMResearch 
                          onAddEvidence={(evidence, source) => handleAddEvidence(evidence, source, card.id)}
                        />
                      </div>
                    )}

                    {/* Refinement Input */}
                    <div className="border-t pt-4">
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
                        {card.id === 'customer-segment' && 'Try: "Focus on B2B vs B2C" or "Add demographic details like company size"'}
                        {card.id === 'core-problem' && 'Try: "Explore emotional pain points" or "Add urgency and frequency details"'}
                        {card.id === 'existing-alternatives' && 'Try: "Include DIY solutions" or "Research competitor pricing models"'}
                        {card.id === 'job-to-be-done' && 'Try: "Define success metrics" or "Explore social/emotional outcomes"'}
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Global Continuous Discovery */}
        {cards.length > 0 && (
          <div className="mt-8">
            <Card className="p-6">
              <h3 className="font-medium mb-3">Global Refinement</h3>
              <div className="flex gap-2">
                <Input
                  value={refinementInput}
                  onChange={(e) => setRefinementInput(e.target.value)}
                  placeholder="Refine entire canvas or add cross-cutting insights..."
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
                  Refine All
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Try: "Focus the entire analysis on university students" or "Consider sustainability as a key factor"
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}