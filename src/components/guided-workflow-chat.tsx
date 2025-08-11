import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { DeconstructCanvas } from "@/components/deconstruct-canvas";
import { InvestigationCanvas } from "@/components/investigation-canvas";
import { EvidenceTab } from "@/components/evidence-tab";
import { SynthesisCanvas } from "@/components/synthesis-canvas";
import { InterviewUpload } from "@/components/interview-upload";
import { supabase } from "@/integrations/supabase/client";

type EmbedKind = "deconstruct" | "find-people" | "interview" | "upload" | "synthesis";
interface ChatEmbed { kind: EmbedKind }
interface ChatMessage {
  id: string;
  role: "coach" | "user";
  content: string;
  embed?: ChatEmbed;
}

interface Step {
  id: EmbedKind;
  title: string;
  question: string;
  render: (idea: string) => React.ReactNode;
}

function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

export function GuidedWorkflowChat({ initialIdea, storageKeyPrefix }: { initialIdea?: string; storageKeyPrefix?: string }) {
  const prefix = storageKeyPrefix ?? "guided";
  const k = (s: string) => `${prefix}.${s}`;
  const [idea, setIdea] = usePersistentState<string>(k("idea"), "");
  const [stepIndex, setStepIndex] = usePersistentState<number>(k("stepIndex"), 0);
  // Initialize messages with welcome prompts to avoid duplicate inserts in React StrictMode
  const initialMessages = useMemo<ChatMessage[]>(() => ([
    { id: crypto.randomUUID(), role: "coach", content: "Welcome! I’ll guide you through the validation workflow, step by step." },
    { id: crypto.randomUUID(), role: "coach", content: "First, what’s the name of the idea you’re working on?" },
  ]), []);
  const [messages, setMessages] = usePersistentState<ChatMessage[]>(k("messages"), initialMessages);
  const [answers, setAnswers] = usePersistentState<Record<string, string>>(k("answers"), {});
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);

