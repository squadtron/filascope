/* ═══════════════════════════════════════════════════════
   FILASCOPE — app.js
   Chart.js 4 · Radar + Bar · Neon dark theme
   ═══════════════════════════════════════════════════════ */

'use strict';

// ─── Neon colour palette ──────────────────────────────
// 26 entries — assigned to filaments by index.
// Pure #ffff00 yellow is invisible on light backgrounds;
// warm gold/amber used on those slots instead.

const NEON = [
  { line: '#00ffff', fill: 'rgba(0,255,255,0.10)',   glow: 'rgba(0,255,255,0.5)'   },
  { line: '#ff006e', fill: 'rgba(255,0,110,0.10)',   glow: 'rgba(255,0,110,0.5)'   },
  { line: '#39ff14', fill: 'rgba(57,255,20,0.10)',   glow: 'rgba(57,255,20,0.5)'   },
  { line: '#ff9500', fill: 'rgba(255,149,0,0.10)',   glow: 'rgba(255,149,0,0.5)'   },
  { line: '#bf00ff', fill: 'rgba(191,0,255,0.10)',   glow: 'rgba(191,0,255,0.5)'   },
  { line: '#00ff88', fill: 'rgba(0,255,136,0.10)',   glow: 'rgba(0,255,136,0.5)'   },
  { line: '#d4a800', fill: 'rgba(212,168,0,0.12)',   glow: 'rgba(212,168,0,0.5)'   },
  { line: '#ff3131', fill: 'rgba(255,49,49,0.10)',   glow: 'rgba(255,49,49,0.5)'   },
  { line: '#ff8800', fill: 'rgba(255,136,0,0.10)',   glow: 'rgba(255,136,0,0.5)'   },
  { line: '#ff00ff', fill: 'rgba(255,0,255,0.10)',   glow: 'rgba(255,0,255,0.5)'   },
  { line: '#00ffe5', fill: 'rgba(0,255,229,0.10)',   glow: 'rgba(0,255,229,0.5)'   },
  { line: '#aaff00', fill: 'rgba(170,255,0,0.10)',   glow: 'rgba(170,255,0,0.5)'   },
  { line: '#ff6b6b', fill: 'rgba(255,107,107,0.10)', glow: 'rgba(255,107,107,0.5)' },
  { line: '#4ecdc4', fill: 'rgba(78,205,196,0.10)',  glow: 'rgba(78,205,196,0.5)'  },
  { line: '#45b7d1', fill: 'rgba(69,183,209,0.10)',  glow: 'rgba(69,183,209,0.5)'  },
  { line: '#96e6a1', fill: 'rgba(150,230,161,0.10)', glow: 'rgba(150,230,161,0.5)' },
  { line: '#c084fc', fill: 'rgba(192,132,252,0.10)', glow: 'rgba(192,132,252,0.5)' },
  { line: '#fb923c', fill: 'rgba(251,146,60,0.10)',  glow: 'rgba(251,146,60,0.5)'  },
  { line: '#34d399', fill: 'rgba(52,211,153,0.10)',  glow: 'rgba(52,211,153,0.5)'  },
  { line: '#60a5fa', fill: 'rgba(96,165,250,0.10)',  glow: 'rgba(96,165,250,0.5)'  },
  { line: '#f472b6', fill: 'rgba(244,114,182,0.10)', glow: 'rgba(244,114,182,0.5)' },
  { line: '#a3e635', fill: 'rgba(163,230,53,0.10)',  glow: 'rgba(163,230,53,0.5)'  },
  { line: '#38bdf8', fill: 'rgba(56,189,248,0.10)',  glow: 'rgba(56,189,248,0.5)'  },
  { line: '#e879f9', fill: 'rgba(232,121,249,0.10)', glow: 'rgba(232,121,249,0.5)' },
  { line: '#fbbf24', fill: 'rgba(251,191,36,0.10)',  glow: 'rgba(251,191,36,0.5)'  },
  { line: '#f97316', fill: 'rgba(249,115,22,0.10)',  glow: 'rgba(249,115,22,0.5)'  },
];

// ─── Property configuration ───────────────────────────

