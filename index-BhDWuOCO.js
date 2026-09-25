import * as s from "three";
import { FullScreenQuad as kn } from "three/addons/postprocessing/Pass.js";
import { mergeGeometries as Sn, mergeVertices as Gn } from "three/addons/utils/BufferGeometryUtils.js";
(function() {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const r of document.querySelectorAll('link[rel="modulepreload"]')) n(r);
  new MutationObserver((r) => {
    for (const a of r) if (a.type === "childList") for (const c of a.addedNodes) c.tagName === "LINK" && c.rel === "modulepreload" && n(c);
  }).observe(document, { childList: true, subtree: true });
  function o(r) {
    const a = {};
    return r.integrity && (a.integrity = r.integrity), r.referrerPolicy && (a.referrerPolicy = r.referrerPolicy), r.crossOrigin === "use-credentials" ? a.credentials = "include" : r.crossOrigin === "anonymous" ? a.credentials = "omit" : a.credentials = "same-origin", a;
  }
  function n(r) {
    if (r.ep) return;
    r.ep = true;
    const a = o(r);
    fetch(r.href, a);
  }
})();
const b = { skyTop: 9420266, skyMid: 13953274, skyHaze: 16640466, cloud: 16644856, cloudShade: 15392728, fog: 15722196, sun: 16773592, fill: 11124213, hemiSky: 14478591, hemiGround: 12558206, ink: 3748431, road: 9275520, lineYellow: 15778625, tactile: 15910205, sidewalk: 14472644, sidewalkAlt: 15064521, curb: 13222576, concrete: 14275526, concreteMid: 12893611, ballast: 8222342, wallWhite: 16447215,
wallCream: 15919059, wallGray: 14606054, roofTeal: 5204848, red: 14697791, redDeep: 11874863, yellow: 16039987, black: 3288635, teal: 3120282, blueDeep: 2772887, orange: 15698492, leaf: 5940600, leafDeep: 4161376, blossomLight: 16503526, petal: 15771852, petalDeep: 14052260, railMetal: 7038066, railHead: 12762308, sleeper: 7169398, gateYellow: 16039987, gateBlack: 3288635, signalRed: 15877436, signalOff: 6961988,
cabinet: 14210522, cabinetTop: 11973308, trainBody: 16249574, trainBodyShade: 15130576, trainStripe: 3112912, trainStripe2: 4173466, trainWindow: 3818072, trainWindowLit: 7042964, trainSkirt: 10133677, trainRoof: 12433597, trainDoor: 15394008, metal: 12106950, metalDark: 8883094, mirrorFace: 13162724, rope: 15787466, bamboo: 9744491 }, eo = { uniforms: { tDiffuse: { value: null }, tDepth: { value: null },
uTexel: { value: new s.Vector2() }, uNear: { value: 0.25 }, uFar: { value: 600 }, uInk: { value: new s.Color(b.ink) }, uThickness: { value: 1.35 }, uSens: { value: 42e-4 }, uConcave: { value: 0.026 }, uConcaveAmount: { value: 0.42 }, uFadeStart: { value: 40 }, uFadeEnd: { value: 98 }, uStrength: { value: 1 }, uSkyDepth: { value: 420 } }, vertexShader: `
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
  ` }, An = { uniforms: { tDiffuse: { value: null }, uShadowTint: { value: new s.Color(11380944) }, uLightTint: { value: new s.Color(16775144) }, uSaturation: { value: 1.12 }, uLift: { value: 0.032 }, uVignette: { value: 0.15 }, uWarmth: { value: 0.05 } }, vertexShader: eo.vertexShader, fragmentShader: `
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
  ` }, Tn = { uniforms: { tDiffuse: { value: null }, uTexel: { value: new s.Vector2() } }, vertexShader: eo.vertexShader, fragmentShader: `
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
function Le(e) {
  const t = new s.ShaderMaterial({ uniforms: s.UniformsUtils.clone(e.uniforms), vertexShader: e.vertexShader, fragmentShader: e.fragmentShader, depthTest: false, depthWrite: false });
  return { quad: new kn(t), mat: t };
}
class Cn {
  constructor(t, o, n, { pixelBudget: r = 46e5 } = {}) {
    this.renderer = t, this.scene = o, this.camera = n, this.pixelBudget = r, this.size = new s.Vector2(1, 1);
    const a = { type: s.HalfFloatType, minFilter: s.LinearFilter, magFilter: s.LinearFilter, depthBuffer: true, stencilBuffer: false, colorSpace: s.NoColorSpace };
    this.rtScene = new s.WebGLRenderTarget(2, 2, a), this.rtScene.depthTexture = new s.DepthTexture(2, 2), this.rtScene.depthTexture.format = s.DepthFormat, this.rtScene.depthTexture.type = s.UnsignedIntType, this.rtScene.depthTexture.minFilter = s.NearestFilter, this.rtScene.depthTexture.magFilter = s.NearestFilter, this.rtA = new s.WebGLRenderTarget(2, 2, { ...a, depthBuffer: false }), this.rtB =
    new s.WebGLRenderTarget(2, 2, { ...a, type: s.UnsignedByteType, depthBuffer: false });
    const c = Le(eo), i = Le(An), l = Le(Tn);
    this.ink = c, this.grade = i, this.fxaa = l, c.mat.uniforms.tDepth.value = this.rtScene.depthTexture, this.enabled = { ink: true, grade: true, fxaa: true };
  }
  setSize(t, o) {
    const n = window.devicePixelRatio || 1;
    let r = this.forceScale || (n < 1.5 ? 1.5 : Math.min(n, 2));
    t * o * r * r > this.pixelBudget && (r = Math.max(1, Math.sqrt(this.pixelBudget / (t * o)))), this.scale = r;
    const a = Math.max(2, Math.floor(t * r)), c = Math.max(2, Math.floor(o * r));
    this.size.set(a, c), this.renderer.setPixelRatio(1), this.renderer.setSize(t, o, true), this.rtScene.setSize(a, c), this.rtA.setSize(a, c), this.rtB.setSize(a, c);
    const i = new s.Vector2(1 / a, 1 / c);
    this.ink.mat.uniforms.uTexel.value.copy(i), this.fxaa.mat.uniforms.uTexel.value.copy(i), this.ink.mat.uniforms.uNear.value = this.camera.near, this.ink.mat.uniforms.uFar.value = this.camera.far, this.ink.mat.uniforms.uThickness.value = 1.05 + 0.55 * r;
  }
  render() {
    const t = this.renderer;
    t.setRenderTarget(this.rtScene), t.clear(), t.render(this.scene, this.camera);
    let o = this.rtScene.texture;
    this.enabled.ink && (this.ink.mat.uniforms.tDiffuse.value = o, t.setRenderTarget(this.rtA), this.ink.quad.render(t), o = this.rtA.texture);
    const n = this.enabled.fxaa ? this.rtB : null;
    this.grade.mat.uniforms.tDiffuse.value = o, t.setRenderTarget(n), this.grade.quad.render(t), this.enabled.fxaa && (this.fxaa.mat.uniforms.tDiffuse.value = this.rtB.texture, t.setRenderTarget(null), this.fxaa.quad.render(t)), t.setRenderTarget(null);
  }
  dispose() {
    [this.rtScene, this.rtA, this.rtB].forEach((t) => t.dispose()), [this.ink, this.grade, this.fxaa].forEach((t) => {
      t.quad.dispose(), t.mat.dispose();
    });
  }
}
const ro = { 2: [96, 255], 3: [92, 178, 255], 4: [80, 142, 202, 255], 5: [74, 124, 172, 214, 255], soft: [180, 255], soft3: [172, 214, 255] }, _e = /* @__PURE__ */ new Map();
function Bn(e = 3) {
  const t = e;
  if (_e.has(t)) return _e.get(t);
  const o = ro[e] || ro[3], n = new Uint8Array(o.length * 4);
  for (let a = 0; a < o.length; a++) n[a * 4 + 0] = o[a], n[a * 4 + 1] = o[a], n[a * 4 + 2] = o[a], n[a * 4 + 3] = 255;
  const r = new s.DataTexture(n, o.length, 1, s.RGBAFormat);
  return r.minFilter = s.NearestFilter, r.magFilter = s.NearestFilter, r.generateMipmaps = false, r.needsUpdate = true, _e.set(t, r), r;
}
const $o = "lights_toon_pars_fragment", io = "vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;", In = `
	vec3 celBand = getGradientIrradiance( geometryNormal, directLight.direction );
	vec3 irradiance = celBand * mix( uShadowTint, vec3( 1.0 ), celBand ) * directLight.color;`;
let Yo = false, Xo = "";
{
  const e = s.ShaderChunk[$o];
  e && e.includes(io) && (Xo = `uniform vec3 uShadowTint;
` + e.replace(io, In), Yo = true);
}
function Rn(e, t) {
  if (!Yo) return e;
  const o = { value: new s.Color(t) };
  e.userData.shadowTint = o, e.onBeforeCompile = (r) => {
    r.uniforms.uShadowTint = o, r.fragmentShader = r.fragmentShader.replace(`#include <${$o}>`, Xo);
  };
  const n = new s.Color(t).getHexString();
  return e.customProgramCacheKey = () => "celTint_" + n, e;
}
const Ne = /* @__PURE__ */ new Map();
function g(e = {}) {
  const { color: t = 16777215, bands: o = 3, tint: n = 7102348, flat: r = true, map: a = null, emissive: c = null, emissiveIntensity: i = 1, transparent: l = false, opacity: f = 1, side: u = s.FrontSide, alphaTest: d = 0, depthWrite: h = null, fog: p = true, alphaMap: x = null, vertexColors: y = false, cache: v = true } = e, k = v && !a && !x ? [t, o, n, r, c, i, l, f, u, d, h, p, y].join("|") : null;
  if (k && Ne.has(k)) return Ne.get(k);
  const T = new s.MeshToonMaterial({ color: t, gradientMap: Bn(o), flatShading: r, map: a, alphaMap: x, transparent: l, opacity: f, side: u, alphaTest: d, fog: p, vertexColors: y, emissive: c === null ? 0 : c, emissiveIntensity: i });
  return h !== null && (T.depthWrite = h), Rn(T, n), k && Ne.set(k, T), T;
}
const Oe = /* @__PURE__ */ new Map();
function D(e = {}) {
  const { color: t = 16777215, map: o = null, transparent: n = false, opacity: r = 1, side: a = s.FrontSide, alphaTest: c = 0, depthWrite: i = null, fog: l = true, cache: f = true, toneMapped: u = true } = e, d = f && !o ? [t, n, r, a, c, i, l, u].join("|") : null;
  if (d && Oe.has(d)) return Oe.get(d);
  const h = new s.MeshBasicMaterial({ color: t, map: o, transparent: n, opacity: r, side: a, alphaTest: c, fog: l, toneMapped: u });
  return i !== null && (h.depthWrite = i), d && Oe.set(d, h), h;
}
const De = "'Yu Gothic', 'Yu Gothic UI', 'Meiryo', 'MS Gothic', 'Hiragino Kaku Gothic ProN', sans-serif", Fe = /* @__PURE__ */ new Map();
function Rt(e, t, o, { srgb: n = true, repeat: r = null, aniso: a = 4 } = {}) {
  const c = document.createElement("canvas");
  c.width = e, c.height = t;
  const i = c.getContext("2d");
  i.imageSmoothingEnabled = true, o(i, e, t);
  const l = new s.CanvasTexture(c);
  return n && (l.colorSpace = s.SRGBColorSpace), l.anisotropy = a, r && (l.wrapS = l.wrapT = s.RepeatWrapping, l.repeat.set(r[0], r[1])), l.needsUpdate = true, l;
}
function Et(e, t) {
  return Fe.has(e) || Fe.set(e, t()), Fe.get(e);
}
const Xt = (e) => "#" + e.toString(16).padStart(6, "0");
function En(e, t, o, n, r = De, a = "bold") {
  let c = n;
  do {
    if (e.font = `${a} ${c}px ${r}`, e.measureText(t).width <= o) break;
    c -= 2;
  } while (c > 6);
  return c;
}
function ne(e, t, o, n, r, a, c, i = "bold", l = 0) {
  const f = En(e, t, r, a, De, i);
  if (e.fillStyle = c, e.textAlign = l ? "left" : "center", e.textBaseline = "middle", l) {
    const u = [...t], d = u.reduce((p, x) => p + e.measureText(x).width + l, -l);
    let h = o - d / 2;
    for (const p of u) e.fillText(p, h, n), h += e.measureText(p).width + l;
  } else e.fillText(t, o, n);
  return f;
}
function Pn(e, t, o, n, r, a, c) {
  e.font = `bold ${a}px ${De}`, e.fillStyle = c, e.textAlign = "center", e.textBaseline = "middle", [...t].forEach((i, l) => e.fillText(i, o, n + l * r));
}
const Dn = () => Et("crossingSign", () => Rt(512, 256, (e, t, o) => {
  e.fillStyle = "#fbf8f2", e.fillRect(0, 0, t, o), e.strokeStyle = Xt(b.black), e.lineWidth = 12, e.strokeRect(6, 6, t - 12, o - 12), ne(e, "LEVEL CROSSING", t / 2, o * 0.36, t - 60, 84, Xt(b.redDeep), "bold", 6), ne(e, "STOP \xB7 LOOK \xB7 LISTEN", t / 2, o * 0.74, t - 80, 42, Xt(b.black), "bold", 2);
})), Ln = () => Et("stationSign", () => Rt(768, 192, (e, t, o) => {
  e.fillStyle = "#fbfaf6", e.fillRect(0, 0, t, o), e.fillStyle = Xt(b.teal), e.fillRect(0, o - 22, t, 22), ne(e, "\u0C35\u0C3F\u0C26\u0C4D\u0C2F\u0C3E\u0C28\u0C17\u0C30\u0C4D", t / 2, o * 0.42, t * 0.7, 92, "#2b3346", "bold", 12), e.font = `600 34px ${De}`, e.fillStyle = "#8a8fa0", e.textAlign = "center", e.fillText("VIDYANAGAR", t / 2, o * 0.82);
})), Zo = (e = 0) => Et("warnPlate" + e, () => Rt(256, 512, (t, o, n) => {
  const r = [{ bg: b.yellow, fg: b.black, t: "CCTV" }, { bg: b.red, fg: 16644336, t: "DANGER" }, { bg: 16644336, fg: b.blueDeep, t: "SLOW" }, { bg: 16644336, fg: b.redDeep, t: "11 KV" }], a = r[e % r.length];
  t.fillStyle = Xt(a.bg), t.fillRect(0, 0, o, n), t.fillStyle = Xt(a.fg), t.fillRect(12, 12, o - 24, 6), t.fillRect(12, n - 18, o - 24, 6), Pn(t, a.t, o / 2, 90, 88, 74, Xt(a.fg));
})), _n = () => Et("trainDest", () => Rt(512, 128, (e, t, o) => {
  e.fillStyle = "#1d2230", e.fillRect(0, 0, t, o), e.fillStyle = "#f2e6b0", e.fillRect(10, 22, 110, 84), ne(e, "MMTS", 65, 64, 96, 40, "#1d2230", "bold"), ne(e, "VIDYANAGAR", t * 0.62, o / 2, t * 0.55, 64, "#f2e6b0", "bold", 6);
})), Nn = () => Et("trainNumber", () => Rt(256, 96, (e, t, o) => {
  e.fillStyle = "#f7f2e6", e.fillRect(0, 0, t, o), ne(e, "MMTS 2104", t / 2, o / 2, t - 20, 50, "#4a4657");
})), Qo = (e = false) => Et("tactile" + e, () => Rt(128, 128, (t, o, n) => {
  if (t.fillStyle = Xt(b.tactile), t.fillRect(0, 0, o, n), t.fillStyle = "#d9a91f", e) for (let r = 0; r < 4; r++) t.fillRect(10, 12 + r * 30, o - 20, 16);
  else for (let r = 0; r < 4; r++) for (let a = 0; a < 4; a++) t.beginPath(), t.arc(20 + a * 29, 20 + r * 29, 9, 0, Math.PI * 2), t.fill();
}, { repeat: [1, 1] })), On = () => Et("platePlate", () => Rt(256, 128, (e, t, o) => {
  e.fillStyle = "#f6f4f0", e.fillRect(0, 0, t, o), e.strokeStyle = "#4f5a72", e.lineWidth = 8, e.strokeRect(8, 8, t - 16, o - 16), ne(e, "\u3055 21-08", t / 2, o / 2, t - 40, 56, "#2f3646");
})), Fn = () => Et("petalTex", () => Rt(128, 128, (e, t, o) => {
  e.clearRect(0, 0, t, o), e.translate(t / 2, o / 2), e.fillStyle = "#ffffff", e.beginPath(), e.moveTo(0, 52), e.bezierCurveTo(38, 34, 46, -14, 14, -48), e.bezierCurveTo(6, -38, 2, -34, 0, -30), e.bezierCurveTo(-2, -34, -6, -38, -14, -48), e.bezierCurveTo(-46, -14, -38, 34, 0, 52), e.closePath(), e.fill();
}, { srgb: false })), Vn = () => Et("cloudTex", () => Rt(512, 256, (e, t, o) => {
  e.clearRect(0, 0, t, o);
  const n = [[0.22, 0.62, 0.15], [0.36, 0.46, 0.2], [0.52, 0.4, 0.24], [0.68, 0.5, 0.19], [0.82, 0.63, 0.14], [0.45, 0.66, 0.2], [0.6, 0.68, 0.17]];
  e.fillStyle = "#ffffff";
  for (const [r, a, c] of n) e.beginPath(), e.ellipse(r * t, a * o, c * t * 0.55, c * o * 1.1, 0, 0, Math.PI * 2), e.fill();
  e.globalCompositeOperation = "destination-out", e.fillRect(0, o * 0.78, t, o * 0.22), e.globalCompositeOperation = "source-over";
}, { srgb: false })), Ut = (e, t, o) => e < t ? t : e > o ? o : e;
function gt(e, t, o) {
  const n = Ut((o - e) / (t - e || 1e-6), 0, 1);
  return n * n * (3 - 2 * n);
}
function Jo(e) {
  let t = e >>> 0;
  return function() {
    t = t + 1831565813 >>> 0;
    let o = t;
    return o = Math.imul(o ^ o >>> 15, o | 1), o ^= o + Math.imul(o ^ o >>> 7, o | 61), ((o ^ o >>> 14) >>> 0) / 4294967296;
  };
}
function at(e) {
  const t = Jo(e);
  return { next: t, range: (o, n) => o + (n - o) * t(), int: (o, n) => Math.floor(o + (n - o + 1) * t()), pick: (o) => o[Math.floor(t() * o.length) % o.length], chance: (o) => t() < o, sign: () => t() < 0.5 ? -1 : 1 };
}
function xt(e) {
  let t = e.map(({ geometry: a, matrix: c }) => {
    const i = a.clone();
    return c && i.applyMatrix4(c), i;
  });
  const o = t.filter((a) => a.index).length;
  o > 0 && o < t.length && (t = t.map((a) => {
    if (!a.index) return a;
    const c = a.toNonIndexed();
    return a.dispose(), c;
  }));
  const n = t.reduce((a, c) => a.filter((i) => c.attributes[i] !== void 0), Object.keys(t[0].attributes));
  for (const a of t) for (const c of Object.keys(a.attributes)) n.includes(c) || a.deleteAttribute(c);
  const r = Sn(t, false);
  return t.forEach((a) => a.dispose()), r;
}
const Wn = new s.Matrix4(), co = new s.Quaternion(), lo = new s.Euler(), fo = new s.Vector3(), uo = new s.Vector3();
function S(e = 0, t = 0, o = 0, n = 0, r = 0, a = 0, c = 1, i = 1, l = 1) {
  return fo.set(e, t, o), lo.set(n, r, a), co.setFromEuler(lo), uo.set(c, i, l), Wn.clone().compose(fo, co, uo);
}
function L(e, t, o, n, r = 0, a = 0, c = 0) {
  const i = new s.Mesh(new s.BoxGeometry(e, t, o), n);
  return i.position.set(r, a, c), i;
}
function le(e, t, o, n, r, a = 0, c = 0, i = 0) {
  const l = new s.Mesh(new s.CylinderGeometry(e, t, o, n), r);
  return l.position.set(a, c, i), l;
}
function Qt(e, t = true, o = true) {
  return e.traverse((n) => {
    if (!n.isMesh) return;
    const r = n.userData.noShadow || n.material && !Array.isArray(n.material) && n.material.transparent;
    n.castShadow = t && !r, n.receiveShadow = o;
  }), e;
}
function Hn(e, t, o, n = 14) {
  const r = [];
  for (let a = 0; a <= n; a++) {
    const c = a / n, i = new s.Vector3().lerpVectors(e, t, c);
    i.y -= Math.sin(Math.PI * c) * o, r.push(i);
  }
  return new s.CatmullRomCurve3(r);
}
function Un(e, t = 500) {
  const o = new s.SphereGeometry(t, 32, 20), n = new s.ShaderMaterial({ side: s.BackSide, depthWrite: true, fog: false, uniforms: { uTop: { value: new s.Color(b.skyTop) }, uMid: { value: new s.Color(b.skyMid) }, uHaze: { value: new s.Color(b.skyHaze) }, uBands: { value: 26 } }, vertexShader: `
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
    ` }), r = new s.Mesh(o, n);
  r.frustumCulled = false, r.renderOrder = -10, e.add(r);
  const a = Vn(), c = at(7781), i = new s.Group(), l = D({ color: b.cloud, map: a, transparent: true, opacity: 0.62, depthWrite: false, fog: false, cache: false }), f = D({ color: b.cloudShade, map: a, transparent: true, opacity: 0.34, depthWrite: false, fog: false, cache: false });
  l.map.wrapS = l.map.wrapT = s.ClampToEdgeWrapping;
  for (let u = 0; u < 22; u++) {
    const d = c.range(220, 350), h = c.range(0, Math.PI * 2), p = c.range(90, 210), x = p * c.range(0.24, 0.34), y = c.range(46, 140), v = new s.Group(), k = new s.Mesh(new s.PlaneGeometry(p, x), f);
    k.position.set(2, -x * 0.1, -1.5);
    const T = new s.Mesh(new s.PlaneGeometry(p, x), l);
    v.add(k, T), v.position.set(Math.cos(h) * d, y, Math.sin(h) * d), v.lookAt(0, y * 0.55, 0), v.renderOrder = -9, i.add(v);
  }
  return i.frustumCulled = false, e.add(i), { dome: r, clouds: i };
}
const F = 3.15, K = 1.55, jt = 0.135, jn = 0.015, Kt = -80, qt = 80, Mt = 2.2, Re = 2.95, Ht = 3.35;
function U(e) {
  let t = 0;
  return t += 2 * gt(-20, -50, e), t -= 2.4 * gt(20, 52, e), t;
}
function nt(e) {
  return 0;
}
function Kn(e, t) {
  return e - U(t);
}
function qn(e, t) {
  if (t < Kt || t > qt) return false;
  const o = Math.abs(Kn(e, t));
  return Math.abs(t) < Ht ? false : o > F - 0.02 && o < F + K;
}
function ho(e, t) {
  return nt() + (qn(e, t) ? jt : 0);
}
function re({ z0: e, z1: t, step: o = 1.2, a: n, b: r, uv: a = [1, 1], flip: c = false }) {
  const i = Math.max(2, Math.round(Math.abs(t - e) / o) + 1), l = [], f = [], u = [];
  for (let h = 0; h < i; h++) {
    const p = h / (i - 1), x = e + (t - e) * p, y = n(x), v = r(x);
    l.push(y.x, y.y, x, v.x, v.y, x), f.push(0, p * a[1], a[0], p * a[1]);
  }
  for (let h = 0; h < i - 1; h++) {
    const p = h * 2;
    c ? u.push(p, p + 1, p + 2, p + 1, p + 3, p + 2) : u.push(p, p + 2, p + 1, p + 1, p + 2, p + 3);
  }
  const d = new s.BufferGeometry();
  return d.setAttribute("position", new s.Float32BufferAttribute(l, 3)), d.setAttribute("uv", new s.Float32BufferAttribute(f, 2)), d.setIndex(u), d.computeVertexNormals(), d;
}
const tn = { z: -24 }, qe = -98, $e = 106;
function $n(e, t) {
  return false;
}
const Z = 160, mt = 2 * Math.PI * Z, st = new s.Vector3(0, -Z, 0), J = new s.Vector3(), Me = new s.Quaternion(), ve = new s.Vector3(), ze = new s.Matrix4();
function Yn(e, t, o = new s.Vector3()) {
  const n = e / Z, r = t / Z, a = Math.cos(r);
  return o.set(Math.sin(n) * a, Math.cos(n) * a, Math.sin(r));
}
function se(e, t, o, n = new s.Vector3()) {
  return Yn(e, o, n).multiplyScalar(Z + t).add(st), n;
}
function de(e, t, o = new s.Vector3(), n = new s.Vector3(), r = new s.Vector3()) {
  const a = e / Z, c = t / Z, i = Math.sin(a), l = Math.cos(a), f = Math.sin(c), u = Math.cos(c);
  return o.set(i * u, l * u, f), n.set(l, -i, 0), r.set(-i * f, -l * f, u), { up: o, east: n, north: r };
}
function en(e, t = { x: 0, z: 0, y: 0 }) {
  J.copy(e).sub(st);
  const o = J.length() || 1;
  return J.multiplyScalar(1 / o), t.z = Z * Math.asin(s.MathUtils.clamp(J.z, -1, 1)), t.x = Z * Math.atan2(J.x, J.y), t.y = o - Z, t;
}
function on(e, t) {
  let o = e - t;
  for (; o > mt / 2; ) o -= mt;
  for (; o < -mt / 2; ) o += mt;
  return o;
}
function vt(e) {
  const t = mt;
  return ((e + t / 2) % t + t) % t - t / 2;
}
function Xn(e, t) {
  let o = e.index ? e.toNonIndexed() : e;
  const n = t * t;
  let a = Object.keys(o.attributes).map((u) => ({ name: u, size: o.attributes[u].itemSize, src: o.attributes[u].array })), c = o.attributes.position.count;
  const i = e.groups && e.groups.length ? e.groups : null;
  let l = new Int32Array(c / 3);
  if (i) for (const u of i) {
    const d = Math.floor(u.start / 3), h = Math.min(l.length, d + Math.floor(u.count / 3));
    for (let p = d; p < h; p++) l[p] = u.materialIndex ?? 0;
  }
  for (let u = 0; u < 12; u++) {
    const d = a.find((y) => y.name === "position").src;
    let h = 0;
    const p = a.map((y) => ({ name: y.name, size: y.size, dst: [] })), x = [];
    for (let y = 0; y < c; y += 3) {
      let v = -1, k = 0;
      for (let w = 0; w < 3; w++) {
        const z = y + w, I = y + (w + 1) % 3, A = d[z * 3] - d[I * 3], G = d[z * 3 + 1] - d[I * 3 + 1], E = d[z * 3 + 2] - d[I * 3 + 2], H = A * A + G * G + E * E;
        H > v && (v = H, k = w);
      }
      if (v <= n) {
        for (const w of p) {
          const z = a.find((I) => I.name === w.name).src;
          for (let I = 0; I < 3; I++) for (let A = 0; A < w.size; A++) w.dst.push(z[(y + I) * w.size + A]);
        }
        x.push(l[y / 3]);
        continue;
      }
      h++, x.push(l[y / 3], l[y / 3]);
      const T = y + k, m = y + (k + 1) % 3, M = y + (k + 2) % 3;
      for (const w of p) {
        const z = a.find((G) => G.name === w.name).src, I = [];
        for (let G = 0; G < w.size; G++) I.push((z[T * w.size + G] + z[m * w.size + G]) * 0.5);
        const A = (G) => {
          for (let E = 0; E < w.size; E++) w.dst.push(z[G * w.size + E]);
        };
        A(T), w.dst.push(...I), A(M), w.dst.push(...I), A(m), A(M);
      }
    }
    if (a = p.map((y) => ({ name: y.name, size: y.size, src: Float32Array.from(y.dst) })), l = Int32Array.from(x), c = a.find((y) => y.name === "position").src.length / 3, !h) break;
  }
  const f = new s.BufferGeometry();
  for (const u of a) f.setAttribute(u.name, new s.BufferAttribute(u.src, u.size));
  if (i) {
    let u = 0;
    for (let d = 1; d <= l.length; d++) (d === l.length || l[d] !== l[u]) && (f.addGroup(u * 3, (d - u) * 3, l[u]), u = d);
  }
  return o !== e && o.dispose(), f;
}
function Zn(e, t = 3) {
  const o = Xn(e, t), n = o.attributes.position, r = new s.Vector3();
  for (let a = 0; a < n.count; a++) se(n.getX(a), n.getY(a), n.getZ(a), r), n.setXYZ(a, r.x, r.y, r.z);
  return n.needsUpdate = true, o.deleteAttribute("normal"), o.computeVertexNormals(), o.computeBoundingSphere(), o;
}
function Qn(e, { maxEdge: t = 3 } = {}) {
  e.updateMatrixWorld(true);
  const o = (i) => {
    for (let l = i.parent; l && l !== e.parent; l = l.parent) if (l.userData.planetRigid) return true;
    return false;
  }, n = [];
  e.traverse((i) => {
    i.userData.planetRigid && !o(i) && n.push({ obj: i, world: i.matrixWorld.clone() });
  });
  const r = [];
  e.traverse((i) => {
    !i.isMesh && !i.isLine || i.userData.planetRigid || o(i) || r.push({ obj: i, world: i.matrixWorld.clone() });
  });
  const a = { wrapped: 0, instanced: 0, rigid: n.length, tris: 0 };
  for (const { obj: i, world: l } of r) {
    if (i.isInstancedMesh) {
      const f = i.count, u = i.instanceMatrix;
      for (let d = 0; d < f; d++) {
        ze.fromArray(u.array, d * 16).premultiply(l), ze.decompose(J, Me, ve);
        const h = de(J.x, J.z), p = new s.Quaternion().setFromRotationMatrix(new s.Matrix4().makeBasis(h.east, h.up, h.north)), x = se(J.x, J.y, J.z, new s.Vector3());
        ze.compose(x, p.multiply(Me), ve), ze.toArray(u.array, d * 16);
      }
      u.needsUpdate = true, i.frustumCulled = false, a.instanced += f;
    } else {
      const f = i.geometry.clone().applyMatrix4(l), u = Zn(f, t);
      f.dispose(), i.geometry = u, i.frustumCulled = true, a.wrapped++, a.tris += u.attributes.position.count / 3;
    }
    i.position.set(0, 0, 0), i.quaternion.identity(), i.scale.set(1, 1, 1), i.matrixAutoUpdate = true;
  }
  e.traverse((i) => {
    i === e || i.isMesh || i.isLine || i.userData.planetRigid || o(i) || (i.position.set(0, 0, 0), i.quaternion.identity(), i.scale.set(1, 1, 1));
  });
  const c = new s.Matrix4();
  for (const { obj: i, world: l } of n) {
    l.decompose(J, Me, ve);
    const f = de(J.x, J.z);
    c.makeBasis(f.east, f.up, f.north), i.position.copy(se(J.x, J.y, J.z, new s.Vector3())), i.quaternion.setFromRotationMatrix(c).multiply(Me), i.scale.copy(ve);
  }
  return a;
}
function Jn(e, t) {
  return 0;
}
function ts(e) {
  const t = e.attributes.position, o = { x: 0, z: 0, y: 0 }, n = new s.Vector3(), r = (c) => (n.set(t.getX(c), t.getY(c), t.getZ(c)), en(n, o), $n()), a = [];
  for (let c = 0; c < t.count; c += 3) if (!(r(c) || r(c + 1) || r(c + 2))) for (let i = 0; i < 3; i++) a.push(t.getX(c + i), t.getY(c + i), t.getZ(c + i));
  e.setAttribute("position", new s.Float32BufferAttribute(a, 3));
}
function es(e) {
  const t = new s.Group();
  t.name = "planet";
  const o = new s.IcosahedronGeometry(Z, 30), n = o.attributes.position, r = new s.Vector3(), a = { x: 0, z: 0, y: 0 }, c = new s.Vector3();
  for (let l = 0; l < n.count; l++) {
    r.set(n.getX(l), n.getY(l), n.getZ(l)).normalize(), c.copy(r).multiplyScalar(Z).add(st), en(c, a);
    const f = Jn() + nt() * 0.999 - jn - 0.065;
    c.copy(r).multiplyScalar(Z + f).add(st), n.setXYZ(l, c.x, c.y, c.z);
  }
  n.needsUpdate = true, o.deleteAttribute("normal"), ts(o);
  {
    const l = o.attributes.position, f = new Float32Array(l.count * 3), u = new s.Vector3();
    for (let d = 0; d < l.count; d++) u.set(l.getX(d), l.getY(d), l.getZ(d)).sub(st).normalize(), f[d * 3] = u.x, f[d * 3 + 1] = u.y, f[d * 3 + 2] = u.z;
    o.setAttribute("normal", new s.BufferAttribute(f, 3));
  }
  const i = new s.Mesh(o, g({ color: 12563607, bands: 4, tint: 8024982, flat: false }));
  return i.receiveShadow = true, i.castShadow = false, i.frustumCulled = false, i.name = "planetLand", t.add(i), e.add(t), { group: t, land: i };
}
const os = `
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
`, ns = `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() { gl_FragColor = vec4( uColor, uOpacity ); }
`, nn = new s.Vector2(1920, 1080), sn = /* @__PURE__ */ new Set();
function an(e, t) {
  nn.set(e, t), sn.forEach((o) => o.uniforms.uResolution.value.set(e, t));
}
const Ve = /* @__PURE__ */ new WeakMap();
function ss(e) {
  if (Ve.has(e)) return Ve.get(e);
  let t;
  try {
    t = Gn(e.clone(), 1e-4), t.computeVertexNormals();
  } catch {
    t = e.clone();
  }
  for (const o of Object.keys(t.attributes)) o !== "position" && o !== "normal" && t.deleteAttribute(o);
  return Ve.set(e, t), t;
}
function bt(e, { thickness: t = 38e-4, color: o = b.ink, opacity: n = 1 } = {}) {
  if (!e || !e.geometry) return null;
  const r = new s.ShaderMaterial({ uniforms: { uThickness: { value: t }, uColor: { value: new s.Color(o) }, uOpacity: { value: n }, uResolution: { value: nn.clone() } }, vertexShader: os, fragmentShader: ns, side: s.BackSide, transparent: n < 1, depthWrite: true, fog: false });
  sn.add(r);
  const a = ss(e.geometry);
  let c;
  return e.isInstancedMesh ? (c = new s.InstancedMesh(a, r, e.count), c.instanceMatrix = e.instanceMatrix, c.count = e.count) : c = new s.Mesh(a, r), c.castShadow = false, c.receiveShadow = false, c.renderOrder = (e.renderOrder || 0) - 1, c.frustumCulled = e.frustumCulled, e.add(c), c;
}
const as = 1.62, rs = 0.34, is = 0.38, $t = { eye: 1.4, seatFwd: 0.46, nose: 0.92, noseR: 0.3, steer: 1.75 };
class cs {
  constructor(t, o, n, r = {}) {
    this.camera = t, this.dom = o, this.world = n, this.spawn = { pos: new s.Vector3(2.2, 0, -6.5), yaw: r.yaw ?? Math.PI + 0.14, pitch: r.pitch ?? -0.01 }, r.pos && this.spawn.pos.copy(r.pos), this.pos = this.spawn.pos.clone(), this.yaw = this.spawn.yaw, this.pitch = this.spawn.pitch, this.vel = new s.Vector3(), this.bob = 0, this.locked = false, this.keys = /* @__PURE__ */ new Set(), this.walkSpeed =
    2.55, this.runSpeed = 5.1, this.rideSpeed = this.runSpeed * 1.5, this.sensitivity = 22e-4, this.ride = null, this.roll = 0, this.yawRate = 0, this._prevYaw = this.yaw, this._forward = new s.Vector3(), this._right = new s.Vector3(), this._wish = new s.Vector3(), this._probe = new s.Vector3(), this._up = new s.Vector3(), this._east = new s.Vector3(), this._north = new s.Vector3(), this._basis = new s.
    Matrix4(), this._surfaceQ = new s.Quaternion(), this._localQ = new s.Quaternion(), this._localE = new s.Euler(), this.raycaster = new s.Raycaster(), this.raycaster.far = 3, this.hovered = null, this.onInteract = null, this.onLockChange = null, this._bind(), this.applyCamera(0);
  }
  _bind() {
    const t = (o) => {
      this.locked && (this.yaw -= o.movementX * this.sensitivity, this.pitch -= o.movementY * this.sensitivity, this.pitch = Ut(this.pitch, -1.15, 1.05));
    };
    document.addEventListener("mousemove", t), document.addEventListener("pointerlockchange", () => {
      this.locked = document.pointerLockElement === this.dom, this.locked || this.keys.clear(), this.onLockChange?.(this.locked);
    }), window.addEventListener("keydown", (o) => {
      if (o.repeat) return;
      const n = o.code;
      this.keys.add(n), n === "KeyE" && this.locked && this.onInteract?.(this.hovered), n === "KeyR" && this.locked && this.reset(), ["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(n) && this.locked && o.preventDefault();
    }), window.addEventListener("keyup", (o) => this.keys.delete(o.code)), window.addEventListener("blur", () => this.keys.clear());
  }
  lock() {
    this.dom.requestPointerLock?.();
  }
  touchLook(t, o) {
    this.touchActive && (this.yaw -= t * this.sensitivity * 2.4, this.pitch = Ut(this.pitch - o * this.sensitivity * 2.4, -1.15, 1.05));
  }
  touchPress(t) {
    this.keys.add(t);
  }
  touchRelease(t) {
    this.keys.delete(t);
  }
  touchInteract() {
    this.onInteract?.(this.hovered);
  }
  reset() {
    this.pos.copy(this.spawn.pos), this.yaw = this.spawn.yaw, this.pitch = this.spawn.pitch, this.vel.set(0, 0, 0), this.bob = 0;
  }
  mount(t) {
    this.ride = t, this.vel.set(0, 0, 0), this.bob = 0, this._prevYaw = this.yaw;
  }
  unmount() {
    this.ride = null, this.vel.set(0, 0, 0), this.roll = 0, this.yawRate = 0, this._prevYaw = this.yaw;
  }
  _resolve(t, o) {
    this._resolveAt(this.pos, t, o, rs);
  }
  _resolveAt(t, o, n, r) {
    for (const a of o) {
      if (a.top !== void 0 && a.top <= n + is || a.bottom !== void 0 && a.bottom > n + 1.9) continue;
      const c = a.x0 - r, i = a.x1 + r, l = a.z0 - r, f = a.z1 + r;
      if (t.x <= c || t.x >= i || t.z <= l || t.z >= f) continue;
      const u = t.x - c, d = i - t.x, h = t.z - l, p = f - t.z, x = Math.min(u, d, h, p);
      x === u ? t.x = c : x === d ? t.x = i : x === h ? t.z = l : t.z = f;
    }
  }
  update(t) {
    const o = this.keys, n = this.ride !== null, r = o.has("ShiftLeft") || o.has("ShiftRight"), a = n ? this.rideSpeed : r ? this.runSpeed : this.walkSpeed;
    let c = 0, i = 0;
    (this.locked || this.touchActive) && ((o.has("KeyW") || o.has("ArrowUp")) && (c += 1), (o.has("KeyS") || o.has("ArrowDown")) && (c -= 1), (o.has("KeyD") || o.has("ArrowRight")) && (i += 1), (o.has("KeyA") || o.has("ArrowLeft")) && (i -= 1)), n && i && (this.yaw -= i * $t.steer * t), this._forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)), this._right.set(Math.cos(this.yaw), 0, -Math.sin(
    this.yaw)), n ? this._wish.copy(this._forward).multiplyScalar(c > 0 ? a : c < 0 ? -1.7 : 0) : (this._wish.copy(this._forward).multiplyScalar(c).addScaledVector(this._right, i), this._wish.lengthSq() > 1e-6 && this._wish.normalize().multiplyScalar(a));
    const l = n ? c > 0 ? 5 : c < 0 ? 9 : 3.6 : this._wish.lengthSq() > 1e-6 ? 13 : 16, f = 1 - Math.exp(-l * t);
    this.vel.x += (this._wish.x - this.vel.x) * f, this.vel.z += (this._wish.z - this.vel.z) * f;
    const u = this.world.heightAt(this.pos.x, this.pos.z), d = this.world.colliders, h = 1 / Math.max(0.25, Math.cos(this.pos.z / Z)), p = this.vel.x * t * h, x = this.vel.z * t, y = Math.max(1, Math.ceil(Math.max(Math.abs(p), Math.abs(x)) / 0.18));
    for (let w = 0; w < y; w++) this.pos.x += p / y, this._resolve(d, u), this.pos.z += x / y, this._resolve(d, u);
    if (n) {
      const w = this._probe.copy(this.pos).addScaledVector(this._forward, $t.nose), z = w.x, I = w.z;
      this._resolveAt(w, d, u, $t.noseR), this.pos.x += w.x - z, this.pos.z += w.z - I, this._resolve(d, u);
    }
    this.pos.x = vt(this.pos.x);
    const v = this.world.bounds;
    this.pos.z = Ut(this.pos.z, v.z0, v.z1);
    const k = this.world.heightAt(this.pos.x, this.pos.z, this.pos.y);
    this.pos.y += (k - this.pos.y) * (1 - Math.exp(-18 * t));
    const T = Math.hypot(this.vel.x, this.vel.z), m = (this.yaw - this._prevYaw) / Math.max(t, 1e-4);
    this._prevYaw = this.yaw, this.yawRate += (m - this.yawRate) * (1 - Math.exp(-9 * t));
    const M = n ? Ut(this.yawRate, -2.6, 2.6) * 0.05 * Math.min(T / this.rideSpeed, 1) : 0;
    this.roll += (M - this.roll) * (1 - Math.exp(-7 * t)), this.bob += t * T * (r ? 8.2 : 6.4), this.applyCamera(T);
  }
  applyCamera(t) {
    const o = this.ride !== null, n = o ? 0 : Math.min(t / this.walkSpeed, 1) * 0.014, r = this.pos.y + (o ? $t.eye : as) + Math.sin(this.bob) * n, a = de(this.pos.x, this.pos.z, this._up, this._east, this._north);
    this._basis.makeBasis(this._east, this._up, this._north), this._surfaceQ.setFromRotationMatrix(this._basis), this._localE.set(this.pitch, this.yaw, this.roll + Math.sin(this.bob * 0.5) * n * 0.35, "YXZ"), this._localQ.setFromEuler(this._localE), se(this.pos.x, r, this.pos.z, this.camera.position), this.camera.quaternion.copy(this._surfaceQ).multiply(this._localQ), this.camera.up.copy(a.up);
  }
  pick(t) {
    if (!t.length) return this.hovered = null, null;
    this.raycaster.set(this.camera.position, this._forward.set(0, 0, -1).applyQuaternion(this.camera.quaternion));
    const o = t.map((r) => r.hitbox), n = this.raycaster.intersectObjects(o, false);
    return this.hovered = n.length ? t[o.indexOf(n[0].object)] : null, this.hovered;
  }
}
function ls({ volume: e = 0.34 } = {}) {
  const t = (G, E, H, q) => {
    const C = document.createElement(G);
    return E && (C.className = E), q !== void 0 && (C.innerHTML = q), (H || document.body).appendChild(C), C;
  }, o = t("div", "hud"), n = t("div", "crosshair", o), r = t("div", "prompt", o, ""), a = t("div", "toast", o, ""), c = t("div", "memory-card", o, "");
  c.setAttribute("role", "dialog");
  let i = false;
  const l = t("div", "touch-ui", o, `
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
    </div>`), f = t("div", "hint", o, `<b>WASD</b> walk &nbsp;\xB7&nbsp; <b>Shift</b> run &nbsp;\xB7&nbsp; <b>Mouse</b> look
     &nbsp;\xB7&nbsp; <b>E</b> interact &nbsp;\xB7&nbsp; <b>V</b> auto
     &nbsp;\xB7&nbsp; <b>P</b> see the planet &nbsp;\xB7&nbsp; <b>M</b> music
     &nbsp;\xB7&nbsp; <b>R</b> opening view &nbsp;\xB7&nbsp; <b>Esc</b> release`), u = t("div", "coords", o, "");
  let d = "";
  const h = t("div", "overlay", o);
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
  const p = h.querySelector(".menu-action"), x = h.querySelector(".audio-control"), y = h.querySelector(".volume-slider"), v = h.querySelector(".audio-head output"), k = (G) => {
    const E = Math.round(Math.max(0, Math.min(1, G)) * 100);
    y.value = String(E), y.style.setProperty("--volume", `${E}%`), v.value = `${E}%`, v.textContent = `${E}%`, y.setAttribute("aria-valuetext", `${E}%`);
  };
  k(e);
  let T = 0, m = true, M = null, w = false, z = 0, I = false;
  const A = { root: o, overlay: h, onStart: null, onVolumeChange: null, flash(G, E = 1400) {
    a.textContent = G, a.classList.add("on"), clearTimeout(M), M = setTimeout(() => a.classList.remove("on"), E);
  }, setPrompt(G) {
    G ? (r.textContent = G, r.classList.add("on")) : r.classList.remove("on");
  }, setPlanetView(G) {
    n.classList.toggle("hidden", G);
  }, setLocked(G) {
    G && (I = true), h.dataset.mode = I ? "paused" : "start", h.classList.toggle("hidden", G), h.setAttribute("aria-hidden", G ? "true" : "false"), n.classList.toggle("on", G), G ? (T = 0, m = true, f.classList.remove("faded")) : requestAnimationFrame(() => p.focus({ preventScroll: true }));
  }, setVolume(G) {
    k(G);
  }, setMuted(G) {
    x.classList.toggle("muted", G);
  }, toggleHint() {
    m = !m, f.classList.toggle("faded", !m), T = m ? 0 : 1e9;
  }, toggleCoords() {
    return w = !w, u.classList.toggle("on", w), z = 1e9, w;
  }, get coordsVisible() {
    return w;
  }, setCoords(G, E, H, q = 0) {
    if (!w || (z += q, z < 0.1)) return;
    z = 0;
    const C = (R, W = 2) => R.toFixed(W);
    let P = E % (Math.PI * 2);
    P > Math.PI && (P -= Math.PI * 2), P <= -Math.PI && (P += Math.PI * 2);
    const B = ["north +z", "north-west", "west -x", "south-west", "south -z", "south-east", "east +x", "north-east"][((4 - Math.round(P / (Math.PI * 2) * 8)) % 8 + 8) % 8];
    d = `{ pos: [${C(G.x, 1)}, 0, ${C(G.z, 1)}], yaw: ${C(P)}, pitch: ${C(H)} }`, u.innerHTML = `<span class="k">x</span>${C(G.x)} <span class="k">z</span>${C(G.z)} <span class="k">y</span>${C(G.y)}<br><span class="k">yaw</span>${C(P)} <span class="k">pitch</span>${C(H)} <span class="d">${B}</span><br><span class="s">${d}</span><br><span class="d">click or Shift+C to copy</span>`;
  }, copyCoords() {
    if (!d) return false;
    const G = () => (A.flash("copied  \xB7  " + d, 2200), true);
    try {
      if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(d).then(G, () => A.copyFallback(d)), true;
    } catch {
    }
    return A.copyFallback(d) ? G() : false;
  }, copyFallback(G) {
    const E = document.createElement("textarea");
    E.value = G, E.setAttribute("readonly", ""), E.style.cssText = "position:fixed;top:-1000px;opacity:0", document.body.appendChild(E), E.select();
    let H = false;
    try {
      H = document.execCommand("copy");
    } catch {
      H = false;
    }
    return E.remove(), H;
  }, update(G, E) {
    !E || !m || (T += G, T > 11 && (f.classList.add("faded"), m = false));
  } };
  p.addEventListener("click", (G) => {
    G.stopPropagation(), A.onStart?.();
  }), h.addEventListener("click", (G) => {
    G.target.closest(".audio-control") || A.onStart?.();
  });
  for (const G of ["click", "pointerdown", "pointerup"]) x.addEventListener(G, (E) => E.stopPropagation());
  return y.addEventListener("input", () => {
    const G = Number(y.value) / 100;
    k(G), A.onVolumeChange?.(G);
  }), window.addEventListener("keydown", (G) => {
    G.code === "KeyH" && A.toggleHint(), G.code === "KeyC" && (G.shiftKey ? w && A.copyCoords() : A.flash(A.toggleCoords() ? "coordinates on" : "coordinates off", 900));
  }), u.style.pointerEvents = "auto", u.style.cursor = "copy", u.addEventListener("click", (G) => {
    G.stopPropagation(), A.copyCoords();
  }), A.showCard = ({ title: G, body: E }) => {
    c.innerHTML = `<button class="card-close" aria-label="close">\u2715</button>
      <h3></h3><p></p>`, c.querySelector("h3").textContent = G, c.querySelector("p").textContent = E, c.classList.add("on"), i = true, c.querySelector(".card-close").addEventListener("click", (H) => {
      H.stopPropagation(), A.hideCard();
    });
  }, A.hideCard = () => {
    c.classList.remove("on"), i = false;
  }, A.cardIsOpen = () => i, window.addEventListener("keydown", (G) => {
    G.code === "Escape" && i && A.hideCard();
  }), A.bindTouch = ({ player: G, onPlanet: E, onMusic: H, onEnter: q }) => {
    const C = (B, R) => {
      const W = B.dataset.key, et = B.dataset.act;
      W && (R ? G.touchPress(W) : G.touchRelease(W)), R && (et === "interact" && G.touchInteract(), et === "planet" && E?.(), et === "music" && H?.());
    };
    l.querySelectorAll(".tbtn").forEach((B) => {
      B.addEventListener("pointerdown", (R) => {
        R.preventDefault(), C(B, true);
      }), B.addEventListener("pointerup", () => C(B, false)), B.addEventListener("pointercancel", () => C(B, false)), B.addEventListener("pointerleave", () => C(B, false));
    });
    const P = document.getElementById("view");
    let N = null;
    P.addEventListener("touchstart", (B) => {
      B.touches.length === 1 && (N = { x: B.touches[0].clientX, y: B.touches[0].clientY }, q?.());
    }, { passive: true }), P.addEventListener("touchmove", (B) => {
      if (!N || B.touches.length !== 1) return;
      const R = B.touches[0];
      G.touchLook(R.clientX - N.x, R.clientY - N.y), N = { x: R.clientX, y: R.clientY }, B.preventDefault();
    }, { passive: false }), P.addEventListener("touchend", () => {
      N = null;
    });
  }, A;
}
const ue = ["bfcmusic-divine-sakura-garden-fairytale-music-283353.mp3"].map((e) => `./audio/${e}`);
function ds({ volume: e = 0.34, fadeIn: t = 2.6 } = {}) {
  let o = [], n = -1;
  function r() {
    o = ue.map((m, M) => M);
    for (let m = o.length - 1; m > 0; m--) {
      const M = Math.floor(Math.random() * (m + 1));
      [o[m], o[M]] = [o[M], o[m]];
    }
    if (o.length > 1 && o[0] === n) {
      const m = 1 + Math.floor(Math.random() * (o.length - 1));
      [o[0], o[m]] = [o[m], o[0]];
    }
  }
  function a() {
    return o.length === 0 && r(), n = o.shift(), n;
  }
  let c = a();
  const i = new Audio(ue[c]);
  i.loop = false, i.preload = "auto", i.volume = 0;
  let l = e, f = e > 1e-3 ? e : 0.34, u = e <= 1e-3, d = false, h = ue.length === 0, p = null, x = null;
  const y = (m) => Math.max(0, Math.min(1, m));
  function v() {
    ue.length && (c = a(), i.src = ue[c], i.load());
  }
  function k(m, M) {
    l = y(m), clearInterval(p), clearTimeout(x);
    const w = () => {
      clearInterval(p), clearTimeout(x), p = x = null, i.volume = l, l === 0 && u && i.pause();
    }, z = Math.abs(l - i.volume);
    if (!(M > 0) || z < 4e-3) return w();
    const I = 33, A = I / 1e3 * (z / M);
    p = setInterval(() => {
      const G = l - i.volume;
      i.volume = y(i.volume + Math.sign(G) * Math.min(Math.abs(G), A)), Math.abs(l - i.volume) < 4e-3 && w();
    }, I), x = setTimeout(w, M * 1e3 + 600);
  }
  const T = { el: i, get muted() {
    return u;
  }, get volume() {
    return e;
  }, get available() {
    return !h;
  }, start() {
    d || h || (d = true, i.volume = 0, !u && i.play().then(() => k(e, t), () => {
      h = true, d = false;
    }));
  }, toggle() {
    return h || (u = !u, u ? k(0, 0.35) : (e <= 1e-3 && (e = f), i.paused && i.play().catch(() => {
      h = true;
    }), k(e, 0.5))), u;
  }, setVolume(m) {
    return e = y(m), e > 1e-3 ? (f = e, u = false, d && (i.paused && i.play().catch(() => {
      h = true;
    }), k(e, 0.3))) : (u = true, d && k(0, 0.25)), u;
  } };
  return i.addEventListener("ended", () => {
    v(), !(!d || h || u || document.hidden) && i.play().catch(() => {
      h = true, d = false;
    });
  }), document.addEventListener("visibilitychange", () => {
    !d || h || u || (document.hidden ? i.pause() : i.play().catch(() => {
    }));
  }), T;
}
const ct = 3.4, fs = 7, us = 17, po = fs, mo = us, hs = 5.5, Be = [{ x: 161, z: -45.2, bank: 0.5, dr: 14, dm: 2.5, cr: 2.2, fa: 0.48 }, { x: 154, z: -48.8, bank: 0.5, dr: 15, dm: 2.6, cr: 2.2, fa: 0.48 }, { x: 147.2, z: -52.2, bank: 0.46, dr: 14, dm: 2.5, cr: 4.2, fa: 0.46, hi: 10 }, { x: 143.6, z: -60, bank: 0.26, dr: 16, dm: 2.6, cr: 5.6, fa: 0.46, hi: 12, ho: 24 }, { x: 142.4, z: -70, bank: 0.21,
dr: 17, dm: 2.6, cr: 6.4, fa: 0.44, hi: 14, ho: 28 }, { x: 142.2, z: -80, bank: 0.2, dr: 18, dm: 2.6, cr: 6.8, fa: 0.44, hi: 15, ho: 30 }, { x: 145, z: -90, bank: 0.24, dr: 17, dm: 2.6, cr: 7, fa: 0.44, hi: 14, ho: 28 }, { x: 147.6, z: -100, bank: 0.38, dr: 14, dm: 2.5, cr: 7.2, fa: 0.44, hi: 11, ho: 24 }, { x: 148.6, z: -110, bank: 0.26, dr: 16, dm: 2.3, cr: 6.8, fa: 0.42, hi: 9 }, { x: 151.6, z: -118,
bank: 0.22, dr: 18, dm: 2.1, cr: 6.2, fa: 0.42 }, { x: 159.4, z: -125.6, bank: 0.18, dr: 20, dm: 1.9, cr: 5.6, fa: 0.4 }, { x: 170, z: -131.6, bank: 0.24, dr: 18, dm: 1.9, cr: 5.4, fa: 0.4, hi: 11, ho: 24 }, { x: 181, z: -135.6, bank: 0.26, dr: 16, dm: 1.8, cr: 5.4, fa: 0.4, hi: 12, ho: 24 }, { x: 184, z: -126, bank: 0.3, dr: 14, dm: 1.9, cr: 5, fa: 0.4 }, { x: 186, z: -116, bank: 0.32, dr: 13, dm: 2.1,
cr: 4.8, fa: 0.4 }, { x: 189, z: -107, bank: 0.34, dr: 12, dm: 2.3, cr: 4.6, fa: 0.4 }, { x: 194, z: -101, bank: 0.36, dr: 12, dm: 2.4, cr: 4.2, fa: 0.4 }, { x: 199, z: -105, bank: 0.34, dr: 12, dm: 2.3, cr: 4.6, fa: 0.4 }, { x: 201, z: -114, bank: 0.3, dr: 13, dm: 2.1, cr: 4.8, fa: 0.4 }, { x: 200, z: -124, bank: 0.26, dr: 15, dm: 1.8, cr: 5, fa: 0.4 }, { x: 202, z: -134, bank: 0.11, dr: 26, dm: 1.1,
cr: 5.4, fa: 0.38 }, { x: 214, z: -136.5, bank: 0.1, dr: 28, dm: 1, cr: 5.6, fa: 0.38 }, { x: 226, z: -135, bank: 0.12, dr: 26, dm: 1.1, cr: 5.8, fa: 0.38 }, { x: 236, z: -130, bank: 0.16, dr: 22, dm: 1.6, cr: 6.4, fa: 0.4 }, { x: 243, z: -120, bank: 0.3, dr: 17, dm: 2.3, cr: 7.2, fa: 0.42 }, { x: 247, z: -108, bank: 0.34, dr: 15, dm: 2.5, cr: 7.4, fa: 0.42 }, { x: 249.6, z: -96, bank: 0.38, dr: 14,
dm: 2.5, cr: 7.6, fa: 0.42 }, { x: 249.8, z: -84, bank: 0.4, dr: 14, dm: 2.5, cr: 7.6, fa: 0.42 }, { x: 247, z: -72, bank: 0.38, dr: 15, dm: 2.5, cr: 7.4, fa: 0.42 }, { x: 242, z: -60, bank: 0.32, dr: 16, dm: 2.4, cr: 7, fa: 0.42 }, { x: 234, z: -50, bank: 0.26, dr: 18, dm: 2.2, cr: 6.4, fa: 0.4 }, { x: 224, z: -43, bank: 0.24, dr: 19, dm: 2.2, cr: 6.2, fa: 0.42 }, { x: 212, z: -40, bank: 0.26, dr: 20,
dm: 2.4, cr: 6.4, fa: 0.44 }, { x: 199, z: -39.4, bank: 0.28, dr: 20, dm: 2.5, cr: 6.8, fa: 0.46 }, { x: 186, z: -39.6, bank: 0.28, dr: 20, dm: 2.5, cr: 7.2, fa: 0.46 }, { x: 174, z: -40.6, bank: 0.3, dr: 18, dm: 2.5, cr: 7.2, fa: 0.46 }, { x: 166, z: -42.4, bank: 0.36, dr: 16, dm: 2.5, cr: 6, fa: 0.46 }], oo = Be.map((e, t) => {
  const o = Be[(t + 1) % Be.length], n = o.x - e.x, r = o.z - e.z;
  return { a: e, b: o, dx: n, dz: r, len: Math.hypot(n, r), l2: n * n + r * r || 1e-6, s0: 0 };
});
{
  let e = 0;
  for (const t of oo) t.s0 = e, e += t.len;
}
const Yt = (() => {
  let e = 1 / 0, t = -1 / 0, o = 1 / 0, n = -1 / 0;
  for (const r of Be) e = Math.min(e, r.x), t = Math.max(t, r.x), o = Math.min(o, r.z), n = Math.max(n, r.z);
  return { x0: e, x1: t, z0: o, z1: n };
})(), he = 62;
function rn(e, t) {
  let o = false;
  for (const n of oo) {
    const { a: r, b: a } = n;
    if (r.z > t != a.z > t) {
      const c = (t - r.z) / (a.z - r.z);
      e < r.x + c * (a.x - r.x) && (o = !o);
    }
  }
  return o;
}
function cn(e, t) {
  if (e < Yt.x0 - he || e > Yt.x1 + he || t < Yt.z0 - he || t > Yt.z1 + he) return null;
  let o = 1 / 0, n = null, r = 0;
  for (const u of oo) {
    let d = ((e - u.a.x) * u.dx + (t - u.a.z) * u.dz) / u.l2;
    d = d < 0 ? 0 : d > 1 ? 1 : d;
    const h = u.a.x + u.dx * d, p = u.a.z + u.dz * d, x = (e - h) * (e - h) + (t - p) * (t - p);
    x < o && (o = x, n = u, r = d);
  }
  const a = Math.sqrt(o), c = rn(e, t);
  if (!c && a > he) return null;
  const { a: i, b: l } = n, f = (u, d) => u + (d - u) * r;
  return { d: c ? a : -a, bank: f(i.bank, l.bank), dr: f(i.dr, l.dr), dm: f(i.dm, l.dm), cr: f(i.cr, l.cr), fa: f(i.fa, l.fa), hi: f(i.hi ?? po, l.hi ?? po), ho: f(i.ho ?? mo, l.ho ?? mo), arc: n.s0 + n.len * r };
}
function ps(e, t) {
  return e < Yt.x0 - 1 || e > Yt.x1 + 1 || t < Yt.z0 - 1 || t > Yt.z1 + 1 ? false : rn(e, t);
}
function ms(e, t, o) {
  if (!o || o.d >= 0) return -1 / 0;
  const n = -o.d, r = Math.sin(o.arc * 0.062) * 4 + Math.sin(o.arc * 0.148 + 1.7) * 1.8, a = Math.max(2, hs + r), c = o.cr * (1 + 0.09 * Math.sin(o.arc * 0.091 + 0.4)), i = c / Math.max(0.08, o.bank);
  return n <= i ? ct + o.bank * n : n <= i + a ? ct + c : ct + c - (n - i - a) * o.fa;
}
const xs = [{ a: [143, -44], b: [157, -37], crest: 6.3, half: 3.4, face: 0.5 }], ws = xs.map((e) => {
  const t = e.b[0] - e.a[0], o = e.b[1] - e.a[1];
  return { d: e, dx: t, dz: o, l2: t * t + o * o || 1e-6 };
});
function ys(e, t) {
  let o = -1 / 0;
  for (const n of ws) {
    let r = ((e - n.d.a[0]) * n.dx + (t - n.d.a[1]) * n.dz) / n.l2;
    r = r < 0 ? 0 : r > 1 ? 1 : r;
    const a = n.d.a[0] + n.dx * r, c = n.d.a[1] + n.dz * r, i = Math.hypot(e - a, t - c), l = i <= n.d.half ? n.d.crest : n.d.crest - (i - n.d.half) * n.d.face;
    l > o && (o = l);
  }
  return o;
}
const bs = [{ id: "spill", half: 1.6, wall: 0.9, pts: [[158.6, -42.6, ct + 0.3], [157.4, -38.8, ct + 0.05], [155.6, -34.6, 3.1], [153.4, -31.4, 3], [151, -29, 2.95]] }, { id: "outfall", half: 1.9, wall: 0.7, pts: [[151, -29, 2.95], [143, -27.4, 2.2], [134, -26.6, 1.4], [124, -26.2, 0.55], [116, -26, 0.1], [110, -25.4, -0.1]] }, { id: "inflowSW", half: 1.2, wall: 0.8, pts: [[158, -127, ct - 0.3], [
154, -133, ct + 0.7], [149, -140, ct + 2.4], [144, -147, ct + 4.4]] }, { id: "inflowE", half: 0.9, wall: 0.8, pts: [[250.6, -90, ct - 0.25], [256, -89, ct + 0.9], [262, -87, ct + 2.6]] }], ln = [];
for (const e of bs) for (let t = 0; t < e.pts.length - 1; t++) {
  const o = e.pts[t], n = e.pts[t + 1], r = n[0] - o[0], a = n[1] - o[1];
  ln.push({ c: e, a: o, b: n, dx: r, dz: a, l2: r * r + a * a || 1e-6 });
}
function gs(e, t) {
  let o = 1 / 0;
  for (const n of ln) {
    let r = ((e - n.a[0]) * n.dx + (t - n.a[1]) * n.dz) / n.l2;
    r = r < 0 ? 0 : r > 1 ? 1 : r;
    const a = n.a[0] + n.dx * r, c = n.a[1] + n.dz * r, i = Math.hypot(e - a, t - c);
    if (i > n.c.half + 8) continue;
    const l = n.a[2] + (n.b[2] - n.a[2]) * r, f = i <= n.c.half ? l : l + (i - n.c.half) * n.c.wall;
    f < o && (o = f);
  }
  return o;
}
function Ms(e, t, o, n) {
  const r = cn(t, o);
  if (!r) return e;
  let a = e;
  const c = -1.3, i = (d) => d === -1 / 0 ? -1 / 0 : c + (d - c) * n, l = i(ys(t, o));
  l > a && (a = l);
  const f = i(ms(t, o, r));
  if (f > a && (a = f), r.d >= 0) {
    const d = Ut(r.d / r.dr, 0, 1);
    a = ct - r.dm * d * d * (3 - 2 * d);
  } else {
    const d = -r.d, h = ct + r.bank * d, p = h < a ? h : a, x = gt(r.hi, r.ho, d);
    a = p + (a - p) * x;
  }
  const u = gs(t, o);
  return u < a ? u : a;
}
function vs(e, t, o) {
  const n = cn(e, t);
  if (!n) return 1;
  if (n.d > -2) return 0;
  const r = Ut((-n.d - 2) / 10, 0, 1), a = Ut((o - ct - 0.9) / 2.4, 0, 1);
  return r < a ? r : a;
}
const ft = 1.5, zs = 2.6, We = 21, ks = [{ x: 24, z: -116, rx: 76, rz: 30, h: 8 }, { x: 72, z: -112, rx: 50, rz: 26, h: 7 }, { x: -30, z: -114, rx: 54, rz: 26, h: 7 }, { x: 30, z: -140, rx: 66, rz: 56, h: 16.5 }, { x: -26, z: -136, rx: 60, rz: 52, h: 14 }, { x: 86, z: -134, rx: 58, rz: 50, h: 14.5 }, { x: 22, z: -162, rx: 80, rz: 40, h: 17 }, { x: -84, z: -150, rx: 62, rz: 48, h: 14 }, { x: 104, z: -164,
rx: 56, rz: 44, h: 14.5 }, { x: -124, z: -122, rx: 44, rz: 46, h: 12.5 }, { x: 124, z: -118, rx: 44, rz: 46, h: 12.5 }, { x: -118, z: -88, rx: 46, rz: 44, h: 13 }, { x: -122, z: -52, rx: 44, rz: 34, h: 13.5 }, { x: -112, z: 16, rx: 46, rz: 56, h: 17 }, { x: -140, z: 24, rx: 28, rz: 30, h: 13.5 }, { x: -90, z: 26, rx: 26, rz: 28, h: 12 }, { x: -108, z: 56, rx: 42, rz: 32, h: 12.5 }, { x: -98, z: 84,
rx: 36, rz: 26, h: 9.5 }, { x: 118, z: -84, rx: 44, rz: 42, h: 12.5 }, { x: 124, z: -48, rx: 42, rz: 32, h: 12.5 }, { x: 122, z: 20, rx: 42, rz: 34, h: 12.5 }, { x: 110, z: 58, rx: 38, rz: 30, h: 11 }, { x: 102, z: 88, rx: 34, rz: 26, h: 8.5 }, { x: 123, z: -13, rx: 60, rz: 15, h: 13 }, { x: 170, z: -26, rx: 46, rz: 30, h: 11.5 }, { x: 214, z: -24, rx: 46, rz: 30, h: 11 }, { x: 252, z: -36, rx: 34,
rz: 32, h: 10 }, { x: 266, z: -76, rx: 34, rz: 42, h: 11 }, { x: 258, z: -118, rx: 34, rz: 34, h: 10.5 }, { x: 214, z: -152, rx: 56, rz: 34, h: 11.5 }, { x: 158, z: -146, rx: 42, rz: 32, h: 11 }, { x: 188, z: -106, rx: 21, rz: 18, h: 11 }], dn = [{ x0: -68, x1: 88, z0: -80, z1: 114, r: 13 }, { x0: -6, x1: 94, z0: -96, z1: -60, r: 13 }, { x0: -84, x1: -64, z0: -32, z1: 4, r: 11 }], Ee = [{ id: "W",
x0: -132, x1: -96, zS: -15, zN: 24, zCrest: 2, crestMid: 17, crestEnd: 12.2, half: 3.3, spring: 3.2, arch: 3.3, walk: -1, bank: 1, narrowChannel: false, gateX: -84.5 }, { id: "E", x0: 108, x1: 138, zS: -15, zN: 21, zCrest: 0, crestMid: 13.2, crestEnd: 11.4, half: 3.3, spring: 3.2, arch: 3.3, walk: 1, bank: 0, narrowChannel: true, gateX: 85 }], fn = Ee.map((e) => ({ x0: e.x0, x1: e.x1, z0: e.zS, z1: e.
zN })), ht = -112, te = 200, pt = -128, ee = 72, Ss = (e) => gt(-196, -170, e);
function Gs(e, t) {
  let o = 1;
  for (const n of ks) {
    const r = (e - n.x) / n.rx, a = (t - n.z) / n.rz, c = r * r + a * a;
    if (c >= 1) continue;
    const i = n.h * (1 - c) * (1 - c);
    if (o *= 1 - i / We, o <= 0) return We;
  }
  return We * (1 - o);
}
const xo = (e, t) => {
  let o = 0;
  for (const n of Ee) if (!(t && !t(n)) && (o = Math.max(o, gt(n.x0 - 44, n.x0 - 20, e) * gt(n.x1 + 44, n.x1 + 20, e)), o >= 1)) return 1;
  return o;
}, As = (e) => e.narrowChannel, wo = 8, Ts = (e) => gt(qe - wo, qe, e) * gt($e + wo, $e, e);
function Cs(e, t) {
  const o = gt(7.5, 16 - 6.5 * xo(e), Math.abs(t)), n = 1 - Ts(e) * (1 - gt(6.5, 14 - 3 * xo(e, As), Math.abs(t - tn.z)));
  let r = Math.min(o, n);
  if (r <= 0) return 0;
  for (const a of dn) {
    const c = Math.max(a.x0 - e, e - a.x1, 0), i = Math.max(a.z0 - t, t - a.z1, 0);
    if (r *= gt(0, a.r, Math.hypot(c, i)), r <= 0) return 0;
  }
  return r;
}
function Bs(e, t) {
  for (const o of fn) if (e > o.x0 && e < o.x1 && t > o.z0 && t < o.z1) return true;
  return false;
}
function Is(e, t) {
  return Jo(((e & 1023) << 10 ^ t & 1023) + 40503)() - 0.5;
}
const Rs = (() => {
  const e = at(778213), t = [];
  for (let n = 0; n < 170; n++) {
    const r = e.range(-166, 166), a = e.range(-190, 104), c = e.range(7, 21);
    t.push({ x: r, z: a, rx: c * e.range(0.7, 1.4), rz: c * e.range(0.7, 1.4), h: e.range(0.55, 2.05) * (e.chance(0.34) ? -1 : 1) });
  }
  const o = at(551907);
  for (let n = 0; n < 76; n++) {
    const r = o.range(158, 302), a = o.range(-190, 104), c = o.range(7, 21);
    t.push({ x: r, z: a, rx: c * o.range(0.7, 1.4), rz: c * o.range(0.7, 1.4), h: o.range(0.55, 2.05) * (o.chance(0.34) ? -1 : 1) });
  }
  return t;
})();
function Es(e, t) {
  let o = 0;
  for (const n of Rs) {
    const r = (e - n.x) / n.rx, a = (t - n.z) / n.rz, c = r * r + a * a;
    c >= 1 || (o += n.h * (1 - c) * (1 - c));
  }
  return o;
}
const Ps = (() => {
  const e = at(511903), t = [];
  for (let n = 0; n < 2400; n++) {
    const r = e.range(2.8, 6.8);
    t.push({ x: e.range(-168, 168), z: e.range(-194, 108), rx: r * e.range(0.75, 1.3), rz: r * e.range(0.75, 1.3), h: e.range(0.26, 0.78) * (e.chance(0.42) ? -1 : 1) });
  }
  const o = at(613481);
  for (let n = 0; n < 1040; n++) {
    const r = o.range(2.8, 6.8);
    t.push({ x: o.range(158, 302), z: o.range(-194, 108), rx: r * o.range(0.75, 1.3), rz: r * o.range(0.75, 1.3), h: o.range(0.26, 0.78) * (o.chance(0.42) ? -1 : 1) });
  }
  return t;
})(), ie = 8, Ye = /* @__PURE__ */ new Map(), be = (e, t) => e * 4096 + t;
for (const e of Ps) {
  const t = Math.floor((e.x - e.rx) / ie), o = Math.floor((e.x + e.rx) / ie), n = Math.floor((e.z - e.rz) / ie), r = Math.floor((e.z + e.rz) / ie);
  for (let a = t; a <= o; a++) for (let c = n; c <= r; c++) {
    const i = be(a, c);
    let l = Ye.get(i);
    l || Ye.set(i, l = []), l.push(e);
  }
}
function Ds(e, t) {
  const o = Ye.get(be(Math.floor(e / ie), Math.floor(t / ie)));
  if (!o) return 0;
  let n = 0;
  for (const r of o) {
    const a = (e - r.x) / r.rx, c = (t - r.z) / r.rz, i = a * a + c * c;
    i >= 1 || (n += r.h * (1 - i) * (1 - i));
  }
  return n;
}
const Ls = (() => {
  const e = at(390211), t = [];
  for (let n = 0; n < 8e3; n++) {
    const r = e.range(1.4, 3.4);
    t.push({ x: e.range(-168, 168), z: e.range(-194, 108), rx: r * e.range(0.75, 1.3), rz: r * e.range(0.75, 1.3), h: e.range(0.1, 0.3) * (e.chance(0.45) ? -1 : 1) });
  }
  const o = at(728533);
  for (let n = 0; n < 3440; n++) {
    const r = o.range(1.4, 3.4);
    t.push({ x: o.range(158, 302), z: o.range(-194, 108), rx: r * o.range(0.75, 1.3), rz: r * o.range(0.75, 1.3), h: o.range(0.1, 0.3) * (o.chance(0.45) ? -1 : 1) });
  }
  return t;
})(), ce = 4, Xe = /* @__PURE__ */ new Map();
for (const e of Ls) {
  const t = Math.floor((e.x - e.rx) / ce), o = Math.floor((e.x + e.rx) / ce), n = Math.floor((e.z - e.rz) / ce), r = Math.floor((e.z + e.rz) / ce);
  for (let a = t; a <= o; a++) for (let c = n; c <= r; c++) {
    const i = be(a, c);
    let l = Xe.get(i);
    l || Xe.set(i, l = []), l.push(e);
  }
}
function _s(e, t) {
  const o = Xe.get(be(Math.floor(e / ce), Math.floor(t / ce)));
  if (!o) return 0;
  let n = 0;
  for (const r of o) {
    const a = (e - r.x) / r.rx, c = (t - r.z) / r.rz, i = a * a + c * c;
    i >= 1 || (n += r.h * (1 - i) * (1 - i));
  }
  return n;
}
const Ns = (() => {
  const e = at(20857), t = [];
  for (let n = 0; n < 1100; n++) {
    const r = e.range(6, 17);
    t.push({ x: e.range(-172, 172), z: e.range(-198, 112), rx: r * e.range(0.7, 1.45), rz: r * e.range(0.7, 1.45), h: e.range(0.5, 1.15) * (e.chance(0.5) ? -1 : 1) });
  }
  const o = at(884117);
  for (let n = 0; n < 470; n++) {
    const r = o.range(6, 17);
    t.push({ x: o.range(158, 306), z: o.range(-198, 112), rx: r * o.range(0.7, 1.45), rz: r * o.range(0.7, 1.45), h: o.range(0.5, 1.15) * (o.chance(0.5) ? -1 : 1) });
  }
  return t;
})(), ke = 24, yo = /* @__PURE__ */ new Map();
for (const e of Ns) {
  const t = Math.floor((e.x - e.rx) / ke), o = Math.floor((e.x + e.rx) / ke), n = Math.floor((e.z - e.rz) / ke), r = Math.floor((e.z + e.rz) / ke);
  for (let a = t; a <= o; a++) for (let c = n; c <= r; c++) {
    const i = be(a, c);
    let l = yo.get(i);
    l || yo.set(i, l = []), l.push(e);
  }
}
const bo = { main: [[18, -94.5], [15.4, -98.4], [10, -101], [1, -103.4], [-9, -105.6], [-19, -108.4], [-26.5, -112.6], [-24, -117.6], [-14, -120], [-3, -122.4], [8, -126.4], [17, -131], [24.6, -135.6]], ridge: [[24.6, -135.6], [17, -137.6], [8, -138.2], [-1, -137.4], [-10, -136.2], [-18, -135]], deck: [[24.6, -135.6], [29.6, -135.2], [35.4, -135.4]], hokora: [[-26.5, -112.6], [-32, -111], [-37, -112]],
glade: [[-14, -120], [-18, -124.5], [-16, -129]], foot: [[13, -97.4], [26, -97.6], [40, -98], [54, -98.4], [68, -98.2], [80, -96.6], [86, -93.8]], toverW: [[-66, 22], [-70, 25.5], [-75, 26], [-79.5, 23], [-82.5, 19], [-84.5, 15.5], [-86, 12]], toverE: [[91, -18.8], [97.5, -18.2], [104, -17.4], [106, -16.6], [99, -15.6], [97.8, -14.8], [100.6, -13.6], [101.4, -12.4], [104, -12]] }, Os = 1.1, Fs = 2.7,
go = { lakeRoad: { flat: 2.7, fade: 5, pts: [[89, -60, 0], [89, -46, 0], [90.4, -36.4, 0], [96, -33.6, 0], [104, -32.4, 0.1], [112, -31.6, 0.6], [120, -31.4, 1.7], [130, -32, 3], [139, -33, 4.1], [147, -34, 5.1], [153, -35.2, 5.8], [157, -37, 6.3]] }, damRoad: { flat: 3.2, fade: 4.6, pts: [[157, -37, 6.3], [152.6, -39.2, 6.3], [148, -41.5, 6.3], [143, -44, 6.2], [140.4, -48, 5.9]] }, shoreRoad: { flat: 2.6,
fade: 4.8, pts: [[139.4, -51.6], [134.6, -57], [131.4, -64], [130, -72], [130, -80], [131.8, -88], [134.8, -95.6], [138.8, -103], [144.2, -111.6], [150.6, -119.6], [158, -128], [166, -137], [173, -145.6], [179, -153.6], [186.4, -158.4], [195, -159.6], [203, -157], [209.4, -153.8]] }, shoreWalk: { flat: 1.5, fade: 3.4, pts: [[145.6, -53.6], [141.2, -58.4], [139.6, -64], [138.8, -71], [138.6, -79], [
139.8, -86], [142, -92.6], [144.4, -99.4], [145.2, -106], [147, -113], [151, -120.2], [157, -127], [165.4, -132.2], [175, -136.6], [185.4, -140.4], [196, -142.6], [206, -143.4], [216, -143.6], [226, -142], [235, -138], [242.4, -132], [247.4, -124], [251, -115], [253, -105], [253.6, -96], [252.6, -89]] }, mikaharashi: { flat: 1.2, fade: 2.9, pts: [[86, -95.4], [92, -95.6], [98, -95.8], [102.6, -96.8],
[106, -99.2], [109, -96.6], [112.4, -94.8], [115, -97.4], [117.6, -100.2], [120.6, -98], [123.2, -100.8], [124.6, -104.4], [123.8, -112.2], [127.4, -112], [130.4, -110.6], [133, -109], [134.8, -107.6], [137, -108.6], [139, -110.4], [141.6, -111.4], [143.8, -109.8], [145, -106.4]] }, pierSpur: { flat: 1.2, fade: 2.6, pts: [[139, -79.4], [141.4, -79.8]] }, suijinSpur: { flat: 1.1, fade: 2.5, pts: [[
252.6, -89], [252.8, -91.4]] } }, un = (() => {
  const e = [], t = (o, n, r, a, c) => {
    const i = n[0] - o[0], l = n[1] - o[1];
    e.push({ a: o, b: n, dx: i, dz: l, l2: i * i + l * l || 1e-6, flat: r, fade: a, given: c });
  };
  for (const o of Object.keys(bo)) {
    const n = bo[o];
    for (let r = 0; r < n.length - 1; r++) t(n[r], n[r + 1], Os, Fs, false);
  }
  for (const o of Object.keys(go)) {
    const n = go[o], r = n.pts[0].length > 2;
    for (let a = 0; a < n.pts.length - 1; a++) t(n.pts[a], n.pts[a + 1], n.flat, n.fade, r);
  }
  return e;
})();
function hn(e, t) {
  let o = 1e9, n = null, r = 0;
  for (const a of un) {
    let c = ((e - a.a[0]) * a.dx + (t - a.a[1]) * a.dz) / a.l2;
    c = c < 0 ? 0 : c > 1 ? 1 : c;
    const i = Math.hypot(e - (a.a[0] + a.dx * c), t - (a.a[1] + a.dz * c));
    i < o && (o = i, n = a, r = c);
  }
  return { d: o, seg: n, t: r };
}
function Vs(e, t) {
  const o = hn(e, t), n = o.seg.flat + 0.1, r = n + 2;
  return o.d <= n ? 0 : o.d >= r ? 1 : (o.d - n) / 2;
}
const Ws = (e, t) => (e & 1 ^ t & 1) === 1, Ie = te - ht + 1, yt = ee - pt + 1, Ct = new Float32Array(Ie * yt);
function Hs(e, t) {
  const o = Math.abs(t) < 24, n = Math.abs(t + 24) < 22;
  return o || n ? 1.9 : 0.52;
}
const He = -1.3 + 5e-3;
{
  const e = Bs;
  for (let o = ht; o <= te; o++) for (let n = pt; n <= ee; n++) {
    const r = o * ft, a = n * ft, c = Cs(r, a);
    Ct[(o - ht) * yt + (n - pt)] = e(r, a) ? -1.3 : Math.max(-1.3, Ms(Gs(r, a) * c * Ss(a) - zs, r, a, c));
  }
  const t = new Float32Array(Ie * yt);
  for (let o = ht; o <= te; o++) for (let n = pt; n <= ee; n++) t[(o - ht) * yt + (n - pt)] = Hs(o * ft, n * ft) * ft;
  for (let o = 0; o < 140; o++) {
    let n = false;
    for (let r = 0; r < Ie; r++) for (let a = 0; a < yt; a++) {
      const c = r * yt + a, i = Ct[c];
      if (i <= He) continue;
      let l = 1 / 0;
      for (let f = 0; f < 4; f++) {
        const u = r + (f === 0 ? 1 : f === 1 ? -1 : 0), d = a + (f === 2 ? 1 : f === 3 ? -1 : 0);
        if (u < 0 || u >= Ie || d < 0 || d >= yt) continue;
        const h = u * yt + d;
        l = Math.min(l, Ct[h] + Math.max(t[c], t[h]));
      }
      l < i && (Ct[c] = Math.max(-1.3, l), n = true);
    }
    if (!n) break;
  }
  for (let o = ht; o <= te; o++) for (let n = pt; n <= ee; n++) {
    const r = (o - ht) * yt + (n - pt), a = Ct[r];
    if (a <= He) continue;
    const c = o * ft, i = n * ft;
    if (e(c, i)) continue;
    const l = Math.max(0, Math.min(1, a / 2.4)), f = Math.max(0, Math.min(1, a / 1.6)), u = Math.max(0, Math.min(1, a / 0.7)), d = vs(c, i, a), h = Vs(c, i) * d;
    let p = Es(c, i) * l * (0.2 + 0.8 * d) + (Is(o, n) * 0.21 * l + Ds(c, i) * f + _s(c, i) * u) * h;
    a > 0 && p < -0.75 * a && (p = -0.75 * a), Ct[r] = Math.max(-1.3, a + p);
  }
  {
    const o = /* @__PURE__ */ new Map(), n = (r) => r[0] + "," + r[1];
    for (const r of un) for (const a of [r.a, r.b]) o.has(n(a)) || o.set(n(a), r.given ? a[2] : Us(a[0], a[1]));
    for (let r = ht; r <= te; r++) for (let a = pt; a <= ee; a++) {
      const c = (r - ht) * yt + (a - pt), i = Ct[c];
      if (i <= He) continue;
      const l = r * ft, f = a * ft;
      if (e(l, f)) continue;
      const u = hn(l, f);
      if (u.d >= u.seg.fade) continue;
      const { a: d, b: h } = u.seg, p = o.get(n(d)) + (o.get(n(h)) - o.get(n(d))) * u.t;
      if (p > i && js(l, f) || ps(l, f)) continue;
      const x = u.d <= u.seg.flat ? 1 : (u.seg.fade - u.d) / (u.seg.fade - u.seg.flat);
      Ct[c] = Math.max(-1.3, i + (p - i) * x);
    }
  }
}
function Se(e, t) {
  return e < ht || e > te || t < pt || t > ee ? -1.3 : Ct[(e - ht) * yt + (t - pt)];
}
function Us(e, t) {
  const o = Math.floor(e / ft), n = Math.floor(t / ft);
  if (o < ht || o >= te || n < pt || n >= ee) return -1.3;
  const r = e / ft - o, a = t / ft - n, c = Se(o, n), i = Se(o + 1, n), l = Se(o, n + 1), f = Se(o + 1, n + 1);
  return Ws(o, n) ? r + a <= 1 ? c + (i - c) * r + (l - c) * a : f + (f - l) * (r - 1) + (f - i) * (a - 1) : r >= a ? c + (i - c) * r + (f - i) * a : c + (f - l) * r + (l - c) * a;
}
function js(e, t) {
  for (const o of fn) if (e > o.x0 - 1 && e < o.x1 + 1 && t > o.z0 - 1 && t < o.z1 + 1) return false;
  if (Math.abs(t) < 7.5 || e > qe && e < $e && Math.abs(t - tn.z) < 6.5) return true;
  for (const o of dn) if (e >= o.x0 && e <= o.x1 && t >= o.z0 && t <= o.z1) return true;
  return false;
}
const pe = 1.44, Ks = 0.3, St = -mt / 2, _t = mt / 2, Mo = -150, vo = 150, zo = () => g({ color: b.railMetal, bands: 3, tint: 6248568, flat: false }), ko = () => g({ color: b.railHead, bands: 2, tint: 7301264 }), qs = () => g({ color: b.sleeper, bands: 3, tint: 6117496 }), $s = () => g({ color: b.ballast, bands: 3, tint: 6643076 }), Ys = () => g({ color: b.gateYellow, bands: 3, tint: 9400400 }), Xs = () => g(
{ color: b.gateBlack, bands: 2, tint: 4932960 }), pn = () => g({ color: b.metal, bands: 3, tint: 6709392 }), mn = () => g({ color: b.metalDark, bands: 3, tint: 6051456 }), So = () => g({ color: b.cabinet, bands: 3, tint: 7301264 }), Zs = () => g({ color: b.concrete, bands: 3, tint: 7301008 });
function Qs(e) {
  const t = new s.Group();
  t.name = "railway", e.add(t);
  {
    const a = new s.Shape();
    a.moveTo(-Mt - 0.9, 0), a.lineTo(-Mt, 0.26), a.lineTo(Mt, 0.26), a.lineTo(Mt + 0.9, 0), a.closePath();
    const c = new s.ExtrudeGeometry(a, { depth: _t - St, bevelEnabled: false });
    c.rotateY(Math.PI / 2), c.translate(St, 0, 0);
    const i = new s.Mesh(c, $s());
    i.receiveShadow = true, i.name = "ballast", t.add(i);
  }
  {
    const a = new s.BoxGeometry(0.24, 0.16, 2.5), c = Math.floor((_t - St) / 0.62), i = new s.InstancedMesh(a, qs(), c), l = new s.Object3D();
    let f = 0;
    for (let u = St; u < _t; u += 0.62) Math.abs(u) < F + K + 0.6 || (l.position.set(u, 0.32, 0), l.rotation.set(0, 0, 0), l.updateMatrix(), i.setMatrixAt(f++, l.matrix));
    i.count = f, i.receiveShadow = true, i.castShadow = true, t.add(i);
  }
  {
    const a = _t - St, c = xt([{ geometry: new s.BoxGeometry(a, 0.055, 0.115), matrix: S(0, 0.392, 0) }, { geometry: new s.BoxGeometry(a, 0.1, 0.05), matrix: S(0, 0.325, 0) }, { geometry: new s.BoxGeometry(a, 0.03, 0.17), matrix: S(0, 0.27, 0) }]);
    for (const i of [-1, 1]) {
      const l = new s.Mesh(c.clone(), zo());
      l.position.set((St + _t) / 2, 0, i * pe / 2), l.castShadow = true, l.receiveShadow = true, l.name = "rail", t.add(l);
      const f = L(a, 0.016, 0.09, ko(), (St + _t) / 2, 0.424, i * pe / 2);
      f.userData.noOutline = true, t.add(f);
    }
    c.dispose();
  }
  {
    const a = F * 2 + K * 2 + 1, c = U(0), i = g({ color: 14341599, bands: 3, tint: 7301008 }), l = L(a, 0.28, pe - 0.26, i, c, 0.18, 0);
    l.receiveShadow = true, t.add(l);
    for (const u of [-1, 1]) {
      const d = L(a, 0.28, 1.55, i, c, 0.18, u * (pe / 2 + 0.12 + 0.78));
      d.receiveShadow = true, t.add(d);
    }
    for (const u of [-1, 1]) {
      const d = u * pe / 2, h = L(a, 0.12, 0.115, zo(), c, 0.36, d);
      h.receiveShadow = true, t.add(h);
      const p = L(a, 0.016, 0.09, ko(), c, 0.424, d);
      p.userData.noOutline = true, t.add(p);
      for (const x of [-1, 1]) t.add(L(a, 0.06, 0.055, g({ color: 5064535, bands: 2, tint: 4275288 }), c, 0.33, d + x * 0.086));
    }
    const f = g({ color: b.lineYellow, bands: 2, tint: 9400400 });
    for (const u of [-1, 1]) {
      for (const [d, h] of [[0.42, 0.3], [0.92, 0.16]]) {
        const p = new s.PlaneGeometry(F * 2 - 0.15, h);
        p.rotateX(-Math.PI / 2);
        const x = new s.Mesh(p, f);
        x.position.set(c, 0.335, u * (Mt + d)), x.userData.noOutline = true, t.add(x);
      }
      for (let d = -5; d <= 5; d++) {
        const h = new s.PlaneGeometry(0.5, 0.11);
        h.rotateX(-Math.PI / 2), h.rotateY(Math.PI / 4);
        const p = new s.Mesh(h, f);
        p.position.set(c + d * 0.56, 0.333, u * (Mt + 0.67)), p.userData.noOutline = true, t.add(p);
      }
    }
  }
  const o = Mt + 1.05, n = F + K + 0.5;
  {
    const a = [], c = new s.BoxGeometry(1, 0.06, 0.06), i = new s.BoxGeometry(0.07, 1.12, 0.07), l = new s.BoxGeometry(0.035, 0.5, 0.035), f = (h, p, x) => {
      let y = [[p, x]];
      const v = [];
      for (const k of Ee) v.push([k.x0, k.x1]), Math.sign(h) === k.walk && v.push([k.gateX - 0.9, k.gateX + 0.9]);
      for (const [k, T] of v) {
        const m = [];
        for (const [M, w] of y) {
          if (T <= M || k >= w) {
            m.push([M, w]);
            continue;
          }
          k - M > 0.6 && m.push([M, k]), w - T > 0.6 && m.push([T, w]);
        }
        y = m;
      }
      return y.map(([k, T]) => [h, k, T]);
    }, u = [...f(o, Mo + 22, -n), ...f(o, n, vo - 22), ...f(-o, Mo + 22, -n), ...f(-o, n, 13.5), ...f(-o, 39.5, vo - 22)];
    for (const [h, p, x] of u) {
      const y = x - p, v = (p + x) / 2;
      for (const k of [0.55, 1.02]) a.push({ geometry: c, matrix: S(v, k, h, 0, 0, 0, y, 1, 1) });
      for (let k = p; k <= x; k += 2.4) a.push({ geometry: i, matrix: S(k, 0.56, h) });
      for (let k = p + 0.3; k <= x; k += 0.32) a.push({ geometry: l, matrix: S(k, 0.78, h) });
      e.collide(p, h - 0.12, x, h + 0.12, 1.2);
    }
    const d = new s.Mesh(xt(a), pn());
    d.castShadow = true, d.name = "linesideFence", t.add(d), [c, i, l].forEach((h) => h.dispose());
  }
  {
    const a = mn(), c = [], i = mt / Math.round(mt / 19), l = 0.02;
    for (let d = St + i; d <= _t - i * 0.5; d += i) {
      if (Math.abs(d) < 8 || Ee.some((p) => d > p.x0 - 16 && d < p.x1 + 16)) continue;
      const h = -3.6500000000000004;
      c.push({ geometry: new s.CylinderGeometry(0.09, 0.13, 6.6, 6), matrix: S(d, 3.3, h) }), c.push({ geometry: new s.BoxGeometry(0.1, 0.1, l - h), matrix: S(d, 6.1, (h + l) * 0.5) }), c.push({ geometry: new s.BoxGeometry(0.09, 1, 0.09), matrix: S(d, 5.6, l) }), c.push({ geometry: new s.CylinderGeometry(0.05, 0.05, 0.28, 6), matrix: S(d, 5.02, l) });
    }
    const f = new s.Mesh(xt(c), a);
    f.castShadow = true, t.add(f);
    const u = g({ color: b.metalDark, bands: 2, tint: 4867176 });
    for (const [d, h] of [[4.88, 0.022], [5.95, 0.026]]) {
      const p = [];
      for (let k = St; k <= _t; k += i) p.push(new s.Vector3(k, d - (d > 5 ? 0.12 : 0), l)), p.push(new s.Vector3(k + i * 0.5, d, l));
      const x = new s.CatmullRomCurve3(p), y = Math.round(mt / 2.5), v = new s.Mesh(new s.TubeGeometry(x, y, h, 4, false), u);
      v.name = "catenaryWire", t.add(v);
    }
  }
  const r = Js(e, t);
  ta(e, t);
  {
    const a = g({ color: b.concreteMid, bands: 3, tint: 6972040 }), c = [[Mt + 2.6, -80, -30], [Mt + 2.6, 46, 80], [-4.800000000000001, -80, -30], [-4.800000000000001, 44, 80]], i = g({ color: b.concrete, bands: 3, tint: 7301008 });
    for (const [l, f, u] of c) {
      const d = L(u - f, 2.2, 0.35, a, (f + u) / 2, 1.1, l);
      d.castShadow = true, d.receiveShadow = true, t.add(d), e.collide(f, l - 0.2, u, l + 0.2, 2.2);
      for (const h of [f, u]) {
        const x = h - (h === f ? 1 : -1) * 0.22, y = L(0.52, 2.52, 0.62, a, x, 1.26, l);
        y.castShadow = y.receiveShadow = true, t.add(y);
        const v = L(0.62, 0.1, 0.72, i, x, 2.57, l);
        v.receiveShadow = true, t.add(v), e.collide(x - 0.31, l - 0.36, x + 0.31, l + 0.36, 2.62);
      }
    }
  }
  return r;
}
function Js(e, t) {
  const o = new s.Group();
  o.name = "crossing", t.add(o);
  const n = U(0), r = Ys(), a = Xs(), c = pn(), i = mn(), l = So(), f = [], u = [];
  function d(m) {
    const M = new s.Group(), w = 0.52, z = Math.round(m / w), I = new s.BoxGeometry(w, 0.17, 0.09), A = [], G = [];
    for (let q = 0; q < z; q++) {
      const C = S(w * (q + 0.5), 0, 0);
      (q % 2 === 0 ? A : G).push({ geometry: I, matrix: C });
    }
    const E = new s.Mesh(xt(A), r), H = new s.Mesh(xt(G), a);
    E.castShadow = H.castShadow = true, M.add(E, H);
    for (let q = 1; q < z - 1; q += 3) {
      const C = L(0.11, 0.11, 0.07, D({ color: b.signalOff }), w * (q + 0.5), -0.14, 0.06);
      C.userData.lamp = "arm", f.push(C), M.add(C), M.add(L(0.03, 0.12, 0.03, i, w * (q + 0.5), -0.05, 0.06));
    }
    return bt(E, { thickness: 32e-4 }), bt(H, { thickness: 32e-4 }), I.dispose(), M;
  }
  function h(m, M, w) {
    const z = new s.Group(), I = n + m * (F + 0.42), A = M * Re;
    z.position.set(I, nt(), A), z.userData.planetRigid = true;
    const G = L(0.66, 0.2, 0.62, Zs(), 0, 0.1, 0);
    if (G.receiveShadow = G.castShadow = true, z.add(G), w === "arm") {
      const B = L(0.46, 0.92, 0.38, So(), 0, 0.66, 0);
      B.castShadow = B.receiveShadow = true, z.add(B), bt(B, { thickness: 34e-4 }), z.add(L(0.54, 0.07, 0.46, g({ color: b.cabinetTop, bands: 3 }), 0, 0.2 + 0.92 + 0.03, 0));
      for (let W = 0; W < 3; W++) z.add(L(0.48, 0.11, 0.4, W % 2 ? a : r, 0, 0.34 + W * 0.24, 0));
      const R = new s.Group();
      R.position.set(0, 0.2 + 0.92 + 0.12, M * 0.2), R.add(d(F * 2 + 0.5)), R.rotation.y = m > 0 ? Math.PI : 0, R.rotation.z = Math.PI / 2, z.add(R), u.push({ pivot: R }), z.add(L(0.2, 0.2, 0.14, i, 0, 0.2 + 0.92 + 0.12, M * 0.2));
    }
    const E = w === "arm" ? m * 0.44 : 0, H = 2.45, q = le(0.075, 0.09, H, 8, r, E, 0.2 + H / 2, 0);
    q.castShadow = true, z.add(q);
    for (let N = 0; N < 4; N++) z.add(le(0.082, 0.082, 0.22, 8, a, E, 0.42 + N * 0.56, 0));
    bt(q, { thickness: 32e-4 }), w === "arm" && z.add(L(0.5, 0.09, 0.09, i, E / 2, 0.2 + 0.5, 0));
    const C = new s.Group();
    C.position.set(E, 0.2 + H + 0.02, M * 0.02), C.rotation.y = M > 0 ? 0 : Math.PI, C.add(L(0.86, 0.13, 0.1, a, 0, 0.06, 0));
    for (const N of [-0.28, 0.28]) {
      const B = new s.Mesh(new s.CylinderGeometry(0.145, 0.16, 0.13, 12, 1, true), a);
      B.rotation.x = Math.PI / 2, B.position.set(N, -0.12, 0.07), C.add(B);
      const R = new s.Mesh(new s.CircleGeometry(0.16, 14), a);
      R.position.set(N, -0.12, 0), C.add(R);
      const W = new s.Mesh(new s.CircleGeometry(0.13, 14), D({ color: b.signalOff, cache: false }));
      W.position.set(N, -0.12, 0.135), W.userData.lamp = N < 0 ? "a" : "b", f.push(W), C.add(W);
    }
    const P = new s.Mesh(new s.SphereGeometry(0.13, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), c);
    if (P.rotation.x = Math.PI, P.position.set(0, 0.3, 0), C.add(P), z.add(C), w === "sign") {
      const N = [D({ color: b.wallWhite }), D({ color: b.wallWhite }), D({ color: b.wallWhite }), D({ color: b.wallWhite }), D({ color: 16777215, map: Dn(), cache: false }), D({ color: b.wallGray })], B = new s.Mesh(new s.BoxGeometry(1.15, 0.58, 0.05), N);
      B.position.set(0, 0.2 + H + 0.62, M * 0.05), B.rotation.y = M > 0 ? 0 : Math.PI, B.castShadow = true, z.add(B), bt(B, { thickness: 3e-3 });
      for (const R of [0.72, -0.72]) {
        const W = L(1.2, 0.15, 0.045, r, 0, 0.2 + H + 1.28, M * 0.05);
        W.rotation.z = R, W.castShadow = true, z.add(W);
      }
      z.add(le(0.06, 0.07, 1.3, 8, r, 0, 0.2 + H + 0.65, 0));
    }
    return o.add(z), e.collide(I - 0.4, A - 0.35, I + 0.4, A + 0.35, 2.4), z;
  }
  h(-1, 1, "arm"), h(1, -1, "arm"), h(1, 1, "sign"), h(-1, -1, "sign");
  {
    const m = -Re - 1.15, M = n - (F + 1.5), w = L(0.78, 1.32, 0.5, l, M, nt() + 0.66, m);
    w.castShadow = w.receiveShadow = true, o.add(w), bt(w, { thickness: 3e-3 });
    const z = L(0.86, 0.08, 0.58, g({ color: b.cabinetTop, bands: 3 }), M, nt() + 1.36, m);
    o.add(z);
    const I = L(0.52, 0.9, 0.4, l, M - 0.9, nt() + 0.45, m + 0.1);
    I.castShadow = I.receiveShadow = true, o.add(I), o.add(L(0.6, 0.06, 0.46, g({ color: b.cabinetTop, bands: 3 }), M - 0.9, nt() + 0.93, m + 0.1)), o.add(L(0.02, 1, 0.02, g({ color: b.metalDark, bands: 2 }), M, nt() + 0.66, m - 0.26));
    const A = L(0.07, 0.07, 0.03, D({ color: b.signalRed }), M + 0.24, nt() + 1.16, m - 0.26);
    o.add(A), e.collide(M - 1.3, m - 0.4, M + 0.5, m + 0.4, nt() + 1.4);
    const G = L(0.3, 0.4, 0.12, g({ color: b.yellow, bands: 3 }), M, nt() + 1, m - 0.3);
    G.castShadow = true, o.add(G);
    const E = L(0.9, 1.6, 0.9, D({ color: 16711680, cache: false }), M, nt() + 0.8, m);
    E.visible = false, o.add(E), e.interact({ hitbox: E, label: "\u8E0F\u5207\u30B9\u30A4\u30C3\u30C1  \xB7  call a train", action: () => T.request?.() });
  }
  {
    const m = g({ color: b.concrete, bands: 3, tint: 7301008 });
    for (const M of [-1, 1]) {
      const w = n + M * (F + 0.15), z = L(0.34, 0.16, Mt * 2 + 1.6, m, w, nt() + 0.08, 0);
      z.receiveShadow = true, z.castShadow = true, o.add(z);
      for (const I of [-1, 1]) {
        const A = new s.Mesh(new s.PlaneGeometry(1.35, 0.6), g({ color: 16777215, bands: 2, map: Qo(true), tint: 9400400, cache: false }));
        A.rotation.x = -Math.PI / 2, A.position.set(n + M * (F + 0.82), nt() + jt + 0.016, I * (Ht + 0.32)), o.add(A);
      }
    }
  }
  const p = new s.Color(b.signalRed), x = new s.Color(b.signalOff), y = f.filter((m) => m.userData.lamp === "arm"), v = f.filter((m) => m.userData.lamp === "a"), k = f.filter((m) => m.userData.lamp === "b");
  for (const m of f) m.material = m.material.clone();
  const T = { group: o, arms: u, active: false, armT: 0, _blink: 0, request: null, setLamps(m, M) {
    const w = m && M < 0.5 ? p : x, z = m && M >= 0.5 ? p : x;
    v.forEach((A) => A.material.color.copy(w)), k.forEach((A) => A.material.color.copy(z));
    const I = m && M < 0.5 ? p : x;
    y.forEach((A) => A.material.color.copy(I));
  }, setArms(m) {
    this.armT = m;
    const M = m < 0.5 ? 2 * m * m : 1 - Math.pow(-2 * m + 2, 2) / 2;
    for (const w of u) w.pivot.rotation.z = (1 - M) * (Math.PI / 2) * 0.99 + 4e-3;
  } };
  return T.setLamps(false, 0), T.setArms(0), T;
}
function ta(e, t, o) {
  const n = new s.Group();
  n.name = "station", t.add(n);
  const r = 15.5, a = 38, c = -1.92, i = c - 3.7, l = 0.98, f = g({ color: b.concrete, bands: 3, tint: 7301008 }), u = g({ color: b.concreteMid, bands: 3, tint: 6972040 }), d = L(a - r, l, c - i, f, (r + a) / 2, l / 2, (c + i) / 2);
  d.castShadow = d.receiveShadow = true, n.add(d), e.platform({ x0: r, x1: a, z0: i, z1: c, top: l }), e.collide(r - 0.1, i - 0.1, a + 0.1, c + 0.1, l), n.add(L(a - r, 0.06, 0.34, u, (r + a) / 2, l - 0.02, c - 0.17));
  const h = new s.Mesh(new s.PlaneGeometry(a - r - 1, 0.46), g({ color: 16777215, bands: 2, map: Qo(), tint: 9400400, cache: false }));
  h.material.map.repeat.set((a - r - 1) / 0.46, 1), h.material.map.wrapS = s.RepeatWrapping, h.rotation.x = -Math.PI / 2, h.position.set((r + a) / 2, l + 0.012, c - 0.62), n.add(h);
  {
    const x = (r + a) / 2 + 1.5, y = 9.5, v = 3.2, k = [];
    for (const M of [x - y / 2 + 0.6, x + y / 2 - 0.6]) for (const w of [c - 0.9, i + 0.7]) k.push({ geometry: new s.CylinderGeometry(0.075, 0.075, 2.6, 8), matrix: S(M, l + 1.3, w) });
    const T = new s.Mesh(xt(k), g({ color: b.metalDark, bands: 3 }));
    T.castShadow = true, n.add(T);
    const m = L(y, 0.16, v, g({ color: b.roofTeal, bands: 3, tint: 4867176 }), x, l + 2.66, (c + i) / 2 - 0.1);
    m.castShadow = m.receiveShadow = true, n.add(m), n.add(L(y + 0.3, 0.1, 0.14, g({ color: b.metal, bands: 3 }), x, l + 2.56, (c + i) / 2 - 1.75)), bt(m, { thickness: 3e-3 });
    for (const M of [x - 2.2, x + 1.4]) {
      const w = new s.Group();
      w.add(L(1.7, 0.08, 0.42, g({ color: b.wallCream, bands: 3 }), 0, 0.42, 0)), w.add(L(1.7, 0.5, 0.07, g({ color: b.wallCream, bands: 3 }), 0, 0.66, -0.2));
      for (const z of [-0.7, 0.7]) w.add(L(0.1, 0.42, 0.36, g({ color: b.metalDark, bands: 3 }), z, 0.21, 0));
      w.position.set(M, l, i + 0.95), w.traverse((z) => {
        z.isMesh && (z.castShadow = true);
      }), n.add(w);
    }
  }
  for (const x of [r + 4, a - 4.5]) {
    const y = le(0.06, 0.06, 2.2, 8, g({ color: b.metalDark, bands: 3 }), x, l + 1.1, c - 0.55);
    y.castShadow = true, n.add(y);
    const v = new s.Mesh(new s.BoxGeometry(1.9, 0.5, 0.06), [D({ color: b.wallWhite }), D({ color: b.wallWhite }), D({ color: b.wallWhite }), D({ color: b.wallWhite }), D({ color: 16777215, map: Ln(), cache: false }), D({ color: b.wallGray })]);
    v.position.set(x, l + 2.25, c - 0.55), v.castShadow = true, n.add(v), bt(v, { thickness: 3e-3 });
  }
  {
    const x = [];
    for (let v = r; v <= a; v += 2.2) x.push({ geometry: new s.BoxGeometry(0.08, 1.2, 0.08), matrix: S(v, l + 0.6, i + 0.06) });
    for (const v of [l + 0.5, l + 1.1]) x.push({ geometry: new s.BoxGeometry(a - r, 0.06, 0.06), matrix: S((r + a) / 2, v, i + 0.06) });
    const y = new s.Mesh(xt(x), g({ color: b.metal, bands: 3 }));
    y.castShadow = true, n.add(y);
  }
  {
    for (let y = 0; y < 6; y++) {
      const v = l * ((6 - y) / 6), k = r - 0.18 - y * 0.36, T = L(0.36, v, 2.4, f, k, v / 2, i + 1.3);
      T.castShadow = T.receiveShadow = true, n.add(T), e.platform({ x0: k - 0.21, x1: k + 0.21, z0: i + 0.1, z1: i + 2.5, top: v });
    }
    for (const y of [i + 0.1, i + 2.5]) {
      const v = L(2.4, 0.07, 0.07, g({ color: b.metal, bands: 3 }), r - 1.2, 0.95, y);
      v.rotation.z = 0.36, n.add(v);
    }
  }
  for (const x of [r + 2.5, (r + a) / 2 - 3.5, a - 2]) {
    const y = le(0.055, 0.055, 3.1, 8, g({ color: b.metalDark, bands: 3 }), x, l + 1.55, i + 0.5);
    y.castShadow = true, n.add(y);
    const v = new s.Mesh(new s.ConeGeometry(0.26, 0.22, 10, 1, true), g({ color: b.wallGray, bands: 3 }));
    v.position.set(x, l + 3.05, i + 0.5), n.add(v), n.add(L(0.18, 0.05, 0.18, D({ color: 16774100 }), x, l + 2.92, i + 0.5));
  }
  const p = new s.Mesh(new s.BoxGeometry(0.36, 0.72, 0.04), [D({ color: b.wallGray }), D({ color: b.wallGray }), D({ color: b.wallGray }), D({ color: b.wallGray }), D({ color: 16777215, map: Zo(1), cache: false }), D({ color: b.wallGray })]);
  return p.position.set(r + 8.5, l + 1, i + 0.02), p.rotation.y = Math.PI, n.add(p), n;
}
const Nt = 19.4, it = 2.86, Go = 20.1, Ot = 1.06, Gt = 3.74, me = 3.96, ea = 4.88, V = {};
function oa() {
  V.body || (V.body = g({ color: b.trainBody, bands: 3, tint: 7301014 }), V.bodyShade = g({ color: b.trainBodyShade, bands: 3, tint: 7301014 }), V.stripe = g({ color: b.trainStripe, bands: 3, tint: 4868754 }), V.stripe2 = g({ color: b.trainStripe2, bands: 3, tint: 4151946 }), V.roof = g({ color: b.trainRoof, bands: 3, tint: 6314367 }), V.skirt = g({ color: b.trainSkirt, bands: 3, tint: 5985408 }),
  V.window = D({ color: b.trainWindow }), V.windowLit = D({ color: b.trainWindowLit }), V.door = g({ color: b.trainDoor, bands: 3, tint: 7301014 }), V.dark = g({ color: b.black, bands: 2, tint: 4932960 }), V.metal = g({ color: b.metalDark, bands: 3, tint: 6051456 }), V.wheel = g({ color: 4867410, bands: 2, tint: 4932960 }), V.headlight = D({ color: 16774874 }), V.tail = D({ color: 16734794 }));
}
const na = [-7, -2.4, 2.4, 7], sa = 1.32, aa = [[-8.5, 1.7], [-4.7, 3.2], [0, 3.4], [4.7, 3.2], [8.5, 1.7]];
function Ao(e, t, o, n, r) {
  const i = n * (it / 2 + 0.032), l = new s.Mesh(new s.PlaneGeometry(o, 3.16 - 2.16), V.window);
  l.position.set(t, (2.16 + 3.16) / 2, i), l.rotation.y = n > 0 ? 0 : Math.PI, l.userData.noOutline = true, e.add(l), r.next();
  const f = 3.16 - 2.16, u = (h, p, x, y) => {
    const v = new s.Mesh(new s.PlaneGeometry(o - 0.06, p), D({ color: x }));
    return v.position.set(t, 2.16 + f * h, i + n * y), v.rotation.y = n > 0 ? 0 : Math.PI, v.userData.noOutline = true, e.add(v), v;
  };
  u(0.14, f * 0.28, 5331570, 0.018), u(0.3, 0.035, 10463419, 0.021), u(0.72, 0.045, 12173516, 0.021), u(0.93, 0.07, 15788760, 0.018);
  const d = new s.Mesh(new s.PlaneGeometry(o * 0.2, (3.16 - 2.16) * 0.95), D({ color: 14674678, transparent: true, opacity: 0.13, depthWrite: false }));
  d.position.set(t - o * 0.2, (2.16 + 3.16) / 2, i + n * 0.012), d.rotation.set(0, n > 0 ? 0 : Math.PI, 0.24), d.userData.noOutline = true, e.add(d);
}
function ra({ cab: e = false, tail: t = false, rng: o }) {
  const n = new s.Group(), r = { body: [], stripe: [], roof: [], skirt: [], door: [], dark: [], metal: [] }, a = Gt - Ot;
  r.body.push({ geometry: new s.BoxGeometry(Nt, a, it), matrix: S(0, (Ot + Gt) / 2, 0) }), r.roof.push({ geometry: new s.BoxGeometry(Nt - 0.1, me - Gt, it - 0.24), matrix: S(0, (Gt + me) / 2, 0) });
  for (const d of [-1, 1]) r.roof.push({ geometry: new s.BoxGeometry(Nt - 0.05, 0.07, 0.1), matrix: S(0, Gt + 0.02, d * (it / 2 - 0.06)) });
  const c = 1.92, i = 0.34;
  r.stripe.push({ geometry: new s.BoxGeometry(Nt + 0.02, i, it + 0.03), matrix: S(0, c, 0) }), r.stripe.push({ geometry: new s.BoxGeometry(Nt + 0.02, 0.07, it + 0.04), matrix: S(0, c - i / 2 - 0.055, 0) }), r.skirt.push({ geometry: new s.BoxGeometry(Nt - 0.3, 0.5, it - 0.34), matrix: S(0, Ot - 0.25, 0) }), r.skirt.push({ geometry: new s.BoxGeometry(Nt - 1.6, 0.28, it - 0.8), matrix: S(0, Ot - 0.52,
  0) });
  for (const d of [1, -1]) {
    for (const h of na) r.door.push({ geometry: new s.BoxGeometry(sa, Gt - Ot - 0.12, 0.05), matrix: S(h, (Ot + Gt) / 2 - 0.02, d * (it / 2 + 0.012)) }), r.dark.push({ geometry: new s.BoxGeometry(0.05, Gt - Ot - 0.12, 0.06), matrix: S(h, (Ot + Gt) / 2 - 0.02, d * (it / 2 + 0.02)) }), Ao(n, h, 0.94, d, o);
    for (const [h, p] of aa) r.metal.push({ geometry: new s.BoxGeometry(p + 0.12, 1.14, 0.035), matrix: S(h, 2.66, d * (it / 2 + 8e-3)) }), Ao(n, h, p, d, o);
  }
  for (const d of [-6.3, 6.3]) r.metal.push({ geometry: new s.BoxGeometry(2.9, 0.42, it - 0.9), matrix: S(d, 0.78, 0) }), r.dark.push({ geometry: new s.BoxGeometry(3.3, 0.2, 0.28), matrix: S(d, 0.62, 0) });
  for (const d of [-5.6, -1.4, 3.2, 7.4]) r.roof.push({ geometry: new s.BoxGeometry(2.1, 0.3, 1.5), matrix: S(d, me + 0.13, d % 2 === 0 ? 0.18 : -0.18) });
  for (const d of [-8.2, 0.6, 8.6]) r.metal.push({ geometry: new s.BoxGeometry(0.7, 0.16, 0.7), matrix: S(d, me + 0.07, -0.7) });
  if (e || t) {
    const d = e ? 1 : -1, h = d * (Nt / 2);
    r.dark.push({ geometry: new s.BoxGeometry(0.1, 1.34, it - 0.22), matrix: S(h + d * 0.03, 2.86, 0) });
    for (const y of [-0.72, 0.72]) {
      const v = new s.Mesh(new s.PlaneGeometry(1.16, 1.02), V.window);
      v.position.set(h + d * 0.085, 2.88, y), v.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2, v.userData.noOutline = true, n.add(v);
      const k = new s.Mesh(new s.PlaneGeometry(0.3, 0.98), D({ color: 15003384, transparent: true, opacity: 0.16, depthWrite: false }));
      k.position.set(h + d * 0.095, 2.88, y - 0.26), k.rotation.set(0, d > 0 ? Math.PI / 2 : -Math.PI / 2, 0.26), k.userData.noOutline = true, n.add(k);
    }
    r.body.push({ geometry: new s.BoxGeometry(0.12, 1.4, 0.16), matrix: S(h + d * 0.05, 2.86, 0) });
    const p = new s.Mesh(new s.PlaneGeometry(1.5, 0.38), D({ color: 16777215, map: _n(), cache: false }));
    p.position.set(h + d * 0.09, 3.52, 0), p.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2, p.userData.noOutline = true, n.add(p), r.dark.push({ geometry: new s.BoxGeometry(0.08, 0.5, 1.66), matrix: S(h + d * 0.04, 3.52, 0) });
    for (const y of [-1.06, 1.06]) {
      r.dark.push({ geometry: new s.BoxGeometry(0.14, 0.42, 0.5), matrix: S(h + d * 0.05, 1.55, y) });
      const v = new s.Mesh(new s.PlaneGeometry(0.34, 0.16), e ? V.headlight : V.tail);
      v.position.set(h + d * 0.13, 1.63, y), v.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2, v.userData.noOutline = true, n.add(v);
      const k = new s.Mesh(new s.PlaneGeometry(0.34, 0.14), e ? V.tail : V.headlight);
      k.position.set(h + d * 0.13, 1.44, y), k.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2, k.userData.noOutline = true, n.add(k);
    }
    r.skirt.push({ geometry: new s.BoxGeometry(0.34, 0.78, it - 0.5), matrix: S(h + d * 0.1, 0.82, 0) }), r.dark.push({ geometry: new s.BoxGeometry(0.5, 0.22, 0.34), matrix: S(h + d * 0.25, 0.62, 0) });
    const x = new s.Mesh(new s.PlaneGeometry(0.8, 0.24), D({ color: 16777215, map: Nn(), cache: false }));
    x.position.set(h - d * 1.4, 1.42, it / 2 + 0.02), x.userData.noOutline = true, n.add(x);
  }
  const l = { body: V.body, stripe: V.stripe, roof: V.roof, skirt: V.skirt, door: V.door, dark: V.dark, metal: V.metal };
  for (const d of Object.keys(r)) {
    if (!r[d].length) continue;
    const h = new s.Mesh(xt(r[d]), l[d]);
    h.castShadow = true, h.receiveShadow = true, n.add(h), (d === "body" || d === "roof" || d === "skirt") && bt(h, { thickness: 34e-4 });
  }
  const f = [], u = new s.CylinderGeometry(0.43, 0.43, 0.14, 12);
  u.rotateX(Math.PI / 2);
  for (const d of [-6.3, 6.3]) for (const h of [-1.05, 1.05]) for (const p of [-0.72, 0.72]) {
    const x = new s.Group();
    x.position.set(d + h, Ks + 0.43, p), x.userData.planetRigid = true;
    const y = new s.Group();
    x.add(y);
    const v = new s.Mesh(u, V.wheel);
    v.castShadow = true, y.add(v), f.push(y), n.add(x);
  }
  if (e || t) {
    const d = new s.Group();
    d.position.set(e ? -4 : 4, me + 0.05, 0), d.scale.y = (ea - d.position.y) / 1.64, d.add(L(1.5, 0.08, 1.5, V.metal, 0, 0.04, 0));
    for (const h of [-1, 1]) {
      const p = L(0.06, 0.9, 0.06, V.metal, h * 0.35, 0.5, 0);
      p.rotation.z = h * 0.55, d.add(p);
      const x = L(0.05, 0.78, 0.05, V.metal, h * 0.0575, 1.247, 0);
      x.rotation.z = h * 0.148, d.add(x);
    }
    d.add(L(0.1, 0.06, 1.3, V.dark, 0, 1.6, 0)), d.add(L(0.24, 0.05, 1.34, V.metal, 0, 1.64, 0)), d.traverse((h) => {
      h.isMesh && (h.castShadow = true);
    }), n.add(d);
  }
  return { car: n, wheels: f };
}
function ia(e) {
  oa();
  const t = at(5150), o = new s.Group();
  o.name = "train", o.visible = false, e.add(o);
  const n = [], r = [];
  for (let l = 0; l < 3; l++) {
    const { car: f, wheels: u } = ra({ cab: l === 0, tail: l === 2, rng: t });
    f.position.x = (l - 1) * Go, o.add(f), r.push(f), n.push(...u);
  }
  const a = new s.Matrix4().makeTranslation(st.x, st.y, st.z), c = new s.Matrix4().makeTranslation(-st.x, -st.y, -st.z);
  return { group: o, cars: r, wheels: n, length: Go * 3, dir: 1, x: 0, speed: 23.5, gust: 0, get offset() {
    return on(this.x, 0);
  }, planetize() {
    o.visible = true, o.matrixAutoUpdate = false, this.update(0);
  }, update(l) {
    this.x = vt(this.x + this.dir * this.speed * l), o.matrix.makeRotationZ(-this.x / Z).premultiply(a).multiply(c), o.matrixWorldNeedsUpdate = true;
    const f = this.speed * l / 0.43;
    for (const d of this.wheels) d.rotation.z -= f * this.dir;
    const u = Math.max(0, 1 - Math.abs(this.offset) / 46);
    this.gust = Math.max(this.gust * Math.exp(-l * 1.4), u * u);
  } };
}
const xe = 980, To = 6.8, Ge = -30, Ae = 34, Ft = 9.5;
function ca(e) {
  const t = at(8123), o = Fn(), n = new s.PlaneGeometry(0.185, 0.135), r = [{ color: b.petal, n: Math.round(xe * 0.55) }, { color: b.blossomLight, n: Math.round(xe * 0.28) }, { color: b.petalDeep, n: xe - Math.round(xe * 0.55) - Math.round(xe * 0.28) }], a = [], c = [];
  for (const p of r) {
    const x = D({ color: p.color, map: o, transparent: true, opacity: 0.95, depthWrite: false, side: s.DoubleSide, alphaTest: 0.32, cache: false }), y = new s.InstancedMesh(n, x, p.n);
    y.instanceMatrix.setUsage(s.DynamicDrawUsage), y.frustumCulled = false, y.renderOrder = 4, y.userData.noOutline = true, e.add(y), a.push(y);
    for (let v = 0; v < p.n; v++) c.push({ mesh: y, idx: v, x: t.range(-Ft, Ft), y: t.range(0.2, To), z: t.range(Ge, Ae), fall: t.range(0.42, 0.86), swayAmp: t.range(0.25, 0.75), swayFreq: t.range(0.5, 1.35), phase: t.range(0, 10), spin: new s.Vector3(t.range(-1, 1), t.range(-1, 1), t.range(-1, 1)).normalize(), spinRate: t.range(0.5, 2.4), angle: t.range(0, 6.28), scale: t.range(0.78, 1.25), drift: t.
    range(-0.16, 0.16) });
  }
  const i = new s.Object3D(), l = new s.Quaternion(), f = new s.Vector3();
  let u = 0;
  function d(p) {
    p.x = t.range(-Ft, Ft), p.z = t.range(Ge, Ae), p.y = To + t.range(0, 1.4), p.phase = t.range(0, 10);
  }
  function h(p, x, y) {
    u += p;
    const v = x * 5.4 * y, k = x * 1.5;
    for (let T = 0; T < c.length; T++) {
      const m = c[T], M = Math.sin(u * m.swayFreq + m.phase), w = Math.sin(u * m.swayFreq * 2.7 + m.phase * 1.7);
      m.y -= (m.fall + x * 0.4) * p, m.x += (m.swayAmp * M * 0.55 + m.drift + v * 0.24) * p, m.z += (m.swayAmp * w * 0.32 + v * 0.05) * p, m.y += k * Math.max(0, 1 - Math.abs(m.z) / 8) * p, m.angle += m.spinRate * p * (1 + x);
      const z = U(m.z);
      m.x < z - Ft && (m.x = z + Ft), m.x > z + Ft && (m.x = z - Ft), m.z < Ge && (m.z = Ae), m.z > Ae && (m.z = Ge), m.y < nt(m.z) + 0.04 && d(m), l.setFromAxisAngle(m.spin, m.angle), i.position.set(m.x, m.y, m.z), i.quaternion.copy(l), f.setScalar(m.scale), i.scale.copy(f), i.updateMatrix(), m.mesh.setMatrixAt(m.idx, i.matrix);
    }
    for (const T of a) T.instanceMatrix.needsUpdate = true;
  }
  for (let p = 0; p < 40; p++) h(0.1, 0, 1);
  return la(e, o), { update: h, meshes: a };
}
function la(e, t) {
  const o = at(4471), n = new s.PlaneGeometry(0.17, 0.125);
  n.rotateX(-Math.PI / 2);
  const r = [b.petal, b.blossomLight, b.petalDeep], a = [[], [], []], c = new s.Object3D(), i = (l, f, u) => {
    c.position.set(l, u + 0.019, f), c.rotation.set(0, o.range(0, 6.28), 0);
    const d = o.range(0.8, 1.25);
    c.scale.set(d, 1, d), c.updateMatrix(), a[o.int(0, 2)].push(c.matrix.clone());
  };
  for (let l = 0; l < 620; l++) {
    const f = o.range(-26, 32), u = U(f), d = nt(), h = o.next();
    if (h < 0.42) {
      const p = o.sign();
      i(u + p * o.range(2.35, 3.12), f, d);
    } else if (h < 0.62) {
      const p = o.sign();
      i(u + p * o.range(3.2, 4.6), f, d + 0.135);
    } else if (h < 0.78) {
      const p = o.range(-2.4, 2.4);
      i(u + o.range(-3.1, 3.1), p, 0.32);
    } else i(u + o.range(-3, 3), f, d);
  }
  a.forEach((l, f) => {
    if (!l.length) return;
    const u = new s.InstancedMesh(n, D({ color: r[f], map: t, transparent: true, opacity: 0.9, depthWrite: false, alphaTest: 0.32, cache: false }), l.length);
    l.forEach((d, h) => u.setMatrixAt(h, d)), u.renderOrder = 2, u.userData.noOutline = true, e.add(u);
  });
}
const Ue = /* @__PURE__ */ new Map();
function ge(e, t, o, n) {
  if (Ue.has(e)) return Ue.get(e);
  const r = document.createElement("canvas");
  r.width = t, r.height = o, n(r.getContext("2d"), t, o);
  const a = new s.CanvasTexture(r);
  return a.colorSpace = s.SRGBColorSpace, a.anisotropy = 4, Ue.set(e, a), a;
}
const xn = "'Segoe UI', 'Noto Sans', system-ui, sans-serif", wn = `'Noto Sans Telugu', 'Gautami', ${xn}`;
function It(e, t, o, n, r, a, c, i = 700, l = xn) {
  let f = Math.min(a, 100);
  e.textAlign = "center", e.textBaseline = "middle";
  do
    e.font = `${i} ${f}px ${l}`, f -= 2;
  while (e.measureText(t).width > r && f > 8);
  e.fillStyle = c, e.fillText(t, o, n);
}
function da(e, { bg: t = "#1d4e9c", fg: o = "#ffffff", name: n, telugu: r = "", strip: a = null }) {
  return ge("fascia:" + e, 512, 128, (c, i, l) => {
    c.fillStyle = t, c.fillRect(0, 0, i, l), c.strokeStyle = "rgba(0,0,0,.35)", c.lineWidth = 6, c.strokeRect(4, 4, i - 8, l - 8), r ? (It(c, r, i / 2, l * 0.28, i - 40, 40, o, 700, wn), It(c, n, i / 2, l * 0.7, i - 40, 44, o, 800)) : It(c, n, i / 2, l * 0.5, i - 40, 52, o, 800), a && (c.fillStyle = a, c.fillRect(0, l - 10, i, 10)), c.fillStyle = "rgba(255,255,255,.05)", c.fillRect(i * 0.12, l * 0.1,
    i * 0.3, 6), c.fillRect(i * 0.55, l * 0.86, i * 0.35, 5);
  });
}
function fa() {
  return ge("templeBoard", 768, 192, (e, t, o) => {
    e.fillStyle = "#f4f1e8", e.fillRect(0, 0, t, o), e.strokeStyle = "#6e1f1f", e.lineWidth = 10, e.strokeRect(6, 6, t - 12, o - 12), It(e, "\u0C36\u0C43\u0C02\u0C17\u0C47\u0C30\u0C3F \u0C36\u0C02\u0C15\u0C30 \u0C2E\u0C20\u0C02", t / 2, o * 0.3, t - 60, 56, "#6e1f1f", 700, wn), It(e, "SRINGERI SHANKAR MATH \xB7 NALLAKUNTA", t / 2, o * 0.72, t - 60, 38, "#6e1f1f", 800);
  });
}
function ua() {
  return ge("busStop", 512, 192, (e, t, o) => {
    e.fillStyle = "#f4ede0", e.fillRect(0, 0, t, o), e.fillStyle = "#1d4e9c", e.fillRect(0, 0, t, 62), It(e, "BUS STOP", t / 2, 32, t - 40, 40, "#ffffff", 800), It(e, "NALLAKUNTA", t / 2, 96, t - 40, 44, "#22303f", 800), It(e, "107 \xB7 113 \xB7 116J", t / 2, 152, t - 40, 36, "#8a3b2f", 700);
  });
}
function ha() {
  return ge("roadName", 512, 128, (e, t, o) => {
    e.fillStyle = "#0f3d22", e.fillRect(0, 0, t, o), e.strokeStyle = "#f4ede0", e.lineWidth = 5, e.strokeRect(6, 6, t - 12, o - 12), It(e, "NALLAKUNTA MAIN ROAD", t / 2, o / 2, t - 44, 46, "#f4ede0", 800);
  });
}
function pa() {
  return ma("divider", 128, 32, (e, t, o) => {
    e.fillStyle = "#f2c53d", e.fillRect(0, 0, t, o), e.fillStyle = "#2b2b30";
    for (let n = -1; n < 4; n++) e.beginPath(), e.moveTo(n * 40, o), e.lineTo(n * 40 + 20, 0), e.lineTo(n * 40 + 40, 0), e.lineTo(n * 40 + 20, o), e.closePath(), e.fill();
  });
}
function ma(e, t, o, n) {
  const r = ge(e, t, o, n);
  return r.wrapS = r.wrapT = s.RepeatWrapping, r;
}
function xa(e) {
  const t = new s.Group();
  t.name = "mainRoad", e.add(t);
  const o = g({ color: b.road, bands: 3, tint: 7036528, flat: false }), n = g({ color: b.sidewalk, bands: 3, tint: 8022642, flat: false }), r = g({ color: b.sidewalkAlt, bands: 3, tint: 8022642, flat: false }), a = g({ color: b.curb, bands: 2, tint: 7036528 }), c = g({ color: 13218452, bands: 3, tint: 9072478, flat: false }), i = 0.012;
  for (const [l, f] of [[Kt, -Ht], [Ht, qt]]) {
    const u = re({ z0: l, z1: f, step: 1.6, a: (h) => ({ x: U(h) - F, y: i }), b: (h) => ({ x: U(h) + F, y: i }) }), d = new s.Mesh(u, o);
    d.receiveShadow = true, t.add(d);
  }
  {
    const l = pa(), f = new s.MeshBasicMaterial({ map: l, transparent: false });
    for (const [u, d] of [[Kt, -Ht], [Ht, qt]]) {
      const h = re({ z0: u, z1: d, step: 1.6, a: (x) => ({ x: U(x) - 0.14, y: i + 4e-3 }), b: (x) => ({ x: U(x) + 0.14, y: i + 4e-3 }), uv: [0.55, 2.2] }), p = new s.Mesh(h, f);
      p.userData.noShadow = true, t.add(p);
    }
  }
  for (const l of [-1, 1]) for (const [f, u] of [[Kt, -Ht], [Ht, qt]]) {
    const d = (T) => U(T) + l * F, h = (T) => U(T) + l * (F + K), p = re({ z0: f, z1: u, step: 1.6, a: (T) => ({ x: d(T), y: jt }), b: (T) => ({ x: h(T), y: jt }) }), x = new s.Mesh(p, l < 0 ? n : r);
    x.receiveShadow = true, t.add(x);
    const y = re({ z0: f, z1: u, step: 1.6, a: (T) => ({ x: d(T), y: 0 }), b: (T) => ({ x: d(T), y: jt }), flip: l > 0 }), v = new s.Mesh(y, a);
    t.add(v);
    const k = re({ z0: f, z1: u, step: 1.6, a: (T) => ({ x: h(T), y: -0.02 }), b: (T) => ({ x: h(T), y: jt }), flip: l < 0 });
    t.add(new s.Mesh(k, a));
  }
  for (const l of [-1, 1]) {
    const f = re({ z0: Kt, z1: qt, step: 2, a: (d) => ({ x: U(d) + l * (F + K), y: 4e-3 }), b: (d) => ({ x: U(d) + l * (F + K + 3.4), y: 4e-3 }) }), u = new s.Mesh(f, c);
    u.receiveShadow = true, t.add(u);
  }
  return t;
}
const Ze = F + K + 0.55, _ = {};
function yn() {
  return _.done || (_.done = true, _.walls = [15983816, 15258542, 14673106, 15784128, 15129796, 14213348, 15653304, 14995392].map((e) => g({ color: e, bands: 3, tint: 9072480 })), _.trim = g({ color: 11573888, bands: 2, tint: 7035472 }), _.roof = g({ color: 12101776, bands: 3, tint: 7035472 }), _.roofDark = g({ color: 9075302, bands: 3, tint: 5983298 }), _.door = g({ color: 6047282, bands: 2, tint: 3812904 }),
  _.shutter = g({ color: 8226964, bands: 3, tint: 5265003 }), _.glass = D({ color: 4872816 }), _.grill = g({ color: 4934482, bands: 2, tint: 3816010 }), _.tank = g({ color: 3026483, bands: 3, tint: 3816010 }), _.awningA = g({ color: 13126460, bands: 3, tint: 8010298 }), _.awningB = g({ color: 3112299, bands: 3, tint: 2771530 }), _.ac = g({ color: 14210508, bands: 2, tint: 9079446 })), _;
}
function Co(e, t) {
  const o = t.side || 1;
  yn();
  const n = new s.Group(), { x: r, z: a, w: c, d: i, h: l, sign: f } = t, u = _.walls[t.wall % _.walls.length], d = new s.Mesh(new s.BoxGeometry(i, l, c), u);
  d.position.set(r - o * i / 2, l / 2, a), n.add(d);
  const h = new s.Mesh(new s.BoxGeometry(i + 0.15, 0.42, c + 0.15), _.trim);
  h.position.set(r - o * i / 2, l + 0.18, a), n.add(h);
  const p = new s.Mesh(new s.CylinderGeometry(0.55, 0.55, 0.9, 12), _.tank);
  p.position.set(r - o * (i / 2 - 0.6), l + 0.85, a - c * 0.22), n.add(p);
  const x = new s.Mesh(new s.SphereGeometry(0.34, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), _.ac);
  if (x.rotation.x = Math.PI / 3, x.position.set(r - o * (i / 2 + 0.8), l + 0.55, a + c * 0.25), n.add(x), f) {
    const w = da(f.key, f), z = [_.trim, _.trim, _.trim, _.trim, _.trim, _.trim];
    z[o > 0 ? 0 : 1] = new s.MeshBasicMaterial({ map: w });
    const I = new s.Mesh(new s.BoxGeometry(0.12, 1, c * 0.92), z);
    I.position.set(r + o * 0.06, l - 1.45, a), n.add(I);
  }
  const y = c * 0.44, v = new s.Mesh(new s.BoxGeometry(0.08, 2.3, y), _.shutter);
  v.position.set(r + o * 0.02, 1.15, a - c * 0.18), n.add(v);
  for (let w = 0; w < 6; w++) {
    const z = new s.Mesh(new s.BoxGeometry(0.03, 0.035, y), _.grill);
    z.position.set(r + o * 0.07, 0.45 + w * 0.36, a - c * 0.18), n.add(z);
  }
  const k = new s.Mesh(new s.BoxGeometry(0.08, 2.1, c * 0.26), _.door);
  if (k.position.set(r + o * 0.02, 1.05, a + c * 0.24), n.add(k), t.awning) {
    const w = new s.Mesh(new s.BoxGeometry(1.5, 0.06, c * 0.8), t.awning === "a" ? _.awningA : _.awningB);
    w.rotation.z = -0.28 * o, w.position.set(r + o * 0.72, 2.62, a), n.add(w);
  }
  for (const w of [-c * 0.22, c * 0.22]) {
    const z = new s.Mesh(new s.BoxGeometry(0.06, 1.15, 0.95), _.glass);
    z.position.set(r + o * 0.03, l - 2.6, a + w), n.add(z);
    for (let I = -2; I <= 2; I++) {
      const A = new s.Mesh(new s.BoxGeometry(0.02, 1.15, 0.035), _.grill);
      A.position.set(r + o * 0.06, l - 2.6, a + w + I * 0.19), n.add(A);
    }
  }
  const T = new s.Mesh(new s.BoxGeometry(0.32, 0.5, 0.7), _.ac);
  T.position.set(r + o * 0.18, l - 0.65, a - c * 0.34), n.add(T), Qt(n), e.add(n);
  const m = o > 0 ? r - i : r, M = o > 0 ? r : r + i;
  return e.collide(m, a - c / 2, M, a + c / 2, l), n;
}
function wa(e, t) {
  yn();
  const o = new s.Group(), { x: n, z: r, w: a, d: c, h: i } = t, l = _.walls[t.wall % _.walls.length], f = new s.Mesh(new s.BoxGeometry(c, i, a), l);
  if (f.position.set(n - c / 2, i / 2, r), o.add(f), t.roof === "slope") {
    const d = new s.Mesh(new s.CylinderGeometry(0.02, a * 0.62, 1.15, 4, 1), _.roofDark);
    d.rotation.y = Math.PI / 4, d.scale.z = c / (a * 0.62) * 0.5, d.position.set(n - c / 2, i + 0.56, r), o.add(d);
  } else {
    const d = new s.Mesh(new s.BoxGeometry(c + 0.14, 0.36, a + 0.14), _.trim);
    d.position.set(n - c / 2, i + 0.15, r), o.add(d);
    const h = new s.Mesh(new s.CylinderGeometry(0.5, 0.5, 0.8, 10), _.tank);
    h.position.set(n - c / 2 + 0.5, i + 0.75, r - a * 0.2), o.add(h);
  }
  const u = new s.Mesh(new s.BoxGeometry(0.07, 1.9, 0.9), _.door);
  u.position.set(n + 0.035, 0.95, r + a * 0.18), o.add(u);
  for (const d of [-a * 0.22]) {
    const h = new s.Mesh(new s.BoxGeometry(0.06, 1, 0.9), _.glass);
    h.position.set(n + 0.03, 1.55, r + d), o.add(h);
    for (let p = -2; p <= 2; p++) {
      const x = new s.Mesh(new s.BoxGeometry(0.02, 1, 0.03), _.grill);
      x.position.set(n + 0.055, 1.55, r + d + p * 0.18), o.add(x);
    }
  }
  return Qt(o), e.add(o), e.collide(n - c, r - a / 2, n, r + a / 2, i), o;
}
const ya = [{ key: "pharmacy", name: "SAINCE PHARMACY", telugu: "", bg: "#0d7a4d", fg: "#ffffff" }, { key: "dental", name: "M K DENTAL LAB", telugu: "", bg: "#27407a", fg: "#e8e4d8" }, { key: "courier", name: "INTERNATIONAL COURIER & CARGO", telugu: "", bg: "#8a1f1f", fg: "#ffd94d" }, null, null, null, null, null];
function ba(e) {
  let t = 6;
  ya.forEach((r, a) => {
    Co(e, { x: U(t + 5 / 2) + Ze, z: t + 5 / 2, w: 5, d: 7.2, h: a % 3 === 2 ? 4.6 : 6.4, wall: a, sign: r, awning: a % 2 === 0 ? "a" : a % 3 === 0 ? "b" : null, side: -1 }), t += 5 + 0.15;
  });
  const o = [{ key: "tiffins", name: "SRI SIDDHARTHA TIFFIN CENTRE", telugu: "\u0C1F\u0C3F\u0C2B\u0C3F\u0C28\u0C4D \u0C38\u0C46\u0C02\u0C1F\u0C30\u0C4D", bg: "#b3312c", fg: "#ffffff" }, { key: "textiles", name: "DIWAN TEXTILES", telugu: "", bg: "#5b2d8e", fg: "#f4e28a" }];
  let n = 42;
  o.forEach((r, a) => {
    Co(e, { x: U(n + 5 / 2) - Ze - 3.6, z: n + 5 / 2, w: 5, d: 7.2, h: 4.6, wall: a + 2, sign: r, awning: a === 0 ? "b" : null, side: 1 }), n += 5 + 0.15;
  });
}
function ga(e) {
  const t = [{ x: -1, z: -10, w: 7, d: 6.5, h: 3.6, wall: 1, roof: "flat" }, { x: -1, z: -19, w: 6, d: 7, h: 4.8, wall: 3, roof: "slope" }, { x: -1, z: -28, w: 8, d: 7, h: 3.4, wall: 5, roof: "flat" }, { x: -1, z: -38, w: 6.5, d: 6.5, h: 4.2, wall: 2, roof: "flat" }, { x: -1, z: -52, w: 7.5, d: 7, h: 3.8, wall: 6, roof: "slope" }, { x: 1, z: -12, w: 6.5, d: 7, h: 3.5, wall: 4, roof: "flat" }, { x: 1,
  z: -24, w: 7, d: 6.5, h: 5.2, wall: 0, roof: "flat" }, { x: 1, z: -34, w: 6, d: 7, h: 3.6, wall: 7, roof: "slope" }, { x: 1, z: -48, w: 7, d: 7, h: 4.4, wall: 2, roof: "flat" }, { x: 1, z: 52, w: 7, d: 7, h: 4, wall: 1, roof: "flat" }, { x: 1, z: 62, w: 6.5, d: 6.5, h: 3.5, wall: 3, roof: "slope" }, { x: -1, z: 58, w: 7, d: 7, h: 4.6, wall: 0, roof: "flat" }];
  for (const o of t) {
    const n = U(o.z) + o.x * (Ze + 3.4);
    wa(e, { ...o, x: n });
  }
}
const Bo = F + K + 0.65, Vt = 13, At = 41, ut = 27, Tt = 1.5;
function Ma() {
  const e = document.createElement("canvas");
  e.width = e.height = 256;
  const t = e.getContext("2d");
  t.clearRect(0, 0, 256, 256), t.fillStyle = "rgba(255,255,255,0.92)";
  const o = (r, a, c = 3.2) => {
    t.beginPath(), t.arc(r, a, c, 0, 7), t.fill();
  };
  for (let r = 0; r < 9; r++) for (let a = 0; a < 9; a++) o(28 + r * 25 + (a % 2 ? 12 : 0), 28 + a * 25);
  t.strokeStyle = "rgba(255,255,255,0.9)", t.lineWidth = 4, t.beginPath(), t.moveTo(128, 12), t.lineTo(244, 128), t.lineTo(128, 244), t.lineTo(12, 128), t.closePath(), t.stroke();
  const n = new s.CanvasTexture(e);
  return n.colorSpace = s.SRGBColorSpace, n;
}
function va(e) {
  const t = new s.Group();
  t.name = "shankarMutt", e.add(t);
  const o = U(ut), n = o - Bo, r = o - Bo - 17, a = g({ color: 15133415, bands: 3, tint: 8292996 }), c = g({ color: 11878446, bands: 3, tint: 7027252 }), i = g({ color: 15855592, bands: 3, tint: 9079428 }), l = g({ color: 14198844, bands: 3, tint: 9071146, emissive: 6901268, emissiveIntensity: 0.25 }), f = g({ color: 7216927, bands: 3, tint: 4857888 }), u = g({ color: 15787208, bands: 3, tint: 9072478 }),
  d = g({ color: 11878446, bands: 3, tint: 7027252 }), h = g({ color: 14272932, bands: 3, tint: 8022610, flat: false }), p = 2.05, x = [{ x0: n, z0: Vt, x1: n + 0.35, z1: ut - Tt }, { x0: n, z0: ut + Tt, x1: n + 0.35, z1: At }, { x0: r, z0: Vt, x1: r + 0.35, z1: At }, { x0: r, z0: Vt, x1: n + 0.35, z1: Vt + 0.35 }, { x0: r, z0: At - 0.35, x1: n + 0.35, z1: At }];
  for (const j of x) {
    const X = Math.max(j.x1 - j.x0, 0.35), Dt = Math.max(j.z1 - j.z0, 0.35), Lt = new s.Mesh(new s.BoxGeometry(X, p, Dt), a);
    Lt.position.set((j.x0 + j.x1) / 2, p / 2, (j.z0 + j.z1) / 2), t.add(Lt);
    const kt = new s.Mesh(new s.BoxGeometry(X + 0.1, 0.14, Dt + 0.1), c);
    kt.position.set((j.x0 + j.x1) / 2, p + 0.05, (j.z0 + j.z1) / 2), t.add(kt), e.collide(j.x0 - 0.05, j.z0 - 0.05, j.x1 + 0.05, j.z1 + 0.05, p);
  }
  for (const j of [-1, 1]) {
    const X = ut + j * (Tt + 0.42), Dt = new s.Mesh(new s.BoxGeometry(0.85, 3.1, 0.85), i);
    Dt.position.set(n + 0.18, 1.55, X), t.add(Dt);
    const Lt = new s.Mesh(new s.BoxGeometry(1.05, 0.22, 1.05), c);
    Lt.position.set(n + 0.18, 3.2, X), t.add(Lt);
    const kt = new s.Mesh(new s.SphereGeometry(0.16, 10, 8), l);
    kt.position.set(n + 0.18, 3.46, X), t.add(kt), e.collide(n - 0.28, X - 0.45, n + 0.62, X + 0.45, 3.3);
  }
  const y = new s.Mesh(new s.BoxGeometry(0.7, 0.6, Tt * 2 + 2.4), i);
  y.position.set(n + 0.18, 3.6, ut), t.add(y);
  const v = new s.Mesh(new s.BoxGeometry(0.16, 0.9, Tt * 2 + 1.4), (() => {
    const j = fa();
    return [new s.MeshBasicMaterial({ map: j }), f, f, f, f, f];
  })());
  v.position.set(n + 0.46, 3.62, ut), t.add(v);
  const k = new s.Mesh(new s.TorusGeometry(Tt + 0.85, 0.3, 8, 20, Math.PI), i);
  k.position.set(n + 0.02, 3.42, ut), k.rotation.y = Math.PI / 2, t.add(k);
  const T = new s.Mesh(new s.TorusGeometry(Tt + 0.85, 0.36, 8, 20, Math.PI), f);
  T.position.set(n - 0.06, 3.38, ut), T.rotation.y = Math.PI / 2, t.add(T);
  for (const j of [-1, 1]) {
    const X = new s.Mesh(new s.BoxGeometry(0.06, 2.1, Tt * 0.9), f);
    X.position.set(n + 0.45, 1.05, ut + j * Tt * 0.78), X.rotation.y = j * 0.55, t.add(X);
  }
  const m = new s.Mesh(new s.BoxGeometry(n - r - 0.4, 0.06, At - Vt - 0.6), h);
  m.position.set((n + r) / 2, 0.03, (Vt + At) / 2), m.receiveShadow = true, t.add(m);
  const M = r + 5.2, w = (Vt + At) / 2, z = new s.Mesh(new s.BoxGeometry(6.4, 3.4, 9.4), u);
  z.position.set(M, 1.7, w), t.add(z);
  const I = new s.Mesh(new s.BoxGeometry(6.7, 0.3, 9.7), c);
  I.position.set(M, 3.5, w), t.add(I);
  const A = new s.Mesh(new s.BoxGeometry(0.1, 2.2, 1.5), D({ color: 3022872 }));
  A.position.set(M + 3.25, 1.1, w), t.add(A);
  const G = new s.Mesh(new s.BoxGeometry(0.14, 2.6, 2), l);
  G.position.set(M + 3.22, 1.3, w), G.scale.set(1, 1, 1), t.add(G), A.position.x = M + 3.3;
  let E = 3.4, H = 3.7;
  for (let j = 0; j < 4; j++) {
    const X = new s.Mesh(new s.BoxGeometry(E, 0.62, E * 1.25), j % 2 ? d : i);
    X.position.set(M - 0.6, H + 0.31, w), t.add(X), E *= 0.76, H += 0.66;
  }
  const q = new s.Mesh(new s.ConeGeometry(0.42, 1, 8), l);
  q.position.set(M - 0.6, H + 0.5, w), t.add(q), e.collide(M - 3.2, w - 4.7, M + 3.2, w + 4.7, 3.6);
  const C = n - 4.6, P = ut, N = new s.Mesh(new s.CylinderGeometry(0.55, 0.7, 0.5, 8), i);
  N.position.set(C, 0.25, P), t.add(N);
  const B = new s.Mesh(new s.CylinderGeometry(0.09, 0.13, 5.4, 8), l);
  B.position.set(C, 0.5 + 2.7, P), t.add(B);
  const R = new s.Mesh(new s.SphereGeometry(0.2, 10, 8), l);
  R.position.set(C, 6.1, P), t.add(R), e.collide(C - 0.55, P - 0.55, C + 0.55, P + 0.55, 1.2);
  const W = new s.Mesh(new s.BoxGeometry(0.7, 1, 0.7), c);
  W.position.set(M + 4.2, 0.5, w + 2.4), t.add(W);
  const et = new s.Mesh(new s.IcosahedronGeometry(0.55, 1), g({ color: 5214047, bands: 3, tint: 3825482 }));
  et.position.set(M + 4.2, 1.45, w + 2.4), t.add(et), e.collide(M + 3.85, w + 2.05, M + 4.55, w + 2.75, 1);
  for (const [j, X, Dt] of [[r + 2.5, Vt + 3.5, 2.6], [r + 3.5, At - 3.5, 2.2], [n - 6.5, At - 2.2, 1.8]]) {
    const Lt = new s.Mesh(new s.CylinderGeometry(0.22, 0.3, 3.4, 8), g({ color: 5916210, bands: 3, tint: 3812898 }));
    Lt.position.set(j, 1.7, X), t.add(Lt);
    const kt = new s.Mesh(new s.IcosahedronGeometry(Dt, 1), g({ color: 4156229, bands: 3, tint: 2771506 }));
    kt.position.set(j, 3.3 + Dt * 0.7, X), kt.scale.y = 0.82, t.add(kt);
  }
  const ae = new s.Mesh(new s.BoxGeometry(2.2, 2, 2.2), u);
  ae.position.set(M - 1, 1, w - 6.4), t.add(ae);
  const zt = new s.Mesh(new s.ConeGeometry(1.9, 1.5, 4), c);
  zt.rotation.y = Math.PI / 4, zt.position.set(M - 1, 2.75, w - 6.4), t.add(zt), e.collide(M - 2.1, w - 7.5, M + 0.1, w - 5.3, 2);
  const Pt = new s.Mesh(new s.PlaneGeometry(2.3, 2.3), new s.MeshBasicMaterial({ map: Ma(), transparent: true, depthWrite: false }));
  return Pt.rotation.x = -Math.PI / 2, Pt.position.set(n + 1.9, 0.062, ut), Pt.renderOrder = 2, t.add(Pt), Qt(t), { gatePos: { x: n + 0.6, z: ut }, hallDoor: { x: M + 3.4, z: w } };
}
const rt = {};
function bn() {
  return rt.pole || (rt.pole = g({ color: 14078680, bands: 3, tint: 6972040 }), rt.metal = g({ color: b.metal, bands: 3, tint: 6709392 }), rt.metalDark = g({ color: b.metalDark, bands: 3, tint: 6051456 }), rt.dark = g({ color: b.black, bands: 2, tint: 4932960 }), rt.wire = g({ color: 4998744, bands: 2, tint: 4275288 }), rt.red = g({ color: b.red, bands: 3, tint: 8011872 }), rt.white = g({ color: b.
  wallWhite, bands: 3, tint: 7301008 }), rt.concrete = g({ color: b.concrete, bands: 3, tint: 7301008 }), rt.concreteMid = g({ color: b.concreteMid, bands: 3, tint: 6972040 }), rt.terracotta = g({ color: 12941914, bands: 3, tint: 7296640 }), rt.leaf = g({ color: b.leaf, bands: 3, tint: 5992332 }), rt.leafDeep = g({ color: b.leafDeep, bands: 3, tint: 5992332 })), rt;
}
function za(e = {}) {
  const t = bn(), o = at(e.seed ?? 5), n = new s.Group(), r = e.h ?? 9.2, a = { pole: [], metal: [], dark: [], white: [] }, c = (d, h, p) => a[d].push({ geometry: h, matrix: p });
  c("pole", new s.CylinderGeometry(0.11, 0.19, r, 8), S(0, r / 2, 0)), c("pole", new s.CylinderGeometry(0.24, 0.28, 0.22, 8), S(0, 0.11, 0));
  const i = e.armYs ?? [r - 0.55, r - 1.5], l = e.armDir ?? 1;
  if (i.forEach((d, h) => {
    const p = h === 0 ? 2.1 : 1.7;
    c("dark", new s.BoxGeometry(0.09, 0.1, p), S(0, d, 0)), c("metal", new s.BoxGeometry(0.06, 0.5, 0.06), S(0, d - 0.3, 0));
    for (let x = -1; x <= 1; x++) x === 0 && h === 1 || (c("white", new s.CylinderGeometry(0.06, 0.075, 0.16, 7), S(0, d + 0.13, x * p / 2.4)), c("metal", new s.CylinderGeometry(0.02, 0.02, 0.14, 5), S(0, d + 0.04, x * p / 2.4)));
  }), e.transformer !== false) {
    const d = r - 2.9;
    c("metal", new s.BoxGeometry(0.5, 0.14, 1.5), S(l * 0.34, d + 0.62, 0));
    for (const h of [-0.42, 0.42]) c("metal", new s.CylinderGeometry(0.24, 0.24, 0.72, 10), S(l * 0.34, d + 0.24, h)), c("metal", new s.CylinderGeometry(0.26, 0.26, 0.06, 10), S(l * 0.34, d + 0.62, h));
    c("dark", new s.BoxGeometry(0.28, 0.5, 0.28), S(-l * 0.24, d + 1.1, 0));
  }
  c("dark", new s.CylinderGeometry(0.045, 0.045, r - 1.4, 5), S(l * 0.135, (r - 1.4) / 2, 0.06));
  const f = new s.Mesh(new s.CylinderGeometry(0.205, 0.21, 0.62, 12, 1, true, -1, 2), D({ color: 16777215, map: Zo(o.int(0, 2)), cache: false, side: s.DoubleSide }));
  if (f.position.set(0, 2.45, 0), f.rotation.y = e.plateFace ?? (l > 0 ? Math.PI / 2 : -Math.PI / 2), f.castShadow = true, n.add(f), e.lamp) {
    c("metal", new s.CylinderGeometry(0.05, 0.05, 1.3, 6), S(l * 0.65, r - 3.9, 0, 0, 0, Math.PI / 2));
    const d = new s.Mesh(new s.ConeGeometry(0.32, 0.26, 12, 1, true), t.metal);
    d.position.set(l * 1.28, r - 4.02, 0), n.add(d);
    const h = L(0.26, 0.05, 0.26, D({ color: 16773840 }), l * 1.28, r - 4.16, 0);
    n.add(h);
  }
  const u = { pole: t.pole, metal: t.metal, dark: t.dark, white: t.white };
  for (const d of Object.keys(a)) {
    if (!a[d].length) continue;
    const h = new s.Mesh(xt(a[d]), u[d]);
    h.castShadow = true, h.receiveShadow = true, n.add(h), d === "pole" && bt(h, { thickness: 34e-4 });
  }
  return n.position.set(e.x, e.y ?? 0, e.z), n.userData.top = (e.y ?? 0) + r, n;
}
function ka(e, t) {
  const o = bn(), n = [];
  for (const c of t) {
    const { points: i, sag: l = 0.5, r: f = 0.026 } = c;
    for (let u = 0; u < i.length - 1; u++) {
      const d = i[u], h = i[u + 1], p = d.distanceTo(h), x = Hn(d, h, l * Math.min(1.6, p / 14), 12);
      n.push(new s.TubeGeometry(x, 14, f, 4, false));
    }
  }
  if (!n.length) return null;
  const r = n.length === 1 ? n[0] : xt(n.map((c) => ({ geometry: c }))), a = new s.Mesh(r, o.wire);
  return a.name = "wires", a.material = o.wire, e.add(a), n.forEach((c) => c !== r && c.dispose()), a;
}
const Wt = (e, t, o = 0) => new s.Vector3(e, t, o), Sa = 0.018;
Wt(-0.52, 0.33 + Sa), Wt(0.55, 0.33), Wt(-0.1, 0.28), Wt(-0.27, 0.86), Wt(0.44, 0.6), Wt(0.49, 0.86), Wt(0.46, 0.97), Wt(-0.31, 1);
function Ga(e) {
  const t = at(9021), o = [], n = [];
  for (let c = -70; c <= 72; c += 15.5) n.push(c + t.range(-1.2, 1.2));
  let r = -1;
  for (const c of n) {
    if (Math.abs(c) < 5.5) continue;
    const i = U(c) + r * (F + K - 0.28), l = za({ seed: c * 31 | 0, h: 8.6, armDir: -r });
    l.position.set(i, e.groundAt(i, c), c), e.add(l), Qt(l), e.collide(i - 0.22, c - 0.22, i + 0.22, c + 0.22, 8.6), o.push({ x: i, z: c, side: r }), r = -r;
  }
  const a = [];
  for (const c of [-1, 1]) {
    const i = o.filter((l) => l.side === c);
    for (const l of [0, -0.9]) {
      const f = i.map((u) => new s.Vector3(u.x, e.groundAt(u.x, u.z) + 8 + l, u.z));
      f.length > 1 && a.push({ points: f, sag: 0.55 });
    }
  }
  for (const c of [10, 26, 44, -16, -34]) {
    const i = U(c);
    a.push({ points: [new s.Vector3(i - (F + K - 0.28), 8.1, c), new s.Vector3(i + (F + K + 2.6), 6.4, c + 0.8)], sag: 0.7 });
  }
  a.push({ points: [new s.Vector3(U(-24) - 4.4, 7.9, -24), new s.Vector3(U(-6) - 4.5, 4.6, -6)], sag: 0.9 }), ka(e, a);
}
function Aa(e) {
  const t = new s.Group(), o = -14, n = U(o) + F + K - 0.2, r = g({ color: 4877964, bands: 3, tint: 3820126 }), a = g({ color: 3626606, bands: 3, tint: 3029582 });
  for (const f of [-1.6, 1.6]) {
    const u = new s.Mesh(new s.CylinderGeometry(0.06, 0.06, 2.5, 8), r);
    u.position.set(n, 1.25, o + f), t.add(u);
  }
  const c = new s.Mesh(new s.BoxGeometry(1.7, 0.08, 4), a);
  c.rotation.z = -0.06, c.position.set(n - 0.3, 2.52, o), t.add(c);
  const i = new s.Mesh(new s.BoxGeometry(0.45, 0.08, 3.2), g({ color: 9071176, bands: 2, tint: 5916214 }));
  i.position.set(n + 0.35, 0.55, o), t.add(i);
  for (const f of [-1.3, 1.3]) {
    const u = new s.Mesh(new s.BoxGeometry(0.4, 0.5, 0.08), r);
    u.position.set(n + 0.35, 0.3, o + f), t.add(u);
  }
  const l = new s.Mesh(new s.BoxGeometry(0.06, 0.75, 2), (() => {
    const f = new s.MeshBasicMaterial({ map: ua() });
    return [r, r, r, r, f, r];
  })());
  return l.position.set(n - 0.75, 1.9, o), l.rotation.y = Math.PI, t.add(l), Qt(t), e.add(t), e.collide(n - 0.6, o - 1.8, n + 0.6, o + 1.8, 2.4, 0.9), { pos: { x: n - 1.2, z: o } };
}
function Ta(e) {
  const t = g({ color: 7039858, bands: 2, tint: 3816010 });
  for (const { z: o, side: n } of [{ z: 45, side: -1 }, { z: -20, side: 1 }]) {
    const r = U(o) + n * (F + K + 0.15), a = new s.Mesh(new s.CylinderGeometry(0.05, 0.05, 2.9, 8), t);
    a.position.set(r, e.groundAt(r, o) + 1.45, o), e.add(a);
    const c = new s.MeshBasicMaterial({ map: ha() }), i = new s.Mesh(new s.BoxGeometry(0.05, 0.5, 2.2), [t, t, t, t, c, t]);
    i.position.set(r, 2.75, o), e.add(i), e.collide(r - 0.12, o - 0.12, r + 0.12, o + 0.12, 2.9);
  }
}
function Ca(e, t = 1) {
  const o = new s.Group(), n = g({ color: 7230272, bands: 3, tint: 4864560 }), r = [5214047, 6265940, 4161359], a = 2.6 * t, c = new s.Mesh(new s.CylinderGeometry(0.14 * t, 0.24 * t, a, 7), n);
  c.position.y = a / 2, o.add(c);
  const i = e.int(3, 5);
  for (let l = 0; l < i; l++) {
    const f = e.range(0.9, 1.5) * t, u = new s.Mesh(new s.IcosahedronGeometry(f, 1), g({ color: e.pick(r), bands: 3, tint: 3825482 }));
    u.position.set(e.range(-0.8, 0.8) * t, a + e.range(-0.2, 0.9) * t, e.range(-0.8, 0.8) * t), u.scale.y = 0.72, o.add(u);
  }
  return Qt(o), o;
}
function Ba(e) {
  const t = at(777), o = [{ x: -10.5, z: 20, s: 1.5, c: true }, { x: -13.5, z: 34, s: 1.35, c: true }, { x: -5.85, z: 22.5, s: 1.25, c: true }, { x: -5.7, z: -14, s: 1.1, c: true }, { x: F + K + 1.1, z: -27, s: 1, c: true }, { x: -5.9, z: -44, s: 1.2, c: true }, { x: F + K + 1, z: -58, s: 1, c: true }, { x: F + K + 1.2, z: 50, s: 1.1, c: true }, { x: -5.7, z: 52.5, s: 0.95, c: true }, { x: F + K +
  1.3, z: 66, s: 1.15, c: true }];
  for (const a of o) {
    const c = U(a.z) + a.x, i = Ca(t, a.s);
    i.position.set(c, e.groundAt(c, a.z), a.z), e.add(i), a.c && e.collide(c - 0.26, a.z - 0.26, c + 0.26, a.z + 0.26, 2.4);
  }
  const n = new s.Group(), r = [14043531, 14708895, 12728957];
  for (let a = 0; a < 60; a++) {
    const c = 14.5 + a * 0.42 + t.range(-0.1, 0.1), i = U(c) - (F + K + 0.65) + t.range(-0.3, 0.3), l = t.range(0.13, 0.3), f = new s.Mesh(new s.IcosahedronGeometry(l, 1), g({ color: t.pick(r), bands: 3, tint: 7027294 }));
    f.position.set(i, 1.9 + t.range(-0.35, 0.45), c), n.add(f);
  }
  e.add(n);
}
const ot = {};
function Ia() {
  return ot.concrete || (ot.concrete = g({ color: b.concrete, bands: 3, tint: 7301008 }), ot.concreteMid = g({ color: b.concreteMid, bands: 3, tint: 6972040 }), ot.metal = g({ color: b.metal, bands: 3, tint: 6709392 }), ot.metalDark = g({ color: b.metalDark, bands: 3, tint: 6051456 }), ot.dark = g({ color: b.black, bands: 2, tint: 4932960 }), ot.shell = g({ color: 12896462, bands: 3, tint: 6709392 }),
  ot.shellTrim = g({ color: 10133672, bands: 3, tint: 6051456 }), ot.wood = g({ color: 10256222, bands: 3, tint: 6051456 }), ot.woodDark = g({ color: 8217416, bands: 3, tint: 6051456 }), ot.soil = g({ color: 7627342, bands: 3, tint: 6380160 }), ot.bamboo = g({ color: b.bamboo, bands: 3, flat: false, tint: 5992332 }), ot.twine = g({ color: b.rope, bands: 3, flat: false, tint: 7301008 }), ot.pale = D(
  { color: 16184040 })), ot;
}
const O = (e, t, o = 0) => new s.Vector3(e, t, o), Ra = O(0, 1, 0), je = /* @__PURE__ */ new Map();
function Ea(e) {
  return je.has(e) || je.set(e, new s.CylinderGeometry(1, 1, 1, e, 1)), je.get(e);
}
function Q(e, t, o, n, r = 6) {
  const a = new s.Vector3().subVectors(o, t), c = a.length();
  c < 1e-4 || e.push({ geometry: Ea(r), matrix: new s.Matrix4().compose(new s.Vector3().addVectors(t, o).multiplyScalar(0.5), new s.Quaternion().setFromUnitVectors(Ra, a.normalize()), O(n, c, n)) });
}
function Pa(e, t, o, n = {}) {
  const r = n.noCast ?? [];
  for (const a of Object.keys(t)) {
    if (!t[a].length) continue;
    const c = new s.Mesh(xt(t[a]), o[a]);
    c.castShadow = !r.includes(a), c.receiveShadow = true, e.add(c), a === n.outline && bt(c, { thickness: n.thickness ?? 32e-4 });
  }
  return e;
}
function Io(e = {}) {
  const t = Ia(), o = new s.Group(), n = new s.Group();
  o.add(n);
  const r = 0.2, a = { RA: O(-0.6, r), FA: O(0.57, r), ENG: O(-0.3, 0.28), RS: O(-0.22, 0.3), FS: O(0.3, 0.28), HS: O(0.48, 0.62), HT: O(0.4, 0.96), BAR: O(0.38, 1), SHK: O(-0.44, 0.5) }, c = { dark: [], metal: [], body: [], amber: [], dial: [] }, i = (f, u, d) => c[f].push({ geometry: u, matrix: d }), l = g({ color: e.color ?? 13227228, bands: 3, tint: 7301008 });
  for (const f of [a.RA, a.FA]) i("dark", new s.CylinderGeometry(r, r, 0.09, 14), S(f.x, f.y, 0, Math.PI / 2)), i("metal", new s.CylinderGeometry(0.125, 0.125, 0.11, 12), S(f.x, f.y, 0, Math.PI / 2)), i("dark", new s.CylinderGeometry(0.038, 0.038, 0.13, 8), S(f.x, f.y, 0, Math.PI / 2));
  i("body", new s.TorusGeometry(r + 0.04, 0.026, 4, 14, Math.PI * 0.85), S(a.FA.x, a.FA.y, 0, 0, 0, -0.72, 1, 1, 2.2)), i("body", new s.TorusGeometry(r + 0.05, 0.032, 4, 12, Math.PI * 0.62), S(a.RA.x, a.RA.y, 0, 0, 0, 0.55, 1, 1, 1.9));
  for (const f of [-1, 1]) Q(c.metal, O(a.HS.x, a.HS.y, f * 0.055), O(a.FA.x, a.FA.y, f * 0.055), 0.019), Q(c.metal, O(a.ENG.x, a.ENG.y, f * 0.062), O(a.RA.x, a.RA.y, f * 0.062), 0.022);
  Q(c.metal, a.HS, a.HT, 0.026), Q(c.metal, a.HS, a.FS, 0.026), Q(c.metal, a.FS, a.RS, 0.024), Q(c.metal, a.RS, a.SHK, 0.024), Q(c.metal, O(a.SHK.x, a.SHK.y, 0.07), O(a.RA.x + 0.02, a.RA.y + 0.04, 0.07), 0.024), Q(c.metal, O(-0.14, 0.26, -0.09), O(-0.24, 0.015, -0.19), 0.016);
  for (const f of [-1, 1]) i("body", new s.BoxGeometry(0.5, 0.24, 0.11), S(-0.4, 0.4, f * 0.125));
  i("body", new s.BoxGeometry(0.46, 0.09, 0.34), S(-0.4, 0.505, 0)), i("dark", new s.BoxGeometry(0.34, 0.08, 0.3), S(-0.46, 0.59, 0)), i("dark", new s.BoxGeometry(0.16, 0.065, 0.2), S(-0.24, 0.575, 0)), i("body", new s.BoxGeometry(0.56, 0.03, 0.36), S(0.06, 0.275, 0)), i("dark", new s.BoxGeometry(0.46, 0.014, 0.28), S(0.04, 0.297, 0)), i("body", new s.BoxGeometry(0.16, 0.46, 0.42), S(0.38, 0.68, 0,
  0, 0, 0.22)), i("body", new s.BoxGeometry(0.16, 0.16, 0.38), S(0.3, 0.4, 0)), i("body", new s.BoxGeometry(0.16, 0.18, 0.3), S(0.4, 0.94, 0)), Q(c.metal, O(-0.28, 0.28, 0.09), O(-0.5, 0.245, 0.13), 0.024), i("metal", new s.CylinderGeometry(0.045, 0.045, 0.24, 10), S(-0.62, 0.24, 0.14, 0, 0, Math.PI / 2)), i("metal", new s.BoxGeometry(0.28, 0.025, 0.26), S(-0.66, 0.655, 0));
  for (const f of [-1, 1]) Q(c.metal, O(-0.56, 0.65, f * 0.11), O(-0.5, 0.55, f * 0.13), 0.014), Q(c.metal, O(-0.78, 0.65, f * 0.11), O(-0.68, 0.55, f * 0.12), 0.014), Q(c.metal, O(-0.54, 0.6, f * 0.145), O(-0.72, 0.7, f * 0.115), 0.013);
  Q(c.metal, O(-0.72, 0.7, -0.115), O(-0.72, 0.7, 0.115), 0.013);
  {
    const f = D({ color: b.wallGray }), u = D({ color: 16777215, map: On(), cache: false }), d = new s.Mesh(new s.BoxGeometry(0.02, 0.13, 0.24), [f, u, f, f, f, f]);
    d.position.set(-0.77, 0.42, 0), d.castShadow = true, n.add(d);
  }
  i("metal", new s.CylinderGeometry(0.018, 0.018, 0.56, 6), S(a.BAR.x, a.BAR.y, 0, Math.PI / 2)), Q(c.metal, a.HT, a.BAR, 0.022);
  for (const f of [-1, 1]) i("dark", new s.CylinderGeometry(0.024, 0.024, 0.11, 6), S(a.BAR.x, a.BAR.y, f * 0.22, Math.PI / 2)), Q(c.metal, O(0.36, 1.02, f * 0.18), O(0.32, 1.24, f * 0.24), 0.012), i("dark", new s.BoxGeometry(0.03, 0.11, 0.14), S(0.31, 1.26, f * 0.25)), n.add(L(8e-3, 0.09, 0.12, D({ color: b.mirrorFace }), 0.294, 1.26, f * 0.25)), i("amber", new s.BoxGeometry(0.06, 0.05, 0.05), S(
  0.45, 0.86, f * 0.19));
  if (i("metal", new s.CylinderGeometry(0.095, 0.095, 0.06, 14), S(0.48, 0.9, 0, 0, 0, Math.PI / 2)), n.add(le(0.082, 0.082, 0.02, 14, D({ color: 16774360 }), 0.514, 0.9, 0).rotateZ(Math.PI / 2)), e.cockpit) {
    const u = O(0.392, 1.06, 0), d = new s.Quaternion().setFromAxisAngle(O(0, 0, 1), 0.52), h = O(0, 1, 0).applyQuaternion(d), p = (y) => d.clone().multiply(new s.Quaternion().setFromAxisAngle(O(0, 1, 0), -y)), x = (y, v, k, T, m) => {
      const M = p(k), w = u.clone().addScaledVector(h, m).add(O(T, 0, 0).applyQuaternion(M));
      i(v, y, new s.Matrix4().compose(w, M, O(1, 1, 1)));
    };
    i("dark", new s.CylinderGeometry(0.062, 0.062, 0.05, 14), S(u.x, u.y, u.z, 0, 0, 0.52)), x(new s.CylinderGeometry(0.05, 0.05, 8e-3, 14), "dial", 0, 0, 0.026), x(new s.BoxGeometry(0.042, 4e-3, 5e-3), "dark", -2.36, 0.021, 0.032), x(new s.CylinderGeometry(7e-3, 7e-3, 6e-3, 8), "dark", 0, 0, 0.032), x(new s.CylinderGeometry(9e-3, 9e-3, 5e-3, 8), "amber", 1.9, 0.033, 0.031);
    for (const y of [-1, 1]) Q(c.metal, O(0.4, 1, y * 0.163), O(0.468, 0.988, y * 0.248), 9e-3);
    i("metal", new s.CylinderGeometry(0.026, 0.026, 0.05, 10), S(0.315, 0.88, -0.05, 0, 0, Math.PI / 2));
    {
      const y = O(-1, 0, 0).applyEuler(new s.Euler(0, 0, 0.22)), v = O(0.38, 0.68, 0).addScaledVector(y, 0.081), k = v.clone().addScaledVector(y, 0.05);
      Q(c.metal, v, k, 9e-3), Q(c.metal, k, k.clone().add(O(0, 0.035, 0)), 9e-3);
    }
  }
  return Pa(n, c, { dark: t.dark, metal: t.metal, body: l, amber: g({ color: b.orange, bands: 2, tint: 9396304 }), dial: D({ color: 15328986 }) }, { outline: "body", thickness: 34e-4 }), n.rotation.x = e.lean ?? -0.09, o.position.set(e.x, e.y ?? 0, e.z), o.rotation.y = e.ry ?? 0, o.userData.inner = n, o;
}
function Qe(e = {}) {
  const t = new s.Group(), o = new s.Group();
  t.add(o), t.userData.inner = o;
  const n = g({ color: e.color ?? 15251488, bands: 3, tint: 9071146 }), r = g({ color: 2302758, bands: 2, tint: 3816010 }), a = g({ color: 3026483, bands: 2, tint: 3816010 }), c = g({ color: 10133672, bands: 3, tint: 6051456 }), i = D({ color: 10338516, transparent: true, opacity: 0.55 }), l = { yellow: [], black: [], dark: [], metal: [] }, f = (p, x, y) => l[p].push({ geometry: x, matrix: y }), u = 0.25;
  f("dark", new s.CylinderGeometry(u, u, 0.1, 14), S(0.72, u, 0, Math.PI / 2)), f("metal", new s.CylinderGeometry(0.14, 0.14, 0.11, 12), S(0.72, u, 0, Math.PI / 2));
  for (const p of [-1, 1]) f("dark", new s.CylinderGeometry(u, u, 0.1, 14), S(-0.62, u, p * 0.58, Math.PI / 2)), f("metal", new s.CylinderGeometry(0.14, 0.14, 0.11, 12), S(-0.62, u, p * 0.58, Math.PI / 2));
  f("black", new s.BoxGeometry(1.9, 0.08, 1.28), S(-0.15, 0.34, 0)), f("black", new s.BoxGeometry(1.5, 0.42, 0.05), S(-0.45, 0.6, 0.62)), f("black", new s.BoxGeometry(1.5, 0.42, 0.05), S(-0.45, 0.6, -0.62)), f("black", new s.BoxGeometry(0.06, 0.42, 1.28), S(-1.08, 0.6, 0)), f("dark", new s.BoxGeometry(0.42, 0.14, 1.1), S(-0.82, 0.62, 0)), f("dark", new s.BoxGeometry(0.1, 0.5, 1.1), S(-1, 0.86, 0)),
  f("dark", new s.BoxGeometry(0.34, 0.1, 0.42), S(-0.46, 0.66, 0)), f("yellow", new s.BoxGeometry(0.5, 0.5, 0.72), S(0.32, 0.62, 0)), f("yellow", new s.BoxGeometry(0.28, 0.34, 0.5), S(0.66, 0.52, 0)), f("dark", new s.CylinderGeometry(0.09, 0.09, 0.1, 10), S(0.82, 0.62, 0, 0, 0, Math.PI / 2)), f("yellow", new s.TorusGeometry(u + 0.05, 0.05, 4, 12, Math.PI), S(0.72, u + 0.02, 0, 0, 0, 0, 1, 1, 2.2)),
  f("metal", new s.CylinderGeometry(0.025, 0.025, 0.4, 6), S(0.18, 0.82, 0, 0, 0, -0.5)), f("dark", new s.CylinderGeometry(0.028, 0.028, 0.5, 6), S(0.1, 0.98, 0, Math.PI / 2)), f("yellow", new s.BoxGeometry(0.05, 0.72, 0.05), S(-1.06, 1.15, 0.58)), f("yellow", new s.BoxGeometry(0.05, 0.72, 0.05), S(-1.06, 1.15, -0.58)), f("yellow", new s.BoxGeometry(0.05, 0.62, 0.05), S(0.28, 1.1, 0.5, 0, 0, -0.18)),
  f("yellow", new s.BoxGeometry(0.05, 0.62, 0.05), S(0.28, 1.1, -0.5, 0, 0, -0.18)), f("yellow", new s.CylinderGeometry(0.66, 0.66, 1.5, 12, 1, false, 0, Math.PI), S(-0.4, 1.02, 0, Math.PI / 2, 0, Math.PI / 2, 1, 0.45, 1));
  const d = new s.Mesh(new s.PlaneGeometry(0.62, 0.5), i);
  d.position.set(0.33, 1.28, 0), d.rotation.y = Math.PI / 2, d.rotation.x = 0, d.rotation.z = -0.22, d.userData.noShadow = true, o.add(d);
  const h = { yellow: n, black: r, dark: a, metal: c };
  for (const p of Object.keys(l)) {
    if (!l[p].length) continue;
    const x = new s.Mesh(xt(l[p]), h[p]);
    o.add(x);
  }
  return o.rotation.x = e.lean ?? 0, Qt(t), t.userData.noOutline = false, t;
}
const Ro = new s.Vector3(), Eo = new s.Vector3(), Po = new s.Vector3(), Do = new s.Matrix4(), Lo = new s.Quaternion(), _o = new s.Quaternion(), No = new s.Euler();
function Je(e, t, o, n, r) {
  de(t, o, Ro, Eo, Po), Do.makeBasis(Eo, Ro, Po), Lo.setFromRotationMatrix(Do), No.set(0, r + Math.PI / 2, 0, "YXZ"), _o.setFromEuler(No), e.quaternion.copy(Lo).multiply(_o), se(t, n, o, e.position);
}
function Da(e) {
  const t = [], o = [{ kind: "auto", lane: -1.55, dir: 1, speed: 4.2, z0: -30, color: 15251488 }, { kind: "auto", lane: 1.55, dir: -1, speed: 3.8, z0: 24, color: 14198808 }, { kind: "scooter", lane: 1.45, dir: -1, speed: 5.2, z0: -55, color: 11881018 }];
  for (const i of o) {
    const l = i.kind === "auto" ? Qe({ color: i.color }) : Io({ color: i.color });
    l.userData.planetRigid = true, e.add(l);
    const f = { x0: 0, x1: 0, z0: 0, z1: 0, top: 1.6 };
    e.colliders.push(f), t.push({ obj: l, ...i, z: i.z0, collider: f });
  }
  const n = [{ kind: "auto", x: 1, z: 38.5, ry: 0.35, color: 15251488 }, { kind: "auto", x: 1, z: 41.2, ry: -0.2, color: 13146144 }, { kind: "scooter", x: -1, z: -8.5, ry: 0.3 }, { kind: "scooter", x: -1, z: -10.2, ry: -0.4 }, { kind: "scooter", x: 1, z: 14.8, ry: 0.2 }, { kind: "scooter", x: -1, z: 33.5, ry: -0.25 }, { kind: "scooter", x: -1, z: 24.2, ry: 0.15 }];
  for (const i of n) {
    const l = U(i.z) + i.x * (F + 0.75), f = i.kind === "auto" ? Qe({ color: i.color, lean: -0.03 }) : Io({ color: i.color ?? 13227228 });
    f.position.set(l, e.groundAt(l, i.z), i.z), f.rotation.y = i.ry + (i.x > 0 ? -Math.PI / 2 : Math.PI / 2), e.add(f);
    const u = i.kind === "auto" ? 1.1 : 0.9, d = i.kind === "auto" ? 0.75 : 0.4;
    e.collide(l - d, i.z - u, l + d, i.z + u, 1.3);
  }
  let r = () => false;
  const a = 3.4;
  function c(i) {
    for (const l of t) {
      let f = l.speed;
      if (r()) {
        const h = l.z + l.dir * f * i;
        (l.dir > 0 ? l.z < -a && h >= -a : l.z > a && h <= a) && (f = 0), l.dir > 0 && l.z < -a - 0.01 && h > -a && (f = 0), l.dir < 0 && l.z > a + 0.01 && h < a && (f = 0);
      }
      l.z += l.dir * f * i, l.z > qt - 2 && (l.z = Kt + 2), l.z < Kt + 2 && (l.z = qt - 2);
      const u = U(l.z) + l.lane, d = l.dir > 0 ? Math.PI : 0;
      Je(l.obj, u, l.z, 0.02, d), l.collider.x0 = u - 0.8, l.collider.x1 = u + 0.8, l.collider.z0 = l.z - 1.3, l.collider.z1 = l.z + 1.3;
    }
  }
  return { update: c, setGatesDown(i) {
    r = i;
  } };
}
const La = [13146474, 11896150, 11040328, 9857084], _a = [13126460, 3112299, 14735560, 4026052, 14198844, 9400245, 15236e3, 15790312], Na = [3817290, 4866616, 5921382, 3026483, 7035464];
function Oo(e) {
  const t = new s.Group(), o = g({ color: e.pick(La), bands: 3, tint: 9072478 }), n = g({ color: e.pick(_a), bands: 3, tint: 7036528 }), r = g({ color: e.pick(Na), bands: 2, tint: 3816010 }), a = g({ color: 2367518, bands: 2, tint: 3816010 }), c = e.range(0.92, 1.06), i = new s.Mesh(new s.BoxGeometry(0.34, 0.55, 0.2), n);
  i.position.y = 1.06 * c, t.add(i);
  const l = new s.Mesh(new s.SphereGeometry(0.115, 10, 8), o);
  l.position.y = 1.5 * c, t.add(l);
  const f = new s.Mesh(new s.SphereGeometry(0.118, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), a);
  f.position.y = 1.51 * c, t.add(f);
  const u = new s.Mesh(new s.BoxGeometry(0.11, 0.78, 0.13), r), d = u.clone();
  u.geometry = u.geometry.clone(), u.geometry.translate(0, -0.39, 0), d.geometry = u.geometry, u.position.set(0, 0.78 * c, 0.08), d.position.set(0, 0.78 * c, -0.08), t.add(u, d);
  const h = new s.Mesh(new s.BoxGeometry(0.08, 0.5, 0.09), n);
  h.geometry = h.geometry.clone(), h.geometry.translate(0, -0.25, 0);
  const p = h.clone();
  return h.position.set(0, 1.3 * c, 0.23), p.position.set(0, 1.3 * c, -0.23), t.add(h, p), Qt(t), t.userData.legs = [u, d], t.userData.arms = [h, p], t.userData.scale = c, t;
}
function Oa(e) {
  const t = at(4517), o = [], n = 7;
  for (let c = 0; c < n; c++) {
    const i = c % 2 === 0 ? -1 : 1, l = Oo(t);
    l.userData.planetRigid = true, e.add(l), o.push({ obj: l, side: i, z: t.range(Kt + 8, qt - 8), dir: t.sign(), speed: t.range(0.9, 1.6), phase: t.range(0, 10), t: 0 });
  }
  const r = [{ x: 4.6, z: -14.4, ry: -0.5 }, { x: 4.5, z: 38.2, ry: 2.4 }].map((c) => {
    const i = Oo(t);
    return i.userData.planetRigid = true, e.add(i), { obj: i, ...c, phase: t.range(0, 10), t: 0 };
  });
  function a(c) {
    for (const i of o) {
      i.t += c, i.z += i.dir * i.speed * c;
      const l = 72;
      i.z > l && (i.z = l, i.dir = -1), i.z < -l && (i.z = -l, i.dir = 1);
      const f = U(i.z) + i.side * (F + K * 0.55), u = i.dir > 0 ? Math.PI : 0;
      Je(i.obj, f, i.z, jt, u);
      const d = Math.sin(i.t * 6.4 * i.speed) * 0.5, [h, p] = i.obj.userData.legs, [x, y] = i.obj.userData.arms;
      h.rotation.z = d, p.rotation.z = -d, x.rotation.z = -d * 0.7, y.rotation.z = d * 0.7;
    }
    for (const i of r) {
      i.t += c;
      const l = U(i.z) + i.x;
      Je(i.obj, l, i.z, jt, i.ry), i.obj.position.y += 0;
      const [f] = i.obj.userData.arms;
      f.rotation.z = Math.sin(i.t * 1.2) * 0.06;
    }
  }
  return { update: a };
}
const Fa = [{ id: "gate", label: "Shankar Mutt  \xB7  look closer", pos: (e) => ({ x: e - (F + K + 0.4), z: 27, y: 1.6 }), card: { title: "Sri Shankar Mutt, Nallakunta", body: "The Nallakunta branch of the Sringeri Sharada Peetham. White arch, maroon gate, pale wall with red coping - every kid on this road gave directions by it. An illustrated reconstruction - the real gate stands at 17.4006 N, 78\
.5072 E, on the west side of the main road." } }, { id: "tree", label: "The temple tree  \xB7  look closer", pos: (e) => ({ x: e - (F + K + 1.15), z: 22.5, y: 2.2 }), card: { title: "The tree outside the wall", body: 'Every old Hyderabad street has one tree older than the buildings. Distances here were never in metres - they were "past the tree, before the gate." The bougainvillea on the coping dr\
ops petals on the footway all year.' } }, { id: "pharmacy", label: "Saince Pharmacy  \xB7  look closer", pos: (e) => ({ x: e + (F + K + 0.4), z: 8.5, y: 1.6 }), card: { title: "Saince Pharmacy", body: "The pharmacy opposite the mutt. Strips of tablets cut to count, ORS through the summer, a torch behind the counter for when the power went. Every household on the street has run a small tab of merci\
es here." } }, { id: "tiffins", label: "Tiffin centre  \xB7  look closer", pos: (e) => ({ x: e - (F + K + 0.4), z: 44.5, y: 1.6 }), card: { title: "Siddhartha Tiffin Centre", body: "Idli at seven in the morning, punugulu at four in the evening. The steel plates never stopped moving and neither did the queue. Half the neighbourhood's mornings started standing here." } }, { id: "tea", label: "Tea po\
int  \xB7  look closer", pos: (e) => ({ x: e + (F + K + 0.4), z: 38.5, y: 1.6 }), card: { title: "The tea point", body: 'Irani chai by the glass, Osmania biscuits on a steel plate. The conversations were the point; the tea was the excuse. Someone has been "just leaving" here for forty minutes.' } }, { id: "busstop", label: "Bus stop  \xB7  look closer", pos: (e) => ({ x: e + (F + K - 1), z: -14, y: 1.6 }),
card: { title: "The bus stop", body: "107, 113, 116J. Buses came when they came, and you learned to read the road for them two turns away. Whole friendships were made waiting here." } }, { id: "crossing", label: "MMTS line  \xB7  look closer", pos: (e) => ({ x: e + 4.4, z: 3.6, y: 1.4 }), card: { title: "The railway line", body: "The MMTS line past Vidyanagar, the neighbourhood's other clock. If y\
ou grew up here you can still hear the horn before the gates come down - and you still know exactly how long you have." } }];
function Va(e) {
  for (const t of Fa) {
    const o = U(t.pos(0).z), n = t.pos(o), r = new s.Mesh(new s.BoxGeometry(1.8, 2.4, 2.6), D({ color: 16711680, cache: false }));
    r.position.set(n.x, n.y, n.z), r.visible = false, e.add(r), e.interact({ hitbox: r, label: t.label, action: () => {
      window.dispatchEvent(new CustomEvent("nf-memory", { detail: t.card }));
    } });
  }
}
function Wa(e) {
  xa(e), va(e), ba(e), ga(e), Ga(e), Aa(e), Ta(e), Ba(e), Va(e);
  const t = Da(e), o = Oa(e);
  return e.update((n) => {
    t.update(n), o.update(n);
  }), { traffic: t, people: o };
}
function Ha(e) {
  const t = new s.Group();
  t.name = "world", e.add(t);
  const o = [], n = [], r = [], a = [], c = [], i = { scene: e, root: t, colliders: o, interactables: n, add: (m) => (t.add(m), m), collide: (m, M, w, z, I, A) => {
    o.push({ x0: Math.min(m, w), x1: Math.max(m, w), z0: Math.min(M, z), z1: Math.max(M, z), top: I, bottom: A });
  }, platform: (m) => a.push(m), cut: (m) => c.push(m), groundAt: (m, M) => {
    let w = ho(m, M);
    for (const z of c) m > z.x0 && m < z.x1 && M > z.z0 && M < z.z1 && (w = Math.min(w, z.top));
    for (const z of a) m > z.x0 && m < z.x1 && M > z.z0 && M < z.z1 && (w = Math.max(w, z.top));
    return w;
  }, interact: (m) => n.push(m), update: (m) => r.push(m) }, l = es(e), f = Qs(i), u = ia(i), d = Wa(i), h = ca(i), p = 165, x = { blink: 0, armT: 0 };
  f.request = () => {
    u.x = vt(-153 * u.dir);
  };
  const y = [1, -1].map((m) => {
    const M = { x0: U(0) - F - 0.6, x1: U(0) + F + 0.6, z0: m * Re - 0.16, z1: m * Re + 0.16, top: -1 };
    return o.push(M), M;
  });
  function v(m) {
    x.blink = (x.blink + m * 1.6) % 1;
    const M = -u.offset * u.dir, w = M < p && M > -62, z = m / (w ? 3.4 : 3);
    x.armT = Math.max(0, Math.min(1, x.armT + (w ? z : -z))), f.setArms(x.armT), f.setLamps(w || x.armT > 0.02, x.blink);
    const I = x.armT > 0.55 ? 1.25 : -1;
    y[0].top = I, y[1].top = I;
  }
  d.traffic.setGatesDown(() => x.armT > 0.55);
  const k = Qn(t, { maxEdge: 4 });
  return u.planetize(), { root: t, colliders: o, platforms: a, cuts: c, interactables: n, train: u, crossing: f, planet: l, petals: h, bakeStats: k, bounds: { z0: -mt * 0.24, z1: mt * 0.24 }, heightAt(m, M, w) {
    let z = ho(m, M);
    for (const A of c) m > A.x0 && m < A.x1 && M > A.z0 && M < A.z1 && (z = Math.min(z, A.top));
    const I = w === void 0 ? 1 / 0 : w + 0.55;
    for (const A of a) A.top > I || m > A.x0 && m < A.x1 && M > A.z0 && M < A.z1 && (z = Math.max(z, A.top));
    return z;
  }, update(m) {
    v(m), u.update(m);
    for (const M of r) M(m);
    h.update(m, u.gust, u.dir);
  } };
}
const Fo = 0.88, Vo = 0.34, Wo = 1.17, Ho = -0.09, Ua = 2.4, ja = 0.34, Ka = 0.38;
function qa({ scene: e, world: t, player: o, hud: n }) {
  const r = Qe({ color: 15251488, lean: Ho }), a = r.userData.inner;
  r.visible = false, e.add(r);
  const c = new s.Mesh(new s.BoxGeometry(1.9, 1.35, 0.95), D({ color: 16711680, cache: false }));
  c.position.set(-0.05, 0.68, 0), c.visible = false, r.add(c);
  const i = { hitbox: c, label: "auto  \xB7  ride it", action: () => G() }, l = { out: false, riding: false, x: 0, z: 0, heading: 0 };
  let f = null;
  const u = new s.Vector3(), d = new s.Vector3(), h = new s.Vector3(), p = new s.Matrix4(), x = new s.Quaternion(), y = new s.Quaternion(), v = new s.Euler();
  function k(C, P, N, B, R) {
    de(C, P, u, d, h), p.makeBasis(d, u, h), x.setFromRotationMatrix(p), v.set(0, B + Math.PI / 2, R, "YXZ"), y.setFromEuler(v), r.quaternion.copy(x).multiply(y), se(C, N, P, r.position), r.updateMatrixWorld(true);
  }
  function T(C, P, N, B) {
    const R = -Math.sin(N), W = -Math.cos(N), et = Wo / 2, ae = t.heightAt(vt(C + R * et), P + W * et, B), zt = t.heightAt(vt(C - R * et), P - W * et, B);
    return s.MathUtils.clamp(Math.atan2(ae - zt, Wo), -0.45, 0.45);
  }
  function m(C) {
    if (f) {
      const et = t.colliders.indexOf(f);
      et >= 0 && t.colliders.splice(et, 1), f = null;
    }
    if (!C) return;
    const P = Math.abs(Math.sin(l.heading)), N = Math.abs(Math.cos(l.heading)), B = Fo * P + Vo * N, R = Fo * N + Vo * P, W = t.heightAt(l.x, l.z, o.pos.y);
    f = { x0: l.x - B, x1: l.x + B, z0: l.z - R, z1: l.z + R, top: W + 1.02 }, t.colliders.push(f);
  }
  function M(C, P, N, B) {
    for (const R of t.colliders) if (R !== f && !(R.top !== void 0 && R.top <= B + Ka) && !(R.bottom !== void 0 && R.bottom > B + 1.9) && C > R.x0 - N && C < R.x1 + N && P > R.z0 - N && P < R.z1 + N) return false;
    return true;
  }
  function w(C) {
    const P = t.interactables.indexOf(i);
    C && P < 0 && t.interactables.push(i), !C && P >= 0 && t.interactables.splice(P, 1);
  }
  function z() {
    const C = t.heightAt(l.x, l.z, o.pos.y);
    a.rotation.x = Ho, k(l.x, l.z, C, l.heading, T(l.x, l.z, l.heading, C)), r.visible = true, l.out = true, m(true), w(true);
  }
  function I() {
    const C = o.pos.y;
    let P = null;
    for (const N of [2, 1.65, 2.6, 1.3]) {
      for (const B of [0, 0.45, -0.45, 0.95, -0.95, 1.6, -1.6]) {
        const R = vt(o.pos.x - Math.sin(o.yaw + B) * N), W = o.pos.z - Math.cos(o.yaw + B) * N;
        if (M(R, W, 0.8, C) && !(Math.abs(t.heightAt(R, W, C) - C) > 0.5)) {
          P = { x: R, z: W };
          break;
        }
      }
      if (P) break;
    }
    P || (P = { x: vt(o.pos.x - Math.sin(o.yaw) * 1.5), z: o.pos.z - Math.cos(o.yaw) * 1.5 }), l.x = P.x, l.z = P.z, l.heading = o.yaw - 0.35, z(), n?.flash("auto  \xB7  E to ride", 1700);
  }
  function A() {
    l.riding || (r.visible = false, l.out = false, m(false), w(false), n?.flash("auto  \xB7  put away", 1200));
  }
  function G() {
    !l.out || l.riding || (o.yaw = l.heading, o.pos.x = vt(l.x + Math.sin(l.heading) * $t.seatFwd), o.pos.z = l.z + Math.cos(l.heading) * $t.seatFwd, m(false), w(false), l.riding = true, o.mount(i), n?.flash("auto  \xB7  W to go, E to get off", 2e3));
  }
  function E() {
    if (!l.riding) return;
    l.riding = false, o.unmount();
    const C = Math.cos(l.heading), P = -Math.sin(l.heading), N = -Math.sin(l.heading), B = -Math.cos(l.heading), R = o.pos.y, W = [[-C * 1.35, -P * 1.35], [C * 1.35, P * 1.35], [-N * 1.9, -B * 1.9]];
    for (const [et, ae] of W) {
      const zt = vt(o.pos.x + et), Pt = o.pos.z + ae;
      if (M(zt, Pt, ja, R) && !(Math.abs(t.heightAt(zt, Pt, R) - R) > 0.6)) {
        o.pos.x = zt, o.pos.z = Pt;
        break;
      }
    }
    z(), n?.flash("auto  \xB7  parked", 1200);
  }
  function H() {
    if (l.riding) {
      E();
      return;
    }
    if (!l.out) {
      I();
      return;
    }
    Math.hypot(on(l.x, o.pos.x), l.z - o.pos.z) > 4 ? I() : A();
  }
  function q() {
    if (!l.riding) return;
    const C = o.yaw, P = -Math.sin(C), N = -Math.cos(C), B = vt(o.pos.x + P * $t.seatFwd), R = o.pos.z + N * $t.seatFwd;
    k(B, R, o.pos.y, C, T(B, R, C, o.pos.y)), a.rotation.x = -o.roll * Ua, l.x = B, l.z = R, l.heading = C;
  }
  return { group: r, toggle: H, summon: I, recall: A, mount: G, dismount: E, update: q, get riding() {
    return l.riding;
  }, get summoned() {
    return l.out;
  } };
}
const no = document.getElementById("view"), Jt = new s.WebGLRenderer({ canvas: no, antialias: false, powerPreference: "high-performance", stencil: false });
Jt.setPixelRatio(1);
Jt.outputColorSpace = s.SRGBColorSpace;
Jt.toneMapping = s.NoToneMapping;
Jt.shadowMap.enabled = true;
Jt.shadowMap.type = s.PCFShadowMap;
Jt.setClearColor(new s.Color(b.fog), 1);
const lt = new s.Scene();
lt.fog = new s.Fog(b.fog, 44, 205);
const dt = new s.PerspectiveCamera(46, 1, 0.25, 600);
dt.rotation.order = "YXZ";
const tt = new s.DirectionalLight(b.sun, 2.25);
tt.position.set(-52, 62, 56);
tt.castShadow = true;
tt.shadow.mapSize.set(2048, 2048);
tt.shadow.camera.left = -34;
tt.shadow.camera.right = 34;
tt.shadow.camera.top = 34;
tt.shadow.camera.bottom = -34;
tt.shadow.camera.near = 1;
tt.shadow.camera.far = 200;
tt.shadow.bias = -4e-4;
tt.shadow.normalBias = 0.035;
lt.add(tt);
lt.add(tt.target);
const fe = new s.DirectionalLight(b.fill, 1.08);
fe.position.set(48, 26, -44);
lt.add(fe);
lt.add(fe.target);
const oe = new s.DirectionalLight(14207976, 0.34);
oe.position.set(10, -18, 40);
lt.add(oe);
lt.add(oe.target);
const Pe = new s.HemisphereLight(b.hemiSky, b.hemiGround, 1.12);
lt.add(Pe);
const Uo = Un(lt, 500), we = Ha(lt), Y = new cs(dt, no, we), gn = "nallakunta-forever-volume";
let so = 0.34;
try {
  const e = localStorage.getItem(gn);
  if (e !== null) {
    const t = Number(e);
    Number.isFinite(t) && (so = Math.max(0, Math.min(1, t)));
  }
} catch {
}
const $ = ls({ volume: so }), wt = ds({ volume: so, fadeIn: 3 });
$.setMuted(wt.muted);
const ao = () => {
  try {
    localStorage.setItem(gn, String(wt.volume));
  } catch {
  }
};
$.onVolumeChange = (e) => {
  $.setMuted(wt.setVolume(e)), ao();
};
const Mn = window.matchMedia?.("(pointer: coarse)").matches ?? false;
$.onStart = () => {
  wt.start(), Mn ? (Y.touchActive = true, $.setLocked(true)) : Y.lock();
};
Y.onLockChange = (e) => $.setLocked(e);
no.addEventListener("click", () => {
  wt.start(), !Mn && !Y.locked && Y.lock();
});
window.addEventListener("nf-memory", (e) => $.showCard(e.detail));
$.bindTouch({ player: Y, onEnter: () => {
  Y.touchActive || $.onStart?.();
}, onPlanet: () => {
  to(!Zt), $.flash(Zt ? "orbit view  \xB7  \u25CE to return" : "back on the ground");
}, onMusic: () => {
  const e = wt.toggle();
  $.setMuted(e), $.setVolume(wt.volume), ao(), wt.available && $.flash(e ? "\u266A  music off" : "\u266A  music on");
} });
const ye = qa({ scene: lt, world: we, player: Y, hud: $ });
Y.onInteract = (e) => {
  if (ye.riding) {
    ye.dismount();
    return;
  }
  e && e.action?.();
};
const Bt = new Cn(Jt, lt, dt);
function vn() {
  const e = window.innerWidth, t = window.innerHeight;
  dt.aspect = e / t, dt.updateProjectionMatrix(), Bt.setSize(e, t), an(Bt.size.x, Bt.size.y);
}
window.addEventListener("resize", vn);
vn();
const $a = new s.Clock(), Te = new s.Vector3(), jo = new s.Vector3(), Ya = new s.Vector3(-52, 62, 56), Ko = new s.Vector3(48, 26, -44), Xa = new s.Vector3(10, -18, 40);
function Ce(e, t, o, n) {
  jo.set(0, 0, 0).addScaledVector(o.east, t.x).addScaledVector(o.up, t.y).addScaledVector(o.north, t.z), e.target.position.copy(n), e.position.copy(n).add(jo);
}
let Zt = false, Ke = 0.6;
const qo = new s.Vector3(), Za = lt.fog, Qa = dt.far;
function to(e) {
  Zt = e, lt.fog = e ? null : Za, dt.far = e ? 1600 : Qa, dt.updateProjectionMatrix();
  const t = tt.shadow.camera, o = e ? Z * 1.15 : 34;
  t.left = -o, t.right = o, t.top = o, t.bottom = -o, t.far = e ? Z * 6 : 200, t.updateProjectionMatrix(), $.setPlanetView(e);
}
window.addEventListener("keydown", (e) => {
  if (!e.repeat) {
    if (e.code === "KeyM") {
      const t = wt.toggle();
      $.setMuted(t), $.setVolume(wt.volume), ao(), wt.available && $.flash(t ? "\u266A  music off" : "\u266A  music on");
    }
    e.code === "KeyV" && (Zt ? (to(false), $.flash("back on the ground")) : ye.toggle()), e.code === "KeyP" && (to(!Zt), $.flash(Zt ? "orbit view  \xB7  P to return" : "back on the ground")), e.code === "KeyO" && (Bt.enabled.ink = !Bt.enabled.ink), e.code === "KeyG" && (Bt.enabled.grade = !Bt.enabled.grade);
  }
});
function zn() {
  const e = Math.min($a.getDelta(), 0.05);
  if (Y.update(e), ye.update(e), we.update(e), Zt) Ke += e * 0.09, qo.set(Math.sin(Ke) * 0.8, 1, Math.cos(Ke) * 0.8).normalize(), dt.position.copy(st).addScaledVector(qo, Z * 3.3), dt.up.set(0, 1, 0), dt.lookAt(st), tt.target.position.copy(st), tt.position.copy(st).add(new s.Vector3(-1.05, 0.95, 0.75).multiplyScalar(Z * 2.2)), Pe.position.set(0, 1, 0), Ce(fe, Ko, { east: new s.Vector3(1, 0, 0), up: new s.
  Vector3(0, 1, 0), north: new s.Vector3(0, 0, 1) }, st), oe.visible = false;
  else {
    oe.visible = true;
    const o = de(Y.pos.x, Y.pos.z);
    se(Y.pos.x, 0, Y.pos.z, Te), Ce(tt, Ya, o, Te), Ce(fe, Ko, o, Te), Ce(oe, Xa, o, Te), Pe.position.copy(o.up);
  }
  Uo.dome.position.copy(dt.position), Uo.clouds.position.copy(dt.position);
  const t = !Zt && Y.locked ? Y.pick(we.interactables) : null;
  $.setPrompt(t ? `E  \xB7  ${t.label.replace(/^.*?·\s*/, "")}` : ""), $.update(e, Y.locked), $.setCoords(Y.pos, Y.yaw, Y.pitch, e), Bt.render(), requestAnimationFrame(zn);
}
zn();
window.__scene = { scene: lt, camera: dt, renderer: Jt, pipeline: Bt, world: we, player: Y, ebike: ye, music: wt, hud: $, sun: tt, fill: fe, bounce: oe, hemi: Pe, THREE: s };
window.__setOutlineRes = an;
