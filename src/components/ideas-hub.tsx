import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Archive, Plus } from 'lucide-react';

interface Idea {
  id: string;
  text: string;
  createdAt: Date;
}

export function IdeasHub() {
  const [ideas, setIdeas] = useState<Idea[]>([
    { id: '1', text: 'AI-powered customer interview analysis tool', createdAt: new Date() },
    { id: '2', text: 'Subscription box for sustainable office supplies', createdAt: new Date() },
    { id: '3', text: 'Remote team building platform with VR integration', createdAt: new Date() },
  ]);
  const [newIdea, setNewIdea] = useState('');

  const handleAddIdea = () => {
    if (!newIdea.trim()) return;
    
    const idea: Idea = {
      id: Date.now().toString(),
      text: newIdea,
      createdAt: new Date()
    };
    
    setIdeas(prev => [idea, ...prev]);
    setNewIdea('');
  };

  const handleEnhanceIdea = (ideaId: string) => {
    console.log('Enhance idea:', ideaId);
    // Navigate to Investigation Canvas
  };

  const handleArchiveIdea = (ideaId: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== ideaId));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-page-title">Ideas Hub</h1>
            <p className="text-foreground-secondary">Capture and explore your startup ideas</p>
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

          {/* Ideas List */}
          <div className="max-w-2xl mx-auto space-y-3">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="group bg-card border border-border rounded px-4 py-3 hover:border-primary/30 transition-smooth"
              >
                <div className="flex items-center justify-between">
                  <span className="text-body flex-1">{idea.text}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEnhanceIdea(idea.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchiveIdea(idea.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {ideas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No ideas yet. Start by capturing your first idea above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}