const PROPS = {
  tensile_strength:      { label: 'Tensile Strength',   unit: 'MPa',    max: 150,   min: 0  },
  flexural_modulus:      { label: 'Stiffness',           unit: 'MPa',    max: 12000, min: 0  },
  heat_deflection_temp:  { label: 'Heat Resistance',     unit: '°C',     max: 250,   min: 20 },
  impact_strength:       { label: 'Impact Strength',     unit: 'kJ/m²',  max: 55,    min: 0  },
  uv_resistance:         { label: 'UV Resistance',       unit: '/10',    max: 10,    min: 0  },
  chemical_resistance:   { label: 'Chemical Resistance', unit: '/10',    max: 10,    min: 0  },
  print_ease:            { label: 'Print Ease',          unit: '/10',    max: 10,    min: 0  },
  moisture_resistance:   { label: 'Moisture Resistance', unit: '/10',    max: 10,    min: 0  },
};

// ─── Type filter groups ───────────────────────────────

const TYPE_FILTERS = {
  'ALL':  () => true,
  'PLA':  f => f.type === 'PLA',
  'PETG': f => f.type.startsWith('PETG'),
  'ABS':  f => f.type === 'ABS',
  'ASA':  f => f.type === 'ASA',
  'PC':   f => f.type === 'PC',
  'PA':   f => f.type.startsWith('PA'),
};

// ─── Global state ─────────────────────────────────────

let filaments        = [];
let colorMap         = {};          // filament.id → NEON entry
let selectedIds      = new Set();   // currently active filament IDs
let activeProps      = new Set(Object.keys(PROPS));
let chartMode        = 'radar';     // 'radar' | 'bar'
let barPropKey       = 'tensile_strength';
let chartInstance    = null;
let activeTypeFilter = 'ALL';       // current type filter key
let activeMakers     = new Set();   // empty = all makers visible
let radarResizeObs   = null;        // ResizeObserver for square radar
let radarResizeTimer = null;        // debounce timer
let renderedPropKeys = null;        // prop keys active when chart was last built
let renderedMode     = null;        // chart type last fully rendered ('radar'|'bar'|null)
let renderedTheme    = null;        // theme last fully rendered ('dark'|'light'|null)
let hoveredFilamentId = null;       // pill currently hovered (null = none)

// ─── Theme helpers ────────────────────────────────────

function initTheme() {
  const saved = localStorage.getItem('filament-theme') || 'dark';
  if (saved === 'light') document.documentElement.dataset.theme = 'light';
}

function isLight() {
  return document.documentElement.dataset.theme === 'light';
}

function getChartTheme() {
  const light = isLight();
  return {
    grid:          light ? 'rgba(0,0,0,0.07)'       : 'rgba(255,255,255,0.07)',
    angleLines:    light ? 'rgba(0,0,0,0.10)'       : 'rgba(255,255,255,0.10)',
    pointLabels:   light ? '#52527a'                : '#6a6a9a',
    ticks:         light ? '#6a6a8a'                : '#6a6a9a',
    axisBorder:    light ? 'rgba(0,0,0,0.10)'       : 'rgba(255,255,255,0.08)',
    axisTitle:     light ? '#7a7a9a'                : '#4a4a7a',
    tooltipBg:     light ? 'rgba(255,255,255,0.97)' : 'rgba(10,10,24,0.95)',
    tooltipBorder: light ? 'rgba(0,0,0,0.10)'       : 'rgba(255,255,255,0.10)',
    tooltipTitle:  light ? '#1a1a2e'                : '#dde0ff',
    tooltipBody:   light ? '#52527a'                : '#9090bb',
  };
}

// ─── Responsive sizing ────────────────────────────────

// Line width: 1.5px at 600px viewport → 3px at 1800px viewport
function getLineWidth() {
  return parseFloat(Math.max(1.5, Math.min(3, 1.5 + (window.innerWidth - 600) / 800)).toFixed(2));
}

function getPointRadius() {
  return Math.max(3, Math.min(6, Math.round(window.innerWidth / 320)));
}

