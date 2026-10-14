/* Fit 90 — app logic. State lives in localStorage; UI is rendered from state and driven by delegated events. */
const $ = s => document.querySelector(s);
const KEY = "fit90", DAY = 864e5, PROGRAM_DAYS = 84;
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
let S = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const iso = d => { const x = new Date(d); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (s, i) => { const d = parse(s); d.setDate(d.getDate() + i); return iso(d); };
const fmt = (s, o = { weekday: "short", day: "numeric", month: "short" }) => parse(s).toLocaleDateString(undefined, o);
const dayIdx = date => Math.round((parse(date) - parse(S.start)) / DAY);
const pct = (a, b) => (b ? Math.min(100, Math.round((a / b) * 100)) : 0);
const buzz = () => { try { navigator.vibrate && navigator.vibrate(8); } catch {} };
const todayStr = () => iso(new Date());
let tab = "today", view = todayStr(), lastKey = "", draft = {}, step = 0, toastUndo = null, askDef = null;

/* ---------- data helpers ---------- */
const log = d => { S.logs = S.logs || {}; return S.logs[d] || (S.logs[d] = { water: 0, meals: {}, ex: {} }); };
const readLog = d => (S.logs || {})[d] || { water: 0, meals: {}, ex: {} };
const mealsFor = n => {
  const i = ((n % 7) + 7) % 7, base = MEAL_DAYS[i].slice();
  if (S.diet === "nonveg") Object.entries(NONVEG_SWAPS[i] || {}).forEach(([k, v]) => (base[+k] = v));
  return base;
};
const phaseIdx = n => Math.min(2, Math.max(0, Math.floor(n / 28)));
const exFor = n => EX_WEEK[phaseIdx(n)][((n % 7) + 7) % 7];
const effMode = () => (S.mode && S.mode !== "auto" ? S.mode : autoMode(S.age || 30));
const kcalPlan = n => mealsFor(n).reduce((a, m) => a + m.k, 0);
const kcalEaten = (d, n) => { const L = readLog(d); return mealsFor(n).reduce((a, m, i) => a + (L.meals[MEAL_SLOTS[i].id] ? m.k : 0), 0); };
const dayScore = d => {
  const n = dayIdx(d), L = readLog(d), e = exFor(n);
  const done = MEAL_SLOTS.filter(m => L.meals[m.id]).length + e.items.filter((_, i) => L.ex[i]).length + (L.water >= S.waterGoal ? 1 : 0);
  return pct(done, MEAL_SLOTS.length + e.items.length + 1);
};
const streak = () => { let c = 0; for (let i = 0; i < PROGRAM_DAYS; i++) { const d = addDays(todayStr(), -i); if (dayScore(d) >= 70) c++; else if (i > 0) break; } return c; };
const weekScore = () => Math.round([...Array(7)].reduce((a, _, i) => a + dayScore(addDays(todayStr(), -i)), 0) / 7);
const lastWeight = () => (S.weights && S.weights.length ? S.weights[S.weights.length - 1].kg : S.startWeight);
const bmiOf = (kg, cm) => kg / Math.pow(cm / 100, 2);
const clampView = d => { const n = dayIdx(d); return n < 0 ? S.start : n >= PROGRAM_DAYS ? addDays(S.start, PROGRAM_DAYS - 1) : d; };

/* ---------- theme ---------- */
const mq = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
function applyTheme() {
  const t = S.theme || (S.dark ? "dark" : "auto"), dark = t === "dark" || (t === "auto" && mq && mq.matches);
  document.body.classList.toggle("dark", dark);
  $("#tc").content = dark ? "#000000" : "#f2f2f7";
}
mq && mq.addEventListener && mq.addEventListener("change", applyTheme);

/* ---------- sheet, dialogs, toast ---------- */
let sheetResolve = null, lastFocus = null, pendingVal = null;
function openSheet(html, resolve) {
  const o = $("#sheet"); lastFocus = document.activeElement; sheetResolve = resolve || null;
  o.innerHTML = `<div class="sheet-in" tabindex="-1"><div class="grab"></div>${html}</div>`;
  o.classList.add("show"); o.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
  try { history.pushState({ sheet: 1 }, ""); } catch {}
  const f = o.querySelector("input") || o.querySelector("[data-act=close]") || o.firstChild; f && f.focus && f.focus({ preventScroll: true });
  o.firstChild.scrollTop = 0;
}
function hideSheet(val = null) {
  const o = $("#sheet"); if (!o.classList.contains("show")) return;
  o.classList.remove("show"); o.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
  const r = sheetResolve; sheetResolve = null; r && r(val);
  lastFocus && document.contains(lastFocus) && lastFocus.focus({ preventScroll: true });
}
function closeSheet(val = null) { if (history.state && history.state.sheet) { pendingVal = val; history.back(); } else hideSheet(val); }
window.addEventListener("popstate", () => { hideSheet(pendingVal); pendingVal = null; });
document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#sheet").classList.contains("show")) closeSheet(); });

function ask({ title, desc, fields = [], ok = "Save", danger = false }) {
  return new Promise(res => {
    askDef = fields;
    openSheet(`<h1 style="font-size:24px">${title}</h1>${desc ? `<p class="mu">${desc}</p>` : ""}<form id="af" novalidate>${fields.map(f => `<label for="f_${f.id}">${f.label}</label><input id="f_${f.id}" name="${f.id}" type="${f.type || "text"}" inputmode="${f.mode || "text"}" value="${f.value ?? ""}" ${f.step ? `step="${f.step}"` : ""} autocomplete="off">`).join("")}<div class="err" id="aerr" aria-live="polite"></div><div class="row" style="margin-top:12px"><button type="button" class="btn alt grow" data-act="close">Cancel</button><button class="btn grow ${danger ? "danger" : ""}" type="submit">${ok}</button></div></form>`, res);
  });
}
let tt;
function toast(msg, undo) {
  const t = $("#toast"); toastUndo = undo || null;
  t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button data-act="undo">Undo</button>' : ""}`;
  t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), undo ? 5000 : 2600);
}

