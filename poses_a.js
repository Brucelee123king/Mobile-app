// Exercise animations, group A. See scene3d.js for the format.
window.FIT_ANIMS = window.FIT_ANIMS || {};
const both = (k, v) => ({ [k + "L"]: v, [k + "R"]: v });
Object.assign(window.FIT_ANIMS, {
  squat: { dur: 3.2, cam: { az: 70, el: 10 }, frames: [
    { t: 0, shL: [75, 0, 0], shR: [75, 0, 0] },
    { t: 0.5, root: { p: [0, 0, -0.12] }, sp: [28, 0, 0], shL: [85, 0, 0], shR: [85, 0, 0], hpL: [95, 6, 0], hpR: [95, 6, 0], knL: [105, 0, 0], knR: [105, 0, 0], anL: [18, 0, 0], anR: [18, 0, 0] },
  ] },
  lunge: { dur: 3.2, cam: { az: 80, el: 8 }, frames: [
    { t: 0, hpL: [30, 0, 0], knL: [8, 0, 0], hpR: [-22, 0, 0], knR: [10, 0, 0], anR: [-35, 0, 0], shL: [0, 25, 0], shR: [0, 25, 0], elL: [110, 0, 0], elR: [110, 0, 0] },
    { t: 0.5, root: { p: [0, 0, 0.05] }, hpL: [85, 0, 0], knL: [92, 0, 0], anL: [5, 0, 0], hpR: [-12, 0, 0], knR: [95, 0, 0], anR: [-45, 0, 0], shL: [0, 25, 0], shR: [0, 25, 0], elL: [110, 0, 0], elR: [110, 0, 0] },
  ] },
  pushup: { dur: 2.8, cam: { az: 85, el: 8 }, frames: [
    { t: 0, root: { r: [78, 0, 0] }, ...both("sh", [76, 0, 0]), ...both("el", [0, 0, 0]), ...both("an", [-20, 0, 0]) },
    { t: 0.5, root: { r: [84, 0, 0], p: [0, 0, 0.02] }, ...both("sh", [45, 0, 0]), ...both("el", [105, 0, 0]), ...both("an", [-20, 0, 0]) },
  ] },
  kneepush: { dur: 2.8, cam: { az: 85, el: 8 }, frames: [
    { t: 0, root: { r: [60, 0, 0] }, ...both("sh", [60, 0, 0]), ...both("hp", [0, 0, 0]), ...both("kn", [90, 0, 0]) },
    { t: 0.5, root: { r: [72, 0, 0] }, ...both("sh", [60, 0, 0]), ...both("el", [105, 0, 0]), ...both("hp", [0, 0, 0]), ...both("kn", [90, 0, 0]) },
  ] },
  wallpush: { dur: 2.8, cam: { az: 85, el: 8 }, frames: [
    { t: 0, root: { r: [12, 0, 0] }, ...both("sh", [90, 0, 0]), ...both("an", [-10, 0, 0]) },
    { t: 0.5, root: { r: [24, 0, 0] }, ...both("sh", [75, 0, 0]), ...both("el", [90, 0, 0]), ...both("an", [-20, 0, 0]) },
  ] },
  bridge: { dur: 3, cam: { az: 85, el: 10 }, frames: [
    { t: 0, root: { r: [-90, 0, 0] }, ...both("hp", [62, 0, 0]), ...both("kn", [130, 0, 0]), ...both("sh", [0, 10, 0]) },
    { t: 0.5, root: { r: [-108, 0, 0] }, ...both("hp", [10, 0, 0]), ...both("kn", [112, 0, 0]), ...both("sh", [0, 10, 0]) },
  ] },
  plank: { dur: 4, cam: { az: 85, el: 8 }, frames: [
    { t: 0, root: { r: [78, 0, 0] }, nk: [-25, 0, 0], ...both("sh", [78, 0, 0]), ...both("an", [-20, 0, 0]) },
    { t: 0.5, root: { r: [79, 0, 0] }, nk: [-25, 0, 0], ...both("sh", [79, 0, 0]), ...both("an", [-20, 0, 0]), ch: [1, 0, 0] },
  ] },
  mountain: { dur: 1.6, cam: { az: 85, el: 8 }, frames: [
    { t: 0, root: { r: [79, 0, 0] }, nk: [-25, 0, 0], ...both("sh", [79, 0, 0]), hpL: [90, 0, 0], knL: [105, 0, 0], hpR: [14, 0, 0], anR: [-20, 0, 0] },
    { t: 0.5, root: { r: [79, 0, 0] }, nk: [-25, 0, 0], ...both("sh", [79, 0, 0]), hpR: [90, 0, 0], knR: [105, 0, 0], hpL: [14, 0, 0], anL: [-20, 0, 0] },
  ] },
  jack: { dur: 1.4, air: true, cam: { az: 15, el: 6 }, frames: [
    { t: 0, ...both("sh", [0, 5, 0]), hpL: [0, 2, 0], hpR: [0, 2, 0] },
    { t: 0.5, root: { lift: 0.1 }, shL: [0, 160, 0], shR: [0, 160, 0], hpL: [0, 22, 0], hpR: [0, 22, 0] },
  ] },
  knees: { dur: 1.8, cam: { az: 80, el: 8 }, frames: [
    { t: 0, hpL: [95, 0, 0], knL: [100, 0, 0], shL: [30, 0, 0], shR: [30, 0, 0], elL: [90, 0, 0], elR: [90, 0, 0] },
    { t: 0.5, hpR: [95, 0, 0], knR: [100, 0, 0], shL: [30, 0, 0], shR: [30, 0, 0], elL: [90, 0, 0], elR: [90, 0, 0] },
  ] },
  dips: { dur: 2.8, cam: { az: 85, el: 8 }, frames: [
    { t: 0, root: { r: [-42, 0, 0] }, ...both("sh", [-65, 0, 0]), ...both("hp", [80, 0, 0]), ...both("kn", [120, 0, 0]) },
    { t: 0.5, root: { r: [-42, 0, 0], p: [0, 0, 0] }, ...both("sh", [-78, 0, 0]), ...both("el", [60, 0, 0]), ...both("hp", [80, 0, 0]), ...both("kn", [120, 0, 0]) },
  ] },
  superman: { dur: 3, cam: { az: 85, el: 10 }, frames: [
    { t: 0, root: { r: [90, 0, 0] }, ...both("sh", [170, 0, 0]), ...both("hp", [0, 0, 0]) },
    { t: 0.5, root: { r: [90, 0, 0] }, sp: [-15, 0, 0], ch: [-15, 0, 0], nk: [-10, 0, 0], ...both("sh", [170, 0, 0]), ...both("hp", [-20, 0, 0]) },
  ] },
});
