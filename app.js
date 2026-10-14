const $ = s => document.querySelector(s);
const KEY = "fit90";
const DAY = 864e5;
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
let S = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const iso = d => { const x = new Date(d); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const dayIdx = date => Math.round((parse(date) - parse(S.start)) / DAY);
let tab = "today", view = iso(new Date());

const log = d => { S.logs = S.logs || {}; return S.logs[d] || (S.logs[d] = { water: 0, meals: {}, ex: {} }); };
const mealsFor = n => {
  const i = ((n % 7) + 7) % 7, base = MEAL_DAYS[i].slice();
  if (S.diet === "nonveg") Object.entries(NONVEG_SWAPS[i] || {}).forEach(([k, v]) => (base[+k] = v));
  return base;
};
const exFor = n => { const p = Math.min(2, Math.max(0, Math.floor(n / 28))); return EX_WEEK[p][((n % 7) + 7) % 7]; };
const kcalEaten = (d, n) => mealsFor(n).reduce((a, m, i) => a + (log(d).meals[MEAL_SLOTS[i].id] ? m.k : 0), 0);
const kcalPlan = n => mealsFor(n).reduce((a, m) => a + m.k, 0);
const pct = (a, b) => Math.min(100, Math.round((a / b) * 100));
const lastWeight = () => (S.weights && S.weights.length ? S.weights[S.weights.length - 1].kg : S.startWeight);

const dayScore = d => {
  const n = dayIdx(d), L = (S.logs || {})[d];
  if (!L) return 0;
  const e = exFor(n), done = MEAL_SLOTS.filter(m => L.meals[m.id]).length + e.items.filter((_, i) => L.ex[i]).length + (L.water >= S.waterGoal ? 1 : 0);
  return pct(done, MEAL_SLOTS.length + e.items.length + 1);
};
const back = i => iso(new Date().getTime() - i * DAY);
const streak = () => { let c = 0; for (let i = 0; i < 90; i++) { if (dayScore(back(i)) >= 70) c++; else if (i > 0) break; } return c; };
const weekScore = () => Math.round([...Array(7)].reduce((a, _, i) => a + dayScore(back(i)), 0) / 7);

const LN = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
async function setReminders(on) {
  const ln = LN();
  if (!ln) return alert("Reminders work in the installed Android app.");
  try {
    const ids = [...MEAL_SLOTS.map((_, i) => ({ id: i + 1 })), ...[9, 11, 13, 15, 17, 19, 21].map(h => ({ id: 100 + h }))];
    await ln.cancel({ notifications: ids });
    if (!on) return;
    const perm = await ln.requestPermissions();
    if (perm.display !== "granted") { S.remind = false; save(); return alert("Notification permission denied."); }
    const times = [[6, 30], [8, 30], [11, 0], [13, 30], [17, 0], [19, 30]];
    const meals = MEAL_SLOTS.map((m, i) => ({ id: i + 1, title: m.icon + " " + m.name, body: "Time for your planned meal. Tick it off in Fit 90!", schedule: { on: { hour: times[i][0], minute: times[i][1] }, allowWhileIdle: true } }));
    const water = [9, 11, 13, 15, 17, 19, 21].map(h => ({ id: 100 + h, title: "💧 Drink water", body: "Have a glass of water and log it.", schedule: { on: { hour: h, minute: 0 }, allowWhileIdle: true } }));
    await ln.schedule({ notifications: meals.concat(water) });
  } catch (e) { alert("Could not set reminders: " + e.message); }
}

function applyTheme() { document.body.classList.toggle("dark", !!S.dark); }

function setup() {
  $("#nav").style.display = "none";
  $("#app").innerHTML = `<h1>Welcome to Fit 90 💪</h1><p class="mu">Your 3-month weight loss program with daily meals, water and workouts.</p>
  <div class="card">
  <label>Your name</label><input id="n" placeholder="Name">
  <label>Current weight (kg)</label><input id="w" type="number" inputmode="decimal">
  <label>Goal weight (kg)</label><input id="g" type="number" inputmode="decimal">
  <label>Height (cm)</label><input id="h" type="number" inputmode="decimal">
  <label>Daily water goal (ml)</label><input id="wg" type="number" value="3000">
  <label>Diet</label><select id="df"><option value="veg">Vegetarian</option><option value="nonveg">Veg + Non-veg</option></select>
  <label>Program start date</label><input id="sd" type="date" value="${iso(new Date())}">
  <button class="btn" style="width:100%" id="go">Start my 90 days</button></div>`;
  $("#go").onclick = () => {
    const w = +$("#w").value, g = +$("#g").value, h = +$("#h").value;
    if (!w || !g || !h) return alert("Please enter weight, goal weight and height.");
    S = { ...S, name: $("#n").value || "Champ", startWeight: w, goalWeight: g, height: h, waterGoal: +$("#wg").value || 3000, diet: $("#df").value, remind: false, start: $("#sd").value, weights: [{ date: $("#sd").value, kg: w }], logs: S.logs || {} };
    save(); $("#nav").style.display = ""; view = iso(new Date()); render();
  };
}

function dayNav(n) {
  const t = iso(new Date());
  const lbl = n < 0 ? "Starts in " + -n + " day(s)" : n >= 84 ? "Program complete 🎉" : `Day ${n + 1} of 84 · Week ${Math.floor(n / 7) + 1}`;
  return `<div class="dayhead"><button data-d="-1">‹</button><div style="text-align:center"><b>${view === t ? "Today" : parse(view).toDateString().slice(0, 10)}</b><div class="mu">${lbl}</div></div><button data-d="1">›</button></div>`;
}
function bindNav() { document.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { view = iso(parse(view).getTime() + (+b.dataset.d) * DAY + 3600e3); render(); }); }

