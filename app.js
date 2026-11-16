'use strict';
/* =============================================================
   Español — a Spanish vocabulary practice app (installable PWA)
   Everything is stored in this device's browser (localStorage).
   Settings → "Save backup file" moves data between devices.
   ============================================================= */

const STORE_KEY = 'espanol.v1';

/* ---------- helpers ---------- */
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const startOfDay = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const addDays = (t, n) => { const d = new Date(t); d.setDate(d.getDate() + n); return d.getTime(); };
const plural = (n, w, p = w + 's') => `${n} ${n === 1 ? w : p}`;
const fmtTime = (ms) => `${(ms / 1000).toFixed(1)}s`;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isTouch = () => matchMedia('(hover: none)').matches;
const praise = () => shuffle(['¡Bien!', '¡Muy bien!', '¡Excelente!', '¡Eso es!', '¡Perfecto!', '¡Genial!'])[0];

/* ---------- icons ---------- */
const svg = (p) => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const I = {
  speaker: svg('<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14"/>'),
  star: svg('<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/>'),
  cards: svg('<rect x="3" y="7" width="14" height="13" rx="2"/><path d="M7 7V5a2 2 0 012-2h10a2 2 0 012 2v11a2 2 0 01-2 2h-2"/>'),
  learn: svg('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c3.5 2.5 8.5 2.5 12 0v-4.5M22 9v6"/>'),
  write: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>'),
  match: svg('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
  review: svg('<path d="M20 12a8 8 0 11-2.4-5.7"/><path d="M20 4v5h-5"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  upload: svg('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'),
  download: svg('<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>'),
  edit: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>'),
  trash: svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
  shuffle: svg('<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>'),
  swap: svg('<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>'),
  copy: svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/>'),
  check: svg('<path d="M20 6L9 17l-5-5"/>'),
  x: svg('<path d="M18 6L6 18M6 6l12 12"/>'),
  alert: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>'),
  flame: svg('<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-6 6-6 9-1-1-2-2-2-4-1 2-1 4-1 6 0 5 3 8 7 8z"/>'),
  trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0z"/><path d="M17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3"/>'),
  cloud: svg('<path d="M7 18a4.5 4.5 0 01-.6-8.96A6 6 0 0118 10.5 3.75 3.75 0 0117.5 18z"/>'),
  phone: svg('<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>'),
};

/* ---------- starter deck ---------- */
const STARTER = [
  ['hola', 'hello'], ['adiós', 'goodbye'], ['por favor', 'please'], ['gracias', 'thank you / thanks'],
  ['de nada', "you're welcome"], ['lo siento', "I'm sorry"], ['buenos días', 'good morning'],
  ['buenas noches', 'good night / good evening'], ['¿Cómo estás?', 'How are you?'], ['mucho gusto', 'nice to meet you'],
  ['el agua', 'water'], ['la comida', 'food'], ['la casa', 'house / home'], ['el trabajo', 'work / job'],
  ['el amigo', 'friend (m)'], ['la ciudad', 'city'], ['hablar', 'to speak / to talk'], ['comer', 'to eat'],
  ['vivir', 'to live'], ['tener', 'to have'], ['ser', 'to be (permanent)'], ['estar', 'to be (temporary, location)'],
  ['ir', 'to go'], ['querer', 'to want / to love'], ['poder', 'to be able to / can'], ['hacer', 'to do / to make'],
  ['el tiempo', 'time / weather'], ['hoy', 'today'], ['mañana', 'tomorrow / morning'], ['ayer', 'yesterday'],
  ['siempre', 'always'], ['nunca', 'never'], ['también', 'also / too'], ['pero', 'but'], ['porque', 'because'],
  ['¿dónde?', 'where?'], ['¿cuándo?', 'when?'], ['¿por qué?', 'why?'], ['¿cuánto cuesta?', 'how much does it cost?'],
  ['la cuenta', 'the check / the bill'],
];

/* ---------- state ---------- */
const STARTER_IDX = new Map(STARTER.map(([t], i) => [t, i]));
// Settings that sync between devices (voice and install hint stay per-device).
const SYNCED_SETTINGS = ['direction', 'flipDirection', 'reviewStyle', 'strictAccents', 'autoSpeak', 'voiceLang', 'rate', 'newPerDay', 'theme'];
const defaultSettings = () => ({
  direction: 'es-en', flipDirection: 'en-es', reviewStyle: 'flip', strictAccents: false, autoSpeak: false, voiceLang: 'es-ES', voiceName: '',
  rate: 0.9, newPerDay: 20, theme: 'system', hideInstallHint: false, updated: 0,
});
const defaultStats = () => ({ history: {} });
const freshSrs = () => ({ due: 0, interval: 0, ease: 2.5, reps: 0, lapses: 0, last: 0 });

// `updated` = when the text/star last changed (used to merge edits from other devices)
function normalizeCard(c = {}) {
  return {
    id: c.id || uid(), term: String(c.term ?? ''), def: String(c.def ?? ''), starred: !!c.starred,
    updated: c.updated || 0, srs: Object.assign(freshSrs(), c.srs || {}),
  };
}
function normalizeDeck(d = {}) {
  return {
    id: d.id || uid(), name: String(d.name || 'Untitled deck'), created: d.created || Date.now(),
    updated: d.updated || 0, bestMatch: d.bestMatch || 0,
    cards: (Array.isArray(d.cards) ? d.cards : []).map(normalizeCard),
  };
}
const makeCard = (fields = {}) => normalizeCard({ ...fields, updated: Date.now() });
const makeDeck = (fields = {}) => normalizeDeck({ ...fields, updated: Date.now() });

function defaultState() {
  return {
    version: 1,
    decks: [normalizeDeck({ id: 'starter', name: 'Starter: Essentials', cards: STARTER.map(([term, def], i) => ({ id: `st${i}`, term, def })) })],
    settings: defaultSettings(), stats: defaultStats(),
    deleted: { decks: {}, cards: {} }, progressResetAt: 0,
  };
}
// Older installs gave the starter deck random ids; give it fixed ids so it merges across devices.
function migrateStarter(decks) {
  if (decks.some((d) => d.id === 'starter')) return;
  const d = decks.find((x) => x.name === 'Starter: Essentials');
  if (!d || !d.cards.length || !d.cards.every((c) => STARTER_IDX.has(c.term))) return;
  if (new Set(d.cards.map((c) => c.term)).size !== d.cards.length) return;
  d.id = 'starter';
  d.cards.forEach((c) => { c.id = `st${STARTER_IDX.get(c.term)}`; });
}
function normalizeState(s) {
  const decks = Array.isArray(s.decks) ? s.decks.map(normalizeDeck) : [];
  migrateStarter(decks);
  return {
    version: 1,
    decks,
    settings: Object.assign(defaultSettings(), s.settings || {}),
    stats: { history: (s.stats && s.stats.history) || {} },
    deleted: { decks: { ...(s.deleted?.decks || {}) }, cards: { ...(s.deleted?.cards || {}) } },
    progressResetAt: s.progressResetAt || 0,
  };
}
function tombstone(kind, id) { state.deleted[kind][id] = Date.now(); }
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch (e) { /* fall through */ }
  return defaultState();
}
let state = load();
function save(opts = {}) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { toast('Could not save — browser storage is full or blocked'); }
  if (!opts.silent) scheduleSync();
}
let saveTimer;
const saveSoon = () => { clearTimeout(saveTimer); saveTimer = setTimeout(save, 300); };

/* ---------- sync (private GitHub gist) ----------
   Each device keeps a full copy. A sync = download the gist, merge it into
   this device's data, upload the result if anything differs. Merging is per
   card: newest text wins, most recent study progress wins, deletions are kept
   as "tombstones" so they spread too. */
const SYNC_KEY = 'espanol.sync';
const GIST_FILE = 'espanol-sync.json';
function loadSync() { try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || {}; } catch { return {}; } }
let sync = loadSync(); // { token, login, gistId, lastSync } — kept out of backups
const saveSync = () => { try { localStorage.setItem(SYNC_KEY, JSON.stringify(sync)); } catch { /* ignore */ } };
const syncState = { busy: false, pending: false, dirty: false, status: '', error: '', timer: null };
const syncOn = () => !!(sync.token && sync.gistId);

async function gh(path, { token = sync.token, method = 'GET', body } = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    method, body, cache: 'no-store',
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
  });
  if (!res.ok) { const e = new Error(`GitHub error ${res.status}`); e.status = res.status; throw e; }
  return res.json();
}
async function findGist(token) {
  for (let page = 1; page <= 10; page++) {
    const list = await gh(`/gists?per_page=100&page=${page}`, { token });
    const g = list.find((x) => x.files && x.files[GIST_FILE]);
    if (g) return g;
    if (list.length < 100) return null;
  }
  return null;
}
async function readRemote(id, token = sync.token) {
  const g = await gh(`/gists/${id}`, { token });
  const f = g.files && g.files[GIST_FILE];
  if (!f) return null;
  if (f.truncated) return (await fetch(f.raw_url, { cache: 'no-store' })).text();
  return f.content;
}
function syncPayload() {
  const cutoff = Date.now() - 365 * 864e5;
  for (const kind of ['decks', 'cards']) for (const [id, ts] of Object.entries(state.deleted[kind])) if (ts < cutoff) delete state.deleted[kind][id];
  const settings = { updated: state.settings.updated || 0 };
  SYNCED_SETTINGS.forEach((k) => { settings[k] = state.settings[k]; });
  return JSON.stringify({
    version: 1, app: 'espanol', decks: state.decks, settings,
    stats: { history: state.stats.history }, deleted: state.deleted, progressResetAt: state.progressResetAt,
  });
}

