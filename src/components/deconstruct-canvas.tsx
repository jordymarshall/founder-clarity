import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Check, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogHeading, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
interface InsightBlock {
  id: string;
  category: 'problem' | 'alternatives' | 'segments' | 'early-adopters' | 'job-to-be-done';
  title: string;
  content: string;
}

interface DeconstructCanvasProps {
  className?: string;
  idea: string;
  initialData?: {
    problem?: string[];
    existingAlternatives?: string[];
    customerSegments?: string[];
    earlyAdopters?: string[];
    jobToBeDone?: string[];
  };
  onBlocksChange?: (blocks: InsightBlock[]) => void;
}

const categoryConfig = {
  problem: {
    label: 'Problem',
    color: 'bg-red-50 border-red-200 text-red-900',
    description: 'What problem are you solving?',
    parent: true,
  },
  alternatives: {
    label: 'Existing Alternatives',
    color: 'bg-gray-50 border-gray-200 text-gray-700',
    description: 'Current solutions people use',
    parent: false,
    parentCategory: 'problem',
  },
  segments: {
    label: 'Customer Segments',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    description: 'Who are your potential customers?',
    parent: true,
  },
  'early-adopters': {
    label: 'Early Adopter Segment',
    color: 'bg-gray-50 border-gray-200 text-gray-700',
    description: 'First customers willing to try your solution',
    parent: false,
    parentCategory: 'segments',
  },
  'job-to-be-done': {
    label: 'Job to be Done',
    color: 'bg-green-50 border-green-200 text-green-900',
    description: 'What job is the customer hiring your product to do?',
    parent: true,
  },
};

