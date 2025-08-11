import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GuidedWorkflowChat } from "@/components/guided-workflow-chat";

export default function Coach() {
  useEffect(() => {
    document.title = "Guided Coach | StartupDetective";
  }, []);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-2">Guided Workflow Coach</h1>
        <p className="text-muted-foreground mb-6">A focused, step-by-step experience that embeds the right tools at the right time.</p>
        <GuidedWorkflowChat />
      </section>
    </AppLayout>
  );
}
