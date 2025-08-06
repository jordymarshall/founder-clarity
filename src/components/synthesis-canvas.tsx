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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
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
  category: 'push' | 'pull' | 'inertia' | 'friction' | 'pattern';
  title: string;
  content: string;
  position: { x: number; y: number };
}

interface SynthesisCanvasProps {
  className?: string;
}

const categoryConfig = {
  push: {
    label: 'Push Forces',
    color: 'bg-red-50 border-red-200 text-red-900',
    description: 'Switching triggers & problems',
  },
  pull: {
    label: 'Pull Forces', 
    color: 'bg-green-50 border-green-200 text-green-900',
    description: 'Desired outcomes',
  },
  inertia: {
    label: 'Inertia',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-900', 
    description: 'Resistance to change',
  },
  friction: {
    label: 'Friction',
    color: 'bg-orange-50 border-orange-200 text-orange-900',
    description: 'Pain points with current solution',
  },
  pattern: {
    label: 'Patterns',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    description: 'Common insights across interviews',
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
        "relative transition-all duration-200 hover:shadow-lg cursor-pointer",
        config.color,
        isDragging && "shadow-xl"
      )}>
        {!isDragging && (
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
                placeholder="Block title..."
                className="text-sm font-medium"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} className="h-6 px-2">
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 px-2">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  {block.title || config.label}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(block.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          {isEditing ? (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add your insights here..."
              className="min-h-[80px] text-sm resize-none"
            />
          ) : (
            <div className="min-h-[80px] text-sm leading-relaxed">
              {block.content || "Click to add insights..."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SynthesisCanvas({ className }: SynthesisCanvasProps) {
  const [blocks, setBlocks] = useState<InsightBlock[]>([
    {
      id: 'push-1',
      category: 'push',
      title: '',
      content: '',
      position: { x: 0, y: 0 },
    },
    {
      id: 'pull-1',
      category: 'pull',
      title: '',
      content: '',
      position: { x: 1, y: 0 },
    },
    {
      id: 'inertia-1',
      category: 'inertia',
      title: '',
      content: '',
      position: { x: 0, y: 1 },
    },
    {
      id: 'friction-1',
      category: 'friction',
      title: '',
      content: '',
      position: { x: 1, y: 1 },
    },
    {
      id: 'pattern-1',
      category: 'pattern',
      title: '',
      content: '',
      position: { x: 0, y: 2 },
    },
  ]);
  
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

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }, []);

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
      position: { x: 0, y: blocks.length },
    };
    setBlocks((prev) => [...prev, newBlock]);
  }, [blocks.length]);

  const activeBlock = blocks.find((block) => block.id === activeId);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Customer Forces Canvas</h3>
        <p className="text-sm text-muted-foreground">
          Drag blocks to reorganize • Click to edit • Visual patterns emerge naturally
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map(b => b.id)} strategy={rectSortingStrategy}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {blocks.map((block) => (
              <SortableInsightBlock
                key={block.id}
                block={block}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                editingId={editingId}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeBlock ? (
            <Card className={cn(
              "rotate-3 shadow-2xl opacity-90",
              categoryConfig[activeBlock.category].color
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {activeBlock.title || categoryConfig[activeBlock.category].label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="min-h-[80px] text-sm">
                  {activeBlock.content || "Click to add insights..."}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="flex flex-wrap gap-2 justify-center pt-4 border-t">
        {Object.entries(categoryConfig).map(([key, config]) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            onClick={() => addNewBlock(key as keyof typeof categoryConfig)}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add {config.label}
          </Button>
        ))}
      </div>
    </div>
  );
}