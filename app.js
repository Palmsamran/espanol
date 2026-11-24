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
// Card text can carry a few formatting tags: <b>, <i>, <u>, and <mark> (yellow) or <mark class="green|blue|pink">.
// Everything else is shown as plain text.
const HL = { h: '', hg: 'green', hb: 'blue', hp: 'pink' }; // highlight buttons -> mark color ('' = yellow)
const FMT_RE = /<\/?(?:b|i|u|mark)(?: class="(?:green|blue|pink)")?>/gi;
const plain = (s) => String(s ?? '').replace(FMT_RE, '');
const rich = (s) => esc(s)
  .replace(/&lt;mark class=&quot;(green|blue|pink)&quot;&gt;/gi, (_, c) => `<mark class="${c.toLowerCase()}">`)
  .replace(/&lt;(\/?)(b|i|u|mark)&gt;/gi, (_, sl, t) => `<${sl}${t.toLowerCase()}>`);
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
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  book: svg('<path d="M4 4.5A1.5 1.5 0 015.5 3H20v15H5.5A1.5 1.5 0 004 19.5z"/><path d="M4 19.5A1.5 1.5 0 005.5 21H20v-3"/><path d="M8 7h8M8 11h6"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
  image: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>'),
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
const SYNCED_SETTINGS = ['direction', 'flipDirection', 'photoSide', 'reviewStyle', 'strictAccents', 'autoSpeak', 'voiceLang', 'rate', 'newPerDay', 'theme', 'spellCheck', 'spellIgnore', 'autoTranslate'];
const defaultSettings = () => ({
  direction: 'es-en', flipDirection: 'en-es', photoSide: 'en', reviewStyle: 'flip', strictAccents: false, autoSpeak: false, voiceLang: 'es-ES', voiceName: '',
  rate: 0.9, newPerDay: 20, theme: 'system', spellCheck: true, spellIgnore: [], autoTranslate: true, hideInstallHint: false, updated: 0,
});
const defaultStats = () => ({ history: {} });
const freshSrs = () => ({ due: 0, interval: 0, ease: 2.5, reps: 0, lapses: 0, last: 0 });

// `updated` = when the text/star last changed (used to merge edits from other devices)
// "My words": m.fc / m.fx = last time known / missed on a flashcard, m.wr / m.wx = last time typed exactly
// right / wrong, m.own / m.off = when it became yours / when you sent it back to practice. Only timestamps,
// so two devices merge by keeping the latest of each.
const M_KEYS = ['fc', 'fx', 'wr', 'wx', 'own', 'off'];
const normM = (m) => Object.fromEntries(M_KEYS.map((k) => [k, (m && +m[k]) || 0]));
function normalizeCard(c = {}) {
  return {
    id: c.id || uid(), term: String(c.term ?? ''), def: String(c.def ?? ''), img: String(c.img || ''), starred: !!c.starred,
    updated: c.updated || 0, srs: Object.assign(freshSrs(), c.srs || {}), m: normM(c.m),
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
    deleted: { decks: {}, cards: {} }, progressResetAt: 0, imgGist: '',
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
    imgGist: String(s.imgGist || ''), // private gist that holds the photos
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
// Every sync gist on the account, oldest first. Normally there is one; if two devices each created one
// (e.g. connected at nearly the same time), the oldest is the one everybody uses.
async function listSyncGists(token = sync.token) {
  const all = [];
  for (let page = 1; page <= 10; page++) {
    const list = await gh(`/gists?per_page=100&page=${page}`, { token });
    all.push(...list.filter((x) => x.files && x.files[GIST_FILE]));
    if (list.length < 100) break;
  }
  return all.sort((a, b) => (Date.parse(a.created_at) - Date.parse(b.created_at)) || (a.id < b.id ? -1 : 1));
}
async function findGist(token) { return (await listSyncGists(token))[0] || null; }
// Merge any extra sync gists into this device, switch to the oldest one, and return the extras so they can be
// retired after the merged data is written. Retired gists are renamed, not deleted, so they stay as a backup.
async function settleGists() {
  const all = await listSyncGists();
  if (!all.length) return [];
  const main = all[0]; const extras = all.slice(1).map((g) => g.id);
  if (sync.gistId !== main.id) { if (!extras.includes(sync.gistId)) extras.push(sync.gistId); sync.gistId = main.id; saveSync(); }
  let changed = false;
  for (const id of extras) {
    try { const t = await readRemote(id); if (t) changed = mergeRemote(JSON.parse(t)) || changed; } catch (e) { if (e.status !== 404) throw e; }
  }
  if (changed) save({ silent: true });
  return extras;
}
async function retireGists(ids) {
  for (const id of ids) {
    try {
      await gh(`/gists/${id}`, { method: 'PATCH', body: JSON.stringify({ description: 'Español app — old sync copy (already merged, safe to delete)', files: { [GIST_FILE]: { filename: 'espanol-sync-merged.json' } } }) });
    } catch { /* already gone or renamed by the other device */ }
  }
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
    stats: { history: state.stats.history }, deleted: state.deleted, progressResetAt: state.progressResetAt, imgGist: state.imgGist,
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
        if (rc.updated > lc.updated) { lc.term = rc.term; lc.def = rc.def; lc.img = rc.img; lc.starred = rc.starred; lc.updated = rc.updated; changed = true; }
        if (rc.srs.last > lc.srs.last && rc.srs.last > resetAt) { lc.srs = { ...rc.srs }; changed = true; }
        for (const k of M_KEYS) if (rc.m[k] > lc.m[k]) { lc.m[k] = rc.m[k]; changed = true; }
        prev = ld.cards.indexOf(lc);
      }
    }
  }
  // both devices made a photo gist at once: settle on one (photos get re-uploaded to it)
  if (R.imgGist && R.imgGist !== L.imgGist && (!L.imgGist || R.imgGist < L.imgGist)) { L.imgGist = R.imgGist; changed = true; }
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
    let retire = []; let merged = false;
    if (!(Date.now() - (sync.dupCheck || 0) < 10 * 60e3)) {
      const before = JSON.stringify(state.decks);
      retire = await settleGists(); merged = retire.length > 0 && JSON.stringify(state.decks) !== before;
    }
    const text = await readRemote(sync.gistId);
    let changed = merged;
    if (text) { try { changed = mergeRemote(JSON.parse(text)) || changed; } catch { /* unreadable remote: overwrite it */ } }
    if (changed) save({ silent: true });
    try { await uploadPhotos(); } catch (e) { if (e.status === 401) throw e; /* photos retry next sync */ }
    const out = syncPayload();
    if (out !== text) await gh(`/gists/${sync.gistId}`, { method: 'PATCH', body: JSON.stringify({ files: { [GIST_FILE]: { content: out } } }) });
    if (retire.length) await retireGists(retire);
    sync.lastSync = Date.now(); sync.dupCheck = Date.now(); saveSync();
    try { await downloadPhotos(); } catch { /* retry next sync */ }
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

/* ---------- photos ----------
   Pictures are shrunk to ≤640px JPEGs and kept in IndexedDB (localStorage is too small).
   A card stores only the photo's id (card.img). For sync, each photo is one file
   (img-<id>.txt, a data URL) in a second private gist, so the main sync file stays small
   and a device only downloads the photos it doesn't have yet. */
let imgDbP;
const imgDb = () => (imgDbP ||= new Promise((res, rej) => {
  const r = indexedDB.open('espanol-img', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('imgs', { keyPath: 'id' });
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
}));
async function imgTx(mode, fn) {
  const db = await imgDb();
  return new Promise((res, rej) => {
    const tx = db.transaction('imgs', mode); const req = fn(tx.objectStore('imgs')); let out;
    if (req) req.onsuccess = () => { out = req.result; };
    tx.oncomplete = () => res(out); tx.onerror = () => rej(tx.error);
  });
}
const imgCache = new Map(); // id -> data URL
const imgKeys = () => imgTx('readonly', (st) => st.getAllKeys()).catch(() => []);
const imgPut = (id, data) => { imgCache.set(id, data); return imgTx('readwrite', (st) => st.put({ id, data })); };
const imgDel = (id) => { imgCache.delete(id); return imgTx('readwrite', (st) => st.delete(id)).catch(() => {}); };
async function imgData(id) {
  if (imgCache.has(id)) return imgCache.get(id);
  const r = await imgTx('readonly', (st) => st.get(id)).catch(() => null);
  if (r) imgCache.set(id, r.data);
  return r ? r.data : null;
}
const photoIds = () => { const ids = new Set(); state.decks.forEach((d) => d.cards.forEach((c) => { if (c.img) ids.add(c.img); })); return ids; };
// which side(s) of a card the photo appears on
const showImg = (c, isEs) => !!(c && c.img) && (state.settings.photoSide === 'both' || (state.settings.photoSide === 'es') === isEs);
const photoTag = (c, cls = '') => `<img class="photo ${cls}" data-img="${esc(c.img)}" alt="" draggable="false">`;
// fill in <img data-img> elements as they appear
function hydrateImgs(root = document) {
  $$('img[data-img]:not([data-h])', root).forEach(async (im) => {
    im.dataset.h = '1';
    const d = await imgData(im.dataset.img);
    if (d) im.src = d; else im.classList.add('missing');
  });
}
new MutationObserver(() => hydrateImgs()).observe(document.body, { childList: true, subtree: true });

async function shrinkPhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, 640 / Math.max(img.naturalWidth, img.naturalHeight));
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(img.naturalWidth * k)); cv.height = Math.max(1, Math.round(img.naturalHeight * k));
    const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/jpeg', 0.75);
  } finally { URL.revokeObjectURL(url); }
}
async function attachPhoto(card, file) {
  if (!file || !/^image\//.test(file.type)) { toast('That file isn’t a picture'); return false; }
  let data;
  try { data = await shrinkPhoto(file); } catch { toast('Couldn’t read that picture'); return false; }
  const id = uid();
  try { await imgPut(id, data); } catch { toast('Couldn’t save the photo — storage is full or blocked'); return false; }
  const old = card.img;
  card.img = id; card.updated = Date.now(); save();
  if (old) imgDel(old);
  navigator.storage?.persist?.().catch(() => {});
  return true;
}
// Picture search (Openverse: free, openly licensed images; no account or key needed).
// The default search is the card's English word without "to"/"the" and extra meanings.
function searchWord(c) {
  const w = plain(c.def).replace(/\([^)]*\)/g, ' ').split(/[/;,]/)[0].replace(/^\s*(to|the|a|an)\s+/i, '').trim();
  return w || plain(c.term).trim();
}
function photoSearch(card, onPick) {
  const dlg = document.createElement('dialog'); dlg.className = 'pic-search';
  dlg.innerHTML = `
    <div class="ps-top">
      <form class="ps-form"><input type="search" class="ps-q" value="${esc(searchWord(card))}" placeholder="Search pictures" aria-label="Search pictures" enterkeyhint="search" autocomplete="off"><button class="btn primary" type="submit">${I.search}<span class="sr">Search</span></button></form>
      <button type="button" class="icon-btn ps-close" aria-label="Close">${I.x}</button>
    </div>
    <div class="ps-body"><div class="ps-grid"></div><p class="ps-msg muted"></p><button type="button" class="btn block ghost ps-more" hidden>More pictures</button></div>
    <p class="ps-credit">Openly licensed pictures from <a href="https://openverse.org" target="_blank" rel="noopener">Openverse</a></p>`;
  document.body.appendChild(dlg);
  const grid = $('.ps-grid', dlg); const msg = $('.ps-msg', dlg); const more = $('.ps-more', dlg); const q = $('.ps-q', dlg);
  let results = []; let page = 1; let query = ''; let gen = 0; let busy = false;
  const close = () => dlg.close();
  dlg.addEventListener('close', () => dlg.remove());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  $('.ps-close', dlg).onclick = close;
  async function run(p) {
    const my = ++gen; page = p;
    if (p === 1) { results = []; grid.innerHTML = ''; }
    more.hidden = true; msg.textContent = 'Searching…';
    try {
      const res = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=20&page=${p}`);
      if (my !== gen) return;
      if (res.status === 429) { msg.textContent = 'Too many searches for now — try again in a minute.'; return; }
      if (!res.ok) throw new Error(res.status);
      const data = await res.json(); if (my !== gen) return;
      const list = (data.results || []).filter((r) => r.thumbnail);
      const start = results.length; results.push(...list);
      grid.insertAdjacentHTML('beforeend', list.map((r, k) => `<button type="button" class="ps-item" data-k="${start + k}" title="${esc(r.title || '')}${r.creator ? ` — ${esc(r.creator)}` : ''}"><img src="${esc(r.thumbnail)}" alt="${esc(r.title || 'Picture')}" loading="lazy"></button>`).join(''));
      $$('img', grid).forEach((im) => { im.onerror = () => im.closest('.ps-item')?.remove(); });
      msg.textContent = results.length ? '' : `No pictures found for “${query}”. Try another word.`;
      more.hidden = !(data.page_count > p) || !list.length;
    } catch {
      if (my === gen) msg.textContent = navigator.onLine ? 'Search isn’t working right now. You can still add your own photo.' : 'You’re offline. Connect to the internet to search pictures.';
    }
  }
  $('.ps-form', dlg).onsubmit = (e) => { e.preventDefault(); query = q.value.trim(); if (query) { q.blur(); run(1); } };
  more.onclick = () => run(page + 1);
  grid.onclick = async (e) => {
    const b = e.target.closest('.ps-item'); if (!b || busy) return;
    const r = results[+b.dataset.k]; busy = true; b.classList.add('loading');
    try {
      let blob = null;
      for (const u of [r.thumbnail, r.url]) {
        try { const res = await fetch(u); if (res.ok) { const bl = await res.blob(); if (/^image\//.test(bl.type)) { blob = bl; break; } } } catch { /* try the next one */ }
      }
      if (!blob) { toast('Couldn’t get that picture — try another'); return; }
      if (await attachPhoto(card, new File([blob], 'picture', { type: blob.type }))) { close(); onPick(); toast('Photo added'); }
    } finally { busy = false; b.classList.remove('loading'); }
  };
  dlg.showModal();
  query = q.value.trim();
  if (query) run(1); else q.focus();
}
function removePhoto(card) {
  if (!card.img) return;
  const old = card.img; card.img = ''; card.updated = Date.now(); save(); imgDel(old);
}

const IMG_FILE = (id) => `img-${id}.txt`;
function photoSyncState() {
  if (sync.imgFor !== state.imgGist) { sync.imgFor = state.imgGist; sync.imgRemote = []; }
  return new Set(sync.imgRemote || []); // photos known to be in the gist
}
// Upload photos the gist doesn't have yet (runs before the main data is written,
// so other devices never see a card whose photo isn't uploaded).
async function uploadPhotos() {
  const remote = photoSyncState();
  const local = new Set(await imgKeys());
  const todo = [...photoIds()].filter((id) => local.has(id) && !remote.has(id));
  if (!todo.length) return;
  if (!state.imgGist) {
    const g = await gh('/gists', {
      method: 'POST',
      body: JSON.stringify({ description: 'Español app — synced photos', public: false, files: { 'README.md': { content: 'Photos for the Español app. Each img-*.txt file holds one picture.' } } }),
    });
    state.imgGist = g.id; save({ silent: true }); photoSyncState();
  }
  for (let i = 0; i < todo.length; i += 8) {
    const files = {};
    for (const id of todo.slice(i, i + 8)) { const d = await imgData(id); if (d) files[IMG_FILE(id)] = { content: d }; }
    try { await gh(`/gists/${state.imgGist}`, { method: 'PATCH', body: JSON.stringify({ files }) }); }
    catch (e) { if (e.status === 404) { state.imgGist = ''; save({ silent: true }); } throw e; }
    Object.keys(files).forEach((f) => remote.add(f.slice(4, -4)));
    sync.imgRemote = [...remote]; saveSync();
  }
}
// Download missing photos, then clean up photos no card uses any more.
async function downloadPhotos() {
  if (!state.imgGist || !sync.login) return;
  const remote = photoSyncState();
  const local = new Set(await imgKeys());
  const missing = [...photoIds()].filter((id) => !local.has(id));
  for (let i = 0; i < missing.length; i += 6) {
    await Promise.all(missing.slice(i, i + 6).map(async (id) => {
      try {
        const res = await fetch(`https://gist.githubusercontent.com/${encodeURIComponent(sync.login)}/${state.imgGist}/raw/${IMG_FILE(id)}?t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.text();
        if (!data.startsWith('data:image/')) return;
        await imgPut(id, data); remote.add(id); local.add(id);
        $$(`img[data-img="${id}"]`).forEach((im) => { im.src = data; im.classList.remove('missing'); });
      } catch { /* try again next sync */ }
    }));
  }
  const used = photoIds();
  const stale = [...remote].filter((id) => !used.has(id));
  if (stale.length) {
    const files = {}; stale.slice(0, 50).forEach((id) => { files[IMG_FILE(id)] = null; });
    try { await gh(`/gists/${state.imgGist}`, { method: 'PATCH', body: JSON.stringify({ files }) }); } catch { /* already gone */ }
    Object.keys(files).forEach((f) => remote.delete(f.slice(4, -4)));
  }
  for (const id of local) if (!used.has(id)) await imgDel(id);
  sync.imgRemote = [...remote]; saveSync();
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
const isMine = (c) => c.m.own > c.m.off;
const passedFc = (c) => c.m.fc > c.m.fx;
const passedWr = (c) => c.m.wr > c.m.wx;
const mineCount = () => state.decks.reduce((n, d) => n + d.cards.filter((c) => isValid(c) && isMine(c)).length, 0);
// Record a flashcard ('fc') or typing ('wr') result. Knowing it on a flashcard AND typing it exactly right
// (in any order) makes the word yours; missing it again undoes that step.
function markPass(c, kind, ok) {
  if (!c || isMine(c) || !isValid(c)) return;
  const now = Date.now();
  c.m[ok ? kind : (kind === 'fc' ? 'fx' : 'wx')] = now;
  if (ok && passedFc(c) && passedWr(c)) {
    c.m.own = now + 1;
    toast(`🎉 “${plain(c.term)}” is now yours! You own ${plural(mineCount(), 'word')}.`);
  }
  saveSoon();
}
function wonHtml(t0) {
  const w = [];
  state.decks.forEach((d) => d.cards.forEach((c) => { if (isMine(c) && c.m.own >= t0) w.push(c); }));
  if (!w.length) return '';
  return `<div class="won"><b>🎉 ${plural(w.length, 'new word')} ${w.length === 1 ? 'is' : 'are'} now yours</b><div class="won-list" lang="es">${w.slice(0, 15).map((c) => rich(c.term)).join(' · ')}${w.length > 15 ? ' …' : ''}</div><a href="#/words">See all my words (${mineCount()})</a></div>`;
}
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
    if (!isValid(c) || isMine(c)) continue;
    if (isDue(c, now)) due.push({ c, d }); else if (!c.srs.last) fresh.push({ c, d });
  }
  const newLeft = Math.max(0, state.settings.newPerDay - newIntroducedToday()) + extraNew;
  return shuffle(due).concat(fresh.slice(0, newLeft));
}