// Merge another device's data into `state` IN PLACE (open study sessions keep
// working because card objects are updated, not replaced). Returns true if anything changed.
function mergeRemote(raw) {
  const R = normalizeState(raw); const L = state; let changed = false;
  for (const kind of ['decks', 'cards']) {
    for (const [id, ts] of Object.entries(R.deleted[kind])) if (!(L.deleted[kind][id] >= ts)) L.deleted[kind][id] = ts;
  }
  const resetAt = Math.max(L.progressResetAt, R.progressResetAt);
  if (resetAt > L.progressResetAt) {
    L.progressResetAt = resetAt;
    L.decks.forEach((d) => d.cards.forEach((c) => { if (c.srs.last && c.srs.last <= resetAt) { c.srs = freshSrs(); changed = true; } }));
  }
  const delD = L.deleted.decks; const delC = L.deleted.cards;
  for (const rd of R.decks) {
    if (delD[rd.id] >= rd.updated) continue;
    let ld = L.decks.find((d) => d.id === rd.id);
    if (!ld) { ld = normalizeDeck({ ...rd, cards: [] }); L.decks.push(ld); changed = true; }
    else if (rd.updated > ld.updated) { ld.name = rd.name; ld.updated = rd.updated; changed = true; }
    if (rd.bestMatch && (!ld.bestMatch || rd.bestMatch < ld.bestMatch)) { ld.bestMatch = rd.bestMatch; changed = true; }
    const byId = new Map(ld.cards.map((c) => [c.id, c]));
    let prev = -1;
    for (const rc of rd.cards) {
      if (delC[rc.id] >= rc.updated) continue;
      const lc = byId.get(rc.id);
      if (!lc) {
        const nc = normalizeCard(rc);
        if (nc.srs.last && nc.srs.last <= resetAt) nc.srs = freshSrs();
        ld.cards.splice(prev + 1, 0, nc); byId.set(nc.id, nc); prev += 1; changed = true;
      } else {
        if (rc.updated > lc.updated) { lc.term = rc.term; lc.def = rc.def; lc.starred = rc.starred; lc.updated = rc.updated; changed = true; }
        if (rc.srs.last > lc.srs.last && rc.srs.last > resetAt) { lc.srs = { ...rc.srs }; changed = true; }
        prev = ld.cards.indexOf(lc);
      }
    }
  }
  const count = () => L.decks.length + L.decks.reduce((n, d) => n + d.cards.length, 0);
  const before = count();
  L.decks = L.decks.filter((d) => !(delD[d.id] >= d.updated));
  L.decks.forEach((d) => { d.cards = d.cards.filter((c) => !(delC[c.id] >= c.updated)); });
  if (count() !== before) changed = true;
  if (R.settings.updated > (L.settings.updated || 0)) {
    SYNCED_SETTINGS.forEach((k) => { L.settings[k] = R.settings[k]; });
    L.settings.updated = R.settings.updated; applyTheme(); changed = true;
  }
  for (const [k, h] of Object.entries(R.stats.history)) {
    const lh = L.stats.history[k];
    if (!lh) { L.stats.history[k] = { reviews: h.reviews || 0, newCards: h.newCards || 0 }; changed = true; continue; }
    for (const f of ['reviews', 'newCards']) if ((h[f] || 0) > (lh[f] || 0)) { lh[f] = h[f]; changed = true; }
  }
  return changed;
}

function scheduleSync(delay = 8000) {
  if (!syncOn()) return;
  syncState.dirty = true;
  clearTimeout(syncState.timer);
  syncState.timer = setTimeout(runSync, delay);
}
function setSyncStatus(s) { syncState.status = s; updateSyncUI(); }
async function runSync() {
  if (!syncOn()) return;
  if (syncState.busy) { syncState.pending = true; return; }
  if (!navigator.onLine) { setSyncStatus('offline'); return; }
  syncState.busy = true; syncState.dirty = false; clearTimeout(syncState.timer);
  setSyncStatus('syncing');
  try {
    const text = await readRemote(sync.gistId);
    let changed = false;
    if (text) { try { changed = mergeRemote(JSON.parse(text)); } catch { /* unreadable remote: overwrite it */ } }
    if (changed) save({ silent: true });
    const out = syncPayload();
    if (out !== text) await gh(`/gists/${sync.gistId}`, { method: 'PATCH', body: JSON.stringify({ files: { [GIST_FILE]: { content: out } } }) });
    sync.lastSync = Date.now(); saveSync();
    syncState.error = ''; setSyncStatus('ok');
    if (changed) refreshAfterSync();
  } catch (e) {
    syncState.error = e.status === 401 ? 'auth' : e.status === 404 ? 'missing' : 'network';
    setSyncStatus('error');
  } finally {
    syncState.busy = false;
    if (syncState.pending) { syncState.pending = false; scheduleSync(1500); }
  }
}
// Re-draw list screens when another device's changes arrive (study screens are left alone).
function refreshAfterSync() {
  const path = (location.hash || '#/').split('?')[0];
  if (path === '#/' || path === '#' || /^#\/deck\/\w+$/.test(path)) { const y = window.scrollY; route(); window.scrollTo(0, y); }
}
async function connectSync(token) {
  const user = await gh('/user', { token });
  const found = await findGist(token);
  if (found) {
    let remote = null;
    try { remote = JSON.parse(await readRemote(found.id, token)); } catch { /* treat as empty */ }
    ui.syncPending = { token, login: user.login, gistId: found.id, remote };
    if (!remote || !Array.isArray(remote.decks)) finishConnect('combine');
    return;
  }
  const g = await gh('/gists', {
    token, method: 'POST',
    body: JSON.stringify({ description: 'Español app — synced flashcards', public: false, files: { [GIST_FILE]: { content: syncPayload() } } }),
  });
  sync = { token, login: user.login, gistId: g.id, lastSync: Date.now() }; saveSync();
  syncState.status = 'ok'; toast('Sync is on');
}
function finishConnect(mode) {
  const p = ui.syncPending; ui.syncPending = null; if (!p) return;
  if (mode === 'replace' && p.remote) {
    const keep = { voiceName: state.settings.voiceName, hideInstallHint: state.settings.hideInstallHint };
    state = normalizeState(p.remote); Object.assign(state.settings, keep);
    applyTheme(); save({ silent: true });
  }
  sync = { token: p.token, login: p.login, gistId: p.gistId, lastSync: 0 }; saveSync();
  updateSyncUI();
  runSync().then(() => { if (syncState.status === 'ok') toast('Sync is on'); });
}
function ago(t) {
  const s = (Date.now() - t) / 1000;
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(t).toLocaleDateString();
}

const getDeck = (id) => {
  const d = state.decks.find((x) => x.id === id);
  if (!d) { location.hash = '#/'; }
  return d;
};
const findCard = (id) => { for (const d of state.decks) { const c = d.cards.find((x) => x.id === id); if (c) return c; } return null; };
const isValid = (c) => !!(c.term.trim() && c.def.trim());

function applyTheme() {
  const t = state.settings.theme;
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}

/* ---------- spaced repetition (SM-2 style) ---------- */
// q: 0 = again, 1 = hard, 2 = good, 3 = easy
function nextSrs(srs, q, now = Date.now()) {
  const s = { ...srs };
  if (q === 0) {
    if (s.last) s.lapses += 1;
    s.reps = 0; s.interval = 0; s.ease = Math.max(1.3, s.ease - 0.2);
    s.due = now + 5 * 60 * 1000;
  } else {
    let iv;
    if (s.reps === 0) iv = q === 3 ? 3 : 1;
    else if (s.reps === 1) iv = q === 1 ? 2 : q === 2 ? 3 : 6;
    else if (q === 1) iv = Math.max(s.interval + 1, Math.round(s.interval * 1.2));
    else if (q === 2) iv = Math.round(s.interval * s.ease);
    else iv = Math.round(s.interval * s.ease * 1.3);
    if (q === 1) s.ease = Math.max(1.3, s.ease - 0.15);
    if (q === 3) s.ease = Math.min(3.2, s.ease + 0.15);
    s.reps += 1;
    s.interval = Math.min(iv, 365);
    s.due = addDays(startOfDay(now), s.interval);
  }
  s.last = now;
  return s;
}
function fmtInterval(srs, q) {
  if (q === 0) return '5 min';
  const d = nextSrs(srs, q).interval;
  if (d < 30) return plural(d, 'day');
  if (d < 365) return plural(Math.round(d / 30), 'month');
  return '1 year';
}
const status = (c) => (!c.srs.last ? 'new' : c.srs.interval >= 7 ? 'known' : 'learning');
const isDue = (c, now = Date.now()) => !!c.srs.last && c.srs.due <= now;

function touchStats(wasNew = false) {
  const st = state.stats; const k = dayKey();
  const h = st.history[k] || (st.history[k] = { reviews: 0, newCards: 0 });
  h.reviews += 1; if (wasNew) h.newCards += 1;
  const keys = Object.keys(st.history).sort();
  keys.slice(0, Math.max(0, keys.length - 400)).forEach((x) => delete st.history[x]);
}
// Streak = consecutive days with practice, ending today (or yesterday if not yet today).
function currentStreak() {
  const hist = state.stats.history;
  let t = startOfDay(); let n = 0;
  if (!hist[dayKey(t)]?.reviews) t = addDays(t, -1);
  while (hist[dayKey(t)]?.reviews) { n++; t = addDays(t, -1); }
  return n;
}
const newIntroducedToday = () => state.stats.history[dayKey()]?.newCards || 0;

function gradeCard(card, q) {
  const wasNew = !card.srs.last;
  card.srs = nextSrs(card.srs, q);
  touchStats(wasNew);
}
// Used by Flashcards / Learn / Write: wrong answers always reset a card,
// right answers only advance it if it was new or due (so cramming doesn't inflate intervals).
function practice(card, correct) {
  if (!correct) gradeCard(card, 0);
  else if (!card.srs.last || isDue(card)) gradeCard(card, 2);
  else touchStats(false);
  save();
}
function buildReviewQueue(deckId, extraNew = 0) {
  const decks = deckId ? state.decks.filter((d) => d.id === deckId) : state.decks;
  const now = Date.now(); const due = []; const fresh = [];
  for (const d of decks) for (const c of d.cards) {
    if (!isValid(c)) continue;
    if (isDue(c, now)) due.push({ c, d }); else if (!c.srs.last) fresh.push({ c, d });
  }
  const newLeft = Math.max(0, state.settings.newPerDay - newIntroducedToday()) + extraNew;
  return shuffle(due).concat(fresh.slice(0, newLeft));
}

/* ---------- answer checking ---------- */
const deaccent = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const ARTICLE_RE = /^(el|la|los|las|un|una|unos|unas|to|the|a|an)\s+/;
const normAns = (s) => String(s).toLowerCase().normalize('NFC')
  .replace(/\([^)]*\)/g, ' ').replace(/[¿?¡!.,;:"“”«»…]/g, ' ').replace(/[’`]/g, "'")
  .replace(/\s+/g, ' ').trim();
function lev(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length; if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
function answerVariants(ans) {
  const set = new Set();
  const add = (s) => { const n = normAns(s); if (!n) return; set.add(n); const t = n.replace(ARTICLE_RE, ''); if (t) set.add(t); };
  add(ans);
  ans.replace(/\([^)]*\)/g, ' ').split(/[/;,]|\bor\b/).forEach(add);
  return [...set];
}
// returns 'correct' | 'accent' (only accents/ñ differ) | 'typo' (1–2 letters off) | 'wrong'
function checkAnswer(input, answer) {
  const n = normAns(input); if (!n) return 'wrong';
  const ins = [n, n.replace(ARTICLE_RE, '')];
  let best = 'wrong';
  for (const v of answerVariants(answer)) for (const i of ins) {
    if (i === v) return 'correct';
    const dv = deaccent(v); const di = deaccent(i);
    if (dv === di) best = 'accent';
    else if (best === 'wrong') {
      const tol = dv.length >= 10 ? 2 : dv.length >= 5 ? 1 : 0;
      if (tol && lev(di, dv) <= tol) best = 'typo';
    }
  }
  return best;
}

/* ---------- speech ---------- */
const canSpeak = 'speechSynthesis' in window;
function spanishVoice() {
  if (!canSpeak) return null;
  const vs = speechSynthesis.getVoices(); const st = state.settings;
  return (st.voiceName && vs.find((v) => v.name === st.voiceName))
    || vs.find((v) => v.lang.replace('_', '-') === st.voiceLang)
    || vs.find((v) => /^es/i.test(v.lang)) || null;
}
function speak(text) {
  if (!canSpeak || !text) return;
  const t = String(text).replace(/\([^)]*\)/g, ' ').trim();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t);
  u.lang = state.settings.voiceLang;
  const v = spanishVoice(); if (v) { u.voice = v; u.lang = v.lang; }
  u.rate = state.settings.rate;
  speechSynthesis.speak(u);
}
const sayBtn = (text, cls = '') => (canSpeak ? `<button type="button" class="icon-btn say ${cls}" data-say="${esc(text)}" aria-label="Play pronunciation">${I.speaker}</button>` : '');
const starBtn = (c) => `<button type="button" class="icon-btn star ${c.starred ? 'on' : ''}" data-star="${c.id}" aria-pressed="${c.starred}" aria-label="Star card">${I.star}</button>`;
const accentBar = () => `<div class="accents" aria-label="Insert a special character">${['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'].map((ch) => `<button type="button" class="accent" data-ins="${ch}" tabindex="-1">${ch}</button>`).join('')}</div>`;

