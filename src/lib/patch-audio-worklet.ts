/**
 * Patch AudioWorklet.addModule so the SpessaSynth worklet loads from our public URL.
 * In Next.js the bundled script URL makes new URL('spessasynth_processor.js', import.meta.url)
 * resolve to a path that doesn't exist; we redirect to /spessasynth_processor.js (copied to public).
 * Call this once after user gesture, before importing and calling Player.create().
 */
let patched = false;

export function patchAudioWorkletForSpessaSynth(): void {
  if (patched || typeof window === 'undefined') return;
  const workletPublicPath = '/spessasynth_processor.js';

  try {
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextCtor();
    const worklet = ctx.audioWorklet as { addModule: (url: string | URL) => Promise<void> };
    ctx.close();
    const proto = Object.getPrototypeOf(worklet) as { addModule: (url: string | URL) => Promise<void> };
    const orig = proto.addModule;
    if (!orig) return;

    proto.addModule = function (url: string | URL): Promise<void> {
      const s = typeof url === 'string' ? url : url.toString();
      const usePublic = /spessasynth_processor\.js$/i.test(s) || s.includes('spessasynth_processor');
      const target = usePublic ? `${window.location.origin}${workletPublicPath}` : s;
      return orig.call(this, target);
    };
    patched = true;
  } catch {
    // Ignore if AudioContext not available (e.g. SSR)
  }
}
