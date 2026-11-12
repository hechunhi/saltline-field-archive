// Ported from the newer Saltline bundle (audio/music.js).
import { Qn, Se, St, Vo, Xt, ao, at, co, di, lo, tn } from "./synthesis.js";

function Q8(i, e) {
  let t = (n, s) => {
    let o = St(i, 1.4),
      r = [
        [0.062, 0.55],
        [0.089, 0.42],
        [0.118, 0.36],
        [0.151, 0.26],
        [0.178, 0.2],
        [0.243, 0.1],
      ];
    for (let [l, c] of r)
      Se(
        o,
        at(i, n, 0.01, 0.0018, {
          hp: 700,
          lp: 5500,
        }),
        l * (s ? 1.07 : 0.96) + Xt(n, 0, 0.006),
        c * Xt(n, 0.6, 1.15),
        i,
      );
    let a = Qn(i, 1.3, n);
    return (
      tn(a, "hp", 300, 0.7, i),
      di(a, "lp", Vo(6e3, 900, 0.6), 0.7, i),
      Se(o, lo(a, i, co(0.27, 0.04)), 0.04, 0.045, i),
      o
    );
  };
  return [t(ao(Math.floor(e() * 1e9)), 0), t(ao(Math.floor(e() * 1e9)), 1)];
}

function eC(i, e) {
  let t = (n, s) => {
    let o = St(i, 2.2),
      r = Qn(i, 2.18, n);
    (di(r, "lp", Vo(5200, 650, 0.5), 0.7, i),
      Se(o, lo(r, i, co(0.33, 0.006)), 0.012, 0.3, i));
    let a = Qn(i, 2.1, n);
    (tn(a, "lp", 260, 0.7, i), Se(o, lo(a, i, co(0.4, 0.01)), 0.012, 0.5, i));
    for (let [l, c] of [
      [0.018, 0.7],
      [0.031, 0.55],
      [0.047, 0.45],
      [0.093, 0.3],
      [0.139, 0.2],
    ])
      Se(
        o,
        at(i, n, 0.008, 0.0015, {
          lp: 4500,
        }),
        l * (s ? 1.09 : 0.95),
        c,
        i,
      );
    return o;
  };
  return [t(ao(Math.floor(e() * 1e9)), 0), t(ao(Math.floor(e() * 1e9)), 1)];
}

export { Q8, eC };