// which side is shown first
function sides(card, dir = state.settings.direction) {
  const d = dir === 'mixed' ? (Math.random() < 0.5 ? 'es-en' : 'en-es') : dir;
  return d === 'es-en'
    ? { prompt: card.term, answer: card.def, promptEs: true }
    : { prompt: card.def, answer: card.term, promptEs: false };
}

/* ---------- global UI plumbing ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
function insertAtCursor(inp, text) {
  const s = inp.selectionStart ?? inp.value.length; const e = inp.selectionEnd ?? inp.value.length;
  inp.value = inp.value.slice(0, s) + text + inp.value.slice(e);
  inp.focus(); inp.setSelectionRange(s + text.length, s + text.length);
  inp.dispatchEvent(new Event('input', { bubbles: true }));
}
let lastInput = null;
document.addEventListener('focusin', (e) => { if (e.target.matches('input:not([type]), input[type=text], textarea')) lastInput = e.target; });
document.addEventListener('mousedown', (e) => { if (e.target.closest('[data-ins]')) e.preventDefault(); });
document.addEventListener('click', (e) => {
  const say = e.target.closest('[data-say]');
  if (say) { e.preventDefault(); speak(say.dataset.say); return; }
  const star = e.target.closest('[data-star]');
  if (star) {
    e.preventDefault();
    const c = findCard(star.dataset.star);
    if (c) {
      c.starred = !c.starred; c.updated = Date.now(); save();
      $$(`[data-star="${c.id}"]`).forEach((b) => { b.classList.toggle('on', c.starred); b.setAttribute('aria-pressed', c.starred); });
    }
    return;
  }
  const ins = e.target.closest('[data-ins]');
  if (ins) {
    e.preventDefault();
    const inp = lastInput && document.body.contains(lastInput) && !lastInput.readOnly ? lastInput : $('.answer-input:not([readonly])');
    if (inp) insertAtCursor(inp, ins.dataset.ins);
  }
});

let keyHandler = null;
document.addEventListener('keydown', (e) => {
  if (!keyHandler || e.metaKey || e.ctrlKey || e.altKey) return;
  const typing = e.target.matches('input, textarea, select');
  if (typing && e.key !== 'Enter' && e.key !== 'Escape') return;
  keyHandler(e, typing);
});

let deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; });

/* ---------- router ---------- */
let cleanups = [];
let routeGen = 0;
const onCleanup = (fn) => cleanups.push(fn);
const later = (fn, ms) => { const g = routeGen; return setTimeout(() => { if (g === routeGen) fn(); }, ms); };
const app = $('#app');
const render = (html) => { app.innerHTML = html; return app; };

function setHeader(title, back) {
  const h = $('#title');
  h.textContent = title; h.classList.toggle('brand', !back);
  const b = $('#backBtn'); b.hidden = !back; b.onclick = () => { location.hash = back; };
  $('#settingsBtn').hidden = location.hash.startsWith('#/settings');
  document.title = back ? `${title} · Español` : 'Español';
}

