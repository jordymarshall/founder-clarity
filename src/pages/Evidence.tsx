import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { EvidenceTab } from "@/components/evidence-tab";

export default function Evidence() {
  useEffect(() => {
    document.title = "Evidence | StartupDetective";
  }, []);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-4">Evidence</h1>
        <EvidenceTab idea="Untitled Idea" />
      </section>
    </AppLayout>
  );
}
