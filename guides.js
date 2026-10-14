// Exercise guides: stick-figure poses (side view, 100x70 box), female-focused form tips, mode/age adaptations.
// Pose = [head "x,y", [body lines "x,y x,y ..."], [prop lines]]
const STAND = ["50,12", ["50,20 50,42", "50,22 50,34 50,44", "50,42 50,52 50,62"], []];
const LYING = (legs, arms) => ["12,58", ["20,58 50,58", arms || "24,57 34,58 42,58", legs], []];

const GUIDES = {
  squat: { n: "Squat", m: "Thighs, glutes, core", la: "Start", lb: "Down",
    a: ["50,12", ["50,20 50,42", "50,22 58,22 66,22", "50,42 50,52 50,62"], []],
    b: ["56,22", ["53,30 40,48", "53,31 61,31 69,31", "40,48 60,50 54,62"], []],
    s: ["Stand with feet shoulder-width apart, toes slightly out.", "Push hips back and bend knees as if sitting on a chair.", "Go down until thighs are parallel to the floor, chest up.", "Press through heels to stand and squeeze glutes."],
    f: "Keep knees tracking over your toes — women tend to let knees cave inward. Gently lift your pelvic floor as you stand up.", x: "Knees collapsing in, heels lifting, rounding the back.", br: "Breathe in going down, out coming up." },
  lunge: { n: "Lunge", m: "Thighs, glutes, balance", la: "Start", lb: "Down",
    a: STAND,
    b: ["52,12", ["52,20 50,42", "52,22 52,32 52,42", "50,42 68,44 68,62", "50,42 34,60 22,60"], []],
    s: ["Stand tall, step one foot forward about a big stride.", "Lower until both knees are about 90°, back knee hovers above floor.", "Keep torso upright, front knee over the ankle.", "Push through the front heel to return. Switch legs."],
    f: "Take a slightly wider stride for stability. Keep hips level and do not let the front knee drift inward.", x: "Front knee past toes, leaning forward, narrow 'tightrope' stance.", br: "In going down, out pushing up." },
  pushup: { n: "Push-up", m: "Chest, shoulders, arms, core", la: "Up", lb: "Down",
    a: ["76,28", ["68,32 42,43", "68,33 70,48 70,60", "42,43 26,51 10,60"], []],
    b: ["78,46", ["70,46 44,52", "68,47 60,54 70,60", "44,52 26,56 10,62"], []],
    s: ["Hands slightly wider than shoulders, body in one straight line.", "Lower chest toward the floor with elbows at about 45° from your body.", "Pause briefly, then press back up without sagging the hips."],
    f: "If a full push-up is hard, do it on your knees — it is a real push-up, not a cheat. Squeeze glutes and abs to protect your lower back.", x: "Hips sagging or piking, elbows flaring wide, head dropping.", br: "In going down, out pushing up." },
  kneepush: { n: "Knee push-up", m: "Chest, shoulders, arms", la: "Up", lb: "Down",
    a: ["76,30", ["68,34 44,46", "68,35 70,48 70,60", "44,46 28,60 12,50"], []],
    b: ["78,48", ["70,48 46,54", "68,49 60,56 70,60", "46,54 28,60 12,52"], []],
    s: ["Kneel with hands under shoulders, knees on a mat.", "Keep a straight line from head to knees.", "Lower chest to the floor, then press up."],
    f: "Pad your knees with a folded mat. Keep ribs drawn in so the lower back stays neutral.", x: "Hips pushed back toward heels, chin poking forward.", br: "In going down, out pushing up." },
  wallpush: { n: "Wall push-up", m: "Chest, shoulders, arms", la: "Start", lb: "Lean in",
    a: ["60,14", ["58,22 44,42", "58,24 68,26 78,22", "44,42 38,52 32,62"], ["80,4 80,62"]],
    b: ["70,18", ["68,26 50,42", "68,28 64,32 78,22", "50,42 41,52 32,62"], ["80,4 80,62"]],
    s: ["Stand an arm's length from a wall, palms on the wall at shoulder height.", "Bend elbows and lean chest toward the wall.", "Push back to start, body straight like a plank."],
    f: "A great starting point for beginners and for women over 45 — gentle on wrists and shoulders.", x: "Bending at the waist, shrugging shoulders.", br: "In leaning in, out pushing away." },
  bridge: { n: "Glute bridge", m: "Glutes, hamstrings, core", la: "Down", lb: "Up",
    a: ["12,56", ["20,58 50,58", "24,58 34,59 42,60", "50,58 68,44 72,60"], []],
    b: ["12,56", ["20,58 50,40", "24,58 34,59 42,60", "50,40 70,42 72,60"], []],
    s: ["Lie on your back, knees bent, feet flat hip-width apart.", "Press through heels and lift hips until shoulders-hips-knees form a line.", "Squeeze glutes for 1–2 seconds, lower slowly."],
    f: "Excellent for pelvic floor and glute strength. Exhale and gently lift the pelvic floor as you rise.", x: "Over-arching lower back, pushing through toes.", br: "Out while lifting, in lowering." },
  plank: { n: "Plank", m: "Core, shoulders, glutes", la: "Correct", lb: "Avoid (sagging)",
    a: ["74,35", ["66,38 42,45", "64,39 64,58 74,58", "42,45 26,52 10,58"], []],
    b: ["74,37", ["66,40 42,54", "64,41 64,58 74,58", "42,54 26,57 10,60"], []],
    s: ["Forearms on the floor, elbows under shoulders.", "Body in a straight line from head to heels.", "Tighten abs and glutes, breathe steadily, hold."],
    f: "Draw your belly button toward your spine and lightly engage the pelvic floor. Stop if you feel pressure in the lower belly or back.", x: "Hips sagging or lifting too high, holding breath.", br: "Slow, steady breaths." },
  mountain: { n: "Mountain climbers", m: "Core, shoulders, cardio", la: "Start", lb: "Drive knee",
    a: ["76,28", ["68,32 42,42", "68,33 70,48 70,60", "42,42 26,50 10,58", "42,42 30,50 14,58"], []],
    b: ["76,28", ["68,32 42,42", "68,33 70,48 70,60", "42,42 26,50 10,58", "42,42 58,48 56,58"], []],
    s: ["Start in a high plank, hands under shoulders.", "Drive one knee toward your chest, then switch quickly.", "Keep hips low and core tight."],
    f: "Slow the pace if you feel any pelvic pressure. Low-impact option: step the feet one at a time.", x: "Hips bouncing up, hands too far forward.", br: "Quick, rhythmic breaths." },
  jack: { n: "Jumping jacks", m: "Full body, cardio", la: "Start", lb: "Jump out",
    a: ["50,12", ["50,20 50,42", "50,22 46,34 44,44", "50,22 54,34 56,44", "50,42 47,52 46,62", "50,42 53,52 54,62"], []],
    b: ["50,12", ["50,20 50,42", "50,22 38,14 34,6", "50,22 62,14 66,6", "50,42 40,52 34,62", "50,42 60,52 66,62"], []],
    s: ["Stand with feet together, arms at sides.", "Jump feet out while raising arms overhead.", "Jump back to start with soft knees."],
    f: "A well-fitted sports bra helps. Low-impact option: side-step jacks (step out, no jump).", x: "Landing with stiff knees.", br: "Breathe rhythmically." },
  knees: { n: "High knees / march", m: "Hips, core, cardio", la: "Stand", lb: "Knee up",
    a: STAND,
    b: ["50,12", ["50,20 50,42", "50,22 58,32 62,26", "50,42 50,52 50,62", "50,42 62,42 62,54"], []],
    s: ["Stand tall.", "Lift one knee to hip height, swing the opposite arm.", "Alternate legs. March for low impact, run for higher intensity."],
    f: "Marching is gentle on joints and pelvic floor — a good choice on heavier days.", x: "Leaning back, slouching.", br: "Steady rhythm." },
  dips: { n: "Tricep dips (chair)", m: "Back of arms, shoulders", la: "Up", lb: "Down",
    a: ["50,14", ["50,22 44,44", "50,24 54,36 54,47", "44,44 62,46 76,60"], ["36,48 60,48"]],
    b: ["50,24", ["50,32 44,56", "50,34 60,42 54,47", "44,56 62,52 76,62"], ["36,48 60,48"]],
    s: ["Sit on a sturdy chair edge, hands beside hips, slide forward.", "Bend elbows straight back to about 90°.", "Press up, keeping shoulders away from ears."],
    f: "Keep your back close to the chair. Bend knees to make it easier.", x: "Elbows flaring, shoulders shrugging.", br: "In going down, out pushing up." },
  superman: { n: "Superman", m: "Lower back, glutes", la: "Rest", lb: "Lift",
    a: ["14,58", ["22,60 50,60", "22,60 10,60", "50,60 82,60"], []],
    b: ["12,48", ["20,54 50,60", "20,54 8,46", "50,60 66,54 82,50"], []],
    s: ["Lie face down, arms stretched forward.", "Lift arms, chest and legs a few centimetres.", "Hold 2 seconds, lower slowly."],
    f: "Lift only as high as comfortable; look at the floor to keep the neck long.", x: "Craning the neck up, jerky lifts.", br: "Out as you lift, in as you lower." },
  twist: { n: "Russian twist", m: "Obliques, core", la: "Left", lb: "Right",
    a: ["46,18", ["43,26 36,48", "43,28 54,34 60,36", "36,48 58,40 74,50"], []],
    b: ["46,18", ["43,26 36,48", "43,28 50,40 58,44", "36,48 58,40 74,50"], []],
    s: ["Sit, lean back slightly, knees bent, back straight.", "Clasp hands and rotate your shoulders side to side.", "Feet on floor for easier, lifted for harder."],
    f: "Move from the ribs, not just the arms. Keep the spine long, no rounding.", x: "Rounded back, fast swinging.", br: "Out on each twist." },
  legraise: { n: "Leg raise", m: "Lower abs", la: "Down", lb: "Up",
    a: LYING("50,58 82,58"),
    b: LYING("50,58 50,28"),
    s: ["Lie on your back, press the lower back gently into the floor.", "Raise straight legs to 90°.", "Lower slowly without arching your back."],
    f: "Bend your knees if the lower back lifts. Exhale and gently engage the pelvic floor on the lift.", x: "Arching the back, swinging legs.", br: "Out lifting, in lowering." },
  calf: { n: "Calf raise", m: "Calves, balance", la: "Start", lb: "Up",
    a: STAND,
    b: ["50,8", ["50,16 50,38", "50,18 50,30 50,40", "50,38 50,50 50,58 54,62"], []],
    s: ["Stand tall, hold a wall for balance.", "Rise onto toes, pause, lower slowly."],
    f: "Great for ankle strength and posture; keep ankles straight, not rolling outward.", x: "Rolling the ankles, bouncing.", br: "Out rising, in lowering." },
  crunch: { n: "Crunch / bicycle crunch", m: "Abs", la: "Down", lb: "Up",
    a: ["14,56", ["22,58 50,58", "24,56 34,52 40,50", "50,58 62,44 74,58"], []],
    b: ["28,46", ["34,52 50,58", "36,50 46,46 52,44", "50,58 62,44 74,58"], []],
    s: ["Lie on your back, knees bent, hands lightly behind head.", "Curl shoulders off the floor using your abs.", "Lower slowly. For bicycle crunch, bring opposite elbow to knee."],
    f: "Don't pull on the neck. If you notice doming or pressure in the belly, switch to planks or dead-bugs.", x: "Pulling the neck, using momentum.", br: "Out lifting, in lowering." },
  boat: { n: "Boat pose (Navasana)", m: "Core, hip flexors", la: "Hold", lb: "Hold",
    a: ["40,14", ["42,22 44,46", "42,24 58,30 66,30", "44,46 62,34 74,24"], []],
    b: ["40,14", ["42,22 44,46", "42,24 58,30 66,30", "44,46 62,34 74,24"], []],
    s: ["Sit with knees bent, lean back slightly.", "Lift feet, shins parallel to the floor (straighten legs if able).", "Arms forward, spine long. Hold."],
    f: "Keep knees bent if the lower back rounds. Hold only as long as you can breathe easily.", x: "Rounded back, holding breath.", br: "Steady breaths." },
  warrior: { n: "Warrior / Triangle", m: "Legs, hips, shoulders", la: "Pose", lb: "Pose",
    a: ["52,12", ["52,20 50,42", "52,22 70,22", "52,22 34,22", "50,42 68,44 68,62", "50,42 36,52 24,62"], []],
    b: ["52,12", ["52,20 50,42", "52,22 70,22", "52,22 34,22", "50,42 68,44 68,62", "50,42 36,52 24,62"], []],
    s: ["Step feet wide apart, front knee bent over ankle.", "Open arms parallel to the floor, shoulders relaxed.", "Gaze over the front hand, hold 5 breaths, switch sides."],
    f: "Keep hips squared and the front knee tracking over the middle toes.", x: "Front knee collapsing in.", br: "Slow breathing." },
  surya: { n: "Surya Namaskar / Yoga flow", m: "Full body, flexibility", la: "Prayer pose", lb: "Downward dog",
    a: ["50,12", ["50,20 50,42", "50,22 54,32 50,36", "50,42 50,52 50,62"], []],
    b: ["68,48", ["66,40 50,24", "66,40 74,60", "50,24 34,44 22,60"], []],
    s: ["Start in prayer pose, inhale arms up.", "Fold forward, step back to plank, lower, cobra.", "Press hips up into downward dog, then step forward and rise."],
    f: "Skip deep backbends and inversions during periods if uncomfortable, and with doctor's approval during pregnancy.", x: "Rushing through, locking knees.", br: "Inhale on lifts, exhale on folds." },
  burpee: { n: "Burpee", m: "Full body, cardio", la: "Down", lb: "Plank",
    a: ["56,32", ["52,36 38,50", "52,38 60,52 62,60", "38,50 54,52 50,62"], []],
    b: ["76,28", ["68,32 42,43", "68,33 70,48 70,60", "42,43 26,51 10,60"], []],
    s: ["Squat and place hands on floor.", "Step or jump feet back to plank.", "Return and stand (jump for higher intensity)."],
    f: "Step back and forth instead of jumping to keep it low-impact.", x: "Sagging in plank.", br: "Out on effort." },
  jumpsquat: { n: "Jump squat", m: "Thighs, glutes, cardio", la: "Squat", lb: "Jump",
    a: ["56,22", ["53,30 40,48", "53,31 61,31 69,31", "40,48 60,50 54,62"], []],
    b: ["50,4", ["50,12 50,32", "50,14 42,22 36,28", "50,32 50,42 50,52"], []],
    s: ["Squat down, arms back.", "Explode upward, swing arms forward.", "Land softly on mid-foot into the next squat."],
    f: "Land softly to protect knees and pelvic floor; do regular squats if you feel leaking or pressure.", x: "Stiff landing, knees caving.", br: "Out on the jump." },
  walk: { n: "Walk / jog / cycle", m: "Heart, legs, fat burn", la: "Stride", lb: "Stride",
    a: ["50,12", ["50,20 50,42", "50,22 58,32 62,26", "50,22 42,32 38,40", "50,42 40,52 34,62", "50,42 60,52 64,62"], []],
    b: ["50,12", ["50,20 50,42", "50,22 42,32 38,26", "50,22 58,32 62,40", "50,42 60,52 66,62", "50,42 40,52 36,62"], []],
    s: ["Stand tall, look ahead, shoulders relaxed.", "Swing arms naturally, land heel-to-toe.", "Pace: you can talk but not sing."],
    f: "Wear supportive shoes and a supportive bra; walk in well-lit, safe places.", x: "Hunching, over-striding.", br: "Breathe in rhythm with your steps." },
  stretch: { n: "Warm-up / stretching", m: "Whole body", la: "Start", lb: "Reach",
    a: STAND,
    b: ["54,12", ["50,20 52,42", "50,22 52,12 52,4", "52,42 52,52 52,62"], []],
    s: ["Move slowly through neck, shoulder, hip and ankle circles.", "Reach arms overhead and side-bend each way.", "Hold each stretch 20–30 seconds, no bouncing."],
    f: "Never stretch to pain. Joints can feel looser around your period — move gently.", x: "Bouncing, holding breath.", br: "Deep slow breaths." },
  breathe: { n: "Pranayama / relaxation", m: "Calm, lungs, stress relief", la: "Inhale", lb: "Exhale",
    a: ["50,22", ["50,30 50,50", "50,32 58,42 56,50", "50,50 68,56 40,58"], []],
    b: ["50,22", ["50,30 50,50", "50,32 58,42 56,50", "50,50 68,56 40,58"], []],
    s: ["Sit comfortably, spine tall, shoulders relaxed.", "Anulom-Vilom: close right nostril, inhale left; switch and exhale right.", "Keep breath smooth and slow for 5 minutes."],
    f: "Lowering stress also helps cortisol and sleep — both matter for weight loss.", x: "Forcing the breath.", br: "Slow, silent, through the nose." },
};

