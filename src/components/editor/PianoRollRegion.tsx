"use client";

import { useEffect, useRef, useState } from "react";
import { Midi } from "@tonejs/midi";
import { cn } from "@/lib/utils";

interface PianoRollRegionProps {
  base64Midi: string | null;
  positionMs: number;
  durationMs: number;
  offsetMs?: number;
  onOffsetChange?: (offsetMs: number) => void;
  className?: string;
  color?: string;
  progressColor?: string;
}

export function PianoRollRegion({
  base64Midi,
  positionMs,
  durationMs,
  offsetMs = 0,
  onOffsetChange,
  className,
  color = "#8B5CF6", // Purple by default
  progressColor = "#7C3AED",
}: PianoRollRegionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse MIDI data
  const midiDataRef = useRef<Midi | null>(null);

  useEffect(() => {
    if (!base64Midi) {
      midiDataRef.current = null;
      return;
    }
    
    try {
      // Decode Base64 safely
      const binaryString = window.atob(base64Midi.split(",")[1] || base64Midi);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      midiDataRef.current = new Midi(bytes);
    } catch (err) {
      console.error("Failed to parse Base64 MIDI for Piano Roll", err);
      midiDataRef.current = null;
    }
  }, [base64Midi]);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Dragging Logic
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const startOffsetMs = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!onOffsetChange || !dimensions.width) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    startOffsetMs.current = offsetMs;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !onOffsetChange || !dimensions.width || !durationMs) return;
    const deltaX = e.clientX - dragStartX.current;
    const deltaMs = (deltaX / dimensions.width) * durationMs;
    // Don't allow negative offsetMs (audio before 0 time)
    const newOffset = Math.max(0, startOffsetMs.current + deltaMs);
    onOffsetChange(newOffset);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Handle Resize of the outer container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Render Piano Roll
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !midiDataRef.current || dimensions.width === 0 || dimensions.height === 0 || durationMs <= 0) return;

    const scrollContainer = canvas.closest('.overflow-x-auto') as HTMLDivElement;
    if (!scrollContainer) return;

    let rafId: number;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const visibleWidth = scrollContainer.clientWidth - 256;
      const scrollLeft = scrollContainer.scrollLeft;
      const dpr = window.devicePixelRatio || 1;

      // Restrict Canvas Memory Size to Visible Width
      if (canvas.width !== visibleWidth * dpr) {
        canvas.width = visibleWidth * dpr;
        canvas.style.width = `${visibleWidth}px`;
      }
      if (canvas.height !== dimensions.height * dpr) {
        canvas.height = dimensions.height * dpr;
        canvas.style.height = `${dimensions.height}px`;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
      ctx.scale(dpr, dpr);

      const width = dimensions.width;
      const height = dimensions.height;

      // Clear Visible Area
      ctx.clearRect(0, 0, visibleWidth, height);

      // Translate context so drawing coordinates perfectly map absolute document pixels
      ctx.translate(-scrollLeft, 0);

      const midi = midiDataRef.current;
      if (!midi || midi.tracks.length === 0) return;

      // Flatten notes from all tracks
      const allNotes = midi.tracks.flatMap(t => t.notes);
      if (allNotes.length === 0) return;

      // Find min/max pitch to scale Y axis efficiently, and find absolute start time to normalize
      let minPitch = 127;
      let maxPitch = 0;
      let minTimeMs = Infinity;
      
      allNotes.forEach(n => {
        if (n.midi < minPitch) minPitch = n.midi;
        if (n.midi > maxPitch) maxPitch = n.midi;
        const startMs = n.time * 1000;
        if (startMs < minTimeMs) minTimeMs = startMs;
      });
      
      // If no valid time found, default to 0
      if (minTimeMs === Infinity) minTimeMs = 0;

      // Add padding
      minPitch = Math.max(0, minPitch - 5);
      maxPitch = Math.min(127, maxPitch + 5);
      const pitchRange = maxPitch - minPitch;

      const progressX = (positionMs / durationMs) * width;

      // Optimize: Only draw notes that are visible (with a 500px safe buffer so long notes don't pop out)
      const minDrawX = Math.max(0, scrollLeft - 500);
      const maxDrawX = Math.min(width, scrollLeft + visibleWidth + 500);

      allNotes.forEach((note) => {
        // Normalize time so the first note is exactly at 0
        const startMs = (note.time * 1000) - minTimeMs;
        const durMs = note.duration * 1000;
        const endMs = startMs + durMs;

        const x = ((startMs + offsetMs) / durationMs) * width;
        const noteWidth = Math.max(2, (durMs / durationMs) * width); // minimum 2px width
        
        if (x + noteWidth < minDrawX || x > maxDrawX) {
          return; // Skip drawing notes that are outside the visible port
        }

        // Invert Y: highest pitch at top (y=0)
        const normalizedPitch = (note.midi - minPitch) / pitchRange;
        const y = height - (normalizedPitch * height) - 4; // 4px note height
        const noteHeight = 4;

        // Highlight ONLY if the playhead is actively inside the note's duration
        if (startMs + offsetMs <= positionMs && endMs + offsetMs >= positionMs) {
          ctx.fillStyle = progressColor; 
        } else {
          ctx.fillStyle = color;
        }

        ctx.fillRect(x, y, noteWidth, noteHeight);
      });
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(draw);
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    
    draw();

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [positionMs, durationMs, offsetMs, color, progressColor, base64Midi, dimensions]);

  return (
    <div 
      ref={containerRef} 
      className={cn("relative w-full h-full pointer-events-auto", onOffsetChange ? "cursor-pointer active:cursor-grabbing" : "", className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <canvas 
        ref={canvasRef} 
        className="sticky left-[256px] top-0 pointer-events-none" 
        style={{ height: "100%", imageRendering: "pixelated" }} 
      />
    </div>
  );
}