// Radar axis label font: 11px at ≤900px → 14px at ≥1600px
function getRadarLabelSize() {
  return Math.max(11, Math.min(14, Math.round(11 + (window.innerWidth - 900) / 233)));
}

// ─── Radar square sizing ──────────────────────────────

function getRadarSize() {
  const wrapper = document.getElementById('chart-wrapper');
  return Math.max(220, Math.min(wrapper.clientWidth, wrapper.clientHeight) - 80);
}

// Called ONCE before chart creation — sets pixel buffer + CSS size
function sizeRadarCanvas() {
  const canvas = document.getElementById('main-chart');
  const size   = getRadarSize();
  canvas.width        = size;
  canvas.height       = size;
  canvas.style.width  = `${size}px`;
  canvas.style.height = `${size}px`;
}

// Called AFTER chart creation — debounced resize handler patches line weights,
// point sizes and label font directly on the existing chart instance.
// Deliberately does NOT call renderChart() — that would create a new
// ResizeObserver which fires on initial observation, causing an 80ms strobe loop.
function setupRadarSquare() {
  if (radarResizeObs) { radarResizeObs.disconnect(); radarResizeObs = null; }

  radarResizeObs = new ResizeObserver(() => {
    clearTimeout(radarResizeTimer);
    radarResizeTimer = setTimeout(() => {
      if (!chartInstance) return;
      const lw = getLineWidth();
      const pr = getPointRadius();
      const ls = getRadarLabelSize();

      // Patch responsive properties on existing datasets
      chartInstance.data.datasets.forEach(ds => {
        ds.borderWidth      = lw;
        ds.pointRadius      = pr;
        ds.pointHoverRadius = pr + 3;
      });
      // Patch axis label font size
      chartInstance.options.scales.r.pointLabels.font.size = ls;
      chartInstance.options.scales.r.pointLabels.padding   = Math.round(ls * 0.9);

      // Resize the canvas pixel buffer (safe — we're 80ms post-resize), then redraw
      sizeRadarCanvas();
      chartInstance.update('none');
    }, 80);
  });

  radarResizeObs.observe(document.getElementById('chart-wrapper'));
}

function teardownRadarSquare() {
  if (radarResizeObs) { radarResizeObs.disconnect(); radarResizeObs = null; }
  clearTimeout(radarResizeTimer);
  const canvas = document.getElementById('main-chart');
  canvas.style.width  = '';
  canvas.style.height = '';
}

// ─── Bootstrap ───────────────────────────────────────

async function init() {
  initTheme();
  try {
    const res  = await fetch('data/filaments.json');
    const data = await res.json();
    filaments  = data.filaments;

    filaments.forEach((f, i) => {
      colorMap[f.id] = NEON[i % NEON.length];
    });

    buildFilterStrip();
    buildMakerFilter();
    buildSidebar();
    buildBarSelect();
    bindControls();

    // Default selection
    ['bambu-paht-cf', 'bambu-asa', 'bambu-pla'].forEach(id => {
      const el = document.querySelector(`[data-id="${id}"]`);
      if (el) activateFilament(id, el);
    });

    renderChart();
  } catch (err) {
    console.error('Failed to load filament data:', err);
    document.getElementById('empty-state').querySelector('p').textContent =
      'Could not load filament data — check the console for details.';
  }
}

// ─── Type filter strip ────────────────────────────────

