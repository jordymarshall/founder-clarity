import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { InvestigationCanvas } from "@/components/investigation-canvas";

function useIdeaFromParam() {
  const { ideaSlug } = useParams();
  return useMemo(() => (ideaSlug ? decodeURIComponent(ideaSlug).replace(/-/g, " ") : "Untitled Idea"), [ideaSlug]);
}

export default function Discovery() {
  const idea = useIdeaFromParam();

  useEffect(() => {
    document.title = `${idea} — Discovery | StartupDetective`;
  }, [idea]);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-4">Discovery</h1>
        <InvestigationCanvas idea={idea} />
      </section>
    </AppLayout>
  );
}
