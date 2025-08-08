import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { SynthesisCanvas } from "@/components/synthesis-canvas";

export default function Synthesis() {
  useEffect(() => {
    document.title = "Synthesis | StartupDetective";
  }, []);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-4">Synthesis</h1>
        <SynthesisCanvas />
      </section>
    </AppLayout>
  );
}
