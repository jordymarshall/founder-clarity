import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CanvasSection {
  id: string;
  title: string;
  content: string;
}

export function InvestigationCanvas() {
  const [sections, setSections] = useState<CanvasSection[]>([
    {
      id: 'customer-segment',
      title: 'Customer Segment',
      content: 'Early-stage startup founders who struggle with product-market fit and waste time building features nobody wants.'
    },
    {
      id: 'problem',
      title: 'The Problem',
      content: 'Founders often build based on assumptions rather than validated customer problems, leading to failed products and wasted resources.'
    },
    {
      id: 'current-solutions',
      title: 'Current Solutions',
      content: 'Basic survey tools, expensive consultants, trial and error approach, or following generic startup advice from books.'
    },
    {
      id: 'hypothesis',
      title: 'Solution Hypothesis',
      content: 'An AI-powered coach that guides founders through systematic customer discovery with templates, analysis, and actionable insights.'
    }
  ]);

  const updateSection = (id: string, content: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, content } : section
    ));
  };

  const handleGenerateScript = () => {
    console.log('Generate interview script');
    // Navigate to Interview Script
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-page-title">Investigation Canvas</h1>
            <p className="text-foreground-secondary">Structure your idea for systematic validation</p>
          </div>

          {/* Canvas Sections */}
          <div className="max-w-3xl mx-auto space-y-6">
            {sections.map((section) => (
              <div key={section.id} className="space-y-3">
                <h3 className="text-subtle uppercase tracking-wide">{section.title}</h3>
                <Textarea
                  value={section.content}
                  onChange={(e) => updateSection(section.id, e.target.value)}
                  className="min-h-[100px] bg-card border-0 resize-none text-body leading-relaxed focus:ring-2 focus:ring-primary/20"
                  placeholder={`Describe the ${section.title.toLowerCase()}...`}
                />
              </div>
            ))}
          </div>

          {/* Generate Script CTA */}
          <div className="max-w-3xl mx-auto pt-8">
            <Button 
              onClick={handleGenerateScript}
              className="w-full py-3 text-base font-medium"
            >
              Generate Interview Script
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}