function buildFilterStrip() {
  const row = document.createElement('div');
  row.className = 'filter-row';
  row.id = 'type-filter-row';

  const lbl = document.createElement('span');
  lbl.className = 'filter-row-label';
  lbl.textContent = 'type';

  const strip = document.createElement('div');
  strip.className = 'type-filter-strip filter-row-pills';
  strip.id = 'type-filter-strip';

  Object.keys(TYPE_FILTERS).forEach(key => {
    const btn = document.createElement('button');
    btn.className    = 'filter-pill' + (key === 'ALL' ? ' active' : '');
    btn.textContent  = key;
    btn.dataset.filter = key;
    btn.addEventListener('click', () => {
      activeTypeFilter = key;
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
    strip.appendChild(btn);
  });

  row.appendChild(lbl);
  row.appendChild(strip);

  const section = document.getElementById('filament-list').closest('.sidebar-section');
  section.insertBefore(row, document.getElementById('filament-list'));
}

// ─── Maker filter strip ───────────────────────────────

function buildMakerFilter() {
  const makers = [...new Set(filaments.map(f => f.manufacturer))];

  const row = document.createElement('div');
  row.className = 'filter-row';

  const lbl = document.createElement('span');
  lbl.className = 'filter-row-label';
  lbl.textContent = 'maker';

  const strip = document.createElement('div');
  strip.className = 'maker-filter-strip filter-row-pills';

  // "All" resets the maker filter
  const allBtn = document.createElement('button');
  allBtn.className = 'maker-pill active';
  allBtn.textContent = 'All';
  allBtn.dataset.maker = 'ALL';
  allBtn.addEventListener('click', () => {
    activeMakers.clear();
    document.querySelectorAll('.maker-pill').forEach(p => p.classList.remove('active'));
    allBtn.classList.add('active');
    applyFilters();
  });
  strip.appendChild(allBtn);

  // Shorten long names to keep pills compact
  const SHORT = { 'Bambu Lab': 'Bambu', 'Prusament': 'Prusa' };

  makers.forEach(maker => {
    const btn = document.createElement('button');
    btn.className = 'maker-pill';
    btn.textContent = SHORT[maker] || maker;
    btn.dataset.maker = maker;
    btn.addEventListener('click', () => {
      if (activeMakers.has(maker)) {
        activeMakers.delete(maker);
        btn.classList.remove('active');
      } else {
        activeMakers.add(maker);
        btn.classList.add('active');
      }
      // "All" active only when no individual makers are selected
      document.querySelector('[data-maker="ALL"]').classList.toggle('active', activeMakers.size === 0);
      applyFilters();
    });
    strip.appendChild(btn);
  });

  row.appendChild(lbl);
  row.appendChild(strip);

  // Insert after the type filter row (both insertBefore(filament-list) stacks correctly)
  const section = document.getElementById('filament-list').closest('.sidebar-section');
  section.insertBefore(row, document.getElementById('filament-list'));
}

// ─── Unified filter apply (type + maker) ─────────────

function applyFilters() {
  const typeFn = TYPE_FILTERS[activeTypeFilter];

  filaments.forEach(f => {
    const el = document.querySelector(`[data-id="${f.id}"]`);
    if (!el) return;
    const typeHidden  = !typeFn(f);
    const makerHidden = activeMakers.size > 0 && !activeMakers.has(f.manufacturer);
    el.classList.toggle('filter-hidden', typeHidden || makerHidden);
  });

  document.querySelectorAll('.manufacturer-group').forEach(group => {
    const visible = group.querySelectorAll('.filament-item:not(.filter-hidden)');
    group.classList.toggle('all-hidden', visible.length === 0);
  });
}

// ─── Build sidebar ────────────────────────────────────

function buildSidebar() {
  const listEl = document.getElementById('filament-list');

  const byMfr = {};
  filaments.forEach(f => {
    (byMfr[f.manufacturer] = byMfr[f.manufacturer] || []).push(f);
  });

  Object.entries(byMfr).forEach(([mfr, group]) => {
    const groupEl = document.createElement('div');
    groupEl.className = 'manufacturer-group';

    const header = document.createElement('div');
    header.className = 'manufacturer-label';
    header.innerHTML = `
      <span>${mfr}</span>
      <svg class="mfr-chevron" viewBox="0 0 10 6" width="9" height="9" fill="currentColor">
        <path d="M0 0l5 6 5-6z"/>
      </svg>
    `;
    header.addEventListener('click', () => groupEl.classList.toggle('collapsed'));
    groupEl.appendChild(header);

    group.forEach((f, idx) => {
      const c    = colorMap[f.id];
      const item = document.createElement('div');
      item.className  = 'filament-item';
      item.dataset.id = f.id;
      item.style.setProperty('--item-color', c.line);
      item.style.animationDelay = `${idx * 30}ms`;
      item.innerHTML = `
        <span class="color-dot" style="background:${c.line}"></span>
        <span class="filament-item-name">${f.name}</span>
        <span class="type-badge">${f.type}</span>
      `;
      item.addEventListener('click', () => {
        if (selectedIds.has(f.id)) {
          deactivateFilament(f.id, item);
        } else {
          activateFilament(f.id, item);
        }
        renderChart();
      });
      groupEl.appendChild(item);
    });

    listEl.appendChild(groupEl);
  });

  // ── Property toggles ──
  const propEl = document.getElementById('property-list');

  Object.entries(PROPS).forEach(([key, meta]) => {
    const label = document.createElement('label');
    label.className = 'property-item';
    label.innerHTML = `
      <input type="checkbox" data-prop="${key}" checked>
      <span class="prop-label">${meta.label}</span>
      <span class="prop-unit">${meta.unit}</span>
    `;
    const cb = label.querySelector('input');
    cb.addEventListener('change', () => {
      if (cb.checked) {
        activeProps.add(key);
      } else {
        if (activeProps.size <= 3) { cb.checked = true; return; }
        activeProps.delete(key);
      }
      renderChart();
    });
    propEl.appendChild(label);
  });
}

function activateFilament(id, el) {
  selectedIds.add(id);
  el.classList.add('active');
}

function deactivateFilament(id, el) {
  selectedIds.delete(id);
  el.classList.remove('active');
}

// ─── Bar chart property select ────────────────────────

function buildBarSelect() {
  const sel = document.getElementById('bar-property');
  Object.entries(PROPS).forEach(([key, meta]) => {
    const opt  = document.createElement('option');
    opt.value  = key;
    opt.textContent = `${meta.label}  (${meta.unit})`;
    sel.appendChild(opt);
  });
  sel.value = barPropKey;
  sel.addEventListener('change', () => {
    barPropKey = sel.value;
    renderChart();
  });
}

// ─── Bind top-level controls ──────────────────────────

function bindControls() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      chartMode = btn.dataset.chart;

      const barControls = document.getElementById('bar-controls');
      const infoEl      = document.getElementById('chart-mode-info');
      const wrapper     = document.getElementById('chart-wrapper');

      if (chartMode === 'bar') {
        barControls.classList.add('visible');
        infoEl.textContent = 'Showing raw values with units';
        wrapper.classList.replace('mode-radar', 'mode-bar');
      } else {
        barControls.classList.remove('visible');
        infoEl.textContent = 'Radar values normalised 0–100 · hover for raw data';
        wrapper.classList.replace('mode-bar', 'mode-radar');
      }

      renderChart();
    });
  });

  // Select all visible — respects both type and maker filters
  document.getElementById('select-all-btn').addEventListener('click', () => {
    const typeFn = TYPE_FILTERS[activeTypeFilter];
    filaments.forEach(f => {
      const el = document.querySelector(`[data-id="${f.id}"]`);
      if (!el) return;
      const makerOk = activeMakers.size === 0 || activeMakers.has(f.manufacturer);
      if (typeFn(f) && makerOk) {
        if (!selectedIds.has(f.id)) activateFilament(f.id, el);
      }
    });
    renderChart();
  });

  document.getElementById('clear-all-btn').addEventListener('click', () => {
    filaments.forEach(f => {
      const el = document.querySelector(`[data-id="${f.id}"]`);
      if (el) deactivateFilament(f.id, el);
    });
    renderChart();
  });

  document.getElementById('reset-props-btn').addEventListener('click', () => {
    activeProps = new Set(Object.keys(PROPS));
    document.querySelectorAll('[data-prop]').forEach(cb => { cb.checked = true; });
    renderChart();
  });

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const light = isLight();
    if (light) {
      delete document.documentElement.dataset.theme;
      localStorage.setItem('filament-theme', 'dark');
    } else {
      document.documentElement.dataset.theme = 'light';
      localStorage.setItem('filament-theme', 'light');
    }
    renderChart();
  });

  document.getElementById('chart-wrapper').classList.add('mode-radar');
}

