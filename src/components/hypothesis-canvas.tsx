import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasCard {
  id: string;
  title: string;
  content: string;
  aiGenerated: boolean;
  reasoning?: string;
  dependsOn?: string[];
  needsUpdate?: boolean;
}

interface HypothesisCanvasProps {
  idea: string;
  isInitialized?: boolean;
  onInitialized?: () => void;
}

export function HypothesisCanvas({ idea, isInitialized = false, onInitialized }: HypothesisCanvasProps) {
  // All state declarations together
  const [inputValue, setInputValue] = useState(idea || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCanvas, setShowCanvas] = useState(isInitialized);
  const [refinementInput, setRefinementInput] = useState('');
  const [cards, setCards] = useState<CanvasCard[]>([]);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock AI analysis function
  const mockAnalyzeIdea = async (ideaText: string): Promise<CanvasCard[]> => {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return [
      {
        id: 'customer-segment',
        title: 'Customer Segment',
        content: 'Early-stage startup founders who struggle with product-market fit and waste time building features nobody wants.',
        aiGenerated: true,
        reasoning: 'Based on analysis of 500+ startup forums and YC posts, this segment shows highest engagement with validation-related content.',
        dependsOn: []
      },
      {
        id: 'core-problem',
        title: 'Core Problem', 
        content: 'Founders often build based on assumptions rather than validated customer problems, leading to failed products and wasted resources.',
        aiGenerated: true,
        reasoning: 'Primary pain point mentioned in 73% of startup failure post-mortems. Strong correlation with lack of customer validation.',
        dependsOn: ['customer-segment']
      },
      {
        id: 'existing-alternatives',
        title: 'Existing Alternatives',
        content: 'Basic survey tools, expensive consultants, trial and error approach, or following generic startup advice from books.',
        aiGenerated: true,
        reasoning: 'Most common solutions mentioned in 200+ founder interviews. None provide systematic approach with AI guidance.',
        dependsOn: ['core-problem']
      },
      {
        id: 'job-to-be-done',
        title: 'Job to be Done',
        content: 'When founders have a business idea, they want to quickly validate if there\'s a real market need before investing time and money in building.',
        aiGenerated: true,
        reasoning: 'Core JTBD extracted from Jobs-to-be-Done theory applied to early-stage validation process.',
        dependsOn: ['customer-segment', 'core-problem', 'existing-alternatives']
      }
    ];
  };

  // Canvas generation function
  const handleGenerateCanvas = async (ideaText: string) => {
    setIsGenerating(true);
    setShowCanvas(true);
    
    try {
      const generatedCards = await mockAnalyzeIdea(ideaText);
      
      // Animate cards appearing one by one
      for (let i = 0; i < generatedCards.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setCards(prev => [...prev, generatedCards[i]]);
      }
    } catch (error) {
      console.error('Error generating canvas:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Refinement function
  const handleRefineCanvas = async () => {
    if (!refinementInput.trim()) return;
    
    setIsGenerating(true);
    // Simulate refinement process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock refinement - in reality this would call AI with the refinement prompt
    setCards(prev => prev.map(card => ({
      ...card,
      needsUpdate: false,
      aiGenerated: true
    })));
    
    setRefinementInput('');
    setIsGenerating(false);
  };

  // Card editing functions
  const handleCardEdit = (cardId: string, newContent: string) => {
    setCards(prev => prev.map(card => {
      if (card.id === cardId) {
        // Mark dependent cards as needing updates
        const updatedCards = prev.map(c => ({
          ...c,
          needsUpdate: card.dependsOn?.includes(cardId) || c.dependsOn?.includes(cardId)
        }));
        
        return { ...card, content: newContent, aiGenerated: false };
      }
      return card;
    }));
    setEditingCard(null);
  };

  const handleUpdateDependentCard = async (cardId: string) => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, needsUpdate: false, aiGenerated: true } : card
    ));
    
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
    if (idea && !isInitialized) {
      handleGenerateCanvas(idea);
      onInitialized?.();
    }
  }, [idea, isInitialized, onInitialized]);

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

      {/* Canvas Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
              {cards.map((card, index) => (
                <CanvasCard
                  key={card.id}
                  card={card}
                  index={index}
                  isEditing={editingCard === card.id}
                  onEdit={() => setEditingCard(card.id)}
                  onSave={(content) => handleCardEdit(card.id, content)}
                  onCancel={() => setEditingCard(null)}
                  onUpdateDependent={() => handleUpdateDependentCard(card.id)}
                />
              ))}
        </div>
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

// Canvas Card Component
interface CanvasCardProps {
  card: CanvasCard;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (content: string) => void;
  onCancel: () => void;
  onUpdateDependent: () => void;
}

function CanvasCard({ card, index, isEditing, onEdit, onSave, onCancel, onUpdateDependent }: CanvasCardProps) {
  const [editContent, setEditContent] = useState(card.content);

  useEffect(() => {
    setEditContent(card.content);
  }, [card.content]);

  const handleSave = () => {
    onSave(editContent);
  };

  return (
    <div 
      className={cn(
        "relative p-6 bg-card border border-border rounded-lg transition-all duration-300",
        "animate-fade-in",
        card.needsUpdate && "ring-2 ring-yellow-500/20"
      )}
      style={{ 
        animationDelay: `${index * 150}ms`,
        animationFillMode: 'both'
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-subtle uppercase tracking-wide">{card.title}</h3>
          <div className="flex items-center gap-2">
            {card.aiGenerated && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <p className="font-medium text-sm">AI Reasoning</p>
                    <p className="text-xs text-muted-foreground">{card.reasoning}</p>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            {card.needsUpdate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onUpdateDependent}
                className="p-1 h-auto"
              >
                <RefreshCw className="h-4 w-4 text-yellow-500 animate-pulse" />
              </Button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[100px] bg-background border-primary/20 focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div 
            className="text-body leading-relaxed cursor-pointer hover:bg-muted/30 rounded p-2 -m-2 transition-colors"
            onClick={onEdit}
          >
            {card.content}
          </div>
        )}
      </div>
    </div>
  );
}