import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { GuidedWorkflowChat } from "@/components/guided-workflow-chat";

function useIdeaFromParam() {
  const { ideaSlug } = useParams();
  const idea = useMemo(
    () => (ideaSlug ? decodeURIComponent(ideaSlug).replace(/-/g, " ") : "Untitled Idea"),
    [ideaSlug]
  );
  const keyPrefix = useMemo(() => `guided.${ideaSlug ?? 'untitled'}`, [ideaSlug]);
  return { idea, keyPrefix } as const;
}

export default function IdeaCoach() {
  const { idea, keyPrefix } = useIdeaFromParam();

  useEffect(() => {
    document.title = `${idea} — Coach | StartupDetective`;
  }, [idea]);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-2">Guided Workflow Coach</h1>
        <p className="text-muted-foreground mb-6">Navigate the key workflow areas for this idea.</p>
        <GuidedWorkflowChat initialIdea={idea} storageKeyPrefix={keyPrefix} />
      </section>
    </AppLayout>
  );
}
