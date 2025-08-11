import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { DeconstructCanvas } from "@/components/deconstruct-canvas";
import { InvestigationCanvas } from "@/components/investigation-canvas";
import { EvidenceTab } from "@/components/evidence-tab";
import { SynthesisCanvas } from "@/components/synthesis-canvas";

interface ChatMessage {
  id: string;
  role: "coach" | "user";
  content: string;
}

interface Step {
  id: string;
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

export function GuidedWorkflowChat() {
  const [idea, setIdea] = usePersistentState<string>("guided.idea", "");
  const [stepIndex, setStepIndex] = usePersistentState<number>("guided.stepIndex", 0);
  // Initialize messages with welcome prompts to avoid duplicate inserts in React StrictMode
  const initialMessages = useMemo<ChatMessage[]>(() => ([
    { id: crypto.randomUUID(), role: "coach", content: "Welcome! I’ll guide you through the validation workflow, step by step." },
    { id: crypto.randomUUID(), role: "coach", content: "First, what’s the name of the idea you’re working on?" },
  ]), []);
  const [messages, setMessages] = usePersistentState<ChatMessage[]>("guided.messages", initialMessages);
  const [answers, setAnswers] = usePersistentState<Record<string, string>>("guided.answers", {});
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);

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
      render: (i) => <DeconstructCanvas idea={i || "Untitled Idea"} />,
    },
    {
      id: "discovery",
      title: "Discovery",
      question: "Great. Now let’s shape your customer discovery approach and interview plan.",
      render: (i) => <InvestigationCanvas idea={i || "Untitled Idea"} />,
    },
    {
      id: "evidence",
      title: "Evidence",
      question: "Time to gather evidence. Define targets and run searches.",
      render: (i) => <EvidenceTab idea={i || "Untitled Idea"} />,
    },
    {
      id: "synthesis",
      title: "Synthesis",
      question: "Finally, synthesize what you’ve learned into patterns and insights.",
      render: () => <SynthesisCanvas />,
    },
  ], []);

  // Initial messages are provided via initial state to avoid StrictMode duplicate inserts

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const atIntro = idea.trim().length === 0;
  const currentStep = steps[stepIndex] ?? steps[0];

  // Ensure the current step's question appears as part of the chat timeline
  useEffect(() => {
    if (!atIntro) {
      const hasQuestion = messages.some(
        (m) => m.role === "coach" && m.content === currentStep.question
      );
      if (!hasQuestion) {
        appendCoach(currentStep.question);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || isSendingRef.current) return;
    isSendingRef.current = true;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    if (atIntro) {
      // First answer sets the idea name
      setIdea(text);
      appendCoach(`Great – we’ll call it “${text}”. Let’s start with ${steps[0].title}.`);
      setStepIndex(0);
      appendCoach(steps[0].question);
    } else {
      // Save answer for current step and auto-advance
      setAnswers((prev) => ({ ...prev, [currentStep.id]: text }));
      if (stepIndex < steps.length - 1) {
        const next = stepIndex + 1;
        appendCoach(`Got it. Moving to ${steps[next].title}.`);
        setStepIndex(next);
        appendCoach(steps[next].question);
      } else {
        appendCoach("Got it. You’ve completed the guided flow. Great work!");
      }
    }

    // Release re-entrancy lock
    setTimeout(() => { isSendingRef.current = false; }, 0);
  };

  const goNext = () => {
    if (stepIndex < steps.length - 1) {
      const next = stepIndex + 1;
      setStepIndex(next);
      appendCoach(`Moving to ${steps[next].title}. ${steps[next].question}`);
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
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
      {/* Chat Column */}
      <section aria-label="Coach chat" className="border rounded-lg bg-background">
        <header className="flex items-center gap-2 p-4 border-b">
          <Sparkles className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Coach</h2>
          <div className="ml-auto flex items-center gap-2">
            {idea && <span className="text-xs text-muted-foreground">Idea: {idea}</span>}
            <Button variant="ghost" size="sm" onClick={resetFlow} aria-label="Reset coach">Reset</Button>
          </div>
        </header>

        <ScrollArea className="h-[360px] p-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[320px] rounded px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground ml-8" : "bg-muted text-foreground mr-8"}`}>
                  {m.content}
                </div>
              </div>
            ))}

          </div>
        </ScrollArea>

        {/* Input */}
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

      {/* Embedded Step Column */}
      <section aria-label="Embedded step" className="border rounded-lg bg-background flex flex-col">
        <header className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">Step {stepIndex + 1} of {steps.length}: {currentStep.title}</h2>
              <p className="text-xs text-muted-foreground">Complete this step, then continue.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={goBack} disabled={stepIndex === 0} aria-label="Previous step">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={goNext} aria-label="Next step">
                <span className="mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 overflow-auto">
          {currentStep.render(idea || "Untitled Idea")}
        </div>
      </section>
    </div>
  );
}
