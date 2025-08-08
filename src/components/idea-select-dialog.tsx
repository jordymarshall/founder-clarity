import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus } from "lucide-react";
import { useIdeas } from "@/hooks/use-ideas";

interface IdeaSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (ideaName: string) => void;
}

export function IdeaSelectDialog({ open, onOpenChange, onSubmit }: IdeaSelectDialogProps) {
  const { ideas, addIdea } = useIdeas();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = [...ideas].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (!q) return list;
    return list.filter((i) => i.text.toLowerCase().includes(q));
  }, [ideas, query]);

  const confirmWithIdea = (ideaText: string) => {
    const value = ideaText.trim();
    if (!value) return;
    onSubmit(value);
    onOpenChange(false);
  };

  const createAndOpen = () => {
    const value = query.trim();
    if (!value) return;
    addIdea(value);
    confirmWithIdea(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Open workflow for an idea</DialogTitle>
          <DialogDescription>
            Pick an existing idea or create a new one to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search or type a new idea…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (filtered.length ? confirmWithIdea(filtered[0].text) : createAndOpen())}
              className="pl-8"
            />
          </div>
          <Button onClick={createAndOpen} disabled={!query.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Create
          </Button>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mt-2 mb-1">Recent ideas</p>
          <ScrollArea className="h-56 rounded border">
            <ul className="divide-y">
              {filtered.map((i) => (
                <li key={i.id}>
                  <button
                    onClick={() => confirmWithIdea(i.text)}
                    className="w-full text-left p-3 hover:bg-muted/50 transition-smooth"
                  >
                    <div className="font-medium text-sm line-clamp-1">{i.text}</div>
                    <div className="text-xs text-muted-foreground">{new Date(i.createdAt).toLocaleString()}</div>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="p-4 text-sm text-muted-foreground">No ideas found. Use Create to add a new one.</li>
              )}
            </ul>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
