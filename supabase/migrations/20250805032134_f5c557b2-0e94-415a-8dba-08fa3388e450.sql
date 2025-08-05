-- Create interview candidates CRM table
CREATE TABLE public.interview_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  idea TEXT NOT NULL,
  
  -- Candidate information from Apollo
  apollo_id TEXT,
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  title TEXT,
  seniority TEXT,
  company TEXT,
  company_domain TEXT,
  industry TEXT,
  company_size INTEGER,
  location TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  phone TEXT,
  email_status TEXT,
  photo_url TEXT,
  headline TEXT,
  
  -- Interview tracking
  status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect', 'contacted', 'responded', 'scheduled', 'interviewed', 'converted', 'rejected')),
  notes TEXT,
  contact_attempts INTEGER DEFAULT 0,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  interview_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.interview_candidates ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own interview candidates" 
ON public.interview_candidates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview candidates" 
ON public.interview_candidates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview candidates" 
ON public.interview_candidates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview candidates" 
ON public.interview_candidates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_interview_candidates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_interview_candidates_updated_at
  BEFORE UPDATE ON public.interview_candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_interview_candidates_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_interview_candidates_user_id ON public.interview_candidates(user_id);
CREATE INDEX idx_interview_candidates_status ON public.interview_candidates(status);
CREATE INDEX idx_interview_candidates_idea ON public.interview_candidates(idea);