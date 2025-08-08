import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { DeconstructCanvas } from "@/components/deconstruct-canvas";

export default function Deconstruct() {
  useEffect(() => {
    document.title = "Deconstruction Canvas | StartupDetective";
  }, []);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-4">Deconstruction Canvas</h1>
        <DeconstructCanvas idea="Untitled Idea" />
      </section>
    </AppLayout>
  );
}
