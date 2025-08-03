import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommandMenu } from '@/components/ui/command-menu';
import { CoachPanel } from '@/components/ui/coach-panel';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [coachPanelOpen, setCoachPanelOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandMenuOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {children}
      
      {/* Coach Trigger */}
      <Button
        onClick={() => setCoachPanelOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-40"
        size="icon"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      {/* Command Menu */}
      <CommandMenu
        open={commandMenuOpen}
        onOpenChange={setCommandMenuOpen}
      />

      {/* Coach Panel */}
      <CoachPanel
        open={coachPanelOpen}
        onOpenChange={setCoachPanelOpen}
      />
    </div>
  );
}