import * as a from "three";
import { FullScreenQuad as yn } from "three/addons/postprocessing/Pass.js";
import { mergeGeometries as bn, mergeVertices as gn } from "three/addons/utils/BufferGeometryUtils.js";
(function() {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) n(s);
  new MutationObserver((s) => {
    for (const r of s) if (r.type === "childList") for (const c of r.addedNodes) c.tagName === "LINK" && c.rel === "modulepreload" && n(c);
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
const b = { skyTop: 9420266, skyMid: 13953274, skyHaze: 16640466, cloud: 16644856, cloudShade: 15392728, fog: 15722196, sun: 16773592, fill: 11124213, hemiSky: 14478591, hemiGround: 12558206, ink: 3748431, road: 9275520, lineYellow: 15778625, tactile: 15910205, sidewalk: 14472644, sidewalkAlt: 15064521, curb: 13222576, concrete: 14275526, concreteMid: 12893611, ballast: 8222342, wallWhite: 16447215,
wallCream: 15919059, wallGray: 14606054, roofTeal: 5204848, red: 14697791, redDeep: 11874863, yellow: 16039987, black: 3288635, teal: 3120282, blueDeep: 2772887, orange: 15698492, leaf: 5940600, leafDeep: 4161376, blossomLight: 16503526, petal: 15771852, petalDeep: 14052260, railMetal: 7038066, railHead: 12762308, sleeper: 7169398, gateYellow: 16039987, gateBlack: 3288635, signalRed: 15877436, signalOff: 6961988,
cabinet: 14210522, cabinetTop: 11973308, trainBody: 16249574, trainBodyShade: 15130576, trainStripe: 3112912, trainStripe2: 4173466, trainWindow: 3818072, trainWindowLit: 7042964, trainSkirt: 10133677, trainRoof: 12433597, trainDoor: 15394008, metal: 12106950, metalDark: 8883094, mirrorFace: 13162724, rope: 15787466, bamboo: 9744491 }, Xe = { uniforms: { tDiffuse: { value: null }, tDepth: { value: null },
uTexel: { value: new a.Vector2() }, uNear: { value: 0.25 }, uFar: { value: 600 }, uInk: { value: new a.Color(b.ink) }, uThickness: { value: 1.35 }, uSens: { value: 42e-4 }, uConcave: { value: 0.026 }, uConcaveAmount: { value: 0.42 }, uFadeStart: { value: 40 }, uFadeEnd: { value: 98 }, uStrength: { value: 1 }, uSkyDepth: { value: 420 } }, vertexShader: `
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
  ` }, Mn = { uniforms: { tDiffuse: { value: null }, uShadowTint: { value: new a.Color(11380944) }, uLightTint: { value: new a.Color(16775144) }, uSaturation: { value: 1.12 }, uLift: { value: 0.032 }, uVignette: { value: 0.15 }, uWarmth: { value: 0.05 } }, vertexShader: Xe.vertexShader, fragmentShader: `
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
  ` }, zn = { uniforms: { tDiffuse: { value: null }, uTexel: { value: new a.Vector2() } }, vertexShader: Xe.vertexShader, fragmentShader: `
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
function Pe(e) {
  const t = new a.ShaderMaterial({ uniforms: a.UniformsUtils.clone(e.uniforms), vertexShader: e.vertexShader, fragmentShader: e.fragmentShader, depthTest: false, depthWrite: false });
  return { quad: new yn(t), mat: t };
}
class vn {
  constructor(t, o, n, { pixelBudget: s = 46e5 } = {}) {
    this.renderer = t, this.scene = o, this.camera = n, this.pixelBudget = s, this.size = new a.Vector2(1, 1);
    const r = { type: a.HalfFloatType, minFilter: a.LinearFilter, magFilter: a.LinearFilter, depthBuffer: true, stencilBuffer: false, colorSpace: a.NoColorSpace };
    this.rtScene = new a.WebGLRenderTarget(2, 2, r), this.rtScene.depthTexture = new a.DepthTexture(2, 2), this.rtScene.depthTexture.format = a.DepthFormat, this.rtScene.depthTexture.type = a.UnsignedIntType, this.rtScene.depthTexture.minFilter = a.NearestFilter, this.rtScene.depthTexture.magFilter = a.NearestFilter, this.rtA = new a.WebGLRenderTarget(2, 2, { ...r, depthBuffer: false }), this.rtB =
    new a.WebGLRenderTarget(2, 2, { ...r, type: a.UnsignedByteType, depthBuffer: false });
    const c = Pe(Xe), i = Pe(Mn), l = Pe(zn);
    this.ink = c, this.grade = i, this.fxaa = l, c.mat.uniforms.tDepth.value = this.rtScene.depthTexture, this.enabled = { ink: true, grade: true, fxaa: true };
  }
  setSize(t, o) {
    const n = window.devicePixelRatio || 1;
    let s = this.forceScale || (n < 1.5 ? 1.5 : Math.min(n, 2));
    t * o * s * s > this.pixelBudget && (s = Math.max(1, Math.sqrt(this.pixelBudget / (t * o)))), this.scale = s;
    const r = Math.max(2, Math.floor(t * s)), c = Math.max(2, Math.floor(o * s));
    this.size.set(r, c), this.renderer.setPixelRatio(1), this.renderer.setSize(t, o, true), this.rtScene.setSize(r, c), this.rtA.setSize(r, c), this.rtB.setSize(r, c);
    const i = new a.Vector2(1 / r, 1 / c);
    this.ink.mat.uniforms.uTexel.value.copy(i), this.fxaa.mat.uniforms.uTexel.value.copy(i), this.ink.mat.uniforms.uNear.value = this.camera.near, this.ink.mat.uniforms.uFar.value = this.camera.far, this.ink.mat.uniforms.uThickness.value = 1.05 + 0.55 * s;
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
const eo = { 2: [96, 255], 3: [92, 178, 255], 4: [80, 142, 202, 255], 5: [74, 124, 172, 214, 255], soft: [180, 255], soft3: [172, 214, 255] }, Be = /* @__PURE__ */ new Map();
function kn(e = 3) {
  const t = e;
  if (Be.has(t)) return Be.get(t);
  const o = eo[e] || eo[3], n = new Uint8Array(o.length * 4);
  for (let r = 0; r < o.length; r++) n[r * 4 + 0] = o[r], n[r * 4 + 1] = o[r], n[r * 4 + 2] = o[r], n[r * 4 + 3] = 255;
  const s = new a.DataTexture(n, o.length, 1, a.RGBAFormat);
  return s.minFilter = a.NearestFilter, s.magFilter = a.NearestFilter, s.generateMipmaps = false, s.needsUpdate = true, Be.set(t, s), s;
}
const Ho = "lights_toon_pars_fragment", oo = "vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;", Sn = `
	vec3 celBand = getGradientIrradiance( geometryNormal, directLight.direction );
	vec3 irradiance = celBand * mix( uShadowTint, vec3( 1.0 ), celBand ) * directLight.color;`;
let Uo = false, jo = "";
{
  const e = a.ShaderChunk[Ho];
  e && e.includes(oo) && (jo = `uniform vec3 uShadowTint;
` + e.replace(oo, Sn), Uo = true);
}
function Gn(e, t) {
  if (!Uo) return e;
  const o = { value: new a.Color(t) };
  e.userData.shadowTint = o, e.onBeforeCompile = (s) => {
    s.uniforms.uShadowTint = o, s.fragmentShader = s.fragmentShader.replace(`#include <${Ho}>`, jo);
  };
  const n = new a.Color(t).getHexString();
  return e.customProgramCacheKey = () => "celTint_" + n, e;
}
const Ee = /* @__PURE__ */ new Map();
function g(e = {}) {
  const { color: t = 16777215, bands: o = 3, tint: n = 7102348, flat: s = true, map: r = null, emissive: c = null, emissiveIntensity: i = 1, transparent: l = false, opacity: f = 1, side: u = a.FrontSide, alphaTest: d = 0, depthWrite: h = null, fog: p = true, alphaMap: m = null, vertexColors: w = false, cache: M = true } = e, G = M && !r && !m ? [t, o, n, s, c, i, l, f, u, d, h, p, w].join("|") : null;
  if (G && Ee.has(G)) return Ee.get(G);
  const A = new a.MeshToonMaterial({ color: t, gradientMap: kn(o), flatShading: s, map: r, alphaMap: m, transparent: l, opacity: f, side: u, alphaTest: d, fog: p, vertexColors: w, emissive: c === null ? 0 : c, emissiveIntensity: i });
  return h !== null && (A.depthWrite = h), Gn(A, n), G && Ee.set(G, A), A;
}
const Ie = /* @__PURE__ */ new Map();
function I(e = {}) {
  const { color: t = 16777215, map: o = null, transparent: n = false, opacity: s = 1, side: r = a.FrontSide, alphaTest: c = 0, depthWrite: i = null, fog: l = true, cache: f = true, toneMapped: u = true } = e, d = f && !o ? [t, n, s, r, c, i, l, u].join("|") : null;
  if (d && Ie.has(d)) return Ie.get(d);
  const h = new a.MeshBasicMaterial({ color: t, map: o, transparent: n, opacity: s, side: r, alphaTest: c, fog: l, toneMapped: u });
  return i !== null && (h.depthWrite = i), d && Ie.set(d, h), h;
}
const Te = "'Yu Gothic', 'Yu Gothic UI', 'Meiryo', 'MS Gothic', 'Hiragino Kaku Gothic ProN', sans-serif", De = /* @__PURE__ */ new Map();
function Gt(e, t, o, { srgb: n = true, repeat: s = null, aniso: r = 4 } = {}) {
  const c = document.createElement("canvas");
  c.width = e, c.height = t;
  const i = c.getContext("2d");
  i.imageSmoothingEnabled = true, o(i, e, t);
  const l = new a.CanvasTexture(c);
  return n && (l.colorSpace = a.SRGBColorSpace), l.anisotropy = r, s && (l.wrapS = l.wrapT = a.RepeatWrapping, l.repeat.set(s[0], s[1])), l.needsUpdate = true, l;
}
function Tt(e, t) {
  return De.has(e) || De.set(e, t()), De.get(e);
}
const Vt = (e) => "#" + e.toString(16).padStart(6, "0");
function Tn(e, t, o, n, s = Te, r = "bold") {
  let c = n;
  do {
    if (e.font = `${r} ${c}px ${s}`, e.measureText(t).width <= o) break;
    c -= 2;
  } while (c > 6);
  return c;
}
function $t(e, t, o, n, s, r, c, i = "bold", l = 0) {
  const f = Tn(e, t, s, r, Te, i);
  if (e.fillStyle = c, e.textAlign = l ? "left" : "center", e.textBaseline = "middle", l) {
    const u = [...t], d = u.reduce((p, m) => p + e.measureText(m).width + l, -l);
    let h = o - d / 2;
    for (const p of u) e.fillText(p, h, n), h += e.measureText(p).width + l;
  } else e.fillText(t, o, n);
  return f;
}
function An(e, t, o, n, s, r, c) {
  e.font = `bold ${r}px ${Te}`, e.fillStyle = c, e.textAlign = "center", e.textBaseline = "middle", [...t].forEach((i, l) => e.fillText(i, o, n + l * s));
}
const Cn = () => Tt("crossingSign", () => Gt(512, 256, (e, t, o) => {
  e.fillStyle = "#fbf8f2", e.fillRect(0, 0, t, o), e.strokeStyle = Vt(b.black), e.lineWidth = 12, e.strokeRect(6, 6, t - 12, o - 12), $t(e, "LEVEL CROSSING", t / 2, o * 0.36, t - 60, 84, Vt(b.redDeep), "bold", 6), $t(e, "STOP \xB7 LOOK \xB7 LISTEN", t / 2, o * 0.74, t - 80, 42, Vt(b.black), "bold", 2);
})), Rn = () => Tt("stationSign", () => Gt(768, 192, (e, t, o) => {
  e.fillStyle = "#fbfaf6", e.fillRect(0, 0, t, o), e.fillStyle = Vt(b.teal), e.fillRect(0, o - 22, t, 22), $t(e, "\u0C35\u0C3F\u0C26\u0C4D\u0C2F\u0C3E\u0C28\u0C17\u0C30\u0C4D", t / 2, o * 0.42, t * 0.7, 92, "#2b3346", "bold", 12), e.font = `600 34px ${Te}`, e.fillStyle = "#8a8fa0", e.textAlign = "center", e.fillText("VIDYANAGAR", t / 2, o * 0.82);
})), Ko = (e = 0) => Tt("warnPlate" + e, () => Gt(256, 512, (t, o, n) => {
  const s = [{ bg: b.yellow, fg: b.black, t: "CCTV" }, { bg: b.red, fg: 16644336, t: "DANGER" }, { bg: 16644336, fg: b.blueDeep, t: "SLOW" }, { bg: 16644336, fg: b.redDeep, t: "11 KV" }], r = s[e % s.length];
  t.fillStyle = Vt(r.bg), t.fillRect(0, 0, o, n), t.fillStyle = Vt(r.fg), t.fillRect(12, 12, o - 24, 6), t.fillRect(12, n - 18, o - 24, 6), An(t, r.t, o / 2, 90, 88, 74, Vt(r.fg));
})), Pn = () => Tt("trainDest", () => Gt(512, 128, (e, t, o) => {
  e.fillStyle = "#1d2230", e.fillRect(0, 0, t, o), e.fillStyle = "#f2e6b0", e.fillRect(10, 22, 110, 84), $t(e, "MMTS", 65, 64, 96, 40, "#1d2230", "bold"), $t(e, "VIDYANAGAR", t * 0.62, o / 2, t * 0.55, 64, "#f2e6b0", "bold", 6);
})), Bn = () => Tt("trainNumber", () => Gt(256, 96, (e, t, o) => {
  e.fillStyle = "#f7f2e6", e.fillRect(0, 0, t, o), $t(e, "MMTS 2104", t / 2, o / 2, t - 20, 50, "#4a4657");
})), qo = (e = false) => Tt("tactile" + e, () => Gt(128, 128, (t, o, n) => {
  if (t.fillStyle = Vt(b.tactile), t.fillRect(0, 0, o, n), t.fillStyle = "#d9a91f", e) for (let s = 0; s < 4; s++) t.fillRect(10, 12 + s * 30, o - 20, 16);
  else for (let s = 0; s < 4; s++) for (let r = 0; r < 4; r++) t.beginPath(), t.arc(20 + r * 29, 20 + s * 29, 9, 0, Math.PI * 2), t.fill();
}, { repeat: [1, 1] })), En = () => Tt("platePlate", () => Gt(256, 128, (e, t, o) => {
  e.fillStyle = "#f6f4f0", e.fillRect(0, 0, t, o), e.strokeStyle = "#4f5a72", e.lineWidth = 8, e.strokeRect(8, 8, t - 16, o - 16), $t(e, "\u3055 21-08", t / 2, o / 2, t - 40, 56, "#2f3646");
})), In = () => Tt("petalTex", () => Gt(128, 128, (e, t, o) => {
  e.clearRect(0, 0, t, o), e.translate(t / 2, o / 2), e.fillStyle = "#ffffff", e.beginPath(), e.moveTo(0, 52), e.bezierCurveTo(38, 34, 46, -14, 14, -48), e.bezierCurveTo(6, -38, 2, -34, 0, -30), e.bezierCurveTo(-2, -34, -6, -38, -14, -48), e.bezierCurveTo(-46, -14, -38, 34, 0, 52), e.closePath(), e.fill();
}, { srgb: false })), Dn = () => Tt("cloudTex", () => Gt(512, 256, (e, t, o) => {
  e.clearRect(0, 0, t, o);
  const n = [[0.22, 0.62, 0.15], [0.36, 0.46, 0.2], [0.52, 0.4, 0.24], [0.68, 0.5, 0.19], [0.82, 0.63, 0.14], [0.45, 0.66, 0.2], [0.6, 0.68, 0.17]];
  e.fillStyle = "#ffffff";
  for (const [s, r, c] of n) e.beginPath(), e.ellipse(s * t, r * o, c * t * 0.55, c * o * 1.1, 0, 0, Math.PI * 2), e.fill();
  e.globalCompositeOperation = "destination-out", e.fillRect(0, o * 0.78, t, o * 0.22), e.globalCompositeOperation = "source-over";
}, { srgb: false })), Dt = (e, t, o) => e < t ? t : e > o ? o : e;
function yt(e, t, o) {
  const n = Dt((o - e) / (t - e || 1e-6), 0, 1);
  return n * n * (3 - 2 * n);
}
function $o(e) {
  let t = e >>> 0;
  return function() {
    t = t + 1831565813 >>> 0;
    let o = t;
    return o = Math.imul(o ^ o >>> 15, o | 1), o ^= o + Math.imul(o ^ o >>> 7, o | 61), ((o ^ o >>> 14) >>> 0) / 4294967296;
  };
}
function nt(e) {
  const t = $o(e);
  return { next: t, range: (o, n) => o + (n - o) * t(), int: (o, n) => Math.floor(o + (n - o + 1) * t()), pick: (o) => o[Math.floor(t() * o.length) % o.length], chance: (o) => t() < o, sign: () => t() < 0.5 ? -1 : 1 };
}
function pt(e) {
  let t = e.map(({ geometry: r, matrix: c }) => {
    const i = r.clone();
    return c && i.applyMatrix4(c), i;
  });
  const o = t.filter((r) => r.index).length;
  o > 0 && o < t.length && (t = t.map((r) => {
    if (!r.index) return r;
    const c = r.toNonIndexed();
    return r.dispose(), c;
  }));
  const n = t.reduce((r, c) => r.filter((i) => c.attributes[i] !== void 0), Object.keys(t[0].attributes));
  for (const r of t) for (const c of Object.keys(r.attributes)) n.includes(c) || r.deleteAttribute(c);
  const s = bn(t, false);
  return t.forEach((r) => r.dispose()), s;
}
const Ln = new a.Matrix4(), no = new a.Quaternion(), ao = new a.Euler(), so = new a.Vector3(), ro = new a.Vector3();
function T(e = 0, t = 0, o = 0, n = 0, s = 0, r = 0, c = 1, i = 1, l = 1) {
  return so.set(e, t, o), ao.set(n, s, r), no.setFromEuler(ao), ro.set(c, i, l), Ln.clone().compose(so, no, ro);
}
function D(e, t, o, n, s = 0, r = 0, c = 0) {
  const i = new a.Mesh(new a.BoxGeometry(e, t, o), n);
  return i.position.set(s, r, c), i;
}
function Jt(e, t, o, n, s, r = 0, c = 0, i = 0) {
  const l = new a.Mesh(new a.CylinderGeometry(e, t, o, n), s);
  return l.position.set(r, c, i), l;
}
function At(e, t = true, o = true) {
  return e.traverse((n) => {
    if (!n.isMesh) return;
    const s = n.userData.noShadow || n.material && !Array.isArray(n.material) && n.material.transparent;
    n.castShadow = t && !s, n.receiveShadow = o;
  }), e;
}
function _n(e, t, o, n = 14) {
  const s = [];
  for (let r = 0; r <= n; r++) {
    const c = r / n, i = new a.Vector3().lerpVectors(e, t, c);
    i.y -= Math.sin(Math.PI * c) * o, s.push(i);
  }
  return new a.CatmullRomCurve3(s);
}
function Nn(e, t = 500) {
  const o = new a.SphereGeometry(t, 32, 20), n = new a.ShaderMaterial({ side: a.BackSide, depthWrite: true, fog: false, uniforms: { uTop: { value: new a.Color(b.skyTop) }, uMid: { value: new a.Color(b.skyMid) }, uHaze: { value: new a.Color(b.skyHaze) }, uBands: { value: 26 } }, vertexShader: `
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
  const r = Dn(), c = nt(7781), i = new a.Group(), l = I({ color: b.cloud, map: r, transparent: true, opacity: 0.62, depthWrite: false, fog: false, cache: false }), f = I({ color: b.cloudShade, map: r, transparent: true, opacity: 0.34, depthWrite: false, fog: false, cache: false });
  l.map.wrapS = l.map.wrapT = a.ClampToEdgeWrapping;
  for (let u = 0; u < 22; u++) {
    const d = c.range(220, 350), h = c.range(0, Math.PI * 2), p = c.range(90, 210), m = p * c.range(0.24, 0.34), w = c.range(46, 140), M = new a.Group(), G = new a.Mesh(new a.PlaneGeometry(p, m), f);
    G.position.set(2, -m * 0.1, -1.5);
    const A = new a.Mesh(new a.PlaneGeometry(p, m), l);
    M.add(G, A), M.position.set(Math.cos(h) * d, w, Math.sin(h) * d), M.lookAt(0, w * 0.55, 0), M.renderOrder = -9, i.add(M);
  }
  return i.frustumCulled = false, e.add(i), { dome: s, clouds: i };
}
const V = 3.15, K = 1.55, Lt = 0.135, On = 0.015, _t = -80, Nt = 80, bt = 2.2, ke = 2.95, It = 3.35;
function U(e) {
  let t = 0;
  return t += 2 * yt(-20, -50, e), t -= 2.4 * yt(20, 52, e), t;
}
function et(e) {
  return 0;
}
function Fn(e, t) {
  return e - U(t);
}
function Vn(e, t) {
  if (t < _t || t > Nt) return false;
  const o = Math.abs(Fn(e, t));
  return Math.abs(t) < It ? false : o > V - 0.02 && o < V + K;
}
function io(e, t) {
  return et() + (Vn(e, t) ? Lt : 0);
}
function Xt({ z0: e, z1: t, step: o = 1.2, a: n, b: s, uv: r = [1, 1], flip: c = false }) {
  const i = Math.max(2, Math.round(Math.abs(t - e) / o) + 1), l = [], f = [], u = [];
  for (let h = 0; h < i; h++) {
    const p = h / (i - 1), m = e + (t - e) * p, w = n(m), M = s(m);
    l.push(w.x, w.y, m, M.x, M.y, m), f.push(0, p * r[1], r[0], p * r[1]);
  }
  for (let h = 0; h < i - 1; h++) {
    const p = h * 2;
    c ? u.push(p, p + 1, p + 2, p + 1, p + 3, p + 2) : u.push(p, p + 2, p + 1, p + 1, p + 2, p + 3);
  }
  const d = new a.BufferGeometry();
  return d.setAttribute("position", new a.Float32BufferAttribute(l, 3)), d.setAttribute("uv", new a.Float32BufferAttribute(f, 2)), d.setIndex(u), d.computeVertexNormals(), d;
}
const Yo = { z: -24 }, We = -98, He = 106;
function Wn(e, t) {
  return false;
}
const Y = 160, ht = 2 * Math.PI * Y, ot = new a.Vector3(0, -Y, 0), Q = new a.Vector3(), he = new a.Quaternion(), pe = new a.Vector3(), me = new a.Matrix4();
function Hn(e, t, o = new a.Vector3()) {
  const n = e / Y, s = t / Y, r = Math.cos(s);
  return o.set(Math.sin(n) * r, Math.cos(n) * r, Math.sin(s));
}
function Yt(e, t, o, n = new a.Vector3()) {
  return Hn(e, o, n).multiplyScalar(Y + t).add(ot), n;
}
function te(e, t, o = new a.Vector3(), n = new a.Vector3(), s = new a.Vector3()) {
  const r = e / Y, c = t / Y, i = Math.sin(r), l = Math.cos(r), f = Math.sin(c), u = Math.cos(c);
  return o.set(i * u, l * u, f), n.set(l, -i, 0), s.set(-i * f, -l * f, u), { up: o, east: n, north: s };
}
function Xo(e, t = { x: 0, z: 0, y: 0 }) {
  Q.copy(e).sub(ot);
  const o = Q.length() || 1;
  return Q.multiplyScalar(1 / o), t.z = Y * Math.asin(a.MathUtils.clamp(Q.z, -1, 1)), t.x = Y * Math.atan2(Q.x, Q.y), t.y = o - Y, t;
}
function Qo(e, t) {
  let o = e - t;
  for (; o > ht / 2; ) o -= ht;
  for (; o < -ht / 2; ) o += ht;
  return o;
}
function gt(e) {
  const t = ht;
  return ((e + t / 2) % t + t) % t - t / 2;
}
function Un(e, t) {
  let o = e.index ? e.toNonIndexed() : e;
  const n = t * t;
  let r = Object.keys(o.attributes).map((u) => ({ name: u, size: o.attributes[u].itemSize, src: o.attributes[u].array })), c = o.attributes.position.count;
  const i = e.groups && e.groups.length ? e.groups : null;
  let l = new Int32Array(c / 3);
  if (i) for (const u of i) {
    const d = Math.floor(u.start / 3), h = Math.min(l.length, d + Math.floor(u.count / 3));
    for (let p = d; p < h; p++) l[p] = u.materialIndex ?? 0;
  }
  for (let u = 0; u < 12; u++) {
    const d = r.find((w) => w.name === "position").src;
    let h = 0;
    const p = r.map((w) => ({ name: w.name, size: w.size, dst: [] })), m = [];
    for (let w = 0; w < c; w += 3) {
      let M = -1, G = 0;
      for (let y = 0; y < 3; y++) {
        const k = w + y, P = w + (y + 1) % 3, v = d[k * 3] - d[P * 3], z = d[k * 3 + 1] - d[P * 3 + 1], R = d[k * 3 + 2] - d[P * 3 + 2], O = v * v + z * z + R * R;
        O > M && (M = O, G = y);
      }
      if (M <= n) {
        for (const y of p) {
          const k = r.find((P) => P.name === y.name).src;
          for (let P = 0; P < 3; P++) for (let v = 0; v < y.size; v++) y.dst.push(k[(w + P) * y.size + v]);
        }
        m.push(l[w / 3]);
        continue;
      }
      h++, m.push(l[w / 3], l[w / 3]);
      const A = w + G, x = w + (G + 1) % 3, S = w + (G + 2) % 3;
      for (const y of p) {
        const k = r.find((z) => z.name === y.name).src, P = [];
        for (let z = 0; z < y.size; z++) P.push((k[A * y.size + z] + k[x * y.size + z]) * 0.5);
        const v = (z) => {
          for (let R = 0; R < y.size; R++) y.dst.push(k[z * y.size + R]);
        };
        v(A), y.dst.push(...P), v(S), y.dst.push(...P), v(x), v(S);
      }
    }
    if (r = p.map((w) => ({ name: w.name, size: w.size, src: Float32Array.from(w.dst) })), l = Int32Array.from(m), c = r.find((w) => w.name === "position").src.length / 3, !h) break;
  }
  const f = new a.BufferGeometry();
  for (const u of r) f.setAttribute(u.name, new a.BufferAttribute(u.src, u.size));
  if (i) {
    let u = 0;
    for (let d = 1; d <= l.length; d++) (d === l.length || l[d] !== l[u]) && (f.addGroup(u * 3, (d - u) * 3, l[u]), u = d);
  }
  return o !== e && o.dispose(), f;
}
function jn(e, t = 3) {
  const o = Un(e, t), n = o.attributes.position, s = new a.Vector3();
  for (let r = 0; r < n.count; r++) Yt(n.getX(r), n.getY(r), n.getZ(r), s), n.setXYZ(r, s.x, s.y, s.z);
  return n.needsUpdate = true, o.deleteAttribute("normal"), o.computeVertexNormals(), o.computeBoundingSphere(), o;
}
function Kn(e, { maxEdge: t = 3 } = {}) {
  e.updateMatrixWorld(true);
  const o = (i) => {
    for (let l = i.parent; l && l !== e.parent; l = l.parent) if (l.userData.planetRigid) return true;
    return false;
  }, n = [];
  e.traverse((i) => {
    i.userData.planetRigid && !o(i) && n.push({ obj: i, world: i.matrixWorld.clone() });
  });
  const s = [];
  e.traverse((i) => {
    !i.isMesh && !i.isLine || i.userData.planetRigid || o(i) || s.push({ obj: i, world: i.matrixWorld.clone() });
  });
  const r = { wrapped: 0, instanced: 0, rigid: n.length, tris: 0 };
  for (const { obj: i, world: l } of s) {
    if (i.isInstancedMesh) {
      const f = i.count, u = i.instanceMatrix;
      for (let d = 0; d < f; d++) {
        me.fromArray(u.array, d * 16).premultiply(l), me.decompose(Q, he, pe);
        const h = te(Q.x, Q.z), p = new a.Quaternion().setFromRotationMatrix(new a.Matrix4().makeBasis(h.east, h.up, h.north)), m = Yt(Q.x, Q.y, Q.z, new a.Vector3());
        me.compose(m, p.multiply(he), pe), me.toArray(u.array, d * 16);
      }
      u.needsUpdate = true, i.frustumCulled = false, r.instanced += f;
    } else {
      const f = i.geometry.clone().applyMatrix4(l), u = jn(f, t);
      f.dispose(), i.geometry = u, i.frustumCulled = true, r.wrapped++, r.tris += u.attributes.position.count / 3;
    }
    i.position.set(0, 0, 0), i.quaternion.identity(), i.scale.set(1, 1, 1), i.matrixAutoUpdate = true;
  }
  e.traverse((i) => {
    i === e || i.isMesh || i.isLine || i.userData.planetRigid || o(i) || (i.position.set(0, 0, 0), i.quaternion.identity(), i.scale.set(1, 1, 1));
  });
  const c = new a.Matrix4();
  for (const { obj: i, world: l } of n) {
    l.decompose(Q, he, pe);
    const f = te(Q.x, Q.z);
    c.makeBasis(f.east, f.up, f.north), i.position.copy(Yt(Q.x, Q.y, Q.z, new a.Vector3())), i.quaternion.setFromRotationMatrix(c).multiply(he), i.scale.copy(pe);
  }
  return r;
}
function qn(e, t) {
  return 0;
}
function $n(e) {
  const t = e.attributes.position, o = { x: 0, z: 0, y: 0 }, n = new a.Vector3(), s = (c) => (n.set(t.getX(c), t.getY(c), t.getZ(c)), Xo(n, o), Wn()), r = [];
  for (let c = 0; c < t.count; c += 3) if (!(s(c) || s(c + 1) || s(c + 2))) for (let i = 0; i < 3; i++) r.push(t.getX(c + i), t.getY(c + i), t.getZ(c + i));
  e.setAttribute("position", new a.Float32BufferAttribute(r, 3));
}
function Yn(e) {
  const t = new a.Group();
  t.name = "planet";
  const o = new a.IcosahedronGeometry(Y, 30), n = o.attributes.position, s = new a.Vector3(), r = { x: 0, z: 0, y: 0 }, c = new a.Vector3();
  for (let l = 0; l < n.count; l++) {
    s.set(n.getX(l), n.getY(l), n.getZ(l)).normalize(), c.copy(s).multiplyScalar(Y).add(ot), Xo(c, r);
    const f = qn() + et() * 0.999 - On - 0.065;
    c.copy(s).multiplyScalar(Y + f).add(ot), n.setXYZ(l, c.x, c.y, c.z);
  }
  n.needsUpdate = true, o.deleteAttribute("normal"), $n(o);
  {
    const l = o.attributes.position, f = new Float32Array(l.count * 3), u = new a.Vector3();
    for (let d = 0; d < l.count; d++) u.set(l.getX(d), l.getY(d), l.getZ(d)).sub(ot).normalize(), f[d * 3] = u.x, f[d * 3 + 1] = u.y, f[d * 3 + 2] = u.z;
    o.setAttribute("normal", new a.BufferAttribute(f, 3));
  }
  const i = new a.Mesh(o, g({ color: 12563607, bands: 4, tint: 8024982, flat: false }));
  return i.receiveShadow = true, i.castShadow = false, i.frustumCulled = false, i.name = "planetLand", t.add(i), e.add(t), { group: t, land: i };
}
const Xn = `
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
`, Qn = `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() { gl_FragColor = vec4( uColor, uOpacity ); }
`, Zo = new a.Vector2(1920, 1080), Jo = /* @__PURE__ */ new Set();
function tn(e, t) {
  Zo.set(e, t), Jo.forEach((o) => o.uniforms.uResolution.value.set(e, t));
}
const Le = /* @__PURE__ */ new WeakMap();
function Zn(e) {
  if (Le.has(e)) return Le.get(e);
  let t;
  try {
    t = gn(e.clone(), 1e-4), t.computeVertexNormals();
  } catch {
    t = e.clone();
  }
  for (const o of Object.keys(t.attributes)) o !== "position" && o !== "normal" && t.deleteAttribute(o);
  return Le.set(e, t), t;
}
function wt(e, { thickness: t = 38e-4, color: o = b.ink, opacity: n = 1 } = {}) {
  if (!e || !e.geometry) return null;
  const s = new a.ShaderMaterial({ uniforms: { uThickness: { value: t }, uColor: { value: new a.Color(o) }, uOpacity: { value: n }, uResolution: { value: Zo.clone() } }, vertexShader: Xn, fragmentShader: Qn, side: a.BackSide, transparent: n < 1, depthWrite: true, fog: false });
  Jo.add(s);
  const r = Zn(e.geometry);
  let c;
  return e.isInstancedMesh ? (c = new a.InstancedMesh(r, s, e.count), c.instanceMatrix = e.instanceMatrix, c.count = e.count) : c = new a.Mesh(r, s), c.castShadow = false, c.receiveShadow = false, c.renderOrder = (e.renderOrder || 0) - 1, c.frustumCulled = e.frustumCulled, e.add(c), c;
}
const Jn = 1.62, ta = 0.34, ea = 0.38, Ot = { eye: 1.4, seatFwd: 0.46, nose: 0.92, noseR: 0.3, steer: 1.75 };
class oa {
  constructor(t, o, n, s = {}) {
    this.camera = t, this.dom = o, this.world = n, this.spawn = { pos: new a.Vector3(2.2, 0, -6.5), yaw: s.yaw ?? Math.PI + 0.14, pitch: s.pitch ?? -0.01 }, s.pos && this.spawn.pos.copy(s.pos), this.pos = this.spawn.pos.clone(), this.yaw = this.spawn.yaw, this.pitch = this.spawn.pitch, this.vel = new a.Vector3(), this.bob = 0, this.locked = false, this.keys = /* @__PURE__ */ new Set(), this.walkSpeed =
    2.55, this.runSpeed = 5.1, this.rideSpeed = this.runSpeed * 1.5, this.sensitivity = 22e-4, this.ride = null, this.roll = 0, this.yawRate = 0, this._prevYaw = this.yaw, this._forward = new a.Vector3(), this._right = new a.Vector3(), this._wish = new a.Vector3(), this._probe = new a.Vector3(), this._up = new a.Vector3(), this._east = new a.Vector3(), this._north = new a.Vector3(), this._basis = new a.
    Matrix4(), this._surfaceQ = new a.Quaternion(), this._localQ = new a.Quaternion(), this._localE = new a.Euler(), this.raycaster = new a.Raycaster(), this.raycaster.far = 3, this.hovered = null, this.onInteract = null, this.onLockChange = null, this._bind(), this.applyCamera(0);
  }
  _bind() {
    const t = (o) => {
      this.locked && (this.yaw -= o.movementX * this.sensitivity, this.pitch -= o.movementY * this.sensitivity, this.pitch = Dt(this.pitch, -1.15, 1.05));
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
    this.touchActive && (this.yaw -= t * this.sensitivity * 2.4, this.pitch = Dt(this.pitch - o * this.sensitivity * 2.4, -1.15, 1.05));
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
    this._resolveAt(this.pos, t, o, ta);
  }
  _resolveAt(t, o, n, s) {
    for (const r of o) {
      if (r.top !== void 0 && r.top <= n + ea || r.bottom !== void 0 && r.bottom > n + 1.9) continue;
      const c = r.x0 - s, i = r.x1 + s, l = r.z0 - s, f = r.z1 + s;
      if (t.x <= c || t.x >= i || t.z <= l || t.z >= f) continue;
      const u = t.x - c, d = i - t.x, h = t.z - l, p = f - t.z, m = Math.min(u, d, h, p);
      m === u ? t.x = c : m === d ? t.x = i : m === h ? t.z = l : t.z = f;
    }
  }
  update(t) {
    const o = this.keys, n = this.ride !== null, s = o.has("ShiftLeft") || o.has("ShiftRight"), r = n ? this.rideSpeed : s ? this.runSpeed : this.walkSpeed;
    let c = 0, i = 0;
    (this.locked || this.touchActive) && ((o.has("KeyW") || o.has("ArrowUp")) && (c += 1), (o.has("KeyS") || o.has("ArrowDown")) && (c -= 1), (o.has("KeyD") || o.has("ArrowRight")) && (i += 1), (o.has("KeyA") || o.has("ArrowLeft")) && (i -= 1)), n && i && (this.yaw -= i * Ot.steer * t), this._forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)), this._right.set(Math.cos(this.yaw), 0, -Math.sin(
    this.yaw)), n ? this._wish.copy(this._forward).multiplyScalar(c > 0 ? r : c < 0 ? -1.7 : 0) : (this._wish.copy(this._forward).multiplyScalar(c).addScaledVector(this._right, i), this._wish.lengthSq() > 1e-6 && this._wish.normalize().multiplyScalar(r));
    const l = n ? c > 0 ? 5 : c < 0 ? 9 : 3.6 : this._wish.lengthSq() > 1e-6 ? 13 : 16, f = 1 - Math.exp(-l * t);
    this.vel.x += (this._wish.x - this.vel.x) * f, this.vel.z += (this._wish.z - this.vel.z) * f;
    const u = this.world.heightAt(this.pos.x, this.pos.z), d = this.world.colliders, h = 1 / Math.max(0.25, Math.cos(this.pos.z / Y)), p = this.vel.x * t * h, m = this.vel.z * t, w = Math.max(1, Math.ceil(Math.max(Math.abs(p), Math.abs(m)) / 0.18));
    for (let y = 0; y < w; y++) this.pos.x += p / w, this._resolve(d, u), this.pos.z += m / w, this._resolve(d, u);
    if (n) {
      const y = this._probe.copy(this.pos).addScaledVector(this._forward, Ot.nose), k = y.x, P = y.z;
      this._resolveAt(y, d, u, Ot.noseR), this.pos.x += y.x - k, this.pos.z += y.z - P, this._resolve(d, u);
    }
    this.pos.x = gt(this.pos.x);
    const M = this.world.bounds;
    this.pos.z = Dt(this.pos.z, M.z0, M.z1);
    const G = this.world.heightAt(this.pos.x, this.pos.z, this.pos.y);
    this.pos.y += (G - this.pos.y) * (1 - Math.exp(-18 * t));
    const A = Math.hypot(this.vel.x, this.vel.z), x = (this.yaw - this._prevYaw) / Math.max(t, 1e-4);
    this._prevYaw = this.yaw, this.yawRate += (x - this.yawRate) * (1 - Math.exp(-9 * t));
    const S = n ? Dt(this.yawRate, -2.6, 2.6) * 0.05 * Math.min(A / this.rideSpeed, 1) : 0;
    this.roll += (S - this.roll) * (1 - Math.exp(-7 * t)), this.bob += t * A * (s ? 8.2 : 6.4), this.applyCamera(A);
  }
  applyCamera(t) {
    const o = this.ride !== null, n = o ? 0 : Math.min(t / this.walkSpeed, 1) * 0.014, s = this.pos.y + (o ? Ot.eye : Jn) + Math.sin(this.bob) * n, r = te(this.pos.x, this.pos.z, this._up, this._east, this._north);
    this._basis.makeBasis(this._east, this._up, this._north), this._surfaceQ.setFromRotationMatrix(this._basis), this._localE.set(this.pitch, this.yaw, this.roll + Math.sin(this.bob * 0.5) * n * 0.35, "YXZ"), this._localQ.setFromEuler(this._localE), Yt(this.pos.x, s, this.pos.z, this.camera.position), this.camera.quaternion.copy(this._surfaceQ).multiply(this._localQ), this.camera.up.copy(r.up);
  }
  pick(t) {
    if (!t.length) return this.hovered = null, null;
    this.raycaster.set(this.camera.position, this._forward.set(0, 0, -1).applyQuaternion(this.camera.quaternion));
    const o = t.map((s) => s.hitbox), n = this.raycaster.intersectObjects(o, false);
    return this.hovered = n.length ? t[o.indexOf(n[0].object)] : null, this.hovered;
  }
}
function na({ volume: e = 0.34 } = {}) {
  const t = (z, R, O, H) => {
    const C = document.createElement(z);
    return R && (C.className = R), H !== void 0 && (C.innerHTML = H), (O || document.body).appendChild(C), C;
  }, o = t("div", "hud"), n = t("div", "crosshair", o), s = t("div", "prompt", o, ""), r = t("div", "toast", o, ""), c = t("div", "memory-card", o, "");
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
  const p = h.querySelector(".menu-action"), m = h.querySelector(".audio-control"), w = h.querySelector(".volume-slider"), M = h.querySelector(".audio-head output"), G = (z) => {
    const R = Math.round(Math.max(0, Math.min(1, z)) * 100);
    w.value = String(R), w.style.setProperty("--volume", `${R}%`), M.value = `${R}%`, M.textContent = `${R}%`, w.setAttribute("aria-valuetext", `${R}%`);
  };
  G(e);
  let A = 0, x = true, S = null, y = false, k = 0, P = false;
  const v = { root: o, overlay: h, onStart: null, onVolumeChange: null, flash(z, R = 1400) {
    r.textContent = z, r.classList.add("on"), clearTimeout(S), S = setTimeout(() => r.classList.remove("on"), R);
  }, setPrompt(z) {
    z ? (s.textContent = z, s.classList.add("on")) : s.classList.remove("on");
  }, setPlanetView(z) {
    n.classList.toggle("hidden", z);
  }, setLocked(z) {
    z && (P = true), h.dataset.mode = P ? "paused" : "start", h.classList.toggle("hidden", z), h.setAttribute("aria-hidden", z ? "true" : "false"), n.classList.toggle("on", z), z ? (A = 0, x = true, f.classList.remove("faded")) : requestAnimationFrame(() => p.focus({ preventScroll: true }));
  }, setVolume(z) {
    G(z);
  }, setMuted(z) {
    m.classList.toggle("muted", z);
  }, toggleHint() {
    x = !x, f.classList.toggle("faded", !x), A = x ? 0 : 1e9;
  }, toggleCoords() {
    return y = !y, u.classList.toggle("on", y), k = 1e9, y;
  }, get coordsVisible() {
    return y;
  }, setCoords(z, R, O, H = 0) {
    if (!y || (k += H, k < 0.1)) return;
    k = 0;
    const C = (E, j = 2) => E.toFixed(j);
    let L = R % (Math.PI * 2);
    L > Math.PI && (L -= Math.PI * 2), L <= -Math.PI && (L += Math.PI * 2);
    const B = ["north +z", "north-west", "west -x", "south-west", "south -z", "south-east", "east +x", "north-east"][((4 - Math.round(L / (Math.PI * 2) * 8)) % 8 + 8) % 8];
    d = `{ pos: [${C(z.x, 1)}, 0, ${C(z.z, 1)}], yaw: ${C(L)}, pitch: ${C(O)} }`, u.innerHTML = `<span class="k">x</span>${C(z.x)} <span class="k">z</span>${C(z.z)} <span class="k">y</span>${C(z.y)}<br><span class="k">yaw</span>${C(L)} <span class="k">pitch</span>${C(O)} <span class="d">${B}</span><br><span class="s">${d}</span><br><span class="d">click or Shift+C to copy</span>`;
  }, copyCoords() {
    if (!d) return false;
    const z = () => (v.flash("copied  \xB7  " + d, 2200), true);
    try {
      if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(d).then(z, () => v.copyFallback(d)), true;
    } catch {
    }
    return v.copyFallback(d) ? z() : false;
  }, copyFallback(z) {
    const R = document.createElement("textarea");
    R.value = z, R.setAttribute("readonly", ""), R.style.cssText = "position:fixed;top:-1000px;opacity:0", document.body.appendChild(R), R.select();
    let O = false;
    try {
      O = document.execCommand("copy");
    } catch {
      O = false;
    }
    return R.remove(), O;
  }, update(z, R) {
    !R || !x || (A += z, A > 11 && (f.classList.add("faded"), x = false));
  } };
  p.addEventListener("click", (z) => {
    z.stopPropagation(), v.onStart?.();
  }), h.addEventListener("click", (z) => {
    z.target.closest(".audio-control") || v.onStart?.();
  });
  for (const z of ["click", "pointerdown", "pointerup"]) m.addEventListener(z, (R) => R.stopPropagation());
  return w.addEventListener("input", () => {
    const z = Number(w.value) / 100;
    G(z), v.onVolumeChange?.(z);
  }), window.addEventListener("keydown", (z) => {
    z.code === "KeyH" && v.toggleHint(), z.code === "KeyC" && (z.shiftKey ? y && v.copyCoords() : v.flash(v.toggleCoords() ? "coordinates on" : "coordinates off", 900));
  }), u.style.pointerEvents = "auto", u.style.cursor = "copy", u.addEventListener("click", (z) => {
    z.stopPropagation(), v.copyCoords();
  }), v.showCard = ({ title: z, body: R }) => {
    c.innerHTML = `<button class="card-close" aria-label="close">\u2715</button>
      <h3></h3><p></p>`, c.querySelector("h3").textContent = z, c.querySelector("p").textContent = R, c.classList.add("on"), i = true, c.querySelector(".card-close").addEventListener("click", (O) => {
      O.stopPropagation(), v.hideCard();
    });
  }, v.hideCard = () => {
    c.classList.remove("on"), i = false;
  }, v.cardIsOpen = () => i, window.addEventListener("keydown", (z) => {
    z.code === "Escape" && i && v.hideCard();
  }), v.bindTouch = ({ player: z, onPlanet: R, onMusic: O, onEnter: H }) => {
    const C = (B, E) => {
      const j = B.dataset.key, lt = B.dataset.act;
      j && (E ? z.touchPress(j) : z.touchRelease(j)), E && (lt === "interact" && z.touchInteract(), lt === "planet" && R?.(), lt === "music" && O?.());
    };
    l.querySelectorAll(".tbtn").forEach((B) => {
      B.addEventListener("pointerdown", (E) => {
        E.preventDefault(), C(B, true);
      }), B.addEventListener("pointerup", () => C(B, false)), B.addEventListener("pointercancel", () => C(B, false)), B.addEventListener("pointerleave", () => C(B, false));
    });
    const L = document.getElementById("view");
    let F = null;
    L.addEventListener("touchstart", (B) => {
      B.touches.length === 1 && (F = { x: B.touches[0].clientX, y: B.touches[0].clientY }, H?.());
    }, { passive: true }), L.addEventListener("touchmove", (B) => {
      if (!F || B.touches.length !== 1) return;
      const E = B.touches[0];
      z.touchLook(E.clientX - F.x, E.clientY - F.y), F = { x: E.clientX, y: E.clientY }, B.preventDefault();
    }, { passive: false }), L.addEventListener("touchend", () => {
      F = null;
    });
  }, v;
}
const ne = ["bfcmusic-divine-sakura-garden-fairytale-music-283353.mp3"].map((e) => `./audio/${e}`);
function aa({ volume: e = 0.34, fadeIn: t = 2.6 } = {}) {
  let o = [], n = -1;
  function s() {
    o = ne.map((x, S) => S);
    for (let x = o.length - 1; x > 0; x--) {
      const S = Math.floor(Math.random() * (x + 1));
      [o[x], o[S]] = [o[S], o[x]];
    }
    if (o.length > 1 && o[0] === n) {
      const x = 1 + Math.floor(Math.random() * (o.length - 1));
      [o[0], o[x]] = [o[x], o[0]];
    }
  }
  function r() {
    return o.length === 0 && s(), n = o.shift(), n;
  }
  let c = r();
  const i = new Audio(ne[c]);
  i.loop = false, i.preload = "auto", i.volume = 0;
  let l = e, f = e > 1e-3 ? e : 0.34, u = e <= 1e-3, d = false, h = ne.length === 0, p = null, m = null;
  const w = (x) => Math.max(0, Math.min(1, x));
  function M() {
    ne.length && (c = r(), i.src = ne[c], i.load());
  }
  function G(x, S) {
    l = w(x), clearInterval(p), clearTimeout(m);
    const y = () => {
      clearInterval(p), clearTimeout(m), p = m = null, i.volume = l, l === 0 && u && i.pause();
    }, k = Math.abs(l - i.volume);
    if (!(S > 0) || k < 4e-3) return y();
    const P = 33, v = P / 1e3 * (k / S);
    p = setInterval(() => {
      const z = l - i.volume;
      i.volume = w(i.volume + Math.sign(z) * Math.min(Math.abs(z), v)), Math.abs(l - i.volume) < 4e-3 && y();
    }, P), m = setTimeout(y, S * 1e3 + 600);
  }
  const A = { el: i, get muted() {
    return u;
  }, get volume() {
    return e;
  }, get available() {
    return !h;
  }, start() {
    d || h || (d = true, i.volume = 0, !u && i.play().then(() => G(e, t), () => {
      h = true, d = false;
    }));
  }, toggle() {
    return h || (u = !u, u ? G(0, 0.35) : (e <= 1e-3 && (e = f), i.paused && i.play().catch(() => {
      h = true;
    }), G(e, 0.5))), u;
  }, setVolume(x) {
    return e = w(x), e > 1e-3 ? (f = e, u = false, d && (i.paused && i.play().catch(() => {
      h = true;
    }), G(e, 0.3))) : (u = true, d && G(0, 0.25)), u;
  } };
  return i.addEventListener("ended", () => {
    M(), !(!d || h || u || document.hidden) && i.play().catch(() => {
      h = true, d = false;
    });
  }), document.addEventListener("visibilitychange", () => {
    !d || h || u || (document.hidden ? i.pause() : i.play().catch(() => {
    }));
  }), A;
}
const rt = 3.4, sa = 7, ra = 17, co = sa, lo = ra, ia = 5.5, ze = [{ x: 161, z: -45.2, bank: 0.5, dr: 14, dm: 2.5, cr: 2.2, fa: 0.48 }, { x: 154, z: -48.8, bank: 0.5, dr: 15, dm: 2.6, cr: 2.2, fa: 0.48 }, { x: 147.2, z: -52.2, bank: 0.46, dr: 14, dm: 2.5, cr: 4.2, fa: 0.46, hi: 10 }, { x: 143.6, z: -60, bank: 0.26, dr: 16, dm: 2.6, cr: 5.6, fa: 0.46, hi: 12, ho: 24 }, { x: 142.4, z: -70, bank: 0.21,
dr: 17, dm: 2.6, cr: 6.4, fa: 0.44, hi: 14, ho: 28 }, { x: 142.2, z: -80, bank: 0.2, dr: 18, dm: 2.6, cr: 6.8, fa: 0.44, hi: 15, ho: 30 }, { x: 145, z: -90, bank: 0.24, dr: 17, dm: 2.6, cr: 7, fa: 0.44, hi: 14, ho: 28 }, { x: 147.6, z: -100, bank: 0.38, dr: 14, dm: 2.5, cr: 7.2, fa: 0.44, hi: 11, ho: 24 }, { x: 148.6, z: -110, bank: 0.26, dr: 16, dm: 2.3, cr: 6.8, fa: 0.42, hi: 9 }, { x: 151.6, z: -118,
bank: 0.22, dr: 18, dm: 2.1, cr: 6.2, fa: 0.42 }, { x: 159.4, z: -125.6, bank: 0.18, dr: 20, dm: 1.9, cr: 5.6, fa: 0.4 }, { x: 170, z: -131.6, bank: 0.24, dr: 18, dm: 1.9, cr: 5.4, fa: 0.4, hi: 11, ho: 24 }, { x: 181, z: -135.6, bank: 0.26, dr: 16, dm: 1.8, cr: 5.4, fa: 0.4, hi: 12, ho: 24 }, { x: 184, z: -126, bank: 0.3, dr: 14, dm: 1.9, cr: 5, fa: 0.4 }, { x: 186, z: -116, bank: 0.32, dr: 13, dm: 2.1,
cr: 4.8, fa: 0.4 }, { x: 189, z: -107, bank: 0.34, dr: 12, dm: 2.3, cr: 4.6, fa: 0.4 }, { x: 194, z: -101, bank: 0.36, dr: 12, dm: 2.4, cr: 4.2, fa: 0.4 }, { x: 199, z: -105, bank: 0.34, dr: 12, dm: 2.3, cr: 4.6, fa: 0.4 }, { x: 201, z: -114, bank: 0.3, dr: 13, dm: 2.1, cr: 4.8, fa: 0.4 }, { x: 200, z: -124, bank: 0.26, dr: 15, dm: 1.8, cr: 5, fa: 0.4 }, { x: 202, z: -134, bank: 0.11, dr: 26, dm: 1.1,
cr: 5.4, fa: 0.38 }, { x: 214, z: -136.5, bank: 0.1, dr: 28, dm: 1, cr: 5.6, fa: 0.38 }, { x: 226, z: -135, bank: 0.12, dr: 26, dm: 1.1, cr: 5.8, fa: 0.38 }, { x: 236, z: -130, bank: 0.16, dr: 22, dm: 1.6, cr: 6.4, fa: 0.4 }, { x: 243, z: -120, bank: 0.3, dr: 17, dm: 2.3, cr: 7.2, fa: 0.42 }, { x: 247, z: -108, bank: 0.34, dr: 15, dm: 2.5, cr: 7.4, fa: 0.42 }, { x: 249.6, z: -96, bank: 0.38, dr: 14,
dm: 2.5, cr: 7.6, fa: 0.42 }, { x: 249.8, z: -84, bank: 0.4, dr: 14, dm: 2.5, cr: 7.6, fa: 0.42 }, { x: 247, z: -72, bank: 0.38, dr: 15, dm: 2.5, cr: 7.4, fa: 0.42 }, { x: 242, z: -60, bank: 0.32, dr: 16, dm: 2.4, cr: 7, fa: 0.42 }, { x: 234, z: -50, bank: 0.26, dr: 18, dm: 2.2, cr: 6.4, fa: 0.4 }, { x: 224, z: -43, bank: 0.24, dr: 19, dm: 2.2, cr: 6.2, fa: 0.42 }, { x: 212, z: -40, bank: 0.26, dr: 20,
dm: 2.4, cr: 6.4, fa: 0.44 }, { x: 199, z: -39.4, bank: 0.28, dr: 20, dm: 2.5, cr: 6.8, fa: 0.46 }, { x: 186, z: -39.6, bank: 0.28, dr: 20, dm: 2.5, cr: 7.2, fa: 0.46 }, { x: 174, z: -40.6, bank: 0.3, dr: 18, dm: 2.5, cr: 7.2, fa: 0.46 }, { x: 166, z: -42.4, bank: 0.36, dr: 16, dm: 2.5, cr: 6, fa: 0.46 }], Qe = ze.map((e, t) => {
  const o = ze[(t + 1) % ze.length], n = o.x - e.x, s = o.z - e.z;
  return { a: e, b: o, dx: n, dz: s, len: Math.hypot(n, s), l2: n * n + s * s || 1e-6, s0: 0 };
});
{
  let e = 0;
  for (const t of Qe) t.s0 = e, e += t.len;
}
const Ft = (() => {
  let e = 1 / 0, t = -1 / 0, o = 1 / 0, n = -1 / 0;
  for (const s of ze) e = Math.min(e, s.x), t = Math.max(t, s.x), o = Math.min(o, s.z), n = Math.max(n, s.z);
  return { x0: e, x1: t, z0: o, z1: n };
})(), ae = 62;
function en(e, t) {
  let o = false;
  for (const n of Qe) {
    const { a: s, b: r } = n;
    if (s.z > t != r.z > t) {
      const c = (t - s.z) / (r.z - s.z);
      e < s.x + c * (r.x - s.x) && (o = !o);
    }
  }
  return o;
}
function on(e, t) {
  if (e < Ft.x0 - ae || e > Ft.x1 + ae || t < Ft.z0 - ae || t > Ft.z1 + ae) return null;
  let o = 1 / 0, n = null, s = 0;
  for (const u of Qe) {
    let d = ((e - u.a.x) * u.dx + (t - u.a.z) * u.dz) / u.l2;
    d = d < 0 ? 0 : d > 1 ? 1 : d;
    const h = u.a.x + u.dx * d, p = u.a.z + u.dz * d, m = (e - h) * (e - h) + (t - p) * (t - p);
    m < o && (o = m, n = u, s = d);
  }
  const r = Math.sqrt(o), c = en(e, t);
  if (!c && r > ae) return null;
  const { a: i, b: l } = n, f = (u, d) => u + (d - u) * s;
  return { d: c ? r : -r, bank: f(i.bank, l.bank), dr: f(i.dr, l.dr), dm: f(i.dm, l.dm), cr: f(i.cr, l.cr), fa: f(i.fa, l.fa), hi: f(i.hi ?? co, l.hi ?? co), ho: f(i.ho ?? lo, l.ho ?? lo), arc: n.s0 + n.len * s };
}
function ca(e, t) {
  return e < Ft.x0 - 1 || e > Ft.x1 + 1 || t < Ft.z0 - 1 || t > Ft.z1 + 1 ? false : en(e, t);
}
function la(e, t, o) {
  if (!o || o.d >= 0) return -1 / 0;
  const n = -o.d, s = Math.sin(o.arc * 0.062) * 4 + Math.sin(o.arc * 0.148 + 1.7) * 1.8, r = Math.max(2, ia + s), c = o.cr * (1 + 0.09 * Math.sin(o.arc * 0.091 + 0.4)), i = c / Math.max(0.08, o.bank);
  return n <= i ? rt + o.bank * n : n <= i + r ? rt + c : rt + c - (n - i - r) * o.fa;
}
const da = [{ a: [143, -44], b: [157, -37], crest: 6.3, half: 3.4, face: 0.5 }], fa = da.map((e) => {
  const t = e.b[0] - e.a[0], o = e.b[1] - e.a[1];
  return { d: e, dx: t, dz: o, l2: t * t + o * o || 1e-6 };
});
function ua(e, t) {
  let o = -1 / 0;
  for (const n of fa) {
    let s = ((e - n.d.a[0]) * n.dx + (t - n.d.a[1]) * n.dz) / n.l2;
    s = s < 0 ? 0 : s > 1 ? 1 : s;
    const r = n.d.a[0] + n.dx * s, c = n.d.a[1] + n.dz * s, i = Math.hypot(e - r, t - c), l = i <= n.d.half ? n.d.crest : n.d.crest - (i - n.d.half) * n.d.face;
    l > o && (o = l);
  }
  return o;
}
const ha = [{ id: "spill", half: 1.6, wall: 0.9, pts: [[158.6, -42.6, rt + 0.3], [157.4, -38.8, rt + 0.05], [155.6, -34.6, 3.1], [153.4, -31.4, 3], [151, -29, 2.95]] }, { id: "outfall", half: 1.9, wall: 0.7, pts: [[151, -29, 2.95], [143, -27.4, 2.2], [134, -26.6, 1.4], [124, -26.2, 0.55], [116, -26, 0.1], [110, -25.4, -0.1]] }, { id: "inflowSW", half: 1.2, wall: 0.8, pts: [[158, -127, rt - 0.3], [
154, -133, rt + 0.7], [149, -140, rt + 2.4], [144, -147, rt + 4.4]] }, { id: "inflowE", half: 0.9, wall: 0.8, pts: [[250.6, -90, rt - 0.25], [256, -89, rt + 0.9], [262, -87, rt + 2.6]] }], nn = [];
for (const e of ha) for (let t = 0; t < e.pts.length - 1; t++) {
  const o = e.pts[t], n = e.pts[t + 1], s = n[0] - o[0], r = n[1] - o[1];
  nn.push({ c: e, a: o, b: n, dx: s, dz: r, l2: s * s + r * r || 1e-6 });
}
function pa(e, t) {
  let o = 1 / 0;
  for (const n of nn) {
    let s = ((e - n.a[0]) * n.dx + (t - n.a[1]) * n.dz) / n.l2;
    s = s < 0 ? 0 : s > 1 ? 1 : s;
    const r = n.a[0] + n.dx * s, c = n.a[1] + n.dz * s, i = Math.hypot(e - r, t - c);
    if (i > n.c.half + 8) continue;
    const l = n.a[2] + (n.b[2] - n.a[2]) * s, f = i <= n.c.half ? l : l + (i - n.c.half) * n.c.wall;
    f < o && (o = f);
  }
  return o;
}
function ma(e, t, o, n) {
  const s = on(t, o);
  if (!s) return e;
  let r = e;
  const c = -1.3, i = (d) => d === -1 / 0 ? -1 / 0 : c + (d - c) * n, l = i(ua(t, o));
  l > r && (r = l);
  const f = i(la(t, o, s));
  if (f > r && (r = f), s.d >= 0) {
    const d = Dt(s.d / s.dr, 0, 1);
    r = rt - s.dm * d * d * (3 - 2 * d);
  } else {
    const d = -s.d, h = rt + s.bank * d, p = h < r ? h : r, m = yt(s.hi, s.ho, d);
    r = p + (r - p) * m;
  }
  const u = pa(t, o);
  return u < r ? u : r;
}
function xa(e, t, o) {
  const n = on(e, t);
  if (!n) return 1;
  if (n.d > -2) return 0;
  const s = Dt((-n.d - 2) / 10, 0, 1), r = Dt((o - rt - 0.9) / 2.4, 0, 1);
  return s < r ? s : r;
}
const dt = 1.5, wa = 2.6, _e = 21, ya = [{ x: 24, z: -116, rx: 76, rz: 30, h: 8 }, { x: 72, z: -112, rx: 50, rz: 26, h: 7 }, { x: -30, z: -114, rx: 54, rz: 26, h: 7 }, { x: 30, z: -140, rx: 66, rz: 56, h: 16.5 }, { x: -26, z: -136, rx: 60, rz: 52, h: 14 }, { x: 86, z: -134, rx: 58, rz: 50, h: 14.5 }, { x: 22, z: -162, rx: 80, rz: 40, h: 17 }, { x: -84, z: -150, rx: 62, rz: 48, h: 14 }, { x: 104, z: -164,
rx: 56, rz: 44, h: 14.5 }, { x: -124, z: -122, rx: 44, rz: 46, h: 12.5 }, { x: 124, z: -118, rx: 44, rz: 46, h: 12.5 }, { x: -118, z: -88, rx: 46, rz: 44, h: 13 }, { x: -122, z: -52, rx: 44, rz: 34, h: 13.5 }, { x: -112, z: 16, rx: 46, rz: 56, h: 17 }, { x: -140, z: 24, rx: 28, rz: 30, h: 13.5 }, { x: -90, z: 26, rx: 26, rz: 28, h: 12 }, { x: -108, z: 56, rx: 42, rz: 32, h: 12.5 }, { x: -98, z: 84,
rx: 36, rz: 26, h: 9.5 }, { x: 118, z: -84, rx: 44, rz: 42, h: 12.5 }, { x: 124, z: -48, rx: 42, rz: 32, h: 12.5 }, { x: 122, z: 20, rx: 42, rz: 34, h: 12.5 }, { x: 110, z: 58, rx: 38, rz: 30, h: 11 }, { x: 102, z: 88, rx: 34, rz: 26, h: 8.5 }, { x: 123, z: -13, rx: 60, rz: 15, h: 13 }, { x: 170, z: -26, rx: 46, rz: 30, h: 11.5 }, { x: 214, z: -24, rx: 46, rz: 30, h: 11 }, { x: 252, z: -36, rx: 34,
rz: 32, h: 10 }, { x: 266, z: -76, rx: 34, rz: 42, h: 11 }, { x: 258, z: -118, rx: 34, rz: 34, h: 10.5 }, { x: 214, z: -152, rx: 56, rz: 34, h: 11.5 }, { x: 158, z: -146, rx: 42, rz: 32, h: 11 }, { x: 188, z: -106, rx: 21, rz: 18, h: 11 }], an = [{ x0: -68, x1: 88, z0: -80, z1: 114, r: 13 }, { x0: -6, x1: 94, z0: -96, z1: -60, r: 13 }, { x0: -84, x1: -64, z0: -32, z1: 4, r: 11 }], Se = [{ id: "W",
x0: -132, x1: -96, zS: -15, zN: 24, zCrest: 2, crestMid: 17, crestEnd: 12.2, half: 3.3, spring: 3.2, arch: 3.3, walk: -1, bank: 1, narrowChannel: false, gateX: -84.5 }, { id: "E", x0: 108, x1: 138, zS: -15, zN: 21, zCrest: 0, crestMid: 13.2, crestEnd: 11.4, half: 3.3, spring: 3.2, arch: 3.3, walk: 1, bank: 0, narrowChannel: true, gateX: 85 }], sn = Se.map((e) => ({ x0: e.x0, x1: e.x1, z0: e.zS, z1: e.
zN })), ft = -112, Ut = 200, ut = -128, jt = 72, ba = (e) => yt(-196, -170, e);
function ga(e, t) {
  let o = 1;
  for (const n of ya) {
    const s = (e - n.x) / n.rx, r = (t - n.z) / n.rz, c = s * s + r * r;
    if (c >= 1) continue;
    const i = n.h * (1 - c) * (1 - c);
    if (o *= 1 - i / _e, o <= 0) return _e;
  }
  return _e * (1 - o);
}
const fo = (e, t) => {
  let o = 0;
  for (const n of Se) if (!(t && !t(n)) && (o = Math.max(o, yt(n.x0 - 44, n.x0 - 20, e) * yt(n.x1 + 44, n.x1 + 20, e)), o >= 1)) return 1;
  return o;
}, Ma = (e) => e.narrowChannel, uo = 8, za = (e) => yt(We - uo, We, e) * yt(He + uo, He, e);
function va(e, t) {
  const o = yt(7.5, 16 - 6.5 * fo(e), Math.abs(t)), n = 1 - za(e) * (1 - yt(6.5, 14 - 3 * fo(e, Ma), Math.abs(t - Yo.z)));
  let s = Math.min(o, n);
  if (s <= 0) return 0;
  for (const r of an) {
    const c = Math.max(r.x0 - e, e - r.x1, 0), i = Math.max(r.z0 - t, t - r.z1, 0);
    if (s *= yt(0, r.r, Math.hypot(c, i)), s <= 0) return 0;
  }
  return s;
}
function ka(e, t) {
  for (const o of sn) if (e > o.x0 && e < o.x1 && t > o.z0 && t < o.z1) return true;
  return false;
}
function Sa(e, t) {
  return $o(((e & 1023) << 10 ^ t & 1023) + 40503)() - 0.5;
}
const Ga = (() => {
  const e = nt(778213), t = [];
  for (let n = 0; n < 170; n++) {
    const s = e.range(-166, 166), r = e.range(-190, 104), c = e.range(7, 21);
    t.push({ x: s, z: r, rx: c * e.range(0.7, 1.4), rz: c * e.range(0.7, 1.4), h: e.range(0.55, 2.05) * (e.chance(0.34) ? -1 : 1) });
  }
  const o = nt(551907);
  for (let n = 0; n < 76; n++) {
    const s = o.range(158, 302), r = o.range(-190, 104), c = o.range(7, 21);
    t.push({ x: s, z: r, rx: c * o.range(0.7, 1.4), rz: c * o.range(0.7, 1.4), h: o.range(0.55, 2.05) * (o.chance(0.34) ? -1 : 1) });
  }
  return t;
})();
function Ta(e, t) {
  let o = 0;
  for (const n of Ga) {
    const s = (e - n.x) / n.rx, r = (t - n.z) / n.rz, c = s * s + r * r;
    c >= 1 || (o += n.h * (1 - c) * (1 - c));
  }
  return o;
}
const Aa = (() => {
  const e = nt(511903), t = [];
  for (let n = 0; n < 2400; n++) {
    const s = e.range(2.8, 6.8);
    t.push({ x: e.range(-168, 168), z: e.range(-194, 108), rx: s * e.range(0.75, 1.3), rz: s * e.range(0.75, 1.3), h: e.range(0.26, 0.78) * (e.chance(0.42) ? -1 : 1) });
  }
  const o = nt(613481);
  for (let n = 0; n < 1040; n++) {
    const s = o.range(2.8, 6.8);
    t.push({ x: o.range(158, 302), z: o.range(-194, 108), rx: s * o.range(0.75, 1.3), rz: s * o.range(0.75, 1.3), h: o.range(0.26, 0.78) * (o.chance(0.42) ? -1 : 1) });
  }
  return t;
})(), Qt = 8, Ue = /* @__PURE__ */ new Map(), ue = (e, t) => e * 4096 + t;
for (const e of Aa) {
  const t = Math.floor((e.x - e.rx) / Qt), o = Math.floor((e.x + e.rx) / Qt), n = Math.floor((e.z - e.rz) / Qt), s = Math.floor((e.z + e.rz) / Qt);
  for (let r = t; r <= o; r++) for (let c = n; c <= s; c++) {
    const i = ue(r, c);
    let l = Ue.get(i);
    l || Ue.set(i, l = []), l.push(e);
  }
}
function Ca(e, t) {
  const o = Ue.get(ue(Math.floor(e / Qt), Math.floor(t / Qt)));
  if (!o) return 0;
  let n = 0;
  for (const s of o) {
    const r = (e - s.x) / s.rx, c = (t - s.z) / s.rz, i = r * r + c * c;
    i >= 1 || (n += s.h * (1 - i) * (1 - i));
  }
  return n;
}
const Ra = (() => {
  const e = nt(390211), t = [];
  for (let n = 0; n < 8e3; n++) {
    const s = e.range(1.4, 3.4);
    t.push({ x: e.range(-168, 168), z: e.range(-194, 108), rx: s * e.range(0.75, 1.3), rz: s * e.range(0.75, 1.3), h: e.range(0.1, 0.3) * (e.chance(0.45) ? -1 : 1) });
  }
  const o = nt(728533);
  for (let n = 0; n < 3440; n++) {
    const s = o.range(1.4, 3.4);
    t.push({ x: o.range(158, 302), z: o.range(-194, 108), rx: s * o.range(0.75, 1.3), rz: s * o.range(0.75, 1.3), h: o.range(0.1, 0.3) * (o.chance(0.45) ? -1 : 1) });
  }
  return t;
})(), Zt = 4, je = /* @__PURE__ */ new Map();
for (const e of Ra) {
  const t = Math.floor((e.x - e.rx) / Zt), o = Math.floor((e.x + e.rx) / Zt), n = Math.floor((e.z - e.rz) / Zt), s = Math.floor((e.z + e.rz) / Zt);
  for (let r = t; r <= o; r++) for (let c = n; c <= s; c++) {
    const i = ue(r, c);
    let l = je.get(i);
    l || je.set(i, l = []), l.push(e);
  }
}
function Pa(e, t) {
  const o = je.get(ue(Math.floor(e / Zt), Math.floor(t / Zt)));
  if (!o) return 0;
  let n = 0;
  for (const s of o) {
    const r = (e - s.x) / s.rx, c = (t - s.z) / s.rz, i = r * r + c * c;
    i >= 1 || (n += s.h * (1 - i) * (1 - i));
  }
  return n;
}
const Ba = (() => {
  const e = nt(20857), t = [];
  for (let n = 0; n < 1100; n++) {
    const s = e.range(6, 17);
    t.push({ x: e.range(-172, 172), z: e.range(-198, 112), rx: s * e.range(0.7, 1.45), rz: s * e.range(0.7, 1.45), h: e.range(0.5, 1.15) * (e.chance(0.5) ? -1 : 1) });
  }
  const o = nt(884117);
  for (let n = 0; n < 470; n++) {
    const s = o.range(6, 17);
    t.push({ x: o.range(158, 306), z: o.range(-198, 112), rx: s * o.range(0.7, 1.45), rz: s * o.range(0.7, 1.45), h: o.range(0.5, 1.15) * (o.chance(0.5) ? -1 : 1) });
  }
  return t;
})(), xe = 24, ho = /* @__PURE__ */ new Map();
for (const e of Ba) {
  const t = Math.floor((e.x - e.rx) / xe), o = Math.floor((e.x + e.rx) / xe), n = Math.floor((e.z - e.rz) / xe), s = Math.floor((e.z + e.rz) / xe);
  for (let r = t; r <= o; r++) for (let c = n; c <= s; c++) {
    const i = ue(r, c);
    let l = ho.get(i);
    l || ho.set(i, l = []), l.push(e);
  }
}
const po = { main: [[18, -94.5], [15.4, -98.4], [10, -101], [1, -103.4], [-9, -105.6], [-19, -108.4], [-26.5, -112.6], [-24, -117.6], [-14, -120], [-3, -122.4], [8, -126.4], [17, -131], [24.6, -135.6]], ridge: [[24.6, -135.6], [17, -137.6], [8, -138.2], [-1, -137.4], [-10, -136.2], [-18, -135]], deck: [[24.6, -135.6], [29.6, -135.2], [35.4, -135.4]], hokora: [[-26.5, -112.6], [-32, -111], [-37, -112]],
glade: [[-14, -120], [-18, -124.5], [-16, -129]], foot: [[13, -97.4], [26, -97.6], [40, -98], [54, -98.4], [68, -98.2], [80, -96.6], [86, -93.8]], toverW: [[-66, 22], [-70, 25.5], [-75, 26], [-79.5, 23], [-82.5, 19], [-84.5, 15.5], [-86, 12]], toverE: [[91, -18.8], [97.5, -18.2], [104, -17.4], [106, -16.6], [99, -15.6], [97.8, -14.8], [100.6, -13.6], [101.4, -12.4], [104, -12]] }, Ea = 1.1, Ia = 2.7,
mo = { lakeRoad: { flat: 2.7, fade: 5, pts: [[89, -60, 0], [89, -46, 0], [90.4, -36.4, 0], [96, -33.6, 0], [104, -32.4, 0.1], [112, -31.6, 0.6], [120, -31.4, 1.7], [130, -32, 3], [139, -33, 4.1], [147, -34, 5.1], [153, -35.2, 5.8], [157, -37, 6.3]] }, damRoad: { flat: 3.2, fade: 4.6, pts: [[157, -37, 6.3], [152.6, -39.2, 6.3], [148, -41.5, 6.3], [143, -44, 6.2], [140.4, -48, 5.9]] }, shoreRoad: { flat: 2.6,
fade: 4.8, pts: [[139.4, -51.6], [134.6, -57], [131.4, -64], [130, -72], [130, -80], [131.8, -88], [134.8, -95.6], [138.8, -103], [144.2, -111.6], [150.6, -119.6], [158, -128], [166, -137], [173, -145.6], [179, -153.6], [186.4, -158.4], [195, -159.6], [203, -157], [209.4, -153.8]] }, shoreWalk: { flat: 1.5, fade: 3.4, pts: [[145.6, -53.6], [141.2, -58.4], [139.6, -64], [138.8, -71], [138.6, -79], [
139.8, -86], [142, -92.6], [144.4, -99.4], [145.2, -106], [147, -113], [151, -120.2], [157, -127], [165.4, -132.2], [175, -136.6], [185.4, -140.4], [196, -142.6], [206, -143.4], [216, -143.6], [226, -142], [235, -138], [242.4, -132], [247.4, -124], [251, -115], [253, -105], [253.6, -96], [252.6, -89]] }, mikaharashi: { flat: 1.2, fade: 2.9, pts: [[86, -95.4], [92, -95.6], [98, -95.8], [102.6, -96.8],
[106, -99.2], [109, -96.6], [112.4, -94.8], [115, -97.4], [117.6, -100.2], [120.6, -98], [123.2, -100.8], [124.6, -104.4], [123.8, -112.2], [127.4, -112], [130.4, -110.6], [133, -109], [134.8, -107.6], [137, -108.6], [139, -110.4], [141.6, -111.4], [143.8, -109.8], [145, -106.4]] }, pierSpur: { flat: 1.2, fade: 2.6, pts: [[139, -79.4], [141.4, -79.8]] }, suijinSpur: { flat: 1.1, fade: 2.5, pts: [[
252.6, -89], [252.8, -91.4]] } }, rn = (() => {
  const e = [], t = (o, n, s, r, c) => {
    const i = n[0] - o[0], l = n[1] - o[1];
    e.push({ a: o, b: n, dx: i, dz: l, l2: i * i + l * l || 1e-6, flat: s, fade: r, given: c });
  };
  for (const o of Object.keys(po)) {
    const n = po[o];
    for (let s = 0; s < n.length - 1; s++) t(n[s], n[s + 1], Ea, Ia, false);
  }
  for (const o of Object.keys(mo)) {
    const n = mo[o], s = n.pts[0].length > 2;
    for (let r = 0; r < n.pts.length - 1; r++) t(n.pts[r], n.pts[r + 1], n.flat, n.fade, s);
  }
  return e;
})();
function cn(e, t) {
  let o = 1e9, n = null, s = 0;
  for (const r of rn) {
    let c = ((e - r.a[0]) * r.dx + (t - r.a[1]) * r.dz) / r.l2;
    c = c < 0 ? 0 : c > 1 ? 1 : c;
    const i = Math.hypot(e - (r.a[0] + r.dx * c), t - (r.a[1] + r.dz * c));
    i < o && (o = i, n = r, s = c);
  }
  return { d: o, seg: n, t: s };
}
function Da(e, t) {
  const o = cn(e, t), n = o.seg.flat + 0.1, s = n + 2;
  return o.d <= n ? 0 : o.d >= s ? 1 : (o.d - n) / 2;
}
const La = (e, t) => (e & 1 ^ t & 1) === 1, ve = Ut - ft + 1, xt = jt - ut + 1, kt = new Float32Array(ve * xt);
function _a(e, t) {
  const o = Math.abs(t) < 24, n = Math.abs(t + 24) < 22;
  return o || n ? 1.9 : 0.52;
}
const Ne = -1.3 + 5e-3;
{
  const e = ka;
  for (let o = ft; o <= Ut; o++) for (let n = ut; n <= jt; n++) {
    const s = o * dt, r = n * dt, c = va(s, r);
    kt[(o - ft) * xt + (n - ut)] = e(s, r) ? -1.3 : Math.max(-1.3, ma(ga(s, r) * c * ba(r) - wa, s, r, c));
  }
  const t = new Float32Array(ve * xt);
  for (let o = ft; o <= Ut; o++) for (let n = ut; n <= jt; n++) t[(o - ft) * xt + (n - ut)] = _a(o * dt, n * dt) * dt;
  for (let o = 0; o < 140; o++) {
    let n = false;
    for (let s = 0; s < ve; s++) for (let r = 0; r < xt; r++) {
      const c = s * xt + r, i = kt[c];
      if (i <= Ne) continue;
      let l = 1 / 0;
      for (let f = 0; f < 4; f++) {
        const u = s + (f === 0 ? 1 : f === 1 ? -1 : 0), d = r + (f === 2 ? 1 : f === 3 ? -1 : 0);
        if (u < 0 || u >= ve || d < 0 || d >= xt) continue;
        const h = u * xt + d;
        l = Math.min(l, kt[h] + Math.max(t[c], t[h]));
      }
      l < i && (kt[c] = Math.max(-1.3, l), n = true);
    }
    if (!n) break;
  }
  for (let o = ft; o <= Ut; o++) for (let n = ut; n <= jt; n++) {
    const s = (o - ft) * xt + (n - ut), r = kt[s];
    if (r <= Ne) continue;
    const c = o * dt, i = n * dt;
    if (e(c, i)) continue;
    const l = Math.max(0, Math.min(1, r / 2.4)), f = Math.max(0, Math.min(1, r / 1.6)), u = Math.max(0, Math.min(1, r / 0.7)), d = xa(c, i, r), h = Da(c, i) * d;
    let p = Ta(c, i) * l * (0.2 + 0.8 * d) + (Sa(o, n) * 0.21 * l + Ca(c, i) * f + Pa(c, i) * u) * h;
    r > 0 && p < -0.75 * r && (p = -0.75 * r), kt[s] = Math.max(-1.3, r + p);
  }
  {
    const o = /* @__PURE__ */ new Map(), n = (s) => s[0] + "," + s[1];
    for (const s of rn) for (const r of [s.a, s.b]) o.has(n(r)) || o.set(n(r), s.given ? r[2] : Na(r[0], r[1]));
    for (let s = ft; s <= Ut; s++) for (let r = ut; r <= jt; r++) {
      const c = (s - ft) * xt + (r - ut), i = kt[c];
      if (i <= Ne) continue;
      const l = s * dt, f = r * dt;
      if (e(l, f)) continue;
      const u = cn(l, f);
      if (u.d >= u.seg.fade) continue;
      const { a: d, b: h } = u.seg, p = o.get(n(d)) + (o.get(n(h)) - o.get(n(d))) * u.t;
      if (p > i && Oa(l, f) || ca(l, f)) continue;
      const m = u.d <= u.seg.flat ? 1 : (u.seg.fade - u.d) / (u.seg.fade - u.seg.flat);
      kt[c] = Math.max(-1.3, i + (p - i) * m);
    }
  }
}
function we(e, t) {
  return e < ft || e > Ut || t < ut || t > jt ? -1.3 : kt[(e - ft) * xt + (t - ut)];
}
function Na(e, t) {
  const o = Math.floor(e / dt), n = Math.floor(t / dt);
  if (o < ft || o >= Ut || n < ut || n >= jt) return -1.3;
  const s = e / dt - o, r = t / dt - n, c = we(o, n), i = we(o + 1, n), l = we(o, n + 1), f = we(o + 1, n + 1);
  return La(o, n) ? s + r <= 1 ? c + (i - c) * s + (l - c) * r : f + (f - l) * (s - 1) + (f - i) * (r - 1) : s >= r ? c + (i - c) * s + (f - i) * r : c + (f - l) * s + (l - c) * r;
}
function Oa(e, t) {
  for (const o of sn) if (e > o.x0 - 1 && e < o.x1 + 1 && t > o.z0 - 1 && t < o.z1 + 1) return false;
  if (Math.abs(t) < 7.5 || e > We && e < He && Math.abs(t - Yo.z) < 6.5) return true;
  for (const o of an) if (e >= o.x0 && e <= o.x1 && t >= o.z0 && t <= o.z1) return true;
  return false;
}
const se = 1.44, Fa = 0.3, Mt = -ht / 2, Ct = ht / 2, xo = -150, wo = 150, yo = () => g({ color: b.railMetal, bands: 3, tint: 6248568, flat: false }), bo = () => g({ color: b.railHead, bands: 2, tint: 7301264 }), Va = () => g({ color: b.sleeper, bands: 3, tint: 6117496 }), Wa = () => g({ color: b.ballast, bands: 3, tint: 6643076 }), Ha = () => g({ color: b.gateYellow, bands: 3, tint: 9400400 }), Ua = () => g(
{ color: b.gateBlack, bands: 2, tint: 4932960 }), ln = () => g({ color: b.metal, bands: 3, tint: 6709392 }), dn = () => g({ color: b.metalDark, bands: 3, tint: 6051456 }), go = () => g({ color: b.cabinet, bands: 3, tint: 7301264 }), ja = () => g({ color: b.concrete, bands: 3, tint: 7301008 });
function Ka(e) {
  const t = new a.Group();
  t.name = "railway", e.add(t);
  {
    const r = new a.Shape();
    r.moveTo(-bt - 0.9, 0), r.lineTo(-bt, 0.26), r.lineTo(bt, 0.26), r.lineTo(bt + 0.9, 0), r.closePath();
    const c = new a.ExtrudeGeometry(r, { depth: Ct - Mt, bevelEnabled: false });
    c.rotateY(Math.PI / 2), c.translate(Mt, 0, 0);
    const i = new a.Mesh(c, Wa());
    i.receiveShadow = true, i.name = "ballast", t.add(i);
  }
  {
    const r = new a.BoxGeometry(0.24, 0.16, 2.5), c = Math.floor((Ct - Mt) / 0.62), i = new a.InstancedMesh(r, Va(), c), l = new a.Object3D();
    let f = 0;
    for (let u = Mt; u < Ct; u += 0.62) Math.abs(u) < V + K + 0.6 || (l.position.set(u, 0.32, 0), l.rotation.set(0, 0, 0), l.updateMatrix(), i.setMatrixAt(f++, l.matrix));
    i.count = f, i.receiveShadow = true, i.castShadow = true, t.add(i);
  }
  {
    const r = Ct - Mt, c = pt([{ geometry: new a.BoxGeometry(r, 0.055, 0.115), matrix: T(0, 0.392, 0) }, { geometry: new a.BoxGeometry(r, 0.1, 0.05), matrix: T(0, 0.325, 0) }, { geometry: new a.BoxGeometry(r, 0.03, 0.17), matrix: T(0, 0.27, 0) }]);
    for (const i of [-1, 1]) {
      const l = new a.Mesh(c.clone(), yo());
      l.position.set((Mt + Ct) / 2, 0, i * se / 2), l.castShadow = true, l.receiveShadow = true, l.name = "rail", t.add(l);
      const f = D(r, 0.016, 0.09, bo(), (Mt + Ct) / 2, 0.424, i * se / 2);
      f.userData.noOutline = true, t.add(f);
    }
    c.dispose();
  }
  {
    const r = V * 2 + K * 2 + 1, c = U(0), i = g({ color: 14341599, bands: 3, tint: 7301008 }), l = D(r, 0.28, se - 0.26, i, c, 0.18, 0);
    l.receiveShadow = true, t.add(l);
    for (const u of [-1, 1]) {
      const d = D(r, 0.28, 1.55, i, c, 0.18, u * (se / 2 + 0.12 + 0.78));
      d.receiveShadow = true, t.add(d);
    }
    for (const u of [-1, 1]) {
      const d = u * se / 2, h = D(r, 0.12, 0.115, yo(), c, 0.36, d);
      h.receiveShadow = true, t.add(h);
      const p = D(r, 0.016, 0.09, bo(), c, 0.424, d);
      p.userData.noOutline = true, t.add(p);
      for (const m of [-1, 1]) t.add(D(r, 0.06, 0.055, g({ color: 5064535, bands: 2, tint: 4275288 }), c, 0.33, d + m * 0.086));
    }
    const f = g({ color: b.lineYellow, bands: 2, tint: 9400400 });
    for (const u of [-1, 1]) {
      for (const [d, h] of [[0.42, 0.3], [0.92, 0.16]]) {
        const p = new a.PlaneGeometry(V * 2 - 0.15, h);
        p.rotateX(-Math.PI / 2);
        const m = new a.Mesh(p, f);
        m.position.set(c, 0.335, u * (bt + d)), m.userData.noOutline = true, t.add(m);
      }
      for (let d = -5; d <= 5; d++) {
        const h = new a.PlaneGeometry(0.5, 0.11);
        h.rotateX(-Math.PI / 2), h.rotateY(Math.PI / 4);
        const p = new a.Mesh(h, f);
        p.position.set(c + d * 0.56, 0.333, u * (bt + 0.67)), p.userData.noOutline = true, t.add(p);
      }
    }
  }
  const o = bt + 1.05, n = V + K + 0.5;
  {
    const r = [], c = new a.BoxGeometry(1, 0.06, 0.06), i = new a.BoxGeometry(0.07, 1.12, 0.07), l = new a.BoxGeometry(0.035, 0.5, 0.035), f = (h, p, m) => {
      let w = [[p, m]];
      const M = [];
      for (const G of Se) M.push([G.x0, G.x1]), Math.sign(h) === G.walk && M.push([G.gateX - 0.9, G.gateX + 0.9]);
      for (const [G, A] of M) {
        const x = [];
        for (const [S, y] of w) {
          if (A <= S || G >= y) {
            x.push([S, y]);
            continue;
          }
          G - S > 0.6 && x.push([S, G]), y - A > 0.6 && x.push([A, y]);
        }
        w = x;
      }
      return w.map(([G, A]) => [h, G, A]);
    }, u = [...f(o, xo + 22, -n), ...f(o, n, wo - 22), ...f(-o, xo + 22, -n), ...f(-o, n, 13.5), ...f(-o, 39.5, wo - 22)];
    for (const [h, p, m] of u) {
      const w = m - p, M = (p + m) / 2;
      for (const G of [0.55, 1.02]) r.push({ geometry: c, matrix: T(M, G, h, 0, 0, 0, w, 1, 1) });
      for (let G = p; G <= m; G += 2.4) r.push({ geometry: i, matrix: T(G, 0.56, h) });
      for (let G = p + 0.3; G <= m; G += 0.32) r.push({ geometry: l, matrix: T(G, 0.78, h) });
      e.collide(p, h - 0.12, m, h + 0.12, 1.2);
    }
    const d = new a.Mesh(pt(r), ln());
    d.castShadow = true, d.name = "linesideFence", t.add(d), [c, i, l].forEach((h) => h.dispose());
  }
  {
    const r = dn(), c = [], i = ht / Math.round(ht / 19), l = 0.02;
    for (let d = Mt + i; d <= Ct - i * 0.5; d += i) {
      if (Math.abs(d) < 8 || Se.some((p) => d > p.x0 - 16 && d < p.x1 + 16)) continue;
      const h = -3.6500000000000004;
      c.push({ geometry: new a.CylinderGeometry(0.09, 0.13, 6.6, 6), matrix: T(d, 3.3, h) }), c.push({ geometry: new a.BoxGeometry(0.1, 0.1, l - h), matrix: T(d, 6.1, (h + l) * 0.5) }), c.push({ geometry: new a.BoxGeometry(0.09, 1, 0.09), matrix: T(d, 5.6, l) }), c.push({ geometry: new a.CylinderGeometry(0.05, 0.05, 0.28, 6), matrix: T(d, 5.02, l) });
    }
    const f = new a.Mesh(pt(c), r);
    f.castShadow = true, t.add(f);
    const u = g({ color: b.metalDark, bands: 2, tint: 4867176 });
    for (const [d, h] of [[4.88, 0.022], [5.95, 0.026]]) {
      const p = [];
      for (let G = Mt; G <= Ct; G += i) p.push(new a.Vector3(G, d - (d > 5 ? 0.12 : 0), l)), p.push(new a.Vector3(G + i * 0.5, d, l));
      const m = new a.CatmullRomCurve3(p), w = Math.round(ht / 2.5), M = new a.Mesh(new a.TubeGeometry(m, w, h, 4, false), u);
      M.name = "catenaryWire", t.add(M);
    }
  }
  const s = qa(e, t);
  $a(e, t);
  {
    const r = g({ color: b.concreteMid, bands: 3, tint: 6972040 }), c = [[bt + 2.6, -80, -30], [bt + 2.6, 46, 80], [-4.800000000000001, -80, -30], [-4.800000000000001, 44, 80]], i = g({ color: b.concrete, bands: 3, tint: 7301008 });
    for (const [l, f, u] of c) {
      const d = D(u - f, 2.2, 0.35, r, (f + u) / 2, 1.1, l);
      d.castShadow = true, d.receiveShadow = true, t.add(d), e.collide(f, l - 0.2, u, l + 0.2, 2.2);
      for (const h of [f, u]) {
        const m = h - (h === f ? 1 : -1) * 0.22, w = D(0.52, 2.52, 0.62, r, m, 1.26, l);
        w.castShadow = w.receiveShadow = true, t.add(w);
        const M = D(0.62, 0.1, 0.72, i, m, 2.57, l);
        M.receiveShadow = true, t.add(M), e.collide(m - 0.31, l - 0.36, m + 0.31, l + 0.36, 2.62);
      }
    }
  }
  return s;
}
function qa(e, t) {
  const o = new a.Group();
  o.name = "crossing", t.add(o);
  const n = U(0), s = Ha(), r = Ua(), c = ln(), i = dn(), l = go(), f = [], u = [];
  function d(x) {
    const S = new a.Group(), y = 0.52, k = Math.round(x / y), P = new a.BoxGeometry(y, 0.17, 0.09), v = [], z = [];
    for (let H = 0; H < k; H++) {
      const C = T(y * (H + 0.5), 0, 0);
      (H % 2 === 0 ? v : z).push({ geometry: P, matrix: C });
    }
    const R = new a.Mesh(pt(v), s), O = new a.Mesh(pt(z), r);
    R.castShadow = O.castShadow = true, S.add(R, O);
    for (let H = 1; H < k - 1; H += 3) {
      const C = D(0.11, 0.11, 0.07, I({ color: b.signalOff }), y * (H + 0.5), -0.14, 0.06);
      C.userData.lamp = "arm", f.push(C), S.add(C), S.add(D(0.03, 0.12, 0.03, i, y * (H + 0.5), -0.05, 0.06));
    }
    return wt(R, { thickness: 32e-4 }), wt(O, { thickness: 32e-4 }), P.dispose(), S;
  }
  function h(x, S, y) {
    const k = new a.Group(), P = n + x * (V + 0.42), v = S * ke;
    k.position.set(P, et(), v), k.userData.planetRigid = true;
    const z = D(0.66, 0.2, 0.62, ja(), 0, 0.1, 0);
    if (z.receiveShadow = z.castShadow = true, k.add(z), y === "arm") {
      const B = D(0.46, 0.92, 0.38, go(), 0, 0.66, 0);
      B.castShadow = B.receiveShadow = true, k.add(B), wt(B, { thickness: 34e-4 }), k.add(D(0.54, 0.07, 0.46, g({ color: b.cabinetTop, bands: 3 }), 0, 0.2 + 0.92 + 0.03, 0));
      for (let j = 0; j < 3; j++) k.add(D(0.48, 0.11, 0.4, j % 2 ? r : s, 0, 0.34 + j * 0.24, 0));
      const E = new a.Group();
      E.position.set(0, 0.2 + 0.92 + 0.12, S * 0.2), E.add(d(V * 2 + 0.5)), E.rotation.y = x > 0 ? Math.PI : 0, E.rotation.z = Math.PI / 2, k.add(E), u.push({ pivot: E }), k.add(D(0.2, 0.2, 0.14, i, 0, 0.2 + 0.92 + 0.12, S * 0.2));
    }
    const R = y === "arm" ? x * 0.44 : 0, O = 2.45, H = Jt(0.075, 0.09, O, 8, s, R, 0.2 + O / 2, 0);
    H.castShadow = true, k.add(H);
    for (let F = 0; F < 4; F++) k.add(Jt(0.082, 0.082, 0.22, 8, r, R, 0.42 + F * 0.56, 0));
    wt(H, { thickness: 32e-4 }), y === "arm" && k.add(D(0.5, 0.09, 0.09, i, R / 2, 0.2 + 0.5, 0));
    const C = new a.Group();
    C.position.set(R, 0.2 + O + 0.02, S * 0.02), C.rotation.y = S > 0 ? 0 : Math.PI, C.add(D(0.86, 0.13, 0.1, r, 0, 0.06, 0));
    for (const F of [-0.28, 0.28]) {
      const B = new a.Mesh(new a.CylinderGeometry(0.145, 0.16, 0.13, 12, 1, true), r);
      B.rotation.x = Math.PI / 2, B.position.set(F, -0.12, 0.07), C.add(B);
      const E = new a.Mesh(new a.CircleGeometry(0.16, 14), r);
      E.position.set(F, -0.12, 0), C.add(E);
      const j = new a.Mesh(new a.CircleGeometry(0.13, 14), I({ color: b.signalOff, cache: false }));
      j.position.set(F, -0.12, 0.135), j.userData.lamp = F < 0 ? "a" : "b", f.push(j), C.add(j);
    }
    const L = new a.Mesh(new a.SphereGeometry(0.13, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), c);
    if (L.rotation.x = Math.PI, L.position.set(0, 0.3, 0), C.add(L), k.add(C), y === "sign") {
      const F = [I({ color: b.wallWhite }), I({ color: b.wallWhite }), I({ color: b.wallWhite }), I({ color: b.wallWhite }), I({ color: 16777215, map: Cn(), cache: false }), I({ color: b.wallGray })], B = new a.Mesh(new a.BoxGeometry(1.15, 0.58, 0.05), F);
      B.position.set(0, 0.2 + O + 0.62, S * 0.05), B.rotation.y = S > 0 ? 0 : Math.PI, B.castShadow = true, k.add(B), wt(B, { thickness: 3e-3 });
      for (const E of [0.72, -0.72]) {
        const j = D(1.2, 0.15, 0.045, s, 0, 0.2 + O + 1.28, S * 0.05);
        j.rotation.z = E, j.castShadow = true, k.add(j);
      }
      k.add(Jt(0.06, 0.07, 1.3, 8, s, 0, 0.2 + O + 0.65, 0));
    }
    return o.add(k), e.collide(P - 0.4, v - 0.35, P + 0.4, v + 0.35, 2.4), k;
  }
  h(-1, 1, "arm"), h(1, -1, "arm"), h(1, 1, "sign"), h(-1, -1, "sign");
  {
    const x = -ke - 1.15, S = n - (V + 1.5), y = D(0.78, 1.32, 0.5, l, S, et() + 0.66, x);
    y.castShadow = y.receiveShadow = true, o.add(y), wt(y, { thickness: 3e-3 });
    const k = D(0.86, 0.08, 0.58, g({ color: b.cabinetTop, bands: 3 }), S, et() + 1.36, x);
    o.add(k);
    const P = D(0.52, 0.9, 0.4, l, S - 0.9, et() + 0.45, x + 0.1);
    P.castShadow = P.receiveShadow = true, o.add(P), o.add(D(0.6, 0.06, 0.46, g({ color: b.cabinetTop, bands: 3 }), S - 0.9, et() + 0.93, x + 0.1)), o.add(D(0.02, 1, 0.02, g({ color: b.metalDark, bands: 2 }), S, et() + 0.66, x - 0.26));
    const v = D(0.07, 0.07, 0.03, I({ color: b.signalRed }), S + 0.24, et() + 1.16, x - 0.26);
    o.add(v), e.collide(S - 1.3, x - 0.4, S + 0.5, x + 0.4, et() + 1.4);
    const z = D(0.3, 0.4, 0.12, g({ color: b.yellow, bands: 3 }), S, et() + 1, x - 0.3);
    z.castShadow = true, o.add(z);
    const R = D(0.9, 1.6, 0.9, I({ color: 16711680, cache: false }), S, et() + 0.8, x);
    R.visible = false, o.add(R), e.interact({ hitbox: R, label: "\u8E0F\u5207\u30B9\u30A4\u30C3\u30C1  \xB7  call a train", action: () => A.request?.() });
  }
  {
    const x = g({ color: b.concrete, bands: 3, tint: 7301008 });
    for (const S of [-1, 1]) {
      const y = n + S * (V + 0.15), k = D(0.34, 0.16, bt * 2 + 1.6, x, y, et() + 0.08, 0);
      k.receiveShadow = true, k.castShadow = true, o.add(k);
      for (const P of [-1, 1]) {
        const v = new a.Mesh(new a.PlaneGeometry(1.35, 0.6), g({ color: 16777215, bands: 2, map: qo(true), tint: 9400400, cache: false }));
        v.rotation.x = -Math.PI / 2, v.position.set(n + S * (V + 0.82), et() + Lt + 0.016, P * (It + 0.32)), o.add(v);
      }
    }
  }
  const p = new a.Color(b.signalRed), m = new a.Color(b.signalOff), w = f.filter((x) => x.userData.lamp === "arm"), M = f.filter((x) => x.userData.lamp === "a"), G = f.filter((x) => x.userData.lamp === "b");
  for (const x of f) x.material = x.material.clone();
  const A = { group: o, arms: u, active: false, armT: 0, _blink: 0, request: null, setLamps(x, S) {
    const y = x && S < 0.5 ? p : m, k = x && S >= 0.5 ? p : m;
    M.forEach((v) => v.material.color.copy(y)), G.forEach((v) => v.material.color.copy(k));
    const P = x && S < 0.5 ? p : m;
    w.forEach((v) => v.material.color.copy(P));
  }, setArms(x) {
    this.armT = x;
    const S = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    for (const y of u) y.pivot.rotation.z = (1 - S) * (Math.PI / 2) * 0.99 + 4e-3;
  } };
  return A.setLamps(false, 0), A.setArms(0), A;
}
function $a(e, t, o) {
  const n = new a.Group();
  n.name = "station", t.add(n);
  const s = 15.5, r = 38, c = -1.92, i = c - 3.7, l = 0.98, f = g({ color: b.concrete, bands: 3, tint: 7301008 }), u = g({ color: b.concreteMid, bands: 3, tint: 6972040 }), d = D(r - s, l, c - i, f, (s + r) / 2, l / 2, (c + i) / 2);
  d.castShadow = d.receiveShadow = true, n.add(d), e.platform({ x0: s, x1: r, z0: i, z1: c, top: l }), e.collide(s - 0.1, i - 0.1, r + 0.1, c + 0.1, l), n.add(D(r - s, 0.06, 0.34, u, (s + r) / 2, l - 0.02, c - 0.17));
  const h = new a.Mesh(new a.PlaneGeometry(r - s - 1, 0.46), g({ color: 16777215, bands: 2, map: qo(), tint: 9400400, cache: false }));
  h.material.map.repeat.set((r - s - 1) / 0.46, 1), h.material.map.wrapS = a.RepeatWrapping, h.rotation.x = -Math.PI / 2, h.position.set((s + r) / 2, l + 0.012, c - 0.62), n.add(h);
  {
    const m = (s + r) / 2 + 1.5, w = 9.5, M = 3.2, G = [];
    for (const S of [m - w / 2 + 0.6, m + w / 2 - 0.6]) for (const y of [c - 0.9, i + 0.7]) G.push({ geometry: new a.CylinderGeometry(0.075, 0.075, 2.6, 8), matrix: T(S, l + 1.3, y) });
    const A = new a.Mesh(pt(G), g({ color: b.metalDark, bands: 3 }));
    A.castShadow = true, n.add(A);
    const x = D(w, 0.16, M, g({ color: b.roofTeal, bands: 3, tint: 4867176 }), m, l + 2.66, (c + i) / 2 - 0.1);
    x.castShadow = x.receiveShadow = true, n.add(x), n.add(D(w + 0.3, 0.1, 0.14, g({ color: b.metal, bands: 3 }), m, l + 2.56, (c + i) / 2 - 1.75)), wt(x, { thickness: 3e-3 });
    for (const S of [m - 2.2, m + 1.4]) {
      const y = new a.Group();
      y.add(D(1.7, 0.08, 0.42, g({ color: b.wallCream, bands: 3 }), 0, 0.42, 0)), y.add(D(1.7, 0.5, 0.07, g({ color: b.wallCream, bands: 3 }), 0, 0.66, -0.2));
      for (const k of [-0.7, 0.7]) y.add(D(0.1, 0.42, 0.36, g({ color: b.metalDark, bands: 3 }), k, 0.21, 0));
      y.position.set(S, l, i + 0.95), y.traverse((k) => {
        k.isMesh && (k.castShadow = true);
      }), n.add(y);
    }
  }
  for (const m of [s + 4, r - 4.5]) {
    const w = Jt(0.06, 0.06, 2.2, 8, g({ color: b.metalDark, bands: 3 }), m, l + 1.1, c - 0.55);
    w.castShadow = true, n.add(w);
    const M = new a.Mesh(new a.BoxGeometry(1.9, 0.5, 0.06), [I({ color: b.wallWhite }), I({ color: b.wallWhite }), I({ color: b.wallWhite }), I({ color: b.wallWhite }), I({ color: 16777215, map: Rn(), cache: false }), I({ color: b.wallGray })]);
    M.position.set(m, l + 2.25, c - 0.55), M.castShadow = true, n.add(M), wt(M, { thickness: 3e-3 });
  }
  {
    const m = [];
    for (let M = s; M <= r; M += 2.2) m.push({ geometry: new a.BoxGeometry(0.08, 1.2, 0.08), matrix: T(M, l + 0.6, i + 0.06) });
    for (const M of [l + 0.5, l + 1.1]) m.push({ geometry: new a.BoxGeometry(r - s, 0.06, 0.06), matrix: T((s + r) / 2, M, i + 0.06) });
    const w = new a.Mesh(pt(m), g({ color: b.metal, bands: 3 }));
    w.castShadow = true, n.add(w);
  }
  {
    for (let w = 0; w < 6; w++) {
      const M = l * ((6 - w) / 6), G = s - 0.18 - w * 0.36, A = D(0.36, M, 2.4, f, G, M / 2, i + 1.3);
      A.castShadow = A.receiveShadow = true, n.add(A), e.platform({ x0: G - 0.21, x1: G + 0.21, z0: i + 0.1, z1: i + 2.5, top: M });
    }
    for (const w of [i + 0.1, i + 2.5]) {
      const M = D(2.4, 0.07, 0.07, g({ color: b.metal, bands: 3 }), s - 1.2, 0.95, w);
      M.rotation.z = 0.36, n.add(M);
    }
  }
  for (const m of [s + 2.5, (s + r) / 2 - 3.5, r - 2]) {
    const w = Jt(0.055, 0.055, 3.1, 8, g({ color: b.metalDark, bands: 3 }), m, l + 1.55, i + 0.5);
    w.castShadow = true, n.add(w);
    const M = new a.Mesh(new a.ConeGeometry(0.26, 0.22, 10, 1, true), g({ color: b.wallGray, bands: 3 }));
    M.position.set(m, l + 3.05, i + 0.5), n.add(M), n.add(D(0.18, 0.05, 0.18, I({ color: 16774100 }), m, l + 2.92, i + 0.5));
  }
  const p = new a.Mesh(new a.BoxGeometry(0.36, 0.72, 0.04), [I({ color: b.wallGray }), I({ color: b.wallGray }), I({ color: b.wallGray }), I({ color: b.wallGray }), I({ color: 16777215, map: Ko(1), cache: false }), I({ color: b.wallGray })]);
  return p.position.set(s + 8.5, l + 1, i + 0.02), p.rotation.y = Math.PI, n.add(p), n;
}
const Rt = 19.4, st = 2.86, Mo = 20.1, Pt = 1.06, zt = 3.74, re = 3.96, Ya = 4.88, W = {};
function Xa() {
  W.body || (W.body = g({ color: b.trainBody, bands: 3, tint: 7301014 }), W.bodyShade = g({ color: b.trainBodyShade, bands: 3, tint: 7301014 }), W.stripe = g({ color: b.trainStripe, bands: 3, tint: 4868754 }), W.stripe2 = g({ color: b.trainStripe2, bands: 3, tint: 4151946 }), W.roof = g({ color: b.trainRoof, bands: 3, tint: 6314367 }), W.skirt = g({ color: b.trainSkirt, bands: 3, tint: 5985408 }),
  W.window = I({ color: b.trainWindow }), W.windowLit = I({ color: b.trainWindowLit }), W.door = g({ color: b.trainDoor, bands: 3, tint: 7301014 }), W.dark = g({ color: b.black, bands: 2, tint: 4932960 }), W.metal = g({ color: b.metalDark, bands: 3, tint: 6051456 }), W.wheel = g({ color: 4867410, bands: 2, tint: 4932960 }), W.headlight = I({ color: 16774874 }), W.tail = I({ color: 16734794 }));
}
const Qa = [-7, -2.4, 2.4, 7], Za = 1.32, Ja = [[-8.5, 1.7], [-4.7, 3.2], [0, 3.4], [4.7, 3.2], [8.5, 1.7]];
function zo(e, t, o, n, s) {
  const i = n * (st / 2 + 0.032), l = new a.Mesh(new a.PlaneGeometry(o, 3.16 - 2.16), W.window);
  l.position.set(t, (2.16 + 3.16) / 2, i), l.rotation.y = n > 0 ? 0 : Math.PI, l.userData.noOutline = true, e.add(l), s.next();
  const f = 3.16 - 2.16, u = (h, p, m, w) => {
    const M = new a.Mesh(new a.PlaneGeometry(o - 0.06, p), I({ color: m }));
    return M.position.set(t, 2.16 + f * h, i + n * w), M.rotation.y = n > 0 ? 0 : Math.PI, M.userData.noOutline = true, e.add(M), M;
  };
  u(0.14, f * 0.28, 5331570, 0.018), u(0.3, 0.035, 10463419, 0.021), u(0.72, 0.045, 12173516, 0.021), u(0.93, 0.07, 15788760, 0.018);
  const d = new a.Mesh(new a.PlaneGeometry(o * 0.2, (3.16 - 2.16) * 0.95), I({ color: 14674678, transparent: true, opacity: 0.13, depthWrite: false }));
  d.position.set(t - o * 0.2, (2.16 + 3.16) / 2, i + n * 0.012), d.rotation.set(0, n > 0 ? 0 : Math.PI, 0.24), d.userData.noOutline = true, e.add(d);
}
function ts({ cab: e = false, tail: t = false, rng: o }) {
  const n = new a.Group(), s = { body: [], stripe: [], roof: [], skirt: [], door: [], dark: [], metal: [] }, r = zt - Pt;
  s.body.push({ geometry: new a.BoxGeometry(Rt, r, st), matrix: T(0, (Pt + zt) / 2, 0) }), s.roof.push({ geometry: new a.BoxGeometry(Rt - 0.1, re - zt, st - 0.24), matrix: T(0, (zt + re) / 2, 0) });
  for (const d of [-1, 1]) s.roof.push({ geometry: new a.BoxGeometry(Rt - 0.05, 0.07, 0.1), matrix: T(0, zt + 0.02, d * (st / 2 - 0.06)) });
  const c = 1.92, i = 0.34;
  s.stripe.push({ geometry: new a.BoxGeometry(Rt + 0.02, i, st + 0.03), matrix: T(0, c, 0) }), s.stripe.push({ geometry: new a.BoxGeometry(Rt + 0.02, 0.07, st + 0.04), matrix: T(0, c - i / 2 - 0.055, 0) }), s.skirt.push({ geometry: new a.BoxGeometry(Rt - 0.3, 0.5, st - 0.34), matrix: T(0, Pt - 0.25, 0) }), s.skirt.push({ geometry: new a.BoxGeometry(Rt - 1.6, 0.28, st - 0.8), matrix: T(0, Pt - 0.52,
  0) });
  for (const d of [1, -1]) {
    for (const h of Qa) s.door.push({ geometry: new a.BoxGeometry(Za, zt - Pt - 0.12, 0.05), matrix: T(h, (Pt + zt) / 2 - 0.02, d * (st / 2 + 0.012)) }), s.dark.push({ geometry: new a.BoxGeometry(0.05, zt - Pt - 0.12, 0.06), matrix: T(h, (Pt + zt) / 2 - 0.02, d * (st / 2 + 0.02)) }), zo(n, h, 0.94, d, o);
    for (const [h, p] of Ja) s.metal.push({ geometry: new a.BoxGeometry(p + 0.12, 1.14, 0.035), matrix: T(h, 2.66, d * (st / 2 + 8e-3)) }), zo(n, h, p, d, o);
  }
  for (const d of [-6.3, 6.3]) s.metal.push({ geometry: new a.BoxGeometry(2.9, 0.42, st - 0.9), matrix: T(d, 0.78, 0) }), s.dark.push({ geometry: new a.BoxGeometry(3.3, 0.2, 0.28), matrix: T(d, 0.62, 0) });
  for (const d of [-5.6, -1.4, 3.2, 7.4]) s.roof.push({ geometry: new a.BoxGeometry(2.1, 0.3, 1.5), matrix: T(d, re + 0.13, d % 2 === 0 ? 0.18 : -0.18) });
  for (const d of [-8.2, 0.6, 8.6]) s.metal.push({ geometry: new a.BoxGeometry(0.7, 0.16, 0.7), matrix: T(d, re + 0.07, -0.7) });
  if (e || t) {
    const d = e ? 1 : -1, h = d * (Rt / 2);
    s.dark.push({ geometry: new a.BoxGeometry(0.1, 1.34, st - 0.22), matrix: T(h + d * 0.03, 2.86, 0) });
    for (const w of [-0.72, 0.72]) {
      const M = new a.Mesh(new a.PlaneGeometry(1.16, 1.02), W.window);
      M.position.set(h + d * 0.085, 2.88, w), M.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2, M.userData.noOutline = true, n.add(M);
      const G = new a.Mesh(new a.PlaneGeometry(0.3, 0.98), I({ color: 15003384, transparent: true, opacity: 0.16, depthWrite: false }));
      G.position.set(h + d * 0.095, 2.88, w - 0.26), G.rotation.set(0, d > 0 ? Math.PI / 2 : -Math.PI / 2, 0.26), G.userData.noOutline = true, n.add(G);
    }
    s.body.push({ geometry: new a.BoxGeometry(0.12, 1.4, 0.16), matrix: T(h + d * 0.05, 2.86, 0) });
    const p = new a.Mesh(new a.PlaneGeometry(1.5, 0.38), I({ color: 16777215, map: Pn(), cache: false }));
    p.position.set(h + d * 0.09, 3.52, 0), p.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2, p.userData.noOutline = true, n.add(p), s.dark.push({ geometry: new a.BoxGeometry(0.08, 0.5, 1.66), matrix: T(h + d * 0.04, 3.52, 0) });
    for (const w of [-1.06, 1.06]) {
      s.dark.push({ geometry: new a.BoxGeometry(0.14, 0.42, 0.5), matrix: T(h + d * 0.05, 1.55, w) });
      const M = new a.Mesh(new a.PlaneGeometry(0.34, 0.16), e ? W.headlight : W.tail);
      M.position.set(h + d * 0.13, 1.63, w), M.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2, M.userData.noOutline = true, n.add(M);
      const G = new a.Mesh(new a.PlaneGeometry(0.34, 0.14), e ? W.tail : W.headlight);
      G.position.set(h + d * 0.13, 1.44, w), G.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2, G.userData.noOutline = true, n.add(G);
    }
    s.skirt.push({ geometry: new a.BoxGeometry(0.34, 0.78, st - 0.5), matrix: T(h + d * 0.1, 0.82, 0) }), s.dark.push({ geometry: new a.BoxGeometry(0.5, 0.22, 0.34), matrix: T(h + d * 0.25, 0.62, 0) });
    const m = new a.Mesh(new a.PlaneGeometry(0.8, 0.24), I({ color: 16777215, map: Bn(), cache: false }));
    m.position.set(h - d * 1.4, 1.42, st / 2 + 0.02), m.userData.noOutline = true, n.add(m);
  }
  const l = { body: W.body, stripe: W.stripe, roof: W.roof, skirt: W.skirt, door: W.door, dark: W.dark, metal: W.metal };
  for (const d of Object.keys(s)) {
    if (!s[d].length) continue;
    const h = new a.Mesh(pt(s[d]), l[d]);
    h.castShadow = true, h.receiveShadow = true, n.add(h), (d === "body" || d === "roof" || d === "skirt") && wt(h, { thickness: 34e-4 });
  }
  const f = [], u = new a.CylinderGeometry(0.43, 0.43, 0.14, 12);
  u.rotateX(Math.PI / 2);
  for (const d of [-6.3, 6.3]) for (const h of [-1.05, 1.05]) for (const p of [-0.72, 0.72]) {
    const m = new a.Group();
    m.position.set(d + h, Fa + 0.43, p), m.userData.planetRigid = true;
    const w = new a.Group();
    m.add(w);
    const M = new a.Mesh(u, W.wheel);
    M.castShadow = true, w.add(M), f.push(w), n.add(m);
  }
  if (e || t) {
    const d = new a.Group();
    d.position.set(e ? -4 : 4, re + 0.05, 0), d.scale.y = (Ya - d.position.y) / 1.64, d.add(D(1.5, 0.08, 1.5, W.metal, 0, 0.04, 0));
    for (const h of [-1, 1]) {
      const p = D(0.06, 0.9, 0.06, W.metal, h * 0.35, 0.5, 0);
      p.rotation.z = h * 0.55, d.add(p);
      const m = D(0.05, 0.78, 0.05, W.metal, h * 0.0575, 1.247, 0);
      m.rotation.z = h * 0.148, d.add(m);
    }
    d.add(D(0.1, 0.06, 1.3, W.dark, 0, 1.6, 0)), d.add(D(0.24, 0.05, 1.34, W.metal, 0, 1.64, 0)), d.traverse((h) => {
      h.isMesh && (h.castShadow = true);
    }), n.add(d);
  }
  return { car: n, wheels: f };
}
function es(e) {
  Xa();
  const t = nt(5150), o = new a.Group();
  o.name = "train", o.visible = false, e.add(o);
  const n = [], s = [];
  for (let l = 0; l < 3; l++) {
    const { car: f, wheels: u } = ts({ cab: l === 0, tail: l === 2, rng: t });
    f.position.x = (l - 1) * Mo, o.add(f), s.push(f), n.push(...u);
  }
  const r = new a.Matrix4().makeTranslation(ot.x, ot.y, ot.z), c = new a.Matrix4().makeTranslation(-ot.x, -ot.y, -ot.z);
  return { group: o, cars: s, wheels: n, length: Mo * 3, dir: 1, x: 0, speed: 23.5, gust: 0, get offset() {
    return Qo(this.x, 0);
  }, planetize() {
    o.visible = true, o.matrixAutoUpdate = false, this.update(0);
  }, update(l) {
    this.x = gt(this.x + this.dir * this.speed * l), o.matrix.makeRotationZ(-this.x / Y).premultiply(r).multiply(c), o.matrixWorldNeedsUpdate = true;
    const f = this.speed * l / 0.43;
    for (const d of this.wheels) d.rotation.z -= f * this.dir;
    const u = Math.max(0, 1 - Math.abs(this.offset) / 46);
    this.gust = Math.max(this.gust * Math.exp(-l * 1.4), u * u);
  } };
}
const ie = 980, vo = 6.8, ye = -30, be = 34, Bt = 9.5;
function os(e) {
  const t = nt(8123), o = In(), n = new a.PlaneGeometry(0.185, 0.135), s = [{ color: b.petal, n: Math.round(ie * 0.55) }, { color: b.blossomLight, n: Math.round(ie * 0.28) }, { color: b.petalDeep, n: ie - Math.round(ie * 0.55) - Math.round(ie * 0.28) }], r = [], c = [];
  for (const p of s) {
    const m = I({ color: p.color, map: o, transparent: true, opacity: 0.95, depthWrite: false, side: a.DoubleSide, alphaTest: 0.32, cache: false }), w = new a.InstancedMesh(n, m, p.n);
    w.instanceMatrix.setUsage(a.DynamicDrawUsage), w.frustumCulled = false, w.renderOrder = 4, w.userData.noOutline = true, e.add(w), r.push(w);
    for (let M = 0; M < p.n; M++) c.push({ mesh: w, idx: M, x: t.range(-Bt, Bt), y: t.range(0.2, vo), z: t.range(ye, be), fall: t.range(0.42, 0.86), swayAmp: t.range(0.25, 0.75), swayFreq: t.range(0.5, 1.35), phase: t.range(0, 10), spin: new a.Vector3(t.range(-1, 1), t.range(-1, 1), t.range(-1, 1)).normalize(), spinRate: t.range(0.5, 2.4), angle: t.range(0, 6.28), scale: t.range(0.78, 1.25), drift: t.
    range(-0.16, 0.16) });
  }
  const i = new a.Object3D(), l = new a.Quaternion(), f = new a.Vector3();
  let u = 0;
  function d(p) {
    p.x = t.range(-Bt, Bt), p.z = t.range(ye, be), p.y = vo + t.range(0, 1.4), p.phase = t.range(0, 10);
  }
  function h(p, m, w) {
    u += p;
    const M = m * 5.4 * w, G = m * 1.5;
    for (let A = 0; A < c.length; A++) {
      const x = c[A], S = Math.sin(u * x.swayFreq + x.phase), y = Math.sin(u * x.swayFreq * 2.7 + x.phase * 1.7);
      x.y -= (x.fall + m * 0.4) * p, x.x += (x.swayAmp * S * 0.55 + x.drift + M * 0.24) * p, x.z += (x.swayAmp * y * 0.32 + M * 0.05) * p, x.y += G * Math.max(0, 1 - Math.abs(x.z) / 8) * p, x.angle += x.spinRate * p * (1 + m);
      const k = U(x.z);
      x.x < k - Bt && (x.x = k + Bt), x.x > k + Bt && (x.x = k - Bt), x.z < ye && (x.z = be), x.z > be && (x.z = ye), x.y < et(x.z) + 0.04 && d(x), l.setFromAxisAngle(x.spin, x.angle), i.position.set(x.x, x.y, x.z), i.quaternion.copy(l), f.setScalar(x.scale), i.scale.copy(f), i.updateMatrix(), x.mesh.setMatrixAt(x.idx, i.matrix);
    }
    for (const A of r) A.instanceMatrix.needsUpdate = true;
  }
  for (let p = 0; p < 40; p++) h(0.1, 0, 1);
  return ns(e, o), { update: h, meshes: r };
}
function ns(e, t) {
  const o = nt(4471), n = new a.PlaneGeometry(0.17, 0.125);
  n.rotateX(-Math.PI / 2);
  const s = [b.petal, b.blossomLight, b.petalDeep], r = [[], [], []], c = new a.Object3D(), i = (l, f, u) => {
    c.position.set(l, u + 0.019, f), c.rotation.set(0, o.range(0, 6.28), 0);
    const d = o.range(0.8, 1.25);
    c.scale.set(d, 1, d), c.updateMatrix(), r[o.int(0, 2)].push(c.matrix.clone());
  };
  for (let l = 0; l < 620; l++) {
    const f = o.range(-26, 32), u = U(f), d = et(), h = o.next();
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
  r.forEach((l, f) => {
    if (!l.length) return;
    const u = new a.InstancedMesh(n, I({ color: s[f], map: t, transparent: true, opacity: 0.9, depthWrite: false, alphaTest: 0.32, cache: false }), l.length);
    l.forEach((d, h) => u.setMatrixAt(h, d)), u.renderOrder = 2, u.userData.noOutline = true, e.add(u);
  });
}
const Oe = /* @__PURE__ */ new Map();
function Ae(e, t, o, n) {
  if (Oe.has(e)) return Oe.get(e);
  const s = document.createElement("canvas");
  s.width = t, s.height = o, n(s.getContext("2d"), t, o);
  const r = new a.CanvasTexture(s);
  return r.colorSpace = a.SRGBColorSpace, r.anisotropy = 4, Oe.set(e, r), r;
}
const fn = "'Segoe UI', 'Noto Sans', system-ui, sans-serif", as = `'Noto Sans Telugu', 'Gautami', ${fn}`;
function Kt(e, t, o, n, s, r, c, i = 700, l = fn) {
  let f = Math.min(r, 100);
  e.textAlign = "center", e.textBaseline = "middle";
  do
    e.font = `${i} ${f}px ${l}`, f -= 2;
  while (e.measureText(t).width > s && f > 8);
  e.fillStyle = c, e.fillText(t, o, n);
}
function ss(e, { bg: t = "#1d4e9c", fg: o = "#ffffff", name: n, telugu: s = "", strip: r = null }) {
  return Ae("fascia:" + e, 512, 128, (c, i, l) => {
    c.fillStyle = t, c.fillRect(0, 0, i, l), c.strokeStyle = "rgba(0,0,0,.35)", c.lineWidth = 6, c.strokeRect(4, 4, i - 8, l - 8), s ? (Kt(c, s, i / 2, l * 0.28, i - 40, 40, o, 700, as), Kt(c, n, i / 2, l * 0.7, i - 40, 44, o, 800)) : Kt(c, n, i / 2, l * 0.5, i - 40, 52, o, 800), r && (c.fillStyle = r, c.fillRect(0, l - 10, i, 10)), c.fillStyle = "rgba(255,255,255,.05)", c.fillRect(i * 0.12, l * 0.1,
    i * 0.3, 6), c.fillRect(i * 0.55, l * 0.86, i * 0.35, 5);
  });
}
function rs() {
  return Ae("busStop", 512, 192, (e, t, o) => {
    e.fillStyle = "#f4ede0", e.fillRect(0, 0, t, o), e.fillStyle = "#1d4e9c", e.fillRect(0, 0, t, 62), Kt(e, "BUS STOP", t / 2, 32, t - 40, 40, "#ffffff", 800), Kt(e, "NALLAKUNTA", t / 2, 96, t - 40, 44, "#22303f", 800), Kt(e, "107 \xB7 113 \xB7 116J", t / 2, 152, t - 40, 36, "#8a3b2f", 700);
  });
}
function is() {
  return Ae("roadName", 512, 128, (e, t, o) => {
    e.fillStyle = "#0f3d22", e.fillRect(0, 0, t, o), e.strokeStyle = "#f4ede0", e.lineWidth = 5, e.strokeRect(6, 6, t - 12, o - 12), Kt(e, "NALLAKUNTA MAIN ROAD", t / 2, o / 2, t - 44, 46, "#f4ede0", 800);
  });
}
function cs() {
  return ls("divider", 128, 32, (e, t, o) => {
    e.fillStyle = "#f2c53d", e.fillRect(0, 0, t, o), e.fillStyle = "#2b2b30";
    for (let n = -1; n < 4; n++) e.beginPath(), e.moveTo(n * 40, o), e.lineTo(n * 40 + 20, 0), e.lineTo(n * 40 + 40, 0), e.lineTo(n * 40 + 20, o), e.closePath(), e.fill();
  });
}
function ls(e, t, o, n) {
  const s = Ae(e, t, o, n);
  return s.wrapS = s.wrapT = a.RepeatWrapping, s;
}
function ds(e) {
  const t = new a.Group();
  t.name = "mainRoad", e.add(t);
  const o = g({ color: b.road, bands: 3, tint: 7036528, flat: false }), n = g({ color: b.sidewalk, bands: 3, tint: 8022642, flat: false }), s = g({ color: b.sidewalkAlt, bands: 3, tint: 8022642, flat: false }), r = g({ color: b.curb, bands: 2, tint: 7036528 }), c = g({ color: 13218452, bands: 3, tint: 9072478, flat: false }), i = 0.012;
  for (const [l, f] of [[_t, -It], [It, Nt]]) {
    const u = Xt({ z0: l, z1: f, step: 1.6, a: (h) => ({ x: U(h) - V, y: i }), b: (h) => ({ x: U(h) + V, y: i }) }), d = new a.Mesh(u, o);
    d.receiveShadow = true, t.add(d);
  }
  {
    const l = cs(), f = new a.MeshBasicMaterial({ map: l, transparent: false });
    for (const [u, d] of [[_t, -It], [It, Nt]]) {
      const h = Xt({ z0: u, z1: d, step: 1.6, a: (m) => ({ x: U(m) - 0.14, y: i + 4e-3 }), b: (m) => ({ x: U(m) + 0.14, y: i + 4e-3 }), uv: [0.55, 2.2] }), p = new a.Mesh(h, f);
      p.userData.noShadow = true, t.add(p);
    }
  }
  for (const l of [-1, 1]) for (const [f, u] of [[_t, -It], [It, Nt]]) {
    const d = (A) => U(A) + l * V, h = (A) => U(A) + l * (V + K), p = Xt({ z0: f, z1: u, step: 1.6, a: (A) => ({ x: d(A), y: Lt }), b: (A) => ({ x: h(A), y: Lt }) }), m = new a.Mesh(p, l < 0 ? n : s);
    m.receiveShadow = true, t.add(m);
    const w = Xt({ z0: f, z1: u, step: 1.6, a: (A) => ({ x: d(A), y: 0 }), b: (A) => ({ x: d(A), y: Lt }), flip: l > 0 }), M = new a.Mesh(w, r);
    t.add(M);
    const G = Xt({ z0: f, z1: u, step: 1.6, a: (A) => ({ x: h(A), y: -0.02 }), b: (A) => ({ x: h(A), y: Lt }), flip: l < 0 });
    t.add(new a.Mesh(G, r));
  }
  for (const l of [-1, 1]) {
    const f = Xt({ z0: _t, z1: Nt, step: 2, a: (d) => ({ x: U(d) + l * (V + K), y: 4e-3 }), b: (d) => ({ x: U(d) + l * (V + K + 3.4), y: 4e-3 }) }), u = new a.Mesh(f, c);
    u.receiveShadow = true, t.add(u);
  }
  return t;
}
const Ke = V + K + 0.55, _ = {};
function un() {
  return _.done || (_.done = true, _.walls = [15983816, 15258542, 14673106, 15784128, 15129796, 14213348, 15653304, 14995392].map((e) => g({ color: e, bands: 3, tint: 9072480 })), _.trim = g({ color: 11573888, bands: 2, tint: 7035472 }), _.roof = g({ color: 12101776, bands: 3, tint: 7035472 }), _.roofDark = g({ color: 9075302, bands: 3, tint: 5983298 }), _.door = g({ color: 6047282, bands: 2, tint: 3812904 }),
  _.shutter = g({ color: 8226964, bands: 3, tint: 5265003 }), _.glass = I({ color: 4872816 }), _.grill = g({ color: 4934482, bands: 2, tint: 3816010 }), _.tank = g({ color: 3026483, bands: 3, tint: 3816010 }), _.awningA = g({ color: 13126460, bands: 3, tint: 8010298 }), _.awningB = g({ color: 3112299, bands: 3, tint: 2771530 }), _.ac = g({ color: 14210508, bands: 2, tint: 9079446 })), _;
}
function ko(e, t) {
  const o = t.side || 1;
  un();
  const n = new a.Group(), { x: s, z: r, w: c, d: i, h: l, sign: f } = t, u = _.walls[t.wall % _.walls.length], d = new a.Mesh(new a.BoxGeometry(i, l, c), u);
  d.position.set(s - o * i / 2, l / 2, r), n.add(d);
  const h = new a.Mesh(new a.BoxGeometry(i + 0.15, 0.42, c + 0.15), _.trim);
  h.position.set(s - o * i / 2, l + 0.18, r), n.add(h);
  const p = new a.Mesh(new a.CylinderGeometry(0.55, 0.55, 0.9, 12), _.tank);
  p.position.set(s - o * (i / 2 - 0.6), l + 0.85, r - c * 0.22), n.add(p);
  const m = new a.Mesh(new a.SphereGeometry(0.34, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), _.ac);
  if (m.rotation.x = Math.PI / 3, m.position.set(s - o * (i / 2 + 0.8), l + 0.55, r + c * 0.25), n.add(m), f) {
    const y = ss(f.key, f), k = [_.trim, _.trim, _.trim, _.trim, _.trim, _.trim];
    k[o > 0 ? 0 : 1] = new a.MeshBasicMaterial({ map: y });
    const P = new a.Mesh(new a.BoxGeometry(0.12, 1, c * 0.92), k);
    P.position.set(s + o * 0.06, l - 1.45, r), n.add(P);
  }
  const w = c * 0.44, M = new a.Mesh(new a.BoxGeometry(0.08, 2.3, w), _.shutter);
  M.position.set(s + o * 0.02, 1.15, r - c * 0.18), n.add(M);
  for (let y = 0; y < 6; y++) {
    const k = new a.Mesh(new a.BoxGeometry(0.03, 0.035, w), _.grill);
    k.position.set(s + o * 0.07, 0.45 + y * 0.36, r - c * 0.18), n.add(k);
  }
  const G = new a.Mesh(new a.BoxGeometry(0.08, 2.1, c * 0.26), _.door);
  if (G.position.set(s + o * 0.02, 1.05, r + c * 0.24), n.add(G), t.awning) {
    const y = new a.Mesh(new a.BoxGeometry(1.5, 0.06, c * 0.8), t.awning === "a" ? _.awningA : _.awningB);
    y.rotation.z = -0.28 * o, y.position.set(s + o * 0.72, 2.62, r), n.add(y);
  }
  for (const y of [-c * 0.22, c * 0.22]) {
    const k = new a.Mesh(new a.BoxGeometry(0.06, 1.15, 0.95), _.glass);
    k.position.set(s + o * 0.03, l - 2.6, r + y), n.add(k);
    for (let P = -2; P <= 2; P++) {
      const v = new a.Mesh(new a.BoxGeometry(0.02, 1.15, 0.035), _.grill);
      v.position.set(s + o * 0.06, l - 2.6, r + y + P * 0.19), n.add(v);
    }
  }
  const A = new a.Mesh(new a.BoxGeometry(0.32, 0.5, 0.7), _.ac);
  A.position.set(s + o * 0.18, l - 0.65, r - c * 0.34), n.add(A), At(n), e.add(n);
  const x = o > 0 ? s - i : s, S = o > 0 ? s : s + i;
  return e.collide(x, r - c / 2, S, r + c / 2, l), n;
}
function fs(e, t) {
  un();
  const o = new a.Group(), { x: n, z: s, w: r, d: c, h: i } = t, l = _.walls[t.wall % _.walls.length], f = new a.Mesh(new a.BoxGeometry(c, i, r), l);
  if (f.position.set(n - c / 2, i / 2, s), o.add(f), t.roof === "slope") {
    const d = new a.Mesh(new a.CylinderGeometry(0.02, r * 0.62, 1.15, 4, 1), _.roofDark);
    d.rotation.y = Math.PI / 4, d.scale.z = c / (r * 0.62) * 0.5, d.position.set(n - c / 2, i + 0.56, s), o.add(d);
  } else {
    const d = new a.Mesh(new a.BoxGeometry(c + 0.14, 0.36, r + 0.14), _.trim);
    d.position.set(n - c / 2, i + 0.15, s), o.add(d);
    const h = new a.Mesh(new a.CylinderGeometry(0.5, 0.5, 0.8, 10), _.tank);
    h.position.set(n - c / 2 + 0.5, i + 0.75, s - r * 0.2), o.add(h);
  }
  const u = new a.Mesh(new a.BoxGeometry(0.07, 1.9, 0.9), _.door);
  u.position.set(n + 0.035, 0.95, s + r * 0.18), o.add(u);
  for (const d of [-r * 0.22]) {
    const h = new a.Mesh(new a.BoxGeometry(0.06, 1, 0.9), _.glass);
    h.position.set(n + 0.03, 1.55, s + d), o.add(h);
    for (let p = -2; p <= 2; p++) {
      const m = new a.Mesh(new a.BoxGeometry(0.02, 1, 0.03), _.grill);
      m.position.set(n + 0.055, 1.55, s + d + p * 0.18), o.add(m);
    }
  }
  return At(o), e.add(o), e.collide(n - c, s - r / 2, n, s + r / 2, i), o;
}
const us = [{ key: "pharmacy", name: "SAINCE PHARMACY", telugu: "", bg: "#0d7a4d", fg: "#ffffff" }, { key: "dental", name: "M K DENTAL LAB", telugu: "", bg: "#27407a", fg: "#e8e4d8" }, { key: "courier", name: "INTERNATIONAL COURIER & CARGO", telugu: "", bg: "#8a1f1f", fg: "#ffd94d" }, null, null, null, null, null];
function hs(e) {
  let t = 6;
  us.forEach((s, r) => {
    ko(e, { x: U(t + 5 / 2) + Ke, z: t + 5 / 2, w: 5, d: 7.2, h: r % 3 === 2 ? 4.6 : 6.4, wall: r, sign: s, awning: r % 2 === 0 ? "a" : r % 3 === 0 ? "b" : null, side: -1 }), t += 5 + 0.15;
  });
  const o = [{ key: "tiffins", name: "SRI SIDDHARTHA TIFFIN CENTRE", telugu: "\u0C1F\u0C3F\u0C2B\u0C3F\u0C28\u0C4D \u0C38\u0C46\u0C02\u0C1F\u0C30\u0C4D", bg: "#b3312c", fg: "#ffffff" }, { key: "textiles", name: "DIWAN TEXTILES", telugu: "", bg: "#5b2d8e", fg: "#f4e28a" }];
  let n = 42;
  o.forEach((s, r) => {
    ko(e, { x: U(n + 5 / 2) - Ke - 3.6, z: n + 5 / 2, w: 5, d: 7.2, h: 4.6, wall: r + 2, sign: s, awning: r === 0 ? "b" : null, side: 1 }), n += 5 + 0.15;
  });
}
function ps(e) {
  const t = [{ x: -1, z: -10, w: 7, d: 6.5, h: 3.6, wall: 1, roof: "flat" }, { x: -1, z: -19, w: 6, d: 7, h: 4.8, wall: 3, roof: "slope" }, { x: -1, z: -28, w: 8, d: 7, h: 3.4, wall: 5, roof: "flat" }, { x: -1, z: -38, w: 6.5, d: 6.5, h: 4.2, wall: 2, roof: "flat" }, { x: -1, z: -52, w: 7.5, d: 7, h: 3.8, wall: 6, roof: "slope" }, { x: 1, z: -12, w: 6.5, d: 7, h: 3.5, wall: 4, roof: "flat" }, { x: 1,
  z: -24, w: 7, d: 6.5, h: 5.2, wall: 0, roof: "flat" }, { x: 1, z: -34, w: 6, d: 7, h: 3.6, wall: 7, roof: "slope" }, { x: 1, z: -48, w: 7, d: 7, h: 4.4, wall: 2, roof: "flat" }, { x: 1, z: 52, w: 7, d: 7, h: 4, wall: 1, roof: "flat" }, { x: 1, z: 62, w: 6.5, d: 6.5, h: 3.5, wall: 3, roof: "slope" }, { x: -1, z: 58, w: 7, d: 7, h: 4.6, wall: 0, roof: "flat" }];
  for (const o of t) {
    const n = U(o.z) + o.x * (Ke + 3.4);
    fs(e, { ...o, x: n });
  }
}
const So = V + K + 0.65, ce = 13, le = 41, J = 27, vt = 1.5;
function ms() {
  const e = document.createElement("canvas");
  e.width = 512, e.height = 256;
  const t = e.getContext("2d");
  t.fillStyle = "#d8622a", t.fillRect(0, 0, 512, 256), t.fillStyle = "#1f3a7a", t.fillRect(0, 0, 512, 18), t.fillStyle = "#d8a83c", t.fillRect(0, 18, 512, 8), t.fillStyle = "#1f3a7a", t.fillRect(0, 230, 512, 26), t.fillStyle = "#d8a83c", t.fillRect(0, 222, 512, 8), t.fillStyle = "#14306e", t.textAlign = "center", t.textBaseline = "middle", t.font = 'bold 64px "Noto Sans Telugu", sans-serif', t.fillText(
  "\u0C36\u0C43\u0C02\u0C17\u0C47\u0C30\u0C3F \u0C36\u0C02\u0C15\u0C30 \u0C2E\u0C20\u0C02", 256, 108), t.font = 'bold 34px "Noto Sans Telugu", sans-serif', t.fillText("\xB7 \u0C28\u0C32\u0C4D\u0C32\u0C15\u0C41\u0C02\u0C1F \xB7", 256, 178);
  const o = new a.CanvasTexture(e);
  return o.colorSpace = a.SRGBColorSpace, o;
}
function xs() {
  const e = document.createElement("canvas");
  e.width = e.height = 256;
  const t = e.getContext("2d");
  t.clearRect(0, 0, 256, 256), t.fillStyle = "rgba(255,255,255,0.92)";
  const o = (s, r, c = 3.2) => {
    t.beginPath(), t.arc(s, r, c, 0, 7), t.fill();
  };
  for (let s = 0; s < 9; s++) for (let r = 0; r < 9; r++) o(28 + s * 25 + (r % 2 ? 12 : 0), 28 + r * 25);
  t.strokeStyle = "rgba(255,255,255,0.9)", t.lineWidth = 4, t.beginPath(), t.moveTo(128, 12), t.lineTo(244, 128), t.lineTo(128, 244), t.lineTo(12, 128), t.closePath(), t.stroke();
  const n = new a.CanvasTexture(e);
  return n.colorSpace = a.SRGBColorSpace, n;
}
function ws(e) {
  const t = new a.Group();
  t.name = "shankarMutt", e.add(t);
  const o = U(J), n = o - So, s = o - So - 17, r = g({ color: 15327172, bands: 3, tint: 9077362 }), c = g({ color: 13194015, bands: 3, tint: 7027252 }), i = g({ color: 14180906, bands: 3, tint: 8010272 }), l = g({ color: 14715482, bands: 3, tint: 9062960 }), f = g({ color: 14198844, bands: 3, tint: 9071146, emissive: 6901268, emissiveIntensity: 0.25 }), u = I({ color: 1511435 }), d = g({ color: 11911876,
  bands: 3, tint: 6978172 }), h = 2.05, p = [{ x0: n, z0: ce, x1: n + 0.35, z1: J - vt }, { x0: n, z0: J + vt, x1: n + 0.35, z1: le }, { x0: s, z0: ce, x1: s + 0.35, z1: le }, { x0: s, z0: ce, x1: n + 0.35, z1: ce + 0.35 }, { x0: s, z0: le - 0.35, x1: n + 0.35, z1: le }];
  for (const v of p) {
    const z = Math.max(v.x1 - v.x0, 0.35), R = Math.max(v.z1 - v.z0, 0.35), O = new a.Mesh(new a.BoxGeometry(z, h, R), r);
    O.position.set((v.x0 + v.x1) / 2, h / 2, (v.z0 + v.z1) / 2), t.add(O);
    const H = new a.Mesh(new a.BoxGeometry(z + 0.08, 0.2, R + 0.08), c);
    H.position.set((v.x0 + v.x1) / 2, h - 0.1, (v.z0 + v.z1) / 2), t.add(H), e.collide(v.x0 - 0.05, v.z0 - 0.05, v.x1 + 0.05, v.z1 + 0.05, h);
  }
  const m = [12729198, 14198844, 14180906, 8954040];
  [[16.5, 0, 1], [20.5, 1, 0.85], [33.5, 2, 0.95], [37.2, 3, 0.8]].forEach(([v, z, R], O) => {
    const H = new a.Mesh(new a.PlaneGeometry(0.8, R), new a.MeshBasicMaterial({ color: m[z] }));
    H.rotation.y = Math.PI / 2, H.position.set(n + 0.37, 1.05 + O % 2 * 0.15, v), t.add(H);
    const C = new a.Mesh(new a.PlaneGeometry(0.6, R * 0.3), new a.MeshBasicMaterial({ color: 15853776 }));
    C.rotation.y = Math.PI / 2, C.position.set(n + 0.375, 1 + O % 2 * 0.15, v), t.add(C);
  });
  for (const v of [-1, 1]) {
    const z = J + v * (vt + 0.5), R = new a.Mesh(new a.BoxGeometry(0.95, 3.2, 0.95), i);
    R.position.set(n + 0.18, 1.6, z), t.add(R);
    const O = new a.Mesh(new a.BoxGeometry(1.15, 0.22, 1.15), c);
    O.position.set(n + 0.18, 3.3, z), t.add(O), e.collide(n - 0.28, z - 0.5, n + 0.66, z + 0.5, 3.3);
  }
  const w = new a.Mesh(new a.BoxGeometry(0.8, 0.55, vt * 2 + 2.9), i);
  w.position.set(n + 0.18, 3.66, J), t.add(w);
  const M = new a.Mesh(new a.CircleGeometry(vt + 0.4, 24, 0, Math.PI), new a.MeshBasicMaterial({ map: ms() }));
  M.rotation.y = Math.PI / 2, M.position.set(n + 0.6, 3.9, J), t.add(M);
  const G = [[0, 5.6], [-0.85, 4.62], [0.85, 4.62], [-1.75, 4.15], [1.75, 4.15]];
  for (const [v, z] of G) {
    const R = new a.Mesh(new a.SphereGeometry(0.19, 10, 8), l);
    R.position.set(n + 0.5, z, J + v), R.scale.y = 1.25, t.add(R);
  }
  const A = new a.Mesh(new a.SphereGeometry(0.14, 8, 6), f);
  A.position.set(n + 0.5, 5.85, J), t.add(A);
  const x = new a.Mesh(new a.PlaneGeometry(vt * 2, 3), u);
  x.rotation.y = Math.PI / 2, x.position.set(n - 0.55, 1.5, J), t.add(x);
  const S = new a.Mesh(new a.BoxGeometry(1.1, 0.07, vt * 2), u);
  S.position.set(n - 0.1, 0.035, J), t.add(S), e.collide(n - 0.4, J - vt, n + 0.55, J + vt, 3.2);
  const y = new a.Mesh(new a.BoxGeometry(8.5, 4.4, 10), d);
  y.position.set(s + 6.5, 2.2, J + 1.5), t.add(y);
  const k = new a.Mesh(new a.BoxGeometry(8.7, 0.3, 10.2), c);
  k.position.set(s + 6.5, 4.35, J + 1.5), t.add(k);
  for (const [v, z, R] of [[s + 2.5, ce + 3.5, 2.6], [n - 6.5, le - 2.2, 2.1]]) {
    const O = new a.Mesh(new a.CylinderGeometry(0.22, 0.3, 3.4, 8), g({ color: 5916210, bands: 3, tint: 3812898 }));
    O.position.set(v, 1.7, z), t.add(O);
    const H = new a.Mesh(new a.IcosahedronGeometry(R, 1), g({ color: 4156229, bands: 3, tint: 2771506 }));
    H.position.set(v, 3.3 + R * 0.7, z), H.scale.y = 0.82, t.add(H);
  }
  const P = new a.Mesh(new a.PlaneGeometry(2.3, 2.3), new a.MeshBasicMaterial({ map: xs(), transparent: true, depthWrite: false }));
  return P.rotation.x = -Math.PI / 2, P.position.set(n + 1.9, 0.062, J), P.renderOrder = 2, t.add(P), At(t), { gatePos: { x: n + 0.6, z: J } };
}
const at = {};
function hn() {
  return at.pole || (at.pole = g({ color: 14078680, bands: 3, tint: 6972040 }), at.metal = g({ color: b.metal, bands: 3, tint: 6709392 }), at.metalDark = g({ color: b.metalDark, bands: 3, tint: 6051456 }), at.dark = g({ color: b.black, bands: 2, tint: 4932960 }), at.wire = g({ color: 4998744, bands: 2, tint: 4275288 }), at.red = g({ color: b.red, bands: 3, tint: 8011872 }), at.white = g({ color: b.
  wallWhite, bands: 3, tint: 7301008 }), at.concrete = g({ color: b.concrete, bands: 3, tint: 7301008 }), at.concreteMid = g({ color: b.concreteMid, bands: 3, tint: 6972040 }), at.terracotta = g({ color: 12941914, bands: 3, tint: 7296640 }), at.leaf = g({ color: b.leaf, bands: 3, tint: 5992332 }), at.leafDeep = g({ color: b.leafDeep, bands: 3, tint: 5992332 })), at;
}
function ys(e = {}) {
  const t = hn(), o = nt(e.seed ?? 5), n = new a.Group(), s = e.h ?? 9.2, r = { pole: [], metal: [], dark: [], white: [] }, c = (d, h, p) => r[d].push({ geometry: h, matrix: p });
  c("pole", new a.CylinderGeometry(0.11, 0.19, s, 8), T(0, s / 2, 0)), c("pole", new a.CylinderGeometry(0.24, 0.28, 0.22, 8), T(0, 0.11, 0));
  const i = e.armYs ?? [s - 0.55, s - 1.5], l = e.armDir ?? 1;
  if (i.forEach((d, h) => {
    const p = h === 0 ? 2.1 : 1.7;
    c("dark", new a.BoxGeometry(0.09, 0.1, p), T(0, d, 0)), c("metal", new a.BoxGeometry(0.06, 0.5, 0.06), T(0, d - 0.3, 0));
    for (let m = -1; m <= 1; m++) m === 0 && h === 1 || (c("white", new a.CylinderGeometry(0.06, 0.075, 0.16, 7), T(0, d + 0.13, m * p / 2.4)), c("metal", new a.CylinderGeometry(0.02, 0.02, 0.14, 5), T(0, d + 0.04, m * p / 2.4)));
  }), e.transformer !== false) {
    const d = s - 2.9;
    c("metal", new a.BoxGeometry(0.5, 0.14, 1.5), T(l * 0.34, d + 0.62, 0));
    for (const h of [-0.42, 0.42]) c("metal", new a.CylinderGeometry(0.24, 0.24, 0.72, 10), T(l * 0.34, d + 0.24, h)), c("metal", new a.CylinderGeometry(0.26, 0.26, 0.06, 10), T(l * 0.34, d + 0.62, h));
    c("dark", new a.BoxGeometry(0.28, 0.5, 0.28), T(-l * 0.24, d + 1.1, 0));
  }
  c("dark", new a.CylinderGeometry(0.045, 0.045, s - 1.4, 5), T(l * 0.135, (s - 1.4) / 2, 0.06));
  const f = new a.Mesh(new a.CylinderGeometry(0.205, 0.21, 0.62, 12, 1, true, -1, 2), I({ color: 16777215, map: Ko(o.int(0, 2)), cache: false, side: a.DoubleSide }));
  if (f.position.set(0, 2.45, 0), f.rotation.y = e.plateFace ?? (l > 0 ? Math.PI / 2 : -Math.PI / 2), f.castShadow = true, n.add(f), e.lamp) {
    c("metal", new a.CylinderGeometry(0.05, 0.05, 1.3, 6), T(l * 0.65, s - 3.9, 0, 0, 0, Math.PI / 2));
    const d = new a.Mesh(new a.ConeGeometry(0.32, 0.26, 12, 1, true), t.metal);
    d.position.set(l * 1.28, s - 4.02, 0), n.add(d);
    const h = D(0.26, 0.05, 0.26, I({ color: 16773840 }), l * 1.28, s - 4.16, 0);
    n.add(h);
  }
  const u = { pole: t.pole, metal: t.metal, dark: t.dark, white: t.white };
  for (const d of Object.keys(r)) {
    if (!r[d].length) continue;
    const h = new a.Mesh(pt(r[d]), u[d]);
    h.castShadow = true, h.receiveShadow = true, n.add(h), d === "pole" && wt(h, { thickness: 34e-4 });
  }
  return n.position.set(e.x, e.y ?? 0, e.z), n.userData.top = (e.y ?? 0) + s, n;
}
function bs(e, t) {
  const o = hn(), n = [];
  for (const c of t) {
    const { points: i, sag: l = 0.5, r: f = 0.026 } = c;
    for (let u = 0; u < i.length - 1; u++) {
      const d = i[u], h = i[u + 1], p = d.distanceTo(h), m = _n(d, h, l * Math.min(1.6, p / 14), 12);
      n.push(new a.TubeGeometry(m, 14, f, 4, false));
    }
  }
  if (!n.length) return null;
  const s = n.length === 1 ? n[0] : pt(n.map((c) => ({ geometry: c }))), r = new a.Mesh(s, o.wire);
  return r.name = "wires", r.material = o.wire, e.add(r), n.forEach((c) => c !== s && c.dispose()), r;
}
const Et = (e, t, o = 0) => new a.Vector3(e, t, o), gs = 0.018;
Et(-0.52, 0.33 + gs), Et(0.55, 0.33), Et(-0.1, 0.28), Et(-0.27, 0.86), Et(0.44, 0.6), Et(0.49, 0.86), Et(0.46, 0.97), Et(-0.31, 1);
function Ms(e) {
  const t = nt(9021), o = [], n = [];
  for (let c = -70; c <= 72; c += 15.5) n.push(c + t.range(-1.2, 1.2));
  let s = -1;
  for (const c of n) {
    if (Math.abs(c) < 5.5) continue;
    const i = U(c) + s * (V + K - 0.28), l = ys({ seed: c * 31 | 0, h: 8.6, armDir: -s });
    l.position.set(i, e.groundAt(i, c), c), e.add(l), At(l), e.collide(i - 0.22, c - 0.22, i + 0.22, c + 0.22, 8.6), o.push({ x: i, z: c, side: s }), s = -s;
  }
  const r = [];
  for (const c of [-1, 1]) {
    const i = o.filter((l) => l.side === c);
    for (const l of [0, -0.9]) {
      const f = i.map((u) => new a.Vector3(u.x, e.groundAt(u.x, u.z) + 8 + l, u.z));
      f.length > 1 && r.push({ points: f, sag: 0.55 });
    }
  }
  for (const c of [10, 26, 44, -16, -34]) {
    const i = U(c);
    r.push({ points: [new a.Vector3(i - (V + K - 0.28), 8.1, c), new a.Vector3(i + (V + K + 2.6), 6.4, c + 0.8)], sag: 0.7 });
  }
  r.push({ points: [new a.Vector3(U(-24) - 4.4, 7.9, -24), new a.Vector3(U(-6) - 4.5, 4.6, -6)], sag: 0.9 }), bs(e, r);
}
function zs(e) {
  const t = new a.Group(), o = -14, n = U(o) + V + K - 0.2, s = g({ color: 4877964, bands: 3, tint: 3820126 }), r = g({ color: 3626606, bands: 3, tint: 3029582 });
  for (const f of [-1.6, 1.6]) {
    const u = new a.Mesh(new a.CylinderGeometry(0.06, 0.06, 2.5, 8), s);
    u.position.set(n, 1.25, o + f), t.add(u);
  }
  const c = new a.Mesh(new a.BoxGeometry(1.7, 0.08, 4), r);
  c.rotation.z = -0.06, c.position.set(n - 0.3, 2.52, o), t.add(c);
  const i = new a.Mesh(new a.BoxGeometry(0.45, 0.08, 3.2), g({ color: 9071176, bands: 2, tint: 5916214 }));
  i.position.set(n + 0.35, 0.55, o), t.add(i);
  for (const f of [-1.3, 1.3]) {
    const u = new a.Mesh(new a.BoxGeometry(0.4, 0.5, 0.08), s);
    u.position.set(n + 0.35, 0.3, o + f), t.add(u);
  }
  const l = new a.Mesh(new a.BoxGeometry(0.06, 0.75, 2), (() => {
    const f = new a.MeshBasicMaterial({ map: rs() });
    return [s, s, s, s, f, s];
  })());
  return l.position.set(n - 0.75, 1.9, o), l.rotation.y = Math.PI, t.add(l), At(t), e.add(t), e.collide(n - 0.6, o - 1.8, n + 0.6, o + 1.8, 2.4, 0.9), { pos: { x: n - 1.2, z: o } };
}
function vs(e) {
  const t = g({ color: 7039858, bands: 2, tint: 3816010 });
  for (const { z: o, side: n } of [{ z: 45, side: -1 }, { z: -20, side: 1 }]) {
    const s = U(o) + n * (V + K + 0.15), r = new a.Mesh(new a.CylinderGeometry(0.05, 0.05, 2.9, 8), t);
    r.position.set(s, e.groundAt(s, o) + 1.45, o), e.add(r);
    const c = new a.MeshBasicMaterial({ map: is() }), i = new a.Mesh(new a.BoxGeometry(0.05, 0.5, 2.2), [t, t, t, t, c, t]);
    i.position.set(s, 2.75, o), e.add(i), e.collide(s - 0.12, o - 0.12, s + 0.12, o + 0.12, 2.9);
  }
}
function ks(e, t = 1) {
  const o = new a.Group(), n = g({ color: 7230272, bands: 3, tint: 4864560 }), s = [5214047, 6265940, 4161359], r = 2.6 * t, c = new a.Mesh(new a.CylinderGeometry(0.14 * t, 0.24 * t, r, 7), n);
  c.position.y = r / 2, o.add(c);
  const i = e.int(3, 5);
  for (let l = 0; l < i; l++) {
    const f = e.range(0.9, 1.5) * t, u = new a.Mesh(new a.IcosahedronGeometry(f, 1), g({ color: e.pick(s), bands: 3, tint: 3825482 }));
    u.position.set(e.range(-0.8, 0.8) * t, r + e.range(-0.2, 0.9) * t, e.range(-0.8, 0.8) * t), u.scale.y = 0.72, o.add(u);
  }
  return At(o), o;
}
function Ss(e) {
  const t = nt(777), o = [{ x: -10.5, z: 20, s: 1.5, c: true }, { x: -13.5, z: 34, s: 1.35, c: true }, { x: -5.85, z: 22.5, s: 1.25, c: true }, { x: -5.7, z: -14, s: 1.1, c: true }, { x: V + K + 1.1, z: -27, s: 1, c: true }, { x: -5.9, z: -44, s: 1.2, c: true }, { x: V + K + 1, z: -58, s: 1, c: true }, { x: V + K + 1.2, z: 50, s: 1.1, c: true }, { x: -5.7, z: 52.5, s: 0.95, c: true }, { x: V + K +
  1.3, z: 66, s: 1.15, c: true }];
  for (const n of o) {
    const s = U(n.z) + n.x, r = ks(t, n.s);
    r.position.set(s, e.groundAt(s, n.z), n.z), e.add(r), n.c && e.collide(s - 0.26, n.z - 0.26, s + 0.26, n.z + 0.26, 2.4);
  }
}
function Gs(e) {
  const t = new a.Group(), o = g({ color: 9071170, bands: 3, tint: 4864548 }), n = g({ color: 10123850, bands: 3, tint: 5916208 }), s = [4160053, 14186274, 11743532, 5909867, 8034874, 14201402], r = [{ z: 31.5, tarp: 2775706 }, { z: 35.4, tarp: 3832394 }];
  for (const c of r) {
    const i = U(c.z) - (V + K - 1);
    for (const [h, p] of [[-0.8, -1], [0.8, -1], [-0.8, 1], [0.8, 1]]) {
      const m = new a.Mesh(new a.CylinderGeometry(0.045, 0.05, 2.3, 6), n);
      m.position.set(i + h, 1.15, c.z + p), t.add(m);
    }
    const l = new a.Mesh(new a.BoxGeometry(2.1, 0.05, 2.6), g({ color: c.tarp, bands: 3, tint: 1714746 }));
    l.position.set(i, 2.32, c.z), l.rotation.z = 0.12, l.rotation.x = 0.06, t.add(l);
    const f = new a.Mesh(new a.BoxGeometry(1.5, 0.55, 1.8), o);
    f.position.set(i, 0.5, c.z), t.add(f);
    let u = 0;
    for (const h of [-0.6, 0, 0.6]) for (const p of [-0.4, 0.05, 0.5]) {
      const m = new a.Mesh(new a.IcosahedronGeometry(0.15, 1), g({ color: s[u % s.length], bands: 3, tint: 2767394 }));
      m.position.set(i + p, 0.86, c.z + h), m.scale.y = 0.6, t.add(m), u++;
    }
    const d = new a.Mesh(new a.CylinderGeometry(0.32, 0.24, 0.35, 10), o);
    d.position.set(i + 1.1, 0.18, c.z + 0.7), t.add(d), e.collide(i - 0.9, c.z - 1.05, i + 0.9, c.z + 1.05, 2.2);
  }
  At(t), e.add(t);
}
const tt = {};
function Ts() {
  return tt.concrete || (tt.concrete = g({ color: b.concrete, bands: 3, tint: 7301008 }), tt.concreteMid = g({ color: b.concreteMid, bands: 3, tint: 6972040 }), tt.metal = g({ color: b.metal, bands: 3, tint: 6709392 }), tt.metalDark = g({ color: b.metalDark, bands: 3, tint: 6051456 }), tt.dark = g({ color: b.black, bands: 2, tint: 4932960 }), tt.shell = g({ color: 12896462, bands: 3, tint: 6709392 }),
  tt.shellTrim = g({ color: 10133672, bands: 3, tint: 6051456 }), tt.wood = g({ color: 10256222, bands: 3, tint: 6051456 }), tt.woodDark = g({ color: 8217416, bands: 3, tint: 6051456 }), tt.soil = g({ color: 7627342, bands: 3, tint: 6380160 }), tt.bamboo = g({ color: b.bamboo, bands: 3, flat: false, tint: 5992332 }), tt.twine = g({ color: b.rope, bands: 3, flat: false, tint: 7301008 }), tt.pale = I(
  { color: 16184040 })), tt;
}
const N = (e, t, o = 0) => new a.Vector3(e, t, o), As = N(0, 1, 0), Fe = /* @__PURE__ */ new Map();
function Cs(e) {
  return Fe.has(e) || Fe.set(e, new a.CylinderGeometry(1, 1, 1, e, 1)), Fe.get(e);
}
function X(e, t, o, n, s = 6) {
  const r = new a.Vector3().subVectors(o, t), c = r.length();
  c < 1e-4 || e.push({ geometry: Cs(s), matrix: new a.Matrix4().compose(new a.Vector3().addVectors(t, o).multiplyScalar(0.5), new a.Quaternion().setFromUnitVectors(As, r.normalize()), N(n, c, n)) });
}
function Rs(e, t, o, n = {}) {
  const s = n.noCast ?? [];
  for (const r of Object.keys(t)) {
    if (!t[r].length) continue;
    const c = new a.Mesh(pt(t[r]), o[r]);
    c.castShadow = !s.includes(r), c.receiveShadow = true, e.add(c), r === n.outline && wt(c, { thickness: n.thickness ?? 32e-4 });
  }
  return e;
}
function Go(e = {}) {
  const t = Ts(), o = new a.Group(), n = new a.Group();
  o.add(n);
  const s = 0.2, r = { RA: N(-0.6, s), FA: N(0.57, s), ENG: N(-0.3, 0.28), RS: N(-0.22, 0.3), FS: N(0.3, 0.28), HS: N(0.48, 0.62), HT: N(0.4, 0.96), BAR: N(0.38, 1), SHK: N(-0.44, 0.5) }, c = { dark: [], metal: [], body: [], amber: [], dial: [] }, i = (f, u, d) => c[f].push({ geometry: u, matrix: d }), l = g({ color: e.color ?? 13227228, bands: 3, tint: 7301008 });
  for (const f of [r.RA, r.FA]) i("dark", new a.CylinderGeometry(s, s, 0.09, 14), T(f.x, f.y, 0, Math.PI / 2)), i("metal", new a.CylinderGeometry(0.125, 0.125, 0.11, 12), T(f.x, f.y, 0, Math.PI / 2)), i("dark", new a.CylinderGeometry(0.038, 0.038, 0.13, 8), T(f.x, f.y, 0, Math.PI / 2));
  i("body", new a.TorusGeometry(s + 0.04, 0.026, 4, 14, Math.PI * 0.85), T(r.FA.x, r.FA.y, 0, 0, 0, -0.72, 1, 1, 2.2)), i("body", new a.TorusGeometry(s + 0.05, 0.032, 4, 12, Math.PI * 0.62), T(r.RA.x, r.RA.y, 0, 0, 0, 0.55, 1, 1, 1.9));
  for (const f of [-1, 1]) X(c.metal, N(r.HS.x, r.HS.y, f * 0.055), N(r.FA.x, r.FA.y, f * 0.055), 0.019), X(c.metal, N(r.ENG.x, r.ENG.y, f * 0.062), N(r.RA.x, r.RA.y, f * 0.062), 0.022);
  X(c.metal, r.HS, r.HT, 0.026), X(c.metal, r.HS, r.FS, 0.026), X(c.metal, r.FS, r.RS, 0.024), X(c.metal, r.RS, r.SHK, 0.024), X(c.metal, N(r.SHK.x, r.SHK.y, 0.07), N(r.RA.x + 0.02, r.RA.y + 0.04, 0.07), 0.024), X(c.metal, N(-0.14, 0.26, -0.09), N(-0.24, 0.015, -0.19), 0.016);
  for (const f of [-1, 1]) i("body", new a.BoxGeometry(0.5, 0.24, 0.11), T(-0.4, 0.4, f * 0.125));
  i("body", new a.BoxGeometry(0.46, 0.09, 0.34), T(-0.4, 0.505, 0)), i("dark", new a.BoxGeometry(0.34, 0.08, 0.3), T(-0.46, 0.59, 0)), i("dark", new a.BoxGeometry(0.16, 0.065, 0.2), T(-0.24, 0.575, 0)), i("body", new a.BoxGeometry(0.56, 0.03, 0.36), T(0.06, 0.275, 0)), i("dark", new a.BoxGeometry(0.46, 0.014, 0.28), T(0.04, 0.297, 0)), i("body", new a.BoxGeometry(0.16, 0.46, 0.42), T(0.38, 0.68, 0,
  0, 0, 0.22)), i("body", new a.BoxGeometry(0.16, 0.16, 0.38), T(0.3, 0.4, 0)), i("body", new a.BoxGeometry(0.16, 0.18, 0.3), T(0.4, 0.94, 0)), X(c.metal, N(-0.28, 0.28, 0.09), N(-0.5, 0.245, 0.13), 0.024), i("metal", new a.CylinderGeometry(0.045, 0.045, 0.24, 10), T(-0.62, 0.24, 0.14, 0, 0, Math.PI / 2)), i("metal", new a.BoxGeometry(0.28, 0.025, 0.26), T(-0.66, 0.655, 0));
  for (const f of [-1, 1]) X(c.metal, N(-0.56, 0.65, f * 0.11), N(-0.5, 0.55, f * 0.13), 0.014), X(c.metal, N(-0.78, 0.65, f * 0.11), N(-0.68, 0.55, f * 0.12), 0.014), X(c.metal, N(-0.54, 0.6, f * 0.145), N(-0.72, 0.7, f * 0.115), 0.013);
  X(c.metal, N(-0.72, 0.7, -0.115), N(-0.72, 0.7, 0.115), 0.013);
  {
    const f = I({ color: b.wallGray }), u = I({ color: 16777215, map: En(), cache: false }), d = new a.Mesh(new a.BoxGeometry(0.02, 0.13, 0.24), [f, u, f, f, f, f]);
    d.position.set(-0.77, 0.42, 0), d.castShadow = true, n.add(d);
  }
  i("metal", new a.CylinderGeometry(0.018, 0.018, 0.56, 6), T(r.BAR.x, r.BAR.y, 0, Math.PI / 2)), X(c.metal, r.HT, r.BAR, 0.022);
  for (const f of [-1, 1]) i("dark", new a.CylinderGeometry(0.024, 0.024, 0.11, 6), T(r.BAR.x, r.BAR.y, f * 0.22, Math.PI / 2)), X(c.metal, N(0.36, 1.02, f * 0.18), N(0.32, 1.24, f * 0.24), 0.012), i("dark", new a.BoxGeometry(0.03, 0.11, 0.14), T(0.31, 1.26, f * 0.25)), n.add(D(8e-3, 0.09, 0.12, I({ color: b.mirrorFace }), 0.294, 1.26, f * 0.25)), i("amber", new a.BoxGeometry(0.06, 0.05, 0.05), T(
  0.45, 0.86, f * 0.19));
  if (i("metal", new a.CylinderGeometry(0.095, 0.095, 0.06, 14), T(0.48, 0.9, 0, 0, 0, Math.PI / 2)), n.add(Jt(0.082, 0.082, 0.02, 14, I({ color: 16774360 }), 0.514, 0.9, 0).rotateZ(Math.PI / 2)), e.cockpit) {
    const u = N(0.392, 1.06, 0), d = new a.Quaternion().setFromAxisAngle(N(0, 0, 1), 0.52), h = N(0, 1, 0).applyQuaternion(d), p = (w) => d.clone().multiply(new a.Quaternion().setFromAxisAngle(N(0, 1, 0), -w)), m = (w, M, G, A, x) => {
      const S = p(G), y = u.clone().addScaledVector(h, x).add(N(A, 0, 0).applyQuaternion(S));
      i(M, w, new a.Matrix4().compose(y, S, N(1, 1, 1)));
    };
    i("dark", new a.CylinderGeometry(0.062, 0.062, 0.05, 14), T(u.x, u.y, u.z, 0, 0, 0.52)), m(new a.CylinderGeometry(0.05, 0.05, 8e-3, 14), "dial", 0, 0, 0.026), m(new a.BoxGeometry(0.042, 4e-3, 5e-3), "dark", -2.36, 0.021, 0.032), m(new a.CylinderGeometry(7e-3, 7e-3, 6e-3, 8), "dark", 0, 0, 0.032), m(new a.CylinderGeometry(9e-3, 9e-3, 5e-3, 8), "amber", 1.9, 0.033, 0.031);
    for (const w of [-1, 1]) X(c.metal, N(0.4, 1, w * 0.163), N(0.468, 0.988, w * 0.248), 9e-3);
    i("metal", new a.CylinderGeometry(0.026, 0.026, 0.05, 10), T(0.315, 0.88, -0.05, 0, 0, Math.PI / 2));
    {
      const w = N(-1, 0, 0).applyEuler(new a.Euler(0, 0, 0.22)), M = N(0.38, 0.68, 0).addScaledVector(w, 0.081), G = M.clone().addScaledVector(w, 0.05);
      X(c.metal, M, G, 9e-3), X(c.metal, G, G.clone().add(N(0, 0.035, 0)), 9e-3);
    }
  }
  return Rs(n, c, { dark: t.dark, metal: t.metal, body: l, amber: g({ color: b.orange, bands: 2, tint: 9396304 }), dial: I({ color: 15328986 }) }, { outline: "body", thickness: 34e-4 }), n.rotation.x = e.lean ?? -0.09, o.position.set(e.x, e.y ?? 0, e.z), o.rotation.y = e.ry ?? 0, o.userData.inner = n, o;
}
function qe(e = {}) {
  const t = new a.Group(), o = new a.Group();
  t.add(o), t.userData.inner = o;
  const n = g({ color: e.color ?? 15251488, bands: 3, tint: 9071146 }), s = g({ color: 2302758, bands: 2, tint: 3816010 }), r = g({ color: 3026483, bands: 2, tint: 3816010 }), c = g({ color: 10133672, bands: 3, tint: 6051456 }), i = I({ color: 10338516, transparent: true, opacity: 0.55 }), l = { yellow: [], black: [], dark: [], metal: [] }, f = (p, m, w) => l[p].push({ geometry: m, matrix: w }), u = 0.25;
  f("dark", new a.CylinderGeometry(u, u, 0.1, 14), T(0.72, u, 0, Math.PI / 2)), f("metal", new a.CylinderGeometry(0.14, 0.14, 0.11, 12), T(0.72, u, 0, Math.PI / 2));
  for (const p of [-1, 1]) f("dark", new a.CylinderGeometry(u, u, 0.1, 14), T(-0.62, u, p * 0.58, Math.PI / 2)), f("metal", new a.CylinderGeometry(0.14, 0.14, 0.11, 12), T(-0.62, u, p * 0.58, Math.PI / 2));
  f("black", new a.BoxGeometry(1.9, 0.08, 1.28), T(-0.15, 0.34, 0)), f("black", new a.BoxGeometry(1.5, 0.42, 0.05), T(-0.45, 0.6, 0.62)), f("black", new a.BoxGeometry(1.5, 0.42, 0.05), T(-0.45, 0.6, -0.62)), f("black", new a.BoxGeometry(0.06, 0.42, 1.28), T(-1.08, 0.6, 0)), f("dark", new a.BoxGeometry(0.42, 0.14, 1.1), T(-0.82, 0.62, 0)), f("dark", new a.BoxGeometry(0.1, 0.5, 1.1), T(-1, 0.86, 0)),
  f("dark", new a.BoxGeometry(0.34, 0.1, 0.42), T(-0.46, 0.66, 0)), f("yellow", new a.BoxGeometry(0.5, 0.5, 0.72), T(0.32, 0.62, 0)), f("yellow", new a.BoxGeometry(0.28, 0.34, 0.5), T(0.66, 0.52, 0)), f("dark", new a.CylinderGeometry(0.09, 0.09, 0.1, 10), T(0.82, 0.62, 0, 0, 0, Math.PI / 2)), f("yellow", new a.TorusGeometry(u + 0.05, 0.05, 4, 12, Math.PI), T(0.72, u + 0.02, 0, 0, 0, 0, 1, 1, 2.2)),
  f("metal", new a.CylinderGeometry(0.025, 0.025, 0.4, 6), T(0.18, 0.82, 0, 0, 0, -0.5)), f("dark", new a.CylinderGeometry(0.028, 0.028, 0.5, 6), T(0.1, 0.98, 0, Math.PI / 2)), f("yellow", new a.BoxGeometry(0.05, 0.72, 0.05), T(-1.06, 1.15, 0.58)), f("yellow", new a.BoxGeometry(0.05, 0.72, 0.05), T(-1.06, 1.15, -0.58)), f("yellow", new a.BoxGeometry(0.05, 0.62, 0.05), T(0.28, 1.1, 0.5, 0, 0, -0.18)),
  f("yellow", new a.BoxGeometry(0.05, 0.62, 0.05), T(0.28, 1.1, -0.5, 0, 0, -0.18)), f("yellow", new a.CylinderGeometry(0.66, 0.66, 1.5, 12, 1, false, 0, Math.PI), T(-0.4, 1.02, 0, Math.PI / 2, 0, Math.PI / 2, 1, 0.45, 1));
  const d = new a.Mesh(new a.PlaneGeometry(0.62, 0.5), i);
  d.position.set(0.33, 1.28, 0), d.rotation.y = Math.PI / 2, d.rotation.x = 0, d.rotation.z = -0.22, d.userData.noShadow = true, o.add(d);
  const h = { yellow: n, black: s, dark: r, metal: c };
  for (const p of Object.keys(l)) {
    if (!l[p].length) continue;
    const m = new a.Mesh(pt(l[p]), h[p]);
    o.add(m);
  }
  return o.rotation.x = e.lean ?? 0, At(t), t.userData.noOutline = false, t;
}
const To = new a.Vector3(), Ao = new a.Vector3(), Co = new a.Vector3(), Ro = new a.Matrix4(), Po = new a.Quaternion(), Bo = new a.Quaternion(), Eo = new a.Euler();
function $e(e, t, o, n, s) {
  te(t, o, To, Ao, Co), Ro.makeBasis(Ao, To, Co), Po.setFromRotationMatrix(Ro), Eo.set(0, s + Math.PI / 2, 0, "YXZ"), Bo.setFromEuler(Eo), e.quaternion.copy(Po).multiply(Bo), Yt(t, n, o, e.position);
}
function Ps(e) {
  const t = [], o = [{ kind: "auto", lane: -1.55, dir: 1, speed: 4.2, z0: -30, color: 15251488 }, { kind: "auto", lane: 1.55, dir: -1, speed: 3.8, z0: 24, color: 14198808 }, { kind: "scooter", lane: 1.45, dir: -1, speed: 5.2, z0: -55, color: 11881018 }];
  for (const i of o) {
    const l = i.kind === "auto" ? qe({ color: i.color }) : Go({ color: i.color });
    l.userData.planetRigid = true, e.add(l);
    const f = { x0: 0, x1: 0, z0: 0, z1: 0, top: 1.6 };
    e.colliders.push(f), t.push({ obj: l, ...i, z: i.z0, collider: f });
  }
  const n = [{ kind: "auto", x: 1, z: 38.5, ry: 0.35, color: 15251488 }, { kind: "auto", x: 1, z: 41.2, ry: -0.2, color: 13146144 }, { kind: "scooter", x: -1, z: -8.5, ry: 0.3 }, { kind: "scooter", x: -1, z: -10.2, ry: -0.4 }, { kind: "scooter", x: 1, z: 14.8, ry: 0.2 }, { kind: "scooter", x: -1, z: 33.5, ry: -0.25 }, { kind: "scooter", x: -1, z: 24.2, ry: 0.15 }];
  for (const i of n) {
    const l = U(i.z) + i.x * (V + 0.75), f = i.kind === "auto" ? qe({ color: i.color, lean: -0.03 }) : Go({ color: i.color ?? 13227228 });
    f.position.set(l, e.groundAt(l, i.z), i.z), f.rotation.y = i.ry + (i.x > 0 ? -Math.PI / 2 : Math.PI / 2), e.add(f);
    const u = i.kind === "auto" ? 1.1 : 0.9, d = i.kind === "auto" ? 0.75 : 0.4;
    e.collide(l - d, i.z - u, l + d, i.z + u, 1.3);
  }
  let s = () => false;
  const r = 3.4;
  function c(i) {
    for (const l of t) {
      let f = l.speed;
      if (s()) {
        const h = l.z + l.dir * f * i;
        (l.dir > 0 ? l.z < -r && h >= -r : l.z > r && h <= r) && (f = 0), l.dir > 0 && l.z < -r - 0.01 && h > -r && (f = 0), l.dir < 0 && l.z > r + 0.01 && h < r && (f = 0);
      }
      l.z += l.dir * f * i, l.z > Nt - 2 && (l.z = _t + 2), l.z < _t + 2 && (l.z = Nt - 2);
      const u = U(l.z) + l.lane, d = l.dir > 0 ? Math.PI : 0;
      $e(l.obj, u, l.z, 0.02, d), l.collider.x0 = u - 0.8, l.collider.x1 = u + 0.8, l.collider.z0 = l.z - 1.3, l.collider.z1 = l.z + 1.3;
    }
  }
  return { update: c, setGatesDown(i) {
    s = i;
  } };
}
const Bs = [13146474, 11896150, 11040328, 9857084], Es = [13126460, 3112299, 14735560, 4026052, 14198844, 9400245, 15236e3, 15790312], Is = [3817290, 4866616, 5921382, 3026483, 7035464];
function Io(e) {
  const t = new a.Group(), o = g({ color: e.pick(Bs), bands: 3, tint: 9072478 }), n = g({ color: e.pick(Es), bands: 3, tint: 7036528 }), s = g({ color: e.pick(Is), bands: 2, tint: 3816010 }), r = g({ color: 2367518, bands: 2, tint: 3816010 }), c = e.range(0.92, 1.06), i = new a.Mesh(new a.BoxGeometry(0.34, 0.55, 0.2), n);
  i.position.y = 1.06 * c, t.add(i);
  const l = new a.Mesh(new a.SphereGeometry(0.115, 10, 8), o);
  l.position.y = 1.5 * c, t.add(l);
  const f = new a.Mesh(new a.SphereGeometry(0.118, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), r);
  f.position.y = 1.51 * c, t.add(f);
  const u = new a.Mesh(new a.BoxGeometry(0.11, 0.78, 0.13), s), d = u.clone();
  u.geometry = u.geometry.clone(), u.geometry.translate(0, -0.39, 0), d.geometry = u.geometry, u.position.set(0, 0.78 * c, 0.08), d.position.set(0, 0.78 * c, -0.08), t.add(u, d);
  const h = new a.Mesh(new a.BoxGeometry(0.08, 0.5, 0.09), n);
  h.geometry = h.geometry.clone(), h.geometry.translate(0, -0.25, 0);
  const p = h.clone();
  return h.position.set(0, 1.3 * c, 0.23), p.position.set(0, 1.3 * c, -0.23), t.add(h, p), At(t), t.userData.legs = [u, d], t.userData.arms = [h, p], t.userData.scale = c, t;
}
function Ds(e) {
  const t = nt(4517), o = [], n = 7;
  for (let c = 0; c < n; c++) {
    const i = c % 2 === 0 ? -1 : 1, l = Io(t);
    l.userData.planetRigid = true, e.add(l), o.push({ obj: l, side: i, z: t.range(_t + 8, Nt - 8), dir: t.sign(), speed: t.range(0.9, 1.6), phase: t.range(0, 10), t: 0 });
  }
  const s = [{ x: 4.6, z: -14.4, ry: -0.5 }, { x: 4.5, z: 38.2, ry: 2.4 }].map((c) => {
    const i = Io(t);
    return i.userData.planetRigid = true, e.add(i), { obj: i, ...c, phase: t.range(0, 10), t: 0 };
  });
  function r(c) {
    for (const i of o) {
      i.t += c, i.z += i.dir * i.speed * c;
      const l = 72;
      i.z > l && (i.z = l, i.dir = -1), i.z < -l && (i.z = -l, i.dir = 1);
      const f = U(i.z) + i.side * (V + K * 0.55), u = i.dir > 0 ? Math.PI : 0;
      $e(i.obj, f, i.z, Lt, u);
      const d = Math.sin(i.t * 6.4 * i.speed) * 0.5, [h, p] = i.obj.userData.legs, [m, w] = i.obj.userData.arms;
      h.rotation.z = d, p.rotation.z = -d, m.rotation.z = -d * 0.7, w.rotation.z = d * 0.7;
    }
    for (const i of s) {
      i.t += c;
      const l = U(i.z) + i.x;
      $e(i.obj, l, i.z, Lt, i.ry), i.obj.position.y += 0;
      const [f] = i.obj.userData.arms;
      f.rotation.z = Math.sin(i.t * 1.2) * 0.06;
    }
  }
  return { update: r };
}
const Ls = [{ id: "gate", label: "Shankar Mutt  \xB7  look closer", pos: (e) => ({ x: e - (V + K + 0.4), z: 27, y: 1.6 }), card: { title: "Sri Shankar Mutt, Nallakunta", body: "The Nallakunta branch of the Sringeri Sharada Peetham. Saffron arch with the blue Telugu board, pale wall with the orange band, posters by the gate - every kid on this road gave directions by it. The real gate stands at 17.\
4006 N, 78.5072 E, on the west side of the main road." } }, { id: "tree", label: "The temple tree  \xB7  look closer", pos: (e) => ({ x: e - (V + K + 1.15), z: 22.5, y: 2.2 }), card: { title: "The tree outside the wall", body: 'Every old Hyderabad street has one tree older than the buildings. Distances here were never in metres - they were "past the tree, before the gate." The bougainvillea on the\
 coping drops petals on the footway all year.' } }, { id: "pharmacy", label: "Saince Pharmacy  \xB7  look closer", pos: (e) => ({ x: e + (V + K + 0.4), z: 8.5, y: 1.6 }), card: { title: "Saince Pharmacy", body: "The pharmacy opposite the mutt. Strips of tablets cut to count, ORS through the summer, a torch behind the counter for when the power went. Every household on the street has run a small ta\
b of mercies here." } }, { id: "tiffins", label: "Tiffin centre  \xB7  look closer", pos: (e) => ({ x: e - (V + K + 0.4), z: 44.5, y: 1.6 }), card: { title: "Siddhartha Tiffin Centre", body: "Idli at seven in the morning, punugulu at four in the evening. The steel plates never stopped moving and neither did the queue. Half the neighbourhood's mornings started standing here." } }, { id: "tea", label: "\
Tea point  \xB7  look closer", pos: (e) => ({ x: e + (V + K + 0.4), z: 38.5, y: 1.6 }), card: { title: "The tea point", body: 'Irani chai by the glass, Osmania biscuits on a steel plate. The conversations were the point; the tea was the excuse. Someone has been "just leaving" here for forty minutes.' } }, { id: "busstop", label: "Bus stop  \xB7  look closer", pos: (e) => ({ x: e + (V + K - 1), z: -14,
y: 1.6 }), card: { title: "The bus stop", body: "107, 113, 116J. Buses came when they came, and you learned to read the road for them two turns away. Whole friendships were made waiting here." } }, { id: "crossing", label: "MMTS line  \xB7  look closer", pos: (e) => ({ x: e + 4.4, z: 3.6, y: 1.4 }), card: { title: "The railway line", body: "The MMTS line past Vidyanagar, the neighbourhood's other \
clock. If you grew up here you can still hear the horn before the gates come down - and you still know exactly how long you have." } }];
function _s(e) {
  for (const t of Ls) {
    const o = U(t.pos(0).z), n = t.pos(o), s = new a.Mesh(new a.BoxGeometry(1.8, 2.4, 2.6), I({ color: 16711680, cache: false }));
    s.position.set(n.x, n.y, n.z), s.visible = false, e.add(s), e.interact({ hitbox: s, label: t.label, action: () => {
      window.dispatchEvent(new CustomEvent("nf-memory", { detail: t.card }));
    } });
  }
}
function Ns(e) {
  ds(e), ws(e), Gs(e), hs(e), ps(e), Ms(e), zs(e), vs(e), Ss(e), _s(e);
  const t = Ps(e), o = Ds(e);
  return e.update((n) => {
    t.update(n), o.update(n);
  }), { traffic: t, people: o };
}
function Os(e) {
  const t = new a.Group();
  t.name = "world", e.add(t);
  const o = [], n = [], s = [], r = [], c = [], i = { scene: e, root: t, colliders: o, interactables: n, add: (x) => (t.add(x), x), collide: (x, S, y, k, P, v) => {
    o.push({ x0: Math.min(x, y), x1: Math.max(x, y), z0: Math.min(S, k), z1: Math.max(S, k), top: P, bottom: v });
  }, platform: (x) => r.push(x), cut: (x) => c.push(x), groundAt: (x, S) => {
    let y = io(x, S);
    for (const k of c) x > k.x0 && x < k.x1 && S > k.z0 && S < k.z1 && (y = Math.min(y, k.top));
    for (const k of r) x > k.x0 && x < k.x1 && S > k.z0 && S < k.z1 && (y = Math.max(y, k.top));
    return y;
  }, interact: (x) => n.push(x), update: (x) => s.push(x) }, l = Yn(e), f = Ka(i), u = es(i), d = Ns(i), h = os(i), p = 165, m = { blink: 0, armT: 0 };
  f.request = () => {
    u.x = gt(-153 * u.dir);
  };
  const w = [1, -1].map((x) => {
    const S = { x0: U(0) - V - 0.6, x1: U(0) + V + 0.6, z0: x * ke - 0.16, z1: x * ke + 0.16, top: -1 };
    return o.push(S), S;
  });
  function M(x) {
    m.blink = (m.blink + x * 1.6) % 1;
    const S = -u.offset * u.dir, y = S < p && S > -62, k = x / (y ? 3.4 : 3);
    m.armT = Math.max(0, Math.min(1, m.armT + (y ? k : -k))), f.setArms(m.armT), f.setLamps(y || m.armT > 0.02, m.blink);
    const P = m.armT > 0.55 ? 1.25 : -1;
    w[0].top = P, w[1].top = P;
  }
  d.traffic.setGatesDown(() => m.armT > 0.55);
  const G = Kn(t, { maxEdge: 4 });
  return u.planetize(), { root: t, colliders: o, platforms: r, cuts: c, interactables: n, train: u, crossing: f, planet: l, petals: h, bakeStats: G, bounds: { z0: -ht * 0.24, z1: ht * 0.24 }, heightAt(x, S, y) {
    let k = io(x, S);
    for (const v of c) x > v.x0 && x < v.x1 && S > v.z0 && S < v.z1 && (k = Math.min(k, v.top));
    const P = y === void 0 ? 1 / 0 : y + 0.55;
    for (const v of r) v.top > P || x > v.x0 && x < v.x1 && S > v.z0 && S < v.z1 && (k = Math.max(k, v.top));
    return k;
  }, update(x) {
    M(x), u.update(x);
    for (const S of s) S(x);
    h.update(x, u.gust, u.dir);
  } };
}
const Do = 0.88, Lo = 0.34, _o = 1.17, No = -0.09, Fs = 2.4, Vs = 0.34, Ws = 0.38;
function Hs({ scene: e, world: t, player: o, hud: n }) {
  const s = qe({ color: 15251488, lean: No }), r = s.userData.inner;
  s.visible = false, e.add(s);
  const c = new a.Mesh(new a.BoxGeometry(1.9, 1.35, 0.95), I({ color: 16711680, cache: false }));
  c.position.set(-0.05, 0.68, 0), c.visible = false, s.add(c);
  const i = { hitbox: c, label: "auto  \xB7  ride it", action: () => z() }, l = { out: false, riding: false, x: 0, z: 0, heading: 0 };
  let f = null;
  const u = new a.Vector3(), d = new a.Vector3(), h = new a.Vector3(), p = new a.Matrix4(), m = new a.Quaternion(), w = new a.Quaternion(), M = new a.Euler();
  function G(C, L, F, B, E) {
    te(C, L, u, d, h), p.makeBasis(d, u, h), m.setFromRotationMatrix(p), M.set(0, B + Math.PI / 2, E, "YXZ"), w.setFromEuler(M), s.quaternion.copy(m).multiply(w), Yt(C, F, L, s.position), s.updateMatrixWorld(true);
  }
  function A(C, L, F, B) {
    const E = -Math.sin(F), j = -Math.cos(F), lt = _o / 2, Ce = t.heightAt(gt(C + E * lt), L + j * lt, B), oe = t.heightAt(gt(C - E * lt), L - j * lt, B);
    return a.MathUtils.clamp(Math.atan2(Ce - oe, _o), -0.45, 0.45);
  }
  function x(C) {
    if (f) {
      const lt = t.colliders.indexOf(f);
      lt >= 0 && t.colliders.splice(lt, 1), f = null;
    }
    if (!C) return;
    const L = Math.abs(Math.sin(l.heading)), F = Math.abs(Math.cos(l.heading)), B = Do * L + Lo * F, E = Do * F + Lo * L, j = t.heightAt(l.x, l.z, o.pos.y);
    f = { x0: l.x - B, x1: l.x + B, z0: l.z - E, z1: l.z + E, top: j + 1.02 }, t.colliders.push(f);
  }
  function S(C, L, F, B) {
    for (const E of t.colliders) if (E !== f && !(E.top !== void 0 && E.top <= B + Ws) && !(E.bottom !== void 0 && E.bottom > B + 1.9) && C > E.x0 - F && C < E.x1 + F && L > E.z0 - F && L < E.z1 + F) return false;
    return true;
  }
  function y(C) {
    const L = t.interactables.indexOf(i);
    C && L < 0 && t.interactables.push(i), !C && L >= 0 && t.interactables.splice(L, 1);
  }
  function k() {
    const C = t.heightAt(l.x, l.z, o.pos.y);
    r.rotation.x = No, G(l.x, l.z, C, l.heading, A(l.x, l.z, l.heading, C)), s.visible = true, l.out = true, x(true), y(true);
  }
  function P() {
    const C = o.pos.y;
    let L = null;
    for (const F of [2, 1.65, 2.6, 1.3]) {
      for (const B of [0, 0.45, -0.45, 0.95, -0.95, 1.6, -1.6]) {
        const E = gt(o.pos.x - Math.sin(o.yaw + B) * F), j = o.pos.z - Math.cos(o.yaw + B) * F;
        if (S(E, j, 0.8, C) && !(Math.abs(t.heightAt(E, j, C) - C) > 0.5)) {
          L = { x: E, z: j };
          break;
        }
      }
      if (L) break;
    }
    L || (L = { x: gt(o.pos.x - Math.sin(o.yaw) * 1.5), z: o.pos.z - Math.cos(o.yaw) * 1.5 }), l.x = L.x, l.z = L.z, l.heading = o.yaw - 0.35, k(), n?.flash("auto  \xB7  E to ride", 1700);
  }
  function v() {
    l.riding || (s.visible = false, l.out = false, x(false), y(false), n?.flash("auto  \xB7  put away", 1200));
  }
  function z() {
    !l.out || l.riding || (o.yaw = l.heading, o.pos.x = gt(l.x + Math.sin(l.heading) * Ot.seatFwd), o.pos.z = l.z + Math.cos(l.heading) * Ot.seatFwd, x(false), y(false), l.riding = true, o.mount(i), n?.flash("auto  \xB7  W to go, E to get off", 2e3));
  }
  function R() {
    if (!l.riding) return;
    l.riding = false, o.unmount();
    const C = Math.cos(l.heading), L = -Math.sin(l.heading), F = -Math.sin(l.heading), B = -Math.cos(l.heading), E = o.pos.y, j = [[-C * 1.35, -L * 1.35], [C * 1.35, L * 1.35], [-F * 1.9, -B * 1.9]];
    for (const [lt, Ce] of j) {
      const oe = gt(o.pos.x + lt), Re = o.pos.z + Ce;
      if (S(oe, Re, Vs, E) && !(Math.abs(t.heightAt(oe, Re, E) - E) > 0.6)) {
        o.pos.x = oe, o.pos.z = Re;
        break;
      }
    }
    k(), n?.flash("auto  \xB7  parked", 1200);
  }
  function O() {
    if (l.riding) {
      R();
      return;
    }
    if (!l.out) {
      P();
      return;
    }
    Math.hypot(Qo(l.x, o.pos.x), l.z - o.pos.z) > 4 ? P() : v();
  }
  function H() {
    if (!l.riding) return;
    const C = o.yaw, L = -Math.sin(C), F = -Math.cos(C), B = gt(o.pos.x + L * Ot.seatFwd), E = o.pos.z + F * Ot.seatFwd;
    G(B, E, o.pos.y, C, A(B, E, C, o.pos.y)), r.rotation.x = -o.roll * Fs, l.x = B, l.z = E, l.heading = C;
  }
  return { group: s, toggle: O, summon: P, recall: v, mount: z, dismount: R, update: H, get riding() {
    return l.riding;
  }, get summoned() {
    return l.out;
  } };
}
const Ze = document.getElementById("view"), Ht = new a.WebGLRenderer({ canvas: Ze, antialias: false, powerPreference: "high-performance", stencil: false });
Ht.setPixelRatio(1);
Ht.outputColorSpace = a.SRGBColorSpace;
Ht.toneMapping = a.NoToneMapping;
Ht.shadowMap.enabled = true;
Ht.shadowMap.type = a.PCFShadowMap;
Ht.setClearColor(new a.Color(b.fog), 1);
const it = new a.Scene();
it.fog = new a.Fog(b.fog, 44, 205);
const ct = new a.PerspectiveCamera(46, 1, 0.25, 600);
ct.rotation.order = "YXZ";
const Z = new a.DirectionalLight(b.sun, 2.25);
Z.position.set(-52, 62, 56);
Z.castShadow = true;
Z.shadow.mapSize.set(2048, 2048);
Z.shadow.camera.left = -34;
Z.shadow.camera.right = 34;
Z.shadow.camera.top = 34;
Z.shadow.camera.bottom = -34;
Z.shadow.camera.near = 1;
Z.shadow.camera.far = 200;
Z.shadow.bias = -4e-4;
Z.shadow.normalBias = 0.035;
it.add(Z);
it.add(Z.target);
const ee = new a.DirectionalLight(b.fill, 1.08);
ee.position.set(48, 26, -44);
it.add(ee);
it.add(ee.target);
const qt = new a.DirectionalLight(14207976, 0.34);
qt.position.set(10, -18, 40);
it.add(qt);
it.add(qt.target);
const Ge = new a.HemisphereLight(b.hemiSky, b.hemiGround, 1.12);
it.add(Ge);
const Oo = Nn(it, 500), de = Os(it), $ = new oa(ct, Ze, de), pn = "nallakunta-forever-volume";
let Je = 0.34;
try {
  const e = localStorage.getItem(pn);
  if (e !== null) {
    const t = Number(e);
    Number.isFinite(t) && (Je = Math.max(0, Math.min(1, t)));
  }
} catch {
}
const q = na({ volume: Je }), mt = aa({ volume: Je, fadeIn: 3 });
q.setMuted(mt.muted);
const to = () => {
  try {
    localStorage.setItem(pn, String(mt.volume));
  } catch {
  }
};
q.onVolumeChange = (e) => {
  q.setMuted(mt.setVolume(e)), to();
};
const mn = window.matchMedia?.("(pointer: coarse)").matches ?? false;
q.onStart = () => {
  mt.start(), mn ? ($.touchActive = true, q.setLocked(true)) : $.lock();
};
$.onLockChange = (e) => q.setLocked(e);
Ze.addEventListener("click", () => {
  mt.start(), !mn && !$.locked && $.lock();
});
window.addEventListener("nf-memory", (e) => q.showCard(e.detail));
q.bindTouch({ player: $, onEnter: () => {
  $.touchActive || q.onStart?.();
}, onPlanet: () => {
  Ye(!Wt), q.flash(Wt ? "orbit view  \xB7  \u25CE to return" : "back on the ground");
}, onMusic: () => {
  const e = mt.toggle();
  q.setMuted(e), q.setVolume(mt.volume), to(), mt.available && q.flash(e ? "\u266A  music off" : "\u266A  music on");
} });
const fe = Hs({ scene: it, world: de, player: $, hud: q });
$.onInteract = (e) => {
  if (fe.riding) {
    fe.dismount();
    return;
  }
  e && e.action?.();
};
const St = new vn(Ht, it, ct);
function xn() {
  const e = window.innerWidth, t = window.innerHeight;
  ct.aspect = e / t, ct.updateProjectionMatrix(), St.setSize(e, t), tn(St.size.x, St.size.y);
}
window.addEventListener("resize", xn);
xn();
const Us = new a.Clock(), ge = new a.Vector3(), Fo = new a.Vector3(), js = new a.Vector3(-52, 62, 56), Vo = new a.Vector3(48, 26, -44), Ks = new a.Vector3(10, -18, 40);
function Me(e, t, o, n) {
  Fo.set(0, 0, 0).addScaledVector(o.east, t.x).addScaledVector(o.up, t.y).addScaledVector(o.north, t.z), e.target.position.copy(n), e.position.copy(n).add(Fo);
}
let Wt = false, Ve = 0.6;
const Wo = new a.Vector3(), qs = it.fog, $s = ct.far;
function Ye(e) {
  Wt = e, it.fog = e ? null : qs, ct.far = e ? 1600 : $s, ct.updateProjectionMatrix();
  const t = Z.shadow.camera, o = e ? Y * 1.15 : 34;
  t.left = -o, t.right = o, t.top = o, t.bottom = -o, t.far = e ? Y * 6 : 200, t.updateProjectionMatrix(), q.setPlanetView(e);
}
window.addEventListener("keydown", (e) => {
  if (!e.repeat) {
    if (e.code === "KeyM") {
      const t = mt.toggle();
      q.setMuted(t), q.setVolume(mt.volume), to(), mt.available && q.flash(t ? "\u266A  music off" : "\u266A  music on");
    }
    e.code === "KeyV" && (Wt ? (Ye(false), q.flash("back on the ground")) : fe.toggle()), e.code === "KeyP" && (Ye(!Wt), q.flash(Wt ? "orbit view  \xB7  P to return" : "back on the ground")), e.code === "KeyO" && (St.enabled.ink = !St.enabled.ink), e.code === "KeyG" && (St.enabled.grade = !St.enabled.grade);
  }
});
function wn() {
  const e = Math.min(Us.getDelta(), 0.05);
  if ($.update(e), fe.update(e), de.update(e), Wt) Ve += e * 0.09, Wo.set(Math.sin(Ve) * 0.8, 1, Math.cos(Ve) * 0.8).normalize(), ct.position.copy(ot).addScaledVector(Wo, Y * 3.3), ct.up.set(0, 1, 0), ct.lookAt(ot), Z.target.position.copy(ot), Z.position.copy(ot).add(new a.Vector3(-1.05, 0.95, 0.75).multiplyScalar(Y * 2.2)), Ge.position.set(0, 1, 0), Me(ee, Vo, { east: new a.Vector3(1, 0, 0), up: new a.
  Vector3(0, 1, 0), north: new a.Vector3(0, 0, 1) }, ot), qt.visible = false;
  else {
    qt.visible = true;
    const o = te($.pos.x, $.pos.z);
    Yt($.pos.x, 0, $.pos.z, ge), Me(Z, js, o, ge), Me(ee, Vo, o, ge), Me(qt, Ks, o, ge), Ge.position.copy(o.up);
  }
  Oo.dome.position.copy(ct.position), Oo.clouds.position.copy(ct.position);
  const t = !Wt && $.locked ? $.pick(de.interactables) : null;
  q.setPrompt(t ? `E  \xB7  ${t.label.replace(/^.*?·\s*/, "")}` : ""), q.update(e, $.locked), q.setCoords($.pos, $.yaw, $.pitch, e), St.render(), requestAnimationFrame(wn);
}
wn();
window.__scene = { scene: it, camera: ct, renderer: Ht, pipeline: St, world: de, player: $, ebike: fe, music: mt, hud: q, sun: Z, fill: ee, bounce: qt, hemi: Ge, THREE: a };
window.__setOutlineRes = tn;