// ─── Highlight helpers ────────────────────────────────

// Convert a 6-digit hex colour to rgba(r,g,b,a) — used for dimming.
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Emphasise one filament on the chart; dim all others.
// Called on sel-pill mouseenter.
function highlightFilament(id) {
  hoveredFilamentId = id;
  if (!chartInstance) return;

  const lw = getLineWidth();
  const pr = getPointRadius();

  if (chartMode === 'radar') {
    chartInstance.data.datasets.forEach(ds => {
      const c = colorMap[ds.filamentId];
      if (ds.filamentId === id) {
        ds.borderWidth            = lw * 2.5;
        ds.pointRadius            = pr + 2;
        ds.pointHoverRadius       = pr + 5;
        ds.borderColor            = c.line;
        ds.backgroundColor        = c.fill.replace(/,([\d.]+)\)$/, ',0.30)');
        ds.pointBackgroundColor   = c.line;
      } else {
        ds.borderWidth            = lw * 0.5;
        ds.pointRadius            = Math.max(1, pr * 0.5);
        ds.borderColor            = hexToRgba(c.line, 0.18);
        ds.backgroundColor        = c.fill.replace(/,([\d.]+)\)$/, ',0.02)');
        ds.pointBackgroundColor   = hexToRgba(c.line, 0.18);
      }
    });
    chartInstance.update('none');
  }

  if (chartMode === 'bar') {
    const ids = Array.from(selectedIds);
    chartInstance.data.datasets[0].backgroundColor = ids.map((sid, i) => {
      const c = colorMap[sid];
      return sid === id
        ? c.fill.replace(/,([\d.]+)\)$/, ',0.55)')
        : c.fill.replace(/,([\d.]+)\)$/, ',0.05)');
    });
    chartInstance.data.datasets[0].borderColor = ids.map(sid => {
      const c = colorMap[sid];
      return sid === id ? c.line : hexToRgba(c.line, 0.18);
    });
    chartInstance.update('none');
  }
}