function viewToday(n, d) {
  const L = log(d), ph = PHASES[Math.min(2, Math.max(0, Math.floor(n / 28)))], ex = exFor(n);
  const mDone = MEAL_SLOTS.filter(m => L.meals[m.id]).length, eDone = ex.items.filter((_, i) => L.ex[i]).length;
  const overall = pct(mDone + eDone + (L.water >= S.waterGoal ? 1 : 0), MEAL_SLOTS.length + ex.items.length + 1);
  return `<h1>Hi ${S.name} 👋</h1><div class="mu">${ph.name} · ${ph.goal}</div>
  <div class="card hero"><div class="row sp"><b>Today's progress</b><b>${overall}%</b></div><div class="bar"><i style="width:${overall}%"></i></div>
  <div class="mu" style="margin-top:8px">${mDone}/6 meals · ${L.water}/${S.waterGoal} ml water · ${eDone}/${ex.items.length} exercises</div></div>
  <div class="card"><div class="row sp"><b>⭐ Streak</b><span>${streak()} day(s) · 7-day score ${weekScore()}%</span></div></div>
  <div class="card"><div class="row sp"><b>🔥 Calories eaten</b><span>${kcalEaten(d, n)} / ${kcalPlan(n)} kcal</span></div><div class="bar"><i style="width:${pct(kcalEaten(d, n), kcalPlan(n))}%"></i></div></div>
  <div class="card"><div class="row sp"><b>💧 Water</b><span>${L.water} / ${S.waterGoal} ml</span></div><div class="bar"><i style="width:${pct(L.water, S.waterGoal)}%;background:var(--wa)"></i></div>
  <div class="row" style="margin-top:10px"><button class="wbtn" data-w="250">+250 ml</button><button class="wbtn alt" data-w="500">+500 ml</button></div></div>
  <div class="card"><b>🏋️ ${ex.title}</b><div class="mu">${ex.rest ? "Recovery day" : ex.items.length + " exercises"}</div></div>
  <div class="card"><b>💡 Tip of the day</b><div class="mu" style="font-size:14px;margin-top:4px">${TIPS[((n % TIPS.length) + TIPS.length) % TIPS.length]}</div></div>`;
}

