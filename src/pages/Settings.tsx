import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";

export default function Settings() {
  useEffect(() => {
    document.title = "Settings | StartupDetective";
  }, []);

  return (
    <AppLayout>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-2xl font-semibold mb-4">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences here. More settings coming soon.</p>
      </section>
    </AppLayout>
  );
}
