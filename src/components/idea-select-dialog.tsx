import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IdeaSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (ideaName: string) => void;
}

export function IdeaSelectDialog({ open, onOpenChange, onSubmit }: IdeaSelectDialogProps) {
  const [idea, setIdea] = useState("");

  useEffect(() => {
    if (!open) setIdea("");
  }, [open]);

  const handleConfirm = () => {
    const value = idea.trim();
    if (!value) return;
    onSubmit(value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select idea</DialogTitle>
          <DialogDescription>
            Enter the idea you want to open this workflow page for.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <label htmlFor="idea-name" className="sr-only">Idea name</label>
          <Input
            id="idea-name"
            placeholder="e.g. AI interview coach for founders"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm}>Open</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