function viewMeals(n, d) {
  const L = log(d), M = mealsFor(n);
  return `<h1>Meal Plan 🍽️</h1><div class="mu">Planned: ${kcalPlan(n)} kcal · eaten: ${kcalEaten(d, n)} kcal</div><div class="card">` +
    MEAL_SLOTS.map((s, i) => `<div class="item ${L.meals[s.id] ? "done" : ""}"><span class="ic">${s.icon}</span><div class="b"><b>${s.name} <span class="mu">· ${s.time}</span></b><span class="t">${M[i].t}</span><div class="mu">${M[i].k} kcal</div></div><button class="chk ${L.meals[s.id] ? "on" : ""}" data-m="${s.id}">${L.meals[s.id] ? "✓" : ""}</button></div>`).join("") + `</div>`;
}

function viewWater(n, d) {
  const L = log(d), p = pct(L.water, S.waterGoal), C = 2 * Math.PI * 80;
  const days = [...Array(7)].map((_, i) => iso(parse(d).getTime() + (i - 6) * DAY + 3600e3));
  const max = Math.max(S.waterGoal, ...days.map(x => (S.logs[x] || {}).water || 0));
  return `<h1>Water Tracker 💧</h1><div class="card"><div class="ring"><svg width="180" height="180"><circle cx="90" cy="90" r="80" fill="none" stroke="var(--wa2)" stroke-width="14"/><circle cx="90" cy="90" r="80" fill="none" stroke="var(--wa)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p / 100)}"/></svg><div><b>${L.water}</b><span class="mu">of ${S.waterGoal} ml</span></div></div>
  <div class="row"><button class="wbtn alt" data-w="150">+150</button><button class="wbtn" data-w="250">+250</button><button class="wbtn" data-w="500">+500</button><button class="wbtn alt" data-w="-250">Undo</button></div>
  <div class="mu" style="text-align:center;margin-top:10px">${L.water >= S.waterGoal ? "🎉 Goal reached!" : S.waterGoal - L.water + " ml to go"}</div></div>
  <h2>Last 7 days</h2><div class="card"><div class="hist">${days.map(x => { const v = (S.logs[x] || {}).water || 0; return `<div><i style="height:${Math.round((v / max) * 70)}px"></i>${parse(x).toDateString().slice(0, 1)}<br>${(v / 1000).toFixed(1)}</div>`; }).join("")}</div></div>`;
}

function viewEx(n, d) {
  const L = log(d), e = exFor(n), ph = PHASES[Math.min(2, Math.max(0, Math.floor(n / 28)))];
  return `<h1>Workout 🏋️</h1><div class="mu">${ph.name} (${ph.weeks})</div><div class="card"><div class="row sp"><b>${e.title}</b>${e.rest ? '<span class="tag">REST</span>' : ""}</div>` +
    e.items.map((t, i) => `<div class="item ${L.ex[i] ? "done" : ""}"><div class="b t">${t}</div><button class="chk ${L.ex[i] ? "on" : ""}" data-e="${i}">${L.ex[i] ? "✓" : ""}</button></div>`).join("") + `</div>
  <div class="mu">Tip: warm up first, stop if you feel pain, and drink water between sets.</div>`;
}

function chart() {
  const w = S.weights, W = 320, H = 130;
  if (w.length < 2) return `<div class="mu">Log your weight at least twice to see the chart.</div>`;
  const vs = w.map(x => x.kg).concat(S.goalWeight), mn = Math.min(...vs) - 1, mx = Math.max(...vs) + 1;
  const px = i => 10 + (i / (w.length - 1)) * (W - 20), py = v => H - 10 - ((v - mn) / (mx - mn)) * (H - 20);
  return `<svg viewBox="0 0 ${W} ${H}" width="100%"><line x1="10" x2="${W - 10}" y1="${py(S.goalWeight)}" y2="${py(S.goalWeight)}" stroke="var(--ac)" stroke-dasharray="4"/><polyline fill="none" stroke="var(--pr)" stroke-width="3" points="${w.map((x, i) => px(i) + "," + py(x.kg)).join(" ")}"/>${w.map((x, i) => `<circle cx="${px(i)}" cy="${py(x.kg)}" r="4" fill="var(--pr)"/>`).join("")}</svg><div class="mu">Dashed line = goal (${S.goalWeight} kg)</div>`;
}