// Restore all datasets to their normal un-highlighted appearance.
// Called on sel-pill mouseleave.
function clearHighlight() {
  hoveredFilamentId = null;
  if (!chartInstance) return;

  const lw = getLineWidth();
  const pr = getPointRadius();

  if (chartMode === 'radar') {
    chartInstance.data.datasets.forEach(ds => {
      const c = colorMap[ds.filamentId];
      ds.borderWidth          = lw;
      ds.pointRadius          = pr;
      ds.pointHoverRadius     = pr + 3;
      ds.borderColor          = c.line;
      ds.backgroundColor      = c.fill;
      ds.pointBackgroundColor = c.line;
    });
    chartInstance.update('none');
  }

  if (chartMode === 'bar') {
    const ids = Array.from(selectedIds);
    chartInstance.data.datasets[0].backgroundColor = ids.map(sid => {
      const c = colorMap[sid];
      return c.fill.replace('0.10', '0.25').replace('0.12', '0.28');
    });
    chartInstance.data.datasets[0].borderColor = ids.map(sid => colorMap[sid].line);
    chartInstance.update('none');
  }
}

// ─── Normalise a raw value to 0–100 ──────────────────

function norm(value, key) {
  const { min, max } = PROPS[key];
  return Math.max(0, Math.min(100, Math.round(((value - min) / (max - min)) * 100)));
}

// ─── Main render dispatcher ───────────────────────────

function renderChart() {
  const emptyEl = document.getElementById('empty-state');

  if (selectedIds.size === 0) {
    emptyEl.classList.remove('hidden');
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    teardownRadarSquare();
    renderedPropKeys = null;
    renderedMode     = null;
    renderedTheme    = null;
    updateStrip();
    return;
  }
  emptyEl.classList.add('hidden');

  if (chartMode === 'radar') renderRadar();
  else                        renderBar();

  updateStrip();
}

// ─── Radar chart ─────────────────────────────────────

