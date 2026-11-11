# Sources and third-party notices

## Saltline

The imported game comes from the public [Saltline Claude artifact](https://claude.ai/artifact/BGY1SztrAYcJQHSsnHHGmp), version `1794338661-8a5e`. Its embedded author note credits **Claude Fable 5.2** for the initial build and describes subsequent improvements by the author, identified in the note as Felix.

The original downloaded HTML and public metadata are retained in [`original/`](original/). [`source.json`](source.json) records the download, resource origins, and SHA-256 checksums. The original game bundle remains in [`game.js`](game.js); the field archive, local packaging, and documentation are additions in this repository.

The imported artifact did not supply a separate repository-wide game license. The component licenses below apply to their respective components; this repository does not assign those licenses to the entire imported game.

## Three.js

Three.js r180 is bundled in the imported game and therefore also in the derived catalog engine.

- Upstream: <https://github.com/mrdoob/three.js/tree/r180>
- License: MIT, preserved in [`licenses/threejs-MIT.txt`](licenses/threejs-MIT.txt).
- License source: <https://github.com/mrdoob/three.js/blob/r180/LICENSE>

## KaTeX

KaTeX 0.19.1 generates the catalog's typeset formulas. Its generated markup, CSS, and fonts are included locally.

- Upstream: <https://github.com/KaTeX/KaTeX>
- License: MIT, preserved in [`assets/katex/LICENSE`](assets/katex/LICENSE).

## Fonts

The locally bundled font families retain their SIL Open Font License 1.1 texts:

- Barlow Condensed: [`assets/fonts/barlow-condensed-OFL.txt`](assets/fonts/barlow-condensed-OFL.txt).
- Big Shoulders Display: [`assets/fonts/big-shoulders-display-OFL.txt`](assets/fonts/big-shoulders-display-OFL.txt).
- IBM Plex Mono: [`assets/fonts/ibm-plex-mono-OFL.txt`](assets/fonts/ibm-plex-mono-OFL.txt).

The individual font download URLs and checksums are recorded in [`source.json`](source.json). Chinese interface text uses the browser's available system fonts.
