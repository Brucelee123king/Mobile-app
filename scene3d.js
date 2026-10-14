// Fit 90 — procedural 3D character (Three.js). Rig + animation sampler. No external assets.
// Exercise animations are authored in poses_*.js as window.FIT_ANIMS[key] (see ANIM FORMAT below).
//
// ANIM FORMAT (angles in DEGREES, anatomical, character faces +Z, y up, character's LEFT = +X):
//   FIT_ANIMS.squat = { dur: 3, frames: [ {t:0, ...pose}, {t:.5, ...pose} ], air: false }
//   frames are looped (last frame blends back to the first). t in 0..1.
//   pose keys (all optional, missing = standing default):
//     root: { p:[x,y,z] (metres, offset), r:[pitch,yaw,roll], lift: metres above ground (jumps) }
//        pitch +ve = whole body tips forward/face-down (plank = +90), -90 = lying on back (face up)
//     sp, ch (spine, chest): [flex(+fwd), sideBend(+ to character's left), twist(+ to left)]
//     nk: [flex(+ chin down), side, twist]
//     shL, shR: [flex(+ raise forward), abd(+ raise sideways away from body), twist(+ inward)]
//     elL, elR: [flex(+ bend, forearm up/forward)]
//     hpL, hpR: [flex(+ thigh forward), abd(+ out to side), twist(+ toes in)]
//     knL, knR: [flex(+ heel toward butt)]
//     anL, anR: [flex(+ toes up)]
//   The character is auto-grounded every frame (lowest point sits on the floor) unless anim.air is true.
import * as THREE from "./vendor/three.module.min.js";

const BODY = {
  f: { skin: 0xf0c4a0, top: 0x2fb350, bottom: 0x2c3e50, shoe: 0xf5f5f7, hair: 0x3b2417, hairStyle: "pony", shoulder: 0.19, hip: 0.105, scale: 1.0 },
  m: { skin: 0xd9a27a, top: 0x0a84ff, bottom: 0x1f2937, shoe: 0xf5f5f7, hair: 0x1b1b1b, hairStyle: "short", shoulder: 0.22, hip: 0.1, scale: 1.06 },
};
const L = { thigh: 0.44, shin: 0.43, foot: 0.24, ankleH: 0.075, spine: 0.2, chest: 0.3, neck: 0.1, head: 0.11, upper: 0.29, fore: 0.26 };
const D2R = Math.PI / 180;
const ease = t => t * t * (3 - 2 * t);

function mat(color, rough = 0.6) { return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.02 }); }
function capsule(r, len, m, parent, yOff) {
  const g = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 6, 14), m);
  g.position.y = yOff; g.castShadow = true; parent.add(g); return g;
}
function sphere(r, m, parent, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
  const g = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), m); g.position.set(x, y, z); g.scale.set(sx, sy, sz); g.castShadow = true; parent.add(g); return g;
}

function buildCharacter(kind) {
  const B = BODY[kind], skin = mat(B.skin, 0.7), top = mat(B.top, 0.55), bottom = mat(B.bottom, 0.6), shoe = mat(B.shoe, 0.5), hair = mat(B.hair, 0.8);
  const J = {}, group = new THREE.Group(), rig = new THREE.Group(); group.add(rig);
  const joint = (name, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); J[name] = o; return o; };

  // pelvis (root)
  const root = joint("root", rig, 0, 0.95, 0);
  sphere(B.hip + 0.045, bottom, root, 0, -0.01, 0, 1.25, 0.8, 0.95);
  // spine -> chest -> neck -> head
  const sp = joint("sp", root, 0, 0.04, 0);
  capsule(0.115, L.spine + 0.08, top, sp, L.spine / 2).scale.set(B.shoulder > 0.2 ? 1.15 : 1, 1, 0.82);
  const ch = joint("ch", sp, 0, L.spine, 0);
  const chestM = capsule(0.135, L.chest + 0.05, top, ch, L.chest / 2); chestM.scale.set(B.shoulder > 0.2 ? 1.28 : 1.12, 1, 0.78);
  const nk = joint("nk", ch, 0, L.chest, 0);
  capsule(0.04, L.neck + 0.03, skin, nk, L.neck / 2);
  const hd = joint("hd", nk, 0, L.neck, 0);
  sphere(L.head, skin, hd, 0, L.head * 0.95, 0.005, 0.92, 1.08, 1);            // head
  sphere(0.018, mat(0x222222, 0.4), hd, 0.04, L.head * 1.05, L.head * 0.88);    // eyes
  sphere(0.018, mat(0x222222, 0.4), hd, -0.04, L.head * 1.05, L.head * 0.88);
  sphere(L.head * 1.02, hair, hd, 0, L.head * 1.08, -0.018, 0.95, 1.0, 1.0);    // hair cap
  if (B.hairStyle === "pony") { // ponytail
    const pt = joint("pony", hd, 0, L.head * 1.35, -L.head * 0.85);
    sphere(0.035, hair, pt, 0, 0, 0); pt.rotation.x = 0.5; capsule(0.032, 0.2, hair, pt, -0.1);
  }
  // arms
  for (const s of ["L", "R"]) {
    const sx = s === "L" ? 1 : -1;
    const sh = joint("sh" + s, ch, sx * B.shoulder, L.chest - 0.04, 0);
    sphere(0.058, top, sh, 0, 0, 0);
    capsule(0.04, L.upper, B.shoulder > 0.2 ? top : skin, sh, -L.upper / 2);
    const el = joint("el" + s, sh, 0, -L.upper, 0);
    capsule(0.034, L.fore, skin, el, -L.fore / 2);
    sphere(0.04, skin, el, 0, -L.fore - 0.01, 0.005, 1, 1.15, 0.8);              // hand
    // legs
    const hp = joint("hp" + s, root, sx * B.hip, -0.03, 0);
    capsule(0.068, L.thigh + 0.02, bottom, hp, -L.thigh / 2);
    const kn = joint("kn" + s, hp, 0, -L.thigh, 0);
    capsule(0.052, L.shin, bottom, kn, -L.shin / 2);
    const an = joint("an" + s, kn, 0, -L.shin, 0);
    const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, L.foot - 0.09, 4, 10), shoe);
    foot.rotation.x = Math.PI / 2; foot.position.set(0, -L.ankleH + 0.035, 0.07); foot.scale.set(1, 1, 0.8); foot.castShadow = true; an.add(foot);
  }
  rig.scale.setScalar(B.scale);
  group.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { group, rig, J, B };
}

