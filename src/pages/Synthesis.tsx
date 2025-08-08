import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { SynthesisCanvas } from "@/components/synthesis-canvas";

function useIdeaFromParam() {
  const { ideaSlug } = useParams();
  return useMemo(() => (ideaSlug ? decodeURIComponent(ideaSlug).replace(/-/g, " ") : "Untitled Idea"), [ideaSlug]);
}

export default function Synthesis() {
  const idea = useIdeaFromParam();

  useEffect(() => {
    document.title = `${idea} — Synthesis | StartupDetective`;
  }, [idea]);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-4">Synthesis</h1>
        <SynthesisCanvas />
      </section>
    </AppLayout>
  );
}
