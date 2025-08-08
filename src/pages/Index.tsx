import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/app-layout';
import { IdeasHub } from '@/components/ideas-hub';
import { IdeaWorkflowLayout } from '@/components/idea-workflow-layout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState<'ideas' | 'workflow'>('ideas');
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const openIdeas = (_e: Event) => setCurrentView('ideas')
    window.addEventListener('open-ideas-hub', openIdeas)
    return () => window.removeEventListener('open-ideas-hub', openIdeas)
  }, [])
 
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleInvestigate = (idea: string) => {
    setSelectedIdea(idea);
    setCurrentView('workflow');
  };

  // Show loading or redirect while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header with sign out */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold">StartupDetective</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.email}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {currentView === 'ideas' && (
          <IdeasHub onInvestigate={handleInvestigate} />
        )}
        {currentView === 'workflow' && selectedIdea && (
          <IdeaWorkflowLayout 
            idea={selectedIdea} 
            onBack={() => setCurrentView('ideas')}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Index;
