import React, { useState, useEffect } from 'react';
import { HelpCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommandMenu } from '@/components/ui/command-menu';
import { CoachPanel } from '@/components/ui/coach-panel';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-sidebar">
        <AppSidebar />
        
        <SidebarInset className="flex-1 p-4">
          <div className="bg-background rounded-lg shadow-sm border min-h-full flex flex-col">
            {/* Top Header */}
            <header className="h-12 flex items-center border-b border-border px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-30 rounded-t-lg">
              <SidebarTrigger className="mr-2" />
              <div className="flex-1" />
              <Button
                onClick={() => setCommandMenuOpen(true)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                ⌘K
              </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </SidebarInset>
        
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
    </SidebarProvider>
  );
}