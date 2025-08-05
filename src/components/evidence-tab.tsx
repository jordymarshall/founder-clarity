import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CRMResearch } from '@/components/crm-research';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Target, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar,
  CheckCircle,
  Clock,
  X,
  ExternalLink,
  MessageSquare,
  Search
} from 'lucide-react';

interface IdealCandidate {
  id: string;
  segment: string;
  characteristics: string[];
  recentExperience: string;
}

interface OutreachStrategy {
  method: string;
  approach: string;
  learningFrame: string;
}

interface Interview {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  linkedin?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledDate?: Date;
  notes: string;
  source: string;
  candidateMatch: string;
}

interface EvidenceTabProps {
  idea: string;
}

export function EvidenceTab({ idea }: EvidenceTabProps) {
  const [candidates, setCandidates] = useState<IdealCandidate[]>([
    {
      id: '1',
      segment: 'Early-stage startup founders (pre-seed to Series A)',
      characteristics: ['First-time founder', 'Tech background', '2-10 employees', 'Building MVP'],
      recentExperience: 'Struggled with customer discovery in past 6 months'
    }
  ]);
  
  const [outreachStrategy, setOutreachStrategy] = useState<OutreachStrategy>({
    method: 'LinkedIn outreach + founder communities',
    approach: 'Value-first conversation, not sales pitch',
    learningFrame: 'Help validate industry challenges while learning from their experience'
  });
  
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [showResearch, setShowResearch] = useState(false);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<IdealCandidate | null>(null);
  const { toast } = useToast();

  const handleAddCandidate = (candidateData: Omit<IdealCandidate, 'id'>) => {
    const newCandidate = { ...candidateData, id: Date.now().toString() };
    setCandidates([...candidates, newCandidate]);
    setIsAddingCandidate(false);
    toast({
      title: "Candidate Profile Added",
      description: "New ideal candidate profile has been created",
    });
  };

  const handleAddResearchLead = (evidence: string, source: string) => {
    // Parse research data to create an interview candidate
    const leadData = parseResearchData(evidence, source);
    if (leadData) {
      const newInterview: Interview = {
        ...leadData,
        id: Date.now().toString(),
        status: 'scheduled',
        notes: `Added from research: ${evidence}`,
        candidateMatch: candidates[0]?.id || ''
      };
      setInterviews([...interviews, newInterview]);
      toast({
        title: "Interview Candidate Added",
        description: "Lead has been added to your interview schedule",
      });
    }
  };

  const parseResearchData = (evidence: string, source: string) => {
    // Simple parsing - in real implementation this would be more sophisticated
    const parts = evidence.split(' - ');
    if (parts.length >= 2) {
      const [name, titleCompany] = parts;
      const [title, company] = titleCompany.split(' at ');
      
      return {
        name: name || 'Unknown',
        company: company || 'Unknown Company',
        title: title || 'Unknown Title',
        email: source.includes('@') ? source.split(' - ')[1] : '',
        source: source
      };
    }
    return null;
  };

  const updateInterviewStatus = (interviewId: string, status: Interview['status']) => {
    setInterviews(interviews.map(interview => 
      interview.id === interviewId 
        ? { ...interview, status }
        : interview
    ));
  };

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const CandidateForm = ({ candidate, onSave, onCancel }: {
    candidate?: IdealCandidate;
    onSave: (candidate: Omit<IdealCandidate, 'id'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      segment: candidate?.segment || '',
      characteristics: candidate?.characteristics || [''],
      recentExperience: candidate?.recentExperience || ''
    });

    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Customer Segment</label>
          <Input
            placeholder="e.g., Early-stage startup founders (pre-seed to Series A)"
            value={formData.segment}
            onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Key Characteristics</label>
          {formData.characteristics.map((char, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                placeholder="e.g., First-time founder"
                value={char}
                onChange={(e) => {
                  const newChars = [...formData.characteristics];
                  newChars[index] = e.target.value;
                  setFormData({ ...formData, characteristics: newChars });
                }}
              />
              {formData.characteristics.length > 1 && (
                <Button
                  onClick={() => {
                    const newChars = formData.characteristics.filter((_, i) => i !== index);
                    setFormData({ ...formData, characteristics: newChars });
                  }}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            onClick={() => setFormData({ 
              ...formData, 
              characteristics: [...formData.characteristics, ''] 
            })}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Characteristic
          </Button>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Recent Relevant Experience</label>
          <Textarea
            placeholder="What recent experience makes them perfect to interview?"
            value={formData.recentExperience}
            onChange={(e) => setFormData({ ...formData, recentExperience: e.target.value })}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onSave(formData)} disabled={!formData.segment || !formData.recentExperience}>
            Save Profile
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Module 2: The Search for Evidence</h2>
        <p className="text-muted-foreground">
          Find and connect with your target customers
        </p>
      </div>

      {/* Candidate Identification */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Candidate Identification</h3>
          <Dialog open={isAddingCandidate} onOpenChange={setIsAddingCandidate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Ideal Candidate Profile</DialogTitle>
              </DialogHeader>
              <CandidateForm
                onSave={handleAddCandidate}
                onCancel={() => setIsAddingCandidate(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <p className="text-muted-foreground mb-6">
          [List potential interviewees who match your customer segment and have recent relevant experience]
        </p>

        <div className="space-y-4">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="border rounded-lg p-4 bg-muted/20">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium">{candidate.segment}</h4>
                <Button size="sm" variant="outline">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Characteristics:</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.characteristics.map((char, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {char}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Recent Experience:</p>
                  <p className="text-sm">{candidate.recentExperience}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Outreach Strategy */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Outreach Strategy</h3>
        <p className="text-muted-foreground mb-6">
          [How will you reach out? What's your learning frame approach?]
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Outreach Method</label>
            <Textarea
              value={outreachStrategy.method}
              onChange={(e) => setOutreachStrategy({ ...outreachStrategy, method: e.target.value })}
              placeholder="How will you find and contact these people?"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Approach</label>
            <Textarea
              value={outreachStrategy.approach}
              onChange={(e) => setOutreachStrategy({ ...outreachStrategy, approach: e.target.value })}
              placeholder="What's your conversation approach?"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Learning Frame</label>
            <Textarea
              value={outreachStrategy.learningFrame}
              onChange={(e) => setOutreachStrategy({ ...outreachStrategy, learningFrame: e.target.value })}
              placeholder="How will you frame the conversation to learn rather than sell?"
            />
          </div>
          
          <Button onClick={() => toast({ title: "Strategy Updated", description: "Outreach strategy has been saved" })}>
            Save Strategy
          </Button>
        </div>
      </Card>

      {/* Interview Schedule */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Interview Schedule</h3>
          <Button onClick={() => setShowResearch(!showResearch)}>
            <Search className="h-4 w-4 mr-2" />
            Find Candidates
          </Button>
        </div>
        
        <p className="text-muted-foreground mb-6">
          [Track your scheduled interviews and their status]
        </p>

        {/* Research Panel */}
        {showResearch && (
          <div className="border rounded-lg p-4 mb-6 bg-muted/10">
            <h4 className="font-medium mb-4">Research & Discovery</h4>
            <CRMResearch onAddEvidence={handleAddResearchLead} />
          </div>
        )}

        <div className="space-y-4">
          {interviews.map((interview) => (
            <div key={interview.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">{interview.name}</h4>
                  <p className="text-sm text-muted-foreground">{interview.title} at {interview.company}</p>
                  <Badge className={`mt-1 ${getStatusColor(interview.status)}`}>
                    {interview.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Select value={interview.status} onValueChange={(value: any) => updateInterviewStatus(interview.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                {interview.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{interview.email}</span>
                  </div>
                )}
                {interview.linkedin && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <a href={interview.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Source: {interview.source}
                </div>
                {interview.notes && (
                  <div className="text-sm bg-muted/20 rounded p-2 mt-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Notes</p>
                    {interview.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
          {interviews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No interviews scheduled yet. Use the research tool to find potential candidates.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}