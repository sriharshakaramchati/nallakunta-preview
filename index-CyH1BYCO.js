import * as t from "three";
import { FullScreenQuad as po } from "three/addons/postprocessing/Pass.js";
import { mergeGeometries as mo, mergeVertices as wo } from "three/addons/utils/BufferGeometryUtils.js";
(function() {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload")) return;
  for (const l of document.querySelectorAll('link[rel="modulepreload"]')) a(l);
  new MutationObserver((l) => {
    for (const i of l) if (i.type === "childList") for (const r of i.addedNodes) r.tagName === "LINK" && r.rel === "modulepreload" && a(r);
  }).observe(document, { childList: true, subtree: true });
  function n(l) {
    const i = {};
    return l.integrity && (i.integrity = l.integrity), l.referrerPolicy && (i.referrerPolicy = l.referrerPolicy), l.crossOrigin === "use-credentials" ? i.credentials = "include" : l.crossOrigin === "anonymous" ? i.credentials = "omit" : i.credentials = "same-origin", i;
  }
  function a(l) {
    if (l.ep) return;
    l.ep = true;
    const i = n(l);
    fetch(l.href, i);
  }
})();
const R = { skyTop: 9420266, skyMid: 13953274, skyHaze: 16640466, cloud: 16644856, cloudShade: 15392728, fog: 15722196, sun: 16773592, fill: 11124213, hemiSky: 14478591, hemiGround: 12558206, ink: 3748431, road: 9275520, sidewalk: 14472644, sidewalkAlt: 15064521, curb: 13222576, concrete: 14275526, concreteMid: 12893611, wallWhite: 16447215, wallGray: 14606054, red: 14697791, redDeep: 11874863, yellow: 16039987,
black: 3288635, blueDeep: 2772887, orange: 15698492, leaf: 5940600, leafDeep: 4161376, blossomLight: 16503526, petal: 15771852, petalDeep: 14052260, metal: 12106950, metalDark: 8883094, mirrorFace: 13162724, rope: 15787466, bamboo: 9744491 }, gt = { uniforms: { tDiffuse: { value: null }, tDepth: { value: null }, uTexel: { value: new t.Vector2() }, uNear: { value: 0.25 }, uFar: { value: 600 }, uInk: {
value: new t.Color(R.ink) }, uThickness: { value: 1.35 }, uSens: { value: 42e-4 }, uConcave: { value: 0.026 }, uConcaveAmount: { value: 0.42 }, uFadeStart: { value: 40 }, uFadeEnd: { value: 98 }, uStrength: { value: 1 }, uSkyDepth: { value: 420 } }, vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4( position.xy, 0.0, 1.0 );
    }
  `, fragmentShader: `
    #include <packing>
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform vec2 uTexel;
    uniform float uNear, uFar;
    uniform vec3 uInk;
    uniform float uThickness, uSens, uConcave, uConcaveAmount;
    uniform float uFadeStart, uFadeEnd, uStrength, uSkyDepth;
    varying vec2 vUv;

    float linearDepth( vec2 uv ) {
      float d = texture2D( tDepth, uv ).x;
      return -perspectiveDepthToViewZ( d, uNear, uFar );
    }

    void main() {
      vec3 col = texture2D( tDiffuse, vUv ).rgb;

      vec2 t = uTexel * uThickness;
      float dc = linearDepth( vUv );

      if ( dc > uSkyDepth ) {
        // pure sky: nothing to ink
        gl_FragColor = vec4( col, 1.0 );
        return;
      }

      float dl = linearDepth( vUv - vec2( t.x, 0.0 ) );
      float dr = linearDepth( vUv + vec2( t.x, 0.0 ) );
      float du = linearDepth( vUv + vec2( 0.0, t.y ) );
      float dd = linearDepth( vUv - vec2( 0.0, t.y ) );

      // second difference of linear depth, normalised by distance
      float sx = ( dl + dr - 2.0 * dc ) / dc;
      float sy = ( du + dd - 2.0 * dc ) / dc;

      float convex  = max( 0.0,  sx ) + max( 0.0,  sy );
      float concave = max( 0.0, -sx ) + max( 0.0, -sy );

      float edge = smoothstep( uSens * 0.32, uSens, convex );
      edge = max( edge, smoothstep( uConcave, uConcave * 3.4, concave ) * uConcaveAmount );

      // let the background dissolve into the haze instead of getting busy
      edge *= 1.0 - smoothstep( uFadeStart, uFadeEnd, dc );
      edge *= uStrength;

      // ink keeps a whisper of the underlying hue so it never looks pasted on
      vec3 line = mix( uInk, col * 0.42, 0.22 );
      gl_FragColor = vec4( mix( col, line, clamp( edge, 0.0, 1.0 ) ), 1.0 );
    }
  ` }, xo = { uniforms: { tDiffuse: { value: null }, uShadowTint: { value: new t.Color(11380944) }, uLightTint: { value: new t.Color(16775144) }, uSaturation: { value: 1.12 }, uLift: { value: 0.032 }, uVignette: { value: 0.15 }, uWarmth: { value: 0.05 } }, vertexShader: gt.vertexShader, fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 uShadowTint, uLightTint;
    uniform float uSaturation, uLift, uVignette, uWarmth;
    varying vec2 vUv;

    vec3 linearToSRGB( vec3 c ) {
      return mix( c * 12.92, 1.055 * pow( max( c, vec3( 0.0031308 ) ), vec3( 1.0 / 2.4 ) ) - 0.055,
                  step( 0.0031308, c ) );
    }

    void main() {
      vec3 c = texture2D( tDiffuse, vUv ).rgb;
      float l = dot( c, vec3( 0.2126, 0.7152, 0.0722 ) );

      // split-tone: cool violet in the darks, warm paper white in the lights
      float k = smoothstep( 0.02, 0.55, l );
      c *= mix( uShadowTint, uLightTint, k );

      // gentle overall warmth, like late afternoon light through blossom
      c += vec3( uWarmth, uWarmth * 0.45, 0.0 ) * l * 0.35;

      // keep shadows readable -- never crushed to black
      c = c + uLift * ( 1.0 - k );

      c = mix( vec3( l ), c, uSaturation );

      float r = length( vUv - 0.5 ) * 1.42;
      c *= 1.0 - uVignette * pow( clamp( r, 0.0, 1.0 ), 2.6 );

      gl_FragColor = vec4( linearToSRGB( max( c, vec3( 0.0 ) ) ), 1.0 );
    }
  ` }, yo = { uniforms: { tDiffuse: { value: null }, uTexel: { value: new t.Vector2() } }, vertexShader: gt.vertexShader, fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uTexel;
    varying vec2 vUv;

    float luma( vec3 c ) { return dot( c, vec3( 0.299, 0.587, 0.114 ) ); }

    void main() {
      vec3 cM = texture2D( tDiffuse, vUv ).rgb;
      vec3 cNW = texture2D( tDiffuse, vUv + vec2( -uTexel.x, -uTexel.y ) ).rgb;
      vec3 cNE = texture2D( tDiffuse, vUv + vec2(  uTexel.x, -uTexel.y ) ).rgb;
      vec3 cSW = texture2D( tDiffuse, vUv + vec2( -uTexel.x,  uTexel.y ) ).rgb;
      vec3 cSE = texture2D( tDiffuse, vUv + vec2(  uTexel.x,  uTexel.y ) ).rgb;

      float lM = luma( cM ), lNW = luma( cNW ), lNE = luma( cNE ),
            lSW = luma( cSW ), lSE = luma( cSE );
      float lMin = min( lM, min( min( lNW, lNE ), min( lSW, lSE ) ) );
      float lMax = max( lM, max( max( lNW, lNE ), max( lSW, lSE ) ) );

      vec2 dir = vec2(
        -( ( lNW + lNE ) - ( lSW + lSE ) ),
         ( ( lNW + lSW ) - ( lNE + lSE ) )
      );
      float reduce = max( ( lNW + lNE + lSW + lSE ) * 0.25 * 0.18, 1.0 / 128.0 );
      float rcp = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + reduce );
      dir = clamp( dir * rcp, vec2( -8.0 ), vec2( 8.0 ) ) * uTexel;

      vec3 rgbA = 0.5 * (
        texture2D( tDiffuse, vUv + dir * ( 1.0 / 3.0 - 0.5 ) ).rgb +
        texture2D( tDiffuse, vUv + dir * ( 2.0 / 3.0 - 0.5 ) ).rgb );
      vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture2D( tDiffuse, vUv - dir * 0.5 ).rgb +
        texture2D( tDiffuse, vUv + dir * 0.5 ).rgb );

      float lB = luma( rgbB );
      gl_FragColor = vec4( ( lB < lMin || lB > lMax ) ? rgbA : rgbB, 1.0 );
    }
  ` };
function at(o) {
  const e = new t.ShaderMaterial({ uniforms: t.UniformsUtils.clone(o.uniforms), vertexShader: o.vertexShader, fragmentShader: o.fragmentShader, depthTest: false, depthWrite: false });
  return { quad: new po(e), mat: e };
}
class go {
  constructor(e, n, a, { pixelBudget: l = 46e5 } = {}) {
    this.renderer = e, this.scene = n, this.camera = a, this.pixelBudget = l, this.size = new t.Vector2(1, 1);
    const i = { type: t.HalfFloatType, minFilter: t.LinearFilter, magFilter: t.LinearFilter, depthBuffer: true, stencilBuffer: false, colorSpace: t.NoColorSpace };
    this.rtScene = new t.WebGLRenderTarget(2, 2, i), this.rtScene.depthTexture = new t.DepthTexture(2, 2), this.rtScene.depthTexture.format = t.DepthFormat, this.rtScene.depthTexture.type = t.UnsignedIntType, this.rtScene.depthTexture.minFilter = t.NearestFilter, this.rtScene.depthTexture.magFilter = t.NearestFilter, this.rtA = new t.WebGLRenderTarget(2, 2, { ...i, depthBuffer: false }), this.rtB =
    new t.WebGLRenderTarget(2, 2, { ...i, type: t.UnsignedByteType, depthBuffer: false });
    const r = at(gt), s = at(xo), c = at(yo);
    this.ink = r, this.grade = s, this.fxaa = c, r.mat.uniforms.tDepth.value = this.rtScene.depthTexture, this.enabled = { ink: true, grade: true, fxaa: true };
  }
  setSize(e, n) {
    const a = window.devicePixelRatio || 1;
    let l = this.forceScale || (a < 1.5 ? 1.5 : Math.min(a, 2));
    e * n * l * l > this.pixelBudget && (l = Math.max(1, Math.sqrt(this.pixelBudget / (e * n)))), this.scale = l;
    const i = Math.max(2, Math.floor(e * l)), r = Math.max(2, Math.floor(n * l));
    this.size.set(i, r), this.renderer.setPixelRatio(1), this.renderer.setSize(e, n, true), this.rtScene.setSize(i, r), this.rtA.setSize(i, r), this.rtB.setSize(i, r);
    const s = new t.Vector2(1 / i, 1 / r);
    this.ink.mat.uniforms.uTexel.value.copy(s), this.fxaa.mat.uniforms.uTexel.value.copy(s), this.ink.mat.uniforms.uNear.value = this.camera.near, this.ink.mat.uniforms.uFar.value = this.camera.far, this.ink.mat.uniforms.uThickness.value = 1.05 + 0.55 * l;
  }
  render() {
    const e = this.renderer;
    e.setRenderTarget(this.rtScene), e.clear(), e.render(this.scene, this.camera);
    let n = this.rtScene.texture;
    this.enabled.ink && (this.ink.mat.uniforms.tDiffuse.value = n, e.setRenderTarget(this.rtA), this.ink.quad.render(e), n = this.rtA.texture);
    const a = this.enabled.fxaa ? this.rtB : null;
    this.grade.mat.uniforms.tDiffuse.value = n, e.setRenderTarget(a), this.grade.quad.render(e), this.enabled.fxaa && (this.fxaa.mat.uniforms.tDiffuse.value = this.rtB.texture, e.setRenderTarget(null), this.fxaa.quad.render(e)), e.setRenderTarget(null);
  }
  dispose() {
    [this.rtScene, this.rtA, this.rtB].forEach((e) => e.dispose()), [this.ink, this.grade, this.fxaa].forEach((e) => {
      e.quad.dispose(), e.mat.dispose();
    });
  }
}
const St = { 2: [96, 255], 3: [92, 178, 255], 4: [80, 142, 202, 255], 5: [74, 124, 172, 214, 255], soft: [180, 255], soft3: [172, 214, 255] }, st = /* @__PURE__ */ new Map();
function bo(o = 3) {
  const e = o;
  if (st.has(e)) return st.get(e);
  const n = St[o] || St[3], a = new Uint8Array(n.length * 4);
  for (let i = 0; i < n.length; i++) a[i * 4 + 0] = n[i], a[i * 4 + 1] = n[i], a[i * 4 + 2] = n[i], a[i * 4 + 3] = 255;
  const l = new t.DataTexture(a, n.length, 1, t.RGBAFormat);
  return l.minFilter = t.NearestFilter, l.magFilter = t.NearestFilter, l.generateMipmaps = false, l.needsUpdate = true, st.set(e, l), l;
}
const Xt = "lights_toon_pars_fragment", zt = "vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;", vo = `
	vec3 celBand = getGradientIrradiance( geometryNormal, directLight.direction );
	vec3 irradiance = celBand * mix( uShadowTint, vec3( 1.0 ), celBand ) * directLight.color;`;
let Zt = false, Jt = "";
{
  const o = t.ShaderChunk[Xt];
  o && o.includes(zt) && (Jt = `uniform vec3 uShadowTint;
