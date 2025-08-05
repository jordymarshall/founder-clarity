import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ExternalLink
} from 'lucide-react';

interface IdealCandidate {
  id: string;
  title: string;
  description: string;
  characteristics: string[];
  outreachStrategy: string;
  priority: 'high' | 'medium' | 'low';
}

interface Lead {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  linkedin?: string;
  status: 'prospect' | 'contacted' | 'interviewed' | 'converted' | 'rejected';
  notes: string;
  source: string;
  contactedAt?: Date;
  interviewedAt?: Date;
  candidateProfile: string; // Which ideal candidate profile they match
}

interface EvidenceTabProps {
  idea: string;
}

export function EvidenceTab({ idea }: EvidenceTabProps) {
  const [idealCandidates, setIdealCandidates] = useState<IdealCandidate[]>([
    {
      id: '1',
      title: 'Early-Stage Startup Founder',
      description: 'Pre-seed to Series A founders who struggle with customer validation',
      characteristics: ['First-time founder', '0-10 employees', 'Tech background', 'Limited validation experience'],
      outreachStrategy: 'LinkedIn outreach + founder communities + startup events',
      priority: 'high'
    }
  ]);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<IdealCandidate | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const { toast } = useToast();

  const handleAddCandidate = (candidate: Omit<IdealCandidate, 'id'>) => {
    const newCandidate = { ...candidate, id: Date.now().toString() };
    setIdealCandidates([...idealCandidates, newCandidate]);
    setIsAddingCandidate(false);
    toast({
      title: "Candidate Profile Added",
      description: "New ideal candidate profile has been created",
    });
  };

  const handleAddLead = (lead: Omit<Lead, 'id'>) => {
    const newLead = { ...lead, id: Date.now().toString() };
    setLeads([...leads, newLead]);
    setIsAddingLead(false);
    toast({
      title: "Lead Added",
      description: "New lead has been added to your CRM",
    });
  };

  const handleAddResearchLead = (evidence: string, source: string) => {
    // Parse research data to create a lead
    const leadData = parseResearchData(evidence, source);
    if (leadData) {
      handleAddLead(leadData);
    }
  };

  const parseResearchData = (evidence: string, source: string): Omit<Lead, 'id'> | null => {
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
        status: 'prospect',
        notes: `Added from research: ${evidence}`,
        source: source,
        candidateProfile: idealCandidates[0]?.id || ''
      };
    }
    return null;
  };

  const updateLeadStatus = (leadId: string, status: Lead['status']) => {
    setLeads(leads.map(lead => 
      lead.id === leadId 
        ? { 
            ...lead, 
            status,
            contactedAt: status === 'contacted' ? new Date() : lead.contactedAt,
            interviewedAt: status === 'interviewed' ? new Date() : lead.interviewedAt
          }
        : lead
    ));
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const CandidateForm = ({ candidate, onSave, onCancel }: {
    candidate?: IdealCandidate;
    onSave: (candidate: Omit<IdealCandidate, 'id'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      title: candidate?.title || '',
      description: candidate?.description || '',
      characteristics: candidate?.characteristics || [''],
      outreachStrategy: candidate?.outreachStrategy || '',
      priority: candidate?.priority || 'medium' as const
    });

    return (
      <div className="space-y-4">
        <Input
          placeholder="Profile title (e.g., Early-Stage Startup Founder)"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Textarea
          placeholder="Describe this ideal candidate profile..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        
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

        <Textarea
          placeholder="Outreach strategy for this profile..."
          value={formData.outreachStrategy}
          onChange={(e) => setFormData({ ...formData, outreachStrategy: e.target.value })}
        />

        <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button onClick={() => onSave(formData)} disabled={!formData.title || !formData.description}>
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Evidence & Customer Research</h2>
        <p className="text-sm text-muted-foreground">
          Define ideal candidates and track your customer validation efforts
        </p>
      </div>

      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profiles">
            <Target className="h-4 w-4 mr-2" />
            Ideal Candidates
          </TabsTrigger>
          <TabsTrigger value="crm">
            <Users className="h-4 w-4 mr-2" />
            Lead Management
          </TabsTrigger>
          <TabsTrigger value="research">
            <ExternalLink className="h-4 w-4 mr-2" />
            Research & Discovery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Ideal Customer Profiles</h3>
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

          <div className="grid gap-4">
            {idealCandidates.map((candidate) => (
              <Card key={candidate.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{candidate.title}</h4>
                    <Badge variant={candidate.priority === 'high' ? 'default' : 'secondary'}>
                      {candidate.priority} priority
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{candidate.description}</p>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Characteristics</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidate.characteristics.map((char, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Outreach Strategy</p>
                    <p className="text-sm mt-1">{candidate.outreachStrategy}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crm" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Lead Management</h3>
            <Button onClick={() => setIsAddingLead(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>

          <div className="grid gap-4">
            {leads.map((lead) => (
              <Card key={lead.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{lead.name}</h4>
                    <p className="text-sm text-muted-foreground">{lead.title} at {lead.company}</p>
                    <Badge className={`mt-1 ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Select value={lead.status} onValueChange={(value: any) => updateLeadStatus(lead.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="interviewed">Interviewed</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {lead.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{lead.email}</span>
                    </div>
                  )}
                  {lead.linkedin && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Source: {lead.source}
                  </div>
                  {lead.notes && (
                    <div className="text-sm bg-muted/30 rounded p-2 mt-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Notes</p>
                      {lead.notes}
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {leads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No leads yet. Start by researching potential customers or manually adding leads.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Research & Discovery</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use research tools to find potential customers and add them as leads
            </p>
          </div>
          
          <CRMResearch onAddEvidence={handleAddResearchLead} />
        </TabsContent>
      </Tabs>
    </div>
  );
}