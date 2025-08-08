import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { HypothesisCanvas } from "@/components/hypothesis-canvas";

export default function Validation() {
  useEffect(() => {
    document.title = "Validation | StartupDetective";
  }, []);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-4">Validation</h1>
        <HypothesisCanvas idea="Untitled Idea" />
      </section>
    </AppLayout>
  );
}