/* ---------- reminders (native only) ---------- */
const LN = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
async function setReminders(on) {
  const ln = LN();
  if (!ln) { toast("Reminders work in the installed Android app"); return false; }
  try {
    const ids = [...MEAL_SLOTS.map((_, i) => ({ id: i + 1 })), ...[9, 11, 13, 15, 17, 19, 21].map(h => ({ id: 100 + h }))];
    await ln.cancel({ notifications: ids });
    if (!on) return true;
    const perm = await ln.requestPermissions();
    if (perm.display !== "granted") { toast("Notification permission denied"); return false; }
    const times = [[6, 30], [8, 30], [11, 0], [13, 30], [17, 0], [19, 30]];
    const meals = MEAL_SLOTS.map((m, i) => ({ id: i + 1, title: m.icon + " " + m.name, body: "Time for your planned meal. Tick it off in Fit 90!", schedule: { on: { hour: times[i][0], minute: times[i][1] }, allowWhileIdle: true } }));
    const water = [9, 11, 13, 15, 17, 19, 21].map(h => ({ id: 100 + h, title: "💧 Drink water", body: "Have a glass of water and log it.", schedule: { on: { hour: h, minute: 0 }, allowWhileIdle: true } }));
    await ln.schedule({ notifications: meals.concat(water) });
    return true;
  } catch (e) { toast("Could not set reminders"); return false; }
}

/* ---------- icons (Lucide-style, stroke) ---------- */
const IC = {
  sunrise: '<path d="M12 2v6"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  coffee: '<path d="M10 2v2M14 2v2M6 2v2"/><path d="M16 8h1a4 4 0 0 1 0 8h-1"/><path d="M4 8h12v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/>',
  apple: '<path d="M12 7c-1.5-2-4-2.500-6-1.200C3 7.800 3.500 13 6 17c1.500 2.500 3 4 5 3.200.700-.300 1.300-.300 2 0 2 .800 3.500-.700 5-3.200 2.500-4 3-9.200 0-11.200-2-1.300-4.500-.800-6 1.200z"/><path d="M12 7c0-2 1-4 3-5"/>',
  utensils: '<path d="M3 2v7a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2"/><path d="M6 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3zm0 0v7"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.800 6.100C15.500 5 17 4.480 19 2c1 2 2 4.180 2 8 0 5.500-4.780 10-10 10z"/><path d="M2 21c0-3 1.850-5.360 5.080-6C9.500 14.520 12 13 13 12"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
  drop: '<path d="M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z"/>',
  flame: '<path d="M8.500 14.500A2.500 2.500 0 0 0 11 12c0-1.380-.5-2-1-3-1.070-2.140-.22-4.050 2-6 .5 2.500 2 4.900 4 6.500 2 1.600 3 3.500 3 5.500a7 7 0 1 1-14 0c0-1.150.43-2.290 1-3a2.500 2.500 0 0 0 2.500 2.500z"/>',
  dumbbell: '<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.700 1.500-2.500 1-.9 1.500-2.200 1.500-3.500A6 6 0 0 0 6 8c0 1 .2 2.200 1.500 3.500.7.700 1.300 1.500 1.500 2.500"/><path d="M9 18h6M10 22h4"/>',
  chart: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
};
const ico = (n, cls = "") => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
const SLOT_ICON = { wake: "sunrise", bf: "coffee", mid: "apple", lunch: "utensils", eve: "leaf", dinner: "moon" };

