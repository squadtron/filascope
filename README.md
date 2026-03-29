# Filascope

**Scope out the right filament.**

A fast, interactive comparison tool for 3D printing filaments. Compare mechanical properties, heat resistance, UV resistance, print ease and more across 26 filaments from six manufacturers — visually, side by side.

[filascope.app](https://filascope.app)

---

## What it does

- **Radar chart** — compare multiple filaments across up to 8 properties simultaneously, normalised to a 0–100 scale
- **Bar chart** — rank filaments by a single property with raw values and units
- **Filter by type** — PLA, PETG, ABS, ASA, PC, PA
- **Filter by maker** — Bambu Lab, eSUN, Polymaker, Prusament, colorFabb, Fiberlogy
- **Hover to highlight** — hover a selection pill to spotlight that filament on the chart
- **Dark / light theme** — persisted in localStorage

## Stack

Pure static site — no build step, no framework.

- Vanilla JS (`'use strict'`)
- [Chart.js 4.4](https://www.chartjs.org/) via CDN
- Google Fonts: Inter + JetBrains Mono

## Data

Filament data lives in `data/filaments.json`. Each entry includes:

- Mechanical properties: tensile strength, stiffness (flexural modulus), impact strength, heat deflection temperature
- Practical scores: UV resistance, chemical resistance, print ease, moisture resistance (all /10, community estimates where manufacturer data is unavailable)
- Print settings: nozzle/bed temp ranges, enclosure requirement, hardened nozzle requirement
- Application flags: outdoor, structural, high-temp, flexible, food-safe

Properties from manufacturer datasheets are used where available. Rated scores (/10) are community estimates and are clearly labelled as such in the UI.

## Running locally

```bash
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000). (Or use any static file server.)

## Contributing

Found an error in the data, or want to add a filament? Open an issue or PR — contributions to `data/filaments.json` are very welcome.
