import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { InvestigationCanvas } from "@/components/investigation-canvas";

export default function Discovery() {
  useEffect(() => {
    document.title = "Discovery | StartupDetective";
  }, []);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-4">Discovery</h1>
        <InvestigationCanvas idea="Untitled Idea" />
      </section>
    </AppLayout>
  );
}
