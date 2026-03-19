"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface WaveformProps {
  buffer?: AudioBuffer;
  positionMs: number;
  durationMs: number;
  color?: string;
  progressColor?: string;
  loopStartMs?: number;
  loopEndMs?: number;
  offsetMs?: number;
  onOffsetChange?: (offsetMs: number) => void;
  className?: string;
}

export function Waveform({
  buffer,
  positionMs,
  durationMs,
  color = "#3f3f46", // zinc-700
  progressColor = "#3b82f6", // blue-500
  loopStartMs,
  loopEndMs,
  offsetMs = 0,
  onOffsetChange,
  className,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
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
    // Quantize step (optional, but keep it smooth for continuous dragging)
    onOffsetChange(newOffset);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Handle Resize
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

  // Draw PCM Waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !buffer || dimensions.width === 0 || dimensions.height === 0 || durationMs <= 0) return;

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

      // Get PCM Data from the first channel
      const channelData = buffer.getChannelData(0);
      const bufferDurationMs = buffer.duration * 1000;
      
      const bufferWidth = (bufferDurationMs / durationMs) * width;
      const startX = (offsetMs / durationMs) * width;

      const samplesPerPixel = Math.max(1, Math.ceil(channelData.length / bufferWidth));
      const halfHeight = height / 2;

      const progressPct = durationMs > 0 ? positionMs / durationMs : 0;
      const progressX = progressPct * width;

      ctx.lineWidth = 1;

      // Optimize: Only iterate through visible pixels
      const minDrawX = Math.max(0, scrollLeft);
      const maxDrawX = Math.min(width, scrollLeft + visibleWidth);

      for (let x = minDrawX; x < maxDrawX; x++) {
        if (x < startX || x >= startX + bufferWidth) {
          continue;
        }

        let min = 1.0;
        let max = -1.0;

        const bufferPixelX = x - startX;
        const startSample = Math.floor(bufferPixelX * samplesPerPixel);
        const endSample = Math.min(Math.floor((bufferPixelX + 1) * samplesPerPixel), channelData.length);

        for (let i = startSample; i < endSample; i++) {
          const value = channelData[i];
          if (value < min) min = value;
          if (value > max) max = value;
        }

        if (max - min < 0.01) {
          max = 0.01;
          min = -0.01;
        }

        ctx.beginPath();
        const y1 = halfHeight - (max * halfHeight);
        const y2 = halfHeight - (min * halfHeight);

        ctx.strokeStyle = x <= progressX ? progressColor : color;

        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
      }

      // Draw Loop Region
      if (loopStartMs !== undefined && loopEndMs !== undefined && durationMs > 0 && loopEndMs > loopStartMs) {
        const loopStartX = (loopStartMs / durationMs) * width;
        const loopEndX = (loopEndMs / durationMs) * width;
        
        if (loopEndX > scrollLeft && loopStartX < scrollLeft + visibleWidth) {
          ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
          ctx.fillRect(loopStartX, 0, loopEndX - loopStartX, height);
          
          ctx.beginPath();
          ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
          ctx.lineWidth = 1;
          ctx.moveTo(loopStartX, 0);
          ctx.lineTo(loopStartX, height);
          ctx.moveTo(loopEndX, 0);
          ctx.lineTo(loopEndX, height);
          ctx.stroke();
        }
      }
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(draw);
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial draw
    draw();

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [buffer, dimensions, positionMs, durationMs, color, progressColor, loopStartMs, loopEndMs, offsetMs]);

  return (
    <div 
      ref={containerRef} 
      className={cn("relative w-full h-full", onOffsetChange ? "cursor-pointer active:cursor-grabbing" : "", className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <canvas
        ref={canvasRef}
        className="sticky left-[256px] top-0 pointer-events-none"
        style={{ height: "100%" }}
      />
      {!buffer && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-600 font-medium">
          Loading Waveform...
        </div>
      )}
    </div>
  );
}
