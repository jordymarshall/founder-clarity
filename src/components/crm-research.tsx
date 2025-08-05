import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Building2, 
  User, 
  Users, 
  Globe, 
  MapPin, 
  Briefcase,
  DollarSign,
  Calendar,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface CompanyData {
  name: string;
  domain: string;
  description: string;
  industry: string;
  employees: number;
  funding: number;
  location: string;
  linkedin: string;
  twitter: string;
  founded: number;
  tags: string[];
}

interface PersonData {
  name: string;
  email: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  linkedin: string;
  twitter: string;
  bio: string;
}

interface CRMResearchProps {
  onAddEvidence?: (evidence: string, source: string) => void;
}

export function CRMResearch({ onAddEvidence }: CRMResearchProps) {
  const [activeTab, setActiveTab] = useState('company');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleSearch = async (type: string) => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let requestBody;
      
      switch (type) {
        case 'company':
          requestBody = { type: 'company', query: searchQuery };
          break;
        case 'person':
          requestBody = { type: 'person', query: searchQuery };
          break;
        case 'prospector':
          requestBody = { 
            type: 'prospector', 
            query: { 
              domain: searchQuery,
              role: 'founder,ceo,cto,vp' 
            } 
          };
          break;
        case 'discovery':
          requestBody = { 
            type: 'discovery', 
            query: { keywords: searchQuery } 
          };
          break;
      }

      const response = await fetch('/functions/v1/apollo-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
        toast({
          title: "Success",
          description: `Found ${Array.isArray(data.data) ? data.data.length : 1} result(s)`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvidence = (evidence: string, source: string) => {
    if (onAddEvidence) {
      onAddEvidence(evidence, source);
      toast({
        title: "Evidence Added",
        description: "Data has been added to your hypothesis canvas",
      });
    }
  };

  const CompanyCard = ({ company }: { company: CompanyData }) => (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{company.name}</h3>
          <p className="text-sm text-muted-foreground">{company.domain}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddEvidence(
            `${company.name} - ${company.industry} company with ${company.employees} employees`,
            `Apollo.io - ${company.domain}`
          )}
        >
          Add Evidence
        </Button>
      </div>
      
      <p className="text-sm">{company.description}</p>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Briefcase className="h-3 w-3" />
          {company.industry}
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {company.employees} employees
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {company.location}
        </div>
        {company.founded && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Founded {company.founded}
          </div>
        )}
      </div>
      
      {company.funding && (
        <div className="flex items-center gap-1 text-xs">
          <DollarSign className="h-3 w-3" />
          ${(company.funding / 1000000).toFixed(1)}M raised
        </div>
      )}
      
      <div className="flex gap-2">
        {company.linkedin && (
          <Badge variant="secondary" className="text-xs">
            LinkedIn: {company.linkedin}
          </Badge>
        )}
        {company.twitter && (
          <Badge variant="secondary" className="text-xs">
            Twitter: {company.twitter}
          </Badge>
        )}
      </div>
    </Card>
  );

  const PersonCard = ({ person }: { person: PersonData }) => (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{person.name}</h3>
          <p className="text-sm text-muted-foreground">{person.title}</p>
          <p className="text-xs text-muted-foreground">{person.company}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddEvidence(
            `${person.name} - ${person.title} at ${person.company}`,
            `Apollo.io - ${person.email}`
          )}
        >
          Add Evidence
        </Button>
      </div>
      
      {person.bio && <p className="text-sm">{person.bio}</p>}
      
      <div className="grid grid-cols-1 gap-1 text-xs">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {person.location}
        </div>
        {person.email && (
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {person.email}
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        {person.linkedin && (
          <Badge variant="secondary" className="text-xs">
            LinkedIn: {person.linkedin}
          </Badge>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">CRM Research & Evidence</h2>
        <p className="text-sm text-muted-foreground">
          Find real companies and people to support your hypothesis
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="text-xs">
            <Building2 className="h-3 w-3 mr-1" />
            Company
          </TabsTrigger>
          <TabsTrigger value="person" className="text-xs">
            <User className="h-3 w-3 mr-1" />
            Person
          </TabsTrigger>
          <TabsTrigger value="prospector" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            Find People
          </TabsTrigger>
          <TabsTrigger value="discovery" className="text-xs">
            <Search className="h-3 w-3 mr-1" />
            Discover
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter company domain (e.g., stripe.com)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch('company')}
            />
            <Button 
              onClick={() => handleSearch('company')}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          
          {results?.type === 'company' && results?.data && (
            <CompanyCard company={results.data} />
          )}
        </TabsContent>

        <TabsContent value="person" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch('person')}
            />
            <Button 
              onClick={() => handleSearch('person')}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          
          {results?.type === 'person' && results?.data && (
            <PersonCard person={results.data} />
          )}
        </TabsContent>

        <TabsContent value="prospector" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter company domain to find employees"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch('prospector')}
            />
            <Button 
              onClick={() => handleSearch('prospector')}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          
          {results?.type === 'prospector' && results?.data && (
            <div className="space-y-3">
              {results.data.map((person: any, index: number) => (
                <PersonCard key={index} person={person} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discovery" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter keywords to discover companies"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch('discovery')}
            />
            <Button 
              onClick={() => handleSearch('discovery')}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          
          {results?.type === 'discovery' && results?.data && (
            <div className="space-y-3">
              {results.data.map((company: any, index: number) => (
                <CompanyCard key={index} company={company} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}