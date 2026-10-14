// Exercise animations, group A. See scene3d.js for the format.
window.FIT_ANIMS = window.FIT_ANIMS || {};
Object.assign(window.FIT_ANIMS, {
  squat: { dur: 3.2, cam: { az: 70, el: 10 }, frames: [
    { t: 0, shL: [75, 0, 0], shR: [75, 0, 0] },
    { t: 0.5, root: { p: [0, 0, -0.12] }, sp: [28, 0, 0], shL: [85, 0, 0], shR: [85, 0, 0], hpL: [95, 6, 0], hpR: [95, 6, 0], knL: [105, 0, 0], knR: [105, 0, 0], anL: [18, 0, 0], anR: [18, 0, 0] },
  ] },
});