const GUIDE_MAP = [
  [/surya|bhujang|tadasana|vriksha|namaskar/i, "surya"], [/virabhadra|trikon/i, "warrior"], [/nauka|navasana/i, "boat"],
  [/crunch/i, "crunch"], [/knee push/i, "kneepush"], [/wall push/i, "wallpush"], [/push-up/i, "pushup"],
  [/burpee/i, "burpee"], [/jump squat/i, "jumpsquat"], [/squat/i, "squat"], [/lunge/i, "lunge"], [/glute/i, "bridge"],
  [/plank/i, "plank"], [/mountain/i, "mountain"], [/jumping jack/i, "jack"], [/high knee|march|step-up/i, "knees"],
  [/tricep|dips/i, "dips"], [/superman/i, "superman"], [/russian/i, "twist"], [/leg raise/i, "legraise"], [/calf/i, "calf"],
  [/pranayama|anulom|nidra/i, "breathe"], [/stretch|warm-up|cool-down/i, "stretch"], [/walk|jog|cycl/i, "walk"],
];
const guideKey = t => { const m = GUIDE_MAP.find(([r]) => r.test(t)); return m ? m[1] : null; };

// Exercise modes: age-based default + user override
const MODES = {
  gentle: { name: "Gentle", f: 0.7, low: true, note: "Low-impact, shorter sets, longer rests. Ideal for 60+ or returning after a break." },
  easy: { name: "Easy", f: 0.85, low: true, note: "Joint-friendly with slightly reduced volume. Suited to 45–59 or beginners." },
  standard: { name: "Standard", f: 1, low: false, note: "The full program as written." },
  advanced: { name: "Advanced", f: 1.25, low: false, note: "More reps and time for experienced exercisers." },
};
const autoMode = age => (age >= 60 ? "gentle" : age >= 45 ? "easy" : "standard");
const LOW_SWAPS = [[/Burpees/, "Step-back squats"], [/Jump squats/, "Bodyweight squats"], [/Jumping jacks/, "Side-step jacks"], [/High knees/, "Marching in place"], [/Jog-walk intervals/, "Brisk walk intervals"], [/Jog-walk/, "Brisk walk"], [/Jogging\/cycling|Jog \/ cycle/, "Brisk walk / cycle"], [/Jog \/ walk|jog \/ walk/, "Brisk walk"], [/Mountain climbers/, "Slow plank step-ins"]];
function adaptText(t, mode) {
  const M = MODES[mode]; let o = t;
  if (M.low) LOW_SWAPS.forEach(([r, v]) => (o = o.replace(r, v)));
  if (mode === "gentle") o = o.replace(/^Push-ups/, "Wall push-ups");
  const f = M.f; if (f === 1) return o;
  const rd = (n, step) => Math.max(step, Math.round((n * f) / step) * step);
  return o.replace(/(\d+)×(\d+)( sec)?|(\d+) min|(\d+) rounds/, (m, sets, v, sec, mins, rounds) => {
    if (sets) return sets + "×" + (sec ? rd(+v, 5) : Math.max(5, Math.round(v * f))) + (sec || "");
    if (mins) return rd(+mins, 5) + " min";
    return Math.max(2, Math.round(rounds * f)) + " rounds";
  });
}

