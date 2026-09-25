import * as a from "three";
import { FullScreenQuad as An } from "three/addons/postprocessing/Pass.js";
import { mergeGeometries as Tn, mergeVertices as Cn } from "three/addons/utils/BufferGeometryUtils.js";
(function() {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) n(s);
  new MutationObserver((s) => {
    for (const r of s) if (r.type === "childList") for (const i of r.addedNodes) i.tagName === "LINK" && i.rel === "modulepreload" && n(i);
  }).observe(document, { childList: true, subtree: true });
  function o(s) {
    const r = {};
    return s.integrity && (r.integrity = s.integrity), s.referrerPolicy && (r.referrerPolicy = s.referrerPolicy), s.crossOrigin === "use-credentials" ? r.credentials = "include" : s.crossOrigin === "anonymous" ? r.credentials = "omit" : r.credentials = "same-origin", r;
  }
  function n(s) {
    if (s.ep) return;
    s.ep = true;
    const r = o(s);
    fetch(s.href, r);
  }
})();
const g = { skyTop: 9420266, skyMid: 13953274, skyHaze: 16640466, cloud: 16644856, cloudShade: 15392728, fog: 15722196, sun: 16773592, fill: 11124213, hemiSky: 14478591, hemiGround: 12558206, ink: 3748431, road: 9275520, lineYellow: 15778625, tactile: 15910205, sidewalk: 14472644, sidewalkAlt: 15064521, curb: 13222576, concrete: 14275526, concreteMid: 12893611, ballast: 8222342, wallWhite: 16447215,
wallCream: 15919059, wallGray: 14606054, roofTeal: 5204848, red: 14697791, redDeep: 11874863, yellow: 16039987, black: 3288635, teal: 3120282, blueDeep: 2772887, orange: 15698492, leaf: 5940600, leafDeep: 4161376, blossomLight: 16503526, petal: 15771852, petalDeep: 14052260, railMetal: 7038066, railHead: 12762308, sleeper: 7169398, gateYellow: 16039987, gateBlack: 3288635, signalRed: 15877436, signalOff: 6961988,
cabinet: 14210522, cabinetTop: 11973308, trainBody: 16249574, trainBodyShade: 15130576, trainStripe: 3112912, trainStripe2: 4173466, trainWindow: 3818072, trainWindowLit: 7042964, trainSkirt: 10133677, trainRoof: 12433597, trainDoor: 15394008, metal: 12106950, metalDark: 8883094, mirrorFace: 13162724, rope: 15787466, bamboo: 9744491 }, so = { uniforms: { tDiffuse: { value: null }, tDepth: { value: null },
uTexel: { value: new a.Vector2() }, uNear: { value: 0.25 }, uFar: { value: 600 }, uInk: { value: new a.Color(g.ink) }, uThickness: { value: 1.35 }, uSens: { value: 42e-4 }, uConcave: { value: 0.026 }, uConcaveAmount: { value: 0.42 }, uFadeStart: { value: 40 }, uFadeEnd: { value: 98 }, uStrength: { value: 1 }, uSkyDepth: { value: 420 } }, vertexShader: `
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
  ` }, Bn = { uniforms: { tDiffuse: { value: null }, uShadowTint: { value: new a.Color(11380944) }, uLightTint: { value: new a.Color(16775144) }, uSaturation: { value: 1.12 }, uLift: { value: 0.032 }, uVignette: { value: 0.15 }, uWarmth: { value: 0.05 } }, vertexShader: so.vertexShader, fragmentShader: `
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
  ` }, Rn = { uniforms: { tDiffuse: { value: null }, uTexel: { value: new a.Vector2() } }, vertexShader: so.vertexShader, fragmentShader: `
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
function Oe(e) {
  const t = new a.ShaderMaterial({ uniforms: a.UniformsUtils.clone(e.uniforms), vertexShader: e.vertexShader, fragmentShader: e.fragmentShader, depthTest: false, depthWrite: false });
  return { quad: new An(t), mat: t };
}
class In {
  constructor(t, o, n, { pixelBudget: s = 46e5 } = {}) {
    this.renderer = t, this.scene = o, this.camera = n, this.pixelBudget = s, this.size = new a.Vector2(1, 1);
    const r = { type: a.HalfFloatType, minFilter: a.LinearFilter, magFilter: a.LinearFilter, depthBuffer: true, stencilBuffer: false, colorSpace: a.NoColorSpace };
    this.rtScene = new a.WebGLRenderTarget(2, 2, r), this.rtScene.depthTexture = new a.DepthTexture(2, 2), this.rtScene.depthTexture.format = a.DepthFormat, this.rtScene.depthTexture.type = a.UnsignedIntType, this.rtScene.depthTexture.minFilter = a.NearestFilter, this.rtScene.depthTexture.magFilter = a.NearestFilter, this.rtA = new a.WebGLRenderTarget(2, 2, { ...r, depthBuffer: false }), this.rtB =
    new a.WebGLRenderTarget(2, 2, { ...r, type: a.UnsignedByteType, depthBuffer: false });
    const i = Oe(so), c = Oe(Bn), l = Oe(Rn);
    this.ink = i, this.grade = c, this.fxaa = l, i.mat.uniforms.tDepth.value = this.rtScene.depthTexture, this.enabled = { ink: true, grade: true, fxaa: true };
  }
  setSize(t, o) {
    const n = window.devicePixelRatio || 1;
    let s = this.forceScale || (n < 1.5 ? 1.5 : Math.min(n, 2));
    t * o * s * s > this.pixelBudget && (s = Math.max(1, Math.sqrt(this.pixelBudget / (t * o)))), this.scale = s;
    const r = Math.max(2, Math.floor(t * s)), i = Math.max(2, Math.floor(o * s));
    this.size.set(r, i), this.renderer.setPixelRatio(1), this.renderer.setSize(t, o, true), this.rtScene.setSize(r, i), this.rtA.setSize(r, i), this.rtB.setSize(r, i);
    const c = new a.Vector2(1 / r, 1 / i);
    this.ink.mat.uniforms.uTexel.value.copy(c), this.fxaa.mat.uniforms.uTexel.value.copy(c), this.ink.mat.uniforms.uNear.value = this.camera.near, this.ink.mat.uniforms.uFar.value = this.camera.far, this.ink.mat.uniforms.uThickness.value = 1.05 + 0.55 * s;
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
const uo = { 2: [96, 255], 3: [92, 178, 255], 4: [80, 142, 202, 255], 5: [74, 124, 172, 214, 255], soft: [180, 255], soft3: [172, 214, 255] }, Fe = /* @__PURE__ */ new Map();
function En(e = 3) {
  const t = e;
  if (Fe.has(t)) return Fe.get(t);
  const o = uo[e] || uo[3], n = new Uint8Array(o.length * 4);
  for (let r = 0; r < o.length; r++) n[r * 4 + 0] = o[r], n[r * 4 + 1] = o[r], n[r * 4 + 2] = o[r], n[r * 4 + 3] = 255;
  const s = new a.DataTexture(n, o.length, 1, a.RGBAFormat);
  return s.minFilter = a.NearestFilter, s.magFilter = a.NearestFilter, s.generateMipmaps = false, s.needsUpdate = true, Fe.set(t, s), s;
}
const Zo = "lights_toon_pars_fragment", ho = "vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;", Pn = `
	vec3 celBand = getGradientIrradiance( geometryNormal, directLight.direction );
	vec3 irradiance = celBand * mix( uShadowTint, vec3( 1.0 ), celBand ) * directLight.color;`;
let Jo = false, tn = "";
{
  const e = a.ShaderChunk[Zo];
  e && e.includes(ho) && (tn = `uniform vec3 uShadowTint;
` + e.replace(ho, Pn), Jo = true);
}
function Dn(e, t) {
  if (!Jo) return e;
  const o = { value: new a.Color(t) };
  e.userData.shadowTint = o, e.onBeforeCompile = (s) => {
    s.uniforms.uShadowTint = o, s.fragmentShader = s.fragmentShader.replace(`#include <${Zo}>`, tn);
  };
  const n = new a.Color(t).getHexString();
  return e.customProgramCacheKey = () => "celTint_" + n, e;
}
const Ve = /* @__PURE__ */ new Map();
function y(e = {}) {
  const { color: t = 16777215, bands: o = 3, tint: n = 7102348, flat: s = true, map: r = null, emissive: i = null, emissiveIntensity: c = 1, transparent: l = false, opacity: f = 1, side: u = a.FrontSide, alphaTest: d = 0, depthWrite: h = null, fog: p = true, alphaMap: x = null, vertexColors: w = false, cache: M = true } = e, G = M && !r && !x ? [t, o, n, s, i, c, l, f, u, d, h, p, w].join("|") : null;
  if (G && Ve.has(G)) return Ve.get(G);
  const T = new a.MeshToonMaterial({ color: t, gradientMap: En(o), flatShading: s, map: r, alphaMap: x, transparent: l, opacity: f, side: u, alphaTest: d, fog: p, vertexColors: w, emissive: i === null ? 0 : i, emissiveIntensity: c });
  return h !== null && (T.depthWrite = h), Dn(T, n), G && Ve.set(G, T), T;
}
const We = /* @__PURE__ */ new Map();
function P(e = {}) {
  const { color: t = 16777215, map: o = null, transparent: n = false, opacity: s = 1, side: r = a.FrontSide, alphaTest: i = 0, depthWrite: c = null, fog: l = true, cache: f = true, toneMapped: u = true } = e, d = f && !o ? [t, n, s, r, i, c, l, u].join("|") : null;
  if (d && We.has(d)) return We.get(d);
  const h = new a.MeshBasicMaterial({ color: t, map: o, transparent: n, opacity: s, side: r, alphaTest: i, fog: l, toneMapped: u });
  return c !== null && (h.depthWrite = c), d && We.set(d, h), h;
}
const De = "'Yu Gothic', 'Yu Gothic UI', 'Meiryo', 'MS Gothic', 'Hiragino Kaku Gothic ProN', sans-serif", He = /* @__PURE__ */ new Map();
function Rt(e, t, o, { srgb: n = true, repeat: s = null, aniso: r = 4 } = {}) {
  const i = document.createElement("canvas");
  i.width = e, i.height = t;
  const c = i.getContext("2d");
  c.imageSmoothingEnabled = true, o(c, e, t);
  const l = new a.CanvasTexture(i);
  return n && (l.colorSpace = a.SRGBColorSpace), l.anisotropy = r, s && (l.wrapS = l.wrapT = a.RepeatWrapping, l.repeat.set(s[0], s[1])), l.needsUpdate = true, l;
}
function It(e, t) {
  return He.has(e) || He.set(e, t()), He.get(e);
}
const Ut = (e) => "#" + e.toString(16).padStart(6, "0");
function Ln(e, t, o, n, s = De, r = "bold") {
  let i = n;
  do {
    if (e.font = `${r} ${i}px ${s}`, e.measureText(t).width <= o) break;
    i -= 2;
  } while (i > 6);
  return i;
}
function Qt(e, t, o, n, s, r, i, c = "bold", l = 0) {
  const f = Ln(e, t, s, r, De, c);
  if (e.fillStyle = i, e.textAlign = l ? "left" : "center", e.textBaseline = "middle", l) {
    const u = [...t], d = u.reduce((p, x) => p + e.measureText(x).width + l, -l);
    let h = o - d / 2;
    for (const p of u) e.fillText(p, h, n), h += e.measureText(p).width + l;
  } else e.fillText(t, o, n);
  return f;
}
function _n(e, t, o, n, s, r, i) {
  e.font = `bold ${r}px ${De}`, e.fillStyle = i, e.textAlign = "center", e.textBaseline = "middle", [...t].forEach((c, l) => e.fillText(c, o, n + l * s));
}
const Nn = () => It("crossingSign", () => Rt(512, 256, (e, t, o) => {
  e.fillStyle = "#fbf8f2", e.fillRect(0, 0, t, o), e.strokeStyle = Ut(g.black), e.lineWidth = 12, e.strokeRect(6, 6, t - 12, o - 12), Qt(e, "LEVEL CROSSING", t / 2, o * 0.36, t - 60, 84, Ut(g.redDeep), "bold", 6), Qt(e, "STOP \xB7 LOOK \xB7 LISTEN", t / 2, o * 0.74, t - 80, 42, Ut(g.black), "bold", 2);
})), On = () => It("stationSign", () => Rt(768, 192, (e, t, o) => {
  e.fillStyle = "#fbfaf6", e.fillRect(0, 0, t, o), e.fillStyle = Ut(g.teal), e.fillRect(0, o - 22, t, 22), Qt(e, "\u0C35\u0C3F\u0C26\u0C4D\u0C2F\u0C3E\u0C28\u0C17\u0C30\u0C4D", t / 2, o * 0.42, t * 0.7, 92, "#2b3346", "bold", 12), e.font = `600 34px ${De}`, e.fillStyle = "#8a8fa0", e.textAlign = "center", e.fillText("VIDYANAGAR", t / 2, o * 0.82);
})), en = (e = 0) => It("warnPlate" + e, () => Rt(256, 512, (t, o, n) => {
  const s = [{ bg: g.yellow, fg: g.black, t: "CCTV" }, { bg: g.red, fg: 16644336, t: "DANGER" }, { bg: 16644336, fg: g.blueDeep, t: "SLOW" }, { bg: 16644336, fg: g.redDeep, t: "11 KV" }], r = s[e % s.length];
  t.fillStyle = Ut(r.bg), t.fillRect(0, 0, o, n), t.fillStyle = Ut(r.fg), t.fillRect(12, 12, o - 24, 6), t.fillRect(12, n - 18, o - 24, 6), _n(t, r.t, o / 2, 90, 88, 74, Ut(r.fg));
})), Fn = () => It("trainDest", () => Rt(512, 128, (e, t, o) => {
  e.fillStyle = "#1d2230", e.fillRect(0, 0, t, o), e.fillStyle = "#f2e6b0", e.fillRect(10, 22, 110, 84), Qt(e, "MMTS", 65, 64, 96, 40, "#1d2230", "bold"), Qt(e, "VIDYANAGAR", t * 0.62, o / 2, t * 0.55, 64, "#f2e6b0", "bold", 6);
})), Vn = () => It("trainNumber", () => Rt(256, 96, (e, t, o) => {
  e.fillStyle = "#f7f2e6", e.fillRect(0, 0, t, o), Qt(e, "MMTS 2104", t / 2, o / 2, t - 20, 50, "#4a4657");
})), on = (e = false) => It("tactile" + e, () => Rt(128, 128, (t, o, n) => {
  if (t.fillStyle = Ut(g.tactile), t.fillRect(0, 0, o, n), t.fillStyle = "#d9a91f", e) for (let s = 0; s < 4; s++) t.fillRect(10, 12 + s * 30, o - 20, 16);
  else for (let s = 0; s < 4; s++) for (let r = 0; r < 4; r++) t.beginPath(), t.arc(20 + r * 29, 20 + s * 29, 9, 0, Math.PI * 2), t.fill();
}, { repeat: [1, 1] })), Wn = () => It("platePlate", () => Rt(256, 128, (e, t, o) => {
  e.fillStyle = "#f6f4f0", e.fillRect(0, 0, t, o), e.strokeStyle = "#4f5a72", e.lineWidth = 8, e.strokeRect(8, 8, t - 16, o - 16), Qt(e, "\u3055 21-08", t / 2, o / 2, t - 40, 56, "#2f3646");
})), Hn = () => It("petalTex", () => Rt(128, 128, (e, t, o) => {
  e.clearRect(0, 0, t, o), e.translate(t / 2, o / 2), e.fillStyle = "#ffffff", e.beginPath(), e.moveTo(0, 52), e.bezierCurveTo(38, 34, 46, -14, 14, -48), e.bezierCurveTo(6, -38, 2, -34, 0, -30), e.bezierCurveTo(-2, -34, -6, -38, -14, -48), e.bezierCurveTo(-46, -14, -38, 34, 0, 52), e.closePath(), e.fill();
}, { srgb: false })), Un = () => It("cloudTex", () => Rt(512, 256, (e, t, o) => {
  e.clearRect(0, 0, t, o);
  const n = [[0.22, 0.62, 0.15], [0.36, 0.46, 0.2], [0.52, 0.4, 0.24], [0.68, 0.5, 0.19], [0.82, 0.63, 0.14], [0.45, 0.66, 0.2], [0.6, 0.68, 0.17]];
  e.fillStyle = "#ffffff";
  for (const [s, r, i] of n) e.beginPath(), e.ellipse(s * t, r * o, i * t * 0.55, i * o * 1.1, 0, 0, Math.PI * 2), e.fill();
  e.globalCompositeOperation = "destination-out", e.fillRect(0, o * 0.78, t, o * 0.22), e.globalCompositeOperation = "source-over";
}, { srgb: false })), Ot = (e, t, o) => e < t ? t : e > o ? o : e;
function Mt(e, t, o) {
  const n = Ot((o - e) / (t - e || 1e-6), 0, 1);
  return n * n * (3 - 2 * n);
}
function nn(e) {
  let t = e >>> 0;
  return function() {
    t = t + 1831565813 >>> 0;
    let o = t;
    return o = Math.imul(o ^ o >>> 15, o | 1), o ^= o + Math.imul(o ^ o >>> 7, o | 61), ((o ^ o >>> 14) >>> 0) / 4294967296;
  };
}
function st(e) {
  const t = nn(e);
  return { next: t, range: (o, n) => o + (n - o) * t(), int: (o, n) => Math.floor(o + (n - o + 1) * t()), pick: (o) => o[Math.floor(t() * o.length) % o.length], chance: (o) => t() < o, sign: () => t() < 0.5 ? -1 : 1 };
}
function wt(e) {
  let t = e.map(({ geometry: r, matrix: i }) => {
    const c = r.clone();
    return i && c.applyMatrix4(i), c;
  });
  const o = t.filter((r) => r.index).length;
  o > 0 && o < t.length && (t = t.map((r) => {
    if (!r.index) return r;
    const i = r.toNonIndexed();
    return r.dispose(), i;
  }));
  const n = t.reduce((r, i) => r.filter((c) => i.attributes[c] !== void 0), Object.keys(t[0].attributes));
  for (const r of t) for (const i of Object.keys(r.attributes)) n.includes(i) || r.deleteAttribute(i);
  const s = Tn(t, false);
  return t.forEach((r) => r.dispose()), s;
}
const jn = new a.Matrix4(), po = new a.Quaternion(), mo = new a.Euler(), xo = new a.Vector3(), wo = new a.Vector3();
function A(e = 0, t = 0, o = 0, n = 0, s = 0, r = 0, i = 1, c = 1, l = 1) {
  return xo.set(e, t, o), mo.set(n, s, r), po.setFromEuler(mo), wo.set(i, c, l), jn.clone().compose(xo, po, wo);
}
function D(e, t, o, n, s = 0, r = 0, i = 0) {
  const c = new a.Mesh(new a.BoxGeometry(e, t, o), n);
  return c.position.set(s, r, i), c;
}
function ne(e, t, o, n, s, r = 0, i = 0, c = 0) {
  const l = new a.Mesh(new a.CylinderGeometry(e, t, o, n), s);
  return l.position.set(r, i, c), l;
}
function zt(e, t = true, o = true) {
  return e.traverse((n) => {
    if (!n.isMesh) return;
    const s = n.userData.noShadow || n.material && !Array.isArray(n.material) && n.material.transparent;
    n.castShadow = t && !s, n.receiveShadow = o;
  }), e;
}
function Kn(e, t, o, n = 14) {
  const s = [];
  for (let r = 0; r <= n; r++) {
    const i = r / n, c = new a.Vector3().lerpVectors(e, t, i);
    c.y -= Math.sin(Math.PI * i) * o, s.push(c);
  }
  return new a.CatmullRomCurve3(s);
}
function qn(e, t = 500) {
  const o = new a.SphereGeometry(t, 32, 20), n = new a.ShaderMaterial({ side: a.BackSide, depthWrite: true, fog: false, uniforms: { uTop: { value: new a.Color(g.skyTop) }, uMid: { value: new a.Color(g.skyMid) }, uHaze: { value: new a.Color(g.skyHaze) }, uBands: { value: 26 } }, vertexShader: `
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
    ` }), s = new a.Mesh(o, n);
  s.frustumCulled = false, s.renderOrder = -10, e.add(s);
  const r = Un(), i = st(7781), c = new a.Group(), l = P({ color: g.cloud, map: r, transparent: true, opacity: 0.62, depthWrite: false, fog: false, cache: false }), f = P({ color: g.cloudShade, map: r, transparent: true, opacity: 0.34, depthWrite: false, fog: false, cache: false });
  l.map.wrapS = l.map.wrapT = a.ClampToEdgeWrapping;
  for (let u = 0; u < 22; u++) {
    const d = i.range(220, 350), h = i.range(0, Math.PI * 2), p = i.range(90, 210), x = p * i.range(0.24, 0.34), w = i.range(46, 140), M = new a.Group(), G = new a.Mesh(new a.PlaneGeometry(p, x), f);
    G.position.set(2, -x * 0.1, -1.5);
    const T = new a.Mesh(new a.PlaneGeometry(p, x), l);
    M.add(G, T), M.position.set(Math.cos(h) * d, w, Math.sin(h) * d), M.lookAt(0, w * 0.55, 0), M.renderOrder = -9, c.add(M);
  }
  return c.frustumCulled = false, e.add(c), { dome: s, clouds: c };
}
const O = 3.15, q = 1.55, St = 0.135, $n = 0.015, Ft = -80, Vt = 80, kt = 2.2, Re = 2.95, Nt = 3.35;
function U(e) {
  let t = 0;
  return t += 2 * Mt(-20, -50, e), t -= 2.4 * Mt(20, 52, e), t;
}
function nt(e) {
  return 0;
}
function Yn(e, t) {
  return e - U(t);
}
function Xn(e, t) {
  if (t < Ft || t > Vt) return false;
  const o = Math.abs(Yn(e, t));
  return Math.abs(t) < Nt ? false : o > O - 0.02 && o < O + q;
}
function yo(e, t) {
  return nt() + (Xn(e, t) ? St : 0);
}
function Jt({ z0: e, z1: t, step: o = 1.2, a: n, b: s, uv: r = [1, 1], flip: i = false }) {
  const c = Math.max(2, Math.round(Math.abs(t - e) / o) + 1), l = [], f = [], u = [];
  for (let h = 0; h < c; h++) {
    const p = h / (c - 1), x = e + (t - e) * p, w = n(x), M = s(x);
    l.push(w.x, w.y, x, M.x, M.y, x), f.push(0, p * r[1], r[0], p * r[1]);
  }
  for (let h = 0; h < c - 1; h++) {
    const p = h * 2;
    i ? u.push(p, p + 1, p + 2, p + 1, p + 3, p + 2) : u.push(p, p + 2, p + 1, p + 1, p + 2, p + 3);
  }
  const d = new a.BufferGeometry();
  return d.setAttribute("position", new a.Float32BufferAttribute(l, 3)), d.setAttribute("uv", new a.Float32BufferAttribute(f, 2)), d.setIndex(u), d.computeVertexNormals(), d;
}
const an = { z: -24 }, Ze = -98, Je = 106;
function Qn(e, t) {
  return false;
}
const X = 160, xt = 2 * Math.PI * X, at = new a.Vector3(0, -X, 0), Z = new a.Vector3(), we = new a.Quaternion(), ye = new a.Vector3(), be = new a.Matrix4();
function Zn(e, t, o = new a.Vector3()) {
  const n = e / X, s = t / X, r = Math.cos(s);
  return o.set(Math.sin(n) * r, Math.cos(n) * r, Math.sin(s));
}
function Zt(e, t, o, n = new a.Vector3()) {
  return Zn(e, o, n).multiplyScalar(X + t).add(at), n;
}
function ae(e, t, o = new a.Vector3(), n = new a.Vector3(), s = new a.Vector3()) {
  const r = e / X, i = t / X, c = Math.sin(r), l = Math.cos(r), f = Math.sin(i), u = Math.cos(i);
  return o.set(c * u, l * u, f), n.set(l, -c, 0), s.set(-c * f, -l * f, u), { up: o, east: n, north: s };
}
function sn(e, t = { x: 0, z: 0, y: 0 }) {
  Z.copy(e).sub(at);
  const o = Z.length() || 1;
  return Z.multiplyScalar(1 / o), t.z = X * Math.asin(a.MathUtils.clamp(Z.z, -1, 1)), t.x = X * Math.atan2(Z.x, Z.y), t.y = o - X, t;
}
function rn(e, t) {
  let o = e - t;
  for (; o > xt / 2; ) o -= xt;
  for (; o < -xt / 2; ) o += xt;
  return o;
}
function vt(e) {
  const t = xt;
  return ((e + t / 2) % t + t) % t - t / 2;
}
function Jn(e, t) {
  let o = e.index ? e.toNonIndexed() : e;
  const n = t * t;
  let r = Object.keys(o.attributes).map((u) => ({ name: u, size: o.attributes[u].itemSize, src: o.attributes[u].array })), i = o.attributes.position.count;
  const c = e.groups && e.groups.length ? e.groups : null;
  let l = new Int32Array(i / 3);
  if (c) for (const u of c) {
    const d = Math.floor(u.start / 3), h = Math.min(l.length, d + Math.floor(u.count / 3));
    for (let p = d; p < h; p++) l[p] = u.materialIndex ?? 0;
  }
  for (let u = 0; u < 12; u++) {
    const d = r.find((w) => w.name === "position").src;
    let h = 0;
    const p = r.map((w) => ({ name: w.name, size: w.size, dst: [] })), x = [];
    for (let w = 0; w < i; w += 3) {
      let M = -1, G = 0;
      for (let b = 0; b < 3; b++) {
        const k = w + b, R = w + (b + 1) % 3, S = d[k * 3] - d[R * 3], v = d[k * 3 + 1] - d[R * 3 + 1], B = d[k * 3 + 2] - d[R * 3 + 2], F = S * S + v * v + B * B;
        F > M && (M = F, G = b);
      }
      if (M <= n) {
        for (const b of p) {
          const k = r.find((R) => R.name === b.name).src;
          for (let R = 0; R < 3; R++) for (let S = 0; S < b.size; S++) b.dst.push(k[(w + R) * b.size + S]);
        }
        x.push(l[w / 3]);
        continue;
      }
      h++, x.push(l[w / 3], l[w / 3]);
      const T = w + G, m = w + (G + 1) % 3, z = w + (G + 2) % 3;
      for (const b of p) {
        const k = r.find((v) => v.name === b.name).src, R = [];
        for (let v = 0; v < b.size; v++) R.push((k[T * b.size + v] + k[m * b.size + v]) * 0.5);
        const S = (v) => {
          for (let B = 0; B < b.size; B++) b.dst.push(k[v * b.size + B]);
        };
        S(T), b.dst.push(...R), S(z), b.dst.push(...R), S(m), S(z);
      }
    }
    if (r = p.map((w) => ({ name: w.name, size: w.size, src: Float32Array.from(w.dst) })), l = Int32Array.from(x), i = r.find((w) => w.name === "position").src.length / 3, !h) break;
  }
  const f = new a.BufferGeometry();
  for (const u of r) f.setAttribute(u.name, new a.BufferAttribute(u.src, u.size));
  if (c) {
    let u = 0;
    for (let d = 1; d <= l.length; d++) (d === l.length || l[d] !== l[u]) && (f.addGroup(u * 3, (d - u) * 3, l[u]), u = d);
  }
  return o !== e && o.dispose(), f;
}
function ta(e, t = 3) {
  const o = Jn(e, t), n = o.attributes.position, s = new a.Vector3();
  for (let r = 0; r < n.count; r++) Zt(n.getX(r), n.getY(r), n.getZ(r), s), n.setXYZ(r, s.x, s.y, s.z);
  return n.needsUpdate = true, o.deleteAttribute("normal"), o.computeVertexNormals(), o.computeBoundingSphere(), o;
}
function ea(e, { maxEdge: t = 3 } = {}) {
  e.updateMatrixWorld(true);
  const o = (c) => {
    for (let l = c.parent; l && l !== e.parent; l = l.parent) if (l.userData.planetRigid) return true;
    return false;
  }, n = [];
  e.traverse((c) => {
    c.userData.planetRigid && !o(c) && n.push({ obj: c, world: c.matrixWorld.clone() });
  });
  const s = [];
  e.traverse((c) => {
    !c.isMesh && !c.isLine || c.userData.planetRigid || o(c) || s.push({ obj: c, world: c.matrixWorld.clone() });
  });
  const r = { wrapped: 0, instanced: 0, rigid: n.length, tris: 0 };
  for (const { obj: c, world: l } of s) {
    if (c.isInstancedMesh) {
      const f = c.count, u = c.instanceMatrix;
      for (let d = 0; d < f; d++) {
        be.fromArray(u.array, d * 16).premultiply(l), be.decompose(Z, we, ye);
        const h = ae(Z.x, Z.z), p = new a.Quaternion().setFromRotationMatrix(new a.Matrix4().makeBasis(h.east, h.up, h.north)), x = Zt(Z.x, Z.y, Z.z, new a.Vector3());
        be.compose(x, p.multiply(we), ye), be.toArray(u.array, d * 16);
      }
      u.needsUpdate = true, c.frustumCulled = false, r.instanced += f;
    } else {
      const f = c.geometry.clone().applyMatrix4(l), u = ta(f, t);
      f.dispose(), c.geometry = u, c.frustumCulled = true, r.wrapped++, r.tris += u.attributes.position.count / 3;
    }
    c.position.set(0, 0, 0), c.quaternion.identity(), c.scale.set(1, 1, 1), c.matrixAutoUpdate = true;
  }
  e.traverse((c) => {
    c === e || c.isMesh || c.isLine || c.userData.planetRigid || o(c) || (c.position.set(0, 0, 0), c.quaternion.identity(), c.scale.set(1, 1, 1));
  });
  const i = new a.Matrix4();
  for (const { obj: c, world: l } of n) {
    l.decompose(Z, we, ye);
    const f = ae(Z.x, Z.z);
    i.makeBasis(f.east, f.up, f.north), c.position.copy(Zt(Z.x, Z.y, Z.z, new a.Vector3())), c.quaternion.setFromRotationMatrix(i).multiply(we), c.scale.copy(ye);
  }
  return r;
}
function oa(e, t) {
  return 0;
}
function na(e) {
  const t = e.attributes.position, o = { x: 0, z: 0, y: 0 }, n = new a.Vector3(), s = (i) => (n.set(t.getX(i), t.getY(i), t.getZ(i)), sn(n, o), Qn()), r = [];
  for (let i = 0; i < t.count; i += 3) if (!(s(i) || s(i + 1) || s(i + 2))) for (let c = 0; c < 3; c++) r.push(t.getX(i + c), t.getY(i + c), t.getZ(i + c));
  e.setAttribute("position", new a.Float32BufferAttribute(r, 3));
}
function aa(e) {
  const t = new a.Group();
  t.name = "planet";
  const o = new a.IcosahedronGeometry(X, 30), n = o.attributes.position, s = new a.Vector3(), r = { x: 0, z: 0, y: 0 }, i = new a.Vector3();
  for (let l = 0; l < n.count; l++) {
    s.set(n.getX(l), n.getY(l), n.getZ(l)).normalize(), i.copy(s).multiplyScalar(X).add(at), sn(i, r);
    const f = oa() + nt() * 0.999 - $n - 0.065;
    i.copy(s).multiplyScalar(X + f).add(at), n.setXYZ(l, i.x, i.y, i.z);
  }
  n.needsUpdate = true, o.deleteAttribute("normal"), na(o);
  {
    const l = o.attributes.position, f = new Float32Array(l.count * 3), u = new a.Vector3();
    for (let d = 0; d < l.count; d++) u.set(l.getX(d), l.getY(d), l.getZ(d)).sub(at).normalize(), f[d * 3] = u.x, f[d * 3 + 1] = u.y, f[d * 3 + 2] = u.z;
    o.setAttribute("normal", new a.BufferAttribute(f, 3));
  }
  const c = new a.Mesh(o, y({ color: 12563607, bands: 4, tint: 8024982, flat: false }));
  return c.receiveShadow = true, c.castShadow = false, c.frustumCulled = false, c.name = "planetLand", t.add(c), e.add(t), { group: t, land: c };
}
const sa = `
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
`, ra = `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() { gl_FragColor = vec4( uColor, uOpacity ); }
`, cn = new a.Vector2(1920, 1080), ln = /* @__PURE__ */ new Set();
function dn(e, t) {
  cn.set(e, t), ln.forEach((o) => o.uniforms.uResolution.value.set(e, t));
}
const Ue = /* @__PURE__ */ new WeakMap();
function ia(e) {
  if (Ue.has(e)) return Ue.get(e);
  let t;
  try {
    t = Cn(e.clone(), 1e-4), t.computeVertexNormals();
  } catch {
    t = e.clone();
  }
  for (const o of Object.keys(t.attributes)) o !== "position" && o !== "normal" && t.deleteAttribute(o);
  return Ue.set(e, t), t;
}
function gt(e, { thickness: t = 38e-4, color: o = g.ink, opacity: n = 1 } = {}) {
  if (!e || !e.geometry) return null;
  const s = new a.ShaderMaterial({ uniforms: { uThickness: { value: t }, uColor: { value: new a.Color(o) }, uOpacity: { value: n }, uResolution: { value: cn.clone() } }, vertexShader: sa, fragmentShader: ra, side: a.BackSide, transparent: n < 1, depthWrite: true, fog: false });
  ln.add(s);
  const r = ia(e.geometry);
  let i;
  return e.isInstancedMesh ? (i = new a.InstancedMesh(r, s, e.count), i.instanceMatrix = e.instanceMatrix, i.count = e.count) : i = new a.Mesh(r, s), i.castShadow = false, i.receiveShadow = false, i.renderOrder = (e.renderOrder || 0) - 1, i.frustumCulled = e.frustumCulled, e.add(i), i;
}
const ca = 1.62, la = 0.34, da = 0.38, Wt = { eye: 1.4, seatFwd: 0.46, nose: 0.92, noseR: 0.3, steer: 1.75 };
class fa {
  constructor(t, o, n, s = {}) {
    this.camera = t, this.dom = o, this.world = n, this.spawn = { pos: new a.Vector3(2.2, 0, -6.5), yaw: s.yaw ?? Math.PI + 0.14, pitch: s.pitch ?? -0.01 }, s.pos && this.spawn.pos.copy(s.pos), this.pos = this.spawn.pos.clone(), this.yaw = this.spawn.yaw, this.pitch = this.spawn.pitch, this.vel = new a.Vector3(), this.bob = 0, this.locked = false, this.keys = /* @__PURE__ */ new Set(), this.walkSpeed =
    2.55, this.runSpeed = 5.1, this.rideSpeed = this.runSpeed * 1.5, this.sensitivity = 22e-4, this.ride = null, this.roll = 0, this.yawRate = 0, this._prevYaw = this.yaw, this._forward = new a.Vector3(), this._right = new a.Vector3(), this._wish = new a.Vector3(), this._probe = new a.Vector3(), this._up = new a.Vector3(), this._east = new a.Vector3(), this._north = new a.Vector3(), this._basis = new a.
    Matrix4(), this._surfaceQ = new a.Quaternion(), this._localQ = new a.Quaternion(), this._localE = new a.Euler(), this.raycaster = new a.Raycaster(), this.raycaster.far = 3, this.hovered = null, this.onInteract = null, this.onLockChange = null, this._bind(), this.applyCamera(0);
  }
  _bind() {
    const t = (o) => {
      this.locked && (this.yaw -= o.movementX * this.sensitivity, this.pitch -= o.movementY * this.sensitivity, this.pitch = Ot(this.pitch, -1.15, 1.05));
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
    this.touchActive && (this.yaw -= t * this.sensitivity * 2.4, this.pitch = Ot(this.pitch - o * this.sensitivity * 2.4, -1.15, 1.05));
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
    this._resolveAt(this.pos, t, o, la);
  }
  _resolveAt(t, o, n, s) {
    for (const r of o) {
      if (r.top !== void 0 && r.top <= n + da || r.bottom !== void 0 && r.bottom > n + 1.9) continue;
      const i = r.x0 - s, c = r.x1 + s, l = r.z0 - s, f = r.z1 + s;
      if (t.x <= i || t.x >= c || t.z <= l || t.z >= f) continue;
      const u = t.x - i, d = c - t.x, h = t.z - l, p = f - t.z, x = Math.min(u, d, h, p);
      x === u ? t.x = i : x === d ? t.x = c : x === h ? t.z = l : t.z = f;
    }
  }
  update(t) {
    const o = this.keys, n = this.ride !== null, s = o.has("ShiftLeft") || o.has("ShiftRight"), r = n ? this.rideSpeed : s ? this.runSpeed : this.walkSpeed;
    let i = 0, c = 0;
    (this.locked || this.touchActive) && ((o.has("KeyW") || o.has("ArrowUp")) && (i += 1), (o.has("KeyS") || o.has("ArrowDown")) && (i -= 1), (o.has("KeyD") || o.has("ArrowRight")) && (c += 1), (o.has("KeyA") || o.has("ArrowLeft")) && (c -= 1)), n && c && (this.yaw -= c * Wt.steer * t), this._forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)), this._right.set(Math.cos(this.yaw), 0, -Math.sin(
    this.yaw)), n ? this._wish.copy(this._forward).multiplyScalar(i > 0 ? r : i < 0 ? -1.7 : 0) : (this._wish.copy(this._forward).multiplyScalar(i).addScaledVector(this._right, c), this._wish.lengthSq() > 1e-6 && this._wish.normalize().multiplyScalar(r));
    const l = n ? i > 0 ? 5 : i < 0 ? 9 : 3.6 : this._wish.lengthSq() > 1e-6 ? 13 : 16, f = 1 - Math.exp(-l * t);
    this.vel.x += (this._wish.x - this.vel.x) * f, this.vel.z += (this._wish.z - this.vel.z) * f;
    const u = this.world.heightAt(this.pos.x, this.pos.z), d = this.world.colliders, h = 1 / Math.max(0.25, Math.cos(this.pos.z / X)), p = this.vel.x * t * h, x = this.vel.z * t, w = Math.max(1, Math.ceil(Math.max(Math.abs(p), Math.abs(x)) / 0.18));
    for (let b = 0; b < w; b++) this.pos.x += p / w, this._resolve(d, u), this.pos.z += x / w, this._resolve(d, u);
    if (n) {
      const b = this._probe.copy(this.pos).addScaledVector(this._forward, Wt.nose), k = b.x, R = b.z;
      this._resolveAt(b, d, u, Wt.noseR), this.pos.x += b.x - k, this.pos.z += b.z - R, this._resolve(d, u);
    }
    this.pos.x = vt(this.pos.x);
    const M = this.world.bounds;
    this.pos.z = Ot(this.pos.z, M.z0, M.z1);
    const G = this.world.heightAt(this.pos.x, this.pos.z, this.pos.y);
    this.pos.y += (G - this.pos.y) * (1 - Math.exp(-18 * t));
    const T = Math.hypot(this.vel.x, this.vel.z), m = (this.yaw - this._prevYaw) / Math.max(t, 1e-4);
    this._prevYaw = this.yaw, this.yawRate += (m - this.yawRate) * (1 - Math.exp(-9 * t));
    const z = n ? Ot(this.yawRate, -2.6, 2.6) * 0.05 * Math.min(T / this.rideSpeed, 1) : 0;
    this.roll += (z - this.roll) * (1 - Math.exp(-7 * t)), this.bob += t * T * (s ? 8.2 : 6.4), this.applyCamera(T);
  }
  applyCamera(t) {
    const o = this.ride !== null, n = o ? 0 : Math.min(t / this.walkSpeed, 1) * 0.014, s = this.pos.y + (o ? Wt.eye : ca) + Math.sin(this.bob) * n, r = ae(this.pos.x, this.pos.z, this._up, this._east, this._north);
    this._basis.makeBasis(this._east, this._up, this._north), this._surfaceQ.setFromRotationMatrix(this._basis), this._localE.set(this.pitch, this.yaw, this.roll + Math.sin(this.bob * 0.5) * n * 0.35, "YXZ"), this._localQ.setFromEuler(this._localE), Zt(this.pos.x, s, this.pos.z, this.camera.position), this.camera.quaternion.copy(this._surfaceQ).multiply(this._localQ), this.camera.up.copy(r.up);
  }
  pick(t) {
    if (!t.length) return this.hovered = null, null;
    this.raycaster.set(this.camera.position, this._forward.set(0, 0, -1).applyQuaternion(this.camera.quaternion));
    const o = t.map((s) => s.hitbox), n = this.raycaster.intersectObjects(o, false);
    return this.hovered = n.length ? t[o.indexOf(n[0].object)] : null, this.hovered;
  }
}
function ua({ volume: e = 0.34 } = {}) {
  const t = (v, B, F, j) => {
    const C = document.createElement(v);
    return B && (C.className = B), j !== void 0 && (C.innerHTML = j), (F || document.body).appendChild(C), C;
  }, o = t("div", "hud"), n = t("div", "crosshair", o), s = t("div", "prompt", o, ""), r = t("div", "toast", o, ""), i = t("div", "memory-card", o, "");
  i.setAttribute("role", "dialog");
  let c = false;
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
  const p = h.querySelector(".menu-action"), x = h.querySelector(".audio-control"), w = h.querySelector(".volume-slider"), M = h.querySelector(".audio-head output"), G = (v) => {
    const B = Math.round(Math.max(0, Math.min(1, v)) * 100);
    w.value = String(B), w.style.setProperty("--volume", `${B}%`), M.value = `${B}%`, M.textContent = `${B}%`, w.setAttribute("aria-valuetext", `${B}%`);
  };
  G(e);
  let T = 0, m = true, z = null, b = false, k = 0, R = false;
  const S = { root: o, overlay: h, onStart: null, onVolumeChange: null, flash(v, B = 1400) {
    r.textContent = v, r.classList.add("on"), clearTimeout(z), z = setTimeout(() => r.classList.remove("on"), B);
  }, setPrompt(v) {
    v ? (s.textContent = v, s.classList.add("on")) : s.classList.remove("on");
  }, setPlanetView(v) {
    n.classList.toggle("hidden", v);
  }, setLocked(v) {
    v && (R = true), h.dataset.mode = R ? "paused" : "start", h.classList.toggle("hidden", v), h.setAttribute("aria-hidden", v ? "true" : "false"), n.classList.toggle("on", v), v ? (T = 0, m = true, f.classList.remove("faded")) : requestAnimationFrame(() => p.focus({ preventScroll: true }));
  }, setVolume(v) {
    G(v);
  }, setMuted(v) {
    x.classList.toggle("muted", v);
  }, toggleHint() {
    m = !m, f.classList.toggle("faded", !m), T = m ? 0 : 1e9;
  }, toggleCoords() {
    return b = !b, u.classList.toggle("on", b), k = 1e9, b;
  }, get coordsVisible() {
    return b;
  }, setCoords(v, B, F, j = 0) {
    if (!b || (k += j, k < 0.1)) return;
    k = 0;
    const C = (E, K = 2) => E.toFixed(K);
    let L = B % (Math.PI * 2);
    L > Math.PI && (L -= Math.PI * 2), L <= -Math.PI && (L += Math.PI * 2);
    const I = ["north +z", "north-west", "west -x", "south-west", "south -z", "south-east", "east +x", "north-east"][((4 - Math.round(L / (Math.PI * 2) * 8)) % 8 + 8) % 8];
    d = `{ pos: [${C(v.x, 1)}, 0, ${C(v.z, 1)}], yaw: ${C(L)}, pitch: ${C(F)} }`, u.innerHTML = `<span class="k">x</span>${C(v.x)} <span class="k">z</span>${C(v.z)} <span class="k">y</span>${C(v.y)}<br><span class="k">yaw</span>${C(L)} <span class="k">pitch</span>${C(F)} <span class="d">${I}</span><br><span class="s">${d}</span><br><span class="d">click or Shift+C to copy</span>`;
  }, copyCoords() {
    if (!d) return false;
    const v = () => (S.flash("copied  \xB7  " + d, 2200), true);
    try {
      if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(d).then(v, () => S.copyFallback(d)), true;
    } catch {
    }
    return S.copyFallback(d) ? v() : false;
  }, copyFallback(v) {
    const B = document.createElement("textarea");
    B.value = v, B.setAttribute("readonly", ""), B.style.cssText = "position:fixed;top:-1000px;opacity:0", document.body.appendChild(B), B.select();
    let F = false;
    try {
      F = document.execCommand("copy");
    } catch {
      F = false;
    }
    return B.remove(), F;
  }, update(v, B) {
    !B || !m || (T += v, T > 11 && (f.classList.add("faded"), m = false));
  } };
  p.addEventListener("click", (v) => {
    v.stopPropagation(), S.onStart?.();
  }), h.addEventListener("click", (v) => {
    v.target.closest(".audio-control") || S.onStart?.();
  });
  for (const v of ["click", "pointerdown", "pointerup"]) x.addEventListener(v, (B) => B.stopPropagation());
  return w.addEventListener("input", () => {
    const v = Number(w.value) / 100;
    G(v), S.onVolumeChange?.(v);
  }), window.addEventListener("keydown", (v) => {
    v.code === "KeyH" && S.toggleHint(), v.code === "KeyC" && (v.shiftKey ? b && S.copyCoords() : S.flash(S.toggleCoords() ? "coordinates on" : "coordinates off", 900));
  }), u.style.pointerEvents = "auto", u.style.cursor = "copy", u.addEventListener("click", (v) => {
    v.stopPropagation(), S.copyCoords();
  }), S.showCard = ({ title: v, body: B }) => {
    i.innerHTML = `<button class="card-close" aria-label="close">\u2715</button>
      <h3></h3><p></p>`, i.querySelector("h3").textContent = v, i.querySelector("p").textContent = B, i.classList.add("on"), c = true, i.querySelector(".card-close").addEventListener("click", (F) => {
      F.stopPropagation(), S.hideCard();
    });
  }, S.hideCard = () => {
    i.classList.remove("on"), c = false;
  }, S.cardIsOpen = () => c, window.addEventListener("keydown", (v) => {
    v.code === "Escape" && c && S.hideCard();
  }), S.bindTouch = ({ player: v, onPlanet: B, onMusic: F, onEnter: j }) => {
    const C = (I, E) => {
      const K = I.dataset.key, ft = I.dataset.act;
      K && (E ? v.touchPress(K) : v.touchRelease(K)), E && (ft === "interact" && v.touchInteract(), ft === "planet" && B?.(), ft === "music" && F?.());
    };
    l.querySelectorAll(".tbtn").forEach((I) => {
      I.addEventListener("pointerdown", (E) => {
        E.preventDefault(), C(I, true);
      }), I.addEventListener("pointerup", () => C(I, false)), I.addEventListener("pointercancel", () => C(I, false)), I.addEventListener("pointerleave", () => C(I, false));
    });
    const L = document.getElementById("view");
    let W = null;
    L.addEventListener("touchstart", (I) => {
      I.touches.length === 1 && (W = { x: I.touches[0].clientX, y: I.touches[0].clientY }, j?.());
    }, { passive: true }), L.addEventListener("touchmove", (I) => {
      if (!W || I.touches.length !== 1) return;
      const E = I.touches[0];
      v.touchLook(E.clientX - W.x, E.clientY - W.y), W = { x: E.clientX, y: E.clientY }, I.preventDefault();
    }, { passive: false }), L.addEventListener("touchend", () => {
      W = null;
    });
  }, S;
}
const ie = ["bfcmusic-divine-sakura-garden-fairytale-music-283353.mp3"].map((e) => `./audio/${e}`);
function ha({ volume: e = 0.34, fadeIn: t = 2.6 } = {}) {
  let o = [], n = -1;
  function s() {
    o = ie.map((m, z) => z);
    for (let m = o.length - 1; m > 0; m--) {
      const z = Math.floor(Math.random() * (m + 1));
      [o[m], o[z]] = [o[z], o[m]];
    }
    if (o.length > 1 && o[0] === n) {
      const m = 1 + Math.floor(Math.random() * (o.length - 1));
      [o[0], o[m]] = [o[m], o[0]];
    }
  }
  function r() {
    return o.length === 0 && s(), n = o.shift(), n;
  }
  let i = r();
  const c = new Audio(ie[i]);
  c.loop = false, c.preload = "auto", c.volume = 0;
  let l = e, f = e > 1e-3 ? e : 0.34, u = e <= 1e-3, d = false, h = ie.length === 0, p = null, x = null;
  const w = (m) => Math.max(0, Math.min(1, m));
  function M() {
    ie.length && (i = r(), c.src = ie[i], c.load());
  }
  function G(m, z) {
    l = w(m), clearInterval(p), clearTimeout(x);
    const b = () => {
      clearInterval(p), clearTimeout(x), p = x = null, c.volume = l, l === 0 && u && c.pause();
    }, k = Math.abs(l - c.volume);
    if (!(z > 0) || k < 4e-3) return b();
    const R = 33, S = R / 1e3 * (k / z);
    p = setInterval(() => {
      const v = l - c.volume;
      c.volume = w(c.volume + Math.sign(v) * Math.min(Math.abs(v), S)), Math.abs(l - c.volume) < 4e-3 && b();
    }, R), x = setTimeout(b, z * 1e3 + 600);
  }
  const T = { el: c, get muted() {
    return u;
  }, get volume() {
    return e;
  }, get available() {
    return !h;
  }, start() {
    d || h || (d = true, c.volume = 0, !u && c.play().then(() => G(e, t), () => {
      h = true, d = false;
    }));
  }, toggle() {
    return h || (u = !u, u ? G(0, 0.35) : (e <= 1e-3 && (e = f), c.paused && c.play().catch(() => {
      h = true;
    }), G(e, 0.5))), u;
  }, setVolume(m) {
    return e = w(m), e > 1e-3 ? (f = e, u = false, d && (c.paused && c.play().catch(() => {
      h = true;
    }), G(e, 0.3))) : (u = true, d && G(0, 0.25)), u;
  } };
  return c.addEventListener("ended", () => {
    M(), !(!d || h || u || document.hidden) && c.play().catch(() => {
      h = true, d = false;
    });
  }), document.addEventListener("visibilitychange", () => {
    !d || h || u || (document.hidden ? c.pause() : c.play().catch(() => {
    }));
  }), T;
}
const ct = 3.4, pa = 7, ma = 17, bo = pa, go = ma, xa = 5.5, Te = [{ x: 161, z: -45.2, bank: 0.5, dr: 14, dm: 2.5, cr: 2.2, fa: 0.48 }, { x: 154, z: -48.8, bank: 0.5, dr: 15, dm: 2.6, cr: 2.2, fa: 0.48 }, { x: 147.2, z: -52.2, bank: 0.46, dr: 14, dm: 2.5, cr: 4.2, fa: 0.46, hi: 10 }, { x: 143.6, z: -60, bank: 0.26, dr: 16, dm: 2.6, cr: 5.6, fa: 0.46, hi: 12, ho: 24 }, { x: 142.4, z: -70, bank: 0.21,
dr: 17, dm: 2.6, cr: 6.4, fa: 0.44, hi: 14, ho: 28 }, { x: 142.2, z: -80, bank: 0.2, dr: 18, dm: 2.6, cr: 6.8, fa: 0.44, hi: 15, ho: 30 }, { x: 145, z: -90, bank: 0.24, dr: 17, dm: 2.6, cr: 7, fa: 0.44, hi: 14, ho: 28 }, { x: 147.6, z: -100, bank: 0.38, dr: 14, dm: 2.5, cr: 7.2, fa: 0.44, hi: 11, ho: 24 }, { x: 148.6, z: -110, bank: 0.26, dr: 16, dm: 2.3, cr: 6.8, fa: 0.42, hi: 9 }, { x: 151.6, z: -118,
bank: 0.22, dr: 18, dm: 2.1, cr: 6.2, fa: 0.42 }, { x: 159.4, z: -125.6, bank: 0.18, dr: 20, dm: 1.9, cr: 5.6, fa: 0.4 }, { x: 170, z: -131.6, bank: 0.24, dr: 18, dm: 1.9, cr: 5.4, fa: 0.4, hi: 11, ho: 24 }, { x: 181, z: -135.6, bank: 0.26, dr: 16, dm: 1.8, cr: 5.4, fa: 0.4, hi: 12, ho: 24 }, { x: 184, z: -126, bank: 0.3, dr: 14, dm: 1.9, cr: 5, fa: 0.4 }, { x: 186, z: -116, bank: 0.32, dr: 13, dm: 2.1,
cr: 4.8, fa: 0.4 }, { x: 189, z: -107, bank: 0.34, dr: 12, dm: 2.3, cr: 4.6, fa: 0.4 }, { x: 194, z: -101, bank: 0.36, dr: 12, dm: 2.4, cr: 4.2, fa: 0.4 }, { x: 199, z: -105, bank: 0.34, dr: 12, dm: 2.3, cr: 4.6, fa: 0.4 }, { x: 201, z: -114, bank: 0.3, dr: 13, dm: 2.1, cr: 4.8, fa: 0.4 }, { x: 200, z: -124, bank: 0.26, dr: 15, dm: 1.8, cr: 5, fa: 0.4 }, { x: 202, z: -134, bank: 0.11, dr: 26, dm: 1.1,
cr: 5.4, fa: 0.38 }, { x: 214, z: -136.5, bank: 0.1, dr: 28, dm: 1, cr: 5.6, fa: 0.38 }, { x: 226, z: -135, bank: 0.12, dr: 26, dm: 1.1, cr: 5.8, fa: 0.38 }, { x: 236, z: -130, bank: 0.16, dr: 22, dm: 1.6, cr: 6.4, fa: 0.4 }, { x: 243, z: -120, bank: 0.3, dr: 17, dm: 2.3, cr: 7.2, fa: 0.42 }, { x: 247, z: -108, bank: 0.34, dr: 15, dm: 2.5, cr: 7.4, fa: 0.42 }, { x: 249.6, z: -96, bank: 0.38, dr: 14,
dm: 2.5, cr: 7.6, fa: 0.42 }, { x: 249.8, z: -84, bank: 0.4, dr: 14, dm: 2.5, cr: 7.6, fa: 0.42 }, { x: 247, z: -72, bank: 0.38, dr: 15, dm: 2.5, cr: 7.4, fa: 0.42 }, { x: 242, z: -60, bank: 0.32, dr: 16, dm: 2.4, cr: 7, fa: 0.42 }, { x: 234, z: -50, bank: 0.26, dr: 18, dm: 2.2, cr: 6.4, fa: 0.4 }, { x: 224, z: -43, bank: 0.24, dr: 19, dm: 2.2, cr: 6.2, fa: 0.42 }, { x: 212, z: -40, bank: 0.26, dr: 20,
dm: 2.4, cr: 6.4, fa: 0.44 }, { x: 199, z: -39.4, bank: 0.28, dr: 20, dm: 2.5, cr: 6.8, fa: 0.46 }, { x: 186, z: -39.6, bank: 0.28, dr: 20, dm: 2.5, cr: 7.2, fa: 0.46 }, { x: 174, z: -40.6, bank: 0.3, dr: 18, dm: 2.5, cr: 7.2, fa: 0.46 }, { x: 166, z: -42.4, bank: 0.36, dr: 16, dm: 2.5, cr: 6, fa: 0.46 }], ro = Te.map((e, t) => {
  const o = Te[(t + 1) % Te.length], n = o.x - e.x, s = o.z - e.z;
  return { a: e, b: o, dx: n, dz: s, len: Math.hypot(n, s), l2: n * n + s * s || 1e-6, s0: 0 };
});
{
  let e = 0;
  for (const t of ro) t.s0 = e, e += t.len;
}
const Ht = (() => {
  let e = 1 / 0, t = -1 / 0, o = 1 / 0, n = -1 / 0;
  for (const s of Te) e = Math.min(e, s.x), t = Math.max(t, s.x), o = Math.min(o, s.z), n = Math.max(n, s.z);
  return { x0: e, x1: t, z0: o, z1: n };
})(), ce = 62;
function fn(e, t) {
  let o = false;
  for (const n of ro) {
    const { a: s, b: r } = n;
    if (s.z > t != r.z > t) {
      const i = (t - s.z) / (r.z - s.z);
      e < s.x + i * (r.x - s.x) && (o = !o);
    }
  }
  return o;
}
function un(e, t) {
  if (e < Ht.x0 - ce || e > Ht.x1 + ce || t < Ht.z0 - ce || t > Ht.z1 + ce) return null;
  let o = 1 / 0, n = null, s = 0;
  for (const u of ro) {
    let d = ((e - u.a.x) * u.dx + (t - u.a.z) * u.dz) / u.l2;
    d = d < 0 ? 0 : d > 1 ? 1 : d;
    const h = u.a.x + u.dx * d, p = u.a.z + u.dz * d, x = (e - h) * (e - h) + (t - p) * (t - p);
    x < o && (o = x, n = u, s = d);
  }
  const r = Math.sqrt(o), i = fn(e, t);
  if (!i && r > ce) return null;
  const { a: c, b: l } = n, f = (u, d) => u + (d - u) * s;
  return { d: i ? r : -r, bank: f(c.bank, l.bank), dr: f(c.dr, l.dr), dm: f(c.dm, l.dm), cr: f(c.cr, l.cr), fa: f(c.fa, l.fa), hi: f(c.hi ?? bo, l.hi ?? bo), ho: f(c.ho ?? go, l.ho ?? go), arc: n.s0 + n.len * s };
}
function wa(e, t) {
  return e < Ht.x0 - 1 || e > Ht.x1 + 1 || t < Ht.z0 - 1 || t > Ht.z1 + 1 ? false : fn(e, t);
}
function ya(e, t, o) {
  if (!o || o.d >= 0) return -1 / 0;
  const n = -o.d, s = Math.sin(o.arc * 0.062) * 4 + Math.sin(o.arc * 0.148 + 1.7) * 1.8, r = Math.max(2, xa + s), i = o.cr * (1 + 0.09 * Math.sin(o.arc * 0.091 + 0.4)), c = i / Math.max(0.08, o.bank);
  return n <= c ? ct + o.bank * n : n <= c + r ? ct + i : ct + i - (n - c - r) * o.fa;
}
const ba = [{ a: [143, -44], b: [157, -37], crest: 6.3, half: 3.4, face: 0.5 }], ga = ba.map((e) => {
  const t = e.b[0] - e.a[0], o = e.b[1] - e.a[1];
  return { d: e, dx: t, dz: o, l2: t * t + o * o || 1e-6 };
});
function Ma(e, t) {
  let o = -1 / 0;
  for (const n of ga) {
    let s = ((e - n.d.a[0]) * n.dx + (t - n.d.a[1]) * n.dz) / n.l2;
    s = s < 0 ? 0 : s > 1 ? 1 : s;
    const r = n.d.a[0] + n.dx * s, i = n.d.a[1] + n.dz * s, c = Math.hypot(e - r, t - i), l = c <= n.d.half ? n.d.crest : n.d.crest - (c - n.d.half) * n.d.face;
    l > o && (o = l);
  }
  return o;
}
const za = [{ id: "spill", half: 1.6, wall: 0.9, pts: [[158.6, -42.6, ct + 0.3], [157.4, -38.8, ct + 0.05], [155.6, -34.6, 3.1], [153.4, -31.4, 3], [151, -29, 2.95]] }, { id: "outfall", half: 1.9, wall: 0.7, pts: [[151, -29, 2.95], [143, -27.4, 2.2], [134, -26.6, 1.4], [124, -26.2, 0.55], [116, -26, 0.1], [110, -25.4, -0.1]] }, { id: "inflowSW", half: 1.2, wall: 0.8, pts: [[158, -127, ct - 0.3], [
154, -133, ct + 0.7], [149, -140, ct + 2.4], [144, -147, ct + 4.4]] }, { id: "inflowE", half: 0.9, wall: 0.8, pts: [[250.6, -90, ct - 0.25], [256, -89, ct + 0.9], [262, -87, ct + 2.6]] }], hn = [];
for (const e of za) for (let t = 0; t < e.pts.length - 1; t++) {
  const o = e.pts[t], n = e.pts[t + 1], s = n[0] - o[0], r = n[1] - o[1];
  hn.push({ c: e, a: o, b: n, dx: s, dz: r, l2: s * s + r * r || 1e-6 });
}
function ka(e, t) {
  let o = 1 / 0;
  for (const n of hn) {
    let s = ((e - n.a[0]) * n.dx + (t - n.a[1]) * n.dz) / n.l2;
    s = s < 0 ? 0 : s > 1 ? 1 : s;
    const r = n.a[0] + n.dx * s, i = n.a[1] + n.dz * s, c = Math.hypot(e - r, t - i);
    if (c > n.c.half + 8) continue;
    const l = n.a[2] + (n.b[2] - n.a[2]) * s, f = c <= n.c.half ? l : l + (c - n.c.half) * n.c.wall;
    f < o && (o = f);
  }
  return o;
}
function va(e, t, o, n) {
  const s = un(t, o);
  if (!s) return e;
  let r = e;
  const i = -1.3, c = (d) => d === -1 / 0 ? -1 / 0 : i + (d - i) * n, l = c(Ma(t, o));
  l > r && (r = l);
  const f = c(ya(t, o, s));
  if (f > r && (r = f), s.d >= 0) {
    const d = Ot(s.d / s.dr, 0, 1);
    r = ct - s.dm * d * d * (3 - 2 * d);
  } else {
    const d = -s.d, h = ct + s.bank * d, p = h < r ? h : r, x = Mt(s.hi, s.ho, d);
    r = p + (r - p) * x;
  }
  const u = ka(t, o);
  return u < r ? u : r;
}
function Sa(e, t, o) {
  const n = un(e, t);
  if (!n) return 1;
  if (n.d > -2) return 0;
  const s = Ot((-n.d - 2) / 10, 0, 1), r = Ot((o - ct - 0.9) / 2.4, 0, 1);
  return s < r ? s : r;
}
const ut = 1.5, Ga = 2.6, je = 21, Aa = [{ x: 24, z: -116, rx: 76, rz: 30, h: 8 }, { x: 72, z: -112, rx: 50, rz: 26, h: 7 }, { x: -30, z: -114, rx: 54, rz: 26, h: 7 }, { x: 30, z: -140, rx: 66, rz: 56, h: 16.5 }, { x: -26, z: -136, rx: 60, rz: 52, h: 14 }, { x: 86, z: -134, rx: 58, rz: 50, h: 14.5 }, { x: 22, z: -162, rx: 80, rz: 40, h: 17 }, { x: -84, z: -150, rx: 62, rz: 48, h: 14 }, { x: 104, z: -164,
rx: 56, rz: 44, h: 14.5 }, { x: -124, z: -122, rx: 44, rz: 46, h: 12.5 }, { x: 124, z: -118, rx: 44, rz: 46, h: 12.5 }, { x: -118, z: -88, rx: 46, rz: 44, h: 13 }, { x: -122, z: -52, rx: 44, rz: 34, h: 13.5 }, { x: -112, z: 16, rx: 46, rz: 56, h: 17 }, { x: -140, z: 24, rx: 28, rz: 30, h: 13.5 }, { x: -90, z: 26, rx: 26, rz: 28, h: 12 }, { x: -108, z: 56, rx: 42, rz: 32, h: 12.5 }, { x: -98, z: 84,
rx: 36, rz: 26, h: 9.5 }, { x: 118, z: -84, rx: 44, rz: 42, h: 12.5 }, { x: 124, z: -48, rx: 42, rz: 32, h: 12.5 }, { x: 122, z: 20, rx: 42, rz: 34, h: 12.5 }, { x: 110, z: 58, rx: 38, rz: 30, h: 11 }, { x: 102, z: 88, rx: 34, rz: 26, h: 8.5 }, { x: 123, z: -13, rx: 60, rz: 15, h: 13 }, { x: 170, z: -26, rx: 46, rz: 30, h: 11.5 }, { x: 214, z: -24, rx: 46, rz: 30, h: 11 }, { x: 252, z: -36, rx: 34,
rz: 32, h: 10 }, { x: 266, z: -76, rx: 34, rz: 42, h: 11 }, { x: 258, z: -118, rx: 34, rz: 34, h: 10.5 }, { x: 214, z: -152, rx: 56, rz: 34, h: 11.5 }, { x: 158, z: -146, rx: 42, rz: 32, h: 11 }, { x: 188, z: -106, rx: 21, rz: 18, h: 11 }], pn = [{ x0: -68, x1: 88, z0: -80, z1: 114, r: 13 }, { x0: -6, x1: 94, z0: -96, z1: -60, r: 13 }, { x0: -84, x1: -64, z0: -32, z1: 4, r: 11 }], Ie = [{ id: "W",
x0: -132, x1: -96, zS: -15, zN: 24, zCrest: 2, crestMid: 17, crestEnd: 12.2, half: 3.3, spring: 3.2, arch: 3.3, walk: -1, bank: 1, narrowChannel: false, gateX: -84.5 }, { id: "E", x0: 108, x1: 138, zS: -15, zN: 21, zCrest: 0, crestMid: 13.2, crestEnd: 11.4, half: 3.3, spring: 3.2, arch: 3.3, walk: 1, bank: 0, narrowChannel: true, gateX: 85 }], mn = Ie.map((e) => ({ x0: e.x0, x1: e.x1, z0: e.zS, z1: e.
zN })), pt = -112, qt = 200, mt = -128, $t = 72, Ta = (e) => Mt(-196, -170, e);
function Ca(e, t) {
  let o = 1;
  for (const n of Aa) {
    const s = (e - n.x) / n.rx, r = (t - n.z) / n.rz, i = s * s + r * r;
    if (i >= 1) continue;
    const c = n.h * (1 - i) * (1 - i);
    if (o *= 1 - c / je, o <= 0) return je;
  }
  return je * (1 - o);
}
const Mo = (e, t) => {
  let o = 0;
  for (const n of Ie) if (!(t && !t(n)) && (o = Math.max(o, Mt(n.x0 - 44, n.x0 - 20, e) * Mt(n.x1 + 44, n.x1 + 20, e)), o >= 1)) return 1;
  return o;
}, Ba = (e) => e.narrowChannel, zo = 8, Ra = (e) => Mt(Ze - zo, Ze, e) * Mt(Je + zo, Je, e);
function Ia(e, t) {
  const o = Mt(7.5, 16 - 6.5 * Mo(e), Math.abs(t)), n = 1 - Ra(e) * (1 - Mt(6.5, 14 - 3 * Mo(e, Ba), Math.abs(t - an.z)));
  let s = Math.min(o, n);
  if (s <= 0) return 0;
  for (const r of pn) {
    const i = Math.max(r.x0 - e, e - r.x1, 0), c = Math.max(r.z0 - t, t - r.z1, 0);
    if (s *= Mt(0, r.r, Math.hypot(i, c)), s <= 0) return 0;
  }
  return s;
}
function Ea(e, t) {
  for (const o of mn) if (e > o.x0 && e < o.x1 && t > o.z0 && t < o.z1) return true;
  return false;
}
function Pa(e, t) {
  return nn(((e & 1023) << 10 ^ t & 1023) + 40503)() - 0.5;
}
const Da = (() => {
  const e = st(778213), t = [];
  for (let n = 0; n < 170; n++) {
    const s = e.range(-166, 166), r = e.range(-190, 104), i = e.range(7, 21);
    t.push({ x: s, z: r, rx: i * e.range(0.7, 1.4), rz: i * e.range(0.7, 1.4), h: e.range(0.55, 2.05) * (e.chance(0.34) ? -1 : 1) });
  }
  const o = st(551907);
  for (let n = 0; n < 76; n++) {
    const s = o.range(158, 302), r = o.range(-190, 104), i = o.range(7, 21);
    t.push({ x: s, z: r, rx: i * o.range(0.7, 1.4), rz: i * o.range(0.7, 1.4), h: o.range(0.55, 2.05) * (o.chance(0.34) ? -1 : 1) });
  }
  return t;
})();
function La(e, t) {
  let o = 0;
  for (const n of Da) {
    const s = (e - n.x) / n.rx, r = (t - n.z) / n.rz, i = s * s + r * r;
    i >= 1 || (o += n.h * (1 - i) * (1 - i));
  }
  return o;
}
const _a = (() => {
  const e = st(511903), t = [];
  for (let n = 0; n < 2400; n++) {
    const s = e.range(2.8, 6.8);
    t.push({ x: e.range(-168, 168), z: e.range(-194, 108), rx: s * e.range(0.75, 1.3), rz: s * e.range(0.75, 1.3), h: e.range(0.26, 0.78) * (e.chance(0.42) ? -1 : 1) });
  }
  const o = st(613481);
  for (let n = 0; n < 1040; n++) {
    const s = o.range(2.8, 6.8);
    t.push({ x: o.range(158, 302), z: o.range(-194, 108), rx: s * o.range(0.75, 1.3), rz: s * o.range(0.75, 1.3), h: o.range(0.26, 0.78) * (o.chance(0.42) ? -1 : 1) });
  }
  return t;
})(), ee = 8, to = /* @__PURE__ */ new Map(), xe = (e, t) => e * 4096 + t;
for (const e of _a) {
  const t = Math.floor((e.x - e.rx) / ee), o = Math.floor((e.x + e.rx) / ee), n = Math.floor((e.z - e.rz) / ee), s = Math.floor((e.z + e.rz) / ee);
  for (let r = t; r <= o; r++) for (let i = n; i <= s; i++) {
    const c = xe(r, i);
    let l = to.get(c);
    l || to.set(c, l = []), l.push(e);
  }
}
function Na(e, t) {
  const o = to.get(xe(Math.floor(e / ee), Math.floor(t / ee)));
  if (!o) return 0;
  let n = 0;
  for (const s of o) {
    const r = (e - s.x) / s.rx, i = (t - s.z) / s.rz, c = r * r + i * i;
    c >= 1 || (n += s.h * (1 - c) * (1 - c));
  }
  return n;
}
const Oa = (() => {
  const e = st(390211), t = [];
  for (let n = 0; n < 8e3; n++) {
    const s = e.range(1.4, 3.4);
    t.push({ x: e.range(-168, 168), z: e.range(-194, 108), rx: s * e.range(0.75, 1.3), rz: s * e.range(0.75, 1.3), h: e.range(0.1, 0.3) * (e.chance(0.45) ? -1 : 1) });
  }
  const o = st(728533);
  for (let n = 0; n < 3440; n++) {
    const s = o.range(1.4, 3.4);
    t.push({ x: o.range(158, 302), z: o.range(-194, 108), rx: s * o.range(0.75, 1.3), rz: s * o.range(0.75, 1.3), h: o.range(0.1, 0.3) * (o.chance(0.45) ? -1 : 1) });
  }
  return t;
})(), oe = 4, eo = /* @__PURE__ */ new Map();
for (const e of Oa) {
  const t = Math.floor((e.x - e.rx) / oe), o = Math.floor((e.x + e.rx) / oe), n = Math.floor((e.z - e.rz) / oe), s = Math.floor((e.z + e.rz) / oe);
  for (let r = t; r <= o; r++) for (let i = n; i <= s; i++) {
    const c = xe(r, i);
    let l = eo.get(c);
    l || eo.set(c, l = []), l.push(e);
  }
}
function Fa(e, t) {
  const o = eo.get(xe(Math.floor(e / oe), Math.floor(t / oe)));
  if (!o) return 0;
  let n = 0;
  for (const s of o) {
    const r = (e - s.x) / s.rx, i = (t - s.z) / s.rz, c = r * r + i * i;
    c >= 1 || (n += s.h * (1 - c) * (1 - c));
  }
  return n;
}
const Va = (() => {
  const e = st(20857), t = [];
  for (let n = 0; n < 1100; n++) {
    const s = e.range(6, 17);
    t.push({ x: e.range(-172, 172), z: e.range(-198, 112), rx: s * e.range(0.7, 1.45), rz: s * e.range(0.7, 1.45), h: e.range(0.5, 1.15) * (e.chance(0.5) ? -1 : 1) });
  }
  const o = st(884117);
  for (let n = 0; n < 470; n++) {
    const s = o.range(6, 17);
    t.push({ x: o.range(158, 306), z: o.range(-198, 112), rx: s * o.range(0.7, 1.45), rz: s * o.range(0.7, 1.45), h: o.range(0.5, 1.15) * (o.chance(0.5) ? -1 : 1) });
  }
  return t;
})(), ge = 24, ko = /* @__PURE__ */ new Map();
for (const e of Va) {
  const t = Math.floor((e.x - e.rx) / ge), o = Math.floor((e.x + e.rx) / ge), n = Math.floor((e.z - e.rz) / ge), s = Math.floor((e.z + e.rz) / ge);
  for (let r = t; r <= o; r++) for (let i = n; i <= s; i++) {
    const c = xe(r, i);
    let l = ko.get(c);
    l || ko.set(c, l = []), l.push(e);
  }
}
const vo = { main: [[18, -94.5], [15.4, -98.4], [10, -101], [1, -103.4], [-9, -105.6], [-19, -108.4], [-26.5, -112.6], [-24, -117.6], [-14, -120], [-3, -122.4], [8, -126.4], [17, -131], [24.6, -135.6]], ridge: [[24.6, -135.6], [17, -137.6], [8, -138.2], [-1, -137.4], [-10, -136.2], [-18, -135]], deck: [[24.6, -135.6], [29.6, -135.2], [35.4, -135.4]], hokora: [[-26.5, -112.6], [-32, -111], [-37, -112]],
glade: [[-14, -120], [-18, -124.5], [-16, -129]], foot: [[13, -97.4], [26, -97.6], [40, -98], [54, -98.4], [68, -98.2], [80, -96.6], [86, -93.8]], toverW: [[-66, 22], [-70, 25.5], [-75, 26], [-79.5, 23], [-82.5, 19], [-84.5, 15.5], [-86, 12]], toverE: [[91, -18.8], [97.5, -18.2], [104, -17.4], [106, -16.6], [99, -15.6], [97.8, -14.8], [100.6, -13.6], [101.4, -12.4], [104, -12]] }, Wa = 1.1, Ha = 2.7,
So = { lakeRoad: { flat: 2.7, fade: 5, pts: [[89, -60, 0], [89, -46, 0], [90.4, -36.4, 0], [96, -33.6, 0], [104, -32.4, 0.1], [112, -31.6, 0.6], [120, -31.4, 1.7], [130, -32, 3], [139, -33, 4.1], [147, -34, 5.1], [153, -35.2, 5.8], [157, -37, 6.3]] }, damRoad: { flat: 3.2, fade: 4.6, pts: [[157, -37, 6.3], [152.6, -39.2, 6.3], [148, -41.5, 6.3], [143, -44, 6.2], [140.4, -48, 5.9]] }, shoreRoad: { flat: 2.6,
fade: 4.8, pts: [[139.4, -51.6], [134.6, -57], [131.4, -64], [130, -72], [130, -80], [131.8, -88], [134.8, -95.6], [138.8, -103], [144.2, -111.6], [150.6, -119.6], [158, -128], [166, -137], [173, -145.6], [179, -153.6], [186.4, -158.4], [195, -159.6], [203, -157], [209.4, -153.8]] }, shoreWalk: { flat: 1.5, fade: 3.4, pts: [[145.6, -53.6], [141.2, -58.4], [139.6, -64], [138.8, -71], [138.6, -79], [
139.8, -86], [142, -92.6], [144.4, -99.4], [145.2, -106], [147, -113], [151, -120.2], [157, -127], [165.4, -132.2], [175, -136.6], [185.4, -140.4], [196, -142.6], [206, -143.4], [216, -143.6], [226, -142], [235, -138], [242.4, -132], [247.4, -124], [251, -115], [253, -105], [253.6, -96], [252.6, -89]] }, mikaharashi: { flat: 1.2, fade: 2.9, pts: [[86, -95.4], [92, -95.6], [98, -95.8], [102.6, -96.8],
[106, -99.2], [109, -96.6], [112.4, -94.8], [115, -97.4], [117.6, -100.2], [120.6, -98], [123.2, -100.8], [124.6, -104.4], [123.8, -112.2], [127.4, -112], [130.4, -110.6], [133, -109], [134.8, -107.6], [137, -108.6], [139, -110.4], [141.6, -111.4], [143.8, -109.8], [145, -106.4]] }, pierSpur: { flat: 1.2, fade: 2.6, pts: [[139, -79.4], [141.4, -79.8]] }, suijinSpur: { flat: 1.1, fade: 2.5, pts: [[
252.6, -89], [252.8, -91.4]] } }, xn = (() => {
  const e = [], t = (o, n, s, r, i) => {
    const c = n[0] - o[0], l = n[1] - o[1];
    e.push({ a: o, b: n, dx: c, dz: l, l2: c * c + l * l || 1e-6, flat: s, fade: r, given: i });
  };
  for (const o of Object.keys(vo)) {
    const n = vo[o];
    for (let s = 0; s < n.length - 1; s++) t(n[s], n[s + 1], Wa, Ha, false);
  }
  for (const o of Object.keys(So)) {
    const n = So[o], s = n.pts[0].length > 2;
    for (let r = 0; r < n.pts.length - 1; r++) t(n.pts[r], n.pts[r + 1], n.flat, n.fade, s);
  }
  return e;
})();
function wn(e, t) {
  let o = 1e9, n = null, s = 0;
  for (const r of xn) {
    let i = ((e - r.a[0]) * r.dx + (t - r.a[1]) * r.dz) / r.l2;
    i = i < 0 ? 0 : i > 1 ? 1 : i;
    const c = Math.hypot(e - (r.a[0] + r.dx * i), t - (r.a[1] + r.dz * i));
    c < o && (o = c, n = r, s = i);
  }
  return { d: o, seg: n, t: s };
}
function Ua(e, t) {
  const o = wn(e, t), n = o.seg.flat + 0.1, s = n + 2;
  return o.d <= n ? 0 : o.d >= s ? 1 : (o.d - n) / 2;
}
const ja = (e, t) => (e & 1 ^ t & 1) === 1, Ce = qt - pt + 1, bt = $t - mt + 1, Ct = new Float32Array(Ce * bt);
function Ka(e, t) {
  const o = Math.abs(t) < 24, n = Math.abs(t + 24) < 22;
  return o || n ? 1.9 : 0.52;
}
const Ke = -1.3 + 5e-3;
{
  const e = Ea;
  for (let o = pt; o <= qt; o++) for (let n = mt; n <= $t; n++) {
    const s = o * ut, r = n * ut, i = Ia(s, r);
    Ct[(o - pt) * bt + (n - mt)] = e(s, r) ? -1.3 : Math.max(-1.3, va(Ca(s, r) * i * Ta(r) - Ga, s, r, i));
  }
  const t = new Float32Array(Ce * bt);
  for (let o = pt; o <= qt; o++) for (let n = mt; n <= $t; n++) t[(o - pt) * bt + (n - mt)] = Ka(o * ut, n * ut) * ut;
  for (let o = 0; o < 140; o++) {
    let n = false;
    for (let s = 0; s < Ce; s++) for (let r = 0; r < bt; r++) {
      const i = s * bt + r, c = Ct[i];
      if (c <= Ke) continue;
      let l = 1 / 0;
      for (let f = 0; f < 4; f++) {
        const u = s + (f === 0 ? 1 : f === 1 ? -1 : 0), d = r + (f === 2 ? 1 : f === 3 ? -1 : 0);
        if (u < 0 || u >= Ce || d < 0 || d >= bt) continue;
        const h = u * bt + d;
        l = Math.min(l, Ct[h] + Math.max(t[i], t[h]));
      }
      l < c && (Ct[i] = Math.max(-1.3, l), n = true);
    }
    if (!n) break;
  }
  for (let o = pt; o <= qt; o++) for (let n = mt; n <= $t; n++) {
    const s = (o - pt) * bt + (n - mt), r = Ct[s];
    if (r <= Ke) continue;
    const i = o * ut, c = n * ut;
    if (e(i, c)) continue;
    const l = Math.max(0, Math.min(1, r / 2.4)), f = Math.max(0, Math.min(1, r / 1.6)), u = Math.max(0, Math.min(1, r / 0.7)), d = Sa(i, c, r), h = Ua(i, c) * d;
    let p = La(i, c) * l * (0.2 + 0.8 * d) + (Pa(o, n) * 0.21 * l + Na(i, c) * f + Fa(i, c) * u) * h;
    r > 0 && p < -0.75 * r && (p = -0.75 * r), Ct[s] = Math.max(-1.3, r + p);
  }
  {
    const o = /* @__PURE__ */ new Map(), n = (s) => s[0] + "," + s[1];
    for (const s of xn) for (const r of [s.a, s.b]) o.has(n(r)) || o.set(n(r), s.given ? r[2] : qa(r[0], r[1]));
    for (let s = pt; s <= qt; s++) for (let r = mt; r <= $t; r++) {
      const i = (s - pt) * bt + (r - mt), c = Ct[i];
      if (c <= Ke) continue;
      const l = s * ut, f = r * ut;
      if (e(l, f)) continue;
      const u = wn(l, f);
      if (u.d >= u.seg.fade) continue;
      const { a: d, b: h } = u.seg, p = o.get(n(d)) + (o.get(n(h)) - o.get(n(d))) * u.t;
      if (p > c && $a(l, f) || wa(l, f)) continue;
      const x = u.d <= u.seg.flat ? 1 : (u.seg.fade - u.d) / (u.seg.fade - u.seg.flat);
      Ct[i] = Math.max(-1.3, c + (p - c) * x);
    }
  }
}
function Me(e, t) {
  return e < pt || e > qt || t < mt || t > $t ? -1.3 : Ct[(e - pt) * bt + (t - mt)];
}
function qa(e, t) {
  const o = Math.floor(e / ut), n = Math.floor(t / ut);
  if (o < pt || o >= qt || n < mt || n >= $t) return -1.3;
  const s = e / ut - o, r = t / ut - n, i = Me(o, n), c = Me(o + 1, n), l = Me(o, n + 1), f = Me(o + 1, n + 1);
  return ja(o, n) ? s + r <= 1 ? i + (c - i) * s + (l - i) * r : f + (f - l) * (s - 1) + (f - c) * (r - 1) : s >= r ? i + (c - i) * s + (f - c) * r : i + (f - l) * s + (l - i) * r;
}
function $a(e, t) {
  for (const o of mn) if (e > o.x0 - 1 && e < o.x1 + 1 && t > o.z0 - 1 && t < o.z1 + 1) return false;
  if (Math.abs(t) < 7.5 || e > Ze && e < Je && Math.abs(t - an.z) < 6.5) return true;
  for (const o of pn) if (e >= o.x0 && e <= o.x1 && t >= o.z0 && t <= o.z1) return true;
  return false;
}
const le = 1.44, Ya = 0.3, Gt = -xt / 2, Et = xt / 2, Go = -150, Ao = 150, To = () => y({ color: g.railMetal, bands: 3, tint: 6248568, flat: false }), Co = () => y({ color: g.railHead, bands: 2, tint: 7301264 }), Xa = () => y({ color: g.sleeper, bands: 3, tint: 6117496 }), Qa = () => y({ color: g.ballast, bands: 3, tint: 6643076 }), Za = () => y({ color: g.gateYellow, bands: 3, tint: 9400400 }), Ja = () => y(
{ color: g.gateBlack, bands: 2, tint: 4932960 }), yn = () => y({ color: g.metal, bands: 3, tint: 6709392 }), bn = () => y({ color: g.metalDark, bands: 3, tint: 6051456 }), Bo = () => y({ color: g.cabinet, bands: 3, tint: 7301264 }), ts = () => y({ color: g.concrete, bands: 3, tint: 7301008 });
function es(e) {
  const t = new a.Group();
  t.name = "railway", e.add(t);
  {
    const r = new a.Shape();
    r.moveTo(-kt - 0.9, 0), r.lineTo(-kt, 0.26), r.lineTo(kt, 0.26), r.lineTo(kt + 0.9, 0), r.closePath();
    const i = new a.ExtrudeGeometry(r, { depth: Et - Gt, bevelEnabled: false });
    i.rotateY(Math.PI / 2), i.translate(Gt, 0, 0);
    const c = new a.Mesh(i, Qa());
    c.receiveShadow = true, c.name = "ballast", t.add(c);
  }
  {
    const r = new a.BoxGeometry(0.24, 0.16, 2.5), i = Math.floor((Et - Gt) / 0.62), c = new a.InstancedMesh(r, Xa(), i), l = new a.Object3D();
    let f = 0;
    for (let u = Gt; u < Et; u += 0.62) Math.abs(u) < O + q + 0.6 || (l.position.set(u, 0.32, 0), l.rotation.set(0, 0, 0), l.updateMatrix(), c.setMatrixAt(f++, l.matrix));
    c.count = f, c.receiveShadow = true, c.castShadow = true, t.add(c);
  }
  {
    const r = Et - Gt, i = wt([{ geometry: new a.BoxGeometry(r, 0.055, 0.115), matrix: A(0, 0.392, 0) }, { geometry: new a.BoxGeometry(r, 0.1, 0.05), matrix: A(0, 0.325, 0) }, { geometry: new a.BoxGeometry(r, 0.03, 0.17), matrix: A(0, 0.27, 0) }]);
    for (const c of [-1, 1]) {
      const l = new a.Mesh(i.clone(), To());
      l.position.set((Gt + Et) / 2, 0, c * le / 2), l.castShadow = true, l.receiveShadow = true, l.name = "rail", t.add(l);
      const f = D(r, 0.016, 0.09, Co(), (Gt + Et) / 2, 0.424, c * le / 2);
      f.userData.noOutline = true, t.add(f);
    }
    i.dispose();
  }
  {
    const r = O * 2 + q * 2 + 1, i = U(0), c = y({ color: 14341599, bands: 3, tint: 7301008 }), l = D(r, 0.28, le - 0.26, c, i, 0.18, 0);
    l.receiveShadow = true, t.add(l);
    for (const u of [-1, 1]) {
      const d = D(r, 0.28, 1.55, c, i, 0.18, u * (le / 2 + 0.12 + 0.78));
      d.receiveShadow = true, t.add(d);
    }
    for (const u of [-1, 1]) {
      const d = u * le / 2, h = D(r, 0.12, 0.115, To(), i, 0.36, d);
      h.receiveShadow = true, t.add(h);
      const p = D(r, 0.016, 0.09, Co(), i, 0.424, d);
      p.userData.noOutline = true, t.add(p);
      for (const x of [-1, 1]) t.add(D(r, 0.06, 0.055, y({ color: 5064535, bands: 2, tint: 4275288 }), i, 0.33, d + x * 0.086));
    }
    const f = y({ color: g.lineYellow, bands: 2, tint: 9400400 });
    for (const u of [-1, 1]) {
      for (const [d, h] of [[0.42, 0.3], [0.92, 0.16]]) {
        const p = new a.PlaneGeometry(O * 2 - 0.15, h);
        p.rotateX(-Math.PI / 2);
        const x = new a.Mesh(p, f);
        x.position.set(i, 0.335, u * (kt + d)), x.userData.noOutline = true, t.add(x);
      }
      for (let d = -5; d <= 5; d++) {
        const h = new a.PlaneGeometry(0.5, 0.11);
        h.rotateX(-Math.PI / 2), h.rotateY(Math.PI / 4);
        const p = new a.Mesh(h, f);
        p.position.set(i + d * 0.56, 0.333, u * (kt + 0.67)), p.userData.noOutline = true, t.add(p);
      }
    }
  }
  const o = kt + 1.05, n = O + q + 0.5;
  {
    const r = [], i = new a.BoxGeometry(1, 0.06, 0.06), c = new a.BoxGeometry(0.07, 1.12, 0.07), l = new a.BoxGeometry(0.035, 0.5, 0.035), f = (h, p, x) => {
      let w = [[p, x]];
      const M = [];
      for (const G of Ie) M.push([G.x0, G.x1]), Math.sign(h) === G.walk && M.push([G.gateX - 0.9, G.gateX + 0.9]);
      for (const [G, T] of M) {
        const m = [];
        for (const [z, b] of w) {
          if (T <= z || G >= b) {
            m.push([z, b]);
            continue;
          }
          G - z > 0.6 && m.push([z, G]), b - T > 0.6 && m.push([T, b]);
        }
        w = m;
      }
      return w.map(([G, T]) => [h, G, T]);
    }, u = [...f(o, Go + 22, -n), ...f(o, n, Ao - 22), ...f(-o, Go + 22, -n), ...f(-o, n, 13.5), ...f(-o, 39.5, Ao - 22)];
    for (const [h, p, x] of u) {
      const w = x - p, M = (p + x) / 2;
      for (const G of [0.55, 1.02]) r.push({ geometry: i, matrix: A(M, G, h, 0, 0, 0, w, 1, 1) });
      for (let G = p; G <= x; G += 2.4) r.push({ geometry: c, matrix: A(G, 0.56, h) });
      for (let G = p + 0.3; G <= x; G += 0.32) r.push({ geometry: l, matrix: A(G, 0.78, h) });
      e.collide(p, h - 0.12, x, h + 0.12, 1.2);
    }
    const d = new a.Mesh(wt(r), yn());
    d.castShadow = true, d.name = "linesideFence", t.add(d), [i, c, l].forEach((h) => h.dispose());
  }
  {
    const r = bn(), i = [], c = xt / Math.round(xt / 19), l = 0.02;
    for (let d = Gt + c; d <= Et - c * 0.5; d += c) {
      if (Math.abs(d) < 8 || Ie.some((p) => d > p.x0 - 16 && d < p.x1 + 16)) continue;
      const h = -3.6500000000000004;
      i.push({ geometry: new a.CylinderGeometry(0.09, 0.13, 6.6, 6), matrix: A(d, 3.3, h) }), i.push({ geometry: new a.BoxGeometry(0.1, 0.1, l - h), matrix: A(d, 6.1, (h + l) * 0.5) }), i.push({ geometry: new a.BoxGeometry(0.09, 1, 0.09), matrix: A(d, 5.6, l) }), i.push({ geometry: new a.CylinderGeometry(0.05, 0.05, 0.28, 6), matrix: A(d, 5.02, l) });
    }
    const f = new a.Mesh(wt(i), r);
    f.castShadow = true, t.add(f);
    const u = y({ color: g.metalDark, bands: 2, tint: 4867176 });
    for (const [d, h] of [[4.88, 0.022], [5.95, 0.026]]) {
      const p = [];
      for (let G = Gt; G <= Et; G += c) p.push(new a.Vector3(G, d - (d > 5 ? 0.12 : 0), l)), p.push(new a.Vector3(G + c * 0.5, d, l));
      const x = new a.CatmullRomCurve3(p), w = Math.round(xt / 2.5), M = new a.Mesh(new a.TubeGeometry(x, w, h, 4, false), u);
      M.name = "catenaryWire", t.add(M);
    }
  }
  const s = os(e, t);
  ns(e, t);
  {
    const r = y({ color: g.concreteMid, bands: 3, tint: 6972040 }), i = [[kt + 2.6, -80, -30], [kt + 2.6, 46, 80], [-4.800000000000001, -80, -30], [-4.800000000000001, 44, 80]], c = y({ color: g.concrete, bands: 3, tint: 7301008 });
    for (const [l, f, u] of i) {
      const d = D(u - f, 2.2, 0.35, r, (f + u) / 2, 1.1, l);
      d.castShadow = true, d.receiveShadow = true, t.add(d), e.collide(f, l - 0.2, u, l + 0.2, 2.2);
      for (const h of [f, u]) {
        const x = h - (h === f ? 1 : -1) * 0.22, w = D(0.52, 2.52, 0.62, r, x, 1.26, l);
        w.castShadow = w.receiveShadow = true, t.add(w);
        const M = D(0.62, 0.1, 0.72, c, x, 2.57, l);
        M.receiveShadow = true, t.add(M), e.collide(x - 0.31, l - 0.36, x + 0.31, l + 0.36, 2.62);
      }
    }
  }
  return s;
}
function os(e, t) {
  const o = new a.Group();
  o.name = "crossing", t.add(o);
  const n = U(0), s = Za(), r = Ja(), i = yn(), c = bn(), l = Bo(), f = [], u = [];
  function d(m) {
    const z = new a.Group(), b = 0.52, k = Math.round(m / b), R = new a.BoxGeometry(b, 0.17, 0.09), S = [], v = [];
    for (let j = 0; j < k; j++) {
      const C = A(b * (j + 0.5), 0, 0);
      (j % 2 === 0 ? S : v).push({ geometry: R, matrix: C });
    }
    const B = new a.Mesh(wt(S), s), F = new a.Mesh(wt(v), r);
    B.castShadow = F.castShadow = true, z.add(B, F);
    for (let j = 1; j < k - 1; j += 3) {
      const C = D(0.11, 0.11, 0.07, P({ color: g.signalOff }), b * (j + 0.5), -0.14, 0.06);
      C.userData.lamp = "arm", f.push(C), z.add(C), z.add(D(0.03, 0.12, 0.03, c, b * (j + 0.5), -0.05, 0.06));
    }
    return gt(B, { thickness: 32e-4 }), gt(F, { thickness: 32e-4 }), R.dispose(), z;
  }
  function h(m, z, b) {
    const k = new a.Group(), R = n + m * (O + 0.42), S = z * Re;
    k.position.set(R, nt(), S), k.userData.planetRigid = true;
    const v = D(0.66, 0.2, 0.62, ts(), 0, 0.1, 0);
    if (v.receiveShadow = v.castShadow = true, k.add(v), b === "arm") {
      const I = D(0.46, 0.92, 0.38, Bo(), 0, 0.66, 0);
      I.castShadow = I.receiveShadow = true, k.add(I), gt(I, { thickness: 34e-4 }), k.add(D(0.54, 0.07, 0.46, y({ color: g.cabinetTop, bands: 3 }), 0, 0.2 + 0.92 + 0.03, 0));
      for (let K = 0; K < 3; K++) k.add(D(0.48, 0.11, 0.4, K % 2 ? r : s, 0, 0.34 + K * 0.24, 0));
      const E = new a.Group();
      E.position.set(0, 0.2 + 0.92 + 0.12, z * 0.2), E.add(d(O * 2 + 0.5)), E.rotation.y = m > 0 ? Math.PI : 0, E.rotation.z = Math.PI / 2, k.add(E), u.push({ pivot: E }), k.add(D(0.2, 0.2, 0.14, c, 0, 0.2 + 0.92 + 0.12, z * 0.2));
    }
    const B = b === "arm" ? m * 0.44 : 0, F = 2.45, j = ne(0.075, 0.09, F, 8, s, B, 0.2 + F / 2, 0);
    j.castShadow = true, k.add(j);
    for (let W = 0; W < 4; W++) k.add(ne(0.082, 0.082, 0.22, 8, r, B, 0.42 + W * 0.56, 0));
    gt(j, { thickness: 32e-4 }), b === "arm" && k.add(D(0.5, 0.09, 0.09, c, B / 2, 0.2 + 0.5, 0));
    const C = new a.Group();
    C.position.set(B, 0.2 + F + 0.02, z * 0.02), C.rotation.y = z > 0 ? 0 : Math.PI, C.add(D(0.86, 0.13, 0.1, r, 0, 0.06, 0));
    for (const W of [-0.28, 0.28]) {
      const I = new a.Mesh(new a.CylinderGeometry(0.145, 0.16, 0.13, 12, 1, true), r);
      I.rotation.x = Math.PI / 2, I.position.set(W, -0.12, 0.07), C.add(I);
      const E = new a.Mesh(new a.CircleGeometry(0.16, 14), r);
      E.position.set(W, -0.12, 0), C.add(E);
      const K = new a.Mesh(new a.CircleGeometry(0.13, 14), P({ color: g.signalOff, cache: false }));
      K.position.set(W, -0.12, 0.135), K.userData.lamp = W < 0 ? "a" : "b", f.push(K), C.add(K);
    }
    const L = new a.Mesh(new a.SphereGeometry(0.13, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), i);
    if (L.rotation.x = Math.PI, L.position.set(0, 0.3, 0), C.add(L), k.add(C), b === "sign") {
      const W = [P({ color: g.wallWhite }), P({ color: g.wallWhite }), P({ color: g.wallWhite }), P({ color: g.wallWhite }), P({ color: 16777215, map: Nn(), cache: false }), P({ color: g.wallGray })], I = new a.Mesh(new a.BoxGeometry(1.15, 0.58, 0.05), W);
      I.position.set(0, 0.2 + F + 0.62, z * 0.05), I.rotation.y = z > 0 ? 0 : Math.PI, I.castShadow = true, k.add(I), gt(I, { thickness: 3e-3 });
      for (const E of [0.72, -0.72]) {
        const K = D(1.2, 0.15, 0.045, s, 0, 0.2 + F + 1.28, z * 0.05);
        K.rotation.z = E, K.castShadow = true, k.add(K);
      }
      k.add(ne(0.06, 0.07, 1.3, 8, s, 0, 0.2 + F + 0.65, 0));
    }
    return o.add(k), e.collide(R - 0.4, S - 0.35, R + 0.4, S + 0.35, 2.4), k;
  }
  h(-1, 1, "arm"), h(1, -1, "arm"), h(1, 1, "sign"), h(-1, -1, "sign");
  {
    const m = -Re - 1.15, z = n - (O + 1.5), b = D(0.78, 1.32, 0.5, l, z, nt() + 0.66, m);
    b.castShadow = b.receiveShadow = true, o.add(b), gt(b, { thickness: 3e-3 });
    const k = D(0.86, 0.08, 0.58, y({ color: g.cabinetTop, bands: 3 }), z, nt() + 1.36, m);
    o.add(k);
    const R = D(0.52, 0.9, 0.4, l, z - 0.9, nt() + 0.45, m + 0.1);
    R.castShadow = R.receiveShadow = true, o.add(R), o.add(D(0.6, 0.06, 0.46, y({ color: g.cabinetTop, bands: 3 }), z - 0.9, nt() + 0.93, m + 0.1)), o.add(D(0.02, 1, 0.02, y({ color: g.metalDark, bands: 2 }), z, nt() + 0.66, m - 0.26));
    const S = D(0.07, 0.07, 0.03, P({ color: g.signalRed }), z + 0.24, nt() + 1.16, m - 0.26);
    o.add(S), e.collide(z - 1.3, m - 0.4, z + 0.5, m + 0.4, nt() + 1.4);
    const v = D(0.3, 0.4, 0.12, y({ color: g.yellow, bands: 3 }), z, nt() + 1, m - 0.3);
    v.castShadow = true, o.add(v);
    const B = D(0.9, 1.6, 0.9, P({ color: 16711680, cache: false }), z, nt() + 0.8, m);
    B.visible = false, o.add(B), e.interact({ hitbox: B, label: "\u8E0F\u5207\u30B9\u30A4\u30C3\u30C1  \xB7  call a train", action: () => T.request?.() });
  }
  {
    const m = y({ color: g.concrete, bands: 3, tint: 7301008 });
    for (const z of [-1, 1]) {
      const b = n + z * (O + 0.15), k = D(0.34, 0.16, kt * 2 + 1.6, m, b, nt() + 0.08, 0);
      k.receiveShadow = true, k.castShadow = true, o.add(k);
      for (const R of [-1, 1]) {
        const S = new a.Mesh(new a.PlaneGeometry(1.35, 0.6), y({ color: 16777215, bands: 2, map: on(true), tint: 9400400, cache: false }));
        S.rotation.x = -Math.PI / 2, S.position.set(n + z * (O + 0.82), nt() + St + 0.016, R * (Nt + 0.32)), o.add(S);
      }
    }
  }
  const p = new a.Color(g.signalRed), x = new a.Color(g.signalOff), w = f.filter((m) => m.userData.lamp === "arm"), M = f.filter((m) => m.userData.lamp === "a"), G = f.filter((m) => m.userData.lamp === "b");
  for (const m of f) m.material = m.material.clone();
  const T = { group: o, arms: u, active: false, armT: 0, _blink: 0, request: null, setLamps(m, z) {
    const b = m && z < 0.5 ? p : x, k = m && z >= 0.5 ? p : x;
    M.forEach((S) => S.material.color.copy(b)), G.forEach((S) => S.material.color.copy(k));
    const R = m && z < 0.5 ? p : x;
    w.forEach((S) => S.material.color.copy(R));
  }, setArms(m) {
    this.armT = m;
    const z = m < 0.5 ? 2 * m * m : 1 - Math.pow(-2 * m + 2, 2) / 2;
    for (const b of u) b.pivot.rotation.z = (1 - z) * (Math.PI / 2) * 0.99 + 4e-3;
  } };
  return T.setLamps(false, 0), T.setArms(0), T;
}
function ns(e, t, o) {
  const n = new a.Group();
  n.name = "station", t.add(n);
  const s = 15.5, r = 38, i = -1.92, c = i - 3.7, l = 0.98, f = y({ color: g.concrete, bands: 3, tint: 7301008 }), u = y({ color: g.concreteMid, bands: 3, tint: 6972040 }), d = D(r - s, l, i - c, f, (s + r) / 2, l / 2, (i + c) / 2);
  d.castShadow = d.receiveShadow = true, n.add(d), e.platform({ x0: s, x1: r, z0: c, z1: i, top: l }), e.collide(s - 0.1, c - 0.1, r + 0.1, i + 0.1, l), n.add(D(r - s, 0.06, 0.34, u, (s + r) / 2, l - 0.02, i - 0.17));
  const h = new a.Mesh(new a.PlaneGeometry(r - s - 1, 0.46), y({ color: 16777215, bands: 2, map: on(), tint: 9400400, cache: false }));
  h.material.map.repeat.set((r - s - 1) / 0.46, 1), h.material.map.wrapS = a.RepeatWrapping, h.rotation.x = -Math.PI / 2, h.position.set((s + r) / 2, l + 0.012, i - 0.62), n.add(h);
  {
    const x = (s + r) / 2 + 1.5, w = 9.5, M = 3.2, G = [];
    for (const z of [x - w / 2 + 0.6, x + w / 2 - 0.6]) for (const b of [i - 0.9, c + 0.7]) G.push({ geometry: new a.CylinderGeometry(0.075, 0.075, 2.6, 8), matrix: A(z, l + 1.3, b) });
    const T = new a.Mesh(wt(G), y({ color: g.metalDark, bands: 3 }));
    T.castShadow = true, n.add(T);
    const m = D(w, 0.16, M, y({ color: g.roofTeal, bands: 3, tint: 4867176 }), x, l + 2.66, (i + c) / 2 - 0.1);
    m.castShadow = m.receiveShadow = true, n.add(m), n.add(D(w + 0.3, 0.1, 0.14, y({ color: g.metal, bands: 3 }), x, l + 2.56, (i + c) / 2 - 1.75)), gt(m, { thickness: 3e-3 });
    for (const z of [x - 2.2, x + 1.4]) {
      const b = new a.Group();
      b.add(D(1.7, 0.08, 0.42, y({ color: g.wallCream, bands: 3 }), 0, 0.42, 0)), b.add(D(1.7, 0.5, 0.07, y({ color: g.wallCream, bands: 3 }), 0, 0.66, -0.2));
      for (const k of [-0.7, 0.7]) b.add(D(0.1, 0.42, 0.36, y({ color: g.metalDark, bands: 3 }), k, 0.21, 0));
      b.position.set(z, l, c + 0.95), b.traverse((k) => {
        k.isMesh && (k.castShadow = true);
      }), n.add(b);
    }
  }
  for (const x of [s + 4, r - 4.5]) {
    const w = ne(0.06, 0.06, 2.2, 8, y({ color: g.metalDark, bands: 3 }), x, l + 1.1, i - 0.55);
    w.castShadow = true, n.add(w);
    const M = new a.Mesh(new a.BoxGeometry(1.9, 0.5, 0.06), [P({ color: g.wallWhite }), P({ color: g.wallWhite }), P({ color: g.wallWhite }), P({ color: g.wallWhite }), P({ color: 16777215, map: On(), cache: false }), P({ color: g.wallGray })]);
    M.position.set(x, l + 2.25, i - 0.55), M.castShadow = true, n.add(M), gt(M, { thickness: 3e-3 });
  }
  {
    const x = [];
    for (let M = s; M <= r; M += 2.2) x.push({ geometry: new a.BoxGeometry(0.08, 1.2, 0.08), matrix: A(M, l + 0.6, c + 0.06) });
    for (const M of [l + 0.5, l + 1.1]) x.push({ geometry: new a.BoxGeometry(r - s, 0.06, 0.06), matrix: A((s + r) / 2, M, c + 0.06) });
    const w = new a.Mesh(wt(x), y({ color: g.metal, bands: 3 }));
    w.castShadow = true, n.add(w);
  }
  {
    for (let w = 0; w < 6; w++) {
      const M = l * ((6 - w) / 6), G = s - 0.18 - w * 0.36, T = D(0.36, M, 2.4, f, G, M / 2, c + 1.3);
      T.castShadow = T.receiveShadow = true, n.add(T), e.platform({ x0: G - 0.21, x1: G + 0.21, z0: c + 0.1, z1: c + 2.5, top: M });
    }
    for (const w of [c + 0.1, c + 2.5]) {
      const M = D(2.4, 0.07, 0.07, y({ color: g.metal, bands: 3 }), s - 1.2, 0.95, w);
      M.rotation.z = 0.36, n.add(M);
    }
  }
  for (const x of [s + 2.5, (s + r) / 2 - 3.5, r - 2]) {
    const w = ne(0.055, 0.055, 3.1, 8, y({ color: g.metalDark, bands: 3 }), x, l + 1.55, c + 0.5);
    w.castShadow = true, n.add(w);
    const M = new a.Mesh(new a.ConeGeometry(0.26, 0.22, 10, 1, true), y({ color: g.wallGray, bands: 3 }));
    M.position.set(x, l + 3.05, c + 0.5), n.add(M), n.add(D(0.18, 0.05, 0.18, P({ color: 16774100 }), x, l + 2.92, c + 0.5));
  }
  const p = new a.Mesh(new a.BoxGeometry(0.36, 0.72, 0.04), [P({ color: g.wallGray }), P({ color: g.wallGray }), P({ color: g.wallGray }), P({ color: g.wallGray }), P({ color: 16777215, map: en(1), cache: false }), P({ color: g.wallGray })]);
  return p.position.set(s + 8.5, l + 1, c + 0.02), p.rotation.y = Math.PI, n.add(p), n;
}
const Pt = 19.4, it = 2.86, Ro = 20.1, Dt = 1.06, At = 3.74, de = 3.96, as = 4.88, H = {};
function ss() {
  H.body || (H.body = y({ color: g.trainBody, bands: 3, tint: 7301014 }), H.bodyShade = y({ color: g.trainBodyShade, bands: 3, tint: 7301014 }), H.stripe = y({ color: g.trainStripe, bands: 3, tint: 4868754 }), H.stripe2 = y({ color: g.trainStripe2, bands: 3, tint: 4151946 }), H.roof = y({ color: g.trainRoof, bands: 3, tint: 6314367 }), H.skirt = y({ color: g.trainSkirt, bands: 3, tint: 5985408 }),
  H.window = P({ color: g.trainWindow }), H.windowLit = P({ color: g.trainWindowLit }), H.door = y({ color: g.trainDoor, bands: 3, tint: 7301014 }), H.dark = y({ color: g.black, bands: 2, tint: 4932960 }), H.metal = y({ color: g.metalDark, bands: 3, tint: 6051456 }), H.wheel = y({ color: 4867410, bands: 2, tint: 4932960 }), H.headlight = P({ color: 16774874 }), H.tail = P({ color: 16734794 }));
}
const rs = [-7, -2.4, 2.4, 7], is = 1.32, cs = [[-8.5, 1.7], [-4.7, 3.2], [0, 3.4], [4.7, 3.2], [8.5, 1.7]];
function Io(e, t, o, n, s) {
  const c = n * (it / 2 + 0.032), l = new a.Mesh(new a.PlaneGeometry(o, 3.16 - 2.16), H.window);
  l.position.set(t, (2.16 + 3.16) / 2, c), l.rotation.y = n > 0 ? 0 : Math.PI, l.userData.noOutline = true, e.add(l), s.next();
  const f = 3.16 - 2.16, u = (h, p, x, w) => {
    const M = new a.Mesh(new a.PlaneGeometry(o - 0.06, p), P({ color: x }));
    return M.position.set(t, 2.16 + f * h, c + n * w), M.rotation.y = n > 0 ? 0 : Math.PI, M.userData.noOutline = true, e.add(M), M;
  };
  u(0.14, f * 0.28, 5331570, 0.018), u(0.3, 0.035, 10463419, 0.021), u(0.72, 0.045, 12173516, 0.021), u(0.93, 0.07, 15788760, 0.018);
  const d = new a.Mesh(new a.PlaneGeometry(o * 0.2, (3.16 - 2.16) * 0.95), P({ color: 14674678, transparent: true, opacity: 0.13, depthWrite: false }));
  d.position.set(t - o * 0.2, (2.16 + 3.16) / 2, c + n * 0.012), d.rotation.set(0, n > 0 ? 0 : Math.PI, 0.24), d.userData.noOutline = true, e.add(d);
}
function ls({ cab: e = false, tail: t = false, rng: o }) {
  const n = new a.Group(), s = { body: [], stripe: [], roof: [], skirt: [], door: [], dark: [], metal: [] }, r = At - Dt;
  s.body.push({ geometry: new a.BoxGeometry(Pt, r, it), matrix: A(0, (Dt + At) / 2, 0) }), s.roof.push({ geometry: new a.BoxGeometry(Pt - 0.1, de - At, it - 0.24), matrix: A(0, (At + de) / 2, 0) });
  for (const d of [-1, 1]) s.roof.push({ geometry: new a.BoxGeometry(Pt - 0.05, 0.07, 0.1), matrix: A(0, At + 0.02, d * (it / 2 - 0.06)) });
  const i = 1.92, c = 0.34;
  s.stripe.push({ geometry: new a.BoxGeometry(Pt + 0.02, c, it + 0.03), matrix: A(0, i, 0) }), s.stripe.push({ geometry: new a.BoxGeometry(Pt + 0.02, 0.07, it + 0.04), matrix: A(0, i - c / 2 - 0.055, 0) }), s.skirt.push({ geometry: new a.BoxGeometry(Pt - 0.3, 0.5, it - 0.34), matrix: A(0, Dt - 0.25, 0) }), s.skirt.push({ geometry: new a.BoxGeometry(Pt - 1.6, 0.28, it - 0.8), matrix: A(0, Dt - 0.52,
  0) });
  for (const d of [1, -1]) {
    for (const h of rs) s.door.push({ geometry: new a.BoxGeometry(is, At - Dt - 0.12, 0.05), matrix: A(h, (Dt + At) / 2 - 0.02, d * (it / 2 + 0.012)) }), s.dark.push({ geometry: new a.BoxGeometry(0.05, At - Dt - 0.12, 0.06), matrix: A(h, (Dt + At) / 2 - 0.02, d * (it / 2 + 0.02)) }), Io(n, h, 0.94, d, o);
    for (const [h, p] of cs) s.metal.push({ geometry: new a.BoxGeometry(p + 0.12, 1.14, 0.035), matrix: A(h, 2.66, d * (it / 2 + 8e-3)) }), Io(n, h, p, d, o);
  }
  for (const d of [-6.3, 6.3]) s.metal.push({ geometry: new a.BoxGeometry(2.9, 0.42, it - 0.9), matrix: A(d, 0.78, 0) }), s.dark.push({ geometry: new a.BoxGeometry(3.3, 0.2, 0.28), matrix: A(d, 0.62, 0) });
  for (const d of [-5.6, -1.4, 3.2, 7.4]) s.roof.push({ geometry: new a.BoxGeometry(2.1, 0.3, 1.5), matrix: A(d, de + 0.13, d % 2 === 0 ? 0.18 : -0.18) });
  for (const d of [-8.2, 0.6, 8.6]) s.metal.push({ geometry: new a.BoxGeometry(0.7, 0.16, 0.7), matrix: A(d, de + 0.07, -0.7) });
  if (e || t) {
    const d = e ? 1 : -1, h = d * (Pt / 2);
    s.dark.push({ geometry: new a.BoxGeometry(0.1, 1.34, it - 0.22), matrix: A(h + d * 0.03, 2.86, 0) });
    for (const w of [-0.72, 0.72]) {
      const M = new a.Mesh(new a.PlaneGeometry(1.16, 1.02), H.window);
      M.position.set(h + d * 0.085, 2.88, w), M.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2, M.userData.noOutline = true, n.add(M);
      const G = new a.Mesh(new a.PlaneGeometry(0.3, 0.98), P({ color: 15003384, transparent: true, opacity: 0.16, depthWrite: false }));
      G.position.set(h + d * 0.095, 2.88, w - 0.26), G.rotation.set(0, d > 0 ? Math.PI / 2 : -Math.PI / 2, 0.26), G.userData.noOutline = true, n.add(G);
    }
    s.body.push({ geometry: new a.BoxGeometry(0.12, 1.4, 0.16), matrix: A(h + d * 0.05, 2.86, 0) });
    const p = new a.Mesh(new a.PlaneGeometry(1.5, 0.38), P({ color: 16777215, map: Fn(), cache: false }));
    p.position.set(h + d * 0.09, 3.52, 0), p.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2, p.userData.noOutline = true, n.add(p), s.dark.push({ geometry: new a.BoxGeometry(0.08, 0.5, 1.66), matrix: A(h + d * 0.04, 3.52, 0) });
    for (const w of [-1.06, 1.06]) {
      s.dark.push({ geometry: new a.BoxGeometry(0.14, 0.42, 0.5), matrix: A(h + d * 0.05, 1.55, w) });
      const M = new a.Mesh(new a.PlaneGeometry(0.34, 0.16), e ? H.headlight : H.tail);
      M.position.set(h + d * 0.13, 1.63, w), M.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2, M.userData.noOutline = true, n.add(M);
      const G = new a.Mesh(new a.PlaneGeometry(0.34, 0.14), e ? H.tail : H.headlight);
      G.position.set(h + d * 0.13, 1.44, w), G.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2, G.userData.noOutline = true, n.add(G);
    }
    s.skirt.push({ geometry: new a.BoxGeometry(0.34, 0.78, it - 0.5), matrix: A(h + d * 0.1, 0.82, 0) }), s.dark.push({ geometry: new a.BoxGeometry(0.5, 0.22, 0.34), matrix: A(h + d * 0.25, 0.62, 0) });
    const x = new a.Mesh(new a.PlaneGeometry(0.8, 0.24), P({ color: 16777215, map: Vn(), cache: false }));
    x.position.set(h - d * 1.4, 1.42, it / 2 + 0.02), x.userData.noOutline = true, n.add(x);
  }
  const l = { body: H.body, stripe: H.stripe, roof: H.roof, skirt: H.skirt, door: H.door, dark: H.dark, metal: H.metal };
  for (const d of Object.keys(s)) {
    if (!s[d].length) continue;
    const h = new a.Mesh(wt(s[d]), l[d]);
    h.castShadow = true, h.receiveShadow = true, n.add(h), (d === "body" || d === "roof" || d === "skirt") && gt(h, { thickness: 34e-4 });
  }
  const f = [], u = new a.CylinderGeometry(0.43, 0.43, 0.14, 12);
  u.rotateX(Math.PI / 2);
  for (const d of [-6.3, 6.3]) for (const h of [-1.05, 1.05]) for (const p of [-0.72, 0.72]) {
    const x = new a.Group();
    x.position.set(d + h, Ya + 0.43, p), x.userData.planetRigid = true;
    const w = new a.Group();
    x.add(w);
    const M = new a.Mesh(u, H.wheel);
    M.castShadow = true, w.add(M), f.push(w), n.add(x);
  }
  if (e || t) {
    const d = new a.Group();
    d.position.set(e ? -4 : 4, de + 0.05, 0), d.scale.y = (as - d.position.y) / 1.64, d.add(D(1.5, 0.08, 1.5, H.metal, 0, 0.04, 0));
    for (const h of [-1, 1]) {
      const p = D(0.06, 0.9, 0.06, H.metal, h * 0.35, 0.5, 0);
      p.rotation.z = h * 0.55, d.add(p);
      const x = D(0.05, 0.78, 0.05, H.metal, h * 0.0575, 1.247, 0);
      x.rotation.z = h * 0.148, d.add(x);
    }
    d.add(D(0.1, 0.06, 1.3, H.dark, 0, 1.6, 0)), d.add(D(0.24, 0.05, 1.34, H.metal, 0, 1.64, 0)), d.traverse((h) => {
      h.isMesh && (h.castShadow = true);
    }), n.add(d);
  }
  return { car: n, wheels: f };
}
function ds(e) {
  ss();
  const t = st(5150), o = new a.Group();
  o.name = "train", o.visible = false, e.add(o);
  const n = [], s = [];
  for (let l = 0; l < 3; l++) {
    const { car: f, wheels: u } = ls({ cab: l === 0, tail: l === 2, rng: t });
    f.position.x = (l - 1) * Ro, o.add(f), s.push(f), n.push(...u);
  }
  const r = new a.Matrix4().makeTranslation(at.x, at.y, at.z), i = new a.Matrix4().makeTranslation(-at.x, -at.y, -at.z);
  return { group: o, cars: s, wheels: n, length: Ro * 3, dir: 1, x: 0, speed: 23.5, gust: 0, get offset() {
    return rn(this.x, 0);
  }, planetize() {
    o.visible = true, o.matrixAutoUpdate = false, this.update(0);
  }, update(l) {
    this.x = vt(this.x + this.dir * this.speed * l), o.matrix.makeRotationZ(-this.x / X).premultiply(r).multiply(i), o.matrixWorldNeedsUpdate = true;
    const f = this.speed * l / 0.43;
    for (const d of this.wheels) d.rotation.z -= f * this.dir;
    const u = Math.max(0, 1 - Math.abs(this.offset) / 46);
    this.gust = Math.max(this.gust * Math.exp(-l * 1.4), u * u);
  } };
}
const fe = 980, Eo = 6.8, ze = -30, ke = 34, Lt = 9.5;
function fs(e) {
  const t = st(8123), o = Hn(), n = new a.PlaneGeometry(0.185, 0.135), s = [{ color: g.petal, n: Math.round(fe * 0.55) }, { color: g.blossomLight, n: Math.round(fe * 0.28) }, { color: g.petalDeep, n: fe - Math.round(fe * 0.55) - Math.round(fe * 0.28) }], r = [], i = [];
  for (const p of s) {
    const x = P({ color: p.color, map: o, transparent: true, opacity: 0.95, depthWrite: false, side: a.DoubleSide, alphaTest: 0.32, cache: false }), w = new a.InstancedMesh(n, x, p.n);
    w.instanceMatrix.setUsage(a.DynamicDrawUsage), w.frustumCulled = false, w.renderOrder = 4, w.userData.noOutline = true, e.add(w), r.push(w);
    for (let M = 0; M < p.n; M++) i.push({ mesh: w, idx: M, x: t.range(-Lt, Lt), y: t.range(0.2, Eo), z: t.range(ze, ke), fall: t.range(0.42, 0.86), swayAmp: t.range(0.25, 0.75), swayFreq: t.range(0.5, 1.35), phase: t.range(0, 10), spin: new a.Vector3(t.range(-1, 1), t.range(-1, 1), t.range(-1, 1)).normalize(), spinRate: t.range(0.5, 2.4), angle: t.range(0, 6.28), scale: t.range(0.78, 1.25), drift: t.
    range(-0.16, 0.16) });
  }
  const c = new a.Object3D(), l = new a.Quaternion(), f = new a.Vector3();
  let u = 0;
  function d(p) {
    p.x = t.range(-Lt, Lt), p.z = t.range(ze, ke), p.y = Eo + t.range(0, 1.4), p.phase = t.range(0, 10);
  }
  function h(p, x, w) {
    u += p;
    const M = x * 5.4 * w, G = x * 1.5;
    for (let T = 0; T < i.length; T++) {
      const m = i[T], z = Math.sin(u * m.swayFreq + m.phase), b = Math.sin(u * m.swayFreq * 2.7 + m.phase * 1.7);
      m.y -= (m.fall + x * 0.4) * p, m.x += (m.swayAmp * z * 0.55 + m.drift + M * 0.24) * p, m.z += (m.swayAmp * b * 0.32 + M * 0.05) * p, m.y += G * Math.max(0, 1 - Math.abs(m.z) / 8) * p, m.angle += m.spinRate * p * (1 + x);
      const k = U(m.z);
      m.x < k - Lt && (m.x = k + Lt), m.x > k + Lt && (m.x = k - Lt), m.z < ze && (m.z = ke), m.z > ke && (m.z = ze), m.y < nt(m.z) + 0.04 && d(m), l.setFromAxisAngle(m.spin, m.angle), c.position.set(m.x, m.y, m.z), c.quaternion.copy(l), f.setScalar(m.scale), c.scale.copy(f), c.updateMatrix(), m.mesh.setMatrixAt(m.idx, c.matrix);
    }
    for (const T of r) T.instanceMatrix.needsUpdate = true;
  }
  for (let p = 0; p < 40; p++) h(0.1, 0, 1);
  return us(e, o), { update: h, meshes: r };
}
function us(e, t) {
  const o = st(4471), n = new a.PlaneGeometry(0.17, 0.125);
  n.rotateX(-Math.PI / 2);
  const s = [g.petal, g.blossomLight, g.petalDeep], r = [[], [], []], i = new a.Object3D(), c = (l, f, u) => {
    i.position.set(l, u + 0.019, f), i.rotation.set(0, o.range(0, 6.28), 0);
    const d = o.range(0.8, 1.25);
    i.scale.set(d, 1, d), i.updateMatrix(), r[o.int(0, 2)].push(i.matrix.clone());
  };
  for (let l = 0; l < 620; l++) {
    const f = o.range(-26, 32), u = U(f), d = nt(), h = o.next();
    if (h < 0.42) {
      const p = o.sign();
      c(u + p * o.range(2.35, 3.12), f, d);
    } else if (h < 0.62) {
      const p = o.sign();
      c(u + p * o.range(3.2, 4.6), f, d + 0.135);
    } else if (h < 0.78) {
      const p = o.range(-2.4, 2.4);
      c(u + o.range(-3.1, 3.1), p, 0.32);
    } else c(u + o.range(-3, 3), f, d);
  }
  r.forEach((l, f) => {
    if (!l.length) return;
    const u = new a.InstancedMesh(n, P({ color: s[f], map: t, transparent: true, opacity: 0.9, depthWrite: false, alphaTest: 0.32, cache: false }), l.length);
    l.forEach((d, h) => u.setMatrixAt(h, d)), u.renderOrder = 2, u.userData.noOutline = true, e.add(u);
  });
}
const qe = /* @__PURE__ */ new Map();
function Le(e, t, o, n) {
  if (qe.has(e)) return qe.get(e);
  const s = document.createElement("canvas");
  s.width = t, s.height = o, n(s.getContext("2d"), t, o);
  const r = new a.CanvasTexture(s);
  return r.colorSpace = a.SRGBColorSpace, r.anisotropy = 4, qe.set(e, r), r;
}
const gn = "'Segoe UI', 'Noto Sans', system-ui, sans-serif", hs = `'Noto Sans Telugu', 'Gautami', ${gn}`;
function Yt(e, t, o, n, s, r, i, c = 700, l = gn) {
  let f = Math.min(r, 100);
  e.textAlign = "center", e.textBaseline = "middle";
  do
    e.font = `${c} ${f}px ${l}`, f -= 2;
  while (e.measureText(t).width > s && f > 8);
  e.fillStyle = i, e.fillText(t, o, n);
}
function Ee(e, { bg: t = "#1d4e9c", fg: o = "#ffffff", name: n, telugu: s = "", strip: r = null }) {
  return Le("fascia:" + e, 512, 128, (i, c, l) => {
    i.fillStyle = t, i.fillRect(0, 0, c, l), i.strokeStyle = "rgba(0,0,0,.35)", i.lineWidth = 6, i.strokeRect(4, 4, c - 8, l - 8), s ? (Yt(i, s, c / 2, l * 0.28, c - 40, 40, o, 700, hs), Yt(i, n, c / 2, l * 0.7, c - 40, 44, o, 800)) : Yt(i, n, c / 2, l * 0.5, c - 40, 52, o, 800), r && (i.fillStyle = r, i.fillRect(0, l - 10, c, 10)), i.fillStyle = "rgba(255,255,255,.05)", i.fillRect(c * 0.12, l * 0.1,
    c * 0.3, 6), i.fillRect(c * 0.55, l * 0.86, c * 0.35, 5);
  });
}
function ps() {
  return Le("busStop", 512, 192, (e, t, o) => {
    e.fillStyle = "#f4ede0", e.fillRect(0, 0, t, o), e.fillStyle = "#1d4e9c", e.fillRect(0, 0, t, 62), Yt(e, "BUS STOP", t / 2, 32, t - 40, 40, "#ffffff", 800), Yt(e, "NALLAKUNTA", t / 2, 96, t - 40, 44, "#22303f", 800), Yt(e, "107 \xB7 113 \xB7 116J", t / 2, 152, t - 40, 36, "#8a3b2f", 700);
  });
}
function ms() {
  return Le("roadName", 512, 128, (e, t, o) => {
    e.fillStyle = "#0f3d22", e.fillRect(0, 0, t, o), e.strokeStyle = "#f4ede0", e.lineWidth = 5, e.strokeRect(6, 6, t - 12, o - 12), Yt(e, "NALLAKUNTA MAIN ROAD", t / 2, o / 2, t - 44, 46, "#f4ede0", 800);
  });
}
function xs() {
  return ws("divider", 128, 32, (e, t, o) => {
    e.fillStyle = "#f2c53d", e.fillRect(0, 0, t, o), e.fillStyle = "#2b2b30";
    for (let n = -1; n < 4; n++) e.beginPath(), e.moveTo(n * 40, o), e.lineTo(n * 40 + 20, 0), e.lineTo(n * 40 + 40, 0), e.lineTo(n * 40 + 20, o), e.closePath(), e.fill();
  });
}
function ws(e, t, o, n) {
  const s = Le(e, t, o, n);
  return s.wrapS = s.wrapT = a.RepeatWrapping, s;
}
function ys(e) {
  const t = new a.Group();
  t.name = "mainRoad", e.add(t);
  const o = y({ color: g.road, bands: 3, tint: 7036528, flat: false }), n = y({ color: g.sidewalk, bands: 3, tint: 8022642, flat: false }), s = y({ color: g.sidewalkAlt, bands: 3, tint: 8022642, flat: false }), r = y({ color: g.curb, bands: 2, tint: 7036528 }), i = y({ color: 13218452, bands: 3, tint: 9072478, flat: false }), c = 0.012;
  for (const [l, f] of [[Ft, -Nt], [Nt, Vt]]) {
    const u = Jt({ z0: l, z1: f, step: 1.6, a: (h) => ({ x: U(h) - O, y: c }), b: (h) => ({ x: U(h) + O, y: c }) }), d = new a.Mesh(u, o);
    d.receiveShadow = true, t.add(d);
  }
  {
    const l = xs(), f = new a.MeshBasicMaterial({ map: l, transparent: false });
    for (const [u, d] of [[Ft, -Nt], [Nt, Vt]]) {
      const h = Jt({ z0: u, z1: d, step: 1.6, a: (x) => ({ x: U(x) - 0.14, y: c + 4e-3 }), b: (x) => ({ x: U(x) + 0.14, y: c + 4e-3 }), uv: [0.55, 2.2] }), p = new a.Mesh(h, f);
      p.userData.noShadow = true, t.add(p);
    }
  }
  for (const l of [-1, 1]) for (const [f, u] of [[Ft, -Nt], [Nt, Vt]]) {
    const d = (T) => U(T) + l * O, h = (T) => U(T) + l * (O + q), p = Jt({ z0: f, z1: u, step: 1.6, a: (T) => ({ x: d(T), y: St }), b: (T) => ({ x: h(T), y: St }) }), x = new a.Mesh(p, l < 0 ? n : s);
    x.receiveShadow = true, t.add(x);
    const w = Jt({ z0: f, z1: u, step: 1.6, a: (T) => ({ x: d(T), y: 0 }), b: (T) => ({ x: d(T), y: St }), flip: l > 0 }), M = new a.Mesh(w, r);
    t.add(M);
    const G = Jt({ z0: f, z1: u, step: 1.6, a: (T) => ({ x: h(T), y: -0.02 }), b: (T) => ({ x: h(T), y: St }), flip: l < 0 });
    t.add(new a.Mesh(G, r));
  }
  for (const l of [-1, 1]) {
    const f = Jt({ z0: Ft, z1: Vt, step: 2, a: (d) => ({ x: U(d) + l * (O + q), y: 4e-3 }), b: (d) => ({ x: U(d) + l * (O + q + 3.4), y: 4e-3 }) }), u = new a.Mesh(f, i);
    u.receiveShadow = true, t.add(u);
  }
  return t;
}
const Be = O + q + 0.55, _ = {};
function Mn() {
  return _.done || (_.done = true, _.walls = [15983816, 15258542, 14673106, 15784128, 15129796, 14213348, 15653304, 14995392].map((e) => y({ color: e, bands: 3, tint: 9072480 })), _.trim = y({ color: 11573888, bands: 2, tint: 7035472 }), _.roof = y({ color: 12101776, bands: 3, tint: 7035472 }), _.roofDark = y({ color: 9075302, bands: 3, tint: 5983298 }), _.door = y({ color: 6047282, bands: 2, tint: 3812904 }),
  _.shutter = y({ color: 8226964, bands: 3, tint: 5265003 }), _.glass = P({ color: 4872816 }), _.grill = y({ color: 4934482, bands: 2, tint: 3816010 }), _.tank = y({ color: 3026483, bands: 3, tint: 3816010 }), _.awningA = y({ color: 13126460, bands: 3, tint: 8010298 }), _.awningB = y({ color: 3112299, bands: 3, tint: 2771530 }), _.ac = y({ color: 14210508, bands: 2, tint: 9079446 })), _;
}
function $e(e, t) {
  const o = t.side || 1;
  Mn();
  const n = new a.Group(), { x: s, z: r, w: i, d: c, h: l, sign: f } = t, u = _.walls[t.wall % _.walls.length], d = new a.Mesh(new a.BoxGeometry(c, l, i), u);
  d.position.set(s - o * c / 2, l / 2, r), n.add(d);
  const h = new a.Mesh(new a.BoxGeometry(c + 0.15, 0.42, i + 0.15), _.trim);
  h.position.set(s - o * c / 2, l + 0.18, r), n.add(h);
  const p = new a.Mesh(new a.CylinderGeometry(0.55, 0.55, 0.9, 12), _.tank);
  p.position.set(s - o * (c / 2 - 0.6), l + 0.85, r - i * 0.22), n.add(p);
  const x = new a.Mesh(new a.SphereGeometry(0.34, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), _.ac);
  if (x.rotation.x = Math.PI / 3, x.position.set(s - o * (c / 2 + 0.8), l + 0.55, r + i * 0.25), n.add(x), f) {
    const b = Ee(f.key, f), k = [_.trim, _.trim, _.trim, _.trim, _.trim, _.trim];
    k[o > 0 ? 0 : 1] = new a.MeshBasicMaterial({ map: b });
    const R = new a.Mesh(new a.BoxGeometry(0.12, 1, i * 0.92), k);
    R.position.set(s + o * 0.06, l - 1.45, r), n.add(R);
  }
  const w = i * 0.44, M = new a.Mesh(new a.BoxGeometry(0.08, 2.3, w), _.shutter);
  M.position.set(s + o * 0.02, 1.15, r - i * 0.18), n.add(M);
  for (let b = 0; b < 6; b++) {
    const k = new a.Mesh(new a.BoxGeometry(0.03, 0.035, w), _.grill);
    k.position.set(s + o * 0.07, 0.45 + b * 0.36, r - i * 0.18), n.add(k);
  }
  const G = new a.Mesh(new a.BoxGeometry(0.08, 2.1, i * 0.26), _.door);
  if (G.position.set(s + o * 0.02, 1.05, r + i * 0.24), n.add(G), t.awning) {
    const b = new a.Mesh(new a.BoxGeometry(1.5, 0.06, i * 0.8), t.awning === "a" ? _.awningA : _.awningB);
    b.rotation.z = -0.28 * o, b.position.set(s + o * 0.72, 2.62, r), n.add(b);
  }
  for (const b of [-i * 0.22, i * 0.22]) {
    const k = new a.Mesh(new a.BoxGeometry(0.06, 1.15, 0.95), _.glass);
    k.position.set(s + o * 0.03, l - 2.6, r + b), n.add(k);
    for (let R = -2; R <= 2; R++) {
      const S = new a.Mesh(new a.BoxGeometry(0.02, 1.15, 0.035), _.grill);
      S.position.set(s + o * 0.06, l - 2.6, r + b + R * 0.19), n.add(S);
    }
  }
  const T = new a.Mesh(new a.BoxGeometry(0.32, 0.5, 0.7), _.ac);
  T.position.set(s + o * 0.18, l - 0.65, r - i * 0.34), n.add(T), zt(n), e.add(n);
  const m = o > 0 ? s - c : s, z = o > 0 ? s : s + c;
  return e.collide(m, r - i / 2, z, r + i / 2, l), n;
}
function bs(e, t) {
  Mn();
  const o = new a.Group(), { x: n, z: s, w: r, d: i, h: c } = t, l = _.walls[t.wall % _.walls.length], f = new a.Mesh(new a.BoxGeometry(i, c, r), l);
  if (f.position.set(n - i / 2, c / 2, s), o.add(f), t.roof === "slope") {
    const d = new a.Mesh(new a.CylinderGeometry(0.02, r * 0.62, 1.15, 4, 1), _.roofDark);
    d.rotation.y = Math.PI / 4, d.scale.z = i / (r * 0.62) * 0.5, d.position.set(n - i / 2, c + 0.56, s), o.add(d);
  } else {
    const d = new a.Mesh(new a.BoxGeometry(i + 0.14, 0.36, r + 0.14), _.trim);
    d.position.set(n - i / 2, c + 0.15, s), o.add(d);
    const h = new a.Mesh(new a.CylinderGeometry(0.5, 0.5, 0.8, 10), _.tank);
    h.position.set(n - i / 2 + 0.5, c + 0.75, s - r * 0.2), o.add(h);
  }
  const u = new a.Mesh(new a.BoxGeometry(0.07, 1.9, 0.9), _.door);
  u.position.set(n + 0.035, 0.95, s + r * 0.18), o.add(u);
  for (const d of [-r * 0.22]) {
    const h = new a.Mesh(new a.BoxGeometry(0.06, 1, 0.9), _.glass);
    h.position.set(n + 0.03, 1.55, s + d), o.add(h);
    for (let p = -2; p <= 2; p++) {
      const x = new a.Mesh(new a.BoxGeometry(0.02, 1, 0.03), _.grill);
      x.position.set(n + 0.055, 1.55, s + d + p * 0.18), o.add(x);
    }
  }
  return zt(o), e.add(o), e.collide(n - i, s - r / 2, n, s + r / 2, c), o;
}
const gs = [{ key: "pharmacy", name: "SAINCE PHARMACY", telugu: "", bg: "#0d7a4d", fg: "#ffffff" }, { key: "dental", name: "M K DENTAL LAB", telugu: "", bg: "#27407a", fg: "#e8e4d8" }, { key: "courier", name: "INTERNATIONAL COURIER & CARGO", telugu: "", bg: "#8a1f1f", fg: "#ffd94d" }, null, null, null, null, null];
function Ms(e) {
  let t = 6;
  gs.slice(0, 7).forEach((r, i) => {
    t < 17 && t + 5 > 12 && (t = 17.2), $e(e, { x: U(t + 5 / 2) + Be, z: t + 5 / 2, w: 5, d: 7.2, h: i % 3 === 2 ? 4.6 : 6.4, wall: i, sign: r, awning: i % 2 === 0 ? "a" : i % 3 === 0 ? "b" : null, side: -1 }), t += 5 + 0.15;
  });
  const o = [{ key: "tiffins", name: "SRI SIDDHARTHA TIFFIN CENTRE", telugu: "\u0C1F\u0C3F\u0C2B\u0C3F\u0C28\u0C4D \u0C38\u0C46\u0C02\u0C1F\u0C30\u0C4D", bg: "#b3312c", fg: "#ffffff" }, { key: "textiles", name: "DIWAN TEXTILES", telugu: "", bg: "#5b2d8e", fg: "#f4e28a" }];
  let n = 42;
  o.forEach((r, i) => {
    $e(e, { x: U(n + 5 / 2) - Be - 3.6, z: n + 5 / 2, w: 5, d: 7.2, h: 4.6, wall: i + 2, sign: r, awning: i === 0 ? "b" : null, side: 1 }), n += 5 + 0.15;
  });
  const s = [{ z: -66, sign: { key: "tasty", name: "TASTY BAKERY", telugu: "", bg: "#f4e6c8", fg: "#a12222" }, side: -1, awning: "b" }, { z: -60.7, sign: null, side: -1 }, { z: -58, sign: { key: "vidya", name: "SREE VIDYA BOOK CENTRE", telugu: "", bg: "#1f3a7a", fg: "#f4e28a" }, side: 1 }, { z: 68, sign: { key: "ramaiah", name: "RAMAIAH IIT STUDY CIRCLE", telugu: "", bg: "#c9531f", fg: "#ffffff" },
  side: -1, awning: "a" }, { z: 73.5, sign: { key: "sharma", name: "SHARMA'S PHYSICS CLASSES", telugu: "", bg: "#27407a", fg: "#ffd94d" }, side: -1 }];
  for (const r of s) $e(e, { x: U(r.z) + (r.side > 0 ? -8.85 : Be), z: r.z, w: 5, d: 7.2, h: 4.6, wall: Math.abs(r.z | 0) % 8, sign: r.sign, awning: r.awning || null, side: r.side });
}
function zs(e) {
  const t = [{ x: -1, z: -10, w: 7, d: 6.5, h: 3.6, wall: 1, roof: "flat" }, { x: -1, z: -19, w: 6, d: 7, h: 4.8, wall: 3, roof: "slope" }, { x: -1, z: -28, w: 8, d: 7, h: 3.4, wall: 5, roof: "flat" }, { x: -1, z: -38, w: 6.5, d: 6.5, h: 4.2, wall: 2, roof: "flat" }, { x: -1, z: -52, w: 7.5, d: 7, h: 3.8, wall: 6, roof: "slope" }, { x: 1, z: -12, w: 6.5, d: 7, h: 3.5, wall: 4, roof: "flat" }, { x: 1,
  z: -24, w: 7, d: 6.5, h: 5.2, wall: 0, roof: "flat" }, { x: 1, z: -34, w: 6, d: 7, h: 3.6, wall: 7, roof: "slope" }, { x: 1, z: -48, w: 7, d: 7, h: 4.4, wall: 2, roof: "flat" }, { x: 1, z: 52, w: 7, d: 7, h: 4, wall: 1, roof: "flat" }, { x: 1, z: 62, w: 6.5, d: 6.5, h: 3.5, wall: 3, roof: "slope" }, { x: -1, z: 58, w: 7, d: 7, h: 4.6, wall: 0, roof: "flat" }];
  for (const o of t) {
    const n = U(o.z) + o.x * (Be + 3.4);
    bs(e, { ...o, x: n });
  }
}
const ks = O + q + 0.55, ve = 12.3, Se = 17, tt = 11, ht = 18.3, V = {};
function io() {
  return V.done || (V.done = true, V.walls = [15983816, 15258542, 14673106, 15784128, 15129796, 14213348].map((e) => y({ color: e, bands: 3, tint: 9072480 })), V.trim = y({ color: 11573888, bands: 2, tint: 7035472 }), V.door = y({ color: 6047282, bands: 2, tint: 3812904 }), V.shutter = y({ color: 8226964, bands: 3, tint: 5265003 }), V.glass = P({ color: 4872816 }), V.grill = y({ color: 4934482, bands: 2,
  tint: 3816010 }), V.tank = y({ color: 3026483, bands: 3, tint: 3816010 }), V.road = y({ color: 6972528, bands: 3, tint: 7036528, flat: false }), V.walk = y({ color: 10194824, bands: 3, tint: 8022642, flat: false }), V.earth = y({ color: 13218452, bands: 3, tint: 9072478, flat: false }), V.awningA = y({ color: 13126460, bands: 3, tint: 8010298 }), V.awningB = y({ color: 3112299, bands: 3, tint: 2771530 }),
  V.grass = y({ color: 6130250, bands: 3, tint: 4151861 }), V.leaf = y({ color: 3042100, bands: 3, tint: 2049062 }), V.trunk = y({ color: 7031348, bands: 2, tint: 4863016 }), V.wall = y({ color: 15327172, bands: 3, tint: 9077362 })), V;
}
function te(e, t) {
  io();
  const o = new a.Group(), { x: n, zF: s, w: r, d: i, h: c, sign: l, face: f } = t, u = s - f * i / 2, d = new a.Mesh(new a.BoxGeometry(r, c, i), V.walls[t.wall % V.walls.length]);
  d.position.set(n, c / 2, u), o.add(d);
  const h = new a.Mesh(new a.BoxGeometry(r + 0.15, 0.42, i + 0.15), V.trim);
  h.position.set(n, c + 0.18, u), o.add(h);
  const p = new a.Mesh(new a.CylinderGeometry(0.55, 0.55, 0.9, 12), V.tank);
  if (p.position.set(n - r * 0.22, c + 0.85, u + f * (i / 2 - 0.7)), o.add(p), l) {
    const m = Ee(l.key, l), z = [V.trim, V.trim, V.trim, V.trim, V.trim, V.trim];
    z[f > 0 ? 2 : 3] = new a.MeshBasicMaterial({ map: m });
    const b = new a.Mesh(new a.BoxGeometry(r * 0.92, 1, 0.12), z);
    b.position.set(n, c - 1.45, s + f * 0.06), o.add(b);
  }
  const x = r * 0.44, w = new a.Mesh(new a.BoxGeometry(x, 2.3, 0.08), V.shutter);
  w.position.set(n - r * 0.18, 1.15, s + f * 0.02), o.add(w);
  for (let m = 0; m < 6; m++) {
    const z = new a.Mesh(new a.BoxGeometry(x, 0.035, 0.03), V.grill);
    z.position.set(n - r * 0.18, 0.45 + m * 0.36, s + f * 0.07), o.add(z);
  }
  const M = new a.Mesh(new a.BoxGeometry(r * 0.26, 2.1, 0.08), V.door);
  if (M.position.set(n + r * 0.24, 1.05, s + f * 0.02), o.add(M), t.awning) {
    const m = new a.Mesh(new a.BoxGeometry(r * 0.8, 0.06, 1.5), t.awning === "a" ? V.awningA : V.awningB);
    m.rotation.x = 0.28 * f, m.position.set(n, 2.62, s + f * 0.72), o.add(m);
  }
  for (const m of [-r * 0.22, r * 0.22]) {
    const z = new a.Mesh(new a.BoxGeometry(0.95, 1.15, 0.06), V.glass);
    z.position.set(n + m, c - 2.6, s + f * 0.03), o.add(z);
    for (let b = -2; b <= 2; b++) {
      const k = new a.Mesh(new a.BoxGeometry(0.035, 1.15, 0.02), V.grill);
      k.position.set(n + m + b * 0.19, c - 2.6, s + f * 0.06), o.add(k);
    }
  }
  zt(o), e.add(o);
  const G = f > 0 ? s - i : s, T = f > 0 ? s : s + i;
  return e.collide(n - r / 2, G, n + r / 2, T, c), o;
}
function Ye(e, t, o, n) {
  io();
  const s = new a.Mesh(new a.CylinderGeometry(0.14 * n, 0.2 * n, 2.2 * n, 8), V.trunk);
  s.position.set(t, 1.1 * n, o), e.add(s);
  const r = new a.Mesh(new a.IcosahedronGeometry(1.5 * n, 1), V.leaf);
  r.position.set(t, 2.9 * n, o), r.scale.y = 0.85, e.add(r);
  const i = new a.Mesh(new a.IcosahedronGeometry(1 * n, 1), V.leaf);
  i.position.set(t + 0.7 * n, 3.6 * n, o + 0.3 * n), e.add(i);
}
function vs(e) {
  const t = io(), o = new a.Group();
  o.name = "shivamRoad", e.add(o);
  const n = U((ve + Se) / 2) + ks - 0.6, s = n + 34, r = new a.Mesh(new a.BoxGeometry(s - n, 0.024, Se - ve), t.road);
  r.position.set((n + s) / 2, 0.012, (ve + Se) / 2), r.receiveShadow = true, o.add(r);
  for (const [i, c, l] of [[tt, ve, St], [Se, ht, St], [tt - 3.2, tt, 4e-3], [ht, ht + 3.2, 4e-3]]) {
    const f = new a.Mesh(new a.BoxGeometry(s - n, 0.02, c - i), l > 0.01 ? t.walk : t.earth);
    f.position.set((n + s) / 2, l, (i + c) / 2), f.receiveShadow = true, o.add(f);
  }
  {
    const i = new a.Mesh(new a.CylinderGeometry(0.05, 0.05, 3.1, 8), t.grill);
    i.position.set(n + 0.7, 1.55, ht + 0.2), o.add(i);
    const c = Ee("shivamrd", { name: "SHIVAM ROAD", telugu: "", bg: "#1d4e9c", fg: "#ffffff" }), l = [t.trim, t.trim, t.trim, t.trim, t.trim, t.trim];
    l[3] = new a.MeshBasicMaterial({ map: c });
    const f = new a.Mesh(new a.BoxGeometry(2, 0.55, 0.06), l);
    f.position.set(n + 0.7, 2.9, ht + 0.2), o.add(f);
  }
  {
    const i = new a.Mesh(new a.BoxGeometry(8.2, 0.06, 6.2), t.grass);
    i.position.set(n + 7.6, 0.03, tt - 3.3), i.receiveShadow = true, o.add(i), Ye(o, n + 5.2, tt - 2.2, 1), Ye(o, n + 9.6, tt - 4.4, 1.25), Ye(o, n + 8.4, tt - 1.6, 0.8);
    const c = new a.Mesh(new a.BoxGeometry(8.2, 0.55, 0.18), t.wall);
    c.position.set(n + 7.6, 0.28, tt - 0.15), o.add(c);
    const l = Ee("narendra", { name: "NARENDRA PARK", telugu: "", bg: "#0d5a3f", fg: "#ffffff" }), f = [t.trim, t.trim, t.trim, t.trim, t.trim, t.trim];
    f[2] = new a.MeshBasicMaterial({ map: l });
    const u = new a.Mesh(new a.BoxGeometry(2.4, 0.5, 0.08), f);
    u.position.set(n + 5.4, 0.95, tt - 0.15), o.add(u), e.collide(n + 3.5, tt - 6.4, n + 11.7, tt - 0.3, 0.55);
  }
  te(e, { x: n + 15.2, zF: tt, w: 5, d: 6.8, h: 4.6, wall: 2, face: 1, awning: "a", sign: { key: "papaji", name: "PAPAJI DA DHABA", telugu: "", bg: "#7a1f1f", fg: "#ffd94d" } }), te(e, { x: n + 22.2, zF: tt, w: 5.6, d: 6.8, h: 5.4, wall: 0, face: 1, sign: { key: "bakersq", name: "BAKERS 'Q", telugu: "", bg: "#101c30", fg: "#ffffff" } }), te(e, { x: n + 6.5, zF: ht, w: 5, d: 6.8, h: 4.6, wall: 4, face: -1,
  sign: null }), te(e, { x: n + 13.6, zF: ht, w: 5.2, d: 6.8, h: 5.4, wall: 1, face: -1, awning: "b", sign: { key: "shanthi", name: "SHANTHI HOTEL", telugu: "", bg: "#14406e", fg: "#ffd94d" } }), te(e, { x: n + 20.8, zF: ht, w: 4.6, d: 6.8, h: 4.6, wall: 3, face: -1, sign: { key: "bhavani", name: "BHAVANI BOOK STALL", telugu: "", bg: "#8a1f1f", fg: "#ffffff" } }), te(e, { x: n + 27.4, zF: ht, w: 5,
  d: 6.8, h: 4.6, wall: 5, face: -1, sign: null });
  {
    const i = new a.Mesh(new a.BoxGeometry(2.4, 6, ht + 3.2 - (tt - 3.2)), t.walls[2]);
    i.position.set(s + 1.2, 3, (tt + ht) / 2), zt(i), o.add(i), e.collide(s, tt - 3.2, s + 2.4, ht + 3.2, 6);
  }
  return o;
}
const Po = O + q + 0.65, ue = 13, he = 41, et = 27, Tt = 1.5;
function Ss() {
  const e = document.createElement("canvas");
  e.width = 512, e.height = 256;
  const t = e.getContext("2d");
  t.fillStyle = "#d8622a", t.fillRect(0, 0, 512, 256), t.fillStyle = "#1f3a7a", t.fillRect(0, 0, 512, 18), t.fillStyle = "#d8a83c", t.fillRect(0, 18, 512, 8), t.fillStyle = "#1f3a7a", t.fillRect(0, 230, 512, 26), t.fillStyle = "#d8a83c", t.fillRect(0, 222, 512, 8), t.fillStyle = "#14306e", t.textAlign = "center", t.textBaseline = "middle", t.font = 'bold 64px "Noto Sans Telugu", sans-serif', t.fillText(
  "\u0C36\u0C43\u0C02\u0C17\u0C47\u0C30\u0C3F \u0C36\u0C02\u0C15\u0C30 \u0C2E\u0C20\u0C02", 256, 108), t.font = 'bold 34px "Noto Sans Telugu", sans-serif', t.fillText("\xB7 \u0C28\u0C32\u0C4D\u0C32\u0C15\u0C41\u0C02\u0C1F \xB7", 256, 178);
  const o = new a.CanvasTexture(e);
  return o.colorSpace = a.SRGBColorSpace, o;
}
function Gs() {
  const e = document.createElement("canvas");
  e.width = e.height = 256;
  const t = e.getContext("2d");
  t.clearRect(0, 0, 256, 256), t.fillStyle = "rgba(255,255,255,0.92)";
  const o = (s, r, i = 3.2) => {
    t.beginPath(), t.arc(s, r, i, 0, 7), t.fill();
  };
  for (let s = 0; s < 9; s++) for (let r = 0; r < 9; r++) o(28 + s * 25 + (r % 2 ? 12 : 0), 28 + r * 25);
  t.strokeStyle = "rgba(255,255,255,0.9)", t.lineWidth = 4, t.beginPath(), t.moveTo(128, 12), t.lineTo(244, 128), t.lineTo(128, 244), t.lineTo(12, 128), t.closePath(), t.stroke();
  const n = new a.CanvasTexture(e);
  return n.colorSpace = a.SRGBColorSpace, n;
}
function As(e) {
  const t = new a.Group();
  t.name = "shankarMutt", e.add(t);
  const o = U(et), n = o - Po, s = o - Po - 17, r = y({ color: 15327172, bands: 3, tint: 9077362 }), i = y({ color: 13194015, bands: 3, tint: 7027252 }), c = y({ color: 14180906, bands: 3, tint: 8010272 }), l = y({ color: 14715482, bands: 3, tint: 9062960 }), f = y({ color: 14198844, bands: 3, tint: 9071146, emissive: 6901268, emissiveIntensity: 0.25 }), u = P({ color: 1511435 }), d = y({ color: 11911876,
  bands: 3, tint: 6978172 }), h = 2.05, p = [{ x0: n, z0: ue, x1: n + 0.35, z1: et - Tt }, { x0: n, z0: et + Tt, x1: n + 0.35, z1: he }, { x0: s, z0: ue, x1: s + 0.35, z1: he }, { x0: s, z0: ue, x1: n + 0.35, z1: ue + 0.35 }, { x0: s, z0: he - 0.35, x1: n + 0.35, z1: he }];
  for (const S of p) {
    const v = Math.max(S.x1 - S.x0, 0.35), B = Math.max(S.z1 - S.z0, 0.35), F = new a.Mesh(new a.BoxGeometry(v, h, B), r);
    F.position.set((S.x0 + S.x1) / 2, h / 2, (S.z0 + S.z1) / 2), t.add(F);
    const j = new a.Mesh(new a.BoxGeometry(v + 0.08, 0.2, B + 0.08), i);
    j.position.set((S.x0 + S.x1) / 2, h - 0.1, (S.z0 + S.z1) / 2), t.add(j), e.collide(S.x0 - 0.05, S.z0 - 0.05, S.x1 + 0.05, S.z1 + 0.05, h);
  }
  const x = [12729198, 14198844, 14180906, 8954040];
  [[16.5, 0, 1], [20.5, 1, 0.85], [33.5, 2, 0.95], [37.2, 3, 0.8]].forEach(([S, v, B], F) => {
    const j = new a.Mesh(new a.PlaneGeometry(0.8, B), new a.MeshBasicMaterial({ color: x[v] }));
    j.rotation.y = Math.PI / 2, j.position.set(n + 0.37, 1.05 + F % 2 * 0.15, S), t.add(j);
    const C = new a.Mesh(new a.PlaneGeometry(0.6, B * 0.3), new a.MeshBasicMaterial({ color: 15853776 }));
    C.rotation.y = Math.PI / 2, C.position.set(n + 0.375, 1 + F % 2 * 0.15, S), t.add(C);
  });
  for (const S of [-1, 1]) {
    const v = et + S * (Tt + 0.5), B = new a.Mesh(new a.BoxGeometry(0.95, 3.2, 0.95), c);
    B.position.set(n + 0.18, 1.6, v), t.add(B);
    const F = new a.Mesh(new a.BoxGeometry(1.15, 0.22, 1.15), i);
    F.position.set(n + 0.18, 3.3, v), t.add(F), e.collide(n - 0.28, v - 0.5, n + 0.66, v + 0.5, 3.3);
  }
  const w = new a.Mesh(new a.BoxGeometry(0.8, 0.55, Tt * 2 + 2.9), c);
  w.position.set(n + 0.18, 3.66, et), t.add(w);
  const M = new a.Mesh(new a.CircleGeometry(Tt + 0.4, 24, 0, Math.PI), new a.MeshBasicMaterial({ map: Ss() }));
  M.rotation.y = Math.PI / 2, M.position.set(n + 0.6, 3.9, et), t.add(M);
  const G = [[0, 5.6], [-0.85, 4.62], [0.85, 4.62], [-1.75, 4.15], [1.75, 4.15]];
  for (const [S, v] of G) {
    const B = new a.Mesh(new a.SphereGeometry(0.19, 10, 8), l);
    B.position.set(n + 0.5, v, et + S), B.scale.y = 1.25, t.add(B);
  }
  const T = new a.Mesh(new a.SphereGeometry(0.14, 8, 6), f);
  T.position.set(n + 0.5, 5.85, et), t.add(T);
  const m = new a.Mesh(new a.PlaneGeometry(Tt * 2, 3), u);
  m.rotation.y = Math.PI / 2, m.position.set(n - 0.55, 1.5, et), t.add(m);
  const z = new a.Mesh(new a.BoxGeometry(1.1, 0.07, Tt * 2), u);
  z.position.set(n - 0.1, 0.035, et), t.add(z), e.collide(n - 0.4, et - Tt, n + 0.55, et + Tt, 3.2);
  const b = new a.Mesh(new a.BoxGeometry(8.5, 4.4, 10), d);
  b.position.set(s + 6.5, 2.2, et + 1.5), t.add(b);
  const k = new a.Mesh(new a.BoxGeometry(8.7, 0.3, 10.2), i);
  k.position.set(s + 6.5, 4.35, et + 1.5), t.add(k);
  for (const [S, v, B] of [[s + 2.5, ue + 3.5, 2.6], [n - 6.5, he - 2.2, 2.1]]) {
    const F = new a.Mesh(new a.CylinderGeometry(0.22, 0.3, 3.4, 8), y({ color: 5916210, bands: 3, tint: 3812898 }));
    F.position.set(S, 1.7, v), t.add(F);
    const j = new a.Mesh(new a.IcosahedronGeometry(B, 1), y({ color: 4156229, bands: 3, tint: 2771506 }));
    j.position.set(S, 3.3 + B * 0.7, v), j.scale.y = 0.82, t.add(j);
  }
  const R = new a.Mesh(new a.PlaneGeometry(2.3, 2.3), new a.MeshBasicMaterial({ map: Gs(), transparent: true, depthWrite: false }));
  return R.rotation.x = -Math.PI / 2, R.position.set(n + 1.9, 0.062, et), R.renderOrder = 2, t.add(R), zt(t), { gatePos: { x: n + 0.6, z: et } };
}
const rt = {};
function zn() {
  return rt.pole || (rt.pole = y({ color: 14078680, bands: 3, tint: 6972040 }), rt.metal = y({ color: g.metal, bands: 3, tint: 6709392 }), rt.metalDark = y({ color: g.metalDark, bands: 3, tint: 6051456 }), rt.dark = y({ color: g.black, bands: 2, tint: 4932960 }), rt.wire = y({ color: 4998744, bands: 2, tint: 4275288 }), rt.red = y({ color: g.red, bands: 3, tint: 8011872 }), rt.white = y({ color: g.
  wallWhite, bands: 3, tint: 7301008 }), rt.concrete = y({ color: g.concrete, bands: 3, tint: 7301008 }), rt.concreteMid = y({ color: g.concreteMid, bands: 3, tint: 6972040 }), rt.terracotta = y({ color: 12941914, bands: 3, tint: 7296640 }), rt.leaf = y({ color: g.leaf, bands: 3, tint: 5992332 }), rt.leafDeep = y({ color: g.leafDeep, bands: 3, tint: 5992332 })), rt;
}
function Ts(e = {}) {
  const t = zn(), o = st(e.seed ?? 5), n = new a.Group(), s = e.h ?? 9.2, r = { pole: [], metal: [], dark: [], white: [] }, i = (d, h, p) => r[d].push({ geometry: h, matrix: p });
  i("pole", new a.CylinderGeometry(0.11, 0.19, s, 8), A(0, s / 2, 0)), i("pole", new a.CylinderGeometry(0.24, 0.28, 0.22, 8), A(0, 0.11, 0));
  const c = e.armYs ?? [s - 0.55, s - 1.5], l = e.armDir ?? 1;
  if (c.forEach((d, h) => {
    const p = h === 0 ? 2.1 : 1.7;
    i("dark", new a.BoxGeometry(0.09, 0.1, p), A(0, d, 0)), i("metal", new a.BoxGeometry(0.06, 0.5, 0.06), A(0, d - 0.3, 0));
    for (let x = -1; x <= 1; x++) x === 0 && h === 1 || (i("white", new a.CylinderGeometry(0.06, 0.075, 0.16, 7), A(0, d + 0.13, x * p / 2.4)), i("metal", new a.CylinderGeometry(0.02, 0.02, 0.14, 5), A(0, d + 0.04, x * p / 2.4)));
  }), e.transformer !== false) {
    const d = s - 2.9;
    i("metal", new a.BoxGeometry(0.5, 0.14, 1.5), A(l * 0.34, d + 0.62, 0));
    for (const h of [-0.42, 0.42]) i("metal", new a.CylinderGeometry(0.24, 0.24, 0.72, 10), A(l * 0.34, d + 0.24, h)), i("metal", new a.CylinderGeometry(0.26, 0.26, 0.06, 10), A(l * 0.34, d + 0.62, h));
    i("dark", new a.BoxGeometry(0.28, 0.5, 0.28), A(-l * 0.24, d + 1.1, 0));
  }
  i("dark", new a.CylinderGeometry(0.045, 0.045, s - 1.4, 5), A(l * 0.135, (s - 1.4) / 2, 0.06));
  const f = new a.Mesh(new a.CylinderGeometry(0.205, 0.21, 0.62, 12, 1, true, -1, 2), P({ color: 16777215, map: en(o.int(0, 2)), cache: false, side: a.DoubleSide }));
  if (f.position.set(0, 2.45, 0), f.rotation.y = e.plateFace ?? (l > 0 ? Math.PI / 2 : -Math.PI / 2), f.castShadow = true, n.add(f), e.lamp) {
    i("metal", new a.CylinderGeometry(0.05, 0.05, 1.3, 6), A(l * 0.65, s - 3.9, 0, 0, 0, Math.PI / 2));
    const d = new a.Mesh(new a.ConeGeometry(0.32, 0.26, 12, 1, true), t.metal);
    d.position.set(l * 1.28, s - 4.02, 0), n.add(d);
    const h = D(0.26, 0.05, 0.26, P({ color: 16773840 }), l * 1.28, s - 4.16, 0);
    n.add(h);
  }
  const u = { pole: t.pole, metal: t.metal, dark: t.dark, white: t.white };
  for (const d of Object.keys(r)) {
    if (!r[d].length) continue;
    const h = new a.Mesh(wt(r[d]), u[d]);
    h.castShadow = true, h.receiveShadow = true, n.add(h), d === "pole" && gt(h, { thickness: 34e-4 });
  }
  return n.position.set(e.x, e.y ?? 0, e.z), n.userData.top = (e.y ?? 0) + s, n;
}
function Cs(e, t) {
  const o = zn(), n = [];
  for (const i of t) {
    const { points: c, sag: l = 0.5, r: f = 0.026 } = i;
    for (let u = 0; u < c.length - 1; u++) {
      const d = c[u], h = c[u + 1], p = d.distanceTo(h), x = Kn(d, h, l * Math.min(1.6, p / 14), 12);
      n.push(new a.TubeGeometry(x, 14, f, 4, false));
    }
  }
  if (!n.length) return null;
  const s = n.length === 1 ? n[0] : wt(n.map((i) => ({ geometry: i }))), r = new a.Mesh(s, o.wire);
  return r.name = "wires", r.material = o.wire, e.add(r), n.forEach((i) => i !== s && i.dispose()), r;
}
const _t = (e, t, o = 0) => new a.Vector3(e, t, o), Bs = 0.018;
_t(-0.52, 0.33 + Bs), _t(0.55, 0.33), _t(-0.1, 0.28), _t(-0.27, 0.86), _t(0.44, 0.6), _t(0.49, 0.86), _t(0.46, 0.97), _t(-0.31, 1);
function Rs(e) {
  const t = st(9021), o = [], n = [];
  for (let i = -70; i <= 72; i += 15.5) n.push(i + t.range(-1.2, 1.2));
  let s = -1;
  for (const i of n) {
    if (Math.abs(i) < 5.5) continue;
    const c = U(i) + s * (O + q - 0.28), l = Ts({ seed: i * 31 | 0, h: 8.6, armDir: -s });
    l.position.set(c, e.groundAt(c, i), i), e.add(l), zt(l), e.collide(c - 0.22, i - 0.22, c + 0.22, i + 0.22, 8.6), o.push({ x: c, z: i, side: s }), s = -s;
  }
  const r = [];
  for (const i of [-1, 1]) {
    const c = o.filter((l) => l.side === i);
    for (const l of [0, -0.9]) {
      const f = c.map((u) => new a.Vector3(u.x, e.groundAt(u.x, u.z) + 8 + l, u.z));
      f.length > 1 && r.push({ points: f, sag: 0.55 });
    }
  }
  for (const i of [10, 26, 44, -16, -34]) {
    const c = U(i);
    r.push({ points: [new a.Vector3(c - (O + q - 0.28), 8.1, i), new a.Vector3(c + (O + q + 2.6), 6.4, i + 0.8)], sag: 0.7 });
  }
  r.push({ points: [new a.Vector3(U(-24) - 4.4, 7.9, -24), new a.Vector3(U(-6) - 4.5, 4.6, -6)], sag: 0.9 }), Cs(e, r);
}
function Is(e) {
  const t = new a.Group(), o = -14, n = U(o) + O + q - 0.2, s = y({ color: 4877964, bands: 3, tint: 3820126 }), r = y({ color: 3626606, bands: 3, tint: 3029582 });
  for (const f of [-1.6, 1.6]) {
    const u = new a.Mesh(new a.CylinderGeometry(0.06, 0.06, 2.5, 8), s);
    u.position.set(n, 1.25, o + f), t.add(u);
  }
  const i = new a.Mesh(new a.BoxGeometry(1.7, 0.08, 4), r);
  i.rotation.z = -0.06, i.position.set(n - 0.3, 2.52, o), t.add(i);
  const c = new a.Mesh(new a.BoxGeometry(0.45, 0.08, 3.2), y({ color: 9071176, bands: 2, tint: 5916214 }));
  c.position.set(n + 0.35, 0.55, o), t.add(c);
  for (const f of [-1.3, 1.3]) {
    const u = new a.Mesh(new a.BoxGeometry(0.4, 0.5, 0.08), s);
    u.position.set(n + 0.35, 0.3, o + f), t.add(u);
  }
  const l = new a.Mesh(new a.BoxGeometry(0.06, 0.75, 2), (() => {
    const f = new a.MeshBasicMaterial({ map: ps() });
    return [s, s, s, s, f, s];
  })());
  return l.position.set(n - 0.75, 1.9, o), l.rotation.y = Math.PI, t.add(l), zt(t), e.add(t), e.collide(n - 0.6, o - 1.8, n + 0.6, o + 1.8, 2.4, 0.9), { pos: { x: n - 1.2, z: o } };
}
function Es(e) {
  const t = y({ color: 7039858, bands: 2, tint: 3816010 });
  for (const { z: o, side: n } of [{ z: 45, side: -1 }, { z: -20, side: 1 }]) {
    const s = U(o) + n * (O + q + 0.15), r = new a.Mesh(new a.CylinderGeometry(0.05, 0.05, 2.9, 8), t);
    r.position.set(s, e.groundAt(s, o) + 1.45, o), e.add(r);
    const i = new a.MeshBasicMaterial({ map: ms() }), c = new a.Mesh(new a.BoxGeometry(0.05, 0.5, 2.2), [t, t, t, t, i, t]);
    c.position.set(s, 2.75, o), e.add(c), e.collide(s - 0.12, o - 0.12, s + 0.12, o + 0.12, 2.9);
  }
}
function Ps(e, t = 1) {
  const o = new a.Group(), n = y({ color: 7230272, bands: 3, tint: 4864560 }), s = [5214047, 6265940, 4161359], r = 2.6 * t, i = new a.Mesh(new a.CylinderGeometry(0.14 * t, 0.24 * t, r, 7), n);
  i.position.y = r / 2, o.add(i);
  const c = e.int(3, 5);
  for (let l = 0; l < c; l++) {
    const f = e.range(0.9, 1.5) * t, u = new a.Mesh(new a.IcosahedronGeometry(f, 1), y({ color: e.pick(s), bands: 3, tint: 3825482 }));
    u.position.set(e.range(-0.8, 0.8) * t, r + e.range(-0.2, 0.9) * t, e.range(-0.8, 0.8) * t), u.scale.y = 0.72, o.add(u);
  }
  return zt(o), o;
}
function Ds(e) {
  const t = st(777), o = [{ x: -10.5, z: 20, s: 1.5, c: true }, { x: -13.5, z: 34, s: 1.35, c: true }, { x: -5.85, z: 22.5, s: 1.25, c: true }, { x: -5.7, z: -14, s: 1.1, c: true }, { x: O + q + 1.1, z: -27, s: 1, c: true }, { x: -5.9, z: -44, s: 1.2, c: true }, { x: O + q + 1, z: -58, s: 1, c: true }, { x: O + q + 1.2, z: 50, s: 1.1, c: true }, { x: -5.7, z: 52.5, s: 0.95, c: true }, { x: O + q +
  1.3, z: 66, s: 1.15, c: true }];
  for (const n of o) {
    const s = U(n.z) + n.x, r = Ps(t, n.s);
    r.position.set(s, e.groundAt(s, n.z), n.z), e.add(r), n.c && e.collide(s - 0.26, n.z - 0.26, s + 0.26, n.z + 0.26, 2.4);
  }
}
function Ls(e) {
  const t = new a.Group(), o = y({ color: 9071170, bands: 3, tint: 4864548 }), n = y({ color: 10123850, bands: 3, tint: 5916208 }), s = [4160053, 14186274, 11743532, 5909867, 8034874, 14201402], r = [{ z: 31.5, tarp: 2775706 }, { z: 35.4, tarp: 3832394 }];
  for (const i of r) {
    const c = U(i.z) - (O + q - 1);
    for (const [h, p] of [[-0.8, -1], [0.8, -1], [-0.8, 1], [0.8, 1]]) {
      const x = new a.Mesh(new a.CylinderGeometry(0.045, 0.05, 2.3, 6), n);
      x.position.set(c + h, 1.15, i.z + p), t.add(x);
    }
    const l = new a.Mesh(new a.BoxGeometry(2.1, 0.05, 2.6), y({ color: i.tarp, bands: 3, tint: 1714746 }));
    l.position.set(c, 2.32, i.z), l.rotation.z = 0.12, l.rotation.x = 0.06, t.add(l);
    const f = new a.Mesh(new a.BoxGeometry(1.5, 0.55, 1.8), o);
    f.position.set(c, 0.5, i.z), t.add(f);
    let u = 0;
    for (const h of [-0.6, 0, 0.6]) for (const p of [-0.4, 0.05, 0.5]) {
      const x = new a.Mesh(new a.IcosahedronGeometry(0.15, 1), y({ color: s[u % s.length], bands: 3, tint: 2767394 }));
      x.position.set(c + p, 0.86, i.z + h), x.scale.y = 0.6, t.add(x), u++;
    }
    const d = new a.Mesh(new a.CylinderGeometry(0.32, 0.24, 0.35, 10), o);
    d.position.set(c + 1.1, 0.18, i.z + 0.7), t.add(d), e.collide(c - 0.9, i.z - 1.05, c + 0.9, i.z + 1.05, 2.2);
  }
  zt(t), e.add(t);
}
const ot = {};
function _s() {
  return ot.concrete || (ot.concrete = y({ color: g.concrete, bands: 3, tint: 7301008 }), ot.concreteMid = y({ color: g.concreteMid, bands: 3, tint: 6972040 }), ot.metal = y({ color: g.metal, bands: 3, tint: 6709392 }), ot.metalDark = y({ color: g.metalDark, bands: 3, tint: 6051456 }), ot.dark = y({ color: g.black, bands: 2, tint: 4932960 }), ot.shell = y({ color: 12896462, bands: 3, tint: 6709392 }),
  ot.shellTrim = y({ color: 10133672, bands: 3, tint: 6051456 }), ot.wood = y({ color: 10256222, bands: 3, tint: 6051456 }), ot.woodDark = y({ color: 8217416, bands: 3, tint: 6051456 }), ot.soil = y({ color: 7627342, bands: 3, tint: 6380160 }), ot.bamboo = y({ color: g.bamboo, bands: 3, flat: false, tint: 5992332 }), ot.twine = y({ color: g.rope, bands: 3, flat: false, tint: 7301008 }), ot.pale = P(
  { color: 16184040 })), ot;
}
const N = (e, t, o = 0) => new a.Vector3(e, t, o), Ns = N(0, 1, 0), Xe = /* @__PURE__ */ new Map();
function Os(e) {
  return Xe.has(e) || Xe.set(e, new a.CylinderGeometry(1, 1, 1, e, 1)), Xe.get(e);
}
function Q(e, t, o, n, s = 6) {
  const r = new a.Vector3().subVectors(o, t), i = r.length();
  i < 1e-4 || e.push({ geometry: Os(s), matrix: new a.Matrix4().compose(new a.Vector3().addVectors(t, o).multiplyScalar(0.5), new a.Quaternion().setFromUnitVectors(Ns, r.normalize()), N(n, i, n)) });
}
function Fs(e, t, o, n = {}) {
  const s = n.noCast ?? [];
  for (const r of Object.keys(t)) {
    if (!t[r].length) continue;
    const i = new a.Mesh(wt(t[r]), o[r]);
    i.castShadow = !s.includes(r), i.receiveShadow = true, e.add(i), r === n.outline && gt(i, { thickness: n.thickness ?? 32e-4 });
  }
  return e;
}
function Do(e = {}) {
  const t = _s(), o = new a.Group(), n = new a.Group();
  o.add(n);
  const s = 0.2, r = { RA: N(-0.6, s), FA: N(0.57, s), ENG: N(-0.3, 0.28), RS: N(-0.22, 0.3), FS: N(0.3, 0.28), HS: N(0.48, 0.62), HT: N(0.4, 0.96), BAR: N(0.38, 1), SHK: N(-0.44, 0.5) }, i = { dark: [], metal: [], body: [], amber: [], dial: [] }, c = (f, u, d) => i[f].push({ geometry: u, matrix: d }), l = y({ color: e.color ?? 13227228, bands: 3, tint: 7301008 });
  for (const f of [r.RA, r.FA]) c("dark", new a.CylinderGeometry(s, s, 0.09, 14), A(f.x, f.y, 0, Math.PI / 2)), c("metal", new a.CylinderGeometry(0.125, 0.125, 0.11, 12), A(f.x, f.y, 0, Math.PI / 2)), c("dark", new a.CylinderGeometry(0.038, 0.038, 0.13, 8), A(f.x, f.y, 0, Math.PI / 2));
  c("body", new a.TorusGeometry(s + 0.04, 0.026, 4, 14, Math.PI * 0.85), A(r.FA.x, r.FA.y, 0, 0, 0, -0.72, 1, 1, 2.2)), c("body", new a.TorusGeometry(s + 0.05, 0.032, 4, 12, Math.PI * 0.62), A(r.RA.x, r.RA.y, 0, 0, 0, 0.55, 1, 1, 1.9));
  for (const f of [-1, 1]) Q(i.metal, N(r.HS.x, r.HS.y, f * 0.055), N(r.FA.x, r.FA.y, f * 0.055), 0.019), Q(i.metal, N(r.ENG.x, r.ENG.y, f * 0.062), N(r.RA.x, r.RA.y, f * 0.062), 0.022);
  Q(i.metal, r.HS, r.HT, 0.026), Q(i.metal, r.HS, r.FS, 0.026), Q(i.metal, r.FS, r.RS, 0.024), Q(i.metal, r.RS, r.SHK, 0.024), Q(i.metal, N(r.SHK.x, r.SHK.y, 0.07), N(r.RA.x + 0.02, r.RA.y + 0.04, 0.07), 0.024), Q(i.metal, N(-0.14, 0.26, -0.09), N(-0.24, 0.015, -0.19), 0.016);
  for (const f of [-1, 1]) c("body", new a.BoxGeometry(0.5, 0.24, 0.11), A(-0.4, 0.4, f * 0.125));
  c("body", new a.BoxGeometry(0.46, 0.09, 0.34), A(-0.4, 0.505, 0)), c("dark", new a.BoxGeometry(0.34, 0.08, 0.3), A(-0.46, 0.59, 0)), c("dark", new a.BoxGeometry(0.16, 0.065, 0.2), A(-0.24, 0.575, 0)), c("body", new a.BoxGeometry(0.56, 0.03, 0.36), A(0.06, 0.275, 0)), c("dark", new a.BoxGeometry(0.46, 0.014, 0.28), A(0.04, 0.297, 0)), c("body", new a.BoxGeometry(0.16, 0.46, 0.42), A(0.38, 0.68, 0,
  0, 0, 0.22)), c("body", new a.BoxGeometry(0.16, 0.16, 0.38), A(0.3, 0.4, 0)), c("body", new a.BoxGeometry(0.16, 0.18, 0.3), A(0.4, 0.94, 0)), Q(i.metal, N(-0.28, 0.28, 0.09), N(-0.5, 0.245, 0.13), 0.024), c("metal", new a.CylinderGeometry(0.045, 0.045, 0.24, 10), A(-0.62, 0.24, 0.14, 0, 0, Math.PI / 2)), c("metal", new a.BoxGeometry(0.28, 0.025, 0.26), A(-0.66, 0.655, 0));
  for (const f of [-1, 1]) Q(i.metal, N(-0.56, 0.65, f * 0.11), N(-0.5, 0.55, f * 0.13), 0.014), Q(i.metal, N(-0.78, 0.65, f * 0.11), N(-0.68, 0.55, f * 0.12), 0.014), Q(i.metal, N(-0.54, 0.6, f * 0.145), N(-0.72, 0.7, f * 0.115), 0.013);
  Q(i.metal, N(-0.72, 0.7, -0.115), N(-0.72, 0.7, 0.115), 0.013);
  {
    const f = P({ color: g.wallGray }), u = P({ color: 16777215, map: Wn(), cache: false }), d = new a.Mesh(new a.BoxGeometry(0.02, 0.13, 0.24), [f, u, f, f, f, f]);
    d.position.set(-0.77, 0.42, 0), d.castShadow = true, n.add(d);
  }
  c("metal", new a.CylinderGeometry(0.018, 0.018, 0.56, 6), A(r.BAR.x, r.BAR.y, 0, Math.PI / 2)), Q(i.metal, r.HT, r.BAR, 0.022);
  for (const f of [-1, 1]) c("dark", new a.CylinderGeometry(0.024, 0.024, 0.11, 6), A(r.BAR.x, r.BAR.y, f * 0.22, Math.PI / 2)), Q(i.metal, N(0.36, 1.02, f * 0.18), N(0.32, 1.24, f * 0.24), 0.012), c("dark", new a.BoxGeometry(0.03, 0.11, 0.14), A(0.31, 1.26, f * 0.25)), n.add(D(8e-3, 0.09, 0.12, P({ color: g.mirrorFace }), 0.294, 1.26, f * 0.25)), c("amber", new a.BoxGeometry(0.06, 0.05, 0.05), A(
  0.45, 0.86, f * 0.19));
  if (c("metal", new a.CylinderGeometry(0.095, 0.095, 0.06, 14), A(0.48, 0.9, 0, 0, 0, Math.PI / 2)), n.add(ne(0.082, 0.082, 0.02, 14, P({ color: 16774360 }), 0.514, 0.9, 0).rotateZ(Math.PI / 2)), e.cockpit) {
    const u = N(0.392, 1.06, 0), d = new a.Quaternion().setFromAxisAngle(N(0, 0, 1), 0.52), h = N(0, 1, 0).applyQuaternion(d), p = (w) => d.clone().multiply(new a.Quaternion().setFromAxisAngle(N(0, 1, 0), -w)), x = (w, M, G, T, m) => {
      const z = p(G), b = u.clone().addScaledVector(h, m).add(N(T, 0, 0).applyQuaternion(z));
      c(M, w, new a.Matrix4().compose(b, z, N(1, 1, 1)));
    };
    c("dark", new a.CylinderGeometry(0.062, 0.062, 0.05, 14), A(u.x, u.y, u.z, 0, 0, 0.52)), x(new a.CylinderGeometry(0.05, 0.05, 8e-3, 14), "dial", 0, 0, 0.026), x(new a.BoxGeometry(0.042, 4e-3, 5e-3), "dark", -2.36, 0.021, 0.032), x(new a.CylinderGeometry(7e-3, 7e-3, 6e-3, 8), "dark", 0, 0, 0.032), x(new a.CylinderGeometry(9e-3, 9e-3, 5e-3, 8), "amber", 1.9, 0.033, 0.031);
    for (const w of [-1, 1]) Q(i.metal, N(0.4, 1, w * 0.163), N(0.468, 0.988, w * 0.248), 9e-3);
    c("metal", new a.CylinderGeometry(0.026, 0.026, 0.05, 10), A(0.315, 0.88, -0.05, 0, 0, Math.PI / 2));
    {
      const w = N(-1, 0, 0).applyEuler(new a.Euler(0, 0, 0.22)), M = N(0.38, 0.68, 0).addScaledVector(w, 0.081), G = M.clone().addScaledVector(w, 0.05);
      Q(i.metal, M, G, 9e-3), Q(i.metal, G, G.clone().add(N(0, 0.035, 0)), 9e-3);
    }
  }
  return Fs(n, i, { dark: t.dark, metal: t.metal, body: l, amber: y({ color: g.orange, bands: 2, tint: 9396304 }), dial: P({ color: 15328986 }) }, { outline: "body", thickness: 34e-4 }), n.rotation.x = e.lean ?? -0.09, o.position.set(e.x, e.y ?? 0, e.z), o.rotation.y = e.ry ?? 0, o.userData.inner = n, o;
}
function oo(e = {}) {
  const t = new a.Group(), o = new a.Group();
  t.add(o), t.userData.inner = o;
  const n = y({ color: e.color ?? 15251488, bands: 3, tint: 9071146 }), s = y({ color: 2302758, bands: 2, tint: 3816010 }), r = y({ color: 3026483, bands: 2, tint: 3816010 }), i = y({ color: 10133672, bands: 3, tint: 6051456 }), c = P({ color: 10338516, transparent: true, opacity: 0.55 }), l = { yellow: [], black: [], dark: [], metal: [] }, f = (p, x, w) => l[p].push({ geometry: x, matrix: w }), u = 0.25;
  f("dark", new a.CylinderGeometry(u, u, 0.1, 14), A(0.72, u, 0, Math.PI / 2)), f("metal", new a.CylinderGeometry(0.14, 0.14, 0.11, 12), A(0.72, u, 0, Math.PI / 2));
  for (const p of [-1, 1]) f("dark", new a.CylinderGeometry(u, u, 0.1, 14), A(-0.62, u, p * 0.58, Math.PI / 2)), f("metal", new a.CylinderGeometry(0.14, 0.14, 0.11, 12), A(-0.62, u, p * 0.58, Math.PI / 2));
  f("black", new a.BoxGeometry(1.9, 0.08, 1.28), A(-0.15, 0.34, 0)), f("black", new a.BoxGeometry(1.5, 0.42, 0.05), A(-0.45, 0.6, 0.62)), f("black", new a.BoxGeometry(1.5, 0.42, 0.05), A(-0.45, 0.6, -0.62)), f("black", new a.BoxGeometry(0.06, 0.42, 1.28), A(-1.08, 0.6, 0)), f("dark", new a.BoxGeometry(0.42, 0.14, 1.1), A(-0.82, 0.62, 0)), f("dark", new a.BoxGeometry(0.1, 0.5, 1.1), A(-1, 0.86, 0)),
  f("dark", new a.BoxGeometry(0.34, 0.1, 0.42), A(-0.46, 0.66, 0)), f("yellow", new a.BoxGeometry(0.5, 0.5, 0.72), A(0.32, 0.62, 0)), f("yellow", new a.BoxGeometry(0.28, 0.34, 0.5), A(0.66, 0.52, 0)), f("dark", new a.CylinderGeometry(0.09, 0.09, 0.1, 10), A(0.82, 0.62, 0, 0, 0, Math.PI / 2)), f("yellow", new a.TorusGeometry(u + 0.05, 0.05, 4, 12, Math.PI), A(0.72, u + 0.02, 0, 0, 0, 0, 1, 1, 2.2)),
  f("metal", new a.CylinderGeometry(0.025, 0.025, 0.4, 6), A(0.18, 0.82, 0, 0, 0, -0.5)), f("dark", new a.CylinderGeometry(0.028, 0.028, 0.5, 6), A(0.1, 0.98, 0, Math.PI / 2)), f("yellow", new a.BoxGeometry(0.05, 0.72, 0.05), A(-1.06, 1.15, 0.58)), f("yellow", new a.BoxGeometry(0.05, 0.72, 0.05), A(-1.06, 1.15, -0.58)), f("yellow", new a.BoxGeometry(0.05, 0.62, 0.05), A(0.28, 1.1, 0.5, 0, 0, -0.18)),
  f("yellow", new a.BoxGeometry(0.05, 0.62, 0.05), A(0.28, 1.1, -0.5, 0, 0, -0.18)), f("yellow", new a.CylinderGeometry(0.66, 0.66, 1.5, 12, 1, false, 0, Math.PI), A(-0.4, 1.02, 0, Math.PI / 2, 0, Math.PI / 2, 1, 0.45, 1));
  const d = new a.Mesh(new a.PlaneGeometry(0.62, 0.5), c);
  d.position.set(0.33, 1.28, 0), d.rotation.y = Math.PI / 2, d.rotation.x = 0, d.rotation.z = -0.22, d.userData.noShadow = true, o.add(d);
  const h = { yellow: n, black: s, dark: r, metal: i };
  for (const p of Object.keys(l)) {
    if (!l[p].length) continue;
    const x = new a.Mesh(wt(l[p]), h[p]);
    o.add(x);
  }
  return o.rotation.x = e.lean ?? 0, zt(t), t.userData.noOutline = false, t;
}
const Lo = new a.Vector3(), _o = new a.Vector3(), No = new a.Vector3(), Oo = new a.Matrix4(), Fo = new a.Quaternion(), Vo = new a.Quaternion(), Wo = new a.Euler();
function no(e, t, o, n, s) {
  ae(t, o, Lo, _o, No), Oo.makeBasis(_o, Lo, No), Fo.setFromRotationMatrix(Oo), Wo.set(0, s + Math.PI / 2, 0, "YXZ"), Vo.setFromEuler(Wo), e.quaternion.copy(Fo).multiply(Vo), Zt(t, n, o, e.position);
}
function Vs(e) {
  const t = [], o = [{ kind: "auto", lane: -1.55, dir: 1, speed: 4.2, z0: -30, color: 15251488 }, { kind: "auto", lane: 1.55, dir: -1, speed: 3.8, z0: 24, color: 14198808 }, { kind: "scooter", lane: 1.45, dir: -1, speed: 5.2, z0: -55, color: 11881018 }];
  for (const c of o) {
    const l = c.kind === "auto" ? oo({ color: c.color }) : Do({ color: c.color });
    l.userData.planetRigid = true, e.add(l);
    const f = { x0: 0, x1: 0, z0: 0, z1: 0, top: 1.6 };
    e.colliders.push(f), t.push({ obj: l, ...c, z: c.z0, collider: f });
  }
  const n = [{ kind: "auto", x: 1, z: 38.5, ry: 0.35, color: 15251488 }, { kind: "auto", x: 1, z: 41.2, ry: -0.2, color: 13146144 }, { kind: "scooter", x: -1, z: -8.5, ry: 0.3 }, { kind: "scooter", x: -1, z: -10.2, ry: -0.4 }, { kind: "scooter", x: 1, z: 14.8, ry: 0.2 }, { kind: "scooter", x: -1, z: 33.5, ry: -0.25 }, { kind: "scooter", x: -1, z: 24.2, ry: 0.15 }];
  for (const c of n) {
    const l = U(c.z) + c.x * (O + 0.75), f = c.kind === "auto" ? oo({ color: c.color, lean: -0.03 }) : Do({ color: c.color ?? 13227228 });
    f.position.set(l, e.groundAt(l, c.z), c.z), f.rotation.y = c.ry + (c.x > 0 ? -Math.PI / 2 : Math.PI / 2), e.add(f);
    const u = c.kind === "auto" ? 1.1 : 0.9, d = c.kind === "auto" ? 0.75 : 0.4;
    e.collide(l - d, c.z - u, l + d, c.z + u, 1.3);
  }
  let s = () => false;
  const r = 3.4;
  function i(c) {
    for (const l of t) {
      let f = l.speed;
      if (s()) {
        const h = l.z + l.dir * f * c;
        (l.dir > 0 ? l.z < -r && h >= -r : l.z > r && h <= r) && (f = 0), l.dir > 0 && l.z < -r - 0.01 && h > -r && (f = 0), l.dir < 0 && l.z > r + 0.01 && h < r && (f = 0);
      }
      l.z += l.dir * f * c, l.z > Vt - 2 && (l.z = Ft + 2), l.z < Ft + 2 && (l.z = Vt - 2);
      const u = U(l.z) + l.lane, d = l.dir > 0 ? Math.PI : 0;
      no(l.obj, u, l.z, 0.02, d), l.collider.x0 = u - 0.8, l.collider.x1 = u + 0.8, l.collider.z0 = l.z - 1.3, l.collider.z1 = l.z + 1.3;
    }
  }
  return { update: i, setGatesDown(c) {
    s = c;
  } };
}
const Ws = [13146474, 11896150, 11040328, 9857084], Hs = [13126460, 3112299, 14735560, 4026052, 14198844, 9400245, 15236e3, 15790312], Us = [3817290, 4866616, 5921382, 3026483, 7035464];
function Ho(e) {
  const t = new a.Group(), o = y({ color: e.pick(Ws), bands: 3, tint: 9072478 }), n = y({ color: e.pick(Hs), bands: 3, tint: 7036528 }), s = y({ color: e.pick(Us), bands: 2, tint: 3816010 }), r = y({ color: 2367518, bands: 2, tint: 3816010 }), i = e.range(0.92, 1.06), c = new a.Mesh(new a.BoxGeometry(0.34, 0.55, 0.2), n);
  c.position.y = 1.06 * i, t.add(c);
  const l = new a.Mesh(new a.SphereGeometry(0.115, 10, 8), o);
  l.position.y = 1.5 * i, t.add(l);
  const f = new a.Mesh(new a.SphereGeometry(0.118, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), r);
  f.position.y = 1.51 * i, t.add(f);
  const u = new a.Mesh(new a.BoxGeometry(0.11, 0.78, 0.13), s), d = u.clone();
  u.geometry = u.geometry.clone(), u.geometry.translate(0, -0.39, 0), d.geometry = u.geometry, u.position.set(0, 0.78 * i, 0.08), d.position.set(0, 0.78 * i, -0.08), t.add(u, d);
  const h = new a.Mesh(new a.BoxGeometry(0.08, 0.5, 0.09), n);
  h.geometry = h.geometry.clone(), h.geometry.translate(0, -0.25, 0);
  const p = h.clone();
  return h.position.set(0, 1.3 * i, 0.23), p.position.set(0, 1.3 * i, -0.23), t.add(h, p), zt(t), t.userData.legs = [u, d], t.userData.arms = [h, p], t.userData.scale = i, t;
}
function js(e) {
  const t = st(4517), o = [], n = 7;
  for (let i = 0; i < n; i++) {
    const c = i % 2 === 0 ? -1 : 1, l = Ho(t);
    l.userData.planetRigid = true, e.add(l), o.push({ obj: l, side: c, z: t.range(Ft + 8, Vt - 8), dir: t.sign(), speed: t.range(0.9, 1.6), phase: t.range(0, 10), t: 0 });
  }
  const s = [{ x: 4.6, z: -14.4, ry: -0.5 }, { x: 4.5, z: 38.2, ry: 2.4 }].map((i) => {
    const c = Ho(t);
    return c.userData.planetRigid = true, e.add(c), { obj: c, ...i, phase: t.range(0, 10), t: 0 };
  });
  function r(i) {
    for (const c of o) {
      c.t += i, c.z += c.dir * c.speed * i;
      const l = 72;
      c.z > l && (c.z = l, c.dir = -1), c.z < -l && (c.z = -l, c.dir = 1);
      const f = U(c.z) + c.side * (O + q * 0.55), u = c.dir > 0 ? Math.PI : 0;
      no(c.obj, f, c.z, St, u);
      const d = Math.sin(c.t * 6.4 * c.speed) * 0.5, [h, p] = c.obj.userData.legs, [x, w] = c.obj.userData.arms;
      h.rotation.z = d, p.rotation.z = -d, x.rotation.z = -d * 0.7, w.rotation.z = d * 0.7;
    }
    for (const c of s) {
      c.t += i;
      const l = U(c.z) + c.x;
      no(c.obj, l, c.z, St, c.ry), c.obj.position.y += 0;
      const [f] = c.obj.userData.arms;
      f.rotation.z = Math.sin(c.t * 1.2) * 0.06;
    }
  }
  return { update: r };
}
const Ks = [{ id: "gate", label: "Shankar Mutt  \xB7  look closer", pos: (e) => ({ x: e - (O + q + 0.4), z: 27, y: 1.6 }), card: { title: "Sri Shankar Mutt, Nallakunta", body: "The Nallakunta branch of the Sringeri Sharada Peetham. Saffron arch with the blue Telugu board, pale wall with the orange band, posters by the gate - every kid on this road gave directions by it. The real gate stands at 17.\
4006 N, 78.5072 E, on the west side of the main road." } }, { id: "tree", label: "The temple tree  \xB7  look closer", pos: (e) => ({ x: e - (O + q + 1.15), z: 22.5, y: 2.2 }), card: { title: "The tree outside the wall", body: 'Every old Hyderabad street has one tree older than the buildings. Distances here were never in metres - they were "past the tree, before the gate." The bougainvillea on the\
 coping drops petals on the footway all year.' } }, { id: "pharmacy", label: "Saince Pharmacy  \xB7  look closer", pos: (e) => ({ x: e + (O + q + 0.4), z: 8.5, y: 1.6 }), card: { title: "Saince Pharmacy", body: "The pharmacy opposite the mutt. Strips of tablets cut to count, ORS through the summer, a torch behind the counter for when the power went. Every household on the street has run a small ta\
b of mercies here." } }, { id: "tiffins", label: "Tiffin centre  \xB7  look closer", pos: (e) => ({ x: e - (O + q + 0.4), z: 44.5, y: 1.6 }), card: { title: "Siddhartha Tiffin Centre", body: "Idli at seven in the morning, punugulu at four in the evening. The steel plates never stopped moving and neither did the queue. Half the neighbourhood's mornings started standing here." } }, { id: "bakery", label: "\
Tasty Bakery  \xB7  look closer", pos: (e) => ({ x: e + (O + q + 0.4), z: -66, y: 1.6 }), card: { title: "Tasty Bakery", body: "The bakery everyone walking back from tuition smelled before they saw. Dilpasand and veg puffs in the glass case, birthday cakes ordered a day in advance, the good cream if you knew to ask. The most-named shop in the reel comments." } }, { id: "ramaiah", label: "Ramaiah S\
tudy Circle  \xB7  look closer", pos: (e) => ({ x: e + (O + q + 0.4), z: 68, y: 1.6 }), card: { title: "Ramaiah IIT Study Circle", body: "A short walk north of the mutt: the original IIT factory, as the reel calls it. Generations of rank dreams queued at this gate at six in the morning, question papers still warm from the cyclostyle." } }, { id: "bakersq", label: "Bakers 'Q  \xB7  look closer", pos: () => ({
x: 22.2 + 4.65, z: 14.6, y: 1.6 }), card: { title: "Bakers 'Q", body: "The Shivam Road bakery with the chef-hat board. Birthday cakes for half the colony, puffs after tuition, and the glass counter you pressed your nose against while amma paid." } }, { id: "papaji", label: "Papaji da Dhaba  \xB7  look closer", pos: () => ({ x: 15.2 + 4.65, z: 14.6, y: 1.6 }), card: { title: "Papaji da Dhaba", body: "\
Punjabi dhaba smells on a Telugu street: tandoor smoke, dal fry, and steel plates. Where treat money went when the exam results were good." } }, { id: "tea", label: "Tea point  \xB7  look closer", pos: (e) => ({ x: e + (O + q + 0.4), z: 38.5, y: 1.6 }), card: { title: "The tea point", body: 'Irani chai by the glass, Osmania biscuits on a steel plate. The conversations were the point; the tea was t\
he excuse. Someone has been "just leaving" here for forty minutes.' } }, { id: "busstop", label: "Bus stop  \xB7  look closer", pos: (e) => ({ x: e + (O + q - 1), z: -14, y: 1.6 }), card: { title: "The bus stop", body: "107, 113, 116J. Buses came when they came, and you learned to read the road for them two turns away. Whole friendships were made waiting here." } }, { id: "crossing", label: "MMTS \
line  \xB7  look closer", pos: (e) => ({ x: e + 4.4, z: 3.6, y: 1.4 }), card: { title: "The railway line", body: "The MMTS line past Vidyanagar, the neighbourhood's other clock. If you grew up here you can still hear the horn before the gates come down - and you still know exactly how long you have." } }];
function qs(e) {
  for (const t of Ks) {
    const o = U(t.pos(0).z), n = t.pos(o), s = new a.Mesh(new a.BoxGeometry(1.8, 2.4, 2.6), P({ color: 16711680, cache: false }));
    s.position.set(n.x, n.y, n.z), s.visible = false, e.add(s), e.interact({ hitbox: s, label: t.label, action: () => {
      window.dispatchEvent(new CustomEvent("nf-memory", { detail: t.card }));
    } });
  }
}
function $s(e) {
  ys(e), As(e), Ls(e), Ms(e), vs(e), zs(e), Rs(e), Is(e), Es(e), Ds(e), qs(e);
  const t = Vs(e), o = js(e);
  return e.update((n) => {
    t.update(n), o.update(n);
  }), { traffic: t, people: o };
}
function Ys(e) {
  const t = new a.Group();
  t.name = "world", e.add(t);
  const o = [], n = [], s = [], r = [], i = [], c = { scene: e, root: t, colliders: o, interactables: n, add: (m) => (t.add(m), m), collide: (m, z, b, k, R, S) => {
    o.push({ x0: Math.min(m, b), x1: Math.max(m, b), z0: Math.min(z, k), z1: Math.max(z, k), top: R, bottom: S });
  }, platform: (m) => r.push(m), cut: (m) => i.push(m), groundAt: (m, z) => {
    let b = yo(m, z);
    for (const k of i) m > k.x0 && m < k.x1 && z > k.z0 && z < k.z1 && (b = Math.min(b, k.top));
    for (const k of r) m > k.x0 && m < k.x1 && z > k.z0 && z < k.z1 && (b = Math.max(b, k.top));
    return b;
  }, interact: (m) => n.push(m), update: (m) => s.push(m) }, l = aa(e), f = es(c), u = ds(c), d = $s(c), h = fs(c), p = 165, x = { blink: 0, armT: 0 };
  f.request = () => {
    u.x = vt(-153 * u.dir);
  };
  const w = [1, -1].map((m) => {
    const z = { x0: U(0) - O - 0.6, x1: U(0) + O + 0.6, z0: m * Re - 0.16, z1: m * Re + 0.16, top: -1 };
    return o.push(z), z;
  });
  function M(m) {
    x.blink = (x.blink + m * 1.6) % 1;
    const z = -u.offset * u.dir, b = z < p && z > -62, k = m / (b ? 3.4 : 3);
    x.armT = Math.max(0, Math.min(1, x.armT + (b ? k : -k))), f.setArms(x.armT), f.setLamps(b || x.armT > 0.02, x.blink);
    const R = x.armT > 0.55 ? 1.25 : -1;
    w[0].top = R, w[1].top = R;
  }
  d.traffic.setGatesDown(() => x.armT > 0.55);
  const G = ea(t, { maxEdge: 4 });
  return u.planetize(), { root: t, colliders: o, platforms: r, cuts: i, interactables: n, train: u, crossing: f, planet: l, petals: h, bakeStats: G, bounds: { z0: -xt * 0.24, z1: xt * 0.24 }, heightAt(m, z, b) {
    let k = yo(m, z);
    for (const S of i) m > S.x0 && m < S.x1 && z > S.z0 && z < S.z1 && (k = Math.min(k, S.top));
    const R = b === void 0 ? 1 / 0 : b + 0.55;
    for (const S of r) S.top > R || m > S.x0 && m < S.x1 && z > S.z0 && z < S.z1 && (k = Math.max(k, S.top));
    return k;
  }, update(m) {
    M(m), u.update(m);
    for (const z of s) z(m);
    h.update(m, u.gust, u.dir);
  } };
}
const Uo = 0.88, jo = 0.34, Ko = 1.17, qo = -0.09, Xs = 2.4, Qs = 0.34, Zs = 0.38;
function Js({ scene: e, world: t, player: o, hud: n }) {
  const s = oo({ color: 15251488, lean: qo }), r = s.userData.inner;
  s.visible = false, e.add(s);
  const i = new a.Mesh(new a.BoxGeometry(1.9, 1.35, 0.95), P({ color: 16711680, cache: false }));
  i.position.set(-0.05, 0.68, 0), i.visible = false, s.add(i);
  const c = { hitbox: i, label: "auto  \xB7  ride it", action: () => v() }, l = { out: false, riding: false, x: 0, z: 0, heading: 0 };
  let f = null;
  const u = new a.Vector3(), d = new a.Vector3(), h = new a.Vector3(), p = new a.Matrix4(), x = new a.Quaternion(), w = new a.Quaternion(), M = new a.Euler();
  function G(C, L, W, I, E) {
    ae(C, L, u, d, h), p.makeBasis(d, u, h), x.setFromRotationMatrix(p), M.set(0, I + Math.PI / 2, E, "YXZ"), w.setFromEuler(M), s.quaternion.copy(x).multiply(w), Zt(C, W, L, s.position), s.updateMatrixWorld(true);
  }
  function T(C, L, W, I) {
    const E = -Math.sin(W), K = -Math.cos(W), ft = Ko / 2, _e = t.heightAt(vt(C + E * ft), L + K * ft, I), re = t.heightAt(vt(C - E * ft), L - K * ft, I);
    return a.MathUtils.clamp(Math.atan2(_e - re, Ko), -0.45, 0.45);
  }
  function m(C) {
    if (f) {
      const ft = t.colliders.indexOf(f);
      ft >= 0 && t.colliders.splice(ft, 1), f = null;
    }
    if (!C) return;
    const L = Math.abs(Math.sin(l.heading)), W = Math.abs(Math.cos(l.heading)), I = Uo * L + jo * W, E = Uo * W + jo * L, K = t.heightAt(l.x, l.z, o.pos.y);
    f = { x0: l.x - I, x1: l.x + I, z0: l.z - E, z1: l.z + E, top: K + 1.02 }, t.colliders.push(f);
  }
  function z(C, L, W, I) {
    for (const E of t.colliders) if (E !== f && !(E.top !== void 0 && E.top <= I + Zs) && !(E.bottom !== void 0 && E.bottom > I + 1.9) && C > E.x0 - W && C < E.x1 + W && L > E.z0 - W && L < E.z1 + W) return false;
    return true;
  }
  function b(C) {
    const L = t.interactables.indexOf(c);
    C && L < 0 && t.interactables.push(c), !C && L >= 0 && t.interactables.splice(L, 1);
  }
  function k() {
    const C = t.heightAt(l.x, l.z, o.pos.y);
    r.rotation.x = qo, G(l.x, l.z, C, l.heading, T(l.x, l.z, l.heading, C)), s.visible = true, l.out = true, m(true), b(true);
  }
  function R() {
    const C = o.pos.y;
    let L = null;
    for (const W of [2, 1.65, 2.6, 1.3]) {
      for (const I of [0, 0.45, -0.45, 0.95, -0.95, 1.6, -1.6]) {
        const E = vt(o.pos.x - Math.sin(o.yaw + I) * W), K = o.pos.z - Math.cos(o.yaw + I) * W;
        if (z(E, K, 0.8, C) && !(Math.abs(t.heightAt(E, K, C) - C) > 0.5)) {
          L = { x: E, z: K };
          break;
        }
      }
      if (L) break;
    }
    L || (L = { x: vt(o.pos.x - Math.sin(o.yaw) * 1.5), z: o.pos.z - Math.cos(o.yaw) * 1.5 }), l.x = L.x, l.z = L.z, l.heading = o.yaw - 0.35, k(), n?.flash("auto  \xB7  E to ride", 1700);
  }
  function S() {
    l.riding || (s.visible = false, l.out = false, m(false), b(false), n?.flash("auto  \xB7  put away", 1200));
  }
  function v() {
    !l.out || l.riding || (o.yaw = l.heading, o.pos.x = vt(l.x + Math.sin(l.heading) * Wt.seatFwd), o.pos.z = l.z + Math.cos(l.heading) * Wt.seatFwd, m(false), b(false), l.riding = true, o.mount(c), n?.flash("auto  \xB7  W to go, E to get off", 2e3));
  }
  function B() {
    if (!l.riding) return;
    l.riding = false, o.unmount();
    const C = Math.cos(l.heading), L = -Math.sin(l.heading), W = -Math.sin(l.heading), I = -Math.cos(l.heading), E = o.pos.y, K = [[-C * 1.35, -L * 1.35], [C * 1.35, L * 1.35], [-W * 1.9, -I * 1.9]];
    for (const [ft, _e] of K) {
      const re = vt(o.pos.x + ft), Ne = o.pos.z + _e;
      if (z(re, Ne, Qs, E) && !(Math.abs(t.heightAt(re, Ne, E) - E) > 0.6)) {
        o.pos.x = re, o.pos.z = Ne;
        break;
      }
    }
    k(), n?.flash("auto  \xB7  parked", 1200);
  }
  function F() {
    if (l.riding) {
      B();
      return;
    }
    if (!l.out) {
      R();
      return;
    }
    Math.hypot(rn(l.x, o.pos.x), l.z - o.pos.z) > 4 ? R() : S();
  }
  function j() {
    if (!l.riding) return;
    const C = o.yaw, L = -Math.sin(C), W = -Math.cos(C), I = vt(o.pos.x + L * Wt.seatFwd), E = o.pos.z + W * Wt.seatFwd;
    G(I, E, o.pos.y, C, T(I, E, C, o.pos.y)), r.rotation.x = -o.roll * Xs, l.x = I, l.z = E, l.heading = C;
  }
  return { group: s, toggle: F, summon: R, recall: S, mount: v, dismount: B, update: j, get riding() {
    return l.riding;
  }, get summoned() {
    return l.out;
  } };
}
const co = document.getElementById("view"), Kt = new a.WebGLRenderer({ canvas: co, antialias: false, powerPreference: "high-performance", stencil: false });
Kt.setPixelRatio(1);
Kt.outputColorSpace = a.SRGBColorSpace;
Kt.toneMapping = a.NoToneMapping;
Kt.shadowMap.enabled = true;
Kt.shadowMap.type = a.PCFShadowMap;
Kt.setClearColor(new a.Color(g.fog), 1);
const lt = new a.Scene();
lt.fog = new a.Fog(g.fog, 44, 205);
const dt = new a.PerspectiveCamera(46, 1, 0.25, 600);
dt.rotation.order = "YXZ";
const J = new a.DirectionalLight(g.sun, 2.25);
J.position.set(-52, 62, 56);
J.castShadow = true;
J.shadow.mapSize.set(2048, 2048);
J.shadow.camera.left = -34;
J.shadow.camera.right = 34;
J.shadow.camera.top = 34;
J.shadow.camera.bottom = -34;
J.shadow.camera.near = 1;
J.shadow.camera.far = 200;
J.shadow.bias = -4e-4;
J.shadow.normalBias = 0.035;
lt.add(J);
lt.add(J.target);
const se = new a.DirectionalLight(g.fill, 1.08);
se.position.set(48, 26, -44);
lt.add(se);
lt.add(se.target);
const Xt = new a.DirectionalLight(14207976, 0.34);
Xt.position.set(10, -18, 40);
lt.add(Xt);
lt.add(Xt.target);
const Pe = new a.HemisphereLight(g.hemiSky, g.hemiGround, 1.12);
lt.add(Pe);
const $o = qn(lt, 500), pe = Ys(lt), Y = new fa(dt, co, pe), kn = "nallakunta-forever-volume";
let lo = 0.34;
try {
  const e = localStorage.getItem(kn);
  if (e !== null) {
    const t = Number(e);
    Number.isFinite(t) && (lo = Math.max(0, Math.min(1, t)));
  }
} catch {
}
const $ = ua({ volume: lo }), yt = ha({ volume: lo, fadeIn: 3 });
$.setMuted(yt.muted);
const fo = () => {
  try {
    localStorage.setItem(kn, String(yt.volume));
  } catch {
  }
};
$.onVolumeChange = (e) => {
  $.setMuted(yt.setVolume(e)), fo();
};
const vn = window.matchMedia?.("(pointer: coarse)").matches ?? false;
$.onStart = () => {
  yt.start(), vn ? (Y.touchActive = true, $.setLocked(true)) : Y.lock();
};
Y.onLockChange = (e) => $.setLocked(e);
co.addEventListener("click", () => {
  yt.start(), !vn && !Y.locked && Y.lock();
});
window.addEventListener("nf-memory", (e) => $.showCard(e.detail));
$.bindTouch({ player: Y, onEnter: () => {
  Y.touchActive || $.onStart?.();
}, onPlanet: () => {
  ao(!jt), $.flash(jt ? "orbit view  \xB7  \u25CE to return" : "back on the ground");
}, onMusic: () => {
  const e = yt.toggle();
  $.setMuted(e), $.setVolume(yt.volume), fo(), yt.available && $.flash(e ? "\u266A  music off" : "\u266A  music on");
} });
const me = Js({ scene: lt, world: pe, player: Y, hud: $ });
Y.onInteract = (e) => {
  if (me.riding) {
    me.dismount();
    return;
  }
  e && e.action?.();
};
const Bt = new In(Kt, lt, dt);
function Sn() {
  const e = window.innerWidth, t = window.innerHeight;
  dt.aspect = e / t, dt.updateProjectionMatrix(), Bt.setSize(e, t), dn(Bt.size.x, Bt.size.y);
}
window.addEventListener("resize", Sn);
Sn();
const tr = new a.Clock(), Ge = new a.Vector3(), Yo = new a.Vector3(), er = new a.Vector3(-52, 62, 56), Xo = new a.Vector3(48, 26, -44), or = new a.Vector3(10, -18, 40);
function Ae(e, t, o, n) {
  Yo.set(0, 0, 0).addScaledVector(o.east, t.x).addScaledVector(o.up, t.y).addScaledVector(o.north, t.z), e.target.position.copy(n), e.position.copy(n).add(Yo);
}
let jt = false, Qe = 0.6;
const Qo = new a.Vector3(), nr = lt.fog, ar = dt.far;
function ao(e) {
  jt = e, lt.fog = e ? null : nr, dt.far = e ? 1600 : ar, dt.updateProjectionMatrix();
  const t = J.shadow.camera, o = e ? X * 1.15 : 34;
  t.left = -o, t.right = o, t.top = o, t.bottom = -o, t.far = e ? X * 6 : 200, t.updateProjectionMatrix(), $.setPlanetView(e);
}
window.addEventListener("keydown", (e) => {
  if (!e.repeat) {
    if (e.code === "KeyM") {
      const t = yt.toggle();
      $.setMuted(t), $.setVolume(yt.volume), fo(), yt.available && $.flash(t ? "\u266A  music off" : "\u266A  music on");
    }
    e.code === "KeyV" && (jt ? (ao(false), $.flash("back on the ground")) : me.toggle()), e.code === "KeyP" && (ao(!jt), $.flash(jt ? "orbit view  \xB7  P to return" : "back on the ground")), e.code === "KeyO" && (Bt.enabled.ink = !Bt.enabled.ink), e.code === "KeyG" && (Bt.enabled.grade = !Bt.enabled.grade);
  }
});
function Gn() {
  const e = Math.min(tr.getDelta(), 0.05);
  if (Y.update(e), me.update(e), pe.update(e), jt) Qe += e * 0.09, Qo.set(Math.sin(Qe) * 0.8, 1, Math.cos(Qe) * 0.8).normalize(), dt.position.copy(at).addScaledVector(Qo, X * 3.3), dt.up.set(0, 1, 0), dt.lookAt(at), J.target.position.copy(at), J.position.copy(at).add(new a.Vector3(-1.05, 0.95, 0.75).multiplyScalar(X * 2.2)), Pe.position.set(0, 1, 0), Ae(se, Xo, { east: new a.Vector3(1, 0, 0), up: new a.
  Vector3(0, 1, 0), north: new a.Vector3(0, 0, 1) }, at), Xt.visible = false;
  else {
    Xt.visible = true;
    const o = ae(Y.pos.x, Y.pos.z);
    Zt(Y.pos.x, 0, Y.pos.z, Ge), Ae(J, er, o, Ge), Ae(se, Xo, o, Ge), Ae(Xt, or, o, Ge), Pe.position.copy(o.up);
  }
  $o.dome.position.copy(dt.position), $o.clouds.position.copy(dt.position);
  const t = !jt && Y.locked ? Y.pick(pe.interactables) : null;
  $.setPrompt(t ? `E  \xB7  ${t.label.replace(/^.*?Â·\s*/, "")}` : ""), $.update(e, Y.locked), $.setCoords(Y.pos, Y.yaw, Y.pitch, e), Bt.render(), requestAnimationFrame(Gn);
}
Gn();
window.__scene = { scene: lt, camera: dt, renderer: Kt, pipeline: Bt, world: pe, player: Y, ebike: me, music: yt, hud: $, sun: J, fill: se, bounce: Xt, hemi: Pe, THREE: a };
window.__setOutlineRes = dn;
