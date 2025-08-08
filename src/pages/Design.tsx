import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";

function useIdeaFromParam() {
  const { ideaSlug } = useParams();
  return useMemo(() => (ideaSlug ? decodeURIComponent(ideaSlug).replace(/-/g, " ") : "Untitled Idea"), [ideaSlug]);
}

export default function Design() {
  const idea = useIdeaFromParam();

  useEffect(() => {
    document.title = `${idea} — Design | StartupDetective`;
  }, [idea]);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-2">Design</h1>
        <p className="text-muted-foreground mb-6">Design the offer for "{idea}". This section will guide you to shape your value proposition, pricing, and MVP.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="p-4 border rounded-lg">
            <h2 className="font-medium mb-2">Unique Value Proposition</h2>
            <div className="min-h-[100px] bg-muted rounded p-3 text-sm"/>
          </article>
          <article className="p-4 border rounded-lg">
            <h2 className="font-medium mb-2">Target Pricing</h2>
            <div className="min-h-[100px] bg-muted rounded p-3 text-sm"/>
          </article>
          <article className="p-4 border rounded-lg md:col-span-2">
            <h2 className="font-medium mb-2">MVP Outline</h2>
            <div className="min-h-[120px] bg-muted rounded p-3 text-sm"/>
          </article>
        </div>
      </section>
    </AppLayout>
  );
}
