import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, Save, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InterviewUploadProps {
  idea: string;
}

function slugify(text: string) {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function InterviewUpload({ idea }: InterviewUploadProps) {
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [interviews, setInterviews] = useState<Array<{ id: string; title: string | null; created_at: string }>>([]);

  const ideaSlug = useMemo(() => slugify(idea || "Untitled Idea"), [idea]);

  const loadInterviews = async () => {
    setListLoading(true);
    try {
      const { data, error } = await supabase
        .from("interviews")
        .select("id, title, created_at")
        .eq("idea_slug", ideaSlug)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInterviews(data || []);
    } catch (err) {
      console.error("Failed to load interviews", err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaSlug]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setTranscript(text);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
      toast.success("Transcript loaded from file");
    } catch (err) {
      toast.error("Failed to read file");
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !transcript.trim()) {
      toast.error("Please provide a title and transcript");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save interviews");
        return;
      }

      const { error } = await supabase.from("interviews").insert({
        user_id: user.id,
        idea_slug: ideaSlug,
        title: title.trim(),
        transcript: transcript.trim(),
        metadata: {},
      });
      if (error) throw error;
      toast.success("Interview saved");
      setTitle("");
      setTranscript("");
      loadInterviews();
    } catch (err) {
      console.error("Save interview failed", err);
      toast.error("Failed to save interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Notes or Transcript</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Input
              placeholder="Interview title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Interview title"
            />
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input type="file" accept=".txt,.md,.rtf,.json,.srt" className="hidden" onChange={handleFileUpload} />
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded border">
                  <Upload className="h-4 w-4" />
                  Choose file
                </span>
              </label>
              <span className="text-xs text-muted-foreground">or paste text below</span>
            </div>
            <Textarea
              placeholder="Paste interview notes or transcript..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[180px]"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Interview
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saved Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : interviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No interviews yet for this idea.</p>
          ) : (
            <div className="space-y-3">
              {interviews.map((i) => (
                <div key={i.id} className="flex items-center justify-between p-3 rounded border">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{i.title || "Untitled interview"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
