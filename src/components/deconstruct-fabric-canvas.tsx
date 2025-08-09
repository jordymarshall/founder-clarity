import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Textbox, Group, Point } from "fabric";
import { cn } from "@/lib/utils";

// A flowy, collaborative canvas for deconstructing ideas into editable blocks.
// - Fabric.js v6 freeform canvas
// - Minimal toolbar to add category blocks
// - Inline editing via Textbox, drag to reposition
// - No business logic changes; purely UX/presentation

export type DeconstructFabricCanvasProps = {
  className?: string;
  idea: string;
};

type CategoryKey =
  | "problem"
  | "alternatives"
  | "segments"
  | "early-adopters"
  | "job-to-be-done";

const categories: Array<{ key: CategoryKey; label: string; hueVar: string }> = [
  { key: "problem", label: "Problem", hueVar: "--primary" },
  { key: "alternatives", label: "Existing Alternatives", hueVar: "--secondary" },
  { key: "segments", label: "Customer Segments", hueVar: "--accent" },
  { key: "early-adopters", label: "Early Adopters", hueVar: "--muted-foreground" },
  { key: "job-to-be-done", label: "Job to be Done", hueVar: "--ring" },
];

function resolveCssHsl(varName: string) {
  // Create a temporary node to compute the HSL var to rgb string
  const span = document.createElement("span");
  span.style.color = `hsl(var(${varName}))`;
  document.body.appendChild(span);
  const rgb = getComputedStyle(span).color || "rgb(99, 102, 241)"; // fallback
  span.remove();
  return rgb;
}

function useResizeObserver(callback: (rect: DOMRect) => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) callback(cr as DOMRect);
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [callback]);
  return ref;
}

export function DeconstructFabricCanvas({ className, idea }: DeconstructFabricCanvasProps) {
  const wrapperRef = useResizeObserver((rect) => {
    if (!fabricRef.current) return;
    fabricRef.current.setWidth(rect.width);
    fabricRef.current.setHeight(rect.height);
    fabricRef.current.requestRenderAll();
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  // Grid pan/zoom helpers
  const isPanning = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new FabricCanvas(canvasRef.current, {
      backgroundColor: "transparent",
      selection: true,
    });

    // Pan & zoom
    canvas.on("mouse:wheel", (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(3, Math.max(0.5, zoom));
      const { offsetX, offsetY } = opt.e;
      canvas.zoomToPoint(new Point(offsetX, offsetY), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    canvas.on("mouse:down", (opt: any) => {
      const evt = opt.e as MouseEvent;
      // Hold space or click on empty area to pan
      if (evt.button === 0 && (!opt.target || (evt as any).spaceKey)) {
        isPanning.current = true;
        lastPos.current = { x: evt.clientX, y: evt.clientY };
        canvas.setCursor("grabbing");
      }
    });

    canvas.on("mouse:move", (opt: any) => {
      if (!isPanning.current || !lastPos.current) return;
      const e = opt.e as MouseEvent;
      const vpt = canvas.viewportTransform!;
      vpt[4] += e.clientX - lastPos.current.x;
      vpt[5] += e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      canvas.requestRenderAll();
    });

    canvas.on("mouse:up", () => {
      isPanning.current = false;
      lastPos.current = null;
      canvas.setCursor("default");
    });

    // keyboard space handler
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") (e as any).spaceKey = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") (e as any).spaceKey = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    fabricRef.current = canvas;
    setIsReady(true);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  const addBlock = (cat: CategoryKey) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const idx = addedCount;
    const x = 80 + (idx % 3) * 260;
    const y = 80 + Math.floor(idx / 3) * 200;
    const color = resolveCssHsl(categories.find((c) => c.key === cat)!.hueVar);
    const titleColor = resolveCssHsl("--muted-foreground");
    const contentColor = resolveCssHsl("--card-foreground");
    const cardColor = resolveCssHsl("--card");

    const title = new Textbox(categories.find((c) => c.key === cat)!.label, {
      left: 0,
      top: 0,
      fontSize: 12,
      fontWeight: "600",
      fill: titleColor,
      editable: false,
    } as any);

    const content = new Textbox("Click to edit...", {
      left: 0,
      top: 18,
      width: 220,
      fontSize: 14,
      lineHeight: 1.4,
      fill: contentColor,
      backgroundColor: "transparent",
      editable: true,
    } as any);

    const rect = new Rect({
      rx: 8,
      ry: 8,
      width: 240,
      height: 120,
      fill: cardColor,
      stroke: color,
      strokeWidth: 1,
    } as any);

    // Group: rect behind texts
    const group = new Group([rect, title, content], {
      left: x,
      top: y,
      hasControls: true,
      subTargetCheck: true,
      hoverCursor: "move",
    } as any);

    // Bring to front when selected (optional)
    // (Disabled for v6 typings)

    // Auto resize rect to content height
    const adjust = () => {
      const padding = 16;
      const height = content.height! + title.height! + padding;
      rect.set({ width: Math.max(240, content.width! + padding), height: Math.max(120, height) });
      canvas.requestRenderAll();
    };
    content.on("changed", adjust);
    content.on("editing:exited", adjust);

    canvas.add(group);
    setAddedCount((n) => n + 1);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
  };

  const showEmptyState = addedCount === 0;

  return (
    <section className={cn("flex flex-col gap-3", className)} aria-labelledby="deconstruct-title">
      <header className="flex items-center justify-between">
        <div>
          <h1 id="deconstruct-title" className="text-xl font-semibold">Module 1: Idea Deconstruction</h1>
          <p className="text-sm text-muted-foreground">Break down “{idea}” into digestible blocks on a canvas. Drag, edit, and arrange.</p>
        </div>
        <nav aria-label="Add blocks" className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => addBlock(c.key)}
              className="px-3 py-1.5 text-sm rounded-md border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
            >
              + {c.label}
            </button>
          ))}
        </nav>
      </header>

      <div ref={wrapperRef} className="relative h-[70vh] w-full border rounded-md bg-background">
        {/* dotted grid backdrop */}
        <div className="absolute inset-0 rounded-md" aria-hidden style={{
          backgroundImage:
            "radial-gradient(hsl(var(--muted-foreground)/0.2) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0",
        }} />
        <canvas ref={canvasRef} className="relative z-10 w-full h-full" />

        {showEmptyState && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            <div className="text-center p-4 rounded-md bg-card/70 backdrop-blur border border-border">
              <p className="text-sm text-muted-foreground">
                Start by adding a block from the top-right. Double‑click text to edit. Drag to reposition.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default DeconstructFabricCanvas;