/* ---------- small UI builders ---------- */
const ring = (p, color, s, inner) => { const r = (s - 16) / 2, C = 2 * Math.PI * r; return `<div class="ring" style="--s:${s}px"><svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" aria-hidden="true"><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" style="stroke:${color};stroke-opacity:.18" stroke-width="14"/><circle class="fg" cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" style="stroke:${color}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p / 100)}"/></svg><div class="c">${inner}</div></div>`; };
const bar = (p, cls = "") => `<div class="bar ${cls}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><i style="width:${p}%"></i></div>`;
const seg = (act, opts, cur, label) => `<div class="seg" role="group" aria-label="${label}">${opts.map(([v, t]) => `<button type="button" data-act="${act}" data-v="${v}" aria-pressed="${v === cur}">${t}</button>`).join("")}</div>`;
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

function dayNav(n) {
  const t = todayStr(), isToday = view === t;
  const lbl = n >= PROGRAM_DAYS ? "Program complete 🎉" : `Day ${n + 1} of ${PROGRAM_DAYS} · Week ${Math.floor(n / 7) + 1}`;
  const week = [...Array(7)].map((_, i) => {
    const idx = Math.floor(Math.max(0, n) / 7) * 7 + i; if (idx >= PROGRAM_DAYS) return `<span></span>`;
    const d = addDays(S.start, idx), sc = d <= t ? dayScore(d) : -1;
    return `<button data-act="pick" data-v="${d}" ${d === view ? 'aria-current="date"' : ""} aria-label="${fmt(d)}, ${sc < 0 ? "upcoming" : sc + "% complete"}"><span>${fmt(d, { weekday: "narrow" })}</span><b>${parse(d).getDate()}</b><i class="${sc >= 70 ? "g" : sc > 0 ? "p" : ""}"></i></button>`;
  }).join("");
  return `<div class="dayhead"><button class="icon-btn" data-act="day" data-v="-1" aria-label="Previous day" ${n <= 0 ? 'aria-disabled="true"' : ""}>‹</button>
  <div class="t"><b>${isToday ? "Today" : fmt(view)}</b><div class="mu">${lbl}</div>${!isToday && dayIdx(t) >= 0 && dayIdx(t) < PROGRAM_DAYS ? '<button class="pill" data-act="today" style="margin-top:4px">Back to today</button>' : ""}</div>
  <button class="icon-btn" data-act="day" data-v="1" aria-label="Next day" ${n >= PROGRAM_DAYS - 1 ? 'aria-disabled="true"' : ""}>›</button></div><div class="week" role="group" aria-label="This week">${week}</div>`;
}

/* ---------- views ---------- */
function viewToday(n, d) {
  const L = readLog(d), ex = exFor(n), ph = PHASES[phaseIdx(n)], isToday = d === todayStr();
  const mDone = MEAL_SLOTS.filter(m => L.meals[m.id]).length, eDone = ex.items.filter((_, i) => L.ex[i]).length;
  const overall = dayScore(d), M = mealsFor(n);
  let next = "";
  if (mDone === 6) next = `<div class="card"><b>All meals logged 🎉</b><div class="mu">Great job staying on plan today.</div></div>`;
  else {
    const times = [390, 510, 660, 810, 1020, 1170], now = new Date(), mins = now.getHours() * 60 + now.getMinutes();
    const open = MEAL_SLOTS.map((_, i) => i).filter(i => !L.meals[MEAL_SLOTS[i].id]);
    const i = isToday ? (open.find(k => times[k] >= mins - 60) ?? open[0]) : open[0], s = MEAL_SLOTS[i];
    next = `<div class="card"><div class="mu sm">${isToday ? "UP NEXT" : "NOT YET LOGGED"}</div><div class="row" style="margin-top:6px"><span class="bigic-wrap">${ico(SLOT_ICON[s.id], "bigic")}</span><div class="grow"><b>${s.name} · ${s.time}</b><div class="mu">${esc(M[i].t)} · ${M[i].k} kcal</div></div></div><button class="btn alt block" style="margin-top:12px" data-act="meal" data-id="${s.id}">Mark as eaten</button></div>`;
  }
  const pre = dayIdx(todayStr()) < 0 ? `<div class="card"><b>Your program starts ${fmt(S.start)}</b><div class="mu">You can preview the plan until then.</div></div>` : "";
  return `<h1>${greeting()}, ${esc(S.name)}</h1><p class="mu">${ph.name} · ${ph.goal}</p>${dayNav(n)}${pre}
  <div class="card row" style="gap:16px">${ring(overall, "var(--pr)", 120, `<b>${overall}%</b><span class="mu sm">done</span>`)}<div class="grow"><b>${isToday ? "Today's progress" : "Day progress"}</b><div class="mu">${mDone}/6 meals<br>${L.water}/${S.waterGoal} ml water<br>${eDone}/${ex.items.length} exercises</div></div></div>
  <div class="cols">${next}
  <div class="card"><div class="row sp"><b>${ico("drop", "hi w")}Water</b><span class="mu">${L.water} / ${S.waterGoal} ml</span></div>${bar(pct(L.water, S.waterGoal), "w")}<div class="row" style="margin-top:12px"><button class="wbtn" data-act="water" data-v="250">+250 ml</button><button class="wbtn alt" data-act="water" data-v="500">+500 ml</button></div></div>
  <div class="card"><div class="row sp"><b>${ico("flame", "hi o")}Calories</b><span class="mu">${kcalEaten(d, n)} / ${kcalPlan(n)} kcal</span></div>${bar(pct(kcalEaten(d, n), kcalPlan(n)))}</div>
  <button class="card tap" data-act="goto" data-v="exercise"><div class="row sp"><b>${ico("dumbbell", "hi")}${esc(ex.title)}</b><span class="mu">${ex.rest ? "Rest day" : eDone + "/" + ex.items.length}</span></div><div class="mu" style="margin-top:4px">${MODES[effMode()].name} mode · tap for guided exercises</div></button>
  <div class="card tiles span2"><div><div class="stat">${streak()}</div><div class="mu sm">day streak</div></div><div><div class="stat">${weekScore()}%</div><div class="mu sm">7-day score</div></div><div><div class="stat">${lastWeight()}</div><div class="mu sm">kg now</div></div></div>
  <div class="card span2"><b>${ico("bulb", "hi o")}Tip of the day</b><div class="mu" style="font-size:15px;margin-top:4px">${TIPS[((n % TIPS.length) + TIPS.length) % TIPS.length]}</div></div></div>`;
}