const pose = (p, cls) => `<svg viewBox="0 0 100 70" class="fig" role="img" aria-label="Exercise position diagram"><line x1="4" y1="63" x2="96" y2="63" class="gr"/>${p[2].map(l => `<polyline points="${l}" class="pr"/>`).join("")}${p[1].map(l => `<polyline points="${l}" class="li"/>`).join("")}<circle cx="${p[0].split(",")[0]}" cy="${p[0].split(",")[1]}" r="5.5" class="hd"/></svg>`;
function guideHTML(key, mode) {
  const g = GUIDES[key], M = MODES[mode];
  return `<div class="row sp"><h1 style="font-size:26px;margin:0">${g.n}</h1><button class="btn alt" data-act="close" aria-label="Close guide">Done</button></div><div class="mu">${g.m}</div>
  <div class="figs"><div>${pose(g.a)}<span>${g.la}</span></div><div>${pose(g.b)}<span>${g.lb}</span></div></div>
  <h2>Watch how it is done</h2><div id="vid">${videoHTML(key, 0)}</div>
  <h2>How to do it</h2><div class="card"><ol>${g.s.map(x => `<li>${x}</li>`).join("")}</ol></div>
  <h2>For women</h2><div class="card">${g.f}</div>
  <h2>Avoid</h2><div class="card">${g.x}<div class="mu" style="margin-top:6px">Breathing: ${g.br}</div></div>
  <div class="mu" style="margin:8px 16px">Mode: <b>${M.name}</b> — ${M.note} Stop if you feel pain, dizziness or pelvic pressure, and check with your doctor if pregnant, postpartum or have any health condition.</div>`;
}