const routes = [
  [/^#\/?$/, () => home()],
  [/^#\/deck\/(\w+)$/, (id) => deckView(id)],
  [/^#\/deck\/(\w+)\/edit$/, (id) => deckEdit(id)],
  [/^#\/deck\/(\w+)\/(flash|learn|write|match)$/, (id, mode, q) => ({ flash: flashView, learn: learnView, write: writeView, match: matchView })[mode](id, q)],
  [/^#\/review$/, (q) => reviewView(q)],
  [/^#\/import(?:\/(\w+))?$/, (id) => importView(id)],
  [/^#\/settings$/, () => settingsView()],
];
function route() {
  cleanups.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
  cleanups = []; keyHandler = null; routeGen += 1;
  if (canSpeak) speechSynthesis.cancel();
  const [path, qs] = (location.hash || '#/').split('?');
  const q = new URLSearchParams(qs || '');
  for (const [re, fn] of routes) {
    const m = path.match(re);
    if (m) { fn(...m.slice(1), q); window.scrollTo(0, 0); return; }
  }
  location.hash = '#/';
}
window.addEventListener('hashchange', route);

/* ---------- views: home ---------- */
function deckCounts(d) {
  const now = Date.now(); const r = { total: 0, new: 0, learning: 0, known: 0, due: 0 };
  for (const c of d.cards) { if (!isValid(c)) continue; r.total++; r[status(c)]++; if (isDue(c, now)) r.due++; }
  return r;
}
function progressBar(r) {
  const t = r.total || 1;
  return `<div class="progress" role="img" aria-label="${r.known} known, ${r.learning} learning, ${r.new} new"><span class="p-known" style="width:${(r.known / t) * 100}%"></span><span class="p-learning" style="width:${(r.learning / t) * 100}%"></span></div>`;
}
function deckTile(d) {
  const r = deckCounts(d);
  return `<a class="deck-tile" href="#/deck/${d.id}"><h4>${esc(d.name)}</h4><p class="muted">${plural(r.total, 'card')}${r.due ? ` · <span class="due">${r.due} due</span>` : ''}</p>${progressBar(r)}</a>`;
}

function home() {
  setHeader('Español', null);
  const now = Date.now(); let due = 0; let fresh = 0;
  for (const d of state.decks) for (const c of d.cards) { if (!isValid(c)) continue; if (isDue(c, now)) due++; else if (!c.srs.last) fresh++; }
  const newToday = Math.min(fresh, Math.max(0, state.settings.newPerDay - newIntroducedToday()));
  const todo = due + newToday;
  const streak = currentStreak();
  const studied = state.stats.history[dayKey()]?.reviews || 0;
  const showHint = !isStandalone() && isTouch() && !state.settings.hideInstallHint;
  render(`
    <section class="hero">
      <div class="hero-top">
        <div>
          <p class="eyebrow">Today</p>
          <h2>${todo ? `${plural(todo, 'card')} to review` : 'All caught up'}</h2>
          <p>${due} due · ${newToday} new · ${studied} answered today</p>
        </div>
        <div class="streak ${streak ? 'on' : ''}">${I.flame}<b>${streak}</b><span>day streak</span></div>
      </div>
      <a class="btn primary block" href="#/review" ${todo ? '' : 'aria-disabled="true" tabindex="-1"'}>${I.review} Start review</a>
    </section>
    ${showHint ? `<div class="install-hint">${I.phone}<span>Add Español to your home screen. <a href="#/settings">How?</a></span><button class="icon-btn" id="hideHint" aria-label="Dismiss">${I.x}</button></div>` : ''}
    <div class="section-head">
      <h3>Your decks</h3>
      <div class="row gap"><a class="btn sm ghost" href="#/import">${I.upload} Import</a><button class="btn sm" id="newDeck">${I.plus} New</button></div>
    </div>
    <div class="deck-list">${state.decks.map(deckTile).join('') || '<p class="empty">No decks yet. Create one or import from Quizlet.</p>'}</div>
    <p class="sync-line" id="syncLine">${syncLineHtml()}</p>
  `);
  $('#newDeck').onclick = () => {
    const d = makeDeck({ name: 'New deck', cards: [makeCard()] });
    state.decks.unshift(d); save(); location.hash = `#/deck/${d.id}/edit`;
  };
  const hh = $('#hideHint');
  if (hh) hh.onclick = () => { state.settings.hideInstallHint = true; save(); hh.parentElement.remove(); };
}

/* ---------- views: deck ---------- */
const ui = { starOnly: {} };
function deckView(id) {
  const d = getDeck(id); if (!d) return;
  setHeader(d.name, '#/');
  const r = deckCounts(d);
  const valid = d.cards.filter(isValid);
  const starred = valid.filter((c) => c.starred).length;
  const so = !!ui.starOnly[id] && starred > 0;
  const qs = so ? '?starred=1' : '';
  const reviewNow = r.due + Math.min(r.new, Math.max(0, state.settings.newPerDay - newIntroducedToday()));
  const modes = [
    ['flash', 'Flashcards', 'Flip and sort what you know', I.cards],
    ['learn', 'Learn', 'Multiple choice, then typing', I.learn],
    ['write', 'Write', 'Type every answer', I.write],
    ['match', 'Match', 'Race to pair them up', I.match],
  ];
  render(`
    <section class="deck-head">
      <div class="stats3"><div><b>${r.new}</b><span>New</span></div><div><b>${r.learning}</b><span>Learning</span></div><div><b>${r.known}</b><span>Known</span></div></div>
      ${progressBar(r)}
    </section>
    <a class="review-strip" href="#/review?deck=${d.id}">${I.review}<div><b>Review this deck</b><span>${reviewNow ? `${plural(reviewNow, 'card')} ready` : 'Nothing due'} · spaced repetition</span></div><span class="chev">›</span></a>
    <div class="mode-grid">${modes.map(([m, t, s, ic]) => `<a class="mode" href="#/deck/${d.id}/${m}${qs}"><span class="mode-ic">${ic}</span><b>${t}</b><span class="muted">${s}</span></a>`).join('')}</div>
    ${starred ? `<label class="switch-row"><span class="inline">${I.star} Study starred only (${starred})</span><input type="checkbox" id="starOnly" class="switch" ${so ? 'checked' : ''}></label>` : ''}
    <div class="section-head">
      <h3>${plural(valid.length, 'card')}</h3>
      <div class="row gap"><a class="btn sm ghost" href="#/import/${d.id}">${I.upload} Add</a><a class="btn sm" href="#/deck/${d.id}/edit">${I.edit} Edit</a></div>
    </div>
    <div class="card-list">${valid.map((c) => `<div class="card-row"><span class="dot ${status(c)}" title="${status(c)}"></span><div class="cr-text"><div class="cr-term" lang="es">${esc(c.term)}</div><div class="cr-def">${esc(c.def)}</div></div>${sayBtn(c.term)}${starBtn(c)}</div>`).join('') || `<p class="empty">No cards yet. <a href="#/deck/${d.id}/edit">Add some</a>.</p>`}</div>
    <div class="danger-row">
      <button class="btn sm ghost" id="copyText">${I.copy} Copy as text</button>
      <button class="btn sm ghost danger" id="delDeck">${I.trash} Delete deck</button>
    </div>
  `);
  const soEl = $('#starOnly');
  if (soEl) soEl.onchange = () => { ui.starOnly[id] = soEl.checked; deckView(id); };
  $('#copyText').onclick = async () => {
    const text = valid.map((c) => `${c.term}\t${c.def}`).join('\n');
    try { await navigator.clipboard.writeText(text); toast('Copied — paste it anywhere'); } catch { toast('Copy failed'); }
  };
  $('#delDeck').onclick = () => {
    if (!confirm(`Delete “${d.name}” and its ${plural(d.cards.length, 'card')}? This can't be undone.`)) return;
    tombstone('decks', id); state.decks = state.decks.filter((x) => x.id !== id); save(); toast('Deck deleted'); location.hash = '#/';
  };
}

function deckEdit(id) {
  const d = getDeck(id); if (!d) return;
  setHeader('Edit deck', `#/deck/${id}`);
  if (!d.cards.length) d.cards.push(makeCard());
  const row = (c, i) => `<div class="edit-row" data-id="${c.id}"><span class="er-num">${i + 1}</span><div class="er-fields"><label><span>Spanish</span><input class="er-term" lang="es" value="${esc(c.term)}" autocapitalize="off" autocomplete="off" spellcheck="false" enterkeyhint="next"></label><label><span>English</span><input class="er-def" value="${esc(c.def)}" autocapitalize="off" autocomplete="off" enterkeyhint="next"></label></div><button type="button" class="icon-btn er-del" aria-label="Delete card">${I.trash}</button></div>`;
  render(`
    <label class="field"><span>Deck name</span><input id="deckName" value="${esc(d.name)}" autocomplete="off"></label>
    <div class="row gap wrap"><button class="btn sm ghost" id="swapAll">${I.swap} Swap columns</button><a class="btn sm ghost" href="#/import/${id}">${I.upload} Bulk import</a></div>
    <div id="rows" class="edit-list">${d.cards.map(row).join('')}</div>
    <button class="btn block dashed" id="addRow">${I.plus} Add card</button>
    <div class="sticky-bottom">${accentBar()}<a class="btn primary" href="#/deck/${id}">Done</a></div>
  `);
  const rows = $('#rows');
  const renumber = () => $$('.er-num', rows).forEach((n, i) => { n.textContent = i + 1; });
  const addRow = () => {
    const c = makeCard(); d.cards.push(c);
    rows.insertAdjacentHTML('beforeend', row(c, d.cards.length - 1));
    rows.lastElementChild.querySelector('.er-term').focus();
  };
  $('#deckName').oninput = (e) => { d.name = e.target.value.trim() || 'Untitled deck'; d.updated = Date.now(); saveSoon(); };
  rows.addEventListener('input', (e) => {
    const r = e.target.closest('.edit-row'); const c = r && d.cards.find((x) => x.id === r.dataset.id); if (!c) return;
    if (e.target.classList.contains('er-term')) c.term = e.target.value; else c.def = e.target.value;
    c.updated = Date.now();
    saveSoon();
  });
  rows.addEventListener('click', (e) => {
    const b = e.target.closest('.er-del'); if (!b) return;
    const r = b.closest('.edit-row');
    tombstone('cards', r.dataset.id); d.cards = d.cards.filter((x) => x.id !== r.dataset.id); r.remove(); renumber(); saveSoon();
  });
  rows.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const r = e.target.closest('.edit-row');
    if (e.target.classList.contains('er-term')) r.querySelector('.er-def').focus();
    else if (r.nextElementSibling) r.nextElementSibling.querySelector('.er-term').focus();
    else addRow();
  });
  $('#addRow').onclick = addRow;
  $('#swapAll').onclick = () => {
    d.cards.forEach((c) => { [c.term, c.def] = [c.def, c.term]; c.updated = Date.now(); });
    save(); toast('Swapped Spanish and English'); deckEdit(id);
  };
  onCleanup(() => {
    clearTimeout(saveTimer);
    d.cards.filter((c) => !c.term.trim() && !c.def.trim()).forEach((c) => tombstone('cards', c.id));
    d.cards = d.cards.filter((c) => c.term.trim() || c.def.trim());
    save();
  });
}

/* ---------- views: import ---------- */
function seg(name, opts, val) {
  return `<div class="seg" role="radiogroup">${opts.map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}" ${v === val ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
}
const segVal = (name, root = document) => $(`input[name="${name}"]:checked`, root)?.value;

function parseImport(text, sep, custom, rowSep, order) {
  const lines = rowSep === 'semi' ? text.split(';') : text.split(/\r?\n/);
  const cards = []; let skipped = 0;
  for (const raw of lines) {
    const line = raw.replace(/^[  ]+|[  ]+$/g, ''); // trim spaces but keep tabs (they're separators)
    if (!line.trim()) continue;
    let i = -1; let len = 0;
    if (sep === 'tab') { i = line.indexOf('\t'); len = 1; }
    else if (sep === 'comma') { i = line.indexOf(','); len = 1; }
    else if (sep === 'dash') { const m = /\s[-–—]\s/.exec(line) || /[-–—]/.exec(line); if (m) { i = m.index; len = m[0].length; } }
    else if (sep === 'custom' && custom) { i = line.indexOf(custom); len = custom.length; }
    const unq = (s) => s.trim().replace(/^"(.*)"$/, '$1').trim();
    const a = i > 0 ? unq(line.slice(0, i)) : ''; const b = i > 0 ? unq(line.slice(i + len)) : '';
    if (!a || !b) { skipped++; continue; }
    cards.push(order === 'second' ? { term: b, def: a } : { term: a, def: b });
  }
  return { cards, skipped };
}

function importView(deckId) {
  const target = deckId ? getDeck(deckId) : null; if (deckId && !target) return;
  setHeader(target ? `Add to ${target.name}` : 'Import cards', target ? `#/deck/${deckId}` : '#/');
  render(`
    <details class="help" ${target ? '' : 'open'}>
      <summary>How to copy a set from Quizlet</summary>
      <ol>
        <li>Open the set on quizlet.com (easiest on a computer).</li>
        <li>Click the <b>⋯</b> button → <b>Export</b>.</li>
        <li>Keep “Between term and definition” on <b>Tab</b> and “Between rows” on <b>New line</b>.</li>
        <li>Click <b>Copy text</b>, then paste it below.</li>
      </ol>
      <p class="muted">Any list works too — one card per line, like <code>el perro - the dog</code>.</p>
    </details>
    ${target ? '' : '<label class="field"><span>Deck name</span><input id="impName" placeholder="e.g. Unit 3 — La comida" autocomplete="off"></label>'}
    <label class="field"><span>Paste your cards</span><textarea id="impText" rows="8" spellcheck="false" placeholder="el perro - the dog&#10;el gato - the cat"></textarea></label>
    <label class="btn sm ghost file-btn">${I.upload} Or choose a .txt / .csv file<input type="file" id="impFile" accept=".txt,.csv,.tsv,text/plain,text/csv" hidden></label>
    <div class="opts" id="opts">
      <div class="field"><span>Between Spanish and English</span>${seg('sepTerm', [['tab', 'Tab'], ['dash', 'Dash'], ['comma', 'Comma'], ['custom', 'Other']], 'tab')}<input id="sepCustom" class="sm-input" placeholder="e.g. =" hidden></div>
      <div class="field"><span>Between cards</span>${seg('sepRow', [['line', 'New line'], ['semi', 'Semicolon']], 'line')}</div>
      <div class="field"><span>Spanish is in the</span>${seg('order', [['first', 'First column'], ['second', 'Second column']], 'first')}</div>
    </div>
    <div id="impPreview" class="preview"></div>
    <button class="btn primary block" id="impGo" disabled>Import</button>
  `);
  let touchedSep = false;
  const ta = $('#impText');
  const update = () => {
    const text = ta.value;
    if (!touchedSep && text.trim()) {
      const guess = text.includes('\t') ? 'tab' : /\s[-–—]\s/.test(text) ? 'dash' : text.includes(',') ? 'comma' : 'tab';
      $(`input[name=sepTerm][value=${guess}]`).checked = true;
    }
    $('#sepCustom').hidden = segVal('sepTerm') !== 'custom';
    const { cards, skipped } = parseImport(text, segVal('sepTerm'), $('#sepCustom').value, segVal('sepRow'), segVal('order'));
    $('#impPreview').innerHTML = !text.trim() ? '' : `
      <p><b>${plural(cards.length, 'card')}</b> found${skipped ? ` <span class="muted">· ${plural(skipped, 'line')} skipped (no separator found)</span>` : ''}</p>
      ${cards.length ? `<table><thead><tr><th>Spanish</th><th>English</th></tr></thead><tbody>${cards.slice(0, 5).map((c) => `<tr><td lang="es">${esc(c.term)}</td><td>${esc(c.def)}</td></tr>`).join('')}</tbody></table>${cards.length > 5 ? `<p class="muted small" style="margin-top:6px">…and ${cards.length - 5} more</p>` : ''}` : ''}`;
    const go = $('#impGo'); go.disabled = !cards.length;
    go.textContent = cards.length ? `Import ${plural(cards.length, 'card')}` : 'Import';
    return cards;
  };
  $('#opts').addEventListener('change', (e) => { if (e.target.name === 'sepTerm') touchedSep = true; update(); });
  $('#sepCustom').oninput = update;
  ta.oninput = update;
  $('#impFile').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    ta.value = await f.text();
    const nm = $('#impName'); if (nm && !nm.value) nm.value = f.name.replace(/\.[^.]+$/, '');
    update();
  };
  $('#impGo').onclick = () => {
    const cards = update(); if (!cards.length) return;
    let deck = target;
    if (!deck) { deck = makeDeck({ name: $('#impName').value.trim() || 'Imported deck' }); state.decks.unshift(deck); }
    deck.cards = deck.cards.filter((c) => c.term.trim() || c.def.trim());
    const key = (c) => `${c.term}\u0000${c.def}`.toLowerCase();
    const seen = new Set(deck.cards.map(key)); let added = 0;
    for (const c of cards) { if (seen.has(key(c))) continue; seen.add(key(c)); deck.cards.push(makeCard(c)); added++; }
    save();
    toast(added === cards.length ? `Added ${plural(added, 'card')}` : `Added ${added} — ${cards.length - added} were already in the deck`);
    location.hash = `#/deck/${deck.id}`;
  };
}

/* ---------- study helpers ---------- */
function studyCards(d, q) {
  const cs = d.cards.filter(isValid);
  if (q && q.get('starred')) { const s = cs.filter((c) => c.starred); if (s.length) return s; }
  return cs;
}
function emptyStudy(d, msg) {
  render(`<div class="empty-state"><div class="big-ic">${I.cards}</div><p>${msg || 'This deck has no complete cards yet.'}</p><a class="btn primary" href="#/deck/${d.id}/edit">Add cards</a></div>`);
}
const progressTop = (done, total, label) => `<div class="study-top"><div class="bar"><span style="width:${total ? (done / total) * 100 : 0}%"></span></div><span class="count">${label ?? `${done} / ${total}`}</span></div>`;
const langAttr = (isEs) => (isEs ? 'lang="es"' : '');

function feedback(el, kind, html, onContinue, extra = '') {
  const fb = $('#fb', el);
  const icon = kind === 'good' ? I.check : kind === 'warn' ? I.alert : I.x;
  fb.innerHTML = `<div class="feedback ${kind}"><div class="fb-msg">${icon}<div>${html}</div></div>${onContinue ? `<div class="fb-actions">${extra}<button class="btn primary" type="button" id="cont">Continue</button></div>` : ''}</div>`;
  if (!onContinue) { keyHandler = null; return; }
  let fired = false;
  const go = () => { if (fired) return; fired = true; keyHandler = null; onContinue(); };
  $('#cont', fb).onclick = go;
  keyHandler = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
  fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function choicesFor(it, pool) {
  const key = it.promptEs ? 'def' : 'term';
  const seen = new Set([normAns(it.answer)]); const opts = [];
  for (const c of shuffle(pool)) {
    const k = normAns(c[key]); if (seen.has(k)) continue;
    seen.add(k); opts.push(c[key]); if (opts.length === 3) break;
  }
  return shuffle([it.answer, ...opts]);
}

function questionCard(it, hint) {
  return `<div class="q-card"><span class="face-label">${hint}</span><div class="q-text" ${langAttr(it.promptEs)}>${esc(it.prompt)}</div>${it.promptEs ? sayBtn(it.prompt) : ''}</div>`;
}

function mcQuestion(el, it, options, done) {
  el.innerHTML = `
    ${questionCard(it, `Choose the ${it.promptEs ? 'English' : 'Spanish'}`)}
    <div class="options">${options.map((o, k) => `<button type="button" class="option" data-k="${k}" ${langAttr(!it.promptEs)}><span class="okey">${k + 1}</span><span>${esc(o)}</span></button>`).join('')}</div>
    <div class="q-foot"><button class="btn ghost sm" type="button" id="idk">I don't know</button></div>
    <div id="fb"></div>`;
  if (state.settings.autoSpeak && it.promptEs) speak(it.prompt);
  let answered = false;
  const pick = (k) => {
    if (answered) return; answered = true;
    const ok = k !== null && options[k] === it.answer;
    $$('.option', el).forEach((b, j) => {
      b.disabled = true;
      if (options[j] === it.answer) b.classList.add('right'); else if (j === k) b.classList.add('wrong');
    });
    $('#idk', el).hidden = true;
    if (state.settings.autoSpeak && !it.promptEs) speak(it.answer);
    if (ok) { feedback(el, 'good', praise()); later(() => done(true), 750); }
    else feedback(el, 'bad', `The answer is <b ${langAttr(!it.promptEs)}>${esc(it.answer)}</b>`, () => done(false));
  };
  $('.options', el).onclick = (e) => { const b = e.target.closest('.option'); if (b) pick(+b.dataset.k); };
  $('#idk', el).onclick = () => pick(null);
  keyHandler = (e) => { const n = parseInt(e.key, 10); if (n >= 1 && n <= options.length) { e.preventDefault(); pick(n - 1); } };
}

function writtenQuestion(el, it, done) {
  const ansEs = !it.promptEs;
  el.innerHTML = `
    ${questionCard(it, `Type the ${ansEs ? 'Spanish' : 'English'}`)}
    <form class="answer-form" autocomplete="off">
      <input class="answer-input" ${langAttr(ansEs)} placeholder="Type the ${ansEs ? 'Spanish' : 'English'}" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="done">
      <button class="btn primary" type="submit">Check</button>
    </form>
    ${ansEs ? accentBar() : ''}
    <div class="q-foot"><button class="btn ghost sm" type="button" id="idk">I don't know</button></div>
    <div id="fb"></div>`;
  const inp = $('.answer-input', el);
  if (!isTouch()) inp.focus({ preventScroll: true });
  if (state.settings.autoSpeak && it.promptEs) speak(it.prompt);
  let answered = false;
  const submit = (given) => {
    if (answered) return; answered = true;
    inp.readOnly = true; $('button[type=submit]', el).disabled = true; $('#idk', el).hidden = true;
    const acc = $('.accents', el); if (acc) acc.hidden = true;
    const res = given ? checkAnswer(given, it.answer) : 'wrong';
    const A = `<b ${langAttr(ansEs)}>${esc(it.answer)}</b>`;
    if (state.settings.autoSpeak && ansEs) speak(it.answer);
    if (res === 'correct') {
      inp.classList.add('ok'); feedback(el, 'good', praise()); later(() => done(true), 850);
    } else if (res === 'accent' && !state.settings.strictAccents) {
      inp.classList.add('ok'); feedback(el, 'warn', `Almost! Watch the accents: ${A}`, () => done(true));
    } else if (res === 'typo') {
      inp.classList.add('ok'); feedback(el, 'warn', `Close enough — check the spelling: ${A}`, () => done(true));
    } else {
      inp.classList.add('bad');
      const extra = given ? '<button class="btn ghost" type="button" id="override">I was right</button>' : '';
      feedback(el, 'bad', `${given ? `You wrote <s>${esc(given)}</s><br>` : ''}The answer is ${A}${res === 'accent' ? '<br><span class="muted small">Accents count because strict mode is on.</span>' : ''}`, () => done(false), extra);
      const ov = $('#override', el);
      if (ov) ov.onclick = () => { keyHandler = null; done(true); };
    }
  };
  $('form', el).onsubmit = (e) => { e.preventDefault(); if (answered) return; const v = inp.value.trim(); if (!v) { inp.focus(); return; } submit(v); };
  $('#idk', el).onclick = () => submit('');
}

function faceHtml(c, text, isEs, front) {
  return `<div class="face-inner"><span class="face-label">${isEs ? 'Español' : 'English'}</span><div class="face-text ${text.length > 36 ? 'long' : ''}" ${langAttr(isEs)}>${esc(text)}</div><div class="face-actions">${isEs ? sayBtn(text) : ''}${front ? starBtn(c) : ''}</div></div>`;
}

/* ---------- views: flashcards ---------- */
function flashView(id, q) {
  const d = getDeck(id); if (!d) return;
  setHeader('Flashcards', `#/deck/${id}`);
  const all = studyCards(d, q); if (!all.length) return emptyStudy(d);
  let items; let i; let known; let missed;
  const start = (cards) => { items = shuffle(cards).map((c) => ({ c, ...sides(c, state.settings.flipDirection) })); i = 0; known = []; missed = []; show(); };

  function show() {
    if (i >= items.length) return summary();
    const it = items[i]; let flipped = false; let graded = false;
    render(`
      ${progressTop(i, items.length)}
      <div class="flash-wrap"><div class="swipe" id="swipe">
        <div class="flashcard" id="fc" tabindex="0" role="button" aria-label="Flashcard — tap to flip">
          <div class="face front">${faceHtml(it.c, it.prompt, it.promptEs, true)}</div>
          <div class="face back">${faceHtml(it.c, it.answer, !it.promptEs, false)}</div>
        </div>
        <div class="swipe-hint left">Still learning</div><div class="swipe-hint right">Know it</div>
      </div></div>
      <div class="grade-row">
        <button class="btn bad-soft" type="button" id="no">${I.x} Learning <span class="pill">${missed.length}</span></button>
        <button class="btn good-soft" type="button" id="yes">${I.check} Know it <span class="pill">${known.length}</span></button>
      </div>
      <p class="kbd-tip">${isTouch() ? 'Tap to flip · swipe right if you know it, left if not' : 'Space to flip · ← still learning · → know it · S to hear it'}</p>
      <div class="row center"><button class="btn sm ghost" type="button" id="shuf">${I.shuffle} Shuffle & restart</button></div>
    `);
    if (state.settings.autoSpeak && it.promptEs) speak(it.prompt);
    const fc = $('#fc'); const sw = $('#swipe');
    const flip = () => {
      flipped = !flipped; fc.classList.toggle('flipped', flipped);
      if (flipped && state.settings.autoSpeak && !it.promptEs) speak(it.answer);
    };
    const grade = (ok) => {
      if (graded) return; graded = true; keyHandler = null;
      (ok ? known : missed).push(it.c); practice(it.c, ok);
      sw.classList.remove('dragging'); sw.classList.add(ok ? 'fly-right' : 'fly-left');
      later(() => { i++; show(); }, 200);
    };
    $('#yes').onclick = () => grade(true);
    $('#no').onclick = () => grade(false);
    $('#shuf').onclick = () => start(all);

    let sx = null; let sy = 0; let dx = 0;
    sw.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || e.button > 0) return;
      sx = e.clientX; sy = e.clientY; dx = 0; sw.classList.add('dragging');
      try { sw.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    });
    sw.addEventListener('pointermove', (e) => {
      if (sx === null) return;
      dx = e.clientX - sx;
      sw.style.transform = `translateX(${dx}px) rotate(${dx / 22}deg)`;
      sw.dataset.lean = dx > 50 ? 'right' : dx < -50 ? 'left' : '';
    });
    const end = (e) => {
      if (sx === null) return;
      const moved = Math.abs(dx) + Math.abs(e.clientY - sy);
      sx = null; sw.classList.remove('dragging');
      if (Math.abs(dx) > 90 && e.type === 'pointerup') { grade(dx > 0); return; }
      sw.style.transform = ''; sw.dataset.lean = '';
      if (moved < 10 && e.type === 'pointerup') flip();
    };
    sw.addEventListener('pointerup', end);
    sw.addEventListener('pointercancel', end);
    keyHandler = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); flip(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); grade(true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); grade(false); }
      else if (e.key.toLowerCase() === 's') speak(it.promptEs ? it.prompt : it.answer);
    };
  }

  function summary() {
    keyHandler = null;
    const pct = Math.round((known.length / items.length) * 100);
    const starredQ = q.get('starred') ? '?starred=1' : '';
    render(`<div class="summary">
      <div class="ring" style="--p:${pct}"><b>${pct}%</b></div>
      <h2>${missed.length ? '¡Buen trabajo!' : '¡Perfecto!'}</h2>
      <p class="muted">You knew ${known.length} of ${items.length}.${missed.length ? ` ${plural(missed.length, 'card')} still need practice.` : ''}</p>
      <div class="stack">
        ${missed.length ? `<button class="btn primary block" id="again">Study the ${missed.length} I missed</button>` : ''}
        <button class="btn block" id="restart">Start over</button>
        <a class="btn ghost block" href="#/deck/${id}/learn${starredQ}">Continue in Learn mode</a>
      </div></div>`);
    const missedNow = missed.slice();
    const ag = $('#again'); if (ag) ag.onclick = () => start(missedNow);
    $('#restart').onclick = () => start(all);
  }
  start(all);
}

