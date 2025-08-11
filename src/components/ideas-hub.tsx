import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Archive, Plus } from 'lucide-react';
import { useIdeas } from '@/hooks/use-ideas';

interface IdeasHubProps {
  onInvestigate?: (idea: string) => void;
}

export function IdeasHub({ onInvestigate }: IdeasHubProps) {
  const { ideas, addIdea, removeIdea } = useIdeas();
  const [newIdea, setNewIdea] = useState('');

  const handleAddIdea = () => {
    if (!newIdea.trim()) return;
    const idea = addIdea(newIdea);
    setNewIdea('');
  };

  const handleEnhanceIdea = (ideaId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (idea && onInvestigate) {
      onInvestigate(idea.text);
    }
  };

  const handleArchiveIdea = (ideaId: string) => {
    removeIdea(ideaId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-page-title">New Idea</h1>
            <p className="text-foreground-secondary">Capture a new startup idea to start a workflow</p>
          </div>

          {/* New Idea Input */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                placeholder="Capture an idea..."
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddIdea()}
                className="pr-12 py-4 text-lg bg-card border-border focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              <Button
                onClick={handleAddIdea}
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tip */}
          <div className="max-w-2xl mx-auto text-center text-sm text-muted-foreground">
            Press Enter to add and then pick it from the left sidebar to continue.
          </div>
        </div>
      </div>
    </div>
  );
}