function viewMeals(n, d) {
  const L = readLog(d), M = mealsFor(n), mDone = MEAL_SLOTS.filter(m => L.meals[m.id]).length;
  return `<h1>Meal Plan</h1><p class="mu">${S.diet === "nonveg" ? "Veg + non-veg" : "Vegetarian"} · ${kcalPlan(n)} kcal planned</p>${dayNav(n)}
  <div class="card"><div class="row sp"><b>${mDone}/6 meals</b><span class="mu">${kcalEaten(d, n)} kcal eaten</span></div>${bar(pct(mDone, 6))}</div>
  <div class="card">${MEAL_SLOTS.map((s, i) => `<button class="item ${i === 0 ? "first" : ""} ${L.meals[s.id] ? "done on" : ""}" data-act="meal" data-id="${s.id}" role="checkbox" aria-checked="${!!L.meals[s.id]}"><span class="ic" aria-hidden="true">${ico(SLOT_ICON[s.id])}</span><span class="b"><b>${s.name} <span class="mu">· ${s.time}</span></b><span class="t">${esc(M[i].t)}</span><span class="mu sm" style="display:block">${M[i].k} kcal</span></span><span class="chk" aria-hidden="true">${L.meals[s.id] ? "✓" : ""}</span></button>`).join("")}</div>`;
}

function viewWater(n, d) {
  const L = readLog(d), p = pct(L.water, S.waterGoal), days = [...Array(7)].map((_, i) => addDays(d, i - 6));
  const max = Math.max(S.waterGoal, ...days.map(x => readLog(x).water));
  return `<h1>Water</h1><p class="mu">Stay hydrated — it helps control hunger and energy.</p>${dayNav(n)}
  <div class="card">${ring(p, "var(--wa)", 200, `<b style="color:var(--wa)">${L.water}</b><span class="mu">of ${S.waterGoal} ml</span>`)}
  <div class="mu" style="text-align:center;margin-bottom:12px" aria-live="polite">${L.water >= S.waterGoal ? "🎉 Goal reached!" : S.waterGoal - L.water + " ml to go · ≈ " + Math.ceil((S.waterGoal - L.water) / 250) + " glasses"}</div>
  <div class="row"><button class="wbtn alt" data-act="water" data-v="150">+150</button><button class="wbtn" data-act="water" data-v="250">+250</button><button class="wbtn" data-act="water" data-v="500">+500</button></div>
  <div class="row" style="margin-top:10px"><button class="wbtn alt" data-act="water" data-v="-250">−250</button><button class="wbtn alt" data-act="wcustom">Custom…</button></div></div>
  <h2>Last 7 days</h2><div class="card"><div class="hist" role="img" aria-label="Water intake for the last 7 days">${days.map(x => { const v = readLog(x).water; return `<div><i style="height:${Math.round((v / max) * 70)}px"></i><span>${fmt(x, { weekday: "narrow" })}</span><span>${(v / 1000).toFixed(1)}L</span></div>`; }).join("")}</div></div>`;
}