/* ---------- views: learn ---------- */
function learnView(id, q) {
  const d = getDeck(id); if (!d) return;
  setHeader('Learn', `#/deck/${id}`);
  const all = studyCards(d, q); if (!all.length) return emptyStudy(d);
  const distractorPool = d.cards.filter(isValid);
  let items; let pool; let queue;

  const start = (cards) => {
    items = shuffle(cards).map((c) => ({ c, stage: 0, wrong: 0, ...sides(c) }));
    pool = items.slice(); queue = pool.splice(0, 7); show();
  };
  function show() {
    if (!queue.length) return summary();
    const it = queue[0];
    const learned = items.filter((x) => x.stage >= 2).length;
    const progress = items.reduce((s, x) => s + Math.min(x.stage, 2), 0);
    render(`${progressTop(progress, items.length * 2, `${learned} / ${items.length} learned`)}<div id="q"></div>`);
    const done = (ok) => {
      queue.shift(); practice(it.c, ok);
      if (ok) it.stage++; else it.wrong++;
      if (it.stage >= 2) { if (pool.length) queue.push(pool.shift()); }
      else queue.splice(Math.min(queue.length, 2 + Math.floor(Math.random() * 3)), 0, it);
      show();
    };
    if (it.stage === 0) mcQuestion($('#q'), it, choicesFor(it, distractorPool), done);
    else writtenQuestion($('#q'), it, done);
  }
  function summary() {
    keyHandler = null;
    const hard = items.filter((x) => x.wrong > 0).sort((a, b) => b.wrong - a.wrong);
    render(`<div class="summary">
      <div class="big-ic">${I.trophy}</div>
      <h2>¡Lo lograste!</h2>
      <p class="muted">You learned all ${plural(items.length, 'card')}${hard.length ? ` — ${hard.length} gave you trouble.` : ' with no mistakes.'}</p>
      ${hard.length ? `<div class="card-list compact">${hard.slice(0, 10).map((x) => `<div class="card-row"><div class="cr-text"><div class="cr-term" lang="es">${esc(x.c.term)}</div><div class="cr-def">${esc(x.c.def)}</div></div><span class="pill bad">${x.wrong}×</span></div>`).join('')}</div>` : ''}
      <div class="stack">
        ${hard.length ? '<button class="btn primary block" id="again">Practice the tricky ones</button>' : ''}
        <button class="btn block" id="restart">Learn again</button>
        <a class="btn ghost block" href="#/deck/${id}">Back to deck</a>
      </div></div>`);
    const hardCards = hard.map((x) => x.c);
    const ag = $('#again'); if (ag) ag.onclick = () => start(hardCards);
    $('#restart').onclick = () => start(all);
  }
  start(all);
}