function SortableInsightBlock({ block, onEdit, onSave, onCancel, editingId, onOpenDetails }: {
  block: InsightBlock;
  onEdit: (id: string) => void;
  onSave: (id: string, title: string, content: string) => void;
  onCancel: () => void;
  editingId: string | null;
  onOpenDetails: (block: InsightBlock) => void;
}) {
  const [title, setTitle] = useState(block.title);
  const [content, setContent] = useState(block.content);
  const isEditing = editingId === block.id;
  const isEmpty = !block.content;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = categoryConfig[block.category];

  const handleSave = () => {
    onSave(block.id, title, content);
  };

  const handleCancel = () => {
    setTitle(block.title);
    setContent(block.content);
    onCancel();
  };

  const handleStartEditing = () => {
    onEdit(block.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group transition-all duration-200",
        isDragging && "opacity-50 rotate-1 scale-105"
      )}
    >
      <Card
        className={cn(
          "relative transition-all duration-200 hover:shadow-md cursor-pointer mb-3",
          config.color,
          isDragging && "shadow-xl",
          isEditing && "ring-2 ring-primary ring-offset-1"
        )}
        role="button"
        onClick={() => {
          if (!isEditing) onOpenDetails(block)
        }}
      >
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); handleStartEditing(); }}
              className="h-6 w-6 p-0"
              aria-label="Edit insight"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <div
              className="cursor-grab active:cursor-grabbing p-1"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        
        {isEditing && (
          <CardHeader className="pb-2">
            <div className="space-y-2">
              <div className="flex gap-2 opacity-75">
                <Button size="sm" onClick={handleSave} className="h-6 px-2 text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 px-2 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <span className="text-xs text-muted-foreground self-center">⌘+Enter to save</span>
              </div>
            </div>
          </CardHeader>
        )}
        
        <CardContent className={cn(isEditing ? "pt-0" : "pt-3")}>
          {isEditing ? (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add your insights here..."
              className="min-h-[60px] text-sm resize-none border-none p-0 focus-visible:ring-0 bg-transparent"
              onKeyDown={handleKeyDown}
            />
          ) : (
            <div 
              className={cn(
                "min-h-[60px] text-sm leading-relaxed whitespace-pre-wrap break-words",
                isEmpty ? "text-muted-foreground italic" : "font-semibold hover:bg-background/50 rounded p-1 -m-1 transition-colors"
              )}
            >
              {block.content || "Click to add insights..."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryContainer({ category, blocks, onAddBlock, onEdit, onSave, onCancel, editingId, isSubsection = false, onOpenDetails }: {
  category: keyof typeof categoryConfig;
  blocks: InsightBlock[];
  onAddBlock: (category: keyof typeof categoryConfig) => void;
  onEdit: (id: string) => void;
  onSave: (id: string, title: string, content: string) => void;
  onCancel: () => void;
  editingId: string | null;
  isSubsection?: boolean;
  onOpenDetails: (block: InsightBlock) => void;
}) {
  const config = categoryConfig[category];
  const categoryBlocks = blocks.filter(block => block.category === category);
  
  const { setNodeRef, isOver } = useDroppable({
    id: category,
  });

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        "h-full transition-all duration-200",
        isSubsection ? "min-h-[150px] border-dashed" : "min-h-[300px]",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <CardHeader className={cn("pb-3", isSubsection && "pb-2")}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={cn(
              "font-semibold",
              isSubsection ? "text-sm" : "text-base"
            )}>
              {config.label}
            </CardTitle>
            <p className={cn(
              "text-muted-foreground mt-1",
              isSubsection ? "text-xs" : "text-xs"
            )}>
              {config.description}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddBlock(category)}
            disabled={category === 'job-to-be-done' && categoryBlocks.length >= 1}
            className={cn(
              "p-0",
              isSubsection ? "h-6 w-6" : "h-7 w-7"
            )}
          >
            <Plus className={cn(isSubsection ? "h-2.5 w-2.5" : "h-3 w-3")} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className={cn("pt-0", isSubsection && "pb-3")}>
        <SortableContext items={categoryBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {categoryBlocks.length === 0 ? (
              <div className={cn(
                "border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center",
                isSubsection ? "min-h-[60px]" : "min-h-[100px]"
              )}>
                <p className="text-sm text-muted-foreground">Drop insights here or click + to add</p>
              </div>
            ) : (
              categoryBlocks.map((block) => (
                <SortableInsightBlock
                  key={block.id}
                  block={block}
                  onEdit={onEdit}
                  onSave={onSave}
                  onCancel={onCancel}
                  editingId={editingId}
                  onOpenDetails={onOpenDetails}
                />
              ))
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}

function ParentCategoryContainer({ category, subsectionCategory, blocks, onAddBlock, onEdit, onSave, onCancel, editingId, onOpenDetails }: {
  category: keyof typeof categoryConfig;
  subsectionCategory: keyof typeof categoryConfig;
  blocks: InsightBlock[];
  onAddBlock: (category: keyof typeof categoryConfig) => void;
  onEdit: (id: string) => void;
  onSave: (id: string, title: string, content: string) => void;
  onCancel: () => void;
  editingId: string | null;
  onOpenDetails: (block: InsightBlock) => void;
}) {
  const config = categoryConfig[category];
  const categoryBlocks = blocks.filter(block => block.category === category);
  
  const { setNodeRef, isOver } = useDroppable({
    id: category,
  });

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        "h-full min-h-[400px] transition-all duration-200",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{config.label}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddBlock(category)}
            className="h-7 w-7 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Main category content */}
        <SortableContext items={categoryBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {categoryBlocks.length === 0 ? (
              <div className="min-h-[120px] border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Drop insights here or click + to add</p>
              </div>
            ) : (
              categoryBlocks.map((block) => (
                <SortableInsightBlock
                  key={block.id}
                  block={block}
                  onEdit={onEdit}
                  onSave={onSave}
                  onCancel={onCancel}
                  editingId={editingId}
                  onOpenDetails={onOpenDetails}
                />
              ))
            )}
          </div>
        </SortableContext>

        {/* Subsection */}
        <div className="pt-2">
          <CategoryContainer
            category={subsectionCategory}
            blocks={blocks}
            onAddBlock={onAddBlock}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
            editingId={editingId}
            isSubsection={true}
            onOpenDetails={onOpenDetails}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function DeconstructCanvas({ className, idea, initialData, onBlocksChange }: DeconstructCanvasProps) {
  const [blocks, setBlocks] = useState<InsightBlock[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detailBlock, setDetailBlock] = useState<InsightBlock | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<{ rationale: string; sources: { title: string; url: string }[]; structure?: { context?: string; forces?: { push?: string[]; pull?: string[]; inertia?: string[]; friction?: string[] }; evidence?: { text: string; urls: string[] }[]; implications?: string[]; conclusion?: string } } | null>(null);
  const isLoading = !initialData || blocks.length === 0;

  // Seed with initialData once
  React.useEffect(() => {
    if (!initialData) return;
    if (blocks.length > 0) return;
    const push = (arr: string[] | undefined, category: InsightBlock['category']) =>
      (arr || []).slice(0, 5).map((text, idx) => ({
        id: `${category}-${Date.now()}-${idx}`,
        category,
        title: text.split(':')[0]?.slice(0, 48) || 'Insight',
        content: text,
      } as InsightBlock));
    const seeded = [
      ...push(initialData.problem, 'problem'),
      ...push(initialData.existingAlternatives, 'alternatives'),
      ...push(initialData.customerSegments, 'segments'),
      ...push(initialData.earlyAdopters, 'early-adopters'),
      ...push((initialData.jobToBeDone || []).slice(0, 1), 'job-to-be-done'),
    ];
    if (seeded.length) setBlocks(seeded);
  }, [initialData, blocks.length]);

  // Lift state up when blocks change
  React.useEffect(() => {
    onBlocksChange?.(blocks);
  }, [blocks, onBlocksChange]);

// Keep loading until initial data arrives and blocks are populated

  React.useEffect(() => {
    let aborted = false;
    if (!detailBlock) {
      setDetailData(null);
      setDetailLoading(false);
      return;
    }
    setDetailLoading(true);
    setDetailData(null);
    const ctx = {
      problem: blocks.filter(b => b.category === 'problem').map(b => b.content),
      existingAlternatives: blocks.filter(b => b.category === 'alternatives').map(b => b.content),
      customerSegments: blocks.filter(b => b.category === 'segments').map(b => b.content),
      earlyAdopters: blocks.filter(b => b.category === 'early-adopters').map(b => b.content),
      jobToBeDone: blocks.filter(b => b.category === 'job-to-be-done').map(b => b.content),
    };
    supabase.functions.invoke('enrich-insight', {
      body: {
        idea,
        block: { category: detailBlock.category, content: detailBlock.content },
        context: ctx,
      }
    }).then(({ data, error }) => {
      if (aborted) return;
      if (error) {
        console.error('enrich-insight error', error);
        setDetailData({
          rationale:
            'This insight matters because it affects customer progress in this area. Expand with specific context and Customer Forces (push, pull, inertia, friction).',
          sources: [],
          structure: undefined,
        });
      } else {
        setDetailData(data?.data || null);
      }
    }).finally(() => {
      if (!aborted) setDetailLoading(false);
    });
    return () => { aborted = true; };
  }, [detailBlock, blocks, idea]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find the active block
    const activeBlock = blocks.find(block => block.id === activeId);
    if (!activeBlock) return;
    
    // Check if we're dropping on a category container
    if (Object.keys(categoryConfig).includes(overId)) {
      const newCategory = overId as keyof typeof categoryConfig;

      // Enforce single-card rule for Job to be Done
      if (newCategory === 'job-to-be-done') {
        const jobBlocks = blocks.filter(b => b.category === 'job-to-be-done');
        const movingWithinSame = activeBlock.category === 'job-to-be-done';
        if (jobBlocks.length >= 1 && !movingWithinSame) {
          return; // prevent moving another card into JTBD
        }
      }

      if (activeBlock.category !== newCategory) {
        setBlocks(prev => 
          prev.map(block => 
            block.id === activeId 
              ? { ...block, category: newCategory }
              : block
          )
        );
      }
    }
  }, [blocks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const activeBlock = blocks.find(block => block.id === active.id);
      const overBlock = blocks.find(block => block.id === over?.id);
      
      if (activeBlock && overBlock && activeBlock.category === overBlock.category) {
        setBlocks((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over?.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }

    setActiveId(null);
  }, [blocks]);

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
  }, []);

  const handleSave = useCallback((id: string, title: string, content: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, title, content } : block
      )
    );
    setEditingId(null);
  }, []);

  const handleCancel = useCallback(() => {
    setEditingId(null);
  }, []);

  const addNewBlock = useCallback((category: keyof typeof categoryConfig) => {
    // Enforce single-card rule for Job to be Done
    if (category === 'job-to-be-done') {
      const existing = blocks.find(b => b.category === 'job-to-be-done');
      if (existing) {
        setEditingId(existing.id);
        return;
      }
    }
    const newBlock: InsightBlock = {
      id: `${category}-${Date.now()}`,
      category,
      title: '',
      content: '',
    };
    setBlocks((prev) => [...prev, newBlock]);
    // Auto-edit the new block
    setTimeout(() => setEditingId(newBlock.id), 100);
  }, [blocks]);

  const activeBlock = blocks.find((block) => block.id === activeId);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Idea Deconstruction Canvas</h3>
        <p className="text-sm text-muted-foreground">
          Break down "{idea}" into its core components • Drag insights between sections
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[420px] w-full rounded-lg" />
            <Skeleton className="h-[420px] w-full rounded-lg" />
          </div>
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">
            {/* Row 1: Problem + Customer Segments (with nested subsections) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Problem with nested Alternatives */}
              <ParentCategoryContainer
                category="problem"
                subsectionCategory="alternatives"
                blocks={blocks}
                onAddBlock={addNewBlock}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                editingId={editingId}
                onOpenDetails={(b) => setDetailBlock(b)}
              />

              {/* Customer Segments with nested Early Adopters */}
              <ParentCategoryContainer
                category="segments"
                subsectionCategory="early-adopters"
                blocks={blocks}
                onAddBlock={addNewBlock}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                editingId={editingId}
                onOpenDetails={(b) => setDetailBlock(b)}
              />
            </div>

            {/* Row 2: Full-width Job to be Done section */}
            <div className="w-full">
              <CategoryContainer
                category="job-to-be-done"
                blocks={blocks}
                onAddBlock={addNewBlock}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                editingId={editingId}
                onOpenDetails={(b) => setDetailBlock(b)}
              />
            </div>
          </div>

          <DragOverlay>
            {activeBlock ? (
              <Card className={cn(
                "rotate-3 shadow-2xl opacity-90",
                categoryConfig[activeBlock.category].color
              )}>
                <CardContent className="p-4">
                  <div className="min-h-[60px] text-sm whitespace-pre-wrap break-words font-semibold">
                    {activeBlock.content || "Click to add insights..."}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Details Dialog */}
      <Dialog open={!!detailBlock} onOpenChange={(open) => { if (!open) { setDetailBlock(null); setDetailData(null); setDetailLoading(false); } }}>
        <DialogContent className="max-w-lg animate-fade-in">
          <DialogHeader>
            <DialogHeading className="text-lg font-semibold break-words whitespace-pre-wrap !leading-snug">
              {detailBlock?.content || 'Insight details'}
            </DialogHeading>
            <DialogDescription>
              {detailBlock ? categoryConfig[detailBlock.category].label : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <section>
              <h4 className="text-sm font-medium mb-2">Insight</h4>
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {detailBlock?.content || 'No additional details.'}
              </div>
            </section>

            {detailData?.structure?.context && (
              <section>
                <h4 className="text-sm font-medium mb-2">Context</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {detailData.structure.context}
                </p>
              </section>
            )}

            {detailData?.structure?.forces && (
              <section>
                <h4 className="text-sm font-medium mb-2">Customer Forces</h4>
                <div className="grid grid-cols-2 gap-3">
                  {(['push','pull','inertia','friction'] as const).map((k) => (
                    <div key={k}>
                      <div className="text-xs font-medium mb-1 capitalize">{k}</div>
                      {detailLoading ? (
                        <Skeleton className="h-4 w-4/5" />
                      ) : (
                        <ul className="list-disc pl-4 space-y-1">
                          {(detailData.structure?.forces?.[k] || []).map((t, i) => (
                            <li key={i} className="text-xs text-muted-foreground">{t}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h4 className="text-sm font-medium mb-2">Rationale</h4>
              {detailLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {detailData?.rationale || '—'}
                </p>
              )}
            </section>

            {detailData?.structure?.evidence && detailData.structure.evidence.length > 0 && (
              <section>
                <h4 className="text-sm font-medium mb-2">Evidence</h4>
                <ul className="space-y-2">
                  {detailData.structure.evidence.map((evi, i) => (
                    <li key={i} className="text-sm">
                      <div className="text-muted-foreground">{evi.text}</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(evi.urls || []).map((u, j) => (
                          <a key={j} href={u} target="_blank" rel="noreferrer" className="text-xs underline underline-offset-2">
                            {new URL(u).hostname.replace(/^www\./,'')}
                          </a>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {detailData?.structure?.implications && detailData.structure.implications.length > 0 && (
              <section>
                <h4 className="text-sm font-medium mb-2">Implications</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {detailData.structure.implications.map((t, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{t}</li>
                  ))}
                </ul>
              </section>
            )}

            {detailData?.structure?.conclusion && (
              <section>
                <h4 className="text-sm font-medium mb-2">Conclusion</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detailData.structure.conclusion}</p>
              </section>
            )}

            <section>
              <h4 className="text-sm font-medium mb-2">Sources</h4>
              {detailLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-4 w-2/5" />
                </div>
              ) : detailData?.sources && detailData.sources.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {detailData.sources.map((s, i) => (
                    <li key={i} className="text-sm">
                      <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                        {s.title || s.url}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </section>
          </div>

          <DialogFooter>
            {detailBlock && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(detailBlock.id);
                  setDetailBlock(null);
                  setDetailData(null);
                }}
              >
                Edit
              </Button>
            )}
            <Button onClick={() => { setDetailBlock(null); setDetailData(null); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}