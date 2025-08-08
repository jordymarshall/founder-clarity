import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { CRMResearch } from "@/components/crm-research";

export default function Research() {
  useEffect(() => {
    document.title = "Customer Research | StartupDetective";
  }, []);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-4">Customer Research</h1>
        <CRMResearch />
      </section>
    </AppLayout>
  );
}