/* ---------- views: write ---------- */
function writeView(id, q) {
  const d = getDeck(id); if (!d) return;
  setHeader('Write', `#/deck/${id}`);
  const all = studyCards(d, q); if (!all.length) return emptyStudy(d);
  let items; let i; let results;
  const start = (cards) => { items = shuffle(cards).map((c) => ({ c, ...sides(c) })); i = 0; results = []; show(); };
  function show() {
    if (i >= items.length) return summary();
    const it = items[i];
    const right = results.filter((r) => r.ok).length;
    render(`${progressTop(i, items.length, `${right} right · ${i - right} wrong`)}<div id="q"></div>`);
    writtenQuestion($('#q'), it, (ok) => { results.push({ c: it.c, ok }); practice(it.c, ok); i++; show(); });
  }
  function summary() {
    keyHandler = null;
    const right = results.filter((r) => r.ok).length;
    const wrong = results.filter((r) => !r.ok).map((r) => r.c);
    const pct = Math.round((right / results.length) * 100);
    render(`<div class="summary">
      <div class="ring" style="--p:${pct}"><b>${pct}%</b></div>
      <h2>${right} of ${results.length} correct</h2>
      ${wrong.length ? `<div class="card-list compact">${wrong.map((c) => `<div class="card-row"><div class="cr-text"><div class="cr-term" lang="es">${esc(c.term)}</div><div class="cr-def">${esc(c.def)}</div></div>${sayBtn(c.term)}</div>`).join('')}</div>` : '<p class="muted">Not a single mistake. ¡Increíble!</p>'}
      <div class="stack">
        ${wrong.length ? `<button class="btn primary block" id="again">Retry the ${wrong.length} I missed</button>` : ''}
        <button class="btn block" id="restart">Start over</button>
        <a class="btn ghost block" href="#/deck/${id}">Back to deck</a>
      </div></div>`);
    const ag = $('#again'); if (ag) ag.onclick = () => start(wrong);
    $('#restart').onclick = () => start(all);
  }
  start(all);
}

/* ---------- views: match ---------- */
function matchView(id, q) {
  const d = getDeck(id); if (!d) return;
  setHeader('Match', `#/deck/${id}`);
  const all = studyCards(d, q);
  if (all.length < 2) return emptyStudy(d, 'Match needs at least 2 cards.');
  let timerId = null;
  onCleanup(() => clearInterval(timerId));

  function intro() {
    render(`<div class="summary">
      <div class="big-ic">${I.match}</div><h2>Match</h2>
      <p class="muted">Tap a Spanish word, then its meaning.<br>Wrong pairs add a 1-second penalty.</p>
      ${d.bestMatch ? `<p>Your best: <b>${fmtTime(d.bestMatch)}</b></p>` : ''}
      <div class="stack"><button class="btn primary block" id="go">Start game</button></div></div>`);
    $('#go').onclick = play;
    keyHandler = (e) => { if (e.key === 'Enter') { e.preventDefault(); play(); } };
  }
  function play() {
    keyHandler = null; clearInterval(timerId);
    const pick = shuffle(all).slice(0, 6);
    const tiles = shuffle(pick.flatMap((c) => [{ id: c.id, text: c.term, es: true }, { id: c.id, text: c.def, es: false }]));
    render(`<div class="match-top"><span class="timer" id="timer">0.0s</span><span class="muted" id="left">${plural(pick.length, 'pair')} left</span></div>
      <div class="match-grid" id="grid">${tiles.map((t, k) => `<button type="button" class="tile ${t.es ? 'es' : ''}" data-k="${k}" ${langAttr(t.es)}>${esc(t.text)}</button>`).join('')}</div>`);
    const t0 = performance.now(); let penalty = 0; let sel = null; let left = pick.length;
    const elapsed = () => performance.now() - t0 + penalty;
    timerId = setInterval(() => { const el = $('#timer'); if (el) el.textContent = fmtTime(elapsed()); }, 100);
    $('#grid').onclick = (e) => {
      const b = e.target.closest('.tile'); if (!b || b.classList.contains('gone')) return;
      const t = tiles[+b.dataset.k];
      if (sel === b) { b.classList.remove('sel'); sel = null; return; }
      if (!sel || tiles[+sel.dataset.k].es === t.es) {
        if (sel) sel.classList.remove('sel');
        sel = b; b.classList.add('sel');
        if (t.es && state.settings.autoSpeak) speak(t.text);
        return;
      }
      const a = sel; sel = null;
      if (tiles[+a.dataset.k].id === t.id) {
        [a, b].forEach((x) => { x.classList.remove('sel'); x.classList.add('gone'); x.disabled = true; });
        left--; $('#left').textContent = left ? `${plural(left, 'pair')} left` : '';
        if (!left) finish(elapsed());
      } else {
        penalty += 1000;
        [a, b].forEach((x) => { x.classList.remove('sel'); x.classList.add('shake'); });
        later(() => [a, b].forEach((x) => x.classList.remove('shake')), 400);
      }
    };
  }
  function finish(ms) {
    clearInterval(timerId);
    const prev = d.bestMatch; const rec = !prev || ms < prev;
    if (rec) d.bestMatch = Math.round(ms);
    touchStats(false); save();
    later(() => {
      render(`<div class="summary">
        <div class="big-ic">${I.trophy}</div>
        <h2>${rec ? (prev ? '¡Nuevo récord!' : '¡Terminado!') : '¡Terminado!'}</h2>
        <p class="timer-big">${fmtTime(ms)}</p>
        ${!rec ? `<p class="muted">Your best: ${fmtTime(prev)}</p>` : prev ? `<p class="muted">Previous best: ${fmtTime(prev)}</p>` : ''}
        <div class="stack"><button class="btn primary block" id="go">Play again</button><a class="btn ghost block" href="#/deck/${id}">Back to deck</a></div></div>`);
      $('#go').onclick = play;
      keyHandler = (e) => { if (e.key === 'Enter') { e.preventDefault(); play(); } };
    }, 350);
  }
  intro();
}

