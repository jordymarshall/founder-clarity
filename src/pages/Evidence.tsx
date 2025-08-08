import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { EvidenceTab } from "@/components/evidence-tab";

function useIdeaFromParam() {
  const { ideaSlug } = useParams();
  return useMemo(() => (ideaSlug ? decodeURIComponent(ideaSlug).replace(/-/g, " ") : "Untitled Idea"), [ideaSlug]);
}

export default function Evidence() {
  const idea = useIdeaFromParam();

  useEffect(() => {
    document.title = `${idea} — Evidence | StartupDetective`;
  }, [idea]);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-4">Evidence</h1>
        <EvidenceTab idea={idea} />
      </section>
    </AppLayout>
  );
}
