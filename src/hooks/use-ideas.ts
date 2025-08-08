import { useEffect, useState, useCallback } from "react";

export interface IdeaItem {
  id: string;
  text: string;
  createdAt: string; // ISO string
}

const STORAGE_KEY = "sd_ideas";

function seedIdeas(): IdeaItem[] {
  return [
    { id: "1", text: "AI-powered customer interview analysis tool", createdAt: new Date().toISOString() },
    { id: "2", text: "Subscription box for sustainable office supplies", createdAt: new Date().toISOString() },
    { id: "3", text: "Remote team building platform with VR integration", createdAt: new Date().toISOString() },
  ];
}

function loadFromStorage(): IdeaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedIdeas();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as IdeaItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(ideas: IdeaItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
  } catch {}
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);

  useEffect(() => {
    setIdeas(loadFromStorage());
  }, []);

  const addIdea = useCallback((text: string): IdeaItem => {
    const clean = text.trim();
    const newItem: IdeaItem = { id: Date.now().toString(), text: clean, createdAt: new Date().toISOString() };
    setIdeas((prev) => {
      const next = [newItem, ...prev];
      saveToStorage(next);
      return next;
    });
    return newItem;
  }, []);

  const removeIdea = useCallback((id: string) => {
    setIdeas((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateIdea = useCallback((id: string, text: string) => {
    setIdeas((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, text } : i));
      saveToStorage(next);
      return next;
    });
  }, []);

  const search = useCallback((q: string) => {
    const query = q.toLowerCase().trim();
    return ideas
      .filter((i) => i.text.toLowerCase().includes(query))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [ideas]);

  return { ideas, addIdea, removeIdea, updateIdea, search };
}
