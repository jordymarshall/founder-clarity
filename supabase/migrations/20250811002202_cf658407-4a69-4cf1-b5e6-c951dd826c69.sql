-- Retry: create policies using DO blocks for compatibility (no IF NOT EXISTS on CREATE POLICY)

-- Ensure required extension for UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Utility function (already exists in project, keep for idempotency)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tables (idempotent)
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  idea_slug TEXT,
  title TEXT,
  transcript TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  idea_slug TEXT,
  title TEXT NOT NULL,
  rationale TEXT,
  structure JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC DEFAULT 0,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.interview_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quote','observation','metric','other')),
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_interviews_user ON public.interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_idea ON public.interviews(idea_slug);
CREATE INDEX IF NOT EXISTS idx_insights_user ON public.insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_idea ON public.insights(idea_slug);
CREATE INDEX IF NOT EXISTS idx_facts_interview ON public.interview_facts(interview_id);
CREATE INDEX IF NOT EXISTS idx_facts_user ON public.interview_facts(user_id);

-- Enable RLS
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_facts ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'interviews' AND policyname = 'Users can view their own interviews'
  ) THEN
    CREATE POLICY "Users can view their own interviews" ON public.interviews FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'interviews' AND policyname = 'Users can insert their own interviews'
  ) THEN
    CREATE POLICY "Users can insert their own interviews" ON public.interviews FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'interviews' AND policyname = 'Users can update their own interviews'
  ) THEN
    CREATE POLICY "Users can update their own interviews" ON public.interviews FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'interviews' AND policyname = 'Users can delete their own interviews'
  ) THEN
    CREATE POLICY "Users can delete their own interviews" ON public.interviews FOR DELETE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'insights' AND policyname = 'Users can view their own insights'
  ) THEN
    CREATE POLICY "Users can view their own insights" ON public.insights FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'insights' AND policyname = 'Users can insert their own insights'
  ) THEN
    CREATE POLICY "Users can insert their own insights" ON public.insights FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'insights' AND policyname = 'Users can update their own insights'
  ) THEN
    CREATE POLICY "Users can update their own insights" ON public.insights FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'insights' AND policyname = 'Users can delete their own insights'
  ) THEN
    CREATE POLICY "Users can delete their own insights" ON public.insights FOR DELETE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'interview_facts' AND policyname = 'Users can view their own interview facts'
  ) THEN
    CREATE POLICY "Users can view their own interview facts" ON public.interview_facts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'interview_facts' AND policyname = 'Users can insert their own interview facts'
  ) THEN
    CREATE POLICY "Users can insert their own interview facts" ON public.interview_facts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'interview_facts' AND policyname = 'Users can update their own interview facts'
  ) THEN
    CREATE POLICY "Users can update their own interview facts" ON public.interview_facts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'interview_facts' AND policyname = 'Users can delete their own interview facts'
  ) THEN
    CREATE POLICY "Users can delete their own interview facts" ON public.interview_facts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Triggers for automatic updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_interviews_updated_at'
  ) THEN
    CREATE TRIGGER trg_interviews_updated_at
    BEFORE UPDATE ON public.interviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_insights_updated_at'
  ) THEN
    CREATE TRIGGER trg_insights_updated_at
    BEFORE UPDATE ON public.insights
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;