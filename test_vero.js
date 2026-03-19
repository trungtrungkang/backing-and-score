const fs = require('fs');
const verovio = require('verovio');

verovio.module.onRuntimeInitialized = function () {
    const tk = new verovio.toolkit();
    const svg = tk.renderData(`<score-partwise version="3.1"><part-list><score-part id="P1"><part-name>Music</part-name></score-part></part-list><part id="P1"><measure number="1"><note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure><measure number="2"><note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure></part></score-partwise>`, {});
    console.log(svg.substring(0, 1000));
    const measures = svg.match(/<g class="measure"[^>]*>/g);
    console.log("Found Measures:", measures);
}