// Curated YouTube tutorials (id, title). Found via web search; embedding can be blocked by a video's owner,
// so the UI always offers "Open in YouTube" and an alternate video.
const VIDEOS = {
  squat: [["e1UYgO67zkw", "How to Squat Properly for Women"], ["LmFitmO_ANw", "How to Squat Properly for Beginners (step-by-step)"]],
  lunge: [["fydLSJlGx-0", "Lunges for Beginners – How to do a lunge without pain"], ["2LQ1krDBiYY", "How to do a Squat and Lunge (proper form for women)"]],
  pushup: [["ABbVpmubIGQ", "How to do Push-ups for Beginners (step-by-step)"], ["oSZjbGUTsdI", "Women's Chest Exercise: How to do Push-ups Correctly"]],
  kneepush: [["_h0mGF0WvHU", "Knee Push-Ups for Absolute Beginners"], ["utzhPQuXWcA", "Kneeling Push-up: how to do it & 3 common mistakes"]],
  wallpush: [["PkFu8ee6IuY", "Wall Push-up for Seniors & Beginner Exercisers"], ["YB0egDzsu18", "Wall Push-ups for Beginners"]],
  bridge: [["Q_Bpj91Yiis", "Glute Bridge Exercise – the correct way"], ["OUgsJ8-Vi0E", "How to Perform the Perfect Glute Bridge"]],
  plank: [["BQu26ABuVS0", "How to Plank Properly for Beginners – step-by-step"], ["8b13VkLlHeo", "How to Plank Properly for Beginners & Seniors"]],
  mountain: [["OR1eel_5oAY", "Mountain Climbers for Beginners (avoid 3 common mistakes)"], ["De3Gl-nC7IQ", "How to do Mountain Climbers the right way"]],
  jack: [["bM_4x-5zb0Y", "Jumping Jacks and Low-Impact Jumping Jacks"], ["Bqy1xIXX2nc", "Modified (low-impact) Jumping Jacks – HASfit"]],
  knees: [["QilgMPG7OaA", "March in Place – HASfit low-impact exercise"], ["-tfnUAl4oQA", "March in Place (high knees)"]],
  dips: [["AWz_7B1cch0", "How to Properly do Tricep Chair Dips – 3 common mistakes"], ["ktSTgz8KXvo", "Tricep dips in a chair"]],
  superman: [["UXUGfiNL1lI", "How to Properly do a Superman Exercise"], ["z6PJMT2y8GQ", "Exercise Tutorial – Superman"]],
  twist: [["C_OjLWMNcqM", "How to do Russian Twists (beginner tutorial)"], ["9V9csctSKj0", "Russian Twist properly & best progression for beginners"]],
  legraise: [["Cwuxy8eo7iw", "Leg Raises for Beginners – lower core and abs"], ["xJJu-WiROM8", "How to perform the Lying Leg Raise"]],
  calf: [["KRJIKsY02nE", "Standing Calf Raise Tutorial for Beginners"], ["4HQ8Am9IuME", "Standing Calf Raise (proper form)"]],
  crunch: [["Z7A2ZkcCs2I", "How to do a Bicycle Crunch for Beginners"], ["kDPxFoCmb-w", "Bicycle Crunch Tutorial – proper form & tips"]],
  boat: [["gWEey6tp7-c", "Navasana – Boat Pose for Beginners"], ["ojzQkuKpnic", "Boat Pose tutorial for beginners & older practitioners"]],
  warrior: [["dW231uCUvyg", "Warrior 2 for Beginners – learn correct alignment"], ["_gh-zf8Egus", "Warrior 2 & Triangle Pose tutorial"]],
  surya: [["5jFfBCQpbP8", "Step-by-Step Sun Salutation for Beginners"], ["pykkDL98ZkQ", "Surya Namaskar step by step, with breathing"]],
  burpee: [["wGvBfVeCNko", "Burpees for Beginners (step-by-step)"], ["BbyT6-jgtfA", "Burpee modification tutorial (low impact)"]],
  jumpsquat: [["s21P2j0kYTw", "How to do Squats and Jump Squats in proper form"], ["5qqAUsHmAMU", "How to properly Jump Squat"]],
  walk: [["OZYDSQ0Ah_o", "Fast Walking Workout in 20 minutes"], ["wQrV75N2BrI", "20 Minute Brisk Walk"]],
  stretch: [["7KSoWzbznhk", "15 min Full Body Stretch & Cool Down"], ["3qyWpJ34dWw", "5 Minute Full Body Dynamic Warm-Up"]],
  breathe: [["Nhw92icsQ1A", "Steps to perform Anuloma Viloma correctly – Dr. Hansaji"], ["asWNZkgw9mI", "5-Minute Anulom Vilom Pranayama with timer"]],
};
const ytSearch = q => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
function videoHTML(key, i = 0) {
  const g = GUIDES[key], list = VIDEOS[key] || [];
  if (!list.length) return `<div class="card"><p class="mu">No video saved for this exercise yet.</p><a class="pill" href="${ytSearch(g.n + " proper form for women beginners")}" target="_blank" rel="noopener">Search on YouTube ↗</a></div>`;
  const [id, title] = list[i] || list[0];
  return `<div class="card vid"><div class="vframe" id="vframe"><button class="vplay" data-act="play" data-v="${id}" data-k="${key}" aria-label="Play video: ${title.replace(/"/g, "")}"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="vbtn" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></button></div>
  <div class="vtitle">${title}</div>
  <div class="row wrap" style="margin-top:10px">${list.map((v, j) => `<button class="pill ${j === i ? "sel" : ""}" data-act="vsel" data-k="${key}" data-v="${j}" aria-pressed="${j === i}">Video ${j + 1}</button>`).join("")}<a class="pill" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">Open in YouTube ↗</a></div>
  <p class="mu sm" style="margin:10px 0 0">Needs an internet connection. If a video won't play, tap “Open in YouTube” or try the other video. These are beginner-friendly tutorials from YouTube creators; our tips below cover women-specific form.</p></div>`;
}
