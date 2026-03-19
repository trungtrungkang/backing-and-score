"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TimemapEntry } from "@/lib/daw/types";

interface TimelineRulerProps {
  timemap: TimemapEntry[];
  timeSignature: { numerator: number; denominator: number };
  durationMs: number;
  positionMs: number;
  loopStartMs?: number;
  loopEndMs?: number;
  zoomLevel?: number;
  bpm?: number;
  syncToTimemap?: boolean;
  className?: string;
  isDarkMode?: boolean;
}

export function TimelineRuler({
  timemap,
  timeSignature,
  durationMs,
  positionMs,
  loopStartMs,
  loopEndMs,
  zoomLevel = 1,
  bpm = 120,
  syncToTimemap = false,
  className,
  isDarkMode = false,
}: TimelineRulerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0 || durationMs <= 0) return;

    const scrollContainer = canvas.closest('.overflow-x-auto') as HTMLDivElement;
    if (!scrollContainer) return;

    let rafId: number;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rawVisibleWidth = scrollContainer.clientWidth - 256;
      const visibleWidth = Math.min(Math.max(0, rawVisibleWidth), typeof window !== 'undefined' ? window.innerWidth : 4000);
      const scrollLeft = scrollContainer.scrollLeft;
      const dpr = window.devicePixelRatio || 1;

      // Restrict Canvas Memory Size to Visible Width (Prevents QuotaExceededError on 540,000px durations)
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

      const totalWidth = dimensions.width;
      const height = dimensions.height;

      // Clear Visible Area
      ctx.clearRect(0, 0, visibleWidth, height);

      // Translate context so drawing coordinates perfectly map absolute document pixels
      ctx.translate(-scrollLeft, 0);

      // Explicitly paint the background to match TrackList
      ctx.fillStyle = isDarkMode ? "#1e1e24" : "#18181b"; // zinc-900
      ctx.fillRect(scrollLeft, 0, visibleWidth, height);
      
      // Draw bottom border
      ctx.beginPath();
      ctx.strokeStyle = isDarkMode ? "#27272a" : "#27272a"; // zinc-800
      ctx.lineWidth = 1;
      ctx.moveTo(0, height);
      ctx.lineTo(totalWidth, height);
      ctx.stroke();

      // Draw Loop Region
      if (loopStartMs !== undefined && loopEndMs !== undefined && durationMs > 0 && loopEndMs > loopStartMs) {
        const loopStartX = (loopStartMs / durationMs) * totalWidth;
        const loopEndX = (loopEndMs / durationMs) * totalWidth;
        
        if (loopEndX > scrollLeft && loopStartX < scrollLeft + visibleWidth) {
          ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
          ctx.fillRect(loopStartX, 0, loopEndX - loopStartX, height);
        }
      }

      const exactBeatDurationMs = 60000 / bpm;
      const beatsPerBar = timeSignature.numerator || 4;
      const measureDurationMs = exactBeatDurationMs * beatsPerBar;

      if (measureDurationMs > 0 && durationMs > 0) {
        ctx.fillStyle = isDarkMode ? "#e4e4e7" : "#a1a1aa"; // Text color (zinc-200 for bright visibility)
        ctx.font = "10px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const startMs = (scrollLeft / totalWidth) * durationMs;
        const endMs = ((scrollLeft + visibleWidth) / totalWidth) * durationMs;
        
        if (syncToTimemap && timemap.length > 0) {
          // --- ELASTIC GRID (Syncs to Recorded Timemap) ---
          for (let i = 0; i < timemap.length; i++) {
            const currentMeasure = timemap[i];
            const currentMs = currentMeasure.timeMs;
            
            if (currentMs > endMs) break; // Optimization: stop drawing if we passed the right edge of screen
            
            // The exact width/duration of THIS specific measure
            const nextMs = (i + 1 < timemap.length) ? timemap[i+1].timeMs : currentMs + measureDurationMs;
            
            if (nextMs < startMs) continue; // Optimization: skip drawing if we're far left of screen

            const currentX = (currentMs / durationMs) * totalWidth;
            const nextX = (nextMs / durationMs) * totalWidth;
            const pixelSpread = nextX - currentX;

            // Draw Major Tick (Violet to indicate Elastic mode)
            ctx.beginPath();
            ctx.strokeStyle = "#8b5cf6"; 
            ctx.lineWidth = 1;
            ctx.moveTo(currentX, height - 12);
            ctx.lineTo(currentX, height);
            ctx.stroke();

            // Measure Number
            if (pixelSpread > 18) {
                if (currentX < 12) {
                    ctx.textAlign = "left";
                    ctx.fillText(currentMeasure.measure.toString(), currentX + 4, 4);
                } else {
                    ctx.textAlign = "center";
                    ctx.fillText(currentMeasure.measure.toString(), currentX, 4);
                }
            }

            if (pixelSpread < 12) continue; // Too narrow, don't draw subdivisions

            // Minor Ticks
            ctx.beginPath();
            let subDivisionsPerBeat = 1;
            if (zoomLevel >= 2) subDivisionsPerBeat = 2;
            if (zoomLevel >= 4) subDivisionsPerBeat = 4;
            if (zoomLevel >= 8) subDivisionsPerBeat = 8;

            const totalSubdivisionsInMeasure = beatsPerBar * subDivisionsPerBeat;
            const tickIntervalMs = (nextMs - currentMs) / totalSubdivisionsInMeasure; // Dynamic Elastic subdivision
            
            let subBeatMs = currentMs + tickIntervalMs;
            let tickIndex = 1;

            while (tickIndex < totalSubdivisionsInMeasure) {
                if (subBeatMs > durationMs) break;
                
                const tickX = (subBeatMs / durationMs) * totalWidth;
                
                ctx.stroke();
                ctx.beginPath();

                const isFullBeat = tickIndex % subDivisionsPerBeat === 0;
                const isHalfBeat = tickIndex % (subDivisionsPerBeat / 2) === 0;
                const isQuarterBeat = tickIndex % (subDivisionsPerBeat / 4) === 0;

                // Purple gradient for sub-beats
                if (isFullBeat) {
                  ctx.strokeStyle = "#7c3aed";
                  ctx.moveTo(tickX, height - 8);
                  ctx.lineTo(tickX, height);
                } else if (isHalfBeat) {
                  ctx.strokeStyle = "#5b21b6";
                  ctx.moveTo(tickX, height - 6);
                  ctx.lineTo(tickX, height);
                } else if (isQuarterBeat) {
                  ctx.strokeStyle = "#4c1d95";
                  ctx.moveTo(tickX, height - 4);
                  ctx.lineTo(tickX, height);
                } else {
                  ctx.strokeStyle = "#2e1065";
                  ctx.moveTo(tickX, height - 2);
                  ctx.lineTo(tickX, height);
                }

                subBeatMs += tickIntervalMs;
                tickIndex++;
            }
            ctx.stroke();
          }
        } else {
          // --- STRICT BPM GRID (Original Mathematical Fallback) ---
          const startMeasureIndex = Math.max(0, Math.floor(startMs / measureDurationMs) - 1);
          const endMeasureIndex = Math.min(Math.ceil(durationMs / measureDurationMs), Math.ceil(endMs / measureDurationMs) + 1);

          for (let i = startMeasureIndex; i < endMeasureIndex; i++) {
            const currentMs = i * measureDurationMs;
            if (currentMs > durationMs) break;

            const currentX = (currentMs / durationMs) * totalWidth;
            const nextX = ((i + 1) * measureDurationMs / durationMs) * totalWidth;
            const pixelSpread = nextX - currentX;

            // Major Tick
            ctx.beginPath();
            ctx.strokeStyle = isDarkMode ? "#e4e4e7" : "#d4d4d8"; // zinc-200 for bright major tick
            ctx.lineWidth = 1;
            ctx.moveTo(currentX, height - 12);
            ctx.lineTo(currentX, height);
            ctx.stroke();

            // Measure Number
            const measureNum = i + 1;
            if (pixelSpread > 18 || i % Math.max(1, Math.ceil(20 / Math.max(0.1, pixelSpread))) === 0) {
                if (currentX < 12) {
                    ctx.textAlign = "left";
                    ctx.fillText(measureNum.toString(), currentX + 4, 4);
                } else {
                    ctx.textAlign = "center";
                    ctx.fillText(measureNum.toString(), currentX, 4);
                }
            }

            if (pixelSpread < 12) continue;

            // Minor Ticks
            ctx.beginPath();
            let subDivisionsPerBeat = 1;
            if (zoomLevel >= 2) subDivisionsPerBeat = 2;
            if (zoomLevel >= 4) subDivisionsPerBeat = 4;
            if (zoomLevel >= 8) subDivisionsPerBeat = 8;

            const tickIntervalMs = exactBeatDurationMs / subDivisionsPerBeat;
            let subBeatMs = currentMs + tickIntervalMs;
            let tickIndex = 1;

            while (subBeatMs < currentMs + measureDurationMs) {
                if (subBeatMs > durationMs) break;
                
                const tickX = (subBeatMs / durationMs) * totalWidth;
                
                ctx.stroke();
                ctx.beginPath();

                const isFullBeat = tickIndex % subDivisionsPerBeat === 0;
                const isHalfBeat = tickIndex % (subDivisionsPerBeat / 2) === 0;
                const isQuarterBeat = tickIndex % (subDivisionsPerBeat / 4) === 0;

                if (isFullBeat) {
                  ctx.strokeStyle = isDarkMode ? "#d4d4d8" : "#a1a1aa"; // zinc-300 dark
                  ctx.moveTo(tickX, height - 8);
                  ctx.lineTo(tickX, height);
                } else if (isHalfBeat) {
                  ctx.strokeStyle = isDarkMode ? "#a1a1aa" : "#71717a"; // zinc-400 dark
                  ctx.moveTo(tickX, height - 6);
                  ctx.lineTo(tickX, height);
                } else if (isQuarterBeat) {
                  ctx.strokeStyle = isDarkMode ? "#71717a" : "#52525b"; // zinc-500 dark
                  ctx.moveTo(tickX, height - 4);
                  ctx.lineTo(tickX, height);
                } else {
                  ctx.strokeStyle = isDarkMode ? "#52525b" : "#3f3f46"; // zinc-600 dark
                  ctx.moveTo(tickX, height - 2);
                  ctx.lineTo(tickX, height);
                }

                subBeatMs += tickIntervalMs;
                tickIndex++;
            }
            ctx.stroke();
          }
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
  }, [dimensions, positionMs, durationMs, timemap, timeSignature, loopStartMs, loopEndMs, zoomLevel, bpm, isDarkMode, syncToTimemap]);

  return (
    <div 
      ref={containerRef} 
      className={cn("relative w-full h-[24px]", className)}
    >
      <canvas
        ref={canvasRef}
        className="sticky left-[256px] top-0 pointer-events-none"
        style={{ height: "100%" }}
      />
    </div>
  );
}
