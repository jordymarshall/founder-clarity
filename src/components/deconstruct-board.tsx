import React, { useEffect, useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

// Trello-like, simple canvas with columns and cards. Pure UX layer; no backend logic.
// Keeps compatibility with previous Deconstruct props & onBlocksChange shape.

export interface DeconstructBoardProps {
  className?: string;
  idea: string;
  initialData?: {
    problem?: string[];
    existingAlternatives?: string[];
    customerSegments?: string[];
    earlyAdopters?: string[];
    jobToBeDone?: string[];
  };
  onBlocksChange?: (blocks: { id: string; category: BlockCategory; title: string; content: string }[]) => void;
}

type BlockCategory = "problem" | "alternatives" | "segments" | "early-adopters" | "job-to-be-done";

const columns: { key: BlockCategory; label: string }[] = [
  { key: "problem", label: "Problem" },
  { key: "alternatives", label: "Existing Alternatives" },
  { key: "segments", label: "Customer Segments" },
  { key: "early-adopters", label: "Early Adopters" },
  { key: "job-to-be-done", label: "Job to be Done" },
];

interface CardItem {
  id: string;
  content: string;
}

type BoardState = Record<BlockCategory, CardItem[]>;

function makeInitialState(initial?: DeconstructBoardProps["initialData"]): BoardState {
  const base: BoardState = {
    problem: [],
    alternatives: [],
    segments: [],
    "early-adopters": [],
    "job-to-be-done": [],
  };
  if (!initial) return base;
  const map: [keyof NonNullable<DeconstructBoardProps["initialData"]>, BlockCategory][] = [
    ["problem", "problem"],
    ["existingAlternatives", "alternatives"],
    ["customerSegments", "segments"],
    ["earlyAdopters", "early-adopters"],
    ["jobToBeDone", "job-to-be-done"],
  ];
  map.forEach(([from, to]) => {
    const arr = (initial as any)?.[from] as string[] | undefined;
    base[to] = (arr || []).map((text, idx) => ({ id: `${to}-${idx}`, content: text }));
  });
  return base;
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="min-h-10">
      {children}
    </div>
  );
}

function SortableCard({ id, content, onChange }: { id: string; content: string; onChange: (val: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={cn(
      "rounded-md border border-border bg-card text-card-foreground shadow-sm",
      "p-3 focus-within:ring-2 focus-within:ring-ring/40"
    )}>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write something..."
        className="w-full bg-transparent outline-none text-sm leading-relaxed resize-none min-h-[72px]"
        spellCheck={false}
      />
    </div>
  );
}

export function DeconstructBoard({ className, idea, initialData, onBlocksChange }: DeconstructBoardProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [board, setBoard] = useState<BoardState>(() => makeInitialState(initialData));

  useEffect(() => {
    // bubble up in the same shape as before
    const blocks = columns.flatMap(({ key }) =>
      board[key].map((c) => ({
        id: c.id,
        category: key,
        title: (c.content || "").split(":")[0] || "Insight",
        content: c.content || "",
      }))
    );
    onBlocksChange?.(blocks);
  }, [board, onBlocksChange]);

  const handleAdd = (col: BlockCategory) => {
    setBoard((prev) => {
      const next = { ...prev } as BoardState;
      const id = `${col}-${Date.now()}`;
      next[col] = [{ id, content: "" }, ...prev[col]];
      return next;
    });
  };

  const findContainer = (id: string): BlockCategory | undefined => {
    return (Object.keys(board) as BlockCategory[]).find((k) => board[k].some((c) => c.id === id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(String(active.id));
    const overId = String(over.id);

    // over could be a card or a column id
    const overContainer: BlockCategory | undefined = (Object.keys(board) as BlockCategory[]).includes(overId as BlockCategory)
      ? (overId as BlockCategory)
      : findContainer(overId);

    if (!activeContainer || !overContainer) return;

    // same column reorder
    if (activeContainer === overContainer) {
      const oldIndex = board[activeContainer].findIndex((c) => c.id === active.id);
      const newIndex = board[activeContainer].findIndex((c) => c.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      setBoard((prev) => ({
        ...prev,
        [activeContainer]: arrayMove(prev[activeContainer], oldIndex, newIndex),
      }));
      return;
    }

    // move to another column (prepend before the hovered card if available)
    const fromItems = board[activeContainer];
    const toItems = board[overContainer];
    const moving = fromItems.find((c) => c.id === active.id);
    if (!moving) return;

    const overIndex = toItems.findIndex((c) => c.id === overId);
    setBoard((prev) => {
      const next = { ...prev } as BoardState;
      next[activeContainer] = prev[activeContainer].filter((c) => c.id !== active.id);
      const insertAt = overIndex >= 0 ? overIndex : 0;
      next[overContainer] = [
        ...prev[overContainer].slice(0, insertAt),
        moving,
        ...prev[overContainer].slice(insertAt),
      ];
      return next;
    });
  };

  return (
    <section className={cn("flex flex-col gap-3", className)} aria-labelledby="deconstruct-title">
      <header className="flex items-center justify-between">
        <div>
          <h1 id="deconstruct-title" className="text-xl font-semibold">Module 1: Idea Deconstruction</h1>
          <p className="text-sm text-muted-foreground">Organize “{idea}” into digestible cards. Drag to reorder and move across columns.</p>
        </div>
        <nav className="hidden md:flex gap-2" aria-label="quick add">
          {columns.map((c) => (
            <button key={c.key} onClick={() => handleAdd(c.key)} className="px-3 py-1.5 text-sm rounded-md border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground">
              + {c.label}
            </button>
          ))}
        </nav>
      </header>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="w-full overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {columns.map(({ key, label }) => (
              <div key={key} className="w-[320px] flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
                  <button onClick={() => handleAdd(key)} className="text-xs px-2 py-1 rounded border border-border bg-card hover:bg-accent">+ Add</button>
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-2 min-h-[200px]">
                  <DroppableColumn id={key}>
                    <SortableContext items={board[key].map((c) => c.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-2">
                        {board[key].map((c) => (
                          <SortableCard
                            key={c.id}
                            id={c.id}
                            content={c.content}
                            onChange={(val) =>
                              setBoard((prev) => ({
                                ...prev,
                                [key]: prev[key].map((x) => (x.id === c.id ? { ...x, content: val } : x)),
                              }))
                            }
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DroppableColumn>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DndContext>
    </section>
  );
}

export default DeconstructBoard;
