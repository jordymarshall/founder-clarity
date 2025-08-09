import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { DeconstructFabricCanvas } from "@/components/deconstruct-fabric-canvas";

function useIdeaFromParam() {
  const { ideaSlug } = useParams();
  return useMemo(() => (ideaSlug ? decodeURIComponent(ideaSlug).replace(/-/g, " ") : "Untitled Idea"), [ideaSlug]);
}

export default function Deconstruct() {
  const idea = useIdeaFromParam();

  useEffect(() => {
    document.title = `${idea} — Deconstruction | startupblocks`;
  }, [idea]);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-4">Deconstruction Canvas</h1>
        <DeconstructFabricCanvas idea={idea} />
      </section>
    </AppLayout>
  );
}