/* ---------- answer checking ---------- */
const deaccent = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const ARTICLE_RE = /^(el|la|los|las|un|una|unos|unas|to|the|a|an)\s+/;
const normAns = (s) => plain(s).toLowerCase().normalize('NFC')
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
  const set = new Set(); ans = plain(ans);
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
  const t = plain(text).replace(/\([^)]*\)/g, ' ').trim();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t);
  u.lang = state.settings.voiceLang;
  const v = spanishVoice(); if (v) { u.voice = v; u.lang = v.lang; }
  u.rate = state.settings.rate;
  speechSynthesis.speak(u);
}
const sayBtn = (text, cls = '') => (canSpeak ? `<button type="button" class="icon-btn say ${cls}" data-say="${esc(plain(text))}" aria-label="Play pronunciation">${I.speaker}</button>` : '');
const starBtn = (c) => `<button type="button" class="icon-btn star ${c.starred ? 'on' : ''}" data-star="${c.id}" aria-pressed="${c.starred}" aria-label="Star card">${I.star}</button>`;
const fmtBar = () => `<div class="fmt-bar" aria-label="Format text">${[['b', '<b>B</b>', 'Bold (⌘B)'], ['i', '<i>I</i>', 'Italic (⌘I)'], ['u', '<u>U</u>', 'Underline (⌘U)'], ['h', '<span class="sw"></span>', 'Yellow highlight (⌘⇧H)'], ['hg', '<span class="sw green"></span>', 'Green highlight'], ['hb', '<span class="sw blue"></span>', 'Blue highlight'], ['hp', '<span class="sw pink"></span>', 'Pink highlight']]
  .map(([k, label, title]) => `<button type="button" class="accent fmt ${k in HL ? 'hl' : ''}" data-fmt="${k}" tabindex="-1" aria-label="${title.replace(/ \(.*/, '')}" title="${title}">${label}</button>`).join('')}</div>`;