useEffect(() => {
  if (initialIdea && !idea) {
    setIdea(initialIdea);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialIdea]);

const [deconstructBlocks, setDeconstructBlocks] = useState<any[]>([]);
  const [initialHypothesis, setInitialHypothesis] = useState<{
    problem?: string[];
    existingAlternatives?: string[];
    customerSegments?: string[];
    earlyAdopters?: string[];
    jobToBeDone?: string[];
  } | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const hypothesisFromDeconstruction = useMemo(() => {
    const get = (cat: string) =>
      deconstructBlocks
        .filter((b: any) => b.category === cat)
        .map((b: any) => ({ text: b.content }));
    return {
      customerSegment: { content: get('segments') },
      coreProblem: { content: get('problem') },
      jobToBeDone: { content: get('job-to-be-done') },
      existingAlternatives: { content: get('alternatives') },
    };
  }, [deconstructBlocks]);

  const appendCoach = (content: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "coach" && last.content === content) return prev; // dedupe identical consecutive coach msgs
      return [...prev, { id: crypto.randomUUID(), role: "coach", content }];
    });
  };

  const resetFlow = () => {
    setIdea("");
    setStepIndex(0);
    setMessages(initialMessages);
    isSendingRef.current = false;
  };
  const steps: Step[] = useMemo(() => [
    {
      id: "deconstruct",
      title: "Deconstruction",
      question: "Let’s deconstruct the problem space. What problem are you tackling and for whom?",
      render: (i) => (
        <DeconstructCanvas
          idea={i || "Untitled Idea"}
          initialData={initialHypothesis || undefined}
          onBlocksChange={setDeconstructBlocks}
        />
      ),
    },
    {
      id: "find-people",
      title: "Find relevant people",
      question: "Based on your deconstruction, let’s find the right people to talk to. I’ll generate criteria and you can run searches.",
      render: (i) => (
        <EvidenceTab
          idea={i || "Untitled Idea"}
          customerSegment={hypothesisFromDeconstruction.customerSegment}
          coreProblem={hypothesisFromDeconstruction.coreProblem}
          jobToBeDone={hypothesisFromDeconstruction.jobToBeDone}
          existingAlternatives={hypothesisFromDeconstruction.existingAlternatives}
        />
      ),
    },
    {
      id: "interview",
      title: "Interview script",
      question: "Now, generate your interview script to run problem discovery conversations.",
      render: (i) => <InvestigationCanvas 
        idea={i || "Untitled Idea"}
        initialCustomerSegment={hypothesisFromDeconstruction.customerSegment.content?.[0]?.text}
        initialProblem={hypothesisFromDeconstruction.coreProblem.content?.[0]?.text}
        initialAlternatives={hypothesisFromDeconstruction.existingAlternatives.content?.[0]?.text}
        initialJTBD={hypothesisFromDeconstruction.jobToBeDone.content?.[0]?.text}
      />,
    },
    {
      id: "upload",
      title: "Upload notes/transcripts",
      question: "After your interviews, upload notes or paste transcripts so we can synthesize.",
      render: (i) => <InterviewUpload idea={i || "Untitled Idea"} />,
    },
    {
      id: "synthesis",
      title: "Synthesis",
      question: "Finally, synthesize what you’ve learned into patterns and insights.",
      render: () => <SynthesisCanvas />,
    },
  ], [hypothesisFromDeconstruction]);

  // Embeds rendering within chat
  const hasEmbed = useCallback((kind: EmbedKind) => messages.some(m => m.embed?.kind === kind), [messages]);

  const LoadingEmbed = () => (
    <div className="h-64 rounded-md border border-border bg-muted/20 animate-fade-in" aria-label="Loading embed" />
  );

  const TypingBubble = () => (
    <div className="flex justify-start">
      <div className="max-w-[640px] rounded px-3 py-2 text-sm bg-muted text-foreground mr-8">
        <span className="animate-pulse">Thinking…</span>
      </div>
    </div>
  );

  const EmbedView = ({ kind }: { kind: EmbedKind }) => {
    switch (kind) {
      case "deconstruct": {
        const loading = (!initialHypothesis && deconstructBlocks.length === 0) && isWorking;
        return loading ? (
          <LoadingEmbed />
        ) : (
          <DeconstructCanvas
            idea={idea || "Untitled Idea"}
            initialData={initialHypothesis || undefined}
            onBlocksChange={setDeconstructBlocks}
          />
        );
      }
      case "find-people":
        return (
          <EvidenceTab
            idea={idea || "Untitled Idea"}
            customerSegment={hypothesisFromDeconstruction.customerSegment}
            coreProblem={hypothesisFromDeconstruction.coreProblem}
            jobToBeDone={hypothesisFromDeconstruction.jobToBeDone}
            existingAlternatives={hypothesisFromDeconstruction.existingAlternatives}
          />
        );
      case "interview":
        return (
          <InvestigationCanvas
            idea={idea || "Untitled Idea"}
            initialCustomerSegment={hypothesisFromDeconstruction.customerSegment.content?.[0]?.text}
            initialProblem={hypothesisFromDeconstruction.coreProblem.content?.[0]?.text}
            initialAlternatives={hypothesisFromDeconstruction.existingAlternatives.content?.[0]?.text}
            initialJTBD={hypothesisFromDeconstruction.jobToBeDone.content?.[0]?.text}
          />
        );
      case "upload":
        return <InterviewUpload idea={idea || "Untitled Idea"} />;
      case "synthesis":
        return <SynthesisCanvas />;
      default:
        return null;
    }
  };

  // Initial messages are provided via initial state to avoid StrictMode duplicate inserts

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Seed Deconstruction via AI when idea is set
  useEffect(() => {
    const run = async () => {
      if (!idea || initialHypothesis || isWorking) return;
      try {
        setIsWorking(true);
        // Showing typing bubble instead of static drafting message
        const { data, error } = await supabase.functions.invoke('initialize-idea', { body: { idea } });
        if (error) {
          console.error('initialize-idea error', error);
          appendCoach("Couldn’t auto-draft the canvas right now. You can still add insights manually.");
          return;
        }
        const d = data?.data || {};
        setInitialHypothesis({
          problem: d.problem || [],
          existingAlternatives: d.existingAlternatives || [],
          customerSegments: d.customerSegments || [],
          earlyAdopters: d.earlyAdopters || [],
          jobToBeDone: d.jobToBeDone || [],
        });
        appendCoach("Draft ready. Review/edit the canvas, then type ‘next’ or click Next.");
      } finally {
        setIsWorking(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idea, initialHypothesis, isWorking]);

  const atIntro = idea.trim().length === 0;
  const currentStep = steps[stepIndex] ?? steps[0];
  const atLastStep = stepIndex >= steps.length - 1;

  // Gate progression: require Deconstruction to be visible and populated before moving on
  const canProceed = React.useMemo(() => {
    if (currentStep.id === "deconstruct") {
      const hasAnyBlocks = Array.isArray(deconstructBlocks) && deconstructBlocks.length > 0;
      const hasDraft = !!initialHypothesis && (
        (initialHypothesis.problem?.length ?? 0) +
        (initialHypothesis.customerSegments?.length ?? 0) +
        (initialHypothesis.existingAlternatives?.length ?? 0) +
        (initialHypothesis.jobToBeDone?.length ?? 0)
      ) > 0;
      return hasEmbed("deconstruct") && (hasAnyBlocks || hasDraft);
    }
    return true;
  }, [currentStep.id, deconstructBlocks, initialHypothesis, messages]);

  // Ensure the current step's question appears as part of the chat timeline
  useEffect(() => {
    if (!atIntro) {
      const hasQuestion = messages.some((m) => m.role === "coach" && m.content === currentStep.question);
      if (!hasQuestion) {
        appendCoach(currentStep.question);
      }
      if (!hasEmbed(currentStep.id)) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "coach", content: "", embed: { kind: currentStep.id } },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, atIntro, currentStep.id, messages]);

  // Safety: If somehow we skipped Deconstruction, force it as the first step
  useEffect(() => {
    if (!atIntro && stepIndex > 0 && !hasEmbed('deconstruct')) {
      setStepIndex(0);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'coach', content: '', embed: { kind: 'deconstruct' } },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atIntro, stepIndex]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSendingRef.current) return;
    isSendingRef.current = true;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const cmd = text.toLowerCase();
    if (cmd === 'next') { isSendingRef.current = false; return goNext(); }
    if (cmd === 'back') { isSendingRef.current = false; return goBack(); }
    if (cmd === 'reset') { isSendingRef.current = false; return resetFlow(); }

    if (atIntro) {
      setIdea(text);
      appendCoach(`Great – we’ll call it “${text}”. Let’s start with ${steps[0].title}.`);
      setStepIndex(0);
      appendCoach(steps[0].question);
      if (!hasEmbed('deconstruct')) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'coach', content: '', embed: { kind: 'deconstruct' } },
        ]);
      }
    } else if (currentStep.id === 'deconstruct') {
      // Ask AI to refine the hypothesis draft; keep user on this step
      try {
        if (!isWorking) {
          setIsWorking(true);
          // Showing typing bubble instead of static refining message
          const { data, error } = await supabase.functions.invoke('initialize-idea', { body: { idea } });
          if (!error && data?.data) {
            const d = data.data;
            setInitialHypothesis({
              problem: d.problem || [],
              existingAlternatives: d.existingAlternatives || [],
              customerSegments: d.customerSegments || [],
              earlyAdopters: d.earlyAdopters || [],
              jobToBeDone: d.jobToBeDone || [],
            });
            appendCoach("Updated the canvas draft. Edit anything that looks off, then type ‘next’. ");
            if (!hasEmbed('deconstruct')) {
              setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), role: 'coach', content: '', embed: { kind: 'deconstruct' } },
              ]);
            }
          } else {
            appendCoach("Couldn’t refine right now. Continue editing manually and type ‘next’ when ready.");
          }
        }
      } finally {
        setIsWorking(false);
      }
    } else {
      // Record answer without auto-advancing; user controls navigation
      setAnswers((prev) => ({ ...prev, [currentStep.id]: text }));
      appendCoach("Got it. Continue when ready or type ‘next’.");
    }

    setTimeout(() => { isSendingRef.current = false; }, 0);
  };

  const goNext = () => {
    if (stepIndex < steps.length - 1) {
      const next = stepIndex + 1;
      setStepIndex(next);
      appendCoach(`Moving to ${steps[next].title}. ${steps[next].question}`);
      if (!hasEmbed(steps[next].id)) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'coach', content: '', embed: { kind: steps[next].id } },
        ]);
      }
    } else {
      appendCoach("You’ve reached the end of the guided flow. Great work!");
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      const prevIndex = stepIndex - 1;
      setStepIndex(prevIndex);
      appendCoach(`Back to ${steps[prevIndex].title}.`);
      appendCoach(steps[prevIndex].question);
      if (!hasEmbed(steps[prevIndex].id)) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'coach', content: '', embed: { kind: steps[prevIndex].id } },
        ]);
      }
    }
  };

  const jumpTo = (index: number) => {
    if (index < 0 || index >= steps.length) return;
    setStepIndex(index);
    appendCoach(`Jumped to ${steps[index].title}. ${steps[index].question}`);
    if (!hasEmbed(steps[index].id)) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'coach', content: '', embed: { kind: steps[index].id } },
      ]);
    }
  };

  return (
    <section aria-label="Coach chat" className="border rounded-lg bg-background">
      <header className="flex items-center gap-2 p-4 border-b">
        <Sparkles className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">Coach</h2>
        {!atIntro && (
          <nav className="flex gap-1 mx-2 overflow-x-auto" aria-label="Workflow steps">
            {steps.map((s, i) => (
              <Button
                key={s.id}
                variant={i === stepIndex ? "secondary" : "ghost"}
                size="sm"
                onClick={() => jumpTo(i)}
                aria-label={`Go to ${s.title}`}
              >
                {i + 1}. {s.title}
              </Button>
            ))}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2">
          {idea && <span className="text-xs text-muted-foreground">Idea: {idea}</span>}
          {isWorking && <span className="text-xs text-muted-foreground">AI working…</span>}
          {!atIntro && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                disabled={stepIndex === 0}
                aria-label="Back"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button
                size="sm"
                onClick={goNext}
                disabled={isWorking || !canProceed}
                aria-label="Next"
              >
                {atLastStep ? "Finish" : "Next"} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={resetFlow} aria-label="Reset coach">Reset</Button>
        </div>
      </header>

      <ScrollArea className="h-[600px] p-4">
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="space-y-2">
              {m.content && (
                <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[640px] rounded px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground ml-8" : "bg-muted text-foreground mr-8"}`}>
                    {m.content}
                  </div>
                </div>
              )}
              {m.embed && (
                <div className="rounded-lg border bg-background p-3">
                  <EmbedView kind={m.embed.kind} />
                </div>
              )}
            </div>
          ))}
          {isWorking && <TypingBubble />}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder={atIntro ? "Name your idea…" : "Reply to your coach…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1"
            aria-label="Chat message"
          />
          <Button onClick={sendMessage} size="sm" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
