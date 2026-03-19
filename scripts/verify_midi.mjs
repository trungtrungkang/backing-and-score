import fs from 'fs';
import verovio from 'verovio';
import tonejsMidi from '@tonejs/midi';
const { Midi } = tonejsMidi;

async function main() {
  const vtk = new verovio.toolkit();
  
  const xml = fs.readFileSync('/Users/jefftrung/projects/paperclip/lotusa/projects/backing-and-score/public/samples/musicxml/Hoa Uu Dam.musicxml', 'utf-8');
  vtk.loadData(xml);
  const midiBase64 = vtk.renderToMIDI();
  
  const binaryString = Buffer.from(midiBase64, 'base64').toString('binary');
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const midi = new Midi(bytes.buffer);
  
  console.log(`MIDI Tracks: ${midi.tracks.length}`);
  midi.tracks.forEach((t, i) => {
      console.log(`Track ${i} - Instrument: ${t.instrument.name}`);
      console.log(`Track ${i} - Total Notes: ${t.notes.length}`);
      if (t.notes.length > 5) {
          for(let n=0; n<5; n++) {
            console.log(`Note ${n}: MIDI ${t.notes[n].midi} | Time: ${t.notes[n].time.toFixed(3)}s | Duration: ${t.notes[n].duration.toFixed(3)}s`);
          }
      }
      
      console.log(`Track ${i} - Control Changes:`, Object.keys(t.controlChanges).map(k => `CC ${k}: ${t.controlChanges[k].length} events`));
  });

  console.log('Tempos:');
  midi.header.tempos.forEach((t, i) => {
    console.log(`Tempo ${i}: ${t.bpm} BPM at ${t.time}s`);
  });
}

main().catch(console.error);