function viewProgress() {
  const cur = lastWeight(), lost = (S.startWeight - cur).toFixed(1), toGo = Math.max(0, cur - S.goalWeight).toFixed(1);
  const bmi = (cur / Math.pow(S.height / 100, 2)).toFixed(1), cat = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese";
  const tot = Math.max(0.1, S.startWeight - S.goalWeight);
  return `<h1>Progress 📈</h1>
  <div class="card hero"><div class="row sp"><div><div class="mu">Current</div><b style="font-size:26px">${cur} kg</b></div><div><div class="mu">Lost</div><b style="font-size:26px">${lost} kg</b></div><div><div class="mu">To go</div><b style="font-size:26px">${toGo} kg</b></div></div><div class="bar"><i style="width:${Math.max(0, pct(S.startWeight - cur, tot))}%"></i></div></div>
  <div class="card"><div class="row sp"><b>BMI</b><span>${bmi} · <span class="tag">${cat}</span></span></div></div>
  <div class="card"><b>Weight trend</b>${chart()}</div>
  <div class="card"><label>Log today's weight (kg)</label><div class="row"><input id="lw" type="number" inputmode="decimal" style="margin:0"><button class="btn" id="addw">Save</button></div></div>
  <div class="card"><div class="row sp"><b>Reminders (water + meals)</b><button class="btn alt" id="rm">${S.remind ? "On" : "Off"}</button></div>
  <div class="row sp" style="margin-top:10px"><b>Diet</b><button class="btn alt" id="dt">${S.diet === "nonveg" ? "Veg + Non-veg" : "Vegetarian"}</button></div>
  <div class="row sp" style="margin-top:10px"><b>Dark mode</b><button class="btn alt" id="dm">${S.dark ? "On" : "Off"}</button></div>
  <div class="row sp" style="margin-top:10px"><b>Daily water goal</b><button class="btn alt" id="wg">${S.waterGoal} ml</button></div>
  <div class="row sp" style="margin-top:10px"><b>Reset all data</b><button class="btn alt" id="rs">Reset</button></div></div>`;
}

function render() {
  if (!S.start) return setup();
  applyTheme();
  document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
  const n = dayIdx(view);
  let h = "";
  if (tab === "progress") h = viewProgress();
  else h = dayNav(n) + (tab === "today" ? viewToday : tab === "meals" ? viewMeals : tab === "water" ? viewWater : viewEx)(n, view);
  $("#app").innerHTML = h;
  bindNav();
  document.querySelectorAll("[data-w]").forEach(b => b.onclick = () => { const L = log(view); L.water = Math.max(0, L.water + +b.dataset.w); save(); render(); });
  document.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { const L = log(view); L.meals[b.dataset.m] = !L.meals[b.dataset.m]; save(); render(); });
  document.querySelectorAll("[data-e]").forEach(b => b.onclick = () => { const L = log(view); L.ex[b.dataset.e] = !L.ex[b.dataset.e]; save(); render(); });
  if (tab === "progress") {
    $("#addw").onclick = () => { const v = +$("#lw").value; if (!v) return; const t = iso(new Date()); S.weights = S.weights.filter(x => x.date !== t).concat({ date: t, kg: v }).sort((a, b) => a.date.localeCompare(b.date)); save(); render(); };
    $("#rm").onclick = async () => { S.remind = !S.remind; save(); await setReminders(S.remind); render(); };
    $("#dt").onclick = () => { S.diet = S.diet === "nonveg" ? "veg" : "nonveg"; save(); render(); };
    $("#dm").onclick = () => { S.dark = !S.dark; save(); render(); };
    $("#wg").onclick = () => { const v = +prompt("Daily water goal (ml)", S.waterGoal); if (v > 0) { S.waterGoal = v; save(); render(); } };
    $("#rs").onclick = () => { if (confirm("Delete all data and start over?")) { S = {}; save(); render(); } };
  }
  window.scrollTo(0, 0);
}

document.querySelectorAll("#nav button").forEach(b => b.onclick = () => { tab = b.dataset.tab; render(); });
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
S.start && (view = iso(new Date()));
render();
