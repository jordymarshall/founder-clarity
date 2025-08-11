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
  const [messages, setMessages] = usePersistentState<ChatMessage[]>("guided.messages", []);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Initial welcome and idea capture
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { id: crypto.randomUUID(), role: "coach", content: "Welcome! I’ll guide you through the validation workflow, step by step." },
        { id: crypto.randomUUID(), role: "coach", content: "First, what’s the name of the idea you’re working on?" },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const atIntro = idea.trim().length === 0;
  const currentStep = steps[stepIndex] ?? steps[0];

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    if (atIntro) {
      // First answer sets the idea name
      setIdea(text);
      const coachAck: ChatMessage = {
        id: crypto.randomUUID(),
        role: "coach",
        content: `Great – we’ll call it “${text}”. Let’s start with ${steps[0].title}.`,
      };
      setMessages((prev) => [...prev, coachAck]);
      setStepIndex(0);
    } else {
      // Simple echo/acknowledgement
      const coachAck: ChatMessage = {
        id: crypto.randomUUID(),
        role: "coach",
        content: "Noted. When you’re ready, continue to the next step.",
      };
      setMessages((prev) => [...prev, coachAck]);
    }
  };

  const goNext = () => {
    if (stepIndex < steps.length - 1) {
      const next = stepIndex + 1;
      setStepIndex(next);
      const coachMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "coach",
        content: `Moving to ${steps[next].title}. ${steps[next].question}`,
      };
      setMessages((prev) => [...prev, coachMsg]);
    } else {
      const coachMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "coach",
        content: "You’ve reached the end of the guided flow. Great work!",
      };
      setMessages((prev) => [...prev, coachMsg]);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      const prevIndex = stepIndex - 1;
      setStepIndex(prevIndex);
      const coachMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "coach",
        content: `Back to ${steps[prevIndex].title}.` ,
      };
      setMessages((prev) => [...prev, coachMsg]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
      {/* Chat Column */}
      <section aria-label="Coach chat" className="border rounded-lg bg-background">
        <header className="flex items-center gap-2 p-4 border-b">
          <Sparkles className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Coach</h2>
          {idea && <span className="ml-auto text-xs text-muted-foreground">Idea: {idea}</span>}
        </header>

        <ScrollArea className="h-[360px] p-4" ref={scrollRef as any}>
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[320px] rounded px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground ml-8" : "bg-muted text-foreground mr-8"}`}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Prompt for current step */}
            {!atIntro && (
              <div className="flex justify-start">
                <div className="max-w-[320px] rounded px-3 py-2 text-sm bg-muted text-foreground mr-8">
                  {currentStep.question}
                </div>
              </div>
            )}
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