/* ---------- views: review (spaced repetition) ---------- */
function reviewView(q) {
  const deckId = q.get('deck');
  const deck = deckId ? getDeck(deckId) : null; if (deckId && !deck) return;
  setHeader(deck ? `Review · ${deck.name}` : 'Review', deck ? `#/deck/${deckId}` : '#/');
  const queue = buildReviewQueue(deckId, +q.get('extra') || 0);
  let done = 0; let lapses = 0;

  if (!queue.length) {
    const decks = deckId ? [deck] : state.decks;
    const newLeft = decks.reduce((s, d) => s + d.cards.filter((c) => isValid(c) && !c.srs.last).length, 0);
    const extraHref = `#/review?${deckId ? `deck=${deckId}&` : ''}extra=10`;
    render(`<div class="empty-state">
      <div class="big-ic">${I.check}</div><h2>¡Todo listo!</h2>
      <p class="muted">Nothing is due right now. Come back tomorrow — spaced repetition works best a little every day.</p>
      ${newLeft ? `<a class="btn primary" href="${extraHref}">Learn ${Math.min(10, newLeft)} more new cards</a>` : ''}
      <a class="btn ghost" href="${deckId ? `#/deck/${deckId}` : '#/'}">Back</a></div>`);
    return;
  }

  const gradeButtons = (c, suggested = -1) => {
    const labels = [['Again', 'again'], ['Hard', 'hard'], ['Good', 'good'], ['Easy', 'easy']];
    return `<div class="srs-row">${labels.map(([l, k], n) => `<button type="button" class="srs ${k} ${n === suggested ? 'suggested' : ''}" data-q="${n}"><b>${l}</b><span>${fmtInterval(c.srs, n)}</span></button>`).join('')}</div>
      <p class="srs-help">How well did you remember it?${isTouch() ? '' : ' Keys 1–4.'}</p>`;
  };
  const rateCard = (c, qv) => {
    keyHandler = null;
    gradeCard(c, qv); save();
    const item = queue.shift();
    if (qv === 0) { lapses++; queue.splice(Math.min(queue.length, 4), 0, item); } else done++;
    show();
  };

  // Flip-card review: tap the card (or "Show answer") to see the back, then rate it.
  function showFlip(c, d, it, isNew) {
    const meta = [isNew ? '<span class="tag new">NEW</span>' : '', deckId ? '' : esc(d.name)].filter(Boolean).join(' ');
    render(`
      ${progressTop(done, done + queue.length, `${queue.length} left`)}
      ${meta ? `<p class="review-meta">${meta}</p>` : ''}
      <div class="flash-wrap"><div class="flashcard" id="fc" tabindex="0" role="button" aria-label="Card — tap to flip">
        <div class="face front">${faceHtml(c, it.prompt, it.promptEs, true)}</div>
        <div class="face back">${faceHtml(c, it.answer, !it.promptEs, false)}</div>
      </div></div>
      <div id="reveal"><button class="btn primary block" type="button" id="flipBtn">Show answer</button>
      <p class="srs-help">${isTouch() ? 'Or tap the card' : 'Space or tap the card to flip'}</p></div>`);
    if (state.settings.autoSpeak && it.promptEs) speak(it.prompt);
    const fc = $('#fc'); let revealed = false;
    const flip = () => {
      fc.classList.toggle('flipped');
      if (revealed) return;
      revealed = true;
      if (state.settings.autoSpeak && !it.promptEs) speak(it.answer);
      $('#reveal').innerHTML = gradeButtons(c);
      $('.srs-row').onclick = (e) => { const b = e.target.closest('.srs'); if (b) rateCard(c, +b.dataset.q); };
    };
    fc.addEventListener('click', (e) => { if (!e.target.closest('button')) flip(); });
    $('#flipBtn').onclick = flip;
    keyHandler = (e) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (revealed) rateCard(c, 2); else flip(); }
      else if (revealed && e.key >= '1' && e.key <= '4') { e.preventDefault(); rateCard(c, +e.key - 1); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); flip(); }
    };
  }

  function show() {
    if (!queue.length) return summary();
    const { c, d } = queue[0];
    const flipStyle = state.settings.reviewStyle !== 'type';
    const it = { c, ...sides(c, flipStyle ? state.settings.flipDirection : state.settings.direction) }; const ansEs = !it.promptEs; const isNew = !c.srs.last;
    if (flipStyle) return showFlip(c, d, it, isNew);
    render(`
      ${progressTop(done, done + queue.length, `${queue.length} left`)}
      <div class="q-card"><span class="face-label">${isNew ? '<span class="tag new">NEW</span> ' : ''}${deckId ? '' : esc(d.name)}</span><div class="q-text" ${langAttr(it.promptEs)}>${esc(it.prompt)}</div>${it.promptEs ? sayBtn(it.prompt) : ''}</div>
      <form class="answer-form" id="rf" autocomplete="off">
        <input class="answer-input" ${langAttr(ansEs)} placeholder="Type the ${ansEs ? 'Spanish' : 'English'} (optional)" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="done">
        <button class="btn primary" type="submit" id="showBtn">Show</button>
      </form>
      ${ansEs ? accentBar() : ''}
      <div id="reveal"></div>`);
    if (state.settings.autoSpeak && it.promptEs) speak(it.prompt);
    const inp = $('.answer-input');
    if (!isTouch()) inp.focus({ preventScroll: true });
    let revealed = false;

    const rate = (qv) => {
      keyHandler = null;
      gradeCard(c, qv); save();
      const item = queue.shift();
      if (qv === 0) { lapses++; queue.splice(Math.min(queue.length, 4), 0, item); } else done++;
      show();
    };
    const reveal = () => {
      if (revealed) return; revealed = true;
      const given = inp.value.trim();
      inp.readOnly = true; inp.blur(); $('#showBtn').disabled = true;
      const acc = $('.accents'); if (acc) acc.hidden = true;
      const res = given ? checkAnswer(given, it.answer) : null;
      const ok = res === 'correct' || res === 'typo' || (res === 'accent' && !state.settings.strictAccents);
      if (given) inp.classList.add(ok ? 'ok' : 'bad');
      const suggested = given ? (ok ? (res === 'correct' ? 2 : 1) : 0) : -1;
      let note = '';
      if (given && !ok) note = `<p class="muted">You wrote <s>${esc(given)}</s></p>`;
      else if (res === 'accent') note = '<p class="muted">Right word — watch the accents.</p>';
      else if (res === 'typo') note = '<p class="muted">Close — check the spelling.</p>';
      const labels = [['Again', 'again'], ['Hard', 'hard'], ['Good', 'good'], ['Easy', 'easy']];
      $('#reveal').innerHTML = `
        <div class="answer-card"><span class="face-label">Answer</span><div class="a-text" ${langAttr(ansEs)}>${esc(it.answer)}</div>${ansEs ? sayBtn(it.answer) : ''}${note}</div>
        <div class="srs-row">${labels.map(([l, k], n) => `<button type="button" class="srs ${k} ${n === suggested ? 'suggested' : ''}" data-q="${n}"><b>${l}</b><span>${fmtInterval(c.srs, n)}</span></button>`).join('')}</div>
        <p class="srs-help">How well did you remember it?${isTouch() ? '' : ' Keys 1–4.'}</p>`;
      if (state.settings.autoSpeak && ansEs) speak(it.answer);
      $('.srs-row').onclick = (e) => { const b = e.target.closest('.srs'); if (b) rate(+b.dataset.q); };
      keyHandler = (e) => {
        if (e.key >= '1' && e.key <= '4') { e.preventDefault(); rate(+e.key - 1); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rate(suggested >= 0 ? suggested : 2); }
      };
      $('#reveal').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    $('#rf').onsubmit = (e) => { e.preventDefault(); reveal(); };
    keyHandler = (e, typing) => { if (!typing && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); reveal(); } };
  }

  function summary() {
    keyHandler = null;
    const streak = currentStreak();
    render(`<div class="summary">
      <div class="big-ic">${I.flame}</div>
      <h2>¡Hecho por hoy!</h2>
      <p class="muted">You reviewed ${plural(done, 'card')}${lapses ? ` (${lapses} needed another look)` : ''}.</p>
      <p><b>${plural(streak, 'day')}</b> in a row</p>
      <div class="stack"><a class="btn primary block" href="${deckId ? `#/deck/${deckId}` : '#/'}">Done</a></div></div>`);
  }
  show();
}