// apply an anatomical pose object to the rig joints
const ZERO = [0, 0, 0];
function applyPose(c, P) {
  const J = c.J, v = k => (P[k] || ZERO);
  const set = (name, x, y, z) => J[name].rotation.set(x * D2R, y * D2R, z * D2R);
  const r = P.root || {}, rr = r.r || ZERO, rp = r.p || ZERO;
  J.root.position.set(rp[0], 0.95 + rp[1], rp[2]);
  J.root.rotation.set(rr[0] * D2R, rr[1] * D2R, rr[2] * D2R, "YXZ");
  let a;
  a = v("sp"); set("sp", a[0], a[2], -a[1]);
  a = v("ch"); set("ch", a[0], a[2], -a[1]);
  a = v("nk"); set("nk", a[0], a[2], -a[1]);
  for (const s of ["L", "R"]) {
    const k = s === "L" ? 1 : -1;
    a = v("sh" + s); set("sh" + s, -a[0], -a[2] * k, a[1] * k);
    a = v("el" + s); set("el" + s, -a[0], 0, 0);
    a = v("hp" + s); set("hp" + s, -a[0], -a[2] * k, a[1] * k);
    a = v("kn" + s); set("kn" + s, a[0], 0, 0);
    a = v("an" + s); set("an" + s, -a[0], 0, 0);
  }
}

function lerpPose(A, B, t) {
  const out = {}, keys = new Set([...Object.keys(A), ...Object.keys(B)]);
  for (const k of keys) {
    if (k === "t") continue;
    if (k === "root") {
      const a = A.root || {}, b = B.root || {}, f = (x, y, d) => (x || d).map((q, i) => q + ((y || d)[i] - q) * t);
      out.root = { p: f(a.p, b.p, ZERO), r: f(a.r, b.r, ZERO), lift: (a.lift || 0) + ((b.lift || 0) - (a.lift || 0)) * t };
    } else { const a = A[k] || ZERO, b = B[k] || ZERO; out[k] = [0, 1, 2].map(i => (a[i] || 0) + ((b[i] || 0) - (a[i] || 0)) * t); }
  }
  return out;
}
export function samplePose(anim, phase) {
  const fr = anim.frames, n = fr.length; if (n === 1) return fr[0];
  const p = ((phase % 1) + 1) % 1;
  for (let i = 0; i < n; i++) {
    const a = fr[i], b = fr[(i + 1) % n], t0 = a.t, t1 = i === n - 1 ? 1 + fr[0].t : b.t;
    if (p >= t0 && p <= t1 + 1e-9) return lerpPose(a, b, ease(Math.min(1, Math.max(0, (p - t0) / (t1 - t0 || 1)))));
  }
  return fr[0];
}

const IDLE = { dur: 3, frames: [{ t: 0, ch: [2, 0, 0], shL: [0, 6, 0], shR: [0, 6, 0] }, { t: 0.5, ch: [-1, 0, 0], shL: [0, 8, 0], shR: [0, 8, 0], root: { p: [0, 0.01, 0] } }] };

