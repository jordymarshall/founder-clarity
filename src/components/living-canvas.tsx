import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Sparkles, Check, X } from 'lucide-react';

interface CanvasField {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  connections: string[];
  position: { x: number; y: number };
  width: 'full' | 'half' | 'third';
}

interface CoherenceEngine {
  triggerField: string;
  suggestedField: string;
  suggestion: string;
  reasoning: string;
}

interface LivingCanvasProps {
  idea: string;
  onBack?: () => void;
}

export function LivingCanvas({ idea, onBack }: LivingCanvasProps) {
  const [animationStage, setAnimationStage] = useState(0);
  const [coherenceSuggestions, setCoherenceSuggestions] = useState<CoherenceEngine[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  const [fields, setFields] = useState<CanvasField[]>([
    {
      id: 'customerSegment',
      label: 'Broad Customer Segment',
      value: 'Coffee shop owners',
      placeholder: 'Who is your target customer?',
      connections: ['earlyAdopter'],
      position: { x: 0, y: 0 },
      width: 'half'
    },
    {
      id: 'earlyAdopter',
      label: 'Early Adopter Segment',
      value: 'Coffee shop owners 1-3 years in business',
      placeholder: 'Who specifically will try this first?',
      connections: ['coreProblem'],
      position: { x: 0, y: 1 },
      width: 'half'
    },
    {
      id: 'coreProblem',
      label: 'Core Problem',
      value: 'Low foot traffic during weekdays',
      placeholder: 'What problem do they struggle with?',
      connections: ['existingAlternatives', 'jtbd'],
      position: { x: 1, y: 0 },
      width: 'half'
    },
    {
      id: 'existingAlternatives',
      label: 'Existing Alternatives',
      value: 'Social media posts, local newspaper ads, community events',
      placeholder: 'How do they solve this today?',
      connections: ['jtbd'],
      position: { x: 1, y: 1 },
      width: 'half'
    },
    {
      id: 'jtbd',
      label: 'Job to be Done (JTBD)',
      value: 'Attracting new customers to grow the business during slow periods',
      placeholder: 'What outcome do they want to achieve?',
      connections: [],
      position: { x: 0, y: 2 },
      width: 'full'
    }
  ]);

  // Narrative Cascade Animation
  useEffect(() => {
    const animationSequence = [
      { delay: 0, fieldIds: ['customerSegment'] },
      { delay: 800, fieldIds: ['earlyAdopter'] },
      { delay: 1600, fieldIds: ['coreProblem'] },
      { delay: 2400, fieldIds: ['existingAlternatives'] },
      { delay: 3200, fieldIds: ['jtbd'] }
    ];

    animationSequence.forEach(({ delay, fieldIds }, index) => {
      setTimeout(() => {
        setAnimationStage(index + 1);
      }, delay);
    });
  }, []);

  const updateField = (fieldId: string, value: string) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, value } : field
    ));

    // Trigger coherence engine
    generateCoherenceSuggestions(fieldId, value);
  };

  const generateCoherenceSuggestions = (triggeredFieldId: string, newValue: string) => {
    const suggestions: CoherenceEngine[] = [];

    // Define coherence rules
    const coherenceRules: Record<string, (value: string) => CoherenceEngine[]> = {
      coreProblem: (value) => {
        const suggestions: CoherenceEngine[] = [];
        
        if (value.toLowerCase().includes('cost') || value.toLowerCase().includes('expensive')) {
          suggestions.push({
            triggerField: 'coreProblem',
            suggestedField: 'existingAlternatives',
            suggestion: 'Sourcing from cheaper suppliers, joining buying co-ops, reducing portion sizes',
            reasoning: 'Since the problem is cost-related, alternatives should focus on cost reduction strategies.'
          });
          suggestions.push({
            triggerField: 'coreProblem',
            suggestedField: 'jtbd',
            suggestion: 'Reducing operational costs while maintaining quality to improve profit margins',
            reasoning: 'Cost problems typically drive jobs around efficiency and margin improvement.'
          });
        }

        if (value.toLowerCase().includes('traffic') || value.toLowerCase().includes('customers')) {
          suggestions.push({
            triggerField: 'coreProblem',
            suggestedField: 'existingAlternatives',
            suggestion: 'Social media marketing, local partnerships, loyalty programs, community events',
            reasoning: 'Customer acquisition problems typically involve marketing and community engagement solutions.'
          });
        }

        return suggestions;
      },

      customerSegment: (value) => {
        const suggestions: CoherenceEngine[] = [];
        
        if (value.toLowerCase().includes('restaurant') || value.toLowerCase().includes('food')) {
          suggestions.push({
            triggerField: 'customerSegment',
            suggestedField: 'coreProblem',
            suggestion: 'High food costs and thin profit margins',
            reasoning: 'Restaurant owners typically struggle with cost management and profitability.'
          });
        }

        return suggestions;
      },

      existingAlternatives: (value) => {
        const suggestions: CoherenceEngine[] = [];
        
        if (value.toLowerCase().includes('digital') || value.toLowerCase().includes('online')) {
          suggestions.push({
            triggerField: 'existingAlternatives',
            suggestedField: 'jtbd',
            suggestion: 'Increasing online visibility and digital customer engagement',
            reasoning: 'Digital alternatives suggest the job involves online presence and digital marketing.'
          });
        }

        return suggestions;
      }
    };

    const rule = coherenceRules[triggeredFieldId];
    if (rule) {
      const newSuggestions = rule(newValue);
      setCoherenceSuggestions(prev => [
        ...prev.filter(s => s.triggerField !== triggeredFieldId),
        ...newSuggestions
      ]);
    }
  };

  const applySuggestion = (suggestion: CoherenceEngine) => {
    updateField(suggestion.suggestedField, suggestion.suggestion);
    setCoherenceSuggestions(prev => prev.filter(s => 
      s.suggestedField !== suggestion.suggestedField || s.triggerField !== suggestion.triggerField
    ));
    setActiveSuggestion(null);
  };

  const dismissSuggestion = (suggestion: CoherenceEngine) => {
    setCoherenceSuggestions(prev => prev.filter(s => 
      s.suggestedField !== suggestion.suggestedField || s.triggerField !== suggestion.triggerField
    ));
    setActiveSuggestion(null);
  };

  const getFieldsByStage = (stage: number) => {
    const stageFieldIds = [
      [], // 0
      ['customerSegment'], // 1
      ['customerSegment', 'earlyAdopter'], // 2
      ['customerSegment', 'earlyAdopter', 'coreProblem'], // 3
      ['customerSegment', 'earlyAdopter', 'coreProblem', 'existingAlternatives'], // 4
      ['customerSegment', 'earlyAdopter', 'coreProblem', 'existingAlternatives', 'jtbd'] // 5
    ];
    
    return fields.filter(field => stageFieldIds[stage]?.includes(field.id));
  };

  const getConnectionPath = (fromId: string, toId: string) => {
    const fromField = fields.find(f => f.id === fromId);
    const toField = fields.find(f => f.id === toId);
    
    if (!fromField || !toField) return '';
    
    const fromX = fromField.position.x * 400 + 200;
    const fromY = fromField.position.y * 200 + 100;
    const toX = toField.position.x * 400 + 200;
    const toY = toField.position.y * 200 + 50;
    
    return `M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${fromY + 50} ${toX} ${toY}`;
  };

  const visibleFields = getFieldsByStage(animationStage);

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
            <h1 className="text-page-title">Living Canvas</h1>
            <p className="text-foreground-secondary">Watch your idea unfold into a coherent business model.</p>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative bg-card rounded-lg border p-8 min-h-[600px]">
          {/* SVG Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {visibleFields.map(field => 
              field.connections.map(connectionId => {
                const targetField = fields.find(f => f.id === connectionId);
                const isTargetVisible = visibleFields.some(f => f.id === connectionId);
                
                if (!targetField || !isTargetVisible) return null;
                
                return (
                  <path
                    key={`${field.id}-${connectionId}`}
                    d={getConnectionPath(field.id, connectionId)}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${animationStage * 200}ms`,
                      opacity: 0.4
                    }}
                  />
                );
              })
            )}
          </svg>

          {/* Canvas Fields */}
          <div className="relative grid grid-cols-2 gap-6" style={{ zIndex: 2 }}>
            {visibleFields.map(field => {
              const hasSuggestion = coherenceSuggestions.some(s => s.suggestedField === field.id);
              
              return (
                <div
                  key={field.id}
                  className={`animate-fade-in ${field.width === 'full' ? 'col-span-2' : ''}`}
                  style={{
                    gridColumn: field.position.x === 0 ? '1' : '2',
                    gridRow: field.position.y + 1,
                    ...(field.width === 'full' && { gridColumn: '1 / -1' })
                  }}
                >
                  <Card className="relative transition-all duration-300 hover:shadow-lg">
                    {hasSuggestion && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <Popover 
                          open={activeSuggestion === field.id}
                          onOpenChange={(open) => setActiveSuggestion(open ? field.id : null)}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              size="sm"
                              className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 animate-pulse"
                            >
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80" align="end">
                            {coherenceSuggestions
                              .filter(s => s.suggestedField === field.id)
                              .map((suggestion, index) => (
                                <div key={index} className="space-y-3">
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium">Coherence Suggestion</p>
                                    <p className="text-sm text-muted-foreground">
                                      {suggestion.reasoning}
                                    </p>
                                    <div className="bg-muted rounded p-3">
                                      <p className="text-sm font-medium">Suggested update:</p>
                                      <p className="text-sm mt-1">{suggestion.suggestion}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => applySuggestion(suggestion)}
                                      className="flex-1"
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      Update
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => dismissSuggestion(suggestion)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            }
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{field.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {field.id === 'jtbd' ? (
                        <Textarea
                          value={field.value}
                          onChange={(e) => updateField(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="min-h-[80px] resize-none"
                        />
                      ) : (
                        <Input
                          value={field.value}
                          onChange={(e) => updateField(field.id, e.target.value)}
                          placeholder={field.placeholder}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Loading State for Initial Animation */}
          {animationStage === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="animate-pulse">
                  <Sparkles className="h-8 w-8 mx-auto text-primary" />
                </div>
                <p className="text-muted-foreground">Building your living canvas...</p>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Legend */}
        <div className="mt-6 bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-primary opacity-40" style={{ borderTop: '2px dashed' }}></div>
              <span>Logical connections</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI coherence suggestions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}