/* ---------- sync UI ---------- */
const TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=gist&description=Espa%C3%B1ol%20app%20sync';
function syncStatusHtml() {
  const st = syncState.status;
  if (st === 'syncing') return `<div class="sync-status">${I.cloud} Syncing…</div>`;
  if (st === 'offline') return `<div class="sync-status warn">${I.cloud} Offline — will sync when you’re back online</div>`;
  if (st === 'error') {
    const msg = syncState.error === 'auth' ? 'GitHub rejected the token (it may have expired). Disconnect, then connect with a new token.'
      : syncState.error === 'missing' ? 'The synced copy on GitHub was deleted. Disconnect, then connect again to start fresh.'
        : 'Couldn’t reach GitHub. It will try again automatically.';
    return `<div class="sync-status bad">${I.alert} ${msg}</div>`;
  }
  return `<div class="sync-status good">${I.check} ${sync.lastSync ? `Synced ${ago(sync.lastSync)}` : 'Connected'}</div>`;
}
function syncPanelHtml() {
  const p = ui.syncPending;
  if (p) {
    const decks = p.remote.decks.length;
    const cards = p.remote.decks.reduce((n, d) => n + (d.cards?.length || 0), 0);
    return `<h3>Sync</h3>
      <p>Your GitHub account already has synced data: <b>${plural(decks, 'deck')}, ${plural(cards, 'card')}</b>.</p>
      <p class="muted">What should happen to the cards on this device?</p>
      <div class="stack">
        <button class="btn primary block" type="button" data-sync="combine">Combine both</button>
        <button class="btn block" type="button" data-sync="replace">Use the synced data, discard this device’s</button>
        <button class="btn ghost block" type="button" data-sync="cancel">Cancel</button>
      </div>`;
  }
  if (!syncOn()) {
    return `<h3>Sync between devices</h3>
      <p class="muted">Keep your cards and progress the same on your phone and computer. Everything is stored in a private gist on your GitHub account.</p>
      <ol class="install">
        <li><a href="${TOKEN_URL}" target="_blank" rel="noopener">Create a GitHub token</a>. “gist” is already ticked. Choose an expiration (or “No expiration”), click <b>Generate token</b>, and copy it.</li>
        <li>Paste it here, then do the same on your other device with the same token.</li>
      </ol>
      <form class="answer-form" id="syncForm" autocomplete="off">
        <input id="syncToken" type="password" placeholder="Paste token (ghp_…)" autocomplete="off" autocapitalize="off" spellcheck="false">
        <button class="btn primary" type="submit">Connect</button>
      </form>
      ${ui.syncError ? `<div class="sync-status bad">${I.alert} ${ui.syncError}</div>` : ''}
      <p class="muted small">Tip: save the token in your password manager so it’s easy to paste on your phone. It can only read and write gists, nothing else on your account.</p>`;
  }
  return `<h3>Sync</h3>
    ${syncStatusHtml()}
    <p class="muted small">Connected to GitHub as <b>${esc(sync.login || '')}</b>. Changes sync automatically when you open the app and a few seconds after you study.</p>
    <div class="stack">
      <button class="btn block" type="button" data-sync="now">${I.cloud} Sync now</button>
      <button class="btn block ghost" type="button" data-sync="copy">${I.copy} Copy token for another device</button>
      <button class="btn block ghost danger" type="button" data-sync="disconnect">Turn off sync</button>
    </div>`;
}
function syncLineHtml() {
  if (!syncOn()) return '';
  const st = syncState.status;
  if (st === 'syncing') return `${I.cloud} Syncing…`;
  if (st === 'error') return `${I.alert} Sync problem — <a href="#/settings">see Settings</a>`;
  if (st === 'offline') return `${I.cloud} Offline — will sync later`;
  return sync.lastSync ? `${I.check} Synced ${ago(sync.lastSync)}` : '';
}
function updateSyncUI() {
  const p = $('#syncPanel'); if (p) p.innerHTML = syncPanelHtml();
  const l = $('#syncLine'); if (l) l.innerHTML = syncLineHtml();
}
function wireSyncPanel(panel) {
  panel.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inp = $('#syncToken', panel); const btn = $('button[type=submit]', panel);
    const tok = inp.value.trim(); if (!tok) { inp.focus(); return; }
    btn.disabled = true; btn.textContent = 'Connecting…'; ui.syncError = '';
    try { await connectSync(tok); }
    catch (err) {
      ui.syncError = err.status === 401 ? 'GitHub didn’t accept that token. Check you copied all of it.'
        : err.status === 403 || err.status === 404 ? 'That token is missing the “gist” permission.'
          : 'Couldn’t reach GitHub. Check your connection and try again.';
    }
    updateSyncUI();
  });
  panel.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-sync]'); if (!b) return;
    const a = b.dataset.sync;
    if (a === 'combine' || a === 'replace') {
      if (a === 'replace' && !confirm('Replace all cards and progress on this device with the synced data?')) return;
      finishConnect(a);
    } else if (a === 'cancel') { ui.syncPending = null; updateSyncUI(); }
    else if (a === 'now') runSync();
    else if (a === 'copy') {
      try { await navigator.clipboard.writeText(sync.token); toast('Token copied — paste it in Settings on your other device'); } catch { toast('Copy failed'); }
    } else if (a === 'disconnect') {
      if (!confirm('Turn off sync on this device? Your cards stay here, and the synced copy stays on GitHub.')) return;
      sync = {}; saveSync(); syncState.status = ''; updateSyncUI(); toast('Sync turned off');
    }
  });
}

/* ---------- views: settings ---------- */
function settingsView() {
  setHeader('Settings', '#/');
  const s = state.settings;
  const voices = canSpeak ? speechSynthesis.getVoices().filter((v) => /^es/i.test(v.lang)) : [];
  const installed = isStandalone();
  render(`<div id="settings">
    <section class="panel"><h3>Practice</h3>
      <div class="field"><span>Daily review</span>${seg('reviewStyle', [['flip', 'Flip cards'], ['type', 'Type answers']], s.reviewStyle)}</div>
      <div class="field"><span>Flip cards: show first</span>${seg('flipDirection', [['en-es', 'English'], ['es-en', 'Spanish'], ['mixed', 'Mixed']], s.flipDirection)}</div>
      <div class="field"><span>Typing &amp; quizzes: show first</span>${seg('direction', [['es-en', 'Spanish'], ['en-es', 'English'], ['mixed', 'Mixed']], s.direction)}</div>
      <label class="switch-row"><span><b>Strict accents</b><small>Count “esta” as wrong when the answer is “está”</small></span><input type="checkbox" class="switch" name="strictAccents" ${s.strictAccents ? 'checked' : ''}></label>
      <label class="field"><span>New cards per day (Review)</span><input type="number" inputmode="numeric" name="newPerDay" min="0" max="500" value="${s.newPerDay}" class="sm-input"></label>
    </section>
    ${canSpeak ? `<section class="panel"><h3>Pronunciation</h3>
      <label class="switch-row"><span><b>Auto-play audio</b><small>Say Spanish words out loud when they appear</small></span><input type="checkbox" class="switch" name="autoSpeak" ${s.autoSpeak ? 'checked' : ''}></label>
      <div class="field"><span>Accent</span>${seg('voiceLang', [['es-ES', 'Spain'], ['es-MX', 'Mexico'], ['es-US', 'US']], s.voiceLang)}</div>
      <label class="field"><span>Voice</span><select name="voiceName"><option value="">Automatic</option>${voices.map((v) => `<option value="${esc(v.name)}" ${v.name === s.voiceName ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select></label>
      <label class="field"><span>Speed: <output id="rateOut">${(+s.rate).toFixed(2)}×</output></span><input type="range" name="rate" min="0.5" max="1.3" step="0.05" value="${s.rate}"></label>
      <button class="btn sm ghost" type="button" id="testVoice">${I.speaker} Test voice</button>
    </section>` : ''}
    <section class="panel"><h3>Appearance</h3>${seg('theme', [['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], s.theme)}</section>
    <section class="panel" id="syncPanel">${syncPanelHtml()}</section>
    <section class="panel"><h3>Backup</h3>
      <p class="muted">Save a copy of all your cards and progress as a file, or restore one.</p>
      <div class="stack">
        <button class="btn block" type="button" id="backup">${I.download} Save backup file</button>
        <label class="btn block ghost file-btn">${I.upload} Restore from backup<input type="file" id="restore" accept=".json,application/json" hidden></label>
        <button class="btn block ghost danger" type="button" id="resetProg">Reset learning progress</button>
      </div>
    </section>
    <section class="panel"><h3>Install the app</h3>
      ${installed ? '<p>You’re using the installed app. ¡Bien!</p>' : `<ul class="install">
        <li><b>iPhone / iPad:</b> open this page in Safari, tap <b>Share</b> → <b>Add to Home Screen</b>.</li>
        <li><b>Android:</b> in Chrome, tap <b>⋮</b> → <b>Install app</b>.</li>
        <li><b>Computer:</b> in Chrome or Edge, click the install icon at the right end of the address bar.</li></ul>
        ${deferredInstall ? '<button class="btn primary block" type="button" id="installBtn">Install Español</button>' : ''}`}
    </section>
    <p class="muted center small">Español · works offline</p>
  </div>`);
  const root = $('#settings');
  wireSyncPanel($('#syncPanel'));
  root.addEventListener('change', (e) => {
    const t = e.target; if (!t.name || t.closest('#syncPanel')) return;
    if (t.type === 'checkbox') s[t.name] = t.checked;
    else if (t.name === 'newPerDay') { s.newPerDay = Math.max(0, Math.min(500, parseInt(t.value, 10) || 0)); t.value = s.newPerDay; }
    else if (t.name === 'rate') s.rate = +t.value;
    else s[t.name] = t.value;
    if (SYNCED_SETTINGS.includes(t.name)) s.updated = Date.now();
    if (t.name === 'theme') applyTheme();
    if (t.name === 'voiceLang') { s.voiceName = ''; save(); settingsView(); return; }
    save();
  });
  const rateEl = $('[name=rate]', root);
  if (rateEl) rateEl.oninput = (e) => { $('#rateOut').textContent = `${(+e.target.value).toFixed(2)}×`; };
  const tv = $('#testVoice'); if (tv) tv.onclick = () => speak('Hola, ¿cómo estás? Mucho gusto.');
  if (canSpeak && !voices.length) {
    speechSynthesis.onvoiceschanged = () => { speechSynthesis.onvoiceschanged = null; if (location.hash.startsWith('#/settings')) settingsView(); };
    onCleanup(() => { speechSynthesis.onvoiceschanged = null; });
  }

  $('#backup').onclick = async () => {
    const name = `espanol-backup-${dayKey()}.json`;
    const file = new File([JSON.stringify(state)], name, { type: 'application/json' });
    if (isTouch() && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Español backup' }); return; }
      catch (err) { if (err.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('Backup saved');
  };
  $('#restore').onchange = async (e) => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!data || !Array.isArray(data.decks)) throw new Error('bad file');
      const n = data.decks.reduce((sum, d) => sum + (d.cards?.length || 0), 0);
      if (!confirm(`Replace everything on this device with this backup (${plural(data.decks.length, 'deck')}, ${plural(n, 'card')})?`)) return;
      state = normalizeState(data); save(); applyTheme();
      toast('Backup restored'); location.hash = '#/';
    } catch { toast('That file isn’t an Español backup'); }
  };
  $('#resetProg').onclick = () => {
    if (!confirm('Reset learning progress for every card? Your cards and decks stay.')) return;
    state.progressResetAt = Date.now();
    state.decks.forEach((d) => { d.bestMatch = 0; d.cards.forEach((c) => { c.srs = freshSrs(); }); });
    state.stats = defaultStats(); save(); toast('Progress reset');
  };
  const ib = $('#installBtn');
  if (ib) ib.onclick = async () => { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; settingsView(); };
}

/* ---------- boot ---------- */
applyTheme();
route();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { save({ silent: true }); if (syncState.dirty) runSync(); }
  else if (syncOn() && Date.now() - (sync.lastSync || 0) > 30000) runSync();
});
window.addEventListener('online', () => { if (syncOn()) runSync(); });
if (syncOn()) runSync();
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
