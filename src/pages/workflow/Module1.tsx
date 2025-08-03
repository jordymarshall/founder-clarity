import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CanvasSection {
  id: string;
  title: string;
  content: string;
  placeholder: string;
}

export default function Module1() {
  const navigate = useNavigate();
  
  const [sections, setSections] = useState<CanvasSection[]>([
    {
      id: 'customer-segment',
      title: 'Customer Segment',
      content: '',
      placeholder: 'Who do you think has this problem? (e.g., "Small business owners", "College students")'
    },
    {
      id: 'early-adopter-segment',
      title: 'Early Adopter Segment',
      content: '',
      placeholder: 'Which specific subset feels the pain most intensely? (e.g., "Bootstrapped SaaS founders in their first year")'
    },
    {
      id: 'problem',
      title: 'Problem',
      content: '',
      placeholder: 'What are the top 1-3 obstacles preventing them from getting results they want?'
    },
    {
      id: 'existing-alternative',
      title: 'Existing Alternative',
      content: '',
      placeholder: 'What are they currently doing to solve this problem? (Never "nothing" - could be a competitor, spreadsheet, manual process)'
    },
    {
      id: 'jtbd',
      title: 'Hypothesized Job to be Done',
      content: '',
      placeholder: 'What underlying progress is the customer trying to make? Use the "leveling up" process - ask "why" repeatedly.'
    }
  ]);

  const updateSection = (id: string, content: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, content } : section
    ));
  };

  const completedSections = sections.filter(section => section.content.trim()).length;
  const isComplete = completedSections === sections.length;

  const handleNext = () => {
    navigate('/workflow/module2');
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Module 1</Badge>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Deconstructing Your Idea into Testable Beliefs</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Translate the idea in your head into clear, external, and testable beliefs. This is your Plan A.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Progress: {completedSections}/{sections.length} sections completed
            </div>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSections / sections.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lean Canvas Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription>
                  {section.id === 'customer-segment' && "The broad group of people or businesses you believe have the problem."}
                  {section.id === 'early-adopter-segment' && "The specific subset that feels the problem most intensely and is already trying to solve it."}
                  {section.id === 'problem' && "The real-world obstacles that stop them from achieving their desired outcome."}
                  {section.id === 'existing-alternative' && "Evidence that your problem might be real - what they're doing now to solve it."}
                  {section.id === 'jtbd' && "The bigger context - the real underlying progress the customer is trying to make."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={section.content}
                  onChange={(e) => updateSection(section.id, e.target.value)}
                  placeholder={section.placeholder}
                  className="min-h-[100px] resize-none"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Next Button */}
        <div className="flex justify-end pt-6">
          <Button 
            onClick={handleNext}
            disabled={!isComplete}
            className="flex items-center gap-2"
          >
            Continue to Module 2: Finding Evidence
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}