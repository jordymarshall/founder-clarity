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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Check, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightBlock {
  id: string;
  category: 'problem' | 'alternatives' | 'segments' | 'early-adopters' | 'job-to-be-done';
  title: string;
  content: string;
}

interface DeconstructCanvasProps {
  className?: string;
  idea: string;
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
    color: 'bg-[#C5EBC3] border-[#A8D8A6] text-green-800',
    description: 'What job is the customer hiring your product to do?',
    parent: true,
  },
};

function SortableInsightBlock({ block, onEdit, onSave, onCancel, editingId }: {
  block: InsightBlock;
  onEdit: (id: string) => void;
  onSave: (id: string, title: string, content: string) => void;
  onCancel: () => void;
  editingId: string | null;
}) {
  const [title, setTitle] = useState(block.title);
  const [content, setContent] = useState(block.content);
  const isEditing = editingId === block.id;
  const isEmpty = !block.title && !block.content;
  
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
      <Card className={cn(
        "relative transition-all duration-200 hover:shadow-md cursor-pointer mb-3",
        config.color,
        isDragging && "shadow-xl",
        isEditing && "ring-2 ring-primary ring-offset-1"
      )}>
        {!isDragging && !isEditing && (
          <div 
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        
        <CardHeader className="pb-2">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Insight title..."
                className="text-sm font-medium border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                autoFocus
                onKeyDown={handleKeyDown}
              />
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
          ) : (
            <div className="flex items-start justify-between">
              <CardTitle 
                className={cn(
                  "text-sm font-medium cursor-text",
                  isEmpty && "text-muted-foreground"
                )}
                onClick={handleStartEditing}
              >
                {block.title || "New Insight"}
              </CardTitle>
              {!isEmpty && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleStartEditing}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
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
                "min-h-[60px] text-sm leading-relaxed cursor-text",
                isEmpty && "text-muted-foreground italic",
                !isEmpty && "hover:bg-background/50 rounded p-1 -m-1 transition-colors"
              )}
              onClick={handleStartEditing}
            >
              {block.content || "Click to add insights..."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryContainer({ category, blocks, onAddBlock, onEdit, onSave, onCancel, editingId, isSubsection = false }: {
  category: keyof typeof categoryConfig;
  blocks: InsightBlock[];
  onAddBlock: (category: keyof typeof categoryConfig) => void;
  onEdit: (id: string) => void;
  onSave: (id: string, title: string, content: string) => void;
  onCancel: () => void;
  editingId: string | null;
  isSubsection?: boolean;
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
                />
              ))
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}

function ParentCategoryContainer({ category, subsectionCategory, blocks, onAddBlock, onEdit, onSave, onCancel, editingId }: {
  category: keyof typeof categoryConfig;
  subsectionCategory: keyof typeof categoryConfig;
  blocks: InsightBlock[];
  onAddBlock: (category: keyof typeof categoryConfig) => void;
  onEdit: (id: string) => void;
  onSave: (id: string, title: string, content: string) => void;
  onCancel: () => void;
  editingId: string | null;
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
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function DeconstructCanvas({ className, idea }: DeconstructCanvasProps) {
  const [blocks, setBlocks] = useState<InsightBlock[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

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
    const newBlock: InsightBlock = {
      id: `${category}-${Date.now()}`,
      category,
      title: '',
      content: '',
    };
    setBlocks((prev) => [...prev, newBlock]);
    // Auto-edit the new block
    setTimeout(() => setEditingId(newBlock.id), 100);
  }, []);

  const activeBlock = blocks.find((block) => block.id === activeId);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Idea Deconstruction Canvas</h3>
        <p className="text-sm text-muted-foreground">
          Break down "{idea}" into its core components • Drag insights between sections
        </p>
      </div>

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
            />
          </div>
        </div>

        <DragOverlay>
          {activeBlock ? (
            <Card className={cn(
              "rotate-3 shadow-2xl opacity-90",
              categoryConfig[activeBlock.category].color
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {activeBlock.title || "New Insight"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="min-h-[60px] text-sm">
                  {activeBlock.content || "Click to add insights..."}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}