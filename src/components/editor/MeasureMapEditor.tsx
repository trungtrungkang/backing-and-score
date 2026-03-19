import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X } from "lucide-react";
import type { DAWPayload } from "@/lib/daw/types";

interface MeasureMapEditorProps {
  payload: DAWPayload;
  positionMs: number;
  onPayloadChange: (payload: DAWPayload) => void;
  onClose: () => void;
}

// Utility to resolve a latent playback measure to a physical printed measure.
// (Copied from MusicXMLVisualizer for standalone use in the editor grid)
function getPhysicalMeasure(latent: number, measureMap?: Record<number, number>): number {
  if (!measureMap) return latent;
  let bestLatentAnchor = -1;
  for (const k of Object.keys(measureMap)) {
    const keyNum = Number(k);
    if (!isNaN(keyNum) && keyNum <= latent && keyNum > bestLatentAnchor) {
      bestLatentAnchor = keyNum;
    }
  }
  if (bestLatentAnchor === -1) return latent;
  const offset = latent - bestLatentAnchor;
  return measureMap[bestLatentAnchor] + offset;
}

export function MeasureMapEditor({ payload, positionMs, onPayloadChange, onClose }: MeasureMapEditorProps) {
  const currentMap = payload.notationData?.measureMap || {};
  
  // Convert object { "60": 50 } to array [{ latent: 60, physical: 50 }] for rendering
  const entriesList = Object.entries(currentMap)
    .map(([lat, phys]) => ({ latent: Number(lat), physical: phys }))
    .sort((a, b) => a.latent - b.latent);

  const timemap = payload.notationData?.timemap || [];
  
  // Find currently active latent measure based on audio position
  let activeLatent: number | null = null;
  for (let i = 0; i < timemap.length; i++) {
    if (positionMs >= timemap[i].timeMs) activeLatent = timemap[i].measure;
    else break;
  }

  const [newLatent, setNewLatent] = useState<string>("");
  const [newPhysical, setNewPhysical] = useState<string>("");

  const handleMeasureClick = (latent: number, currentPhysical: number) => {
    // If it's already an explicit anchor, we can prep to edit it/delete it, 
    // but the quickest UX is just pre-filling the inputs for them.
    setNewLatent(latent.toString());
    setNewPhysical(currentPhysical.toString());
  };

  const handleAdd = () => {
    const lat = parseInt(newLatent, 10);
    const phys = parseInt(newPhysical, 10);
    
    if (isNaN(lat) || isNaN(phys) || lat <= 0 || phys <= 0) {
      alert("Please enter valid positive numbers for both measures.");
      return;
    }

    const newMap = { ...currentMap, [lat]: phys };
    updatePayload(newMap);
    setNewLatent("");
    setNewPhysical("");
  };

  const handleRemove = (latent: number) => {
    const newMap = { ...currentMap };
    delete newMap[latent];
    updatePayload(newMap);
  };

  const updatePayload = (newMap: Record<number, number>) => {
    if (!payload.notationData) return;
    
    // If empty map, we can optionally clean up the key, but saving {} is fine too
    const newNotationData = {
      ...payload.notationData,
      measureMap: Object.keys(newMap).length > 0 ? newMap : undefined,
    };

    onPayloadChange({
      ...payload,
      notationData: newNotationData,
    });
  };

  return (
    <div className="fixed right-4 top-20 w-80 bg-background border border-border rounded-lg shadow-xl flex flex-col z-50 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <h3 className="font-semibold text-sm">Measure Map (Repeats/Codas)</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 text-sm text-muted-foreground">
        <p>Define anchors where the audio latency measure jumps back/forward to a different printed sheet measure.</p>
      </div>

      <div className="flex-1 overflow-auto max-h-64 p-3 pt-0">
        {entriesList.length > 0 && (
          <div className="mb-4 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Anchors</h4>
            {entriesList.map(entry => (
              <div key={`anchor-${entry.latent}`} className="flex items-center gap-2 bg-muted/30 p-1.5 rounded border border-border">
                <div className="flex-1 text-center font-mono bg-background border border-border rounded py-1">{entry.latent}</div>
                <div className="text-muted-foreground">→</div>
                <div className="flex-1 text-center font-mono bg-background border border-border rounded py-1">{entry.physical}</div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemove(entry.latent)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {timemap.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recorded Timeline</h4>
            <div className="grid grid-cols-5 gap-1.5">
              {timemap.map((t) => {
                const latent = t.measure;
                const physical = getPhysicalMeasure(latent, currentMap);
                const isAnchor = currentMap[latent] !== undefined;
                const isActive = latent === activeLatent;

                return (
                  <button
                    key={`timeline-${latent}`}
                    onClick={() => handleMeasureClick(latent, physical)}
                    className={`
                      relative flex flex-col items-center justify-center p-1 rounded border text-xs cursor-pointer transition-colors
                      ${isActive ? 'bg-blue-100 border-blue-400 text-blue-900 shadow-sm' : 'bg-background border-border hover:bg-muted/50'}
                      ${isAnchor ? 'ring-1 ring-orange-400 border-orange-400' : ''}
                    `}
                    title={`Audio Measure ${latent} ➔ Sheet Measure ${physical}`}
                  >
                    <span className="font-mono font-bold">{latent}</span>
                    <span className="text-[10px] opacity-60">S:{physical}</span>
                    {isAnchor && <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-muted/30 border-t border-border mt-auto">
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Set Anchor Point</label>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Audio #" 
            className="flex-1 w-full bg-background border border-border rounded px-2 py-1.5 text-sm"
            value={newLatent}
            onChange={e => setNewLatent(e.target.value)}
            min="1"
          />
          <div className="text-muted-foreground">→</div>
          <input 
            type="number" 
            placeholder="Sheet #" 
            className="flex-1 w-full bg-background border border-border rounded px-2 py-1.5 text-sm"
            value={newPhysical}
            onChange={e => setNewPhysical(e.target.value)}
            min="1"
          />
          <Button size="icon" onClick={handleAdd} disabled={!newLatent || !newPhysical}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