// Build a single radar dataset object for the given filament id.
// propKeys is passed in so the caller controls which axes are active.
function makeRadarDataset(id, propKeys) {
  const f  = filaments.find(x => x.id === id);
  const c  = colorMap[id];
  const lw = getLineWidth();
  const pr = getPointRadius();
  return {
    filamentId:                id,   // custom field — used by tooltip callbacks
    label:                     f.name,
    data:                      propKeys.map(k => norm(f.properties[k], k)),
    borderColor:               c.line,
    backgroundColor:           c.fill,
    borderWidth:               lw,
    pointBackgroundColor:      c.line,
    pointBorderColor:          'transparent',
    pointRadius:               pr,
    pointHoverRadius:          pr + 3,
    pointHoverBackgroundColor: c.line,
    pointHoverBorderColor:     isLight() ? '#000' : '#fff',
    pointHoverBorderWidth:     1.5,
  };
}

function renderRadar() {
  const propKeys = Array.from(activeProps);
  const theme    = isLight() ? 'light' : 'dark';

  // Decide whether an incremental update is safe, or a full re-render is needed.
  // A full re-render is required when the chart doesn't exist yet, when the set
  // of active properties (= radar axes) has changed, when the chart mode changed,
  // or when the colour theme flipped (all dataset colours would be wrong).
  const propsChanged = JSON.stringify(propKeys) !== JSON.stringify(renderedPropKeys);
  const modeChanged  = renderedMode  !== 'radar';
  const themeChanged = renderedTheme !== theme;
  const needsFull    = !chartInstance || propsChanged || modeChanged || themeChanged;

  // ── Incremental update ───────────────────────────────
  // Only the filament being added or removed is animated; existing lines stay still.
  if (!needsFull) {
    const currentIds = chartInstance.data.datasets.map(d => d.filamentId);
    const toRemove   = currentIds.filter(id => !selectedIds.has(id));
    const toAdd      = Array.from(selectedIds).filter(id => !currentIds.includes(id));

    if (toRemove.length === 0 && toAdd.length === 0) return; // nothing changed

    // Instant removal — line disappears cleanly, nothing else moves
    if (toRemove.length > 0) {
      toRemove.forEach(id => {
        const idx = chartInstance.data.datasets.findIndex(d => d.filamentId === id);
        if (idx !== -1) chartInstance.data.datasets.splice(idx, 1);
      });
      chartInstance.update('none');
    }

    // Animated addition — only newly pushed datasets expand in from zero
    if (toAdd.length > 0) {
      toAdd.forEach(id => chartInstance.data.datasets.push(makeRadarDataset(id, propKeys)));
      chartInstance.update();
    }

    return;
  }

  // ── Full re-render ───────────────────────────────────
  sizeRadarCanvas();
  const th       = getChartTheme();
  const datasets = Array.from(selectedIds).map(id => makeRadarDataset(id, propKeys));

  const ctx = document.getElementById('main-chart').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  // Store render state BEFORE creating the chart so tooltip closures see the
  // correct values immediately (they reference module-level renderedPropKeys).
  renderedPropKeys = propKeys;
  renderedMode     = 'radar';
  renderedTheme    = theme;

  chartInstance = new Chart(ctx, {
    type: 'radar',
    data: { labels: propKeys.map(k => PROPS[k].label), datasets },
    options: {
      responsive:  false,
      animation:   { duration: 350, easing: 'easeOutQuart' },
      // Show tooltip for the nearest point even when cursor is not pixel-perfect
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { left: 32, right: 48, top: 16, bottom: 16 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor:  th.tooltipBg,
          borderColor:      th.tooltipBorder,
          borderWidth:      1,
          titleColor:       th.tooltipTitle,
          bodyColor:        th.tooltipBody,
          padding:          12,
          cornerRadius:     8,
          titleFont:        { size: 12, weight: '600' },
          bodyFont:         { size: 12 },
          callbacks: {
            // renderedPropKeys is module-level — always reflects the current axes
            title: (items) => PROPS[renderedPropKeys[items[0].dataIndex]].label,
            label: (ctx) => {
              const id  = ctx.dataset.filamentId;
              const f   = filaments.find(x => x.id === id);
              const key = renderedPropKeys[ctx.dataIndex];
              return `  ${f.manufacturer} ${f.name}: ${f.properties[key]} ${PROPS[key].unit}`;
            },
          },
        },
      },
      scales: {
        r: {
          min:  0,
          max:  100,
          ticks: { stepSize: 25, display: false },
          grid:        { color: th.grid,       lineWidth: 1 },
          angleLines:  { color: th.angleLines, lineWidth: 1 },
          pointLabels: {
            color:   th.pointLabels,
            font:    { size: getRadarLabelSize(), weight: '500' },
            padding: Math.round(getRadarLabelSize() * 0.9),
          },
        },
      },
    },
  });

  setupRadarSquare();
}

