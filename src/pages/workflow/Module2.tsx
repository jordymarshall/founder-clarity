import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, ArrowLeft, Users, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Candidate {
  id: string;
  name: string;
  company: string;
  contact: string;
  recentActivity: string;
  notes: string;
}

export default function Module2() {
  const navigate = useNavigate();
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchCriteria, setSearchCriteria] = useState('');
  const [outreachTemplate, setOutreachTemplate] = useState(`Subject: Research on [industry/domain]

Hi [Name],

[Referral/connection mention if applicable]. I'm currently doing research to understand the real-world process that [customer segment] use for [hypothesized JTBD]. My goal is simply to learn from people with firsthand experience. 

This is not a sales pitch. Would you be open to a 30-minute chat to share your perspective? As a small thank you for your time, I'd be happy to offer a $50 gift card of your choice.

Best regards,
[Your name]`);

  const addCandidate = () => {
    const newCandidate: Candidate = {
      id: Date.now().toString(),
      name: '',
      company: '',
      contact: '',
      recentActivity: '',
      notes: ''
    };
    setCandidates([...candidates, newCandidate]);
  };

  const updateCandidate = (id: string, field: keyof Candidate, value: string) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === id ? { ...candidate, [field]: value } : candidate
    ));
  };

  const removeCandidate = (id: string) => {
    setCandidates(prev => prev.filter(candidate => candidate.id !== id));
  };

  const isComplete = candidates.length >= 3 && candidates.some(c => c.name && c.contact);

  const handleNext = () => {
    navigate('/workflow/module3');
  };

  const handleBack = () => {
    navigate('/workflow/module1');
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Module 2</Badge>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">The Search for Evidence - Prospecting</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Identify and schedule conversations with people who are living embodiments of your customer segment.
            </p>
          </div>
        </div>

        {/* Search Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Define Your Search Criteria</CardTitle>
            <CardDescription>
              Filter: "People who match my broader Customer Segment and have recently invested time, money, or effort into an Existing Alternative to accomplish the Hypothesized JTBD."
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={searchCriteria}
              onChange={(e) => setSearchCriteria(e.target.value)}
              placeholder="Example: Coffee shop owners who have posted on social media in the last 3 months, shown signs of marketing activity, or recently hired freelancers..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Candidate List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Potential Candidates</CardTitle>
              <CardDescription>
                Build a list of 10-20 people who have recent, relevant, and real stories to tell. Focus on those who took action in the last 90 days.
              </CardDescription>
            </div>
            <Button onClick={addCandidate} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {candidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No candidates added yet. Click "Add Candidate" to start building your list.
                </div>
              ) : (
                candidates.map((candidate) => (
                  <div key={candidate.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Candidate #{candidates.indexOf(candidate) + 1}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCandidate(candidate.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          value={candidate.name}
                          onChange={(e) => updateCandidate(candidate.id, 'name', e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Company/Title</label>
                        <Input
                          value={candidate.company}
                          onChange={(e) => updateCandidate(candidate.id, 'company', e.target.value)}
                          placeholder="Company or role"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Contact Info</label>
                        <Input
                          value={candidate.contact}
                          onChange={(e) => updateCandidate(candidate.id, 'contact', e.target.value)}
                          placeholder="Email or LinkedIn"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Recent Activity</label>
                        <Input
                          value={candidate.recentActivity}
                          onChange={(e) => updateCandidate(candidate.id, 'recentActivity', e.target.value)}
                          placeholder="What they did recently (last 90 days)"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <Textarea
                        value={candidate.notes}
                        onChange={(e) => updateCandidate(candidate.id, 'notes', e.target.value)}
                        placeholder="Additional context, mutual connections, etc."
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Outreach Template */}
        <Card>
          <CardHeader>
            <CardTitle>Outreach Template</CardTitle>
            <CardDescription>
              Use the Learning Frame to signal you're there to learn, not sell. Customize this template for your outreach.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={outreachTemplate}
              onChange={(e) => setOutreachTemplate(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Module 1
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!isComplete}
            className="flex items-center gap-2"
          >
            Continue to Module 3: Problem Discovery
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}