function viewEx(n, d) {
  const L = readLog(d), e = exFor(n), ph = PHASES[phaseIdx(n)], mode = effMode(), M = MODES[mode];
  const done = e.items.filter((_, i) => L.ex[i]).length, all = done === e.items.length;
  return `<h1>Workout</h1><p class="mu">${ph.name} (${ph.weeks})</p>${dayNav(n)}
  <div class="card"><b>Exercise mode: ${M.name}</b><div class="mu">${S.mode && S.mode !== "auto" ? "Chosen by you" : "Auto for age " + S.age} · ${M.note}</div><div style="margin-top:12px">${seg("mode", Object.keys(MODES).map(k => [k, MODES[k].name]), mode, "Exercise mode")}</div>${S.mode && S.mode !== "auto" ? `<button class="pill" style="margin-top:10px" data-act="mode" data-v="auto">Use auto for my age</button>` : ""}</div>
  ${all ? `<div class="card"><b>${e.rest ? "Recovery complete" : "Workout complete"} 🎉</b><div class="mu">Nice work — rest and hydrate.</div></div>` : ""}
  <div class="card"><div class="row sp"><h3>${esc(e.title)}</h3>${e.rest ? '<span class="tag">REST DAY</span>' : `<span class="mu">${done}/${e.items.length}</span>`}</div>${e.rest ? '<p class="mu">Active recovery helps your body burn fat and build strength. Keep it light today.</p>' : ""}` +
    e.items.map((t, i) => { const k = guideKey(t), on = !!L.ex[i]; return `<div class="item ${i === 0 ? "first" : ""} ${on ? "done on" : ""}"><div class="b t">${esc(adaptText(t, mode))}${k ? `<div><button class="how" data-act="guide" data-v="${k}" aria-label="How to do ${esc(GUIDES[k].n)}">▶ How to do it</button></div>` : ""}</div><button class="chkb" data-act="ex" data-v="${i}" role="checkbox" aria-checked="${on}" aria-label="Mark ${esc(adaptText(t, mode))} done"><span class="chk" aria-hidden="true">${on ? "✓" : ""}</span></button></div>`; }).join("") + `</div>
  <p class="mu" style="margin:0 4px">Tap “How to do it” for a diagram and tips for women. Warm up first, and stop if you feel pain.</p>`;
}

function chart() {
  const w = S.weights, W = 360, H = 180, L = 36, R = 12, T = 12, B = 24;
  if (w.length < 2) return `<p class="mu">Log your weight once a week to see your trend here.</p>`;
  const vs = w.map(x => x.kg).concat(S.goalWeight), mn = Math.floor(Math.min(...vs) - 1), mx = Math.ceil(Math.max(...vs) + 1);
  const t0 = +parse(w[0].date), t1 = +parse(w[w.length - 1].date) || t0 + 1;
  const x = d => L + ((+parse(d) - t0) / (t1 - t0)) * (W - L - R), y = v => T + (1 - (v - mn) / (mx - mn)) * (H - T - B);
  const grid = [0, 1, 2].map(i => { const v = mn + ((mx - mn) * i) / 2; return `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--bd)"/><text x="${L - 6}" y="${y(v) + 3}" text-anchor="end">${v.toFixed(0)}</text>`; }).join("");
  const pts = w.map(p => x(p.date) + "," + y(p.kg)).join(" "), last = w[w.length - 1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Weight trend from ${w[0].kg} kg to ${last.kg} kg, goal ${S.goalWeight} kg">${grid}<line x1="${L}" x2="${W - R}" y1="${y(S.goalWeight)}" y2="${y(S.goalWeight)}" stroke="var(--ac)" stroke-dasharray="4 3"/><text x="${W - R}" y="${y(S.goalWeight) - 4}" text-anchor="end" style="fill:var(--ac)">Goal ${S.goalWeight}</text><polyline fill="none" stroke="var(--pr)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${pts}"/>${w.map(p => `<circle cx="${x(p.date)}" cy="${y(p.kg)}" r="3.5" style="fill:var(--pr)"/>`).join("")}<text x="${L}" y="${H - 6}">${fmt(w[0].date, { day: "numeric", month: "short" })}</text><text x="${W - R}" y="${H - 6}" text-anchor="end">${fmt(last.date, { day: "numeric", month: "short" })}</text></svg>`;
}

function viewProgress() {
  const cur = lastWeight(), lost = (S.startWeight - cur).toFixed(1), toGo = Math.max(0, cur - S.goalWeight).toFixed(1);
  const bmi = bmiOf(cur, S.height), cat = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese";
  const lo = (18.5 * Math.pow(S.height / 100, 2)).toFixed(0), hi = (24.9 * Math.pow(S.height / 100, 2)).toFixed(0);
  const tot = Math.max(0.1, S.startWeight - S.goalWeight), hist = S.weights.slice().reverse().slice(0, 8);
  const th = S.theme || (S.dark ? "dark" : "auto");
  return `<h1>Progress</h1><p class="mu">Started at ${S.startWeight} kg · goal ${S.goalWeight} kg</p>
  <div class="card"><div class="tiles"><div><div class="stat">${cur}</div><div class="mu sm">kg now</div></div><div><div class="stat">${lost}</div><div class="mu sm">kg lost</div></div><div><div class="stat">${toGo}</div><div class="mu sm">kg to go</div></div></div>${bar(Math.max(0, pct(S.startWeight - cur, tot)))}</div>
  <div class="cols"><div class="card"><div class="row sp"><b>BMI</b><span>${bmi.toFixed(1)} · <span class="tag">${cat}</span></span></div><div class="mu" style="margin-top:6px">Healthy range for your height: ${lo}–${hi} kg</div></div>
  <div class="card"><form id="wf" novalidate><label for="lw" style="margin-top:0">Log today's weight (kg)</label><div class="row"><input id="lw" type="number" inputmode="decimal" step="0.1" placeholder="${cur}"><button class="btn" type="submit">Save</button></div><div class="err" id="werr" aria-live="polite"></div></form></div>
  <div class="card span2"><b>Weight trend</b><div style="margin-top:8px">${chart()}</div></div>
  <div class="card span2"><b>History</b><div class="list" style="margin-top:6px">${hist.map((h, i) => `<div class="li"><span>${fmt(h.date, { day: "numeric", month: "short", year: "numeric" })}</span><span class="row"><b>${h.kg} kg</b>${i < hist.length - 1 || S.weights.length > hist.length ? `<button class="pill" data-act="delw" data-v="${h.date}" aria-label="Delete entry ${h.date}">Delete</button>` : ""}</span></div>`).join("")}</div></div></div>
  <h2>Settings</h2>
  <div class="card list"><div class="li"><span>Appearance</span></div><div style="padding-bottom:8px">${seg("theme", [["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]], th, "Appearance")}</div>
  <div class="li"><span>Diet</span></div><div style="padding-bottom:8px">${seg("diet", [["veg", "Vegetarian"], ["nonveg", "Veg + Non-veg"]], S.diet || "veg", "Diet")}</div>
  <div class="li"><span id="rl">Reminders (water + meals)</span><button class="sw" role="switch" aria-checked="${!!S.remind}" aria-labelledby="rl" data-act="remind"></button></div>
  <button class="li btnrow" data-act="age"><span>Age</span><span class="v">${S.age || "-"}</span></button>
  <button class="li btnrow" data-act="wgoal"><span>Daily water goal</span><span class="v">${S.waterGoal} ml</span></button>
  <button class="li btnrow" data-act="reset"><span style="color:var(--rd)">Reset all data</span></button></div>
  <p class="mu sm" style="text-align:center">Fit 90 · for general wellness, not medical advice.</p>`;
}

/* ---------- onboarding ---------- */
const dots = () => `<div class="steps" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div>`;
function renderSetup() {
  const d = draft;
  const nav = (back, label) => `<div class="row" style="margin-top:18px">${back ? '<button class="btn alt" data-act="sback">Back</button>' : ""}<button class="btn grow" data-act="snext">${label}</button></div>`;
  let h = "";
  if (step === 0) h = `<div style="text-align:center;padding-top:6vh"><div aria-hidden="true">${ico("leaf", "hero-ico")}</div><h1 style="margin-top:16px">Fit 90</h1><p class="mu" style="font-size:17px">Your 3-month weight loss program</p></div>
    <div class="card list"><div class="li"><span>${ico("utensils","hi")}Daily meal plan, veg or non-veg</span></div><div class="li"><span>${ico("drop","hi w")}Water tracker with reminders</span></div><div class="li"><span>${ico("dumbbell","hi")}Guided workouts for every age</span></div><div class="li"><span>${ico("chart","hi")}Weight, BMI and streak tracking</span></div></div>${nav(false, "Get started")}`;
  if (step === 1) h = `${dots()}<h1>About you</h1><p class="mu">We use your age to pick the right exercise intensity.</p><div class="card"><label for="sn" style="margin-top:0">First name</label><input id="sn" value="${esc(d.name || "")}" autocomplete="given-name" placeholder="Optional"><label for="sa">Age</label><input id="sa" type="number" inputmode="numeric" value="${d.age || ""}" placeholder="e.g. 32"><div class="err" id="serr" aria-live="polite"></div></div>${nav(true, "Continue")}`;
  if (step === 2) h = `${dots()}<h1>Your body</h1><p class="mu">Used to track progress and calculate BMI.</p><div class="card"><label for="sw" style="margin-top:0">Current weight (kg)</label><input id="sw" type="number" inputmode="decimal" step="0.1" value="${d.w || ""}"><label for="sg">Goal weight (kg)</label><input id="sg" type="number" inputmode="decimal" step="0.1" value="${d.g || ""}"><label for="sh">Height (cm)</label><input id="sh" type="number" inputmode="decimal" value="${d.h || ""}"><div class="hint" id="bmih" aria-live="polite"></div><div class="err" id="serr" aria-live="polite"></div></div>${nav(true, "Continue")}`;
  if (step === 3) h = `${dots()}<h1>Your plan</h1><p class="mu">Almost done — choose how you like to eat and drink.</p><div class="card"><label style="margin-top:0">Diet</label>${seg("sdiet", [["veg", "Vegetarian"], ["nonveg", "Veg + Non-veg"]], d.diet || "veg", "Diet")}<label>Daily water goal</label>${seg("swater", [[2000, "2 L"], [2500, "2.5 L"], [3000, "3 L"], [3500, "3.5 L"]], d.water || 3000, "Daily water goal")}<label for="ss">Program start date</label><input id="ss" type="date" value="${d.start || todayStr()}"><div class="row sp" style="margin-top:16px"><span id="rl2">Remind me to eat and drink</span><button class="sw" role="switch" aria-checked="${!!d.remind}" aria-labelledby="rl2" data-act="sremind"></button></div><div class="err" id="serr" aria-live="polite"></div></div>${nav(true, "Start my 90 days")}`;
  $("#app").innerHTML = `<div class="page">${h}</div>`;
  if (step === 2) bmiHint();
}
function bmiHint() {
  const w = +$("#sw").value, h = +$("#sh").value, g = +$("#sg").value, el = $("#bmih"); if (!el) return;
  el.textContent = w && h ? `BMI ${bmiOf(w, h).toFixed(1)}${g ? ` · goal BMI ${bmiOf(g, h).toFixed(1)}` : ""}` : "";
}
function readStep() {
  const v = id => ($("#" + id) ? $("#" + id).value : undefined);
  if (step === 1) { draft.name = v("sn").trim(); draft.age = v("sa"); }
  if (step === 2) { draft.w = v("sw"); draft.g = v("sg"); draft.h = v("sh"); }
  if (step === 3) draft.start = v("ss");
}
function stepOk() {
  const bad = (id, msg) => { const e = $("#" + id); e && e.setAttribute("aria-invalid", "true"); $("#serr").textContent = msg; e && e.focus(); return false; };
  document.querySelectorAll("[aria-invalid]").forEach(e => e.removeAttribute("aria-invalid"));
  if (step === 1 && !(+draft.age >= 14 && +draft.age <= 90)) return bad("sa", "Please enter an age between 14 and 90.");
  if (step === 2) {
    const w = +draft.w, g = +draft.g, h = +draft.h;
    if (!(w >= 30 && w <= 250)) return bad("sw", "Enter your weight between 30 and 250 kg.");
    if (!(g >= 30 && g <= 250)) return bad("sg", "Enter a goal weight between 30 and 250 kg.");
    if (g >= w) return bad("sg", "Your goal should be lower than your current weight.");
    if (!(h >= 100 && h <= 230)) return bad("sh", "Enter your height between 100 and 230 cm.");
    if (bmiOf(g, h) < 18.5) return bad("sg", "That goal is below a healthy BMI. Please choose a higher goal weight.");
  }
  if (step === 3 && !draft.start) return bad("ss", "Please choose a start date.");
  return true;
}
function finishSetup() {
  S = { ...S, name: draft.name || "Champ", age: +draft.age, startWeight: +draft.w, goalWeight: +draft.g, height: +draft.h, waterGoal: draft.water || 3000, diet: draft.diet || "veg", mode: "auto", remind: false, start: draft.start, weights: [{ date: draft.start, kg: +draft.w }], logs: {}, theme: S.theme || "auto" };
  save(); tab = "today"; view = clampView(todayStr()); render();
  if (draft.remind) setReminders(true).then(ok => { S.remind = ok; save(); render(); });
}

/* ---------- render ---------- */
function render() {
  applyTheme();
  document.body.classList.toggle("setup", !S.start);
  const app = $("#app");
  if (!S.start) { renderSetup(); return; }
  document.querySelectorAll("#nav button").forEach(b => b.dataset.tab === tab ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
  const n = dayIdx(view), key = tab + view, same = key === lastKey, y = window.scrollY;
  const fa = document.activeElement, fi = same && app.contains(fa) ? [...app.querySelectorAll("button,input")].indexOf(fa) : -1;
  const html = tab === "progress" ? viewProgress() : (tab === "today" ? viewToday : tab === "meals" ? viewMeals : tab === "water" ? viewWater : viewEx)(n, view);
  app.innerHTML = `<div class="${same ? "" : "page"}">${html}</div>`;
  if (fi >= 0) { const el = [...app.querySelectorAll("button,input")][fi]; el && el.focus({ preventScroll: true }); }
  window.scrollTo(0, same ? y : 0); lastKey = key;
}

/* ---------- actions ---------- */
const setWater = (v, silent) => {
  const L = log(view), was = L.water; L.water = Math.max(0, L.water + v); const delta = L.water - was; save(); buzz(); render();
  if (silent) return;
  if (was < S.waterGoal && L.water >= S.waterGoal) toast("Daily water goal reached 🎉");
  else if (delta) toast((delta > 0 ? "+" : "") + delta + " ml", () => setWater(-delta, true));
};
async function act(a, ds) {
  const v = ds.v;
  switch (a) {
    case "close": return closeSheet();
    case "undo": { const u = toastUndo; $("#toast").classList.remove("show"); u && u(); return; }
    case "day": { const n = dayIdx(view) + +v; if (n < 0 || n >= PROGRAM_DAYS) return; view = addDays(view, +v); return render(); }
    case "today": view = clampView(todayStr()); return render();
    case "pick": view = v; return render();
    case "goto": tab = v; return render();
    case "water": return setWater(+v);
    case "wcustom": { const r = await ask({ title: "Add water", desc: "Enter millilitres. Use a negative number to remove.", fields: [{ id: "ml", label: "Amount (ml)", type: "number", mode: "numeric", value: 330, check: x => (x && Math.abs(+x) <= 3000 ? "" : "Enter an amount up to 3000 ml.") }], ok: "Add" }); if (r) setWater(+r.ml); return; }
    case "meal": { const L = log(view); L.meals[ds.id] = !L.meals[ds.id]; save(); buzz(); return render(); }
    case "ex": { const L = log(view); L.ex[v] = !L.ex[v]; save(); buzz(); return render(); }
    case "guide": return openSheet(guideHTML(v, effMode()));
    case "mode": S.mode = v; save(); return render();
    case "theme": S.theme = v; delete S.dark; save(); return render();
    case "diet": S.diet = v; save(); toast("Meal plan updated"); return render();
    case "remind": { const want = !S.remind, ok = await setReminders(want); if (ok) { S.remind = want; save(); toast(want ? "Reminders on" : "Reminders off"); } return render(); }
    case "age": { const r = await ask({ title: "Your age", desc: "Used to choose your default exercise mode.", fields: [{ id: "age", label: "Age", type: "number", mode: "numeric", value: S.age, check: x => (+x >= 14 && +x <= 90 ? "" : "Enter an age between 14 and 90.") }] }); if (r) { S.age = +r.age; save(); render(); } return; }
    case "wgoal": { const r = await ask({ title: "Daily water goal", fields: [{ id: "ml", label: "Goal (ml)", type: "number", mode: "numeric", value: S.waterGoal, check: x => (+x >= 500 && +x <= 6000 ? "" : "Enter a goal between 500 and 6000 ml.") }] }); if (r) { S.waterGoal = +r.ml; save(); render(); } return; }
    case "delw": { const r = await ask({ title: "Delete entry?", desc: "This removes the weight logged on " + fmt(v) + ".", ok: "Delete", danger: true }); if (r) { S.weights = S.weights.filter(x => x.date !== v); save(); render(); } return; }
    case "reset": { const r = await ask({ title: "Reset all data?", desc: "Your profile, logs and weight history will be permanently deleted from this device.", ok: "Delete everything", danger: true }); if (r) { try { LN() && setReminders(false); } catch {} S = {}; save(); step = 0; draft = {}; render(); } return; }
    case "snext": { readStep(); if (stepOk()) { if (step === 3) return finishSetup(); step++; render(); window.scrollTo(0, 0); } return; }
    case "sback": readStep(); step = Math.max(0, step - 1); return render();
    case "sdiet": readStep(); draft.diet = v; return render();
    case "swater": readStep(); draft.water = +v; return render();
    case "sremind": { readStep(); draft.remind = !draft.remind; return render(); }
  }
}
document.addEventListener("click", e => {
  if (e.target.id === "sheet") return closeSheet();
  const t = e.target.closest("[data-act]"); if (t && t.getAttribute("aria-disabled") !== "true") return act(t.dataset.act, t.dataset);
  const tb = e.target.closest("[data-tab]"); if (tb) { tab = tb.dataset.tab; render(); }
});
document.addEventListener("submit", e => {
  e.preventDefault();
  if (e.target.id === "af") {
    const vals = {}; let err = "";
    (askDef || []).forEach(f => { const x = $("#f_" + f.id).value.trim(); vals[f.id] = x; if (!err && f.check) err = f.check(x); });
    if (err) { $("#aerr").textContent = err; return; }
    closeSheet(vals);
  }
  if (e.target.id === "wf") {
    const v = +$("#lw").value;
    if (!(v >= 20 && v <= 300)) { $("#werr").textContent = "Enter a weight between 20 and 300 kg."; $("#lw").setAttribute("aria-invalid", "true"); return; }
    const t = todayStr(); S.weights = S.weights.filter(x => x.date !== t).concat({ date: t, kg: v }).sort((a, b) => a.date.localeCompare(b.date));
    save(); buzz(); render(); toast("Weight saved");
  }
});
document.addEventListener("input", e => { if (["sw", "sg", "sh"].includes(e.target.id)) bmiHint(); });

/* ---------- boot ---------- */
if (S.start) view = clampView(todayStr());
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
render();