// ─── Bar (horizontal) chart ───────────────────────────

function renderBar() {
  teardownRadarSquare();
  // Bar chart always does a full destroy-and-recreate.
  // Reset render state so switching back to radar triggers a full re-render.
  renderedMode     = 'bar';
  renderedPropKeys = null;
  renderedTheme    = null;

  const key      = barPropKey;
  const propMeta = PROPS[key];
  const selected = Array.from(selectedIds).map(id => filaments.find(f => f.id === id));
  const lw       = getLineWidth();
  const th       = getChartTheme();

  const labels  = selected.map(f => `${f.manufacturer} — ${f.name}`);
  const values  = selected.map(f => f.properties[key]);
  const borders = selected.map(f => colorMap[f.id].line);
  const fills   = selected.map(f => colorMap[f.id].fill.replace('0.10', '0.25').replace('0.12', '0.28'));

  const ctx = document.getElementById('main-chart').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label:           propMeta.label,
        data:            values,
        backgroundColor: fills,
        borderColor:     borders,
        borderWidth:     lw,
        borderRadius:    6,
        borderSkipped:   false,
      }],
    },
    options: {
      indexAxis:           'y',
      responsive:          true,
      maintainAspectRatio: false,
      animation:           { duration: 350, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor:  th.tooltipBg,
          borderColor:      th.tooltipBorder,
          borderWidth:      1,
          titleColor:       th.tooltipTitle,
          bodyColor:        th.tooltipBody,
          padding:          12,
          cornerRadius:     8,
          titleFont:        { size: 12, weight: '600' },
          bodyFont:         { size: 12 },
          callbacks: {
            label: (ctx) => `  ${ctx.parsed.x} ${propMeta.unit}`,
          },
        },
      },
      scales: {
        x: {
          grid:   { color: th.grid, lineWidth: 1 },
          border: { color: th.axisBorder },
          ticks: {
            color:    th.ticks,
            font:     { size: 11 },
            callback: (v) => `${v} ${propMeta.unit}`,
          },
          title: {
            display: true,
            text:    `${propMeta.label} (${propMeta.unit})`,
            color:   th.axisTitle,
            font:    { size: 11 },
            padding: { top: 8 },
          },
        },
        y: {
          grid:   { color: 'transparent' },
          border: { color: th.axisBorder },
          ticks:  { color: th.ticks, font: { size: 12 } },
        },
      },
    },
  });
}

// ─── Selection strip ──────────────────────────────────

function updateStrip() {
  const strip = document.getElementById('selection-strip');
  strip.innerHTML = '';

  if (selectedIds.size === 0) return;

  selectedIds.forEach(id => {
    const f    = filaments.find(x => x.id === id);
    const c    = colorMap[id];
    const pill = document.createElement('div');
    pill.className   = 'sel-pill';
    pill.style.cssText = `border-color:${c.line};color:${c.line};background:${c.fill}`;
    pill.innerHTML = `
      <span class="sel-pill-dot" style="background:${c.line};box-shadow:0 0 6px ${c.line}"></span>
      ${f.manufacturer} ${f.name}
      <span class="sel-pill-remove" title="Remove">×</span>
    `;
    pill.addEventListener('click', () => {
      const el = document.querySelector(`[data-id="${id}"]`);
      deactivateFilament(id, el);
      renderChart();
    });
    pill.addEventListener('mouseenter', () => {
      pill.classList.add('highlighted');
      highlightFilament(id);
    });
    pill.addEventListener('mouseleave', () => {
      pill.classList.remove('highlighted');
      clearHighlight();
    });
    strip.appendChild(pill);
  });
}

// ─── Go! ──────────────────────────────────────────────

init();