` + o.replace(zt, vo), Zt = true);
}
function Mo(o, e) {
  if (!Zt) return o;
  const n = { value: new t.Color(e) };
  o.userData.shadowTint = n, o.onBeforeCompile = (l) => {
    l.uniforms.uShadowTint = n, l.fragmentShader = l.fragmentShader.replace(`#include <${Xt}>`, Jt);
  };
  const a = new t.Color(e).getHexString();
  return o.customProgramCacheKey = () => "celTint_" + a, o;
}
const rt = /* @__PURE__ */ new Map();
function v(o = {}) {
  const { color: e = 16777215, bands: n = 3, tint: a = 7102348, flat: l = true, map: i = null, emissive: r = null, emissiveIntensity: s = 1, transparent: c = false, opacity: d = 1, side: u = t.FrontSide, alphaTest: f = 0, depthWrite: h = null, fog: p = true, alphaMap: y = null, vertexColors: w = false, cache: T = true } = o, z = T && !i && !y ? [e, n, a, l, r, s, c, d, u, f, h, p, w].join("|") : null;
  if (z && rt.has(z)) return rt.get(z);
  const b = new t.MeshToonMaterial({ color: e, gradientMap: bo(n), flatShading: l, map: i, alphaMap: y, transparent: c, opacity: d, side: u, alphaTest: f, fog: p, vertexColors: w, emissive: r === null ? 0 : r, emissiveIntensity: s });
  return h !== null && (b.depthWrite = h), Mo(b, a), z && rt.set(z, b), b;
}
const it = /* @__PURE__ */ new Map();
function j(o = {}) {
  const { color: e = 16777215, map: n = null, transparent: a = false, opacity: l = 1, side: i = t.FrontSide, alphaTest: r = 0, depthWrite: s = null, fog: c = true, cache: d = true, toneMapped: u = true } = o, f = d && !n ? [e, a, l, i, r, s, c, u].join("|") : null;
  if (f && it.has(f)) return it.get(f);
  const h = new t.MeshBasicMaterial({ color: e, map: n, transparent: a, opacity: l, side: i, alphaTest: r, fog: c, toneMapped: u });
  return s !== null && (h.depthWrite = s), f && it.set(f, h), h;
}
const bt = "'Yu Gothic', 'Yu Gothic UI', 'Meiryo', 'MS Gothic', 'Hiragino Kaku Gothic ProN', sans-serif", ct = /* @__PURE__ */ new Map();
function Qe(o, e, n, { srgb: a = true, repeat: l = null, aniso: i = 4 } = {}) {
  const r = document.createElement("canvas");
  r.width = o, r.height = e;
  const s = r.getContext("2d");
  s.imageSmoothingEnabled = true, n(s, o, e);
  const c = new t.CanvasTexture(r);
  return a && (c.colorSpace = t.SRGBColorSpace), c.anisotropy = i, l && (c.wrapS = c.wrapT = t.RepeatWrapping, c.repeat.set(l[0], l[1])), c.needsUpdate = true, c;
}
function Xe(o, e) {
  return ct.has(o) || ct.set(o, e()), ct.get(o);
}
const lt = (o) => "#" + o.toString(16).padStart(6, "0");
function ko(o, e, n, a, l = bt, i = "bold") {
  let r = a;
  do {
    if (o.font = `${i} ${r}px ${l}`, o.measureText(e).width <= n) break;
    r -= 2;
  } while (r > 6);
  return r;
}
function So(o, e, n, a, l, i, r, s = "bold", c = 0) {
  const d = ko(o, e, l, i, bt, s);
  if (o.fillStyle = r, o.textAlign = c ? "left" : "center", o.textBaseline = "middle", c) {
    const u = [...e], f = u.reduce((p, y) => p + o.measureText(y).width + c, -c);
    let h = n - f / 2;
    for (const p of u) o.fillText(p, h, a), h += o.measureText(p).width + c;
  } else o.fillText(e, n, a);
  return d;
}
function zo(o, e, n, a, l, i, r) {
  o.font = `bold ${i}px ${bt}`, o.fillStyle = r, o.textAlign = "center", o.textBaseline = "middle", [...e].forEach((s, c) => o.fillText(s, n, a + c * l));
}
const To = (o = 0) => Xe("warnPlate" + o, () => Qe(256, 512, (e, n, a) => {
  const l = [{ bg: R.yellow, fg: R.black, t: "CCTV" }, { bg: R.red, fg: 16644336, t: "DANGER" }, { bg: 16644336, fg: R.blueDeep, t: "SLOW" }, { bg: 16644336, fg: R.redDeep, t: "11 KV" }], i = l[o % l.length];
  e.fillStyle = lt(i.bg), e.fillRect(0, 0, n, a), e.fillStyle = lt(i.fg), e.fillRect(12, 12, n - 24, 6), e.fillRect(12, a - 18, n - 24, 6), zo(e, i.t, n / 2, 90, 88, 74, lt(i.fg));
})), Go = () => Xe("platePlate", () => Qe(256, 128, (o, e, n) => {
  o.fillStyle = "#f6f4f0", o.fillRect(0, 0, e, n), o.strokeStyle = "#4f5a72", o.lineWidth = 8, o.strokeRect(8, 8, e - 16, n - 16), So(o, "\u3055 21-08", e / 2, n / 2, e - 40, 56, "#2f3646");
})), Ao = () => Xe("petalTex", () => Qe(128, 128, (o, e, n) => {
  o.clearRect(0, 0, e, n), o.translate(e / 2, n / 2), o.fillStyle = "#ffffff", o.beginPath(), o.moveTo(0, 52), o.bezierCurveTo(38, 34, 46, -14, 14, -48), o.bezierCurveTo(6, -38, 2, -34, 0, -30), o.bezierCurveTo(-2, -34, -6, -38, -14, -48), o.bezierCurveTo(-46, -14, -38, 34, 0, 52), o.closePath(), o.fill();
}, { srgb: false })), Bo = () => Xe("cloudTex", () => Qe(512, 256, (o, e, n) => {
  o.clearRect(0, 0, e, n);
  const a = [[0.22, 0.62, 0.15], [0.36, 0.46, 0.2], [0.52, 0.4, 0.24], [0.68, 0.5, 0.19], [0.82, 0.63, 0.14], [0.45, 0.66, 0.2], [0.6, 0.68, 0.17]];
  o.fillStyle = "#ffffff";
  for (const [l, i, r] of a) o.beginPath(), o.ellipse(l * e, i * n, r * e * 0.55, r * n * 1.1, 0, 0, Math.PI * 2), o.fill();
  o.globalCompositeOperation = "destination-out", o.fillRect(0, n * 0.78, e, n * 0.22), o.globalCompositeOperation = "source-over";
}, { srgb: false })), De = (o, e, n) => o < e ? e : o > n ? n : o;
function Tt(o, e, n) {
  const a = De((n - o) / (e - o || 1e-6), 0, 1);
  return a * a * (3 - 2 * a);
}
function Co(o) {
  let e = o >>> 0;
  return function() {
    e = e + 1831565813 >>> 0;
    let n = e;
    return n = Math.imul(n ^ n >>> 15, n | 1), n ^= n + Math.imul(n ^ n >>> 7, n | 61), ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}
function Se(o) {
  const e = Co(o);
  return { next: e, range: (n, a) => n + (a - n) * e(), int: (n, a) => Math.floor(n + (a - n + 1) * e()), pick: (n) => n[Math.floor(e() * n.length) % n.length], chance: (n) => e() < n, sign: () => e() < 0.5 ? -1 : 1 };
}
function Ze(o) {
  let e = o.map(({ geometry: i, matrix: r }) => {
    const s = i.clone();
    return r && s.applyMatrix4(r), s;
  });
  const n = e.filter((i) => i.index).length;
  n > 0 && n < e.length && (e = e.map((i) => {
    if (!i.index) return i;
    const r = i.toNonIndexed();
    return i.dispose(), r;
  }));
  const a = e.reduce((i, r) => i.filter((s) => r.attributes[s] !== void 0), Object.keys(e[0].attributes));
  for (const i of e) for (const r of Object.keys(i.attributes)) a.includes(r) || i.deleteAttribute(r);
  const l = mo(e, false);
  return e.forEach((i) => i.dispose()), l;
}
const Ro = new t.Matrix4(), Gt = new t.Quaternion(), At = new t.Euler(), Bt = new t.Vector3(), Ct = new t.Vector3();
function B(o = 0, e = 0, n = 0, a = 0, l = 0, i = 0, r = 1, s = 1, c = 1) {
  return Bt.set(o, e, n), At.set(a, l, i), Gt.setFromEuler(At), Ct.set(r, s, c), Ro.clone().compose(Bt, Gt, Ct);
}
function eo(o, e, n, a, l = 0, i = 0, r = 0) {
  const s = new t.Mesh(new t.BoxGeometry(o, e, n), a);
  return s.position.set(l, i, r), s;
}
function Eo(o, e, n, a, l, i = 0, r = 0, s = 0) {
  const c = new t.Mesh(new t.CylinderGeometry(o, e, n, a), l);
  return c.position.set(i, r, s), c;
}
function re(o, e = true, n = true) {
  return o.traverse((a) => {
    if (!a.isMesh) return;
    const l = a.userData.noShadow || a.material && !Array.isArray(a.material) && a.material.transparent;
    a.castShadow = e && !l, a.receiveShadow = n;
  }), o;
}
function Po(o, e, n, a = 14) {
  const l = [];
  for (let i = 0; i <= a; i++) {
    const r = i / a, s = new t.Vector3().lerpVectors(o, e, r);
    s.y -= Math.sin(Math.PI * r) * n, l.push(s);
  }
  return new t.CatmullRomCurve3(l);
}
function Io(o, e = 500) {
  const n = new t.SphereGeometry(e, 32, 20), a = new t.ShaderMaterial({ side: t.BackSide, depthWrite: true, fog: false, uniforms: { uTop: { value: new t.Color(R.skyTop) }, uMid: { value: new t.Color(R.skyMid) }, uHaze: { value: new t.Color(R.skyHaze) }, uBands: { value: 26 } }, vertexShader: `
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4( position, 1.0 );
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `, fragmentShader: `
      uniform vec3 uTop, uMid, uHaze;
      uniform float uBands;
      varying vec3 vWorld;

      void main() {
        float h = normalize( vWorld ).y;
        // soft quantisation: mostly smooth, with a faint painted step
        float t = clamp( h * 1.15 + 0.02, 0.0, 1.0 );
        float q = floor( t * uBands ) / uBands;
        t = mix( t, q, 0.35 );

        vec3 col = mix( uHaze, uMid, smoothstep( 0.0, 0.30, t ) );
        col = mix( col, uTop, smoothstep( 0.26, 0.92, t ) );

        // a touch of warmth low in the sky, opposite the sun
        col = mix( col, uHaze, smoothstep( 0.12, -0.05, h ) * 0.6 );
        gl_FragColor = vec4( col, 1.0 );
      }
    ` }), l = new t.Mesh(n, a);
  l.frustumCulled = false, l.renderOrder = -10, o.add(l);
  const i = Bo(), r = Se(7781), s = new t.Group(), c = j({ color: R.cloud, map: i, transparent: true, opacity: 0.62, depthWrite: false, fog: false, cache: false }), d = j({ color: R.cloudShade, map: i, transparent: true, opacity: 0.34, depthWrite: false, fog: false, cache: false });
  c.map.wrapS = c.map.wrapT = t.ClampToEdgeWrapping;
  for (let u = 0; u < 22; u++) {
    const f = r.range(220, 350), h = r.range(0, Math.PI * 2), p = r.range(90, 210), y = p * r.range(0.24, 0.34), w = r.range(46, 140), T = new t.Group(), z = new t.Mesh(new t.PlaneGeometry(p, y), d);
    z.position.set(2, -y * 0.1, -1.5);
    const b = new t.Mesh(new t.PlaneGeometry(p, y), c);
    T.add(z, b), T.position.set(Math.cos(h) * f, w, Math.sin(h) * f), T.lookAt(0, w * 0.55, 0), T.renderOrder = -9, s.add(T);
  }
  return s.frustumCulled = false, o.add(s), { dome: l, clouds: s };
}
const F = 3.15, O = 1.55, le = 0.135, Do = 0.015, me = -80, we = 80;
function N(o) {
  let e = 0;
  return e += 2 * Tt(-20, -50, o), e -= 2.4 * Tt(20, 52, o), e;
}
function Je(o) {
  return 0;
}
function Lo(o, e) {
  return o - N(e);
}
function _o(o, e) {
  if (e < me || e > we) return false;
  const n = Math.abs(Lo(o, e));
  return n > F - 0.02 && n < F + O;
}
function Rt(o, e) {
  return Je() + (_o(o, e) ? le : 0);
}
function ze({ z0: o, z1: e, step: n = 1.2, a, b: l, uv: i = [1, 1], flip: r = false }) {
  const s = Math.max(2, Math.round(Math.abs(e - o) / n) + 1), c = [], d = [], u = [];
  for (let h = 0; h < s; h++) {
    const p = h / (s - 1), y = o + (e - o) * p, w = a(y), T = l(y);
    c.push(w.x, w.y, y, T.x, T.y, y), d.push(0, p * i[1], i[0], p * i[1]);
  }
  for (let h = 0; h < s - 1; h++) {
    const p = h * 2;
    r ? u.push(p, p + 1, p + 2, p + 1, p + 3, p + 2) : u.push(p, p + 2, p + 1, p + 1, p + 2, p + 3);
  }
  const f = new t.BufferGeometry();
  return f.setAttribute("position", new t.Float32BufferAttribute(c, 3)), f.setAttribute("uv", new t.Float32BufferAttribute(d, 2)), f.setIndex(u), f.computeVertexNormals(), f;
}
function Vo(o, e) {
  return false;
}
const Y = 160, be = 2 * Math.PI * Y, ie = new t.Vector3(0, -Y, 0), $ = new t.Vector3(), Ve = new t.Quaternion(), Fe = new t.Vector3(), Ne = new t.Matrix4();
function Fo(o, e, n = new t.Vector3()) {
  const a = o / Y, l = e / Y, i = Math.cos(l);
  return n.set(Math.sin(a) * i, Math.cos(a) * i, Math.sin(l));
}
function ke(o, e, n, a = new t.Vector3()) {
  return Fo(o, n, a).multiplyScalar(Y + e).add(ie), a;
}
function Ge(o, e, n = new t.Vector3(), a = new t.Vector3(), l = new t.Vector3()) {
  const i = o / Y, r = e / Y, s = Math.sin(i), c = Math.cos(i), d = Math.sin(r), u = Math.cos(r);
  return n.set(s * u, c * u, d), a.set(c, -s, 0), l.set(-s * d, -c * d, u), { up: n, east: a, north: l };
}
function to(o, e = { x: 0, z: 0, y: 0 }) {
  $.copy(o).sub(ie);
  const n = $.length() || 1;
  return $.multiplyScalar(1 / n), e.z = Y * Math.asin(t.MathUtils.clamp($.z, -1, 1)), e.x = Y * Math.atan2($.x, $.y), e.y = n - Y, e;
}
function No(o, e) {
  let n = o - e;
  for (; n > be / 2; ) n -= be;
  for (; n < -be / 2; ) n += be;
  return n;
}
function pe(o) {
  const e = be;
  return ((o + e / 2) % e + e) % e - e / 2;
}
function Oo(o, e) {
  let n = o.index ? o.toNonIndexed() : o;
  const a = e * e;
  let i = Object.keys(n.attributes).map((u) => ({ name: u, size: n.attributes[u].itemSize, src: n.attributes[u].array })), r = n.attributes.position.count;
  const s = o.groups && o.groups.length ? o.groups : null;
  let c = new Int32Array(r / 3);
  if (s) for (const u of s) {
    const f = Math.floor(u.start / 3), h = Math.min(c.length, f + Math.floor(u.count / 3));
    for (let p = f; p < h; p++) c[p] = u.materialIndex ?? 0;
  }
  for (let u = 0; u < 12; u++) {
    const f = i.find((w) => w.name === "position").src;
    let h = 0;
    const p = i.map((w) => ({ name: w.name, size: w.size, dst: [] })), y = [];
    for (let w = 0; w < r; w += 3) {
      let T = -1, z = 0;
      for (let x = 0; x < 3; x++) {
        const S = w + x, G = w + (x + 1) % 3, M = f[S * 3] - f[G * 3], g = f[S * 3 + 1] - f[G * 3 + 1], A = f[S * 3 + 2] - f[G * 3 + 2], V = M * M + g * g + A * A;
        V > T && (T = V, z = x);
      }
      if (T <= a) {
        for (const x of p) {
          const S = i.find((G) => G.name === x.name).src;
          for (let G = 0; G < 3; G++) for (let M = 0; M < x.size; M++) x.dst.push(S[(w + G) * x.size + M]);
        }
        y.push(c[w / 3]);
        continue;
      }
      h++, y.push(c[w / 3], c[w / 3]);
      const b = w + z, m = w + (z + 1) % 3, k = w + (z + 2) % 3;
      for (const x of p) {
        const S = i.find((g) => g.name === x.name).src, G = [];
        for (let g = 0; g < x.size; g++) G.push((S[b * x.size + g] + S[m * x.size + g]) * 0.5);
        const M = (g) => {
          for (let A = 0; A < x.size; A++) x.dst.push(S[g * x.size + A]);
        };
        M(b), x.dst.push(...G), M(k), x.dst.push(...G), M(m), M(k);
      }
    }
    if (i = p.map((w) => ({ name: w.name, size: w.size, src: Float32Array.from(w.dst) })), c = Int32Array.from(y), r = i.find((w) => w.name === "position").src.length / 3, !h) break;
  }
  const d = new t.BufferGeometry();
  for (const u of i) d.setAttribute(u.name, new t.BufferAttribute(u.src, u.size));
  if (s) {
    let u = 0;
    for (let f = 1; f <= c.length; f++) (f === c.length || c[f] !== c[u]) && (d.addGroup(u * 3, (f - u) * 3, c[u]), u = f);
  }
  return n !== o && n.dispose(), d;
}
function Wo(o, e = 3) {
  const n = Oo(o, e), a = n.attributes.position, l = new t.Vector3();
  for (let i = 0; i < a.count; i++) ke(a.getX(i), a.getY(i), a.getZ(i), l), a.setXYZ(i, l.x, l.y, l.z);
  return a.needsUpdate = true, n.deleteAttribute("normal"), n.computeVertexNormals(), n.computeBoundingSphere(), n;
}
function Ho(o, { maxEdge: e = 3 } = {}) {
  o.updateMatrixWorld(true);
  const n = (s) => {
    for (let c = s.parent; c && c !== o.parent; c = c.parent) if (c.userData.planetRigid) return true;
    return false;
  }, a = [];
  o.traverse((s) => {
    s.userData.planetRigid && !n(s) && a.push({ obj: s, world: s.matrixWorld.clone() });
  });
  const l = [];
  o.traverse((s) => {
    !s.isMesh && !s.isLine || s.userData.planetRigid || n(s) || l.push({ obj: s, world: s.matrixWorld.clone() });
  });
  const i = { wrapped: 0, instanced: 0, rigid: a.length, tris: 0 };
  for (const { obj: s, world: c } of l) {
    if (s.isInstancedMesh) {
      const d = s.count, u = s.instanceMatrix;
      for (let f = 0; f < d; f++) {
        Ne.fromArray(u.array, f * 16).premultiply(c), Ne.decompose($, Ve, Fe);
        const h = Ge($.x, $.z), p = new t.Quaternion().setFromRotationMatrix(new t.Matrix4().makeBasis(h.east, h.up, h.north)), y = ke($.x, $.y, $.z, new t.Vector3());
        Ne.compose(y, p.multiply(Ve), Fe), Ne.toArray(u.array, f * 16);
      }
      u.needsUpdate = true, s.frustumCulled = false, i.instanced += d;
    } else {
      const d = s.geometry.clone().applyMatrix4(c), u = Wo(d, e);
      d.dispose(), s.geometry = u, s.frustumCulled = true, i.wrapped++, i.tris += u.attributes.position.count / 3;
    }
    s.position.set(0, 0, 0), s.quaternion.identity(), s.scale.set(1, 1, 1), s.matrixAutoUpdate = true;
  }
  o.traverse((s) => {
    s === o || s.isMesh || s.isLine || s.userData.planetRigid || n(s) || (s.position.set(0, 0, 0), s.quaternion.identity(), s.scale.set(1, 1, 1));
  });
  const r = new t.Matrix4();
  for (const { obj: s, world: c } of a) {
    c.decompose($, Ve, Fe);
    const d = Ge($.x, $.z);
    r.makeBasis(d.east, d.up, d.north), s.position.copy(ke($.x, $.y, $.z, new t.Vector3())), s.quaternion.setFromRotationMatrix(r).multiply(Ve), s.scale.copy(Fe);
  }
  return i;
}
function qo(o, e) {
  return 0;
}
function Uo(o) {
  const e = o.attributes.position, n = { x: 0, z: 0, y: 0 }, a = new t.Vector3(), l = (r) => (a.set(e.getX(r), e.getY(r), e.getZ(r)), to(a, n), Vo()), i = [];
  for (let r = 0; r < e.count; r += 3) if (!(l(r) || l(r + 1) || l(r + 2))) for (let s = 0; s < 3; s++) i.push(e.getX(r + s), e.getY(r + s), e.getZ(r + s));
  o.setAttribute("position", new t.Float32BufferAttribute(i, 3));
}
function Ko(o) {
  const e = new t.Group();
  e.name = "planet";
  const n = new t.IcosahedronGeometry(Y, 30), a = n.attributes.position, l = new t.Vector3(), i = { x: 0, z: 0, y: 0 }, r = new t.Vector3();
  for (let c = 0; c < a.count; c++) {
    l.set(a.getX(c), a.getY(c), a.getZ(c)).normalize(), r.copy(l).multiplyScalar(Y).add(ie), to(r, i);
    const d = qo() + Je() * 0.999 - Do - 0.065;
    r.copy(l).multiplyScalar(Y + d).add(ie), a.setXYZ(c, r.x, r.y, r.z);
  }
  a.needsUpdate = true, n.deleteAttribute("normal"), Uo(n);
  {
    const c = n.attributes.position, d = new Float32Array(c.count * 3), u = new t.Vector3();
    for (let f = 0; f < c.count; f++) u.set(c.getX(f), c.getY(f), c.getZ(f)).sub(ie).normalize(), d[f * 3] = u.x, d[f * 3 + 1] = u.y, d[f * 3 + 2] = u.z;
    n.setAttribute("normal", new t.BufferAttribute(d, 3));
  }
  const s = new t.Mesh(n, v({ color: 12563607, bands: 4, tint: 8024982, flat: false }));
  return s.receiveShadow = true, s.castShadow = false, s.frustumCulled = false, s.name = "planetLand", e.add(s), o.add(e), { group: e, land: s };
}
const $o = `
  uniform float uThickness;
  uniform vec2 uResolution;
  void main() {
    vec4 mv = modelViewMatrix * vec4( position, 1.0 );
    #ifdef USE_INSTANCING
      mv = modelViewMatrix * instanceMatrix * vec4( position, 1.0 );
    #endif
    vec3 n = normalize( normalMatrix * normal );
    #ifdef USE_INSTANCING
      n = normalize( normalMatrix * mat3( instanceMatrix ) * normal );
    #endif
    vec4 clip = projectionMatrix * mv;
    vec3 clipN = normalize( ( projectionMatrix * vec4( n, 0.0 ) ).xyz );
    vec2 aspect = vec2( uResolution.y / uResolution.x, 1.0 );
    clip.xy += clipN.xy * aspect * uThickness * clip.w * 0.5;
    gl_Position = clip;
  }
`, jo = `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() { gl_FragColor = vec4( uColor, uOpacity ); }
`, oo = new t.Vector2(1920, 1080), no = /* @__PURE__ */ new Set();
function ao(o, e) {
  oo.set(o, e), no.forEach((n) => n.uniforms.uResolution.value.set(o, e));
}
const dt = /* @__PURE__ */ new WeakMap();
function Yo(o) {
  if (dt.has(o)) return dt.get(o);
  let e;
  try {
    e = wo(o.clone(), 1e-4), e.computeVertexNormals();
  } catch {
    e = o.clone();
  }
  for (const n of Object.keys(e.attributes)) n !== "position" && n !== "normal" && e.deleteAttribute(n);
  return dt.set(o, e), e;
}
function so(o, { thickness: e = 38e-4, color: n = R.ink, opacity: a = 1 } = {}) {
  if (!o || !o.geometry) return null;
  const l = new t.ShaderMaterial({ uniforms: { uThickness: { value: e }, uColor: { value: new t.Color(n) }, uOpacity: { value: a }, uResolution: { value: oo.clone() } }, vertexShader: $o, fragmentShader: jo, side: t.BackSide, transparent: a < 1, depthWrite: true, fog: false });
  no.add(l);
  const i = Yo(o.geometry);
  let r;
  return o.isInstancedMesh ? (r = new t.InstancedMesh(i, l, o.count), r.instanceMatrix = o.instanceMatrix, r.count = o.count) : r = new t.Mesh(i, l), r.castShadow = false, r.receiveShadow = false, r.renderOrder = (o.renderOrder || 0) - 1, r.frustumCulled = o.frustumCulled, o.add(r), r;
}
const Qo = 1.62, Xo = 0.34, Zo = 0.38, xe = { eye: 1.4, seatFwd: 0.46, nose: 0.92, noseR: 0.3, steer: 1.75 };
class Jo {
  constructor(e, n, a, l = {}) {
    this.camera = e, this.dom = n, this.world = a, this.spawn = { pos: new t.Vector3(2.2, 0, -6.5), yaw: l.yaw ?? Math.PI + 0.14, pitch: l.pitch ?? -0.01 }, l.pos && this.spawn.pos.copy(l.pos), this.pos = this.spawn.pos.clone(), this.yaw = this.spawn.yaw, this.pitch = this.spawn.pitch, this.vel = new t.Vector3(), this.bob = 0, this.locked = false, this.keys = /* @__PURE__ */ new Set(), this.walkSpeed =
    2.55, this.runSpeed = 5.1, this.rideSpeed = this.runSpeed * 1.5, this.sensitivity = 22e-4, this.ride = null, this.roll = 0, this.yawRate = 0, this._prevYaw = this.yaw, this._forward = new t.Vector3(), this._right = new t.Vector3(), this._wish = new t.Vector3(), this._probe = new t.Vector3(), this._up = new t.Vector3(), this._east = new t.Vector3(), this._north = new t.Vector3(), this._basis = new t.
    Matrix4(), this._surfaceQ = new t.Quaternion(), this._localQ = new t.Quaternion(), this._localE = new t.Euler(), this.raycaster = new t.Raycaster(), this.raycaster.far = 3, this.hovered = null, this.onInteract = null, this.onLockChange = null, this._bind(), this.applyCamera(0);
  }
  _bind() {
    const e = (n) => {
      this.locked && (this.yaw -= n.movementX * this.sensitivity, this.pitch -= n.movementY * this.sensitivity, this.pitch = De(this.pitch, -1.15, 1.05));
    };
    document.addEventListener("mousemove", e), document.addEventListener("pointerlockchange", () => {
      this.locked = document.pointerLockElement === this.dom, this.locked || this.keys.clear(), this.onLockChange?.(this.locked);
    }), window.addEventListener("keydown", (n) => {
      if (n.repeat) return;
      const a = n.code;
      this.keys.add(a), a === "KeyE" && this.locked && this.onInteract?.(this.hovered), a === "KeyR" && this.locked && this.reset(), ["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(a) && this.locked && n.preventDefault();
    }), window.addEventListener("keyup", (n) => this.keys.delete(n.code)), window.addEventListener("blur", () => this.keys.clear());
  }
  lock() {
    this.dom.requestPointerLock?.();
  }
  touchLook(e, n) {
    this.touchActive && (this.yaw -= e * this.sensitivity * 2.4, this.pitch = De(this.pitch - n * this.sensitivity * 2.4, -1.15, 1.05));
  }
  touchPress(e) {
    this.keys.add(e);
  }
  touchRelease(e) {
    this.keys.delete(e);
  }
  touchInteract() {
    this.onInteract?.(this.hovered);
  }
  reset() {
    this.pos.copy(this.spawn.pos), this.yaw = this.spawn.yaw, this.pitch = this.spawn.pitch, this.vel.set(0, 0, 0), this.bob = 0;
  }
  mount(e) {
    this.ride = e, this.vel.set(0, 0, 0), this.bob = 0, this._prevYaw = this.yaw;
  }
  unmount() {
    this.ride = null, this.vel.set(0, 0, 0), this.roll = 0, this.yawRate = 0, this._prevYaw = this.yaw;
  }
  _resolve(e, n) {
    this._resolveAt(this.pos, e, n, Xo);
  }
  _resolveAt(e, n, a, l) {
    for (const i of n) {
      if (i.top !== void 0 && i.top <= a + Zo || i.bottom !== void 0 && i.bottom > a + 1.9) continue;
      const r = i.x0 - l, s = i.x1 + l, c = i.z0 - l, d = i.z1 + l;
      if (e.x <= r || e.x >= s || e.z <= c || e.z >= d) continue;
      const u = e.x - r, f = s - e.x, h = e.z - c, p = d - e.z, y = Math.min(u, f, h, p);
      y === u ? e.x = r : y === f ? e.x = s : y === h ? e.z = c : e.z = d;
    }
  }
  update(e) {
    const n = this.keys, a = this.ride !== null, l = n.has("ShiftLeft") || n.has("ShiftRight"), i = a ? this.rideSpeed : l ? this.runSpeed : this.walkSpeed;
    let r = 0, s = 0;
    (this.locked || this.touchActive) && ((n.has("KeyW") || n.has("ArrowUp")) && (r += 1), (n.has("KeyS") || n.has("ArrowDown")) && (r -= 1), (n.has("KeyD") || n.has("ArrowRight")) && (s += 1), (n.has("KeyA") || n.has("ArrowLeft")) && (s -= 1)), a && s && (this.yaw -= s * xe.steer * e), this._forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)), this._right.set(Math.cos(this.yaw), 0, -Math.sin(
    this.yaw)), a ? this._wish.copy(this._forward).multiplyScalar(r > 0 ? i : r < 0 ? -1.7 : 0) : (this._wish.copy(this._forward).multiplyScalar(r).addScaledVector(this._right, s), this._wish.lengthSq() > 1e-6 && this._wish.normalize().multiplyScalar(i));
    const c = a ? r > 0 ? 5 : r < 0 ? 9 : 3.6 : this._wish.lengthSq() > 1e-6 ? 13 : 16, d = 1 - Math.exp(-c * e);
    this.vel.x += (this._wish.x - this.vel.x) * d, this.vel.z += (this._wish.z - this.vel.z) * d;
    const u = this.world.heightAt(this.pos.x, this.pos.z), f = this.world.colliders, h = 1 / Math.max(0.25, Math.cos(this.pos.z / Y)), p = this.vel.x * e * h, y = this.vel.z * e, w = Math.max(1, Math.ceil(Math.max(Math.abs(p), Math.abs(y)) / 0.18));
    for (let x = 0; x < w; x++) this.pos.x += p / w, this._resolve(f, u), this.pos.z += y / w, this._resolve(f, u);
    if (a) {
      const x = this._probe.copy(this.pos).addScaledVector(this._forward, xe.nose), S = x.x, G = x.z;
      this._resolveAt(x, f, u, xe.noseR), this.pos.x += x.x - S, this.pos.z += x.z - G, this._resolve(f, u);
    }
    this.pos.x = pe(this.pos.x);
    const T = this.world.bounds;
    this.pos.z = De(this.pos.z, T.z0, T.z1);
    const z = this.world.heightAt(this.pos.x, this.pos.z, this.pos.y);
    this.pos.y += (z - this.pos.y) * (1 - Math.exp(-18 * e));
    const b = Math.hypot(this.vel.x, this.vel.z), m = (this.yaw - this._prevYaw) / Math.max(e, 1e-4);
    this._prevYaw = this.yaw, this.yawRate += (m - this.yawRate) * (1 - Math.exp(-9 * e));
    const k = a ? De(this.yawRate, -2.6, 2.6) * 0.05 * Math.min(b / this.rideSpeed, 1) : 0;
    this.roll += (k - this.roll) * (1 - Math.exp(-7 * e)), this.bob += e * b * (l ? 8.2 : 6.4), this.applyCamera(b);
  }
  applyCamera(e) {
    const n = this.ride !== null, a = n ? 0 : Math.min(e / this.walkSpeed, 1) * 0.014, l = this.pos.y + (n ? xe.eye : Qo) + Math.sin(this.bob) * a, i = Ge(this.pos.x, this.pos.z, this._up, this._east, this._north);
    this._basis.makeBasis(this._east, this._up, this._north), this._surfaceQ.setFromRotationMatrix(this._basis), this._localE.set(this.pitch, this.yaw, this.roll + Math.sin(this.bob * 0.5) * a * 0.35, "YXZ"), this._localQ.setFromEuler(this._localE), ke(this.pos.x, l, this.pos.z, this.camera.position), this.camera.quaternion.copy(this._surfaceQ).multiply(this._localQ), this.camera.up.copy(i.up);
  }
  pick(e) {
    if (!e.length) return this.hovered = null, null;
    this.raycaster.set(this.camera.position, this._forward.set(0, 0, -1).applyQuaternion(this.camera.quaternion));
    const n = e.map((l) => l.hitbox), a = this.raycaster.intersectObjects(n, false);
    return this.hovered = a.length ? e[n.indexOf(a[0].object)] : null, this.hovered;
  }
}
function en({ volume: o = 0.34 } = {}) {
  const e = (g, A, V, U) => {
    const C = document.createElement(g);
    return A && (C.className = A), U !== void 0 && (C.innerHTML = U), (V || document.body).appendChild(C), C;
  }, n = e("div", "hud"), a = e("div", "crosshair", n), l = e("div", "prompt", n, ""), i = e("div", "toast", n, ""), r = e("div", "memory-card", n, "");
  r.setAttribute("role", "dialog");
  let s = false;
  const c = e("div", "touch-ui", n, `
    <div class="tpad">
      <button class="tbtn up" data-key="KeyW" aria-label="forward">\u25B2</button>
      <button class="tbtn left" data-key="KeyA" aria-label="left">\u25C0</button>
      <button class="tbtn right" data-key="KeyD" aria-label="right">\u25B6</button>
      <button class="tbtn down" data-key="KeyS" aria-label="back">\u25BC</button>
    </div>
    <div class="tacts">
      <button class="tbtn act" data-act="interact" aria-label="interact">E</button>
      <button class="tbtn act" data-key="ShiftLeft" aria-label="run">RUN</button>
      <button class="tbtn act small" data-act="planet" aria-label="planet">\u25CE</button>
      <button class="tbtn act small" data-act="music" aria-label="music">\u266A</button>
    </div>`), d = e("div", "hint", n, `<b>WASD</b> walk &nbsp;\xB7&nbsp; <b>Shift</b> run &nbsp;\xB7&nbsp; <b>Mouse</b> look
     &nbsp;\xB7&nbsp; <b>E</b> interact &nbsp;\xB7&nbsp; <b>V</b> auto
     &nbsp;\xB7&nbsp; <b>P</b> see the planet &nbsp;\xB7&nbsp; <b>M</b> music
     &nbsp;\xB7&nbsp; <b>R</b> opening view &nbsp;\xB7&nbsp; <b>Esc</b> release`), u = e("div", "coords", n, "");
  let f = "";
  const h = e("div", "overlay", n);
  h.dataset.mode = "start", h.innerHTML = `
    <section class="menu-panel" role="dialog" aria-labelledby="menu-title">
      <div class="menu-art" aria-hidden="true">
        <div class="art-index">Nallakunta \xB7 Hyderabad \xB7 5:42 PM</div>
        <div class="art-kanji">\u0C28\u0C32\u0C4D\u0C32\u0C15\u0C41\u0C02\u0C1F</div>
        <div class="crossing-mark">
          <i class="bar"></i><i class="bar"></i>
          <span class="signal"><i></i><i></i></span>
        </div>
        <div class="art-caption">
          <span>Walk slowly</span>
          <strong>\u0C36\u0C02\u0C15\u0C30\u0C4D \u0C2E\u0C20\u0C02</strong>
        </div>
      </div>
      <div class="menu-copy">
        <div class="menu-kicker">
          <span class="start-only">An illustrated walk down one Hyderabad street</span>
          <span class="pause-only">Paused \xB7 the street is waiting</span>
        </div>
        <h1 id="menu-title">Nallakunta <span>Forever</span></h1>
        <div class="menu-jp">\u0C28\u0C32\u0C4D\u0C32\u0C15\u0C41\u0C02\u0C1F <small>TAKE THE LONG WAY HOME</small></div>
        <p class="menu-description start-only">
          Shankar Mutt on the left, the kirana store on the right, bougainvillea
          on the temple wall and the MMTS line through the middle of the world.
          Walk up the main road and back. Press E on the places you recognise.
        </p>
        <p class="menu-description pause-only">
          The street is waiting where you left it. Adjust the music,
          then continue your walk.
        </p>
        <div class="control-strip">
          <span><b>WASD</b> Move</span>
          <span><b>Mouse</b> Look</span>
          <span><b>E</b> Interact</span>
          <span><b>Shift</b> Run</span>
          <span><b>V</b> Auto</span>
          <span><b>P</b> Planet</span>
          <span><b>M</b> Music</span>
        </div>
        <label class="audio-control pause-only pause-stack">
          <span class="audio-head">
            <span>Background Music</span>
            <output for="music-volume">34%</output>
          </span>
          <input id="music-volume" class="volume-slider" type="range"
            min="0" max="100" step="1" value="34" aria-label="Background music volume" />
        </label>
        <button class="menu-action" type="button">
          <span class="start-only">Start walking</span>
          <span class="pause-only">Resume walk</span>
          <i aria-hidden="true">\u2192</i>
        </button>
        <div class="menu-foot">
          <span>Illustrated reconstruction \xB7 some details approximate</span>
          <span class="start-only">CLICK TO BEGIN</span>
          <span class="pause-only">ESC TO PAUSE</span>
        </div>
      </div>
    </section>`;
  const p = h.querySelector(".menu-action"), y = h.querySelector(".audio-control"), w = h.querySelector(".volume-slider"), T = h.querySelector(".audio-head output"), z = (g) => {
    const A = Math.round(Math.max(0, Math.min(1, g)) * 100);
    w.value = String(A), w.style.setProperty("--volume", `${A}%`), T.value = `${A}%`, T.textContent = `${A}%`, w.setAttribute("aria-valuetext", `${A}%`);
  };
  z(o);
  let b = 0, m = true, k = null, x = false, S = 0, G = false;
  const M = { root: n, overlay: h, onStart: null, onVolumeChange: null, flash(g, A = 1400) {
    i.textContent = g, i.classList.add("on"), clearTimeout(k), k = setTimeout(() => i.classList.remove("on"), A);
  }, setPrompt(g) {
    g ? (l.textContent = g, l.classList.add("on")) : l.classList.remove("on");
  }, setPlanetView(g) {
    a.classList.toggle("hidden", g);
  }, setLocked(g) {
    g && (G = true), h.dataset.mode = G ? "paused" : "start", h.classList.toggle("hidden", g), h.setAttribute("aria-hidden", g ? "true" : "false"), a.classList.toggle("on", g), g ? (b = 0, m = true, d.classList.remove("faded")) : requestAnimationFrame(() => p.focus({ preventScroll: true }));
  }, setVolume(g) {
    z(g);
  }, setMuted(g) {
    y.classList.toggle("muted", g);
  }, toggleHint() {
    m = !m, d.classList.toggle("faded", !m), b = m ? 0 : 1e9;
  }, toggleCoords() {
    return x = !x, u.classList.toggle("on", x), S = 1e9, x;
  }, get coordsVisible() {
    return x;
  }, setCoords(g, A, V, U = 0) {
    if (!x || (S += U, S < 0.1)) return;
    S = 0;
    const C = (D, X = 2) => D.toFixed(X);
    let _ = A % (Math.PI * 2);
    _ > Math.PI && (_ -= Math.PI * 2), _ <= -Math.PI && (_ += Math.PI * 2);
    const I = ["north +z", "north-west", "west -x", "south-west", "south -z", "south-east", "east +x", "north-east"][((4 - Math.round(_ / (Math.PI * 2) * 8)) % 8 + 8) % 8];
    f = `{ pos: [${C(g.x, 1)}, 0, ${C(g.z, 1)}], yaw: ${C(_)}, pitch: ${C(V)} }`, u.innerHTML = `<span class="k">x</span>${C(g.x)} <span class="k">z</span>${C(g.z)} <span class="k">y</span>${C(g.y)}<br><span class="k">yaw</span>${C(_)} <span class="k">pitch</span>${C(V)} <span class="d">${I}</span><br><span class="s">${f}</span><br><span class="d">click or Shift+C to copy</span>`;
  }, copyCoords() {
    if (!f) return false;
    const g = () => (M.flash("copied  \xB7  " + f, 2200), true);
    try {
      if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(f).then(g, () => M.copyFallback(f)), true;
    } catch {
    }
    return M.copyFallback(f) ? g() : false;
  }, copyFallback(g) {
    const A = document.createElement("textarea");
    A.value = g, A.setAttribute("readonly", ""), A.style.cssText = "position:fixed;top:-1000px;opacity:0", document.body.appendChild(A), A.select();
    let V = false;
    try {
      V = document.execCommand("copy");
    } catch {
      V = false;
    }
    return A.remove(), V;
  }, update(g, A) {
    !A || !m || (b += g, b > 11 && (d.classList.add("faded"), m = false));
  } };
  p.addEventListener("click", (g) => {
    g.stopPropagation(), M.onStart?.();
  }), h.addEventListener("click", (g) => {
    g.target.closest(".audio-control") || M.onStart?.();
  });
  for (const g of ["click", "pointerdown", "pointerup"]) y.addEventListener(g, (A) => A.stopPropagation());
  return w.addEventListener("input", () => {
    const g = Number(w.value) / 100;
    z(g), M.onVolumeChange?.(g);
  }), window.addEventListener("keydown", (g) => {
    g.code === "KeyH" && M.toggleHint(), g.code === "KeyC" && (g.shiftKey ? x && M.copyCoords() : M.flash(M.toggleCoords() ? "coordinates on" : "coordinates off", 900));
  }), u.style.pointerEvents = "auto", u.style.cursor = "copy", u.addEventListener("click", (g) => {
    g.stopPropagation(), M.copyCoords();
  }), M.showCard = ({ title: g, body: A }) => {
    r.innerHTML = `<button class="card-close" aria-label="close">\u2715</button>
      <h3></h3><p></p>`, r.querySelector("h3").textContent = g, r.querySelector("p").textContent = A, r.classList.add("on"), s = true, r.querySelector(".card-close").addEventListener("click", (V) => {
      V.stopPropagation(), M.hideCard();
    });
  }, M.hideCard = () => {
    r.classList.remove("on"), s = false;
  }, M.cardIsOpen = () => s, window.addEventListener("keydown", (g) => {
    g.code === "Escape" && s && M.hideCard();
  }), M.bindTouch = ({ player: g, onPlanet: A, onMusic: V, onEnter: U }) => {
    const C = (I, D) => {
      const X = I.dataset.key, ae = I.dataset.act;
      X && (D ? g.touchPress(X) : g.touchRelease(X)), D && (ae === "interact" && g.touchInteract(), ae === "planet" && A?.(), ae === "music" && V?.());
    };
    c.querySelectorAll(".tbtn").forEach((I) => {
      I.addEventListener("pointerdown", (D) => {
        D.preventDefault(), C(I, true);
      }), I.addEventListener("pointerup", () => C(I, false)), I.addEventListener("pointercancel", () => C(I, false)), I.addEventListener("pointerleave", () => C(I, false));
    });
    const _ = document.getElementById("view");
    let W = null;
    _.addEventListener("touchstart", (I) => {
      I.touches.length === 1 && (W = { x: I.touches[0].clientX, y: I.touches[0].clientY }, U?.());
    }, { passive: true }), _.addEventListener("touchmove", (I) => {
      if (!W || I.touches.length !== 1) return;
      const D = I.touches[0];
      g.touchLook(D.clientX - W.x, D.clientY - W.y), W = { x: D.clientX, y: D.clientY }, I.preventDefault();
    }, { passive: false }), _.addEventListener("touchend", () => {
      W = null;
    });
  }, M;
}
const Re = [];
function tn({ volume: o = 0.34, fadeIn: e = 2.6 } = {}) {
  let n = [], a = -1;
  function l() {
    n = Re.map((m, k) => k);
    for (let m = n.length - 1; m > 0; m--) {
      const k = Math.floor(Math.random() * (m + 1));
      [n[m], n[k]] = [n[k], n[m]];
    }
    if (n.length > 1 && n[0] === a) {
      const m = 1 + Math.floor(Math.random() * (n.length - 1));
      [n[0], n[m]] = [n[m], n[0]];
    }
  }
  function i() {
    return n.length === 0 && l(), a = n.shift(), a;
  }
  let r = i();
  const s = new Audio(Re[r]);
  s.loop = false, s.preload = "auto", s.volume = 0;
  let c = o, d = o > 1e-3 ? o : 0.34, u = o <= 1e-3, f = false, h = Re.length === 0, p = null, y = null;
  const w = (m) => Math.max(0, Math.min(1, m));
  function T() {
    Re.length && (r = i(), s.src = Re[r], s.load());
  }
  function z(m, k) {
    c = w(m), clearInterval(p), clearTimeout(y);
    const x = () => {
      clearInterval(p), clearTimeout(y), p = y = null, s.volume = c, c === 0 && u && s.pause();
    }, S = Math.abs(c - s.volume);
    if (!(k > 0) || S < 4e-3) return x();
    const G = 33, M = G / 1e3 * (S / k);
    p = setInterval(() => {
      const g = c - s.volume;
      s.volume = w(s.volume + Math.sign(g) * Math.min(Math.abs(g), M)), Math.abs(c - s.volume) < 4e-3 && x();
    }, G), y = setTimeout(x, k * 1e3 + 600);
  }
  const b = { el: s, get muted() {
    return u;
  }, get volume() {
    return o;
  }, get available() {
    return !h;
  }, start() {
    f || h || (f = true, s.volume = 0, !u && s.play().then(() => z(o, e), () => {
      h = true, f = false;
    }));
  }, toggle() {
    return h || (u = !u, u ? z(0, 0.35) : (o <= 1e-3 && (o = d), s.paused && s.play().catch(() => {
      h = true;
    }), z(o, 0.5))), u;
  }, setVolume(m) {
    return o = w(m), o > 1e-3 ? (d = o, u = false, f && (s.paused && s.play().catch(() => {
      h = true;
    }), z(o, 0.3))) : (u = true, f && z(0, 0.25)), u;
  } };
  return s.addEventListener("ended", () => {
    T(), !(!f || h || u || document.hidden) && s.play().catch(() => {
      h = true, f = false;
    });
  }), document.addEventListener("visibilitychange", () => {
    !f || h || u || (document.hidden ? s.pause() : s.play().catch(() => {
    }));
  }), b;
}
function on({ volume: o = 0.5 } = {}) {
  let e = null, n = null, a = false, l = false, i = o, r = [];
  const s = (b) => Math.max(0, Math.min(1, b)), c = (b, m) => b + Math.random() * (m - b);
  function d(b) {
    const m = e.sampleRate, k = e.createBuffer(1, m * b, m), x = k.getChannelData(0);
    let S = 0;
    for (let G = 0; x.length > G; G++) {
      const M = Math.random() * 2 - 1;
      S = (S + 0.02 * M) / 1.02, x[G] = S * 3.2;
    }
    return k;
  }
  function u() {
    const b = e.createBufferSource();
    b.buffer = d(4), b.loop = true;
    const m = e.createBiquadFilter();
    m.type = "lowpass", m.frequency.value = 220, m.Q.value = 0.4;
    const k = e.createGain();
    k.gain.value = 0.2;
    const x = e.createOscillator();
    x.frequency.value = 0.07;
    const S = e.createGain();
    S.gain.value = 0.06, x.connect(S), S.connect(k.gain), b.connect(m), m.connect(k), k.connect(n), b.start(), x.start();
    const G = e.createBufferSource();
    G.buffer = d(3), G.loop = true, G.playbackRate.value = 0.7;
    const M = e.createBiquadFilter();
    M.type = "bandpass", M.frequency.value = 480, M.Q.value = 0.5;
    const g = e.createGain();
    g.gain.value = 0.035, G.connect(M), M.connect(g), g.connect(n), G.start();
  }
  function f({ type: b = "sine", f0: m, f1: k, t: x, dur: S, gain: G, lp: M = 8e3 }) {
    const g = e.createOscillator();
    g.type = b, g.frequency.setValueAtTime(m, x), k && g.frequency.exponentialRampToValueAtTime(k, x + S);
    const A = e.createBiquadFilter();
    A.type = "lowpass", A.frequency.value = M;
    const V = e.createGain();
    V.gain.setValueAtTime(1e-4, x), V.gain.exponentialRampToValueAtTime(G, x + 0.02), V.gain.exponentialRampToValueAtTime(1e-4, x + S), g.connect(A), A.connect(V), V.connect(n), g.start(x), g.stop(x + S + 0.05);
  }
  function h() {
    const b = e.currentTime + 0.05, m = 2 + Math.floor(Math.random() * 3), k = c(2200, 3400);
    for (let x = 0; x < m; x++) {
      const S = b + x * c(0.09, 0.16);
      f({ f0: k * c(0.9, 1.1), f1: k * c(1.15, 1.45), t: S, dur: c(0.06, 0.12), gain: c(0.012, 0.03) }), f({ f0: k * c(1.1, 1.3), f1: k * c(0.8, 1), t: S + 0.07, dur: 0.07, gain: c(8e-3, 0.02) });
    }
  }
  function p() {
    const b = e.currentTime + 0.05, m = 1 + Math.floor(Math.random() * 3);
    for (let k = 0; k < m; k++) f({ type: "sawtooth", f0: c(600, 750), f1: c(420, 520), t: b + k * c(0.22, 0.3), dur: c(0.12, 0.18), gain: c(0.015, 0.035), lp: 1600 });
  }
  function y() {
    const b = e.currentTime + 0.05;
    f({ type: "square", f0: 620, t: b, dur: 0.16, gain: 0.012, lp: 900 }), f({ type: "square", f0: 523, t: b + 0.05, dur: 0.22, gain: 0.01, lp: 900 });
  }
  function w() {
    const b = e.currentTime + 0.05, m = c(2.2, 3.4), k = e.createOscillator();
    k.type = "sawtooth", k.frequency.setValueAtTime(c(85, 100), b), k.frequency.linearRampToValueAtTime(c(120, 150), b + m * 0.5), k.frequency.linearRampToValueAtTime(c(70, 85), b + m);
    const x = e.createOscillator();
    x.frequency.value = 27;
    const S = e.createGain();
    S.gain.value = 0.4;
    const G = e.createGain();
    G.gain.setValueAtTime(1e-4, b), G.gain.linearRampToValueAtTime(c(0.02, 0.045), b + m * 0.45), G.gain.linearRampToValueAtTime(1e-4, b + m);
    const M = e.createBiquadFilter();
    M.type = "lowpass", M.frequency.value = 700, x.connect(S), S.connect(G.gain), k.connect(M), M.connect(G), G.connect(n), k.start(b), k.stop(b + m + 0.05), x.start(b), x.stop(b + m + 0.05);
  }
  function T(b, m, k) {
    const x = () => {
      l || b(), r.push(setTimeout(x, m + Math.random() * k));
    };
    r.push(setTimeout(x, c(300, m)));
  }
  function z() {
    if (a) {
      e && e.state === "suspended" && e.resume();
      return;
    }
    try {
      e = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return;
    }
    n = e.createGain(), n.gain.value = l ? 0 : i, n.connect(e.destination), u(), T(h, 1200, 5e3), T(p, 9e3, 22e3), T(y, 14e3, 3e4), T(w, 1e4, 26e3), a = true;
  }
  return { start: z, get available() {
    return true;
  }, get muted() {
    return l;
  }, get volume() {
    return i;
  }, setVolume(b) {
    return i = s(b), l = i <= 1e-3, n && (n.gain.value = l ? 0 : i), l;
  }, toggle() {
    return l = !l, n && n.gain.setTargetAtTime(l ? 0 : i, e.currentTime, 0.15), l;
  } };
}
const Ee = 980, Et = 6.8, Oe = -30, We = 34, fe = 9.5;
function nn(o) {
  const e = Se(8123), n = Ao(), a = new t.PlaneGeometry(0.185, 0.135), l = [{ color: R.petal, n: Math.round(Ee * 0.55) }, { color: R.blossomLight, n: Math.round(Ee * 0.28) }, { color: R.petalDeep, n: Ee - Math.round(Ee * 0.55) - Math.round(Ee * 0.28) }], i = [], r = [];
  for (const p of l) {
    const y = j({ color: p.color, map: n, transparent: true, opacity: 0.95, depthWrite: false, side: t.DoubleSide, alphaTest: 0.32, cache: false }), w = new t.InstancedMesh(a, y, p.n);
    w.instanceMatrix.setUsage(t.DynamicDrawUsage), w.frustumCulled = false, w.renderOrder = 4, w.userData.noOutline = true, o.add(w), i.push(w);
    for (let T = 0; T < p.n; T++) r.push({ mesh: w, idx: T, x: e.range(-fe, fe), y: e.range(0.2, Et), z: e.range(Oe, We), fall: e.range(0.42, 0.86), swayAmp: e.range(0.25, 0.75), swayFreq: e.range(0.5, 1.35), phase: e.range(0, 10), spin: new t.Vector3(e.range(-1, 1), e.range(-1, 1), e.range(-1, 1)).normalize(), spinRate: e.range(0.5, 2.4), angle: e.range(0, 6.28), scale: e.range(0.78, 1.25), drift: e.
    range(-0.16, 0.16) });
  }
  const s = new t.Object3D(), c = new t.Quaternion(), d = new t.Vector3();
  let u = 0;
  function f(p) {
    p.x = e.range(-fe, fe), p.z = e.range(Oe, We), p.y = Et + e.range(0, 1.4), p.phase = e.range(0, 10);
  }
  function h(p, y, w) {
    u += p;
    const T = y * 5.4 * w, z = y * 1.5;
    for (let b = 0; b < r.length; b++) {
      const m = r[b], k = Math.sin(u * m.swayFreq + m.phase), x = Math.sin(u * m.swayFreq * 2.7 + m.phase * 1.7);
      m.y -= (m.fall + y * 0.4) * p, m.x += (m.swayAmp * k * 0.55 + m.drift + T * 0.24) * p, m.z += (m.swayAmp * x * 0.32 + T * 0.05) * p, m.y += z * Math.max(0, 1 - Math.abs(m.z) / 8) * p, m.angle += m.spinRate * p * (1 + y);
      const S = N(m.z);
      m.x < S - fe && (m.x = S + fe), m.x > S + fe && (m.x = S - fe), m.z < Oe && (m.z = We), m.z > We && (m.z = Oe), m.y < Je(m.z) + 0.04 && f(m), c.setFromAxisAngle(m.spin, m.angle), s.position.set(m.x, m.y, m.z), s.quaternion.copy(c), d.setScalar(m.scale), s.scale.copy(d), s.updateMatrix(), m.mesh.setMatrixAt(m.idx, s.matrix);
    }
    for (const b of i) b.instanceMatrix.needsUpdate = true;
  }
  for (let p = 0; p < 40; p++) h(0.1, 0, 1);
  return an(o, n), { update: h, meshes: i };
}
function an(o, e) {
  const n = Se(4471), a = new t.PlaneGeometry(0.17, 0.125);
  a.rotateX(-Math.PI / 2);
  const l = [R.petal, R.blossomLight, R.petalDeep], i = [[], [], []], r = new t.Object3D(), s = (c, d, u) => {
    r.position.set(c, u + 0.019, d), r.rotation.set(0, n.range(0, 6.28), 0);
    const f = n.range(0.8, 1.25);
    r.scale.set(f, 1, f), r.updateMatrix(), i[n.int(0, 2)].push(r.matrix.clone());
  };
  for (let c = 0; c < 620; c++) {
    const d = n.range(-26, 32), u = N(d), f = Je(), h = n.next();
    if (h < 0.42) {
      const p = n.sign();
      s(u + p * n.range(2.35, 3.12), d, f);
    } else if (h < 0.62) {
      const p = n.sign();
      s(u + p * n.range(3.2, 4.6), d, f + 0.135);
    } else if (h < 0.78) {
      const p = n.range(-2.4, 2.4);
      s(u + n.range(-3.1, 3.1), p, 0.32);
    } else s(u + n.range(-3, 3), d, f);
  }
  i.forEach((c, d) => {
    if (!c.length) return;
    const u = new t.InstancedMesh(a, j({ color: l[d], map: e, transparent: true, opacity: 0.9, depthWrite: false, alphaTest: 0.32, cache: false }), c.length);
    c.forEach((f, h) => u.setMatrixAt(h, f)), u.renderOrder = 2, u.userData.noOutline = true, o.add(u);
  });
}
const ut = /* @__PURE__ */ new Map();
function et(o, e, n, a) {
  if (ut.has(o)) return ut.get(o);
  const l = document.createElement("canvas");
  l.width = e, l.height = n, a(l.getContext("2d"), e, n);
  const i = new t.CanvasTexture(l);
  return i.colorSpace = t.SRGBColorSpace, i.anisotropy = 4, ut.set(o, i), i;
}
const ro = "'Segoe UI', 'Noto Sans', system-ui, sans-serif", sn = `'Noto Sans Telugu', 'Gautami', ${ro}`;
function ve(o, e, n, a, l, i, r, s = 700, c = ro) {
  let d = Math.min(i, 100);
  o.textAlign = "center", o.textBaseline = "middle";
  do
    o.font = `${s} ${d}px ${c}`, d -= 2;
  while (o.measureText(e).width > l && d > 8);
  o.fillStyle = r, o.fillText(e, n, a);
}
function je(o, { bg: e = "#1d4e9c", fg: n = "#ffffff", name: a, telugu: l = "", strip: i = null }) {
  return et("fascia:" + o, 512, 128, (r, s, c) => {
    r.fillStyle = e, r.fillRect(0, 0, s, c), r.strokeStyle = "rgba(0,0,0,.35)", r.lineWidth = 6, r.strokeRect(4, 4, s - 8, c - 8), l ? (ve(r, l, s / 2, c * 0.28, s - 40, 40, n, 700, sn), ve(r, a, s / 2, c * 0.7, s - 40, 44, n, 800)) : ve(r, a, s / 2, c * 0.5, s - 40, 52, n, 800), i && (r.fillStyle = i, r.fillRect(0, c - 10, s, 10)), r.fillStyle = "rgba(255,255,255,.05)", r.fillRect(s * 0.12, c * 0.1,
    s * 0.3, 6), r.fillRect(s * 0.55, c * 0.86, s * 0.35, 5);
  });
}
function rn() {
  return et("busStop", 512, 192, (o, e, n) => {
    o.fillStyle = "#f4ede0", o.fillRect(0, 0, e, n), o.fillStyle = "#1d4e9c", o.fillRect(0, 0, e, 62), ve(o, "BUS STOP", e / 2, 32, e - 40, 40, "#ffffff", 800), ve(o, "NALLAKUNTA", e / 2, 96, e - 40, 44, "#22303f", 800), ve(o, "107 \xB7 113 \xB7 116J", e / 2, 152, e - 40, 36, "#8a3b2f", 700);
  });
}
function cn() {
  return et("roadName", 512, 128, (o, e, n) => {
    o.fillStyle = "#0f3d22", o.fillRect(0, 0, e, n), o.strokeStyle = "#f4ede0", o.lineWidth = 5, o.strokeRect(6, 6, e - 12, n - 12), ve(o, "NALLAKUNTA MAIN ROAD", e / 2, n / 2, e - 44, 46, "#f4ede0", 800);
  });
}
function ln() {
  return dn("divider", 128, 32, (o, e, n) => {
    o.fillStyle = "#f2c53d", o.fillRect(0, 0, e, n), o.fillStyle = "#2b2b30";
    for (let a = -1; a < 4; a++) o.beginPath(), o.moveTo(a * 40, n), o.lineTo(a * 40 + 20, 0), o.lineTo(a * 40 + 40, 0), o.lineTo(a * 40 + 20, n), o.closePath(), o.fill();
  });
}
function dn(o, e, n, a) {
  const l = et(o, e, n, a);
  return l.wrapS = l.wrapT = t.RepeatWrapping, l;
}
function un(o) {
  const e = new t.Group();
  e.name = "mainRoad", o.add(e);
  const n = v({ color: R.road, bands: 3, tint: 7036528, flat: false }), a = v({ color: R.sidewalk, bands: 3, tint: 8022642, flat: false }), l = v({ color: R.sidewalkAlt, bands: 3, tint: 8022642, flat: false }), i = v({ color: R.curb, bands: 2, tint: 7036528 }), r = v({ color: 13218452, bands: 3, tint: 9072478, flat: false }), s = 0.012;
  for (const [c, d] of [[me, we]]) {
    const u = ze({ z0: c, z1: d, step: 1.6, a: (h) => ({ x: N(h) - F, y: s }), b: (h) => ({ x: N(h) + F, y: s }) }), f = new t.Mesh(u, n);
    f.receiveShadow = true, e.add(f);
  }
  {
    const c = ln(), d = new t.MeshBasicMaterial({ map: c, transparent: false });
    for (const [u, f] of [[me, we]]) {
      const h = ze({ z0: u, z1: f, step: 1.6, a: (y) => ({ x: N(y) - 0.14, y: s + 4e-3 }), b: (y) => ({ x: N(y) + 0.14, y: s + 4e-3 }), uv: [0.55, 2.2] }), p = new t.Mesh(h, d);
      p.userData.noShadow = true, e.add(p);
    }
  }
  for (const c of [-1, 1]) for (const [d, u] of [[me, we]]) {
    const f = (b) => N(b) + c * F, h = (b) => N(b) + c * (F + O), p = ze({ z0: d, z1: u, step: 1.6, a: (b) => ({ x: f(b), y: le }), b: (b) => ({ x: h(b), y: le }) }), y = new t.Mesh(p, c < 0 ? a : l);
    y.receiveShadow = true, e.add(y);
    const w = ze({ z0: d, z1: u, step: 1.6, a: (b) => ({ x: f(b), y: 0 }), b: (b) => ({ x: f(b), y: le }), flip: c > 0 }), T = new t.Mesh(w, i);
    e.add(T);
    const z = ze({ z0: d, z1: u, step: 1.6, a: (b) => ({ x: h(b), y: -0.02 }), b: (b) => ({ x: h(b), y: le }), flip: c < 0 });
    e.add(new t.Mesh(z, i));
  }
  for (const c of [-1, 1]) {
    const d = ze({ z0: me, z1: we, step: 2, a: (f) => ({ x: N(f) + c * (F + O), y: 4e-3 }), b: (f) => ({ x: N(f) + c * (F + O + 3.4), y: 4e-3 }) }), u = new t.Mesh(d, r);
    u.receiveShadow = true, e.add(u);
  }
  return e;
}
const $e = F + O + 0.55, E = {};
function io() {
  return E.done || (E.done = true, E.walls = [15983816, 15258542, 14673106, 15784128, 15129796, 14213348, 15653304, 14995392].map((o) => v({ color: o, bands: 3, tint: 9072480 })), E.trim = v({ color: 11573888, bands: 2, tint: 7035472 }), E.roof = v({ color: 12101776, bands: 3, tint: 7035472 }), E.roofDark = v({ color: 9075302, bands: 3, tint: 5983298 }), E.door = v({ color: 6047282, bands: 2, tint: 3812904 }),
  E.shutter = v({ color: 8226964, bands: 3, tint: 5265003 }), E.glass = j({ color: 4872816 }), E.grill = v({ color: 4934482, bands: 2, tint: 3816010 }), E.tank = v({ color: 3026483, bands: 3, tint: 3816010 }), E.awningA = v({ color: 13126460, bands: 3, tint: 8010298 }), E.awningB = v({ color: 3112299, bands: 3, tint: 2771530 }), E.ac = v({ color: 14210508, bands: 2, tint: 9079446 })), E;
}
function ft(o, e) {
  const n = e.side || 1;
  io();
  const a = new t.Group(), { x: l, z: i, w: r, d: s, h: c, sign: d } = e, u = E.walls[e.wall % E.walls.length], f = new t.Mesh(new t.BoxGeometry(s, c, r), u);
  f.position.set(l - n * s / 2, c / 2, i), a.add(f);
  const h = new t.Mesh(new t.BoxGeometry(s + 0.15, 0.42, r + 0.15), E.trim);
  h.position.set(l - n * s / 2, c + 0.18, i), a.add(h);
  const p = new t.Mesh(new t.CylinderGeometry(0.55, 0.55, 0.9, 12), E.tank);
  p.position.set(l - n * (s / 2 - 0.6), c + 0.85, i - r * 0.22), a.add(p);
  const y = new t.Mesh(new t.SphereGeometry(0.34, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), E.ac);
  if (y.rotation.x = Math.PI / 3, y.position.set(l - n * (s / 2 + 0.8), c + 0.55, i + r * 0.25), a.add(y), d) {
    const x = je(d.key, d), S = [E.trim, E.trim, E.trim, E.trim, E.trim, E.trim];
    S[n > 0 ? 0 : 1] = new t.MeshBasicMaterial({ map: x });
    const G = new t.Mesh(new t.BoxGeometry(0.12, 1, r * 0.92), S);
    G.position.set(l + n * 0.06, c - 1.45, i), a.add(G);
  }
  const w = r * 0.44, T = new t.Mesh(new t.BoxGeometry(0.08, 2.3, w), E.shutter);
  T.position.set(l + n * 0.02, 1.15, i - r * 0.18), a.add(T);
  for (let x = 0; x < 6; x++) {
    const S = new t.Mesh(new t.BoxGeometry(0.03, 0.035, w), E.grill);
    S.position.set(l + n * 0.07, 0.45 + x * 0.36, i - r * 0.18), a.add(S);
  }
  const z = new t.Mesh(new t.BoxGeometry(0.08, 2.1, r * 0.26), E.door);
  if (z.position.set(l + n * 0.02, 1.05, i + r * 0.24), a.add(z), e.awning) {
    const x = new t.Mesh(new t.BoxGeometry(1.5, 0.06, r * 0.8), e.awning === "a" ? E.awningA : E.awningB);
    x.rotation.z = -0.28 * n, x.position.set(l + n * 0.72, 2.62, i), a.add(x);
  }
  for (const x of [-r * 0.22, r * 0.22]) {
    const S = new t.Mesh(new t.BoxGeometry(0.06, 1.15, 0.95), E.glass);
    S.position.set(l + n * 0.03, c - 2.6, i + x), a.add(S);
    for (let G = -2; G <= 2; G++) {
      const M = new t.Mesh(new t.BoxGeometry(0.02, 1.15, 0.035), E.grill);
      M.position.set(l + n * 0.06, c - 2.6, i + x + G * 0.19), a.add(M);
    }
  }
  const b = new t.Mesh(new t.BoxGeometry(0.32, 0.5, 0.7), E.ac);
  b.position.set(l + n * 0.18, c - 0.65, i - r * 0.34), a.add(b), re(a), o.add(a);
  const m = n > 0 ? l - s : l, k = n > 0 ? l : l + s;
  return o.collide(m, i - r / 2, k, i + r / 2, c), a;
}
function fn(o, e) {
  io();
  const n = new t.Group(), { x: a, z: l, w: i, d: r, h: s } = e, c = E.walls[e.wall % E.walls.length], d = new t.Mesh(new t.BoxGeometry(r, s, i), c);
  if (d.position.set(a - r / 2, s / 2, l), n.add(d), e.roof === "slope") {
    const f = new t.Mesh(new t.CylinderGeometry(0.02, i * 0.62, 1.15, 4, 1), E.roofDark);
    f.rotation.y = Math.PI / 4, f.scale.z = r / (i * 0.62) * 0.5, f.position.set(a - r / 2, s + 0.56, l), n.add(f);
  } else {
    const f = new t.Mesh(new t.BoxGeometry(r + 0.14, 0.36, i + 0.14), E.trim);
    f.position.set(a - r / 2, s + 0.15, l), n.add(f);
    const h = new t.Mesh(new t.CylinderGeometry(0.5, 0.5, 0.8, 10), E.tank);
    h.position.set(a - r / 2 + 0.5, s + 0.75, l - i * 0.2), n.add(h);
  }
  const u = new t.Mesh(new t.BoxGeometry(0.07, 1.9, 0.9), E.door);
  u.position.set(a + 0.035, 0.95, l + i * 0.18), n.add(u);
  for (const f of [-i * 0.22]) {
    const h = new t.Mesh(new t.BoxGeometry(0.06, 1, 0.9), E.glass);
    h.position.set(a + 0.03, 1.55, l + f), n.add(h);
    for (let p = -2; p <= 2; p++) {
      const y = new t.Mesh(new t.BoxGeometry(0.02, 1, 0.03), E.grill);
      y.position.set(a + 0.055, 1.55, l + f + p * 0.18), n.add(y);
    }
  }
  return re(n), o.add(n), o.collide(a - r, l - i / 2, a, l + i / 2, s), n;
}
const hn = [{ key: "pharmacy", name: "SAINCE PHARMACY", telugu: "", bg: "#0d7a4d", fg: "#ffffff" }, { key: "dental", name: "M K DENTAL LAB", telugu: "", bg: "#27407a", fg: "#e8e4d8" }, { key: "courier", name: "INTERNATIONAL COURIER & CARGO", telugu: "", bg: "#8a1f1f", fg: "#ffd94d" }, null, null, null, null, null];
function pn(o) {
  let e = 6;
  hn.slice(0, 6).forEach((i, r) => {
    e < 17 && e + 5 > 12 && (e = 17.2), ft(o, { x: N(e + 5 / 2) + $e, z: e + 5 / 2, w: 5, d: 7.2, h: r % 3 === 2 ? 4.6 : 6.4, wall: r, sign: i, awning: r % 2 === 0 ? "a" : r % 3 === 0 ? "b" : null, side: -1 }), e += 5 + 0.15;
  });
  const n = [{ key: "tiffins", name: "SRI SIDDHARTHA TIFFIN CENTRE", telugu: "\u0C1F\u0C3F\u0C2B\u0C3F\u0C28\u0C4D \u0C38\u0C46\u0C02\u0C1F\u0C30\u0C4D", bg: "#b3312c", fg: "#ffffff" }, { key: "textiles", name: "DIWAN TEXTILES", telugu: "", bg: "#5b2d8e", fg: "#f4e28a" }];
  let a = 42;
  n.forEach((i, r) => {
    ft(o, { x: N(a + 5 / 2) - $e - 3.6, z: a + 5 / 2, w: 5, d: 7.2, h: 4.6, wall: r + 2, sign: i, awning: r === 0 ? "b" : null, side: 1 }), a += 5 + 0.15;
  });
  const l = [{ z: -50, sign: { key: "tasty", name: "TASTY BAKERY", telugu: "", bg: "#f4e6c8", fg: "#a12222" }, side: -1, awning: "b" }, { z: -44, sign: { key: "vidya", name: "SREE VIDYA BOOK CENTRE", telugu: "", bg: "#1f3a7a", fg: "#f4e28a" }, side: 1 }, { z: 54, sign: { key: "ramaiah", name: "RAMAIAH IIT STUDY CIRCLE", telugu: "", bg: "#c9531f", fg: "#ffffff" }, side: -1, awning: "a" }, { z: 45.4,
  sign: { key: "sharma", name: "SHARMA'S PHYSICS CLASSES", telugu: "", bg: "#27407a", fg: "#ffd94d" }, side: -1 }];
  for (const i of l) ft(o, { x: N(i.z) + (i.side > 0 ? -8.85 : $e), z: i.z, w: 5, d: 7.2, h: 4.6, wall: Math.abs(i.z | 0) % 8, sign: i.sign, awning: i.awning || null, side: i.side });
}
function mn(o) {
  const e = [{ x: -1, z: -10, w: 7, d: 6.5, h: 3.6, wall: 1, roof: "flat" }, { x: -1, z: -19, w: 6, d: 7, h: 4.8, wall: 3, roof: "slope" }, { x: -1, z: -28, w: 8, d: 7, h: 3.4, wall: 5, roof: "flat" }, { x: -1, z: -38, w: 6.5, d: 6.5, h: 4.2, wall: 2, roof: "flat" }, { x: -1, z: -52, w: 7.5, d: 7, h: 3.8, wall: 6, roof: "slope" }, { x: 1, z: -12, w: 6.5, d: 7, h: 3.5, wall: 4, roof: "flat" }, { x: 1,
  z: -24, w: 7, d: 6.5, h: 5.2, wall: 0, roof: "flat" }, { x: 1, z: -34, w: 6, d: 7, h: 3.6, wall: 7, roof: "slope" }, { x: 1, z: 62, w: 6.5, d: 6.5, h: 3.5, wall: 3, roof: "slope" }, { x: -1, z: 58, w: 7, d: 7, h: 4.6, wall: 0, roof: "flat" }];
  for (const n of e) {
    const a = N(n.z) + n.x * ($e + 3.4);
    fn(o, { ...n, x: a });
  }
}
const wn = F + O + 0.55, He = 12.3, qe = 17, Z = 11, se = 18.3, L = {};
function vt() {
  return L.done || (L.done = true, L.walls = [15983816, 15258542, 14673106, 15784128, 15129796, 14213348].map((o) => v({ color: o, bands: 3, tint: 9072480 })), L.trim = v({ color: 11573888, bands: 2, tint: 7035472 }), L.door = v({ color: 6047282, bands: 2, tint: 3812904 }), L.shutter = v({ color: 8226964, bands: 3, tint: 5265003 }), L.glass = j({ color: 4872816 }), L.grill = v({ color: 4934482, bands: 2,
  tint: 3816010 }), L.tank = v({ color: 3026483, bands: 3, tint: 3816010 }), L.road = v({ color: 6972528, bands: 3, tint: 7036528, flat: false }), L.walk = v({ color: 10194824, bands: 3, tint: 8022642, flat: false }), L.earth = v({ color: 13218452, bands: 3, tint: 9072478, flat: false }), L.awningA = v({ color: 13126460, bands: 3, tint: 8010298 }), L.awningB = v({ color: 3112299, bands: 3, tint: 2771530 }),
  L.grass = v({ color: 6130250, bands: 3, tint: 4151861 }), L.leaf = v({ color: 3042100, bands: 3, tint: 2049062 }), L.trunk = v({ color: 7031348, bands: 2, tint: 4863016 }), L.wall = v({ color: 15327172, bands: 3, tint: 9077362 })), L;
}
function Te(o, e) {
  vt();
  const n = new t.Group(), { x: a, zF: l, w: i, d: r, h: s, sign: c, face: d } = e, u = l - d * r / 2, f = new t.Mesh(new t.BoxGeometry(i, s, r), L.walls[e.wall % L.walls.length]);
  f.position.set(a, s / 2, u), n.add(f);
  const h = new t.Mesh(new t.BoxGeometry(i + 0.15, 0.42, r + 0.15), L.trim);
  h.position.set(a, s + 0.18, u), n.add(h);
  const p = new t.Mesh(new t.CylinderGeometry(0.55, 0.55, 0.9, 12), L.tank);
  if (p.position.set(a - i * 0.22, s + 0.85, u + d * (r / 2 - 0.7)), n.add(p), c) {
    const m = je(c.key, c), k = [L.trim, L.trim, L.trim, L.trim, L.trim, L.trim];
    k[d > 0 ? 4 : 5] = new t.MeshBasicMaterial({ map: m });
    const x = new t.Mesh(new t.BoxGeometry(i * 0.92, 1, 0.12), k);
    x.position.set(a, s - 1.45, l + d * 0.06), n.add(x);
  }
  const y = i * 0.44, w = new t.Mesh(new t.BoxGeometry(y, 2.3, 0.08), L.shutter);
  w.position.set(a - i * 0.18, 1.15, l + d * 0.02), n.add(w);
  for (let m = 0; m < 6; m++) {
    const k = new t.Mesh(new t.BoxGeometry(y, 0.035, 0.03), L.grill);
    k.position.set(a - i * 0.18, 0.45 + m * 0.36, l + d * 0.07), n.add(k);
  }
  const T = new t.Mesh(new t.BoxGeometry(i * 0.26, 2.1, 0.08), L.door);
  if (T.position.set(a + i * 0.24, 1.05, l + d * 0.02), n.add(T), e.awning) {
    const m = new t.Mesh(new t.BoxGeometry(i * 0.8, 0.06, 1.5), e.awning === "a" ? L.awningA : L.awningB);
    m.rotation.x = 0.28 * d, m.position.set(a, 2.62, l + d * 0.72), n.add(m);
  }
  for (const m of [-i * 0.22, i * 0.22]) {
    const k = new t.Mesh(new t.BoxGeometry(0.95, 1.15, 0.06), L.glass);
    k.position.set(a + m, s - 2.6, l + d * 0.03), n.add(k);
    for (let x = -2; x <= 2; x++) {
      const S = new t.Mesh(new t.BoxGeometry(0.035, 1.15, 0.02), L.grill);
      S.position.set(a + m + x * 0.19, s - 2.6, l + d * 0.06), n.add(S);
    }
  }
  re(n), o.add(n);
  const z = d > 0 ? l - r : l, b = d > 0 ? l : l + r;
  return o.collide(a - i / 2, z, a + i / 2, b, s), n;
}
function ht(o, e, n, a) {
  vt();
  const l = new t.Mesh(new t.CylinderGeometry(0.14 * a, 0.2 * a, 2.2 * a, 8), L.trunk);
  l.position.set(e, 1.1 * a, n), o.add(l);
  const i = new t.Mesh(new t.IcosahedronGeometry(1.5 * a, 1), L.leaf);
  i.position.set(e, 2.9 * a, n), i.scale.y = 0.85, o.add(i);
  const r = new t.Mesh(new t.IcosahedronGeometry(1 * a, 1), L.leaf);
  r.position.set(e + 0.7 * a, 3.6 * a, n + 0.3 * a), o.add(r);
}
function xn(o) {
  const e = vt(), n = new t.Group();
  n.name = "shivamRoad", o.add(n);
  const a = N((He + qe) / 2) + wn - 0.6, l = a + 34, i = new t.Mesh(new t.BoxGeometry(l - a, 0.024, qe - He), e.road);
  i.position.set((a + l) / 2, 0.012, (He + qe) / 2), i.receiveShadow = true, n.add(i);
  for (const [r, s, c] of [[Z, He, le], [qe, se, le], [Z - 3.2, Z, 4e-3], [se, se + 3.2, 4e-3]]) {
    const d = new t.Mesh(new t.BoxGeometry(l - a, 0.02, s - r), c > 0.01 ? e.walk : e.earth);
    d.position.set((a + l) / 2, c, (r + s) / 2), d.receiveShadow = true, n.add(d);
  }
  {
    const r = new t.Mesh(new t.CylinderGeometry(0.05, 0.05, 3.1, 8), e.grill);
    r.position.set(a + 0.7, 1.55, se + 0.2), n.add(r);
    const s = je("shivamrd", { name: "SHIVAM ROAD", telugu: "", bg: "#1d4e9c", fg: "#ffffff" }), c = [e.trim, e.trim, e.trim, e.trim, e.trim, e.trim];
    c[5] = new t.MeshBasicMaterial({ map: s });
    const d = new t.Mesh(new t.BoxGeometry(2, 0.55, 0.06), c);
    d.position.set(a + 0.7, 2.9, se + 0.2), n.add(d);
  }
  {
    const r = new t.Mesh(new t.BoxGeometry(8.2, 0.06, 6.2), e.grass);
    r.position.set(a + 7.6, 0.03, Z - 3.3), r.receiveShadow = true, n.add(r), ht(n, a + 5.2, Z - 2.2, 1), ht(n, a + 9.6, Z - 4.4, 1.25), ht(n, a + 8.4, Z - 1.6, 0.8);
    const s = new t.Mesh(new t.BoxGeometry(8.2, 0.55, 0.18), e.wall);
    s.position.set(a + 7.6, 0.28, Z - 0.15), n.add(s);
    const c = je("narendra", { name: "NARENDRA PARK", telugu: "", bg: "#0d5a3f", fg: "#ffffff" }), d = [e.trim, e.trim, e.trim, e.trim, e.trim, e.trim];
    d[4] = new t.MeshBasicMaterial({ map: c });
    const u = new t.Mesh(new t.BoxGeometry(2.4, 0.5, 0.08), d);
    u.position.set(a + 5.4, 0.95, Z - 0.15), n.add(u), o.collide(a + 3.5, Z - 6.4, a + 11.7, Z - 0.3, 0.55);
  }
  Te(o, { x: a + 15.2, zF: Z, w: 5, d: 6.8, h: 4.6, wall: 2, face: 1, awning: "a", sign: { key: "papaji", name: "PAPAJI DA DHABA", telugu: "", bg: "#7a1f1f", fg: "#ffd94d" } }), Te(o, { x: a + 22.2, zF: Z, w: 5.6, d: 6.8, h: 5.4, wall: 0, face: 1, sign: { key: "bakersq", name: "BAKERS 'Q", telugu: "", bg: "#101c30", fg: "#ffffff" } }), Te(o, { x: a + 6.5, zF: se, w: 5, d: 6.8, h: 4.6, wall: 4, face: -1,
  sign: null }), Te(o, { x: a + 13.6, zF: se, w: 5.2, d: 6.8, h: 5.4, wall: 1, face: -1, awning: "b", sign: { key: "shanthi", name: "SHANTHI HOTEL", telugu: "", bg: "#14406e", fg: "#ffd94d" } }), Te(o, { x: a + 20.8, zF: se, w: 4.6, d: 6.8, h: 4.6, wall: 3, face: -1, sign: { key: "bhavani", name: "BHAVANI BOOK STALL", telugu: "", bg: "#8a1f1f", fg: "#ffffff" } }), Te(o, { x: a + 27.4, zF: se, w: 5,
  d: 6.8, h: 4.6, wall: 5, face: -1, sign: null });
  {
    const r = new t.Mesh(new t.BoxGeometry(2.4, 6, se + 3.2 - (Z - 3.2)), e.walls[2]);
    r.position.set(l + 1.2, 3, (Z + se) / 2), re(r), n.add(r), o.collide(l, Z - 3.2, l + 2.4, se + 3.2, 6);
  }
  return n;
}
const Pt = F + O + 0.65, Pe = 13, Ie = 41, J = 27, ce = 1.5;
function yn() {
  const o = document.createElement("canvas");
  o.width = 512, o.height = 256;
  const e = o.getContext("2d");
  e.fillStyle = "#d8622a", e.fillRect(0, 0, 512, 256), e.fillStyle = "#1f3a7a", e.fillRect(0, 0, 512, 18), e.fillStyle = "#d8a83c", e.fillRect(0, 18, 512, 8), e.fillStyle = "#1f3a7a", e.fillRect(0, 230, 512, 26), e.fillStyle = "#d8a83c", e.fillRect(0, 222, 512, 8), e.fillStyle = "#14306e", e.textAlign = "center", e.textBaseline = "middle", e.font = 'bold 64px "Noto Sans Telugu", sans-serif', e.fillText(
  "\u0C36\u0C43\u0C02\u0C17\u0C47\u0C30\u0C3F \u0C36\u0C02\u0C15\u0C30 \u0C2E\u0C20\u0C02", 256, 108), e.font = 'bold 34px "Noto Sans Telugu", sans-serif', e.fillText("\xB7 \u0C28\u0C32\u0C4D\u0C32\u0C15\u0C41\u0C02\u0C1F \xB7", 256, 178);
  const n = new t.CanvasTexture(o);
  return n.colorSpace = t.SRGBColorSpace, n;
}
function gn() {
  const o = document.createElement("canvas");
  o.width = o.height = 256;
  const e = o.getContext("2d");
  e.clearRect(0, 0, 256, 256), e.fillStyle = "rgba(255,255,255,0.92)";
  const n = (l, i, r = 3.2) => {
    e.beginPath(), e.arc(l, i, r, 0, 7), e.fill();
  };
  for (let l = 0; l < 9; l++) for (let i = 0; i < 9; i++) n(28 + l * 25 + (i % 2 ? 12 : 0), 28 + i * 25);
  e.strokeStyle = "rgba(255,255,255,0.9)", e.lineWidth = 4, e.beginPath(), e.moveTo(128, 12), e.lineTo(244, 128), e.lineTo(128, 244), e.lineTo(12, 128), e.closePath(), e.stroke();
  const a = new t.CanvasTexture(o);
  return a.colorSpace = t.SRGBColorSpace, a;
}
function bn(o) {
  const e = new t.Group();
  e.name = "shankarMutt", o.add(e);
  const n = N(J), a = n - Pt, l = n - Pt - 17, i = v({ color: 15327172, bands: 3, tint: 9077362 }), r = v({ color: 13194015, bands: 3, tint: 7027252 }), s = v({ color: 14180906, bands: 3, tint: 8010272 }), c = v({ color: 14715482, bands: 3, tint: 9062960 }), d = v({ color: 14198844, bands: 3, tint: 9071146, emissive: 6901268, emissiveIntensity: 0.25 }), u = j({ color: 1511435 }), f = v({ color: 11911876,
  bands: 3, tint: 6978172 }), h = 2.05, p = [{ x0: a, z0: Pe, x1: a + 0.35, z1: J - ce }, { x0: a, z0: J + ce, x1: a + 0.35, z1: Ie }, { x0: l, z0: Pe, x1: l + 0.35, z1: Ie }, { x0: l, z0: Pe, x1: a + 0.35, z1: Pe + 0.35 }, { x0: l, z0: Ie - 0.35, x1: a + 0.35, z1: Ie }];
  for (const M of p) {
    const g = Math.max(M.x1 - M.x0, 0.35), A = Math.max(M.z1 - M.z0, 0.35), V = new t.Mesh(new t.BoxGeometry(g, h, A), i);
    V.position.set((M.x0 + M.x1) / 2, h / 2, (M.z0 + M.z1) / 2), e.add(V);
    const U = new t.Mesh(new t.BoxGeometry(g + 0.08, 0.2, A + 0.08), r);
    U.position.set((M.x0 + M.x1) / 2, h - 0.1, (M.z0 + M.z1) / 2), e.add(U), o.collide(M.x0 - 0.05, M.z0 - 0.05, M.x1 + 0.05, M.z1 + 0.05, h);
  }
  const y = [12729198, 14198844, 14180906, 8954040];
  [[16.5, 0, 1], [20.5, 1, 0.85], [33.5, 2, 0.95], [37.2, 3, 0.8]].forEach(([M, g, A], V) => {
    const U = new t.Mesh(new t.PlaneGeometry(0.8, A), new t.MeshBasicMaterial({ color: y[g] }));
    U.rotation.y = Math.PI / 2, U.position.set(a + 0.37, 1.05 + V % 2 * 0.15, M), e.add(U);
    const C = new t.Mesh(new t.PlaneGeometry(0.6, A * 0.3), new t.MeshBasicMaterial({ color: 15853776 }));
    C.rotation.y = Math.PI / 2, C.position.set(a + 0.375, 1 + V % 2 * 0.15, M), e.add(C);
  });
  for (const M of [-1, 1]) {
    const g = J + M * (ce + 0.5), A = new t.Mesh(new t.BoxGeometry(0.95, 3.2, 0.95), s);
    A.position.set(a + 0.18, 1.6, g), e.add(A);
    const V = new t.Mesh(new t.BoxGeometry(1.15, 0.22, 1.15), r);
    V.position.set(a + 0.18, 3.3, g), e.add(V), o.collide(a - 0.28, g - 0.5, a + 0.66, g + 0.5, 3.3);
  }
  const w = new t.Mesh(new t.BoxGeometry(0.8, 0.55, ce * 2 + 2.9), s);
  w.position.set(a + 0.18, 3.66, J), e.add(w);
  const T = new t.Mesh(new t.CircleGeometry(ce + 0.4, 24, 0, Math.PI), new t.MeshBasicMaterial({ map: yn() }));
  T.rotation.y = Math.PI / 2, T.position.set(a + 0.6, 3.9, J), e.add(T);
  const z = [[0, 5.6], [-0.85, 4.62], [0.85, 4.62], [-1.75, 4.15], [1.75, 4.15]];
  for (const [M, g] of z) {
    const A = new t.Mesh(new t.SphereGeometry(0.19, 10, 8), c);
    A.position.set(a + 0.5, g, J + M), A.scale.y = 1.25, e.add(A);
  }
  const b = new t.Mesh(new t.SphereGeometry(0.14, 8, 6), d);
  b.position.set(a + 0.5, 5.85, J), e.add(b);
  const m = new t.Mesh(new t.PlaneGeometry(ce * 2, 3), u);
  m.rotation.y = Math.PI / 2, m.position.set(a - 0.55, 1.5, J), e.add(m);
  const k = new t.Mesh(new t.BoxGeometry(1.1, 0.07, ce * 2), u);
  k.position.set(a - 0.1, 0.035, J), e.add(k), o.collide(a - 0.4, J - ce, a + 0.55, J + ce, 3.2);
  const x = new t.Mesh(new t.BoxGeometry(8.5, 4.4, 10), f);
  x.position.set(l + 6.5, 2.2, J + 1.5), e.add(x);
  const S = new t.Mesh(new t.BoxGeometry(8.7, 0.3, 10.2), r);
  S.position.set(l + 6.5, 4.35, J + 1.5), e.add(S);
  for (const [M, g, A] of [[l + 2.5, Pe + 3.5, 2.6], [a - 6.5, Ie - 2.2, 2.1]]) {
    const V = new t.Mesh(new t.CylinderGeometry(0.22, 0.3, 3.4, 8), v({ color: 5916210, bands: 3, tint: 3812898 }));
    V.position.set(M, 1.7, g), e.add(V);
    const U = new t.Mesh(new t.IcosahedronGeometry(A, 1), v({ color: 4156229, bands: 3, tint: 2771506 }));
    U.position.set(M, 3.3 + A * 0.7, g), U.scale.y = 0.82, e.add(U);
  }
  const G = new t.Mesh(new t.PlaneGeometry(2.3, 2.3), new t.MeshBasicMaterial({ map: gn(), transparent: true, depthWrite: false }));
  return G.rotation.x = -Math.PI / 2, G.position.set(a + 1.9, 0.062, J), G.renderOrder = 2, e.add(G), re(e), { gatePos: { x: a + 0.6, z: J } };
}
const te = {};
function co() {
  return te.pole || (te.pole = v({ color: 14078680, bands: 3, tint: 6972040 }), te.metal = v({ color: R.metal, bands: 3, tint: 6709392 }), te.metalDark = v({ color: R.metalDark, bands: 3, tint: 6051456 }), te.dark = v({ color: R.black, bands: 2, tint: 4932960 }), te.wire = v({ color: 4998744, bands: 2, tint: 4275288 }), te.red = v({ color: R.red, bands: 3, tint: 8011872 }), te.white = v({ color: R.
  wallWhite, bands: 3, tint: 7301008 }), te.concrete = v({ color: R.concrete, bands: 3, tint: 7301008 }), te.concreteMid = v({ color: R.concreteMid, bands: 3, tint: 6972040 }), te.terracotta = v({ color: 12941914, bands: 3, tint: 7296640 }), te.leaf = v({ color: R.leaf, bands: 3, tint: 5992332 }), te.leafDeep = v({ color: R.leafDeep, bands: 3, tint: 5992332 })), te;
}
function vn(o = {}) {
  const e = co(), n = Se(o.seed ?? 5), a = new t.Group(), l = o.h ?? 9.2, i = { pole: [], metal: [], dark: [], white: [] }, r = (f, h, p) => i[f].push({ geometry: h, matrix: p });
  r("pole", new t.CylinderGeometry(0.11, 0.19, l, 8), B(0, l / 2, 0)), r("pole", new t.CylinderGeometry(0.24, 0.28, 0.22, 8), B(0, 0.11, 0));
  const s = o.armYs ?? [l - 0.55, l - 1.5], c = o.armDir ?? 1;
  if (s.forEach((f, h) => {
    const p = h === 0 ? 2.1 : 1.7;
    r("dark", new t.BoxGeometry(0.09, 0.1, p), B(0, f, 0)), r("metal", new t.BoxGeometry(0.06, 0.5, 0.06), B(0, f - 0.3, 0));
    for (let y = -1; y <= 1; y++) y === 0 && h === 1 || (r("white", new t.CylinderGeometry(0.06, 0.075, 0.16, 7), B(0, f + 0.13, y * p / 2.4)), r("metal", new t.CylinderGeometry(0.02, 0.02, 0.14, 5), B(0, f + 0.04, y * p / 2.4)));
  }), o.transformer !== false) {
    const f = l - 2.9;
    r("metal", new t.BoxGeometry(0.5, 0.14, 1.5), B(c * 0.34, f + 0.62, 0));
    for (const h of [-0.42, 0.42]) r("metal", new t.CylinderGeometry(0.24, 0.24, 0.72, 10), B(c * 0.34, f + 0.24, h)), r("metal", new t.CylinderGeometry(0.26, 0.26, 0.06, 10), B(c * 0.34, f + 0.62, h));
    r("dark", new t.BoxGeometry(0.28, 0.5, 0.28), B(-c * 0.24, f + 1.1, 0));
  }
  r("dark", new t.CylinderGeometry(0.045, 0.045, l - 1.4, 5), B(c * 0.135, (l - 1.4) / 2, 0.06));
  const d = new t.Mesh(new t.CylinderGeometry(0.205, 0.21, 0.62, 12, 1, true, -1, 2), j({ color: 16777215, map: To(n.int(0, 2)), cache: false, side: t.DoubleSide }));
  if (d.position.set(0, 2.45, 0), d.rotation.y = o.plateFace ?? (c > 0 ? Math.PI / 2 : -Math.PI / 2), d.castShadow = true, a.add(d), o.lamp) {
    r("metal", new t.CylinderGeometry(0.05, 0.05, 1.3, 6), B(c * 0.65, l - 3.9, 0, 0, 0, Math.PI / 2));
    const f = new t.Mesh(new t.ConeGeometry(0.32, 0.26, 12, 1, true), e.metal);
    f.position.set(c * 1.28, l - 4.02, 0), a.add(f);
    const h = eo(0.26, 0.05, 0.26, j({ color: 16773840 }), c * 1.28, l - 4.16, 0);
    a.add(h);
  }
  const u = { pole: e.pole, metal: e.metal, dark: e.dark, white: e.white };
  for (const f of Object.keys(i)) {
    if (!i[f].length) continue;
    const h = new t.Mesh(Ze(i[f]), u[f]);
    h.castShadow = true, h.receiveShadow = true, a.add(h), f === "pole" && so(h, { thickness: 34e-4 });
  }
  return a.position.set(o.x, o.y ?? 0, o.z), a.userData.top = (o.y ?? 0) + l, a;
}
function Mn(o, e) {
  const n = co(), a = [];
  for (const r of e) {
    const { points: s, sag: c = 0.5, r: d = 0.026 } = r;
    for (let u = 0; u < s.length - 1; u++) {
      const f = s[u], h = s[u + 1], p = f.distanceTo(h), y = Po(f, h, c * Math.min(1.6, p / 14), 12);
      a.push(new t.TubeGeometry(y, 14, d, 4, false));
    }
  }
  if (!a.length) return null;
  const l = a.length === 1 ? a[0] : Ze(a.map((r) => ({ geometry: r }))), i = new t.Mesh(l, n.wire);
  return i.name = "wires", i.material = n.wire, o.add(i), a.forEach((r) => r !== l && r.dispose()), i;
}
const he = (o, e, n = 0) => new t.Vector3(o, e, n), kn = 0.018;
he(-0.52, 0.33 + kn), he(0.55, 0.33), he(-0.1, 0.28), he(-0.27, 0.86), he(0.44, 0.6), he(0.49, 0.86), he(0.46, 0.97), he(-0.31, 1);
function Sn(o) {
  const e = Se(9021), n = [], a = [];
  for (let r = -70; r <= 72; r += 15.5) a.push(r + e.range(-1.2, 1.2));
  let l = -1;
  for (const r of a) {
    if (Math.abs(r) < 5.5) continue;
    const s = N(r) + l * (F + O - 0.28), c = vn({ seed: r * 31 | 0, h: 8.6, armDir: -l });
    c.position.set(s, o.groundAt(s, r), r), o.add(c), re(c), o.collide(s - 0.22, r - 0.22, s + 0.22, r + 0.22, 8.6), n.push({ x: s, z: r, side: l }), l = -l;
  }
  const i = [];
  for (const r of [-1, 1]) {
    const s = n.filter((c) => c.side === r);
    for (const c of [0, -0.9]) {
      const d = s.map((u) => new t.Vector3(u.x, o.groundAt(u.x, u.z) + 8 + c, u.z));
      d.length > 1 && i.push({ points: d, sag: 0.55 });
    }
  }
  for (const r of [10, 26, 44, -16, -34]) {
    const s = N(r);
    i.push({ points: [new t.Vector3(s - (F + O - 0.28), 8.1, r), new t.Vector3(s + (F + O + 2.6), 6.4, r + 0.8)], sag: 0.7 });
  }
  i.push({ points: [new t.Vector3(N(-24) - 4.4, 7.9, -24), new t.Vector3(N(-6) - 4.5, 4.6, -6)], sag: 0.9 }), Mn(o, i);
}
function zn(o) {
  const e = new t.Group(), n = -14, a = N(n) + F + O - 0.2, l = v({ color: 4877964, bands: 3, tint: 3820126 }), i = v({ color: 3626606, bands: 3, tint: 3029582 });
  for (const d of [-1.6, 1.6]) {
    const u = new t.Mesh(new t.CylinderGeometry(0.06, 0.06, 2.5, 8), l);
    u.position.set(a, 1.25, n + d), e.add(u);
  }
  const r = new t.Mesh(new t.BoxGeometry(1.7, 0.08, 4), i);
  r.rotation.z = -0.06, r.position.set(a - 0.3, 2.52, n), e.add(r);
  const s = new t.Mesh(new t.BoxGeometry(0.45, 0.08, 3.2), v({ color: 9071176, bands: 2, tint: 5916214 }));
  s.position.set(a + 0.35, 0.55, n), e.add(s);
  for (const d of [-1.3, 1.3]) {
    const u = new t.Mesh(new t.BoxGeometry(0.4, 0.5, 0.08), l);
    u.position.set(a + 0.35, 0.3, n + d), e.add(u);
  }
  const c = new t.Mesh(new t.BoxGeometry(0.06, 0.75, 2), (() => {
    const d = new t.MeshBasicMaterial({ map: rn() });
    return [l, l, l, l, d, l];
  })());
  return c.position.set(a - 0.75, 1.9, n), c.rotation.y = Math.PI, e.add(c), re(e), o.add(e), o.collide(a - 0.6, n - 1.8, a + 0.6, n + 1.8, 2.4, 0.9), { pos: { x: a - 1.2, z: n } };
}
function Tn(o) {
  const e = v({ color: 7039858, bands: 2, tint: 3816010 });
  for (const { z: n, side: a } of [{ z: 45, side: -1 }, { z: -20, side: 1 }]) {
    const l = N(n) + a * (F + O + 0.15), i = new t.Mesh(new t.CylinderGeometry(0.05, 0.05, 2.9, 8), e);
    i.position.set(l, o.groundAt(l, n) + 1.45, n), o.add(i);
    const r = new t.MeshBasicMaterial({ map: cn() }), s = new t.Mesh(new t.BoxGeometry(0.05, 0.5, 2.2), [e, e, e, e, r, e]);
    s.position.set(l, 2.75, n), o.add(s), o.collide(l - 0.12, n - 0.12, l + 0.12, n + 0.12, 2.9);
  }
}
function Gn(o, e = 1) {
  const n = new t.Group(), a = v({ color: 7230272, bands: 3, tint: 4864560 }), l = [5214047, 6265940, 4161359], i = 2.6 * e, r = new t.Mesh(new t.CylinderGeometry(0.14 * e, 0.24 * e, i, 7), a);
  r.position.y = i / 2, n.add(r);
  const s = o.int(3, 5);
  for (let c = 0; c < s; c++) {
    const d = o.range(0.9, 1.5) * e, u = new t.Mesh(new t.IcosahedronGeometry(d, 1), v({ color: o.pick(l), bands: 3, tint: 3825482 }));
    u.position.set(o.range(-0.8, 0.8) * e, i + o.range(-0.2, 0.9) * e, o.range(-0.8, 0.8) * e), u.scale.y = 0.72, n.add(u);
  }
  return re(n), n;
}
function An(o) {
  const e = Se(777), n = [{ x: -10.5, z: 20, s: 1.5, c: true }, { x: -13.5, z: 34, s: 1.35, c: true }, { x: -5.85, z: 22.5, s: 1.25, c: true }, { x: -5.7, z: -14, s: 1.1, c: true }, { x: F + O + 1.1, z: -27, s: 1, c: true }, { x: -5.9, z: -44, s: 1.2, c: true }, { x: F + O + 1, z: -58, s: 1, c: true }, { x: F + O + 1.2, z: 56.5, s: 1.1, c: true }, { x: -5.7, z: 52.5, s: 0.95, c: true }, { x: F + O +
  1.3, z: 66, s: 1.15, c: true }];
  for (const a of n) {
    const l = N(a.z) + a.x, i = Gn(e, a.s);
    i.position.set(l, o.groundAt(l, a.z), a.z), o.add(i), a.c && o.collide(l - 0.26, a.z - 0.26, l + 0.26, a.z + 0.26, 2.4);
  }
}
function Bn(o) {
  const e = new t.Group(), n = v({ color: 9071170, bands: 3, tint: 4864548 }), a = v({ color: 10123850, bands: 3, tint: 5916208 }), l = [4160053, 14186274, 11743532, 5909867, 8034874, 14201402], i = [{ z: 31.5, tarp: 2775706 }, { z: 35.4, tarp: 3832394 }];
  for (const r of i) {
    const s = N(r.z) - (F + O - 1);
    for (const [h, p] of [[-0.8, -1], [0.8, -1], [-0.8, 1], [0.8, 1]]) {
      const y = new t.Mesh(new t.CylinderGeometry(0.045, 0.05, 2.3, 6), a);
      y.position.set(s + h, 1.15, r.z + p), e.add(y);
    }
    const c = new t.Mesh(new t.BoxGeometry(2.1, 0.05, 2.6), v({ color: r.tarp, bands: 3, tint: 1714746 }));
    c.position.set(s, 2.32, r.z), c.rotation.z = 0.12, c.rotation.x = 0.06, e.add(c);
    const d = new t.Mesh(new t.BoxGeometry(1.5, 0.55, 1.8), n);
    d.position.set(s, 0.5, r.z), e.add(d);
    let u = 0;
    for (const h of [-0.6, 0, 0.6]) for (const p of [-0.4, 0.05, 0.5]) {
      const y = new t.Mesh(new t.IcosahedronGeometry(0.15, 1), v({ color: l[u % l.length], bands: 3, tint: 2767394 }));
      y.position.set(s + p, 0.86, r.z + h), y.scale.y = 0.6, e.add(y), u++;
    }
    const f = new t.Mesh(new t.CylinderGeometry(0.32, 0.24, 0.35, 10), n);
    f.position.set(s + 1.1, 0.18, r.z + 0.7), e.add(f), o.collide(s - 0.9, r.z - 1.05, s + 0.9, r.z + 1.05, 2.2);
  }
  re(e), o.add(e);
}
function Cn(o) {
  const e = new t.Group(), n = v({ color: 10121280, bands: 3, tint: 5914672 }), a = v({ color: 3816002, bands: 2, tint: 2763314 }), l = v({ color: 3026483, bands: 2, tint: 1973796 }), i = v({ color: 1842208, bands: 2, tint: 1052692 }), r = v({ color: 14182942, bands: 3, tint: 9058832 }), s = v({ color: 14726234, bands: 3, tint: 10517040 }), c = new t.MeshBasicMaterial({ color: 12375264, transparent: true,
  opacity: 0.32 });
  function d(u, f, h) {
    const p = new t.Group();
    p.position.set(u, 0, f), p.rotation.y = h;
    const y = new t.Mesh(new t.BoxGeometry(1.7, 0.85, 1), n);
    y.position.y = 0.75, p.add(y);
    for (const x of [-0.42, 0.42]) {
      const S = new t.Mesh(new t.TorusGeometry(0.34, 0.045, 8, 18), l);
      S.position.set(-0.55, 0.34, x), p.add(S);
      const G = new t.Mesh(new t.CylinderGeometry(0.05, 0.05, 0.06, 8), a);
      G.rotation.x = Math.PI / 2, G.position.set(-0.55, 0.34, x), p.add(G);
      for (let M = 0; M < 3; M++) {
        const g = new t.Mesh(new t.BoxGeometry(0.02, 0.62, 0.02), a);
        g.position.set(-0.55, 0.34, x + 1e-3), g.rotation.z = M * Math.PI / 3, p.add(g);
      }
    }
    const w = new t.Mesh(new t.CylinderGeometry(0.03, 0.03, 0.55, 6), a);
    w.position.set(0.72, 0.27, 0), p.add(w);
    const T = new t.Mesh(new t.BoxGeometry(1.1, 0.06, 0.8), a);
    T.position.set(-0.2, 1.22, 0), p.add(T);
    const z = new t.Mesh(new t.BoxGeometry(1.04, 0.5, 0.74), c);
    z.position.set(-0.2, 1.5, 0), p.add(z);
    const b = new t.Mesh(new t.BoxGeometry(1.1, 0.05, 0.8), a);
    b.position.set(-0.2, 1.78, 0), p.add(b);
    for (let x = 0; x < 3; x++) {
      const S = new t.Mesh(new t.CylinderGeometry(0.16, 0.16, 0.05 + x * 0.02, 12), s);
      S.position.set(-0.5 + x * 0.3, 1.3, -0.15 + x % 2 * 0.3), p.add(S);
    }
    const m = new t.Mesh(new t.CylinderGeometry(0.34, 0.34, 0.05, 16), i);
    m.position.set(0.55, 1.21, 0), p.add(m);
    const k = new t.Mesh(new t.CylinderGeometry(0.16, 0.16, 0.5, 10), r);
    k.position.set(0.55, 0.28, 0.32), p.add(k), e.add(p), o.collide(u - 1, f - 0.6, u + 1, f + 0.6, 1.9);
  }
  d(N(20) + (F + O - 1), 20, -Math.PI / 2), d(N(14.65) + F + O + 3.4, 17.55, Math.PI), d(N(-49.5) + (F + O - 1), -49.5, -Math.PI / 2), re(e), o.add(e);
}
const ee = {};
function Rn() {
  return ee.concrete || (ee.concrete = v({ color: R.concrete, bands: 3, tint: 7301008 }), ee.concreteMid = v({ color: R.concreteMid, bands: 3, tint: 6972040 }), ee.metal = v({ color: R.metal, bands: 3, tint: 6709392 }), ee.metalDark = v({ color: R.metalDark, bands: 3, tint: 6051456 }), ee.dark = v({ color: R.black, bands: 2, tint: 4932960 }), ee.shell = v({ color: 12896462, bands: 3, tint: 6709392 }),
  ee.shellTrim = v({ color: 10133672, bands: 3, tint: 6051456 }), ee.wood = v({ color: 10256222, bands: 3, tint: 6051456 }), ee.woodDark = v({ color: 8217416, bands: 3, tint: 6051456 }), ee.soil = v({ color: 7627342, bands: 3, tint: 6380160 }), ee.bamboo = v({ color: R.bamboo, bands: 3, flat: false, tint: 5992332 }), ee.twine = v({ color: R.rope, bands: 3, flat: false, tint: 7301008 }), ee.pale = j(
  { color: 16184040 })), ee;
}
const P = (o, e, n = 0) => new t.Vector3(o, e, n), En = P(0, 1, 0), pt = /* @__PURE__ */ new Map();
function Pn(o) {
  return pt.has(o) || pt.set(o, new t.CylinderGeometry(1, 1, 1, o, 1)), pt.get(o);
}
function K(o, e, n, a, l = 6) {
  const i = new t.Vector3().subVectors(n, e), r = i.length();
  r < 1e-4 || o.push({ geometry: Pn(l), matrix: new t.Matrix4().compose(new t.Vector3().addVectors(e, n).multiplyScalar(0.5), new t.Quaternion().setFromUnitVectors(En, i.normalize()), P(a, r, a)) });
}
function In(o, e, n, a = {}) {
  const l = a.noCast ?? [];
  for (const i of Object.keys(e)) {
    if (!e[i].length) continue;
    const r = new t.Mesh(Ze(e[i]), n[i]);
    r.castShadow = !l.includes(i), r.receiveShadow = true, o.add(r), i === a.outline && so(r, { thickness: a.thickness ?? 32e-4 });
  }
  return o;
}
function It(o = {}) {
  const e = Rn(), n = new t.Group(), a = new t.Group();
  n.add(a);
  const l = 0.2, i = { RA: P(-0.6, l), FA: P(0.57, l), ENG: P(-0.3, 0.28), RS: P(-0.22, 0.3), FS: P(0.3, 0.28), HS: P(0.48, 0.62), HT: P(0.4, 0.96), BAR: P(0.38, 1), SHK: P(-0.44, 0.5) }, r = { dark: [], metal: [], body: [], amber: [], dial: [] }, s = (d, u, f) => r[d].push({ geometry: u, matrix: f }), c = v({ color: o.color ?? 13227228, bands: 3, tint: 7301008 });
  for (const d of [i.RA, i.FA]) s("dark", new t.CylinderGeometry(l, l, 0.09, 14), B(d.x, d.y, 0, Math.PI / 2)), s("metal", new t.CylinderGeometry(0.125, 0.125, 0.11, 12), B(d.x, d.y, 0, Math.PI / 2)), s("dark", new t.CylinderGeometry(0.038, 0.038, 0.13, 8), B(d.x, d.y, 0, Math.PI / 2));
  s("body", new t.TorusGeometry(l + 0.04, 0.026, 4, 14, Math.PI * 0.85), B(i.FA.x, i.FA.y, 0, 0, 0, -0.72, 1, 1, 2.2)), s("body", new t.TorusGeometry(l + 0.05, 0.032, 4, 12, Math.PI * 0.62), B(i.RA.x, i.RA.y, 0, 0, 0, 0.55, 1, 1, 1.9));
  for (const d of [-1, 1]) K(r.metal, P(i.HS.x, i.HS.y, d * 0.055), P(i.FA.x, i.FA.y, d * 0.055), 0.019), K(r.metal, P(i.ENG.x, i.ENG.y, d * 0.062), P(i.RA.x, i.RA.y, d * 0.062), 0.022);
  K(r.metal, i.HS, i.HT, 0.026), K(r.metal, i.HS, i.FS, 0.026), K(r.metal, i.FS, i.RS, 0.024), K(r.metal, i.RS, i.SHK, 0.024), K(r.metal, P(i.SHK.x, i.SHK.y, 0.07), P(i.RA.x + 0.02, i.RA.y + 0.04, 0.07), 0.024), K(r.metal, P(-0.14, 0.26, -0.09), P(-0.24, 0.015, -0.19), 0.016);
  for (const d of [-1, 1]) s("body", new t.BoxGeometry(0.5, 0.24, 0.11), B(-0.4, 0.4, d * 0.125));
  s("body", new t.BoxGeometry(0.46, 0.09, 0.34), B(-0.4, 0.505, 0)), s("dark", new t.BoxGeometry(0.34, 0.08, 0.3), B(-0.46, 0.59, 0)), s("dark", new t.BoxGeometry(0.16, 0.065, 0.2), B(-0.24, 0.575, 0)), s("body", new t.BoxGeometry(0.56, 0.03, 0.36), B(0.06, 0.275, 0)), s("dark", new t.BoxGeometry(0.46, 0.014, 0.28), B(0.04, 0.297, 0)), s("body", new t.BoxGeometry(0.16, 0.46, 0.42), B(0.38, 0.68, 0,
  0, 0, 0.22)), s("body", new t.BoxGeometry(0.16, 0.16, 0.38), B(0.3, 0.4, 0)), s("body", new t.BoxGeometry(0.16, 0.18, 0.3), B(0.4, 0.94, 0)), K(r.metal, P(-0.28, 0.28, 0.09), P(-0.5, 0.245, 0.13), 0.024), s("metal", new t.CylinderGeometry(0.045, 0.045, 0.24, 10), B(-0.62, 0.24, 0.14, 0, 0, Math.PI / 2)), s("metal", new t.BoxGeometry(0.28, 0.025, 0.26), B(-0.66, 0.655, 0));
  for (const d of [-1, 1]) K(r.metal, P(-0.56, 0.65, d * 0.11), P(-0.5, 0.55, d * 0.13), 0.014), K(r.metal, P(-0.78, 0.65, d * 0.11), P(-0.68, 0.55, d * 0.12), 0.014), K(r.metal, P(-0.54, 0.6, d * 0.145), P(-0.72, 0.7, d * 0.115), 0.013);
  K(r.metal, P(-0.72, 0.7, -0.115), P(-0.72, 0.7, 0.115), 0.013);
  {
    const d = j({ color: R.wallGray }), u = j({ color: 16777215, map: Go(), cache: false }), f = new t.Mesh(new t.BoxGeometry(0.02, 0.13, 0.24), [d, u, d, d, d, d]);
    f.position.set(-0.77, 0.42, 0), f.castShadow = true, a.add(f);
  }
  s("metal", new t.CylinderGeometry(0.018, 0.018, 0.56, 6), B(i.BAR.x, i.BAR.y, 0, Math.PI / 2)), K(r.metal, i.HT, i.BAR, 0.022);
  for (const d of [-1, 1]) s("dark", new t.CylinderGeometry(0.024, 0.024, 0.11, 6), B(i.BAR.x, i.BAR.y, d * 0.22, Math.PI / 2)), K(r.metal, P(0.36, 1.02, d * 0.18), P(0.32, 1.24, d * 0.24), 0.012), s("dark", new t.BoxGeometry(0.03, 0.11, 0.14), B(0.31, 1.26, d * 0.25)), a.add(eo(8e-3, 0.09, 0.12, j({ color: R.mirrorFace }), 0.294, 1.26, d * 0.25)), s("amber", new t.BoxGeometry(0.06, 0.05, 0.05), B(
  0.45, 0.86, d * 0.19));
  if (s("metal", new t.CylinderGeometry(0.095, 0.095, 0.06, 14), B(0.48, 0.9, 0, 0, 0, Math.PI / 2)), a.add(Eo(0.082, 0.082, 0.02, 14, j({ color: 16774360 }), 0.514, 0.9, 0).rotateZ(Math.PI / 2)), o.cockpit) {
    const u = P(0.392, 1.06, 0), f = new t.Quaternion().setFromAxisAngle(P(0, 0, 1), 0.52), h = P(0, 1, 0).applyQuaternion(f), p = (w) => f.clone().multiply(new t.Quaternion().setFromAxisAngle(P(0, 1, 0), -w)), y = (w, T, z, b, m) => {
      const k = p(z), x = u.clone().addScaledVector(h, m).add(P(b, 0, 0).applyQuaternion(k));
      s(T, w, new t.Matrix4().compose(x, k, P(1, 1, 1)));
    };
    s("dark", new t.CylinderGeometry(0.062, 0.062, 0.05, 14), B(u.x, u.y, u.z, 0, 0, 0.52)), y(new t.CylinderGeometry(0.05, 0.05, 8e-3, 14), "dial", 0, 0, 0.026), y(new t.BoxGeometry(0.042, 4e-3, 5e-3), "dark", -2.36, 0.021, 0.032), y(new t.CylinderGeometry(7e-3, 7e-3, 6e-3, 8), "dark", 0, 0, 0.032), y(new t.CylinderGeometry(9e-3, 9e-3, 5e-3, 8), "amber", 1.9, 0.033, 0.031);
    for (const w of [-1, 1]) K(r.metal, P(0.4, 1, w * 0.163), P(0.468, 0.988, w * 0.248), 9e-3);
    s("metal", new t.CylinderGeometry(0.026, 0.026, 0.05, 10), B(0.315, 0.88, -0.05, 0, 0, Math.PI / 2));
    {
      const w = P(-1, 0, 0).applyEuler(new t.Euler(0, 0, 0.22)), T = P(0.38, 0.68, 0).addScaledVector(w, 0.081), z = T.clone().addScaledVector(w, 0.05);
      K(r.metal, T, z, 9e-3), K(r.metal, z, z.clone().add(P(0, 0.035, 0)), 9e-3);
    }
  }
  return In(a, r, { dark: e.dark, metal: e.metal, body: c, amber: v({ color: R.orange, bands: 2, tint: 9396304 }), dial: j({ color: 15328986 }) }, { outline: "body", thickness: 34e-4 }), a.rotation.x = o.lean ?? -0.09, n.position.set(o.x, o.y ?? 0, o.z), n.rotation.y = o.ry ?? 0, n.userData.inner = a, n;
}
function wt(o = {}) {
  const e = new t.Group(), n = new t.Group();
  e.add(n), e.userData.inner = n;
  const a = v({ color: o.color ?? 15251488, bands: 3, tint: 9071146 }), l = v({ color: 2302758, bands: 2, tint: 3816010 }), i = v({ color: 3026483, bands: 2, tint: 3816010 }), r = v({ color: 10133672, bands: 3, tint: 6051456 }), s = j({ color: 10338516, transparent: true, opacity: 0.55 }), c = { yellow: [], black: [], dark: [], metal: [] }, d = (p, y, w) => c[p].push({ geometry: y, matrix: w }), u = 0.25;
  d("dark", new t.CylinderGeometry(u, u, 0.1, 14), B(0.72, u, 0, Math.PI / 2)), d("metal", new t.CylinderGeometry(0.14, 0.14, 0.11, 12), B(0.72, u, 0, Math.PI / 2));
  for (const p of [-1, 1]) d("dark", new t.CylinderGeometry(u, u, 0.1, 14), B(-0.62, u, p * 0.58, Math.PI / 2)), d("metal", new t.CylinderGeometry(0.14, 0.14, 0.11, 12), B(-0.62, u, p * 0.58, Math.PI / 2));
  d("black", new t.BoxGeometry(1.9, 0.08, 1.28), B(-0.15, 0.34, 0)), d("black", new t.BoxGeometry(1.5, 0.42, 0.05), B(-0.45, 0.6, 0.62)), d("black", new t.BoxGeometry(1.5, 0.42, 0.05), B(-0.45, 0.6, -0.62)), d("black", new t.BoxGeometry(0.06, 0.42, 1.28), B(-1.08, 0.6, 0)), d("dark", new t.BoxGeometry(0.42, 0.14, 1.1), B(-0.82, 0.62, 0)), d("dark", new t.BoxGeometry(0.1, 0.5, 1.1), B(-1, 0.86, 0)),
  d("dark", new t.BoxGeometry(0.34, 0.1, 0.42), B(-0.46, 0.66, 0)), d("yellow", new t.BoxGeometry(0.5, 0.5, 0.72), B(0.32, 0.62, 0)), d("yellow", new t.BoxGeometry(0.28, 0.34, 0.5), B(0.66, 0.52, 0)), d("dark", new t.CylinderGeometry(0.09, 0.09, 0.1, 10), B(0.82, 0.62, 0, 0, 0, Math.PI / 2)), d("yellow", new t.TorusGeometry(u + 0.05, 0.05, 4, 12, Math.PI), B(0.72, u + 0.02, 0, 0, 0, 0, 1, 1, 2.2)),
  d("metal", new t.CylinderGeometry(0.025, 0.025, 0.4, 6), B(0.18, 0.82, 0, 0, 0, -0.5)), d("dark", new t.CylinderGeometry(0.028, 0.028, 0.5, 6), B(0.1, 0.98, 0, Math.PI / 2)), d("yellow", new t.BoxGeometry(0.05, 0.72, 0.05), B(-1.06, 1.15, 0.58)), d("yellow", new t.BoxGeometry(0.05, 0.72, 0.05), B(-1.06, 1.15, -0.58)), d("yellow", new t.BoxGeometry(0.05, 0.62, 0.05), B(0.28, 1.1, 0.5, 0, 0, -0.18)),
  d("yellow", new t.BoxGeometry(0.05, 0.62, 0.05), B(0.28, 1.1, -0.5, 0, 0, -0.18)), d("yellow", new t.CylinderGeometry(0.66, 0.66, 1.5, 12, 1, false, 0, Math.PI), B(-0.4, 1.02, 0, Math.PI / 2, 0, Math.PI / 2, 1, 0.45, 1));
  const f = new t.Mesh(new t.PlaneGeometry(0.62, 0.5), s);
  f.position.set(0.33, 1.28, 0), f.rotation.y = Math.PI / 2, f.rotation.x = 0, f.rotation.z = -0.22, f.userData.noShadow = true, n.add(f);
  const h = { yellow: a, black: l, dark: i, metal: r };
  for (const p of Object.keys(c)) {
    if (!c[p].length) continue;
    const y = new t.Mesh(Ze(c[p]), h[p]);
    n.add(y);
  }
  return n.rotation.x = o.lean ?? 0, re(e), e.userData.noOutline = false, e;
}
const Dt = new t.Vector3(), Lt = new t.Vector3(), _t = new t.Vector3(), Vt = new t.Matrix4(), Ft = new t.Quaternion(), Nt = new t.Quaternion(), Ot = new t.Euler();
function xt(o, e, n, a, l) {
  Ge(e, n, Dt, Lt, _t), Vt.makeBasis(Lt, Dt, _t), Ft.setFromRotationMatrix(Vt), Ot.set(0, l + Math.PI / 2, 0, "YXZ"), Nt.setFromEuler(Ot), o.quaternion.copy(Ft).multiply(Nt), ke(e, a, n, o.position);
}
function Dn(o) {
  const e = [], n = [{ kind: "auto", lane: -1.55, dir: 1, speed: 4.2, z0: -30, color: 15251488 }, { kind: "auto", lane: 1.55, dir: -1, speed: 3.8, z0: 24, color: 14198808 }, { kind: "scooter", lane: 1.45, dir: -1, speed: 5.2, z0: -55, color: 11881018 }];
  for (const s of n) {
    const c = s.kind === "auto" ? wt({ color: s.color }) : It({ color: s.color });
    c.userData.planetRigid = true, o.add(c);
    const d = { x0: 0, x1: 0, z0: 0, z1: 0, top: 1.6 };
    o.colliders.push(d), e.push({ obj: c, ...s, z: s.z0, collider: d });
  }
  const a = [{ kind: "auto", x: 1, z: 38.5, ry: 0.35, color: 15251488 }, { kind: "auto", x: 1, z: 41.2, ry: -0.2, color: 13146144 }, { kind: "scooter", x: -1, z: -8.5, ry: 0.3 }, { kind: "scooter", x: -1, z: -10.2, ry: -0.4 }, { kind: "scooter", x: 1, z: 14.8, ry: 0.2 }, { kind: "scooter", x: -1, z: 33.5, ry: -0.25 }, { kind: "scooter", x: -1, z: 24.2, ry: 0.15 }];
  for (const s of a) {
    const c = N(s.z) + s.x * (F + 0.75), d = s.kind === "auto" ? wt({ color: s.color, lean: -0.03 }) : It({ color: s.color ?? 13227228 });
    d.position.set(c, o.groundAt(c, s.z), s.z), d.rotation.y = s.ry + (s.x > 0 ? -Math.PI / 2 : Math.PI / 2), o.add(d);
    const u = s.kind === "auto" ? 1.1 : 0.9, f = s.kind === "auto" ? 0.75 : 0.4;
    o.collide(c - f, s.z - u, c + f, s.z + u, 1.3);
  }
  let l = () => false;
  const i = 3.4;
  function r(s) {
    for (const c of e) {
      let d = c.speed;
      if (l()) {
        const h = c.z + c.dir * d * s;
        (c.dir > 0 ? c.z < -i && h >= -i : c.z > i && h <= i) && (d = 0), c.dir > 0 && c.z < -i - 0.01 && h > -i && (d = 0), c.dir < 0 && c.z > i + 0.01 && h < i && (d = 0);
      }
      c.z += c.dir * d * s, c.z > we - 2 && (c.z = me + 2), c.z < me + 2 && (c.z = we - 2);
      const u = N(c.z) + c.lane, f = c.dir > 0 ? Math.PI : 0;
      xt(c.obj, u, c.z, 0.02, f), c.collider.x0 = u - 0.8, c.collider.x1 = u + 0.8, c.collider.z0 = c.z - 1.3, c.collider.z1 = c.z + 1.3;
    }
  }
  return { update: r, setGatesDown(s) {
    l = s;
  } };
}
const Ln = [13146474, 11896150, 11040328, 9857084], _n = [13126460, 3112299, 14735560, 4026052, 14198844, 9400245, 15236e3, 15790312], Vn = [3817290, 4866616, 5921382, 3026483, 7035464];
function Wt(o) {
  const e = new t.Group(), n = v({ color: o.pick(Ln), bands: 3, tint: 9072478 }), a = v({ color: o.pick(_n), bands: 3, tint: 7036528 }), l = v({ color: o.pick(Vn), bands: 2, tint: 3816010 }), i = v({ color: 2367518, bands: 2, tint: 3816010 }), r = o.range(0.92, 1.06), s = new t.Mesh(new t.BoxGeometry(0.34, 0.55, 0.2), a);
  s.position.y = 1.06 * r, e.add(s);
  const c = new t.Mesh(new t.SphereGeometry(0.115, 10, 8), n);
  c.position.y = 1.5 * r, e.add(c);
  const d = new t.Mesh(new t.SphereGeometry(0.118, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), i);
  d.position.y = 1.51 * r, e.add(d);
  const u = new t.Mesh(new t.BoxGeometry(0.11, 0.78, 0.13), l), f = u.clone();
  u.geometry = u.geometry.clone(), u.geometry.translate(0, -0.39, 0), f.geometry = u.geometry, u.position.set(0, 0.78 * r, 0.08), f.position.set(0, 0.78 * r, -0.08), e.add(u, f);
  const h = new t.Mesh(new t.BoxGeometry(0.08, 0.5, 0.09), a);
  h.geometry = h.geometry.clone(), h.geometry.translate(0, -0.25, 0);
  const p = h.clone();
  return h.position.set(0, 1.3 * r, 0.23), p.position.set(0, 1.3 * r, -0.23), e.add(h, p), re(e), e.userData.legs = [u, f], e.userData.arms = [h, p], e.userData.scale = r, e;
}
function Fn(o) {
  const e = Se(4517), n = [], a = 7;
  for (let r = 0; r < a; r++) {
    const s = r % 2 === 0 ? -1 : 1, c = Wt(e);
    c.userData.planetRigid = true, o.add(c), n.push({ obj: c, side: s, z: e.range(me + 8, we - 8), dir: e.sign(), speed: e.range(0.9, 1.6), phase: e.range(0, 10), t: 0 });
  }
  const l = [{ x: 4.6, z: -14.4, ry: -0.5 }, { x: 4.5, z: 38.2, ry: 2.4 }].map((r) => {
    const s = Wt(e);
    return s.userData.planetRigid = true, o.add(s), { obj: s, ...r, phase: e.range(0, 10), t: 0 };
  });
  function i(r) {
    for (const s of n) {
      s.t += r, s.z += s.dir * s.speed * r;
      const c = 72;
      s.z > c && (s.z = c, s.dir = -1), s.z < -c && (s.z = -c, s.dir = 1);
      const d = N(s.z) + s.side * (F + O * 0.55), u = s.dir > 0 ? Math.PI : 0;
      xt(s.obj, d, s.z, le, u);
      const f = Math.sin(s.t * 6.4 * s.speed) * 0.5, [h, p] = s.obj.userData.legs, [y, w] = s.obj.userData.arms;
      h.rotation.z = f, p.rotation.z = -f, y.rotation.z = -f * 0.7, w.rotation.z = f * 0.7;
    }
    for (const s of l) {
      s.t += r;
      const c = N(s.z) + s.x;
      xt(s.obj, c, s.z, le, s.ry), s.obj.position.y += 0;
      const [d] = s.obj.userData.arms;
      d.rotation.z = Math.sin(s.t * 1.2) * 0.06;
    }
  }
  return { update: i };
}
const Nn = [{ id: "gate", label: "Shankar Mutt  \xB7  look closer", pos: (o) => ({ x: o - (F + O + 0.4), z: 27, y: 1.6 }), card: { title: "Sri Shankar Mutt, Nallakunta", body: "The Nallakunta branch of the Sringeri Sharada Peetham. Saffron arch with the blue Telugu board, pale wall with the orange band, posters by the gate - every kid on this road gave directions by it. The real gate stands at 17.\
4006 N, 78.5072 E, on the west side of the main road." } }, { id: "tree", label: "The temple tree  \xB7  look closer", pos: (o) => ({ x: o - (F + O + 1.15), z: 22.5, y: 2.2 }), card: { title: "The tree outside the wall", body: 'Every old Hyderabad street has one tree older than the buildings. Distances here were never in metres - they were "past the tree, before the gate." The bougainvillea on the\
 coping drops petals on the footway all year.' } }, { id: "pharmacy", label: "Saince Pharmacy  \xB7  look closer", pos: (o) => ({ x: o + (F + O + 0.4), z: 8.5, y: 1.6 }), card: { title: "Saince Pharmacy", body: "The pharmacy opposite the mutt. Strips of tablets cut to count, ORS through the summer, a torch behind the counter for when the power went. Every household on the street has run a small ta\
b of mercies here." } }, { id: "tiffins", label: "Tiffin centre  \xB7  look closer", pos: (o) => ({ x: o - (F + O + 0.4), z: 44.5, y: 1.6 }), card: { title: "Siddhartha Tiffin Centre", body: "Idli at seven in the morning, punugulu at four in the evening. The steel plates never stopped moving and neither did the queue. Half the neighbourhood's mornings started standing here." } }, { id: "bakery", label: "\
Tasty Bakery  \xB7  look closer", pos: (o) => ({ x: o + (F + O + 0.4), z: -50, y: 1.6 }), card: { title: "Tasty Bakery", body: "The bakery everyone walking back from tuition smelled before they saw. Dilpasand and veg puffs in the glass case, birthday cakes ordered a day in advance, the good cream if you knew to ask. The most-named shop in the reel comments." } }, { id: "ramaiah", label: "Ramaiah S\
tudy Circle  \xB7  look closer", pos: (o) => ({ x: o + (F + O + 0.4), z: 54, y: 1.6 }), card: { title: "Ramaiah IIT Study Circle", body: "A short walk north of the mutt: the original IIT factory, as the reel calls it. Generations of rank dreams queued at this gate at six in the morning, question papers still warm from the cyclostyle." } }, { id: "bakersq", label: "Bakers 'Q  \xB7  look closer", pos: () => ({
x: 22.2 + 4.65, z: 14.6, y: 1.6 }), card: { title: "Bakers 'Q", body: "The Shivam Road bakery with the chef-hat board. Birthday cakes for half the colony, puffs after tuition, and the glass counter you pressed your nose against while amma paid." } }, { id: "papaji", label: "Papaji da Dhaba  \xB7  look closer", pos: () => ({ x: 15.2 + 4.65, z: 14.6, y: 1.6 }), card: { title: "Papaji da Dhaba", body: "\
Punjabi dhaba smells on a Telugu street: tandoor smoke, dal fry, and steel plates. Where treat money went when the exam results were good." } }, { id: "tea", label: "Tea point  \xB7  look closer", pos: (o) => ({ x: o + (F + O + 0.4), z: 38.5, y: 1.6 }), card: { title: "The tea point", body: 'Irani chai by the glass, Osmania biscuits on a steel plate. The conversations were the point; the tea was t\
he excuse. Someone has been "just leaving" here for forty minutes.' } }, { id: "busstop", label: "Bus stop  \xB7  look closer", pos: (o) => ({ x: o + (F + O - 1), z: -14, y: 1.6 }), card: { title: "The bus stop", body: "107, 113, 116J. Buses came when they came, and you learned to read the road for them two turns away. Whole friendships were made waiting here." } }, { id: "crossing", label: "MMTS \
line  \xB7  look closer", pos: (o) => ({ x: o + 4.4, z: 3.6, y: 1.4 }), card: { title: "The railway line", body: "The MMTS line past Vidyanagar, the neighbourhood's other clock. If you grew up here you can still hear the horn before the gates come down - and you still know exactly how long you have." } }];
function On(o) {
  for (const e of Nn) {
    const n = N(e.pos(0).z), a = e.pos(n), l = new t.Mesh(new t.BoxGeometry(1.8, 2.4, 2.6), j({ color: 16711680, cache: false }));
    l.position.set(a.x, a.y, a.z), l.visible = false, o.add(l), o.interact({ hitbox: l, label: e.label, action: () => {
      window.dispatchEvent(new CustomEvent("nf-memory", { detail: e.card }));
    } });
  }
}
function Wn(o) {
  un(o), bn(o), Bn(o), Cn(o), pn(o), xn(o), mn(o), Sn(o), zn(o), Tn(o), An(o), On(o);
  const e = Dn(o), n = Fn(o);
  return o.update((a) => {
    e.update(a), n.update(a);
  }), { traffic: e, people: n };
}
function Hn(o) {
  const e = new t.Group();
  e.name = "world", o.add(e);
  const n = [], a = [], l = [], i = [], r = [], s = { scene: o, root: e, colliders: n, interactables: a, add: (h) => (e.add(h), h), collide: (h, p, y, w, T, z) => {
    n.push({ x0: Math.min(h, y), x1: Math.max(h, y), z0: Math.min(p, w), z1: Math.max(p, w), top: T, bottom: z });
  }, platform: (h) => i.push(h), cut: (h) => r.push(h), groundAt: (h, p) => {
    let y = Rt(h, p);
    for (const w of r) h > w.x0 && h < w.x1 && p > w.z0 && p < w.z1 && (y = Math.min(y, w.top));
    for (const w of i) h > w.x0 && h < w.x1 && p > w.z0 && p < w.z1 && (y = Math.max(y, w.top));
    return y;
  }, interact: (h) => a.push(h), update: (h) => l.push(h) }, c = Ko(o);
  Wn(s);
  const d = nn(s), u = Ho(e, { maxEdge: 4 });
  return { root: e, colliders: n, platforms: i, cuts: r, interactables: a, planet: c, petals: d, bakeStats: u, bounds: { z0: -be * 0.24, z1: be * 0.24 }, heightAt(h, p, y) {
    let w = Rt(h, p);
    for (const z of r) h > z.x0 && h < z.x1 && p > z.z0 && p < z.z1 && (w = Math.min(w, z.top));
    const T = y === void 0 ? 1 / 0 : y + 0.55;
    for (const z of i) z.top > T || h > z.x0 && h < z.x1 && p > z.z0 && p < z.z1 && (w = Math.max(w, z.top));
    return w;
  }, update(h) {
    for (const p of l) p(h);
    d.update(h, 0, 1);
  } };
}
const Ht = 0.88, qt = 0.34, Ut = 1.17, Kt = -0.09, qn = 2.4, Un = 0.34, Kn = 0.38;
function $n({ scene: o, world: e, player: n, hud: a }) {
  const l = wt({ color: 15251488, lean: Kt }), i = l.userData.inner;
  l.visible = false, o.add(l);
  const r = new t.Mesh(new t.BoxGeometry(1.9, 1.35, 0.95), j({ color: 16711680, cache: false }));
  r.position.set(-0.05, 0.68, 0), r.visible = false, l.add(r);
  const s = { hitbox: r, label: "auto  \xB7  ride it", action: () => g() }, c = { out: false, riding: false, x: 0, z: 0, heading: 0 };
  let d = null;
  const u = new t.Vector3(), f = new t.Vector3(), h = new t.Vector3(), p = new t.Matrix4(), y = new t.Quaternion(), w = new t.Quaternion(), T = new t.Euler();
  function z(C, _, W, I, D) {
    Ge(C, _, u, f, h), p.makeBasis(f, u, h), y.setFromRotationMatrix(p), T.set(0, I + Math.PI / 2, D, "YXZ"), w.setFromEuler(T), l.quaternion.copy(y).multiply(w), ke(C, W, _, l.position), l.updateMatrixWorld(true);
  }
  function b(C, _, W, I) {
    const D = -Math.sin(W), X = -Math.cos(W), ae = Ut / 2, ot = e.heightAt(pe(C + D * ae), _ + X * ae, I), Ce = e.heightAt(pe(C - D * ae), _ - X * ae, I);
    return t.MathUtils.clamp(Math.atan2(ot - Ce, Ut), -0.45, 0.45);
  }
  function m(C) {
    if (d) {
      const ae = e.colliders.indexOf(d);
      ae >= 0 && e.colliders.splice(ae, 1), d = null;
    }
    if (!C) return;
    const _ = Math.abs(Math.sin(c.heading)), W = Math.abs(Math.cos(c.heading)), I = Ht * _ + qt * W, D = Ht * W + qt * _, X = e.heightAt(c.x, c.z, n.pos.y);
    d = { x0: c.x - I, x1: c.x + I, z0: c.z - D, z1: c.z + D, top: X + 1.02 }, e.colliders.push(d);
  }
  function k(C, _, W, I) {
    for (const D of e.colliders) if (D !== d && !(D.top !== void 0 && D.top <= I + Kn) && !(D.bottom !== void 0 && D.bottom > I + 1.9) && C > D.x0 - W && C < D.x1 + W && _ > D.z0 - W && _ < D.z1 + W) return false;
    return true;
  }
  function x(C) {
    const _ = e.interactables.indexOf(s);
    C && _ < 0 && e.interactables.push(s), !C && _ >= 0 && e.interactables.splice(_, 1);
  }
  function S() {
    const C = e.heightAt(c.x, c.z, n.pos.y);
    i.rotation.x = Kt, z(c.x, c.z, C, c.heading, b(c.x, c.z, c.heading, C)), l.visible = true, c.out = true, m(true), x(true);
  }
  function G() {
    const C = n.pos.y;
    let _ = null;
    for (const W of [2, 1.65, 2.6, 1.3]) {
      for (const I of [0, 0.45, -0.45, 0.95, -0.95, 1.6, -1.6]) {
        const D = pe(n.pos.x - Math.sin(n.yaw + I) * W), X = n.pos.z - Math.cos(n.yaw + I) * W;
        if (k(D, X, 0.8, C) && !(Math.abs(e.heightAt(D, X, C) - C) > 0.5)) {
          _ = { x: D, z: X };
          break;
        }
      }
      if (_) break;
    }
    _ || (_ = { x: pe(n.pos.x - Math.sin(n.yaw) * 1.5), z: n.pos.z - Math.cos(n.yaw) * 1.5 }), c.x = _.x, c.z = _.z, c.heading = n.yaw - 0.35, S(), a?.flash("auto  \xB7  E to ride", 1700);
  }
  function M() {
    c.riding || (l.visible = false, c.out = false, m(false), x(false), a?.flash("auto  \xB7  put away", 1200));
  }
  function g() {
    !c.out || c.riding || (n.yaw = c.heading, n.pos.x = pe(c.x + Math.sin(c.heading) * xe.seatFwd), n.pos.z = c.z + Math.cos(c.heading) * xe.seatFwd, m(false), x(false), c.riding = true, n.mount(s), a?.flash("auto  \xB7  W to go, E to get off", 2e3));
  }
  function A() {
    if (!c.riding) return;
    c.riding = false, n.unmount();
    const C = Math.cos(c.heading), _ = -Math.sin(c.heading), W = -Math.sin(c.heading), I = -Math.cos(c.heading), D = n.pos.y, X = [[-C * 1.35, -_ * 1.35], [C * 1.35, _ * 1.35], [-W * 1.9, -I * 1.9]];
    for (const [ae, ot] of X) {
      const Ce = pe(n.pos.x + ae), nt = n.pos.z + ot;
      if (k(Ce, nt, Un, D) && !(Math.abs(e.heightAt(Ce, nt, D) - D) > 0.6)) {
        n.pos.x = Ce, n.pos.z = nt;
        break;
      }
    }
    S(), a?.flash("auto  \xB7  parked", 1200);
  }
  function V() {
    if (c.riding) {
      A();
      return;
    }
    if (!c.out) {
      G();
      return;
    }
    Math.hypot(No(c.x, n.pos.x), c.z - n.pos.z) > 4 ? G() : M();
  }
  function U() {
    if (!c.riding) return;
    const C = n.yaw, _ = -Math.sin(C), W = -Math.cos(C), I = pe(n.pos.x + _ * xe.seatFwd), D = n.pos.z + W * xe.seatFwd;
    z(I, D, n.pos.y, C, b(I, D, C, n.pos.y)), i.rotation.x = -n.roll * qn, c.x = I, c.z = D, c.heading = C;
  }
  return { group: l, toggle: V, summon: G, recall: M, mount: g, dismount: A, update: U, get riding() {
    return c.riding;
  }, get summoned() {
    return c.out;
  } };
}
const Mt = document.getElementById("view"), ge = new t.WebGLRenderer({ canvas: Mt, antialias: false, powerPreference: "high-performance", stencil: false });
ge.setPixelRatio(1);
ge.outputColorSpace = t.SRGBColorSpace;
ge.toneMapping = t.NoToneMapping;
ge.shadowMap.enabled = true;
ge.shadowMap.type = t.PCFShadowMap;
ge.setClearColor(new t.Color(R.fog), 1);
const oe = new t.Scene();
oe.fog = new t.Fog(R.fog, 44, 205);
const ne = new t.PerspectiveCamera(46, 1, 0.25, 600);
ne.rotation.order = "YXZ";
const Q = new t.DirectionalLight(R.sun, 2.25);
Q.position.set(-52, 62, 56);
Q.castShadow = true;
Q.shadow.mapSize.set(2048, 2048);
Q.shadow.camera.left = -34;
Q.shadow.camera.right = 34;
Q.shadow.camera.top = 34;
Q.shadow.camera.bottom = -34;
Q.shadow.camera.near = 1;
Q.shadow.camera.far = 200;
Q.shadow.bias = -4e-4;
Q.shadow.normalBias = 0.035;
oe.add(Q);
oe.add(Q.target);
const Ae = new t.DirectionalLight(R.fill, 1.08);
Ae.position.set(48, 26, -44);
oe.add(Ae);
oe.add(Ae.target);
const Me = new t.DirectionalLight(14207976, 0.34);
Me.position.set(10, -18, 40);
oe.add(Me);
oe.add(Me.target);
const Ye = new t.HemisphereLight(R.hemiSky, R.hemiGround, 1.12);
oe.add(Ye);
const $t = Io(oe, 500), Le = Hn(oe), q = new Jo(ne, Mt, Le), lo = "nallakunta-forever-volume";
let tt = 0.34;
try {
  const o = localStorage.getItem(lo);
  if (o !== null) {
    const e = Number(o);
    Number.isFinite(e) && (tt = Math.max(0, Math.min(1, e)));
  }
} catch {
}
const H = en({ volume: tt }), ue = tn({ volume: tt, fadeIn: 3 }), Be = on({ volume: tt * 0.9 });
H.setMuted(Be.muted);
const kt = () => {
  try {
    localStorage.setItem(lo, String(ue.volume));
  } catch {
  }
};
H.onVolumeChange = (o) => {
  ue.setVolume(o), H.setMuted(Be.setVolume(o * 0.9)), kt();
};
const uo = window.matchMedia?.("(pointer: coarse)").matches ?? false;
H.onStart = () => {
  ue.start(), Be.start(), uo ? (q.touchActive = true, H.setLocked(true)) : q.lock();
};
q.onLockChange = (o) => H.setLocked(o);
Mt.addEventListener("click", () => {
  ue.start(), Be.start(), !uo && !q.locked && q.lock();
});
window.addEventListener("nf-memory", (o) => H.showCard(o.detail));
H.bindTouch({ player: q, onEnter: () => {
  q.touchActive || H.onStart?.();
}, onPlanet: () => {
  yt(!ye), H.flash(ye ? "orbit view  \xB7  \u25CE to return" : "back on the ground");
}, onMusic: () => {
  ue.toggle();
  const o = Be.toggle();
  H.setMuted(o), H.setVolume(Be.volume), kt(), H.flash(o ? "\u266A  ambience off" : "\u266A  morning ambience on");
} });
const _e = $n({ scene: oe, world: Le, player: q, hud: H });
q.onInteract = (o) => {
  if (_e.riding) {
    _e.dismount();
    return;
  }
  o && o.action?.();
};
const de = new go(ge, oe, ne);
function fo() {
  const o = window.innerWidth, e = window.innerHeight;
  ne.aspect = o / e, ne.updateProjectionMatrix(), de.setSize(o, e), ao(de.size.x, de.size.y);
}
window.addEventListener("resize", fo);
fo();
const jn = new t.Clock(), Ue = new t.Vector3(), jt = new t.Vector3(), Yn = new t.Vector3(-52, 62, 56), Yt = new t.Vector3(48, 26, -44), Qn = new t.Vector3(10, -18, 40);
function Ke(o, e, n, a) {
  jt.set(0, 0, 0).addScaledVector(n.east, e.x).addScaledVector(n.up, e.y).addScaledVector(n.north, e.z), o.target.position.copy(a), o.position.copy(a).add(jt);
}
let ye = false, mt = 0.6;
const Qt = new t.Vector3(), Xn = oe.fog, Zn = ne.far;
function yt(o) {
  ye = o, oe.fog = o ? null : Xn, ne.far = o ? 1600 : Zn, ne.updateProjectionMatrix();
  const e = Q.shadow.camera, n = o ? Y * 1.15 : 34;
  e.left = -n, e.right = n, e.top = n, e.bottom = -n, e.far = o ? Y * 6 : 200, e.updateProjectionMatrix(), H.setPlanetView(o);
}
window.addEventListener("keydown", (o) => {
  if (!o.repeat) {
    if (o.code === "KeyM") {
      const e = ue.toggle();
      H.setMuted(e), H.setVolume(ue.volume), kt(), ue.available && H.flash(e ? "\u266A  music off" : "\u266A  music on");
    }
    o.code === "KeyV" && (ye ? (yt(false), H.flash("back on the ground")) : _e.toggle()), o.code === "KeyP" && (yt(!ye), H.flash(ye ? "orbit view  \xB7  P to return" : "back on the ground")), o.code === "KeyO" && (de.enabled.ink = !de.enabled.ink), o.code === "KeyG" && (de.enabled.grade = !de.enabled.grade);
  }
});
function ho() {
  const o = Math.min(jn.getDelta(), 0.05);
  if (q.update(o), _e.update(o), Le.update(o), ye) mt += o * 0.09, Qt.set(Math.sin(mt) * 0.8, 1, Math.cos(mt) * 0.8).normalize(), ne.position.copy(ie).addScaledVector(Qt, Y * 3.3), ne.up.set(0, 1, 0), ne.lookAt(ie), Q.target.position.copy(ie), Q.position.copy(ie).add(new t.Vector3(-1.05, 0.95, 0.75).multiplyScalar(Y * 2.2)), Ye.position.set(0, 1, 0), Ke(Ae, Yt, { east: new t.Vector3(1, 0, 0), up: new t.
  Vector3(0, 1, 0), north: new t.Vector3(0, 0, 1) }, ie), Me.visible = false;
  else {
    Me.visible = true;
    const n = Ge(q.pos.x, q.pos.z);
    ke(q.pos.x, 0, q.pos.z, Ue), Ke(Q, Yn, n, Ue), Ke(Ae, Yt, n, Ue), Ke(Me, Qn, n, Ue), Ye.position.copy(n.up);
  }
  $t.dome.position.copy(ne.position), $t.clouds.position.copy(ne.position);
  const e = !ye && q.locked ? q.pick(Le.interactables) : null;
  H.setPrompt(e ? `E  \xB7  ${e.label.replace(/^.*?Â·\s*/, "")}` : ""), H.update(o, q.locked), H.setCoords(q.pos, q.yaw, q.pitch, o), de.render(), requestAnimationFrame(ho);
}
ho();
window.__scene = { scene: oe, camera: ne, renderer: ge, pipeline: de, world: Le, player: q, ebike: _e, music: ue, hud: H, sun: Q, fill: Ae, bounce: Me, hemi: Ye, THREE: t };
window.__setOutlineRes = ao;