// Format the selection (or the word under the cursor) in a card field; pressing again removes it.
function toggleFmt(el, kind) {
  el.focus();
  const sel = getSelection();
  if (!sel.rangeCount || !el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
    const r = document.createRange(); r.selectNodeContents(el); sel.removeAllRanges(); sel.addRange(r);
  }
  if (sel.isCollapsed && sel.modify) { sel.modify('move', 'backward', 'word'); sel.modify('extend', 'forward', 'word'); }
  if (!(kind in HL)) {
    document.execCommand('styleWithCSS', false, false);
    document.execCommand({ b: 'bold', i: 'italic', u: 'underline' }[kind]);
  } else {
    const r = sel.getRangeAt(0); const n = r.commonAncestorContainer;
    const m = (n.nodeType === 1 ? n : n.parentElement).closest('mark');
    const color = HL[kind];
    if (m && el.contains(m)) { // same color again removes it; another color recolors it
      if ((m.getAttribute('class') || '') === color) m.replaceWith(...m.childNodes);
      else if (color) m.className = color; else m.removeAttribute('class');
    } else if (!r.collapsed) {
      const mark = document.createElement('mark'); if (color) mark.className = color;
      mark.appendChild(r.extractContents());
      mark.querySelectorAll('mark').forEach((x) => x.replaceWith(...x.childNodes));
      r.insertNode(mark); sel.selectAllChildren(mark);
    }
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
// Turn an edited field back into stored text, keeping only <b>, <i>, <u> and <mark>.
function serializeRich(root) {
  let out = '';
  const walk = (node, active) => {
    for (const ch of node.childNodes) {
      if (ch.nodeType === 3) { out += ch.nodeValue.replace(/\u00a0/g, ' '); continue; }
      if (ch.nodeType !== 1) continue;
      const tag = ch.tagName.toLowerCase(); const st = ch.style;
      if (tag === 'br') { out += ' '; continue; }
      if ((tag === 'div' || tag === 'p') && out && !out.endsWith(' ')) out += ' ';
      const want = [];
      if (tag === 'b' || tag === 'strong' || /^(bold|[6-9]00)$/.test(st.fontWeight)) want.push('b');
      if (tag === 'i' || tag === 'em' || st.fontStyle === 'italic') want.push('i');
      if (tag === 'u' || /underline/.test(st.textDecorationLine || st.textDecoration || '')) want.push('u');
      if (tag === 'mark') { const c = ch.getAttribute('class'); want.push(['green', 'blue', 'pink'].includes(c) ? `mark class="${c}"` : 'mark'); }
      const add = want.filter((t) => !active.includes(t));
      add.forEach((t) => { out += `<${t}>`; });
      walk(ch, active.concat(add));
      add.reverse().forEach((t) => { out += `</${t.split(' ')[0]}>`; });
    }
  };
  walk(root, []);
  for (let prev; prev !== out;) { prev = out; out = out.replace(/<(b|i|u|mark)(?: class="\w+")?>(\s*)<\/\1>/g, '$2').replace(/<\/(b|i|u)><\1>/g, '').replace(/<\/mark><mark>/g, ''); }
  return out.replace(/\s+/g, ' ').trim();
}
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
// Tapping the accent/format buttons shouldn't take focus (or the selection) away from the field.
document.addEventListener('mousedown', (e) => { if (e.target.closest('.accent')) e.preventDefault(); });
document.addEventListener('focusin', (e) => { if (e.target.matches('input:not([type]), input[type=text], textarea, .rt')) lastInput = e.target; });
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
  const fb = e.target.closest('[data-fmt]');
  if (fb) {
    e.preventDefault();
    const target = [document.activeElement, lastInput].find((el) => el && document.body.contains(el) && el.matches('.rt'));
    if (target) toggleFmt(target, fb.dataset.fmt);
    else toast('Tap into a card first');
    return;
  }
  const ins = e.target.closest('[data-ins]');
  if (ins) {
    e.preventDefault();
    if (document.activeElement?.isContentEditable) { document.execCommand('insertText', false, ins.dataset.ins); return; }
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
  [/^#\/dupes$/, () => dupesView()],
  [/^#\/words$/, () => wordsView()],
  [/^#\/story$/, (q) => storyView(q)],
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

/* ---------- duplicates ---------- */
// Finds decks with the same name and cards that are the same (e.g. a Quizlet set imported on two devices and
// then combined by sync), including a corrected copy next to the original ("naturaleza" vs "naturalesa").
const dupKeyMemo = new Map();
function dupKey(s) {
  s = String(s ?? ''); let k = dupKeyMemo.get(s);
  if (k === undefined) { k = plain(s).toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); if (dupKeyMemo.size > 5000) dupKeyMemo.clear(); dupKeyMemo.set(s, k); }
  return k;
}
function nearText(a, b) {
  const x = dupKey(a); const y = dupKey(b);
  if (!x || !y) return false;
  if (x === y) return true;
  return lev(x, y) <= Math.max(2, Math.floor(Math.max(x.length, y.length) * 0.4));
}
// Same card: one side identical and the other side identical or only slightly different (a typo fix).
const sameCard = (a, b) => (dupKey(a.term) && dupKey(a.term) === dupKey(b.term) && nearText(a.def, b.def))
  || (dupKey(a.def) && dupKey(a.def) === dupKey(b.def) && nearText(a.term, b.term));
// Fold card o into card k: the most recent text wins; keep stars, photos and the latest study progress.
function absorbCard(k, o, keepText = false) {
  if (!keepText && o.updated > k.updated) { k.term = o.term; k.def = o.def; if (o.img) k.img = o.img; }
  if (!k.img && o.img) k.img = o.img;
  k.starred = k.starred || o.starred;
  if (o.srs.last > k.srs.last) k.srs = { ...o.srs };
  M_KEYS.forEach((x) => { if (o.m[x] > k.m[x]) k.m[x] = o.m[x]; });
  k.updated = Date.now();
}
// Works on the decks it is given (pass a copy for a dry run). Returns the new deck list, what was merged,
// and the ids to record as deleted so other devices drop them too.
function dedupe(decks) {
  const tomb = { decks: [], cards: [] }; const deckMerges = []; const cardMerges = [];
  const groups = new Map();
  for (const d of decks) { const k = dupKey(d.name) || d.id; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(d); }
  let drop = new Set();
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    g.sort((a, b) => (a.created || 0) - (b.created || 0));
    const keep = g[0];
    for (const o of g.slice(1)) {
      const used = new Set(); const sameLen = o.cards.length === keep.cards.length;
      o.cards.forEach((oc, i) => {
        const pos = sameLen ? keep.cards[i] : null; // same import → same order, even if one copy was corrected
        let k = pos && !used.has(pos) && (nearText(pos.term, oc.term) || nearText(pos.def, oc.def)) ? pos : null;
        if (!k) k = keep.cards.find((kc) => !used.has(kc) && sameCard(kc, oc));
        if (k) { used.add(k); absorbCard(k, oc); } else if (dupKey(oc.term) || dupKey(oc.def) || oc.img) {
          keep.cards.push(normalizeCard({ ...oc, id: uid(), srs: { ...oc.srs }, updated: Date.now() }));
        }
      });
      tomb.decks.push(o.id); drop.add(o);
    }
    deckMerges.push({ id: keep.id, name: keep.name, copies: g.length });
  }
  decks = decks.filter((d) => !drop.has(d));
  for (const d of decks) {
    const out = [];
    for (const c of d.cards) {
      const k = (dupKey(c.term) || dupKey(c.def)) ? out.find((x) => sameCard(x, c)) : null;
      if (!k) { out.push(c); continue; }
      const newer = c.updated > k.updated ? c : k; const older = newer === c ? k : c;
      cardMerges.push({ deck: d.name, keep: { term: newer.term, def: newer.def }, drop: { term: older.term, def: older.def } });
      absorbCard(k, c); tomb.cards.push(c.id);
    }
    d.cards = out;
  }
  // The same card in two different decks: keep the copy in the older deck (its progress, stars and photo are kept).
  const seen = new Map();
  const index = (k, v) => { if (!k) return; if (!seen.has(k)) seen.set(k, []); seen.get(k).push(v); };
  for (const d of [...decks].sort((a, b) => (a.created || 0) - (b.created || 0))) {
    const out = [];
    for (const c of d.cards) {
      const tk = dupKey(c.term); const dk = dupKey(c.def);
      const cands = [...(seen.get(`t${tk}`) || []), ...(seen.get(`d${dk}`) || [])];
      const hit = tk && dk ? cands.find((x) => x.d !== d && sameCard(x.c, c)) : null;
      if (!hit) { out.push(c); index(tk && `t${tk}`, { c, d }); index(dk && `d${dk}`, { c, d }); continue; }
      cardMerges.push({ deck: hit.d.name, from: d.name, keep: { term: hit.c.term, def: hit.c.def }, drop: { term: c.term, def: c.def } });
      absorbCard(hit.c, c, true); tomb.cards.push(c.id);
    }
    d.cards = out;
  }
  deckMerges.forEach((m) => { m.cards = decks.find((d) => d.id === m.id)?.cards.length || 0; });
  const count = deckMerges.reduce((n, m) => n + m.copies - 1, 0) + cardMerges.length;
  return { decks, tomb, deckMerges, cardMerges, count };
}
const findDupes = () => dedupe(JSON.parse(JSON.stringify(state.decks)));
function removeDupes() {
  const r = dedupe(state.decks);
  state.decks = r.decks;
  r.tomb.decks.forEach((id) => tombstone('decks', id));
  r.tomb.cards.forEach((id) => tombstone('cards', id));
  save();
  return r.count;
}
const DUPE_HIDE_KEY = 'espanol.dupesHidden';
const dupeSig = (r) => JSON.stringify([r.deckMerges.map((m) => [m.name, m.copies]), r.cardMerges.map((m) => [m.keep.term, m.drop.term])]);

function dupesView() {
  setHeader('Duplicates', '#/');
  const r = findDupes();
  if (!r.count) {
    render(`<div class="panel center"><p>${I.check} No duplicate decks or cards found.</p><a class="btn" href="#/">Back to decks</a></div>`);
    return;
  }
  const card = (c) => `<span lang="es">${rich(c.term) || '—'}</span> – ${rich(c.def) || '—'}`;
  render(`
    <p class="muted">These look like the same decks or cards saved twice, usually from importing on two devices and then combining them with sync. For each pair, the most recently edited version is kept (so your corrections stay), along with stars, photos and the latest study progress.</p>
    ${r.deckMerges.length ? `<section class="panel"><h3>Decks saved more than once</h3><ul class="dupe-list">${r.deckMerges.map((m) => `<li><b>${esc(m.name)}</b> appears ${m.copies} times → becomes one deck of ${plural(m.cards, 'card')}</li>`).join('')}</ul></section>` : ''}
    ${r.cardMerges.some((m) => m.from) ? `<section class="panel"><h3>Same card in two decks</h3><ul class="dupe-list">${r.cardMerges.filter((m) => m.from).map((m) => `<li><div>${card(m.keep)}</div><div class="muted small">Keep it in <b>${esc(m.deck)}</b>, remove the copy in <b>${esc(m.from)}</b></div></li>`).join('')}</ul></section>` : ''}
    ${r.cardMerges.some((m) => !m.from) ? `<section class="panel"><h3>Cards saved twice</h3><ul class="dupe-list">${r.cardMerges.filter((m) => !m.from).map((m) => `<li><span class="muted small">${esc(m.deck)}</span><div>Keep ${card(m.keep)}</div>${dupKey(m.keep.term) === dupKey(m.drop.term) && dupKey(m.keep.def) === dupKey(m.drop.def) ? '' : `<div class="muted">Remove <s>${card(m.drop)}</s></div>`}</li>`).join('')}</ul></section>` : ''}
    <button class="btn primary block" id="doDedupe">Remove ${plural(r.count, 'duplicate')}</button>
    <p class="muted small center">The removal syncs to your other devices too.</p>
  `);
  $('#doDedupe').onclick = () => {
    const n = removeDupes();
    try { localStorage.removeItem(DUPE_HIDE_KEY); } catch { /* ignore */ }
    toast(`Removed ${plural(n, 'duplicate')}`); location.hash = '#/';
  };
}

/* ---------- story time (Google Gemini) ---------- */
// Your own free Gemini API key, kept only on this device (not synced, not in backups).
const AI_KEY = 'espanol.ai';
let ai = (() => { try { return JSON.parse(localStorage.getItem(AI_KEY)) || {}; } catch { return {}; } })();
const saveAi = () => { try { localStorage.setItem(AI_KEY, JSON.stringify(ai)); } catch { /* ignore */ } };
const GEM = 'https://generativelanguage.googleapis.com/v1beta';
async function gemFetch(path, key, body) {
  const res = await fetch(`${GEM}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'x-goog-api-key': key, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = ''; let reason = '';
    try { const er = (await res.json()).error || {}; msg = er.message || ''; reason = (er.details || []).map((x) => x && x.reason).filter(Boolean).join(', '); } catch { /* ignore */ }
    const e = new Error(msg || `Gemini error ${res.status}`); e.status = res.status; e.reason = reason; throw e;
  }
  return res.json();
}
// The Flash models this key can use, best first (Flash before Flash-Lite, newest version first).
async function gemModels(key) {
  const all = []; let tok = '';
  for (let i = 0; i < 5; i++) {
    const j = await gemFetch(`/models?pageSize=1000${tok ? `&pageToken=${encodeURIComponent(tok)}` : ''}`, key);
    all.push(...(j.models || [])); tok = j.nextPageToken; if (!tok) break;
  }
  const rank = (id) => { const m = /^gemini-(\d+(?:\.\d+)?)-flash(-lite)?$/.exec(id); return m ? [m[2] ? 0 : 1, parseFloat(m[1])] : null; };
  return all.filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m) => String(m.name || '').replace(/^models\//, '')).filter((id) => rank(id))
    .sort((a, b) => { const x = rank(a); const y = rank(b); return (y[0] - x[0]) || (y[1] - x[1]); });
}
async function gemGenerate(prompt) {
  const key = ai.key;
  if (!key) { const e = new Error('No Gemini key'); e.code = 'nokey'; throw e; }
  let list = ai.models && Date.now() - (ai.modelsAt || 0) < 7 * 864e5 ? ai.models : null;
  if (!list) { list = await gemModels(key); ai.models = list; ai.modelsAt = Date.now(); saveAi(); }
  if (ai.model && list.includes(ai.model)) list = [ai.model, ...list.filter((m) => m !== ai.model)];
  if (!list.length) { const e = new Error('No Gemini Flash model is available for this key.'); e.code = 'nomodel'; throw e; }
  let last;
  for (const model of list.slice(0, 4)) { // a model that's over its free limit falls through to the next one
    try {
      const j = await gemFetch(`/models/${model}:generateContent`, key, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.9 },
      });
      const text = (j.candidates?.[0]?.content?.parts || []).filter((x) => !x.thought).map((x) => x.text || '').join('');
      if (!text.trim()) { last = new Error('Gemini sent an empty reply'); continue; }
      if (ai.model !== model) { ai.model = model; saveAi(); }
      return text;
    } catch (e) {
      last = e;
      if (![403, 404, 429, 500, 503].includes(e.status)) throw e;
    }
  }
  throw last;
}
function gemErrorText(e) {
  if (e.code === 'nokey') return 'Add your Gemini key in Settings first.';
  if (!navigator.onLine) return 'You’re offline. Story time needs the internet.';
  if (/FREE_TIER_VERIFICATION/i.test(e.reason || '') || /verif/i.test(e.message)) return `Google wants you to verify your account before using the free tier. Open aistudio.google.com, follow the verification prompt, then try again. (Google says: ${e.message})`;
  if (/leaked/i.test(e.message)) return 'Google blocked this key because it was reported as leaked. Create a new key in AI Studio and paste that one.';
  if ((e.status === 400 || e.status === 401) && /key/i.test(e.message)) return `Google didn’t accept this key (${e.status}${e.reason ? ` ${e.reason}` : ''}). Make sure you copied the whole key — keys starting with “AQ.” are long — then paste it again.`;
  if (e.status === 429) return 'You’ve reached Gemini’s free limit for now. Try again in a minute (or tomorrow if it’s the daily limit).';
  if (e.status === 403) return 'This Gemini key isn’t allowed to use the model. Check the key in Google AI Studio.';
  if (e.code === 'parse') return 'Gemini’s answer came out garbled. Tap the button to try again.';
  return `Gemini isn’t working right now (${e.status || ''} ${e.reason || ''}: ${e.message}). Try again in a moment.`;
}

// Words to practice: ones you're learning (not yet yours), due ones first.
function storyWords(deckId, n = 7) {
  const decks = deckId ? state.decks.filter((d) => d.id === deckId) : state.decks;
  const seen = new Set(); const pool = [];
  decks.forEach((d) => d.cards.forEach((c) => {
    const k = dupKey(c.term);
    if (!isValid(c) || isMine(c) || plain(c.term).length > 50 || seen.has(k)) return;
    seen.add(k); pool.push(c);
  }));
  const rank = (c) => (isDue(c) ? 0 : status(c) === 'learning' ? 1 : status(c) === 'new' ? 2 : 3);
  const sorted = shuffle(pool).sort((a, b) => rank(a) - rank(b));
  return shuffle(sorted.slice(0, n * 2)).slice(0, n);
}
const MARK_RE = /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g;
const esClean = (t) => t.replace(MARK_RE, '$1');
const esMarked = (t) => esc(t).replace(MARK_RE, '<mark class="st-w">$1</mark>');
function storyPrompt(words, type, level) {
  const dialect = state.settings.voiceLang === 'es-ES' ? 'Spain' : 'Latin American';
  const lvl = level === 'medium'
    ? 'CEFR B1 (intermediate): natural sentences, present, past and future tenses are fine'
    : 'CEFR A1–A2 (beginner): short, simple sentences, mostly present tense, very common words';
  const what = type === 'story'
    ? 'a short, fun story of 8 to 10 sentences with a title'
    : '6 separate everyday example sentences (not a story; set "title" to "")';
  return `You write reading practice for an English-speaking learner of Spanish.

Words the learner is studying (Spanish = English):
${words.map((c) => `- ${plain(c.term)} = ${plain(c.def)}`).join('\n')}

Write ${what} in ${dialect} Spanish at ${lvl}. Use every listed word at least once; you may conjugate verbs and change gender or number. Keep all other vocabulary simple.
Mark every use of a listed word like this: [[form used|listed word]], for example [[comimos|comer]] or [[las mochilas|la mochila]]. Do not mark anything else.
Then write 3 multiple-choice questions in simple Spanish that check understanding of the text, each with an English translation, 3 options in Spanish, and the 0-based index of the one correct option.

Reply with JSON only, in exactly this shape:
{"title": "Spanish title", "title_en": "English title", "sentences": [{"es": "Spanish sentence with [[marks|word]]", "en": "English translation"}], "questions": [{"q": "Spanish question", "q_en": "English question", "options": ["…", "…", "…"], "answer": 0}]}`;
}
function parseStory(text, type) {
  const t = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const a = t.indexOf('{'); const b = t.lastIndexOf('}');
  let j;
  try { j = JSON.parse(t.slice(a, b + 1)); } catch { const e = new Error('parse'); e.code = 'parse'; throw e; }
  const sentences = (Array.isArray(j.sentences) ? j.sentences : [])
    .filter((x) => x && typeof x.es === 'string' && x.es.trim())
    .map((x) => ({ es: x.es.trim(), en: String(x.en || '').trim() })).slice(0, 20);
  if (!sentences.length) { const e = new Error('parse'); e.code = 'parse'; throw e; }
  const questions = (Array.isArray(j.questions) ? j.questions : []).map((q) => {
    const opts = Array.isArray(q?.options) ? q.options.map((o) => String(o).trim()).filter(Boolean).slice(0, 4) : [];
    const ans = Number.isInteger(q?.answer) ? q.answer : -1;
    if (!q?.q || opts.length < 2 || ans < 0 || ans >= opts.length) return null;
    const order = shuffle(opts.map((_, k) => k)); // the model tends to put the right answer first
    return { q: String(q.q), q_en: String(q.q_en || ''), options: order.map((k) => opts[k]), answer: order.indexOf(ans) };
  }).filter(Boolean).slice(0, 5);
  // Fill-in-the-blank: hide the first marked word in up to 5 sentences.
  const blanks = [];
  sentences.forEach((x, i) => {
    if (blanks.length >= 5) return;
    const m = new RegExp(MARK_RE.source).exec(x.es); if (!m) return;
    blanks.push({ i, form: m[1].trim(), base: (m[2] || m[1]).trim(), before: esClean(x.es.slice(0, m.index)), after: esClean(x.es.slice(m.index + m[0].length)) });
  });
  return { type, title: type === 'story' ? String(j.title || '') : '', title_en: type === 'story' ? String(j.title_en || '') : '', sentences, questions, blanks };
}
const STORY_KEY = 'espanol.story';
const loadStory = () => { try { return JSON.parse(localStorage.getItem(STORY_KEY)); } catch { return null; } };
const keepStory = (x) => { try { localStorage.setItem(STORY_KEY, JSON.stringify(x)); } catch { /* ignore */ } };
function storyHtml(st) {
  return `<article class="st-card">
    ${st.title ? `<h2 class="st-title" lang="es">${esc(st.title)}</h2>${st.title_en ? `<p class="muted st-title-en">${esc(st.title_en)}</p>` : ''}` : ''}
    <div class="st-tools">${canSpeak ? `<button type="button" class="btn sm ghost" id="stRead">${I.speaker} Read aloud</button>` : ''}<button type="button" class="btn sm ghost" id="stAllEn">Show English</button></div>
    <div class="st-body">${st.sentences.map((x, i) => `<div class="st-s" data-i="${i}" role="button" tabindex="0"><p lang="es">${esMarked(x.es)}</p><p class="st-en" hidden>${esc(x.en)}</p></div>`).join('')}</div>
    <p class="muted small center">Tap a sentence to see it in English.</p>
  </article>
  ${st.questions.length ? `<section class="panel st-quiz"><h3>Did you understand?</h3>${st.questions.map((q, i) => `<div class="st-q" data-i="${i}"><p><b lang="es">${esc(q.q)}</b>${q.q_en ? `<br><span class="muted small">${esc(q.q_en)}</span>` : ''}</p><div class="st-opts">${q.options.map((o, k) => `<button type="button" class="btn st-opt" data-k="${k}" lang="es">${esc(o)}</button>`).join('')}</div></div>`).join('')}</section>` : ''}
  ${st.blanks.length ? `<section class="panel st-fill"><h3>Fill in the missing word</h3><p class="muted small">Type the exact word from the story. Words you get exactly right count toward <b>My words</b>.</p>${st.blanks.map((b, n) => `<form class="st-b" data-n="${n}" autocomplete="off"><p lang="es">${esc(b.before)}<input class="st-in" lang="es" aria-label="Missing word" autocapitalize="off" autocorrect="off" spellcheck="false" style="width:${Math.max(4, b.form.length + 1)}ch">${esc(b.after)}</p><p class="muted small">${esc(st.sentences[b.i].en)} · <span lang="es">(${esc(b.base)})</span></p><div class="row gap"><button class="btn sm" type="submit">Check</button><span class="st-fb"></span></div></form>`).join('')}</section>` : ''}`;
}
function storyView(q) {
  const deckId = q.get('deck') || '';
  const deck = deckId ? getDeck(deckId) : null; if (deckId && !deck) return;
  setHeader('Story time', deck ? `#/deck/${deckId}` : '#/');
  if (!ai.key) {
    render(`<div class="empty-state"><div class="big-ic">${I.book}</div><h2>Story time</h2>
      <p>Read short stories and sentences written with the words you're learning, then answer a few questions about them.</p>
      <p class="muted">It uses Google Gemini, which is free with your own key (takes a minute to set up).</p>
      <a class="btn primary" href="#/settings?ai=1">Add a free Gemini key</a></div>`);
    return;
  }
  const prefs = ui.story || (ui.story = { type: 'story', level: 'easy' });
  const byId = new Map(); state.decks.forEach((d) => d.cards.forEach((c) => byId.set(c.id, c)));
  let saved = loadStory(); if (saved && saved.deckId !== deckId) saved = null;
  let words = saved ? saved.wordIds.map((id) => byId.get(id)).filter(Boolean) : storyWords(deckId);
  let story = saved ? saved.data : null;
  let busy = false;

  function page(err = '') {
    const enough = words.length >= 3;
    render(`<div id="story">
      <div class="st-opts-row">
        <div class="field"><span>Practice with</span>${seg('stType', [['story', 'A story'], ['sentences', 'Sentences']], prefs.type)}</div>
        <div class="field"><span>Level</span>${seg('stLevel', [['easy', 'Easy'], ['medium', 'Medium']], prefs.level)}</div>
      </div>
      ${enough ? `<div class="st-words"><span class="muted small">Your words:</span>${words.map((c) => `<span class="chip-w" lang="es">${rich(c.term)}</span>`).join('')}<button type="button" class="btn sm ghost" id="stShuffle">${I.shuffle} Other words</button></div>
      <button type="button" class="btn primary block" id="stGo" ${busy ? 'disabled' : ''}>${I.book} ${busy ? 'Writing…' : `${story ? 'New' : 'Write a'} ${prefs.type === 'story' ? 'story' : 'set of sentences'}`}</button>`
        : `<p class="empty">You need at least 3 words you're still learning${deck ? ' in this deck' : ''}. Add cards, or remove some from My words.</p>`}
      ${err ? `<div class="sync-status bad">${I.alert} ${esc(err)}</div>` : ''}
      <div id="stOut">${busy ? '<p class="muted center st-wait">✍️ Writing with your words…</p>' : story ? storyHtml(story) : ''}</div>
    </div>`);
    const root = $('#story');
    root.addEventListener('change', (e) => {
      if (e.target.name === 'stType') prefs.type = e.target.value;
      else if (e.target.name === 'stLevel') prefs.level = e.target.value;
      else return;
      const b = $('#stGo'); if (b && !busy) b.innerHTML = `${I.book} ${story ? 'New' : 'Write a'} ${prefs.type === 'story' ? 'story' : 'set of sentences'}`;
    });
    const sh = $('#stShuffle'); if (sh) sh.onclick = () => { words = storyWords(deckId); story = null; page(); };
    const go = $('#stGo'); if (go) go.onclick = generate;
    if (story) wireStory(root);
  }
  async function generate() {
    if (busy) return; busy = true;
    const type = prefs.type; const level = prefs.level;
    page();
    let err = '';
    try {
      const text = await gemGenerate(storyPrompt(words, type, level));
      story = parseStory(text, type);
      keepStory({ deckId, wordIds: words.map((c) => c.id), data: story, at: Date.now() });
    } catch (e) { err = gemErrorText(e); }
    busy = false;
    if (location.hash.startsWith('#/story')) page(err);
  }
  function wireStory(root) {
    root.addEventListener('click', (e) => {
      const sEl = e.target.closest('.st-s');
      if (sEl) { const en = $('.st-en', sEl); en.hidden = !en.hidden; return; }
      const opt = e.target.closest('.st-opt');
      if (opt) {
        const qEl = opt.closest('.st-q'); if (qEl.classList.contains('done')) return;
        const qd = story.questions[+qEl.dataset.i]; const k = +opt.dataset.k;
        qEl.classList.add('done');
        $$('.st-opt', qEl).forEach((b) => { b.disabled = true; if (+b.dataset.k === qd.answer) b.classList.add('ok'); });
        if (k !== qd.answer) opt.classList.add('bad');
        return;
      }
      if (e.target.closest('#stRead')) { speak(story.sentences.map((x) => esClean(x.es)).join(' ')); return; }
      const all = e.target.closest('#stAllEn');
      if (all) { const show = all.textContent.includes('Show'); $$('.st-en', root).forEach((p) => { p.hidden = !show; }); all.textContent = show ? 'Hide English' : 'Show English'; }
    });
    root.addEventListener('keydown', (e) => {
      const sEl = e.target.closest('.st-s');
      if (sEl && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); const en = $('.st-en', sEl); en.hidden = !en.hidden; }
    });
    root.addEventListener('submit', (e) => {
      const f = e.target.closest('.st-b'); if (!f) return;
      e.preventDefault();
      const b = story.blanks[+f.dataset.n]; const inp = $('.st-in', f); const fb = $('.st-fb', f);
      const given = inp.value.trim(); if (!given) { inp.focus(); return; }
      const res = checkAnswer(given, b.form);
      inp.classList.remove('ok', 'bad');
      if (res === 'correct') {
        inp.classList.add('ok'); fb.textContent = '✓ ¡Correcto!'; fb.className = 'st-fb good';
        const nb = normAns(b.base);
        const card = words.find((c) => normAns(plain(c.term)) === nb) || words.find((c) => answerVariants(c.term).includes(nb));
        if (card) markPass(card, 'wr', true);
      } else if (res === 'accent' || res === 'typo') {
        inp.classList.add('bad'); fb.textContent = `Almost — it’s “${b.form}”`; fb.className = 'st-fb warn';
      } else {
        inp.classList.add('bad'); fb.textContent = `It’s “${b.form}”`; fb.className = 'st-fb bad';
      }
    });
  }
  page();
}

/* ---------- views: my words ---------- */
function wordsView() {
  setHeader('My words', '#/');
  const all = [];
  state.decks.forEach((d) => d.cards.forEach((c) => { if (isValid(c)) all.push({ c, d }); }));
  const mine = all.filter((x) => isMine(x.c)).sort((a, b) => b.c.m.own - a.c.m.own);
  const week = mine.filter((x) => x.c.m.own > Date.now() - 7 * 864e5).length;
  const almost = all.filter((x) => !isMine(x.c) && passedFc(x.c) !== passedWr(x.c))
    .sort((a, b) => Math.max(b.c.m.fc, b.c.m.wr) - Math.max(a.c.m.fc, a.c.m.wr));
  const step = (ok, label) => `<span class="pill step ${ok ? 'ok' : ''}">${ok ? '✓' : '○'} ${label}</span>`;
  render(`<div id="words">
    <section class="words-hero">
      <div class="words-ic">${I.trophy}</div>
      <div class="words-num">${mine.length}</div>
      <p>${mine.length === 1 ? 'word is' : 'words are'} yours${week ? ` · <b>+${week}</b> this week` : ''}</p>
    </section>
    <details class="help" ${mine.length ? '' : 'open'}>
      <summary>How a word becomes yours</summary>
      <ol>
        <li><b>Know it on a flashcard:</b> tap <b>Know it</b> in Flashcards (or <b>Good</b> / <b>Easy</b> in Review).</li>
        <li><b>Write it:</b> type it exactly right in <b>Write</b> or <b>Learn</b> (or when typing in Review). Small typos and missing accents don't count.</li>
      </ol>
      <p>Do both, in any order, and the word is yours. Getting it wrong again resets that step. Your words are left out of Review and practice, so you can focus on the rest.</p>
    </details>
    ${almost.length ? `<section class="panel"><h3>Almost yours (${almost.length})</h3><p class="muted small">One step done, one to go.</p><div class="card-list compact">${almost.slice(0, 60).map(({ c }) => `<div class="card-row"><div class="cr-text"><div class="cr-term" lang="es">${rich(c.term)}</div><div class="cr-def">${rich(c.def)}</div></div><div class="steps">${step(passedFc(c), 'Flashcard')}${step(passedWr(c), 'Write')}</div></div>`).join('')}</div></section>` : ''}
    <section class="panel"><h3>Your words</h3>
      ${mine.length ? '<p class="muted small">Tap <b>Remove</b> to take a word off your list. It goes back into Review and practice, and you can earn it again.</p>' : ''}
      ${mine.length ? `<div class="card-list compact">${mine.map(({ c, d }) => `<div class="card-row" data-id="${c.id}"><span class="dot mine"></span><div class="cr-text"><div class="cr-term" lang="es">${rich(c.term)}</div><div class="cr-def">${rich(c.def)}</div><div class="muted small">${esc(d.name)} · since ${new Date(c.m.own).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div></div>${sayBtn(c.term)}<button type="button" class="btn sm ghost unown" aria-label="Remove ${esc(plain(c.term))} from my words">${I.x} Remove</button></div>`).join('')}</div>`
        : '<p class="muted">No words yet. Open a deck, tap <b>Know it</b> on the words you know in Flashcards, then type them in Write. They’ll show up here.</p>'}
    </section>
  </div>`);
  $('#words').addEventListener('click', (e) => {
    const b = e.target.closest('.unown'); if (!b) return;
    const id = b.closest('.card-row').dataset.id;
    const hit = all.find((x) => x.c.id === id); if (!hit) return;
    const now = Date.now(); Object.assign(hit.c.m, { off: now, fx: now, wx: now });
    save(); toast(`Removed “${plain(hit.c.term)}” from your words — it’s back in practice`); wordsView();
  });
}

/* ---------- views: home ---------- */
function deckCounts(d) {
  const now = Date.now(); const r = { total: 0, new: 0, learning: 0, known: 0, due: 0, mine: 0 };
  for (const c of d.cards) { if (!isValid(c)) continue; r.total++; if (isMine(c)) { r.mine++; continue; } r[status(c)]++; if (isDue(c, now)) r.due++; }
  return r;
}
function progressBar(r) {
  const t = r.total || 1;
  return `<div class="progress" role="img" aria-label="${r.mine || 0} mine, ${r.known} known, ${r.learning} learning, ${r.new} new"><span class="p-mine" style="width:${((r.mine || 0) / t) * 100}%"></span><span class="p-known" style="width:${(r.known / t) * 100}%"></span><span class="p-learning" style="width:${(r.learning / t) * 100}%"></span></div>`;
}
function deckTile(d) {
  const r = deckCounts(d);
  return `<a class="deck-tile" href="#/deck/${d.id}"><h4>${esc(d.name)}</h4><p class="muted">${plural(r.total, 'card')}${r.mine ? ` · <span class="mine-n">${r.mine} mine</span>` : ''}${r.due ? ` · <span class="due">${r.due} due</span>` : ''}</p>${progressBar(r)}</a>`;
}

// Decks named with a date (2026/11/17, 2026-11-17, 2026.11.17, also with extra words) are listed newest first;
// decks without a date come after them in their usual order.
const DECK_DATE_RE = /(\d{4})([\/\-.])(\d{1,2})([\/\-.])(\d{1,2})(?!\d)/;
function deckDate(name) {
  const m = DECK_DATE_RE.exec(name || ''); if (!m) return 0;
  const mo = +m[3]; const da = +m[5];
  return mo >= 1 && mo <= 12 && da >= 1 && da <= 31 ? +m[1] * 10000 + mo * 100 + da : 0;
}
function sortedDecks() {
  return state.decks.map((d, i) => ({ d, i, t: deckDate(d.name) }))
    .sort((a, b) => (b.t - a.t) || (a.t ? (b.d.created || 0) - (a.d.created || 0) : a.i - b.i)).map((x) => x.d);
}
// A new deck is named with today's date, written the same way as your newest dated deck.
function newDeckName() {
  const dated = sortedDecks().find((d) => deckDate(d.name));
  if (!dated) return 'New deck';
  const m = DECK_DATE_RE.exec(dated.name); const now = new Date();
  const pad = (n, like) => (like.length > 1 ? String(n).padStart(2, '0') : String(n));
  const base = `${now.getFullYear()}${m[2]}${pad(now.getMonth() + 1, m[3])}${m[4]}${pad(now.getDate(), m[5])}`;
  const taken = new Set(state.decks.map((d) => d.name.trim().toLowerCase()));
  let name = base; for (let n = 2; taken.has(name.toLowerCase()); n++) name = `${base} (${n})`;
  return name;
}

function home() {
  setHeader('Español', null);
  const now = Date.now(); let due = 0; let fresh = 0;
  for (const d of state.decks) for (const c of d.cards) { if (!isValid(c) || isMine(c)) continue; if (isDue(c, now)) due++; else if (!c.srs.last) fresh++; }
  const newToday = Math.min(fresh, Math.max(0, state.settings.newPerDay - newIntroducedToday()));
  const todo = due + newToday;
  const streak = currentStreak();
  const studied = state.stats.history[dayKey()]?.reviews || 0;
  const showHint = !isStandalone() && isTouch() && !state.settings.hideInstallHint;
  // Spot duplicate decks/cards (e.g. after combining two devices) and offer to clean them up.
  const dupes = findDupes(); let hidden = '';
  try { hidden = localStorage.getItem(DUPE_HIDE_KEY) || ''; } catch { /* ignore */ }
  const dupeHint = dupes.count && hidden !== dupeSig(dupes) ? `<div class="install-hint dupe-hint">${I.copy}<span>Found ${plural(dupes.count, 'duplicate')} in your decks. <a href="#/dupes">Review &amp; remove</a></span><button class="icon-btn" id="hideDupes" aria-label="Dismiss">${I.x}</button></div>` : '';
  render(`
    <section class="hero">
      <div class="hero-top">
        <div>
          <p class="eyebrow">Today</p>
          <h2>${todo ? `${plural(todo, 'card')} to review` : 'All caught up'}</h2>
          <p>${due} due · ${newToday} new · ${studied} answered today</p>
        </div>
        <div class="hero-badges">
          <a class="streak mine-badge" href="#/words" aria-label="My words">${I.trophy}<b>${mineCount()}</b><span>my words</span></a>
          <div class="streak ${streak ? 'on' : ''}">${I.flame}<b>${streak}</b><span>day streak</span></div>
        </div>
      </div>
      <a class="btn primary block" href="#/review" ${todo ? '' : 'aria-disabled="true" tabindex="-1"'}>${I.review} Start review</a>
    </section>
    <a class="review-strip story-strip" href="#/story">${I.book}<div><b>Story time</b><span>Read a short story made from the words you're learning</span></div><span class="chev">›</span></a>
    ${dupeHint}
    ${showHint ? `<div class="install-hint">${I.phone}<span>Add Español to your home screen. <a href="#/settings">How?</a></span><button class="icon-btn" id="hideHint" aria-label="Dismiss">${I.x}</button></div>` : ''}
    <div class="section-head">
      <h3>Your decks</h3>
      <div class="row gap"><a class="btn sm ghost" href="#/import">${I.upload} Import</a><button class="btn sm" id="newDeck">${I.plus} New</button></div>
    </div>
    <div class="deck-list">${sortedDecks().map(deckTile).join('') || '<p class="empty">No decks yet. Create one or import from Quizlet.</p>'}</div>
    <p class="sync-line" id="syncLine">${syncLineHtml()}</p>
  `);
  $('#newDeck').onclick = () => {
    const d = makeDeck({ name: newDeckName(), cards: [makeCard()] });
    state.decks.unshift(d); save(); location.hash = `#/deck/${d.id}/edit`;
  };
  const hd = $('#hideDupes');
  if (hd) hd.onclick = () => { try { localStorage.setItem(DUPE_HIDE_KEY, dupeSig(dupes)); } catch { /* ignore */ } hd.parentElement.remove(); };
  const hh = $('#hideHint');
  if (hh) hh.onclick = () => { state.settings.hideInstallHint = true; save(); hh.parentElement.remove(); };
}

/* ---------- views: deck ---------- */
const ui = { starOnly: {}, incMine: {} };
function deckView(id) {
  const d = getDeck(id); if (!d) return;
  setHeader(d.name, '#/');
  const r = deckCounts(d);
  const valid = d.cards.filter(isValid);
  const starred = valid.filter((c) => c.starred).length;
  const so = !!ui.starOnly[id] && starred > 0;
  const im = !!ui.incMine[id] && r.mine > 0;
  const qp = [so && 'starred=1', im && 'mine=1'].filter(Boolean).join('&');
  const qs = qp ? `?${qp}` : '';
  const reviewNow = r.due + Math.min(r.new, Math.max(0, state.settings.newPerDay - newIntroducedToday()));
  const modes = [
    ['flash', 'Flashcards', 'Flip and sort what you know', I.cards],
    ['learn', 'Learn', 'Multiple choice, then typing', I.learn],
    ['write', 'Write', 'Type every answer', I.write],
    ['match', 'Match', 'Race to pair them up', I.match],
    ['story', 'Story', 'Read your words in a story', I.book],
  ];
  render(`
    <section class="deck-head">
      <div class="stats3 stats4"><div><b>${r.new}</b><span>New</span></div><div><b>${r.learning}</b><span>Learning</span></div><div><b>${r.known}</b><span>Known</span></div><a href="#/words" class="stat-mine"><b>${r.mine}</b><span>Mine</span></a></div>
      ${progressBar(r)}
    </section>
    <a class="review-strip" href="#/review?deck=${d.id}">${I.review}<div><b>Review this deck</b><span>${reviewNow ? `${plural(reviewNow, 'card')} ready` : 'Nothing due'} · spaced repetition</span></div><span class="chev">›</span></a>
    <div class="mode-grid">${modes.map(([m, t, s, ic]) => `<a class="mode" href="${m === 'story' ? `#/story?deck=${d.id}` : `#/deck/${d.id}/${m}${qs}`}"><span class="mode-ic">${ic}</span><b>${t}</b><span class="muted">${s}</span></a>`).join('')}</div>
    ${starred ? `<label class="switch-row"><span class="inline">${I.star} Study starred only (${starred})</span><input type="checkbox" id="starOnly" class="switch" ${so ? 'checked' : ''}></label>` : ''}
    ${r.mine ? `<label class="switch-row"><span class="inline">${I.trophy} Practice my words too (${r.mine})</span><input type="checkbox" id="incMine" class="switch" ${im ? 'checked' : ''}></label>` : ''}
    <div class="section-head">
      <h3>${plural(valid.length, 'card')}</h3>
      <div class="row gap"><a class="btn sm ghost" href="#/import/${d.id}">${I.upload} Add</a><a class="btn sm" href="#/deck/${d.id}/edit">${I.edit} Edit</a></div>
    </div>
    <div class="card-list">${valid.map((c) => `<div class="card-row"><span class="dot ${isMine(c) ? 'mine' : status(c)}" title="${isMine(c) ? 'mine' : status(c)}"></span>${c.img ? photoTag(c, 'cr-img') : ''}<div class="cr-text"><div class="cr-term" lang="es">${rich(c.term)}</div><div class="cr-def">${rich(c.def)}</div></div>${sayBtn(c.term)}${starBtn(c)}</div>`).join('') || `<p class="empty">No cards yet. <a href="#/deck/${d.id}/edit">Add some</a>.</p>`}</div>
    <div class="danger-row">
      <button class="btn sm ghost" id="copyText">${I.copy} Copy as text</button>
      <button class="btn sm ghost danger" id="delDeck">${I.trash} Delete deck</button>
    </div>
  `);
  const soEl = $('#starOnly');
  if (soEl) soEl.onchange = () => { ui.starOnly[id] = soEl.checked; deckView(id); };
  const imEl = $('#incMine');
  if (imEl) imEl.onchange = () => { ui.incMine[id] = imEl.checked; deckView(id); };
  $('#copyText').onclick = async () => {
    const text = valid.map((c) => `${c.term}\t${c.def}`).join('\n');
    try { await navigator.clipboard.writeText(text); toast('Copied — paste it anywhere'); } catch { toast('Copy failed'); }
  };
  $('#delDeck').onclick = () => {
    if (!confirm(`Delete “${d.name}” and its ${plural(d.cards.length, 'card')}? This can't be undone.`)) return;
    tombstone('decks', id); state.decks = state.decks.filter((x) => x.id !== id); save(); toast('Deck deleted'); location.hash = '#/';
  };
}

/* ---------- auto-translate ---------- */
// Google Translate's free web endpoint: the main translation plus dictionary alternatives for single words.
const trCache = new Map();
async function translate(text, sl, tl) {
  const key = `${sl}|${tl}|${text}`;
  if (trCache.has(key)) return trCache.get(key);
  // "to save money" → "ahorrar dinero" (an infinitive), not "para ahorrar dinero" ("in order to").
  const q = sl === 'en' ? text.replace(/^to\s+/i, '') : text;
  const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&dt=bd&q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error(String(res.status));
  const d = await res.json();
  let main = (Array.isArray(d[0]) ? d[0] : []).map((x) => (x && x[0]) || '').join('').trim();
  const dict = Array.isArray(d[1]) ? d[1] : [];
  let alts = [];
  // A Spanish infinitive (hablar, comer, vivir, hospedarse) → English "to …", from the verb meanings only.
  const verb = sl === 'es' && /^\p{L}+(?:ar|er|ir|ír)(?:se)?$/iu.test(text) && dict.find((p) => p[0] === 'verb');
  const enVerb = sl === 'en' && q !== text && dict.find((p) => p[0] === 'verb'); // "to stay" → verbs only, not "estancia"
  if (enVerb) alts = (enVerb[1] || []).slice(0, 5);
  else if (verb) {
    const to = (w) => (/^to /i.test(w) ? w : `to ${w}`);
    main = to(main); alts = (verb[1] || []).slice(0, 5).map(to);
  } else dict.forEach((p, i) => (p[1] || []).slice(0, i ? 2 : 4).forEach((w) => alts.push(w)));
  alts = [...new Set(alts.filter((a) => a && a.toLowerCase() !== main.toLowerCase()))].slice(0, 5);
  const out = { main, alts };
  trCache.set(key, out);
  return out;
}

/* ---------- spelling & grammar check ---------- */
// Uses LanguageTool's free public service (only the card's words are sent, and only when checking),
// plus a few built-in rules for common learner mistakes it misses, which also work offline.
const spellCache = new Map(); // `${lang}|${text}` -> issues [{at, len, word, reps, kind, why}]
const spellSeen = new Set(); // texts that have been checked at least once (shows the built-in rules even offline)
const SPELL_LANG = { term: 'es', def: 'en-US' };
const spellKey = (f, t) => `${SPELL_LANG[f]}|${t}`;
const isIgnored = (w) => (state.settings.spellIgnore || []).includes(w.trim().toLowerCase());
function issueKind(m) {
  const c = m.rule?.category?.id || ''; const t = m.rule?.issueType; const id = m.rule?.id || '';
  if (t === 'whitespace') return 'Extra space';
  if (c === 'DIACRITICS' || /TILDE|ACCENT/.test(id)) return 'Accent';
  if (c === 'TYPOS') return 'Spelling';
  if (/AGREEMENT/.test(c + id)) return 'Agreement';
  if (c === 'CASING') return 'Capital letter';
  if (c === 'CONFUSED_WORDS') return 'Word mix-up';
  if (t === 'misspelling') return 'Spelling';
  return 'Grammar';
}
function issueWhy(kind, lang, m) {
  if (kind === 'Agreement') return 'The words don’t match in gender (el/la) or number (singular/plural).';
  if (kind === 'Accent') return 'Check the accent mark.';
  if (kind === 'Capital letter') return lang === 'es' ? 'Spanish doesn’t capitalize days, months or languages.' : 'Check the capital letter.';
  if (kind === 'Grammar' || kind === 'Word mix-up') return lang === 'es' ? 'Possible grammar mistake.' : (m.shortMessage || m.message || '');
  return '';
}
// Built-in rules for common learner mistakes (Spanish side).
const FEM_O = new Set(['mano', 'foto', 'moto', 'radio', 'modelo', 'soprano', 'testigo', 'piloto', 'libido', 'polio', 'dinamo', 'seo', 'virago']);
const DET_FLIP = { la: 'el', una: 'un', esta: 'este', esa: 'ese', aquella: 'aquel', el: 'la', un: 'una', este: 'esta', ese: 'esa', aquel: 'aquella' };
const sameCase = (from, to) => (from[0] === from[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to);
function learnerIssues(f, t) {
  if (f !== 'term') return [];
  const out = [];
  // "hacen veinte grados" → "hace": weather and temperature use the singular "hace".
  for (const m of t.matchAll(/(?<!\p{L})hacen(?=(?:\s+\S+){0,2}?\s+(?:grados|frío|frio|calor|sol|viento|fresco|tiempo)(?!\p{L}))/giu)) {
    out.push({ at: m.index, len: m[0].length, word: m[0], reps: [sameCase(m[0], 'hace')], kind: 'Grammar', why: 'Weather uses “hace” (singular): hace calor, hace 20 grados.' });
  }
  // "la presupuesto" → "el presupuesto": nouns ending in -o are almost always masculine.
  for (const m of t.matchAll(/(?<!\p{L})(la|una|esta|esa|aquella)\s+(\p{L}+o)(?!\p{L})/giu)) {
    const det = m[1]; const noun = m[2];
    if (FEM_O.has(noun.toLowerCase())) continue;
    // "la" can also mean "her/it" before a verb (la veo), so only flag a card that is just "la + word".
    if (det.toLowerCase() === 'la' && t.trim().toLowerCase() !== m[0].toLowerCase()) continue;
    out.push({ at: m.index, len: m[0].length, word: m[0], reps: [`${sameCase(det, DET_FLIP[det.toLowerCase()])} ${noun}`], kind: 'Gender', why: `“${noun}” ends in -o, so it’s masculine.` });
  }
  // "el canción" → "la canción": -ción, -sión, -dad, -tad, -tud, -umbre nouns are feminine.
  for (const m of t.matchAll(/(?<!\p{L})(el|un|este|ese|aquel)\s+(\p{L}+(?:ción|sión|dad|tad|tud|umbre))(?!\p{L})/giu)) {
    const det = m[1]; const noun = m[2];
    out.push({ at: m.index, len: m[0].length, word: m[0], reps: [`${sameCase(det, DET_FLIP[det.toLowerCase()])} ${noun}`], kind: 'Gender', why: `Words ending in -${noun.match(/(ción|sión|dad|tad|tud|umbre)$/i)[1]} are feminine.` });
  }
  return out;
}
async function spellRequest(lang, batch) {
  const text = batch.join('\n\n');
  const body = new URLSearchParams({ text, language: lang, disabledRules: 'UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END' });
  const res = await fetch('https://api.languagetool.org/v2/check', { method: 'POST', body });
  if (res.status === 429) throw new Error('busy');
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  const found = batch.map(() => []);
  const starts = []; let pos = 0;
  batch.forEach((t) => { starts.push(pos); pos += t.length + 2; });
  for (const m of data.matches || []) {
    const type = m.rule?.issueType;
    if (!['misspelling', 'whitespace', 'typographical', 'grammar', 'inconsistency'].includes(type)) continue;
    if (['STYLE', 'REDUNDANCY', 'TYPOGRAPHY'].includes(m.rule?.category?.id) && type !== 'whitespace') continue;
    let k = starts.length - 1; while (k > 0 && starts[k] > m.offset) k--;
    const at = m.offset - starts[k];
    if (at < 0 || at + m.length > batch[k].length) continue;
    const word = batch[k].substr(at, m.length);
    const kind = issueKind(m);
    found[k].push({ at, len: m.length, word, kind, why: issueWhy(kind, lang, m), reps: (m.replacements || []).slice(0, 4).map((r) => r.value).filter((v) => v !== word) });
  }
  batch.forEach((t, k) => spellCache.set(`${lang}|${t}`, found[k]));
}
// texts: [{f: 'term'|'def', t: plain text}] — fills the cache for anything not checked yet.
async function spellCheck(items) {
  items.forEach((x) => { if (x.t.trim()) spellSeen.add(spellKey(x.f, x.t)); });
  for (const f of ['term', 'def']) {
    const lang = SPELL_LANG[f];
    const todo = [...new Set(items.filter((x) => x.f === f && x.t.trim() && !spellCache.has(spellKey(f, x.t))).map((x) => x.t))];
    let batch = []; let size = 0;
    for (const t of todo) {
      if (batch.length && size + t.length > 10000) { await spellRequest(lang, batch); batch = []; size = 0; }
      batch.push(t); size += t.length + 2;
    }
    if (batch.length) await spellRequest(lang, batch);
  }
}
function spellIssues(f, raw) {
  const t = plain(raw); const key = spellKey(f, t);
  if (!spellSeen.has(key)) return [];
  const lt = spellCache.get(key) || [];
  const extra = learnerIssues(f, t).filter((x) => !lt.some((y) => y.at < x.at + x.len && x.at < y.at + y.len));
  return [...lt, ...extra].sort((a, b) => a.at - b.at).filter((x) => !(x.word.trim() && isIgnored(x.word)));
}
// Replace characters at a position in the plain text, keeping the formatting tags around it.
const TAG_AT = new RegExp(`^(?:${FMT_RE.source})`, 'i');
function replacePlain(raw, at, len, v) {
  const idx = [];
  for (let i = 0; i < raw.length;) { const m = TAG_AT.exec(raw.slice(i)); if (m) { i += m[0].length; continue; } idx.push(i); i++; }
  if (idx[at] == null || idx[at + len - 1] == null) return raw;
  return raw.slice(0, idx[at]) + v + raw.slice(idx[at + len - 1] + 1);
}
// Another card that is the same as this one, anywhere (shown while you add or edit cards).
function findTwin(c) {
  if (!dupKey(c.term) || !dupKey(c.def)) return null;
  for (const d of state.decks) for (let i = 0; i < d.cards.length; i++) { const x = d.cards[i]; if (x !== c && sameCard(x, c)) return { d, i, x }; }
  return null;
}
function twinHtml(c, deckId) {
  const t = findTwin(c); if (!t) return '';
  const where = t.d.id === deckId ? `Same as card ${t.i + 1} in this deck` : `Already in <b>${esc(t.d.name)}</b>`;
  return `<div class="dup-note">${I.copy}<span class="iss-kind">Duplicate</span><span>${where}: <span lang="es">${rich(t.x.term)}</span> – ${rich(t.x.def)}</span><button type="button" class="chip ghost dup-del">Delete this card</button></div>`;
}
function issuesHtml(c, deckId) {
  const out = [twinHtml(c, deckId)];
  for (const f of ['term', 'def']) {
    for (const x of spellIssues(f, c[f])) {
      const space = !x.word.trim();
      const fixes = space ? [`<button type="button" class="chip fix" data-f="${f}" data-at="${x.at}" data-len="${x.len}" data-v=" ">Fix</button>`]
        : x.reps.map((v) => `<button type="button" class="chip fix" data-f="${f}" data-at="${x.at}" data-len="${x.len}" data-v="${esc(v)}" ${f === 'term' ? 'lang="es"' : ''}>${esc(v)}</button>`);
      out.push(`<div class="issue">${I.alert}${space ? '' : `<span class="iss-kind">${esc(x.kind || 'Spelling')}</span>`}<span class="iss-word" ${f === 'term' ? 'lang="es"' : ''}>${space ? 'Extra space' : `<s>${esc(x.word)}</s>`}</span>${fixes.length ? `<span class="iss-arrow">→</span>${fixes.join('')}` : '<span class="muted small">no suggestions</span>'}${space ? '' : `<button type="button" class="chip ghost ign" data-w="${esc(x.word)}">Ignore</button>`}${x.why ? `<span class="iss-why">${esc(x.why)}</span>` : ''}</div>`);
    }
  }
  return out.join('');
}

const erImg = (c) => `<div class="er-img" ${c.img ? '' : 'hidden'}>${c.img ? photoTag(c) : ''}<button type="button" class="btn sm ghost er-img-del">${I.x} Remove photo</button></div>`;
function deckEdit(id) {
  const d = getDeck(id); if (!d) return;
  setHeader('Edit deck', `#/deck/${id}`);
  if (!d.cards.length) d.cards.push(makeCard());
  const row = (c, i) => `<div class="edit-row" data-id="${c.id}"><span class="er-num">${i + 1}</span><div class="er-fields"><label><span>Spanish</span><div class="er-term rt" contenteditable="true" role="textbox" aria-label="Spanish" lang="es" autocapitalize="off" spellcheck="false" enterkeyhint="next">${rich(c.term)}</div></label><label><span>English</span><div class="er-def rt" contenteditable="true" role="textbox" aria-label="English" autocapitalize="off" enterkeyhint="next">${rich(c.def)}</div></label><div class="er-tr" hidden></div><div class="er-issues">${issuesHtml(c, d.id)}</div>${erImg(c)}</div><div class="er-btns"><label class="icon-btn er-photo" aria-label="Add your own photo" title="Add your own photo">${I.image}<input type="file" accept="image/*" hidden></label><button type="button" class="icon-btn er-search" aria-label="Search pictures" title="Search pictures">${I.search}</button><button type="button" class="icon-btn er-del" aria-label="Delete card">${I.trash}</button></div></div>`;
  const setRowImg = (r, c) => { r.querySelector('.er-img').outerHTML = erImg(c); };
  const showIssues = (r, c) => { const box = r.querySelector('.er-issues'); const h = issuesHtml(c, d.id); if (box.innerHTML !== h) box.innerHTML = h; };
  const showAllIssues = () => $$('.edit-row', rows).forEach((r) => { const c = d.cards.find((x) => x.id === r.dataset.id); if (c) showIssues(r, c); });
  const spellItems = (cs) => cs.flatMap((c) => [{ f: 'term', t: plain(c.term) }, { f: 'def', t: plain(c.def) }]);
  let spellWarned = false;
  const spellFail = (err, loud) => {
    if (!loud && spellWarned) return; spellWarned = true;
    toast(!navigator.onLine ? 'The full check needs the internet' : err.message === 'busy' ? 'The checker is busy — try again in a minute' : 'The checker isn’t working right now');
  };
  // Check a card a moment after you leave one of its fields.
  const pending = new Set(); let spellTimer;
  const queueCheck = (c) => {
    if (!state.settings.spellCheck) return;
    pending.add(c); clearTimeout(spellTimer);
    spellTimer = setTimeout(async () => {
      const cs = [...pending]; pending.clear();
      try { await spellCheck(spellItems(cs)); } catch (err) { spellFail(err, false); }
      if (rows.isConnected) showAllIssues();
    }, 400);
  };
  render(`
    <label class="field"><span>Deck name</span><input id="deckName" value="${esc(d.name)}" autocomplete="off"></label>
    <div class="row gap wrap"><button class="btn sm ghost" id="checkAll">${I.check} Check for mistakes</button><button class="btn sm ghost" id="swapAll">${I.swap} Swap columns</button><a class="btn sm ghost" href="#/import/${id}">${I.upload} Bulk import</a></div>
    <div id="rows" class="edit-list">${d.cards.map(row).join('')}</div>
    <button class="btn block dashed" id="addRow">${I.plus} Add card</button>
    <div class="sticky-bottom">${fmtBar()}${accentBar()}<a class="btn primary" href="#/deck/${id}">Done</a></div>
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
    if (!e.target.classList.contains('rt')) return;
    const r = e.target.closest('.edit-row'); const c = r && d.cards.find((x) => x.id === r.dataset.id); if (!c) return;
    const val = serializeRich(e.target);
    if (e.target.classList.contains('er-term')) c.term = val; else c.def = val;
    c.updated = Date.now();
    saveSoon();
    showIssues(r, c);
    const tb = r.querySelector('.er-tr'); // you edited the auto-translated side yourself
    if (!tb.hidden && tb.dataset.f === (e.target.classList.contains('er-term') ? 'term' : 'def')) tb.hidden = true;
  });
  // Auto-translate: when you finish one side and the other is still empty, fill it in.
  const fieldEl = (r, f) => r.querySelector(f === 'term' ? '.er-term' : '.er-def');
  const setField = (r, c, f, v, select) => {
    c[f] = v; c.updated = Date.now(); saveSoon();
    const el = fieldEl(r, f); el.innerHTML = rich(v);
    if (select && document.activeElement === el) { // so typing replaces it and Enter keeps it
      const rg = document.createRange(); rg.selectNodeContents(el); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg);
    }
    showIssues(r, c); queueCheck(c);
  };
  const trBusy = new Set();
  const autoTranslate = async (r, c, from) => {
    if (state.settings.autoTranslate === false) return;
    const to = from === 'term' ? 'def' : 'term';
    const src = plain(c[from]).trim();
    if (!src || plain(c[to]).trim() || trBusy.has(c.id)) return;
    trBusy.add(c.id);
    let tr;
    try { tr = await translate(src, from === 'term' ? 'es' : 'en', from === 'term' ? 'en' : 'es'); } catch { return; } finally { trBusy.delete(c.id); }
    if (!tr.main || !r.isConnected || plain(c[to]).trim() || plain(c[from]).trim() !== src) return;
    setField(r, c, to, tr.main, true);
    const box = r.querySelector('.er-tr'); box.dataset.f = to;
    box.innerHTML = `${I.globe}<span class="tr-label">Auto-translated</span>${tr.alts.length ? `<span class="muted">or</span>${tr.alts.map((a) => `<button type="button" class="chip tr-pick" data-v="${esc(a)}" ${to === 'term' ? 'lang="es"' : ''}>${esc(a)}</button>`).join('')}` : ''}<button type="button" class="chip ghost tr-x" aria-label="Hide">${I.x}</button>`;
    box.hidden = false;
  };
  rows.addEventListener('focusout', (e) => {
    if (!e.target.classList?.contains('rt')) return;
    const [r, c] = rowCard(e.target) || [];
    if (c) { queueCheck(c); autoTranslate(r, c, e.target.classList.contains('er-term') ? 'term' : 'def'); }
  });
  const rowCard = (el) => { const r = el.closest('.edit-row'); return r && [r, d.cards.find((x) => x.id === r.dataset.id)]; };
  rows.addEventListener('change', async (e) => {
    if (e.target.type !== 'file') return;
    const [r, c] = rowCard(e.target) || []; const f = e.target.files[0]; e.target.value = '';
    if (c && f && await attachPhoto(c, f)) setRowImg(r, c);
  });
  rows.addEventListener('mousedown', (e) => { if (e.target.closest('.issue .chip, .er-tr .chip, .dup-note .chip')) e.preventDefault(); });
  rows.addEventListener('click', (e) => {
    const dd = e.target.closest('.dup-del');
    if (dd) { dd.closest('.edit-row').querySelector('.er-del').click(); return; }
    const tp = e.target.closest('.tr-pick, .tr-x');
    if (tp) {
      const [r, c] = rowCard(tp) || []; if (!c) return;
      const box = r.querySelector('.er-tr');
      if (tp.classList.contains('tr-pick')) setField(r, c, box.dataset.f, tp.dataset.v, false);
      box.hidden = true;
      return;
    }
    const fx = e.target.closest('.fix');
    if (fx) {
      const [r, c] = rowCard(fx) || []; if (!c) return;
      const f = fx.dataset.f; const at = +fx.dataset.at; const len = +fx.dataset.len;
      const issue = spellIssues(f, c[f]).find((x) => x.at === at && x.len === len);
      if (!issue || plain(c[f]).substr(at, len) !== issue.word) return;
      c[f] = replacePlain(c[f], at, len, fx.dataset.v); c.updated = Date.now(); saveSoon();
      r.querySelector(f === 'term' ? '.er-term' : '.er-def').innerHTML = rich(c[f]);
      showIssues(r, c); queueCheck(c);
      return;
    }
    const ig = e.target.closest('.ign');
    if (ig) {
      const w = ig.dataset.w.trim().toLowerCase(); const s = state.settings;
      s.spellIgnore = [...new Set([...(s.spellIgnore || []), w])]; s.updated = Date.now(); save();
      showAllIssues(); toast(`“${ig.dataset.w}” won’t be flagged again`);
      return;
    }
    const sb = e.target.closest('.er-search');
    if (sb) { const [r, c] = rowCard(sb) || []; if (c) photoSearch(c, () => setRowImg(r, c)); return; }
    const rm = e.target.closest('.er-img-del');
    if (rm) { const [r, c] = rowCard(rm) || []; if (c) { removePhoto(c); setRowImg(r, c); } return; }
    const b = e.target.closest('.er-del'); if (!b) return;
    const r = b.closest('.edit-row');
    tombstone('cards', r.dataset.id); d.cards = d.cards.filter((x) => x.id !== r.dataset.id); r.remove(); renumber(); saveSoon();
  });
  rows.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && !e.altKey) {
      const kind = k === 'b' ? 'b' : k === 'i' ? 'i' : k === 'u' ? 'u' : (k === 'h' && e.shiftKey) ? 'h' : null;
      if (kind && e.target.matches('.rt')) { e.preventDefault(); toggleFmt(e.target, kind); }
      return;
    }
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const r = e.target.closest('.edit-row');
    if (e.target.classList.contains('er-term')) r.querySelector('.er-def').focus();
    else if (r.nextElementSibling) r.nextElementSibling.querySelector('.er-term').focus();
    else addRow();
  });
  rows.addEventListener('paste', (e) => { // paste as plain text
    if (!e.target.closest('.rt')) return;
    e.preventDefault();
    const file = [...(e.clipboardData?.files || [])].find((f) => /^image\//.test(f.type));
    if (file) { const [r, c] = rowCard(e.target) || []; if (c) attachPhoto(c, file).then((ok) => { if (ok) setRowImg(r, c); }); return; }
    document.execCommand('insertText', false, (e.clipboardData?.getData('text/plain') || '').replace(/\s+/g, ' '));
  });
  $('#addRow').onclick = addRow;
  $('#checkAll').onclick = async (e) => {
    const b = e.currentTarget; if (b.disabled) return;
    const html = b.innerHTML; b.disabled = true; b.textContent = 'Checking…';
    try {
      await spellCheck(spellItems(d.cards));
      showAllIssues();
      const n = $$('.issue', rows).length;
      if (!n) toast('No mistakes found ✓');
      else { toast(`${n} possible mistake${n === 1 ? '' : 's'} — tap a fix or Ignore`); $('.issue', rows).closest('.edit-row').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    } catch (err) { spellFail(err, true); } finally { if (b.isConnected) { b.disabled = false; b.innerHTML = html; } }
  };
  $('#swapAll').onclick = () => {
    d.cards.forEach((c) => { [c.term, c.def] = [c.def, c.term]; c.updated = Date.now(); });
    save(); toast('Swapped Spanish and English'); deckEdit(id);
  };
  onCleanup(() => {
    clearTimeout(saveTimer); clearTimeout(spellTimer);
    const empty = (c) => !c.term.trim() && !c.def.trim() && !c.img;
    d.cards.filter(empty).forEach((c) => tombstone('cards', c.id));
    d.cards = d.cards.filter((c) => !empty(c));
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
      ${cards.length ? `<table><thead><tr><th>Spanish</th><th>English</th></tr></thead><tbody>${cards.slice(0, 5).map((c) => `<tr><td lang="es">${rich(c.term)}</td><td>${rich(c.def)}</td></tr>`).join('')}</tbody></table>${cards.length > 5 ? `<p class="muted small" style="margin-top:6px">…and ${cards.length - 5} more</p>` : ''}` : ''}`;
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
  let cs = d.cards.filter(isValid);
  if (!(q && q.get('mine'))) cs = cs.filter((c) => !isMine(c));
  if (q && q.get('starred')) { const s = cs.filter((c) => c.starred); if (s.length) return s; }
  return cs;
}
function emptyStudy(d, msg) {
  const valid = d.cards.filter(isValid);
  if (valid.length && valid.every(isMine)) {
    render(`<div class="empty-state"><div class="big-ic">${I.trophy}</div><h2>¡Todas son tuyas!</h2><p>Every word in this deck is one of your words, so there's nothing left to practice. To go over them anyway, turn on <b>Practice my words too</b> on the deck page.</p><a class="btn primary" href="#/deck/${d.id}">Back to deck</a></div>`);
    return;
  }
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
  return `<div class="q-card"><span class="face-label">${hint}</span>${showImg(it.c, it.promptEs) ? photoTag(it.c, 'q-img') : ''}<div class="q-text" ${langAttr(it.promptEs)}>${rich(it.prompt)}</div>${it.promptEs ? sayBtn(it.prompt) : ''}</div>`;
}

function mcQuestion(el, it, options, done) {
  el.innerHTML = `
    ${questionCard(it, `Choose the ${it.promptEs ? 'English' : 'Spanish'}`)}
    <div class="options">${options.map((o, k) => `<button type="button" class="option" data-k="${k}" ${langAttr(!it.promptEs)}><span class="okey">${k + 1}</span><span>${rich(o)}</span></button>`).join('')}</div>
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
    else feedback(el, 'bad', `The answer is <b ${langAttr(!it.promptEs)}>${rich(it.answer)}</b>`, () => done(false));
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
    const A = `<b ${langAttr(ansEs)}>${rich(it.answer)}</b>`;
    if (state.settings.autoSpeak && ansEs) speak(it.answer);
    if (res === 'correct') {
      markPass(it.c, 'wr', true);
      inp.classList.add('ok'); feedback(el, 'good', praise()); later(() => done(true), 850);
    } else if (res === 'accent' && !state.settings.strictAccents) {
      inp.classList.add('ok'); feedback(el, 'warn', `Almost! Watch the accents: ${A}`, () => done(true));
    } else if (res === 'typo') {
      inp.classList.add('ok'); feedback(el, 'warn', `Close enough — check the spelling: ${A}`, () => done(true));
    } else {
      inp.classList.add('bad'); markPass(it.c, 'wr', false);
      const extra = given ? '<button class="btn ghost" type="button" id="override">I was right</button>' : '';
      feedback(el, 'bad', `${given ? `You wrote <s>${esc(given)}</s><br>` : ''}The answer is ${A}${res === 'accent' ? '<br><span class="muted small">Accents count because strict mode is on.</span>' : ''}`, () => done(false), extra);
      const ov = $('#override', el);
      if (ov) ov.onclick = () => { keyHandler = null; markPass(it.c, 'wr', true); done(true); };
    }
  };
  $('form', el).onsubmit = (e) => { e.preventDefault(); if (answered) return; const v = inp.value.trim(); if (!v) { inp.focus(); return; } submit(v); };
  $('#idk', el).onclick = () => submit('');
}

function faceHtml(c, text, isEs, front) {
  const pic = showImg(c, isEs);
  return `<div class="face-inner ${pic ? 'with-img' : ''}">${pic ? photoTag(c, 'face-img') : ''}<span class="face-label">${isEs ? 'Español' : 'English'}</span><div class="face-text ${plain(text).length > 36 ? 'long' : ''}" ${langAttr(isEs)}>${rich(text)}</div><div class="face-actions">${isEs ? sayBtn(text) : ''}${front ? starBtn(c) : ''}</div></div>`;
}

/* ---------- views: flashcards ---------- */
function flashView(id, q) {
  const d = getDeck(id); if (!d) return; const t0 = Date.now();
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
      (ok ? known : missed).push(it.c); markPass(it.c, 'fc', ok); practice(it.c, ok);
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
      ${wonHtml(t0)}
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
  const d = getDeck(id); if (!d) return; const t0 = Date.now();
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
      ${wonHtml(t0)}
      ${hard.length ? `<div class="card-list compact">${hard.slice(0, 10).map((x) => `<div class="card-row"><div class="cr-text"><div class="cr-term" lang="es">${rich(x.c.term)}</div><div class="cr-def">${rich(x.c.def)}</div></div><span class="pill bad">${x.wrong}×</span></div>`).join('')}</div>` : ''}
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
  const d = getDeck(id); if (!d) return; const t0 = Date.now();
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
      ${wonHtml(t0)}
      ${wrong.length ? `<div class="card-list compact">${wrong.map((c) => `<div class="card-row"><div class="cr-text"><div class="cr-term" lang="es">${rich(c.term)}</div><div class="cr-def">${rich(c.def)}</div></div>${sayBtn(c.term)}</div>`).join('')}</div>` : '<p class="muted">Not a single mistake. ¡Increíble!</p>'}
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
      <div class="match-grid" id="grid">${tiles.map((t, k) => `<button type="button" class="tile ${t.es ? 'es' : ''}" data-k="${k}" ${langAttr(t.es)}>${rich(t.text)}</button>`).join('')}</div>`);
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
  let done = 0; let lapses = 0; const t0 = Date.now();

  if (!queue.length) {
    const decks = deckId ? [deck] : state.decks;
    const newLeft = decks.reduce((s, d) => s + d.cards.filter((c) => isValid(c) && !isMine(c) && !c.srs.last).length, 0);
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
    if (qv === 0) markPass(c, 'fc', false); else if (qv >= 2) markPass(c, 'fc', true);
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
      <div class="q-card"><span class="face-label">${isNew ? '<span class="tag new">NEW</span> ' : ''}${deckId ? '' : esc(d.name)}</span>${showImg(c, it.promptEs) ? photoTag(c, 'q-img') : ''}<div class="q-text" ${langAttr(it.promptEs)}>${rich(it.prompt)}</div>${it.promptEs ? sayBtn(it.prompt) : ''}</div>
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
      if (res === 'correct') markPass(c, 'wr', true); else if (given && !ok) markPass(c, 'wr', false);
      const suggested = given ? (ok ? (res === 'correct' ? 2 : 1) : 0) : -1;
      let note = '';
      if (given && !ok) note = `<p class="muted">You wrote <s>${esc(given)}</s></p>`;
      else if (res === 'accent') note = '<p class="muted">Right word — watch the accents.</p>';
      else if (res === 'typo') note = '<p class="muted">Close — check the spelling.</p>';
      const labels = [['Again', 'again'], ['Hard', 'hard'], ['Good', 'good'], ['Easy', 'easy']];
      $('#reveal').innerHTML = `
        <div class="answer-card"><span class="face-label">Answer</span>${showImg(c, ansEs) ? photoTag(c, 'a-img') : ''}<div class="a-text" ${langAttr(ansEs)}>${rich(it.answer)}</div>${ansEs ? sayBtn(it.answer) : ''}${note}</div>
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
      ${wonHtml(t0)}
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
function aiPanelHtml(err = '', ok = '') {
  if (ai.key) {
    return `<h3>Story time (Google Gemini)</h3>
      <div class="sync-status good">${I.check} Gemini key saved${ai.model ? ` · using ${esc(ai.model)}` : ''}</div>
      ${ok ? `<div class="sync-status good">${I.check} ${esc(ok)}</div>` : ''}
      <p class="muted small">The key stays on this device. Add it on your other devices too if you want Story time there.</p>
      ${err ? `<div class="sync-status bad">${I.alert} ${esc(err)}</div>` : ''}
      <div class="stack"><button class="btn block" type="button" id="aiTest">Test key</button><button class="btn block ghost danger" type="button" id="aiRemove">Remove key</button></div>`;
  }
  return `<h3>Story time (Google Gemini)</h3>
    <p class="muted">Story time writes short stories and sentences with the words you're learning. It uses Google Gemini, which is free with your own key:</p>
    <ol class="install">
      <li><a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Get a free API key</a> in Google AI Studio: sign in with Google, tap <b>Create API key</b>, and copy it.</li>
      <li>Paste it here.</li>
    </ol>
    <form class="answer-form" id="aiForm" autocomplete="off">
      <input id="aiKey" type="password" placeholder="Paste key (AIza… or AQ.…)" autocomplete="off" autocapitalize="off" spellcheck="false">
      <button class="btn primary" type="submit">Save</button>
    </form>
    ${err ? `<div class="sync-status bad">${I.alert} ${esc(err)}</div>` : ''}
    <p class="muted small">The key is stored only on this device (not synced, not in backups). Only the words you practice are sent to Google. On the free tier, Google may use what you send to improve its products.</p>`;
}
function wireAiPanel(panel) {
  const redraw = (err, ok) => { panel.innerHTML = aiPanelHtml(err, ok); };
  panel.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inp = $('#aiKey', panel); const key = inp.value.replace(/[\s"'“”‘’]+/g, ''); if (!key) { inp.focus(); return; }
    const btn = $('button[type=submit]', panel); btn.disabled = true; btn.textContent = 'Checking…';
    try {
      const models = await gemModels(key);
      ai = { key, models, modelsAt: Date.now(), model: '' }; saveAi();
      redraw(models.length ? '' : 'The key works, but no Gemini Flash model is available for it.');
      if (models.length) toast('Gemini key saved — try Story time!');
    } catch (err) {
      redraw(`${gemErrorText(err)} [${key.slice(0, 3)}… ${key.length} characters]`);
    }
  });
  panel.addEventListener('click', async (e) => {
    if (e.target.closest('#aiRemove')) { ai = {}; saveAi(); redraw(); toast('Gemini key removed'); return; }
    const t = e.target.closest('#aiTest'); if (!t) return;
    t.disabled = true; t.textContent = 'Testing… (asking Gemini to write a sentence)';
    try {
      ai.models = await gemModels(ai.key); ai.modelsAt = Date.now(); saveAi();
      if (!ai.models.length) { redraw('The key works, but no Gemini Flash model is available for it.'); return; }
      // A real (tiny) request, since listing models only proves the key exists.
      const text = await gemGenerate('Write one very short, simple Spanish sentence for a beginner. Reply with JSON only: {"es": "...", "en": "..."}');
      let line = '';
      try { const j = JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')); line = j.es ? ` It wrote: “${j.es}”${j.en ? ` (${j.en})` : ''}` : ''; } catch { /* the reply itself is enough */ }
      redraw('', `Test passed — Gemini answered using ${ai.model}.${line}`);
    } catch (err) { redraw(`Test failed: ${gemErrorText(err)}`); }
  });
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
      <div class="field"><span>Photos show on</span>${seg('photoSide', [['en', 'English side'], ['es', 'Spanish side'], ['both', 'Both']], s.photoSide)}</div>
      <div class="field"><span>Typing &amp; quizzes: show first</span>${seg('direction', [['es-en', 'Spanish'], ['en-es', 'English'], ['mixed', 'Mixed']], s.direction)}</div>
      <label class="switch-row"><span><b>Strict accents</b><small>Count “esta” as wrong when the answer is “está”</small></span><input type="checkbox" class="switch" name="strictAccents" ${s.strictAccents ? 'checked' : ''}></label>
      <label class="switch-row"><span><b>Check spelling &amp; grammar as I type</b><small>Flags mistakes when you finish a field in the deck editor (sends the card's words to LanguageTool)</small></span><input type="checkbox" class="switch" name="spellCheck" ${s.spellCheck ? 'checked' : ''}></label>
      <label class="switch-row"><span><b>Auto-translate new cards</b><small>When you finish one side of a card and the other is empty, fill it in (uses Google Translate)</small></span><input type="checkbox" class="switch" name="autoTranslate" ${s.autoTranslate !== false ? 'checked' : ''}></label>
      ${(s.spellIgnore || []).length ? `<button class="btn sm ghost" type="button" id="clearIgnore">Stop ignoring ${s.spellIgnore.length} word${s.spellIgnore.length === 1 ? '' : 's'}</button>` : ''}
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
    <section class="panel" id="aiPanel">${aiPanelHtml()}</section>
    <section class="panel"><h3>Backup</h3>
      <p class="muted">Save a copy of all your cards and progress as a file, or restore one.</p>
      <div class="stack">
        <button class="btn block" type="button" id="backup">${I.download} Save backup file</button>
        <label class="btn block ghost file-btn">${I.upload} Restore from backup<input type="file" id="restore" accept=".json,application/json" hidden></label>
        <a class="btn block ghost" href="#/dupes">${I.copy} Find &amp; remove duplicates</a>
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
  wireAiPanel($('#aiPanel'));
  if (/[?&]ai=1/.test(location.hash)) { $('#aiPanel').scrollIntoView({ block: 'center' }); const k = $('#aiKey'); if (k) k.focus({ preventScroll: true }); }
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
  const ci = $('#clearIgnore'); if (ci) ci.onclick = () => { s.spellIgnore = []; s.updated = Date.now(); save(); toast('Ignored words cleared'); settingsView(); };
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