export function mount(el, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!opts.preserve });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:none";
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a98a8, 1.0));
  const sun = new THREE.DirectionalLight(0xffffff, 1.7); sun.position.set(2.5, 4, 3); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 12 }); sun.shadow.bias = -0.0008; scene.add(sun);
  const rim = new THREE.DirectionalLight(0x9ec8ff, 0.7); rim.position.set(-3, 2, -3); scene.add(rim);
  // floor: soft disc + yoga mat
  const floor = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48), new THREE.ShadowMaterial({ opacity: 0.22 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const mat3 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.012, 2.0), new THREE.MeshStandardMaterial({ color: opts.matColor || 0x2fb350, roughness: 0.9 })); mat3.position.y = -0.006; mat3.receiveShadow = true; scene.add(mat3);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.2, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; scene.add(ring);

  let kind = opts.gender === "m" ? "m" : "f", ch = null, anim = IDLE, key = null, phase = 0, speed = 1, paused = false, raf = 0, last = 0, dead = false;
  let az = (opts.az ?? 30) * D2R, el_ = (opts.el ?? 12) * D2R, dist = opts.dist ?? 3.7, auto = opts.autorotate ?? false, drag = null;
  const tgt = new THREE.Vector3(0, 0.85, 0), box = new THREE.Box3();

  function build() { if (ch) { scene.remove(ch.group); ch.group.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } }); } ch = buildCharacter(kind); scene.add(ch.group); }
  function frame(ph) {
    const P = samplePose(anim, ph); applyPose(ch, P);
    ch.group.updateMatrixWorld(true);
    if (!anim.air) { box.setFromObject(ch.group); ch.J.root.position.y -= box.min.y; if (P.root && P.root.lift) ch.J.root.position.y += P.root.lift; }
    else if (P.root && P.root.lift) ch.J.root.position.y += P.root.lift;
    ch.group.updateMatrixWorld(true);
    box.setFromObject(ch.group); const c = box.getCenter(new THREE.Vector3());
    tgt.x += (c.x - tgt.x) * 0.08; tgt.y += (Math.max(0.5, c.y) - tgt.y) * 0.08; tgt.z += (c.z - tgt.z) * 0.08;
  }
  function render() {
    const r = Math.max(1.8, (anim.cam && anim.cam.dist) || dist);
    cam.position.set(tgt.x + Math.sin(az) * Math.cos(el_) * r, tgt.y + Math.sin(el_) * r + 0.1, tgt.z + Math.cos(az) * Math.cos(el_) * r);
    cam.lookAt(tgt); renderer.render(scene, cam);
  }
  function resize() { const w = el.clientWidth || 300, h = el.clientHeight || 300; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); render(); }
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null; ro && ro.observe(el);
  function loop(t) {
    if (dead) return; raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
    if (!paused) phase += (dt * speed) / (anim.dur || 3);
    if (auto && !drag) az += dt * 0.25;
    frame(phase); render();
  }
  const dom = renderer.domElement;
  dom.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, az, el: el_ }; dom.setPointerCapture(e.pointerId); });
  dom.addEventListener("pointermove", e => { if (!drag) return; az = drag.az - (e.clientX - drag.x) * 0.01; el_ = Math.max(-0.1, Math.min(1.2, drag.el + (e.clientY - drag.y) * 0.006)); });
  dom.addEventListener("pointerup", () => (drag = null)); dom.addEventListener("pointercancel", () => (drag = null));

  build(); resize(); last = performance.now();
  if (!opts.manual) raf = requestAnimationFrame(loop);
  const api = {
    setExercise(k) { key = k; anim = (window.FIT_ANIMS && window.FIT_ANIMS[k]) || IDLE; phase = 0; if (anim.cam) { if (anim.cam.az != null) az = anim.cam.az * D2R; if (anim.cam.el != null) el_ = anim.cam.el * D2R; } },
    hasAnim: k => !!(window.FIT_ANIMS && window.FIT_ANIMS[k]),
    setGender(g) { kind = g === "m" ? "m" : "f"; build(); },
    setSpeed(s) { speed = s; }, pause(p = true) { paused = p; }, setAutoRotate(a) { auto = a; },
    setView(name) { az = ({ front: 0, side: 90, back: 180, three: 30 }[name] ?? 30) * D2R; },
    renderAt(ph) { frame(ph); for (let i = 0; i < 25; i++) frame(ph); render(); },   // deterministic still (used for tests)
    resize, destroy() { dead = true; cancelAnimationFrame(raf); ro && ro.disconnect(); renderer.dispose(); dom.remove(); },
    get key() { return key; },
  };
  return api;
}
window.Fit3D = { mount, ready: true };
window.dispatchEvent(new Event("fit3d-ready"));
