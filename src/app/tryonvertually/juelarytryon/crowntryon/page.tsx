"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════════

interface ProductImage { url: string; public_id: string; _id: string; }

export interface Product {
  _id: string;
  nameEng: string;
  category?: string;
  subcategory?: string;
  subSubcategory?: string;
  images?: ProductImage[];
  price?: number;
  currency?: string;
  brand?: string;
  discount?: number;
}

interface GalleryItem {
  id: string;
  label: string;
  src: string;
  accent: string;
  subcategory: string;
  subSubcategory: string;
  price?: number;
  currency?: string;
}

interface TryonProps {
  product: Product;
}

// ══════════════════════════════════════════════════════════════════════════════
// Landmark indices (MediaPipe FaceMesh 468+)
// ══════════════════════════════════════════════════════════════════════════════

const LM = {
  // Head boundary
  TOP_HEAD: 10,
  CHIN: 152,
  // Temples (outer face boundary)
  LEFT_TEMPLE: 234,
  RIGHT_TEMPLE: 454,
  // Eyes
  LEFT_EYE_OUTER: 33,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_OUTER: 263,
  LEFT_EYE_CENTER: 468,    // refined landmark
  RIGHT_EYE_CENTER: 473,   // refined landmark
  // Nose
  NOSE_TIP: 1,
  NOSE_BRIDGE: 6,
  // Ear lobes (approximated)
  LEFT_EAR_TOP: 127,
  LEFT_EAR_LOBE: 234,
  RIGHT_EAR_TOP: 356,
  RIGHT_EAR_LOBE: 454,
  // Jaw / chin corners
  LEFT_JAW: 172,
  RIGHT_JAW: 397,
  // Mouth
  MOUTH_TOP: 0,
  MOUTH_BOTTOM: 17,
  // Shoulders region (neck bottom approximation via chin)
  NECK_BASE_APPROX: 152,   // we extrapolate from chin down
  // Cheekbones
  LEFT_CHEEK: 116,
  RIGHT_CHEEK: 345,
};

// ══════════════════════════════════════════════════════════════════════════════
// Mode definitions
// ══════════════════════════════════════════════════════════════════════════════

type TryonMode =
  | "crown"
  | "earring"
  | "necklace"
  | "glasses"
  | "sunglasses"
  | "headphone"
  | "earbud"
  | "bracelet"
  | "ring"
  | "hat"
  | "mask"
  | "generic";

interface ModeConfig {
  icon: string;
  label: string;
  accentColor: string;
  bodyZone: "head" | "face" | "ear" | "neck" | "wrist" | "hand";
}

const MODE_MAP: Record<string, TryonMode> = {
  // Crowns / tiaras
  "Gold Crown": "crown",
  "Silver Crown": "crown",
  "Bridal Tiara": "crown",
  "Tiara": "crown",
  "Crown": "crown",
  // Hats
  "Cap": "hat",
  "Hat": "hat",
  "Beanie": "hat",
  "Snapback": "hat",
  // Earrings
  "Gold Earring": "earring",
  "Silver Earring": "earring",
  "Fashion Earring": "earring",
  "Stud Earring": "earring",
  "Drop Earring": "earring",
  "Hoop Earring": "earring",
  "Earring": "earring",
  // Necklaces
  "Gold Necklace": "necklace",
  "Silver Necklace": "necklace",
  "Diamond Pendant": "necklace",
  "Pearl Necklace": "necklace",
  "Chain Necklace": "necklace",
  "Necklace": "necklace",
  "Pendant": "necklace",
  // Glasses
  "Eyeglasses": "glasses",
  "Glasses": "glasses",
  "Reading Glasses": "glasses",
  // Sunglasses
  "Sunglasses": "sunglasses",
  // Headphones
  "Over-Ear": "headphone",
  "On-Ear": "headphone",
  "Noise Cancelling": "headphone",
  "Headphone": "headphone",
  "Headset": "headphone",
  // Earbuds / in-ear
  "Gaming Earbuds": "earbud",
  "ANC Earbuds": "earbud",
  "Wired Earphones": "earbud",
  "Earbuds": "earbud",
  "TWS": "earbud",
  // Bracelets
  "Bracelet": "bracelet",
  "Bangle": "bracelet",
  "Watch": "bracelet",
  // Rings
  "Ring": "ring",
  "Engagement Ring": "ring",
  "Band": "ring",
  // Face mask
  "Face Mask": "mask",
  "Mask": "mask",
};

const MODE_CONFIG: Record<TryonMode, ModeConfig> = {
  crown:     { icon: "👑", label: "Crown Try-On",      accentColor: "#c9a84c", bodyZone: "head" },
  hat:       { icon: "🎩", label: "Hat Try-On",         accentColor: "#a0b8d0", bodyZone: "head" },
  earring:   { icon: "💎", label: "Earring Try-On",     accentColor: "#89cff0", bodyZone: "ear" },
  earbud:    { icon: "🎧", label: "Earbud Try-On",      accentColor: "#b0f0c8", bodyZone: "ear" },
  necklace:  { icon: "📿", label: "Necklace Try-On",    accentColor: "#e8d08a", bodyZone: "neck" },
  glasses:   { icon: "👓", label: "Glasses Try-On",     accentColor: "#c8d8f0", bodyZone: "face" },
  sunglasses:{ icon: "🕶️", label: "Sunglasses Try-On", accentColor: "#b0b8c8", bodyZone: "face" },
  headphone: { icon: "🎧", label: "Headphone Try-On",   accentColor: "#c9a84c", bodyZone: "head" },
  bracelet:  { icon: "⌚", label: "Bracelet Try-On",    accentColor: "#f0c8a0", bodyZone: "wrist" },
  ring:      { icon: "💍", label: "Ring Try-On",         accentColor: "#e8d08a", bodyZone: "hand" },
  mask:      { icon: "😷", label: "Mask Try-On",         accentColor: "#c8f0d8", bodyZone: "face" },
  generic:   { icon: "✨", label: "Virtual Try-On",     accentColor: "#c9a84c", bodyZone: "face" },
};

function getModeForProduct(p: Product): TryonMode {
  const sss = p.subSubcategory ?? "";
  const ss  = p.subcategory  ?? "";
  const cat = p.category     ?? "";

  const allKeys = [sss, ss, cat];

  for (const text of allKeys) {
    if (!text) continue;
    for (const [key, mode] of Object.entries(MODE_MAP)) {
      if (text.toLowerCase().includes(key.toLowerCase())) return mode;
    }
  }

  if (cat.toLowerCase().includes("jewellery") || cat.toLowerCase().includes("jewelry")) return "necklace";
  if (cat.toLowerCase().includes("electronics")) return "headphone";
  if (cat.toLowerCase().includes("fashion") || cat.toLowerCase().includes("clothing")) return "generic";
  return "generic";
}

// ══════════════════════════════════════════════════════════════════════════════
// Per-mode sizing configs — tuned per product type
// Adjusted dynamically against measured face geometry
// ══════════════════════════════════════════════════════════════════════════════

interface SizeConfig {
  widthRatio: number;   // ratio of face width
  heightRatio: number;  // ratio of face height  (0 = use widthRatio as square)
  xOffsetRatio: number; // fraction of faceW to shift X from centerX
  yOffsetRatio: number; // fraction of faceH to shift Y from anchor point
  anchorLandmarks: number[]; // LM indices used to compute anchor
  rotateWithFace: boolean;
}

const SIZE_CONFIG: Record<TryonMode, SizeConfig> = {
  crown: {
    widthRatio: 1.18, heightRatio: 0, xOffsetRatio: 0, yOffsetRatio: -0.52,
    anchorLandmarks: [LM.TOP_HEAD, LM.LEFT_TEMPLE, LM.RIGHT_TEMPLE],
    rotateWithFace: true,
  },
  hat: {
    widthRatio: 1.30, heightRatio: 0, xOffsetRatio: 0, yOffsetRatio: -0.58,
    anchorLandmarks: [LM.TOP_HEAD, LM.LEFT_TEMPLE, LM.RIGHT_TEMPLE],
    rotateWithFace: true,
  },
  glasses: {
    widthRatio: 1.02, heightRatio: 0.36, xOffsetRatio: 0, yOffsetRatio: -0.5,
    anchorLandmarks: [LM.LEFT_EYE_OUTER, LM.RIGHT_EYE_OUTER],
    rotateWithFace: true,
  },
  sunglasses: {
    widthRatio: 1.06, heightRatio: 0.38, xOffsetRatio: 0, yOffsetRatio: -0.5,
    anchorLandmarks: [LM.LEFT_EYE_OUTER, LM.RIGHT_EYE_OUTER],
    rotateWithFace: true,
  },
  earring: {
    widthRatio: 0.14, heightRatio: 0.30, xOffsetRatio: 0, yOffsetRatio: 0.05,
    anchorLandmarks: [LM.LEFT_EAR_LOBE, LM.RIGHT_EAR_LOBE],
    rotateWithFace: false,
  },
  earbud: {
    widthRatio: 0.12, heightRatio: 0.12, xOffsetRatio: 0, yOffsetRatio: 0,
    anchorLandmarks: [LM.LEFT_EAR_LOBE, LM.RIGHT_EAR_LOBE],
    rotateWithFace: false,
  },
  necklace: {
    widthRatio: 0.88, heightRatio: 0.48, xOffsetRatio: 0, yOffsetRatio: 0.10,
    anchorLandmarks: [LM.CHIN, LM.LEFT_JAW, LM.RIGHT_JAW],
    rotateWithFace: true,
  },
  headphone: {
    widthRatio: 1.38, heightRatio: 0, xOffsetRatio: 0, yOffsetRatio: -0.28,
    anchorLandmarks: [LM.LEFT_TEMPLE, LM.RIGHT_TEMPLE, LM.TOP_HEAD],
    rotateWithFace: true,
  },
  bracelet: {
    widthRatio: 0.30, heightRatio: 0.12, xOffsetRatio: 0, yOffsetRatio: 0,
    anchorLandmarks: [],
    rotateWithFace: false,
  },
  ring: {
    widthRatio: 0.10, heightRatio: 0.06, xOffsetRatio: 0, yOffsetRatio: 0,
    anchorLandmarks: [],
    rotateWithFace: false,
  },
  mask: {
    widthRatio: 0.90, heightRatio: 0.55, xOffsetRatio: 0, yOffsetRatio: -0.08,
    anchorLandmarks: [LM.LEFT_CHEEK, LM.RIGHT_CHEEK, LM.NOSE_TIP],
    rotateWithFace: true,
  },
  generic: {
    widthRatio: 0.88, heightRatio: 0, xOffsetRatio: 0, yOffsetRatio: 0.10,
    anchorLandmarks: [LM.TOP_HEAD, LM.CHIN],
    rotateWithFace: true,
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════════════════════

const SUBCATEGORY_ACCENTS: Record<string, string> = {
  Gold: "#c9a84c", Silver: "#b0b8c8", Diamond: "#89cff0",
  Pearl: "#e8e0d0", Platinum: "#d0d8f0", Crystal: "#b8f0f8",
  Rose: "#f0b8c8", Black: "#b8c0c8",
  default: "#c9a84c",
};

function accentFor(p: { subcategory?: string; subSubcategory?: string }): string {
  const s = p.subSubcategory ?? p.subcategory ?? "";
  for (const key of Object.keys(SUBCATEGORY_ACCENTS)) {
    if (key !== "default" && s.toLowerCase().includes(key.toLowerCase()))
      return SUBCATEGORY_ACCENTS[key];
  }
  return SUBCATEGORY_ACCENTS.default;
}

function currencySymbol(c?: string) {
  if (!c) return "৳";
  if (c.includes("$")) return "$";
  if (c.includes("€")) return "€";
  if (c.includes("£")) return "£";
  return "৳";
}

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

function pt(lm: any[], idx: number, W: number, H: number) {
  const l = lm[idx];
  return { x: l.x * W, y: l.y * H };
}

function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

const API_BASE = "http://localhost:5000";

// ══════════════════════════════════════════════════════════════════════════════
// Crown calibration
// ══════════════════════════════════════════════════════════════════════════════

interface CrownCalibration {
  foreheadRatio: number;
  yShiftMult: number;
  samples: number;
}

const CROWN_CAL_TARGET = 10;

function makeCrownCal(): CrownCalibration {
  return { foreheadRatio: 0.5, yShiftMult: 0.55, samples: 0 };
}

// ══════════════════════════════════════════════════════════════════════════════
// EMA smoother — per overlay element to reduce jitter
// ══════════════════════════════════════════════════════════════════════════════

class EMA {
  private alpha: number;
  private state: Record<string, number> = {};

  constructor(alpha = 0.35) { this.alpha = alpha; }

  smooth(key: string, value: number): number {
    if (this.state[key] === undefined) { this.state[key] = value; return value; }
    this.state[key] = this.state[key] * (1 - this.alpha) + value * this.alpha;
    return this.state[key];
  }

  reset() { this.state = {}; }
}

// ══════════════════════════════════════════════════════════════════════════════
// Skeleton loader
// ══════════════════════════════════════════════════════════════════════════════

function Skeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="tr-item" style={{ opacity: 0.22, pointerEvents: "none" }}>
          <div style={{ width: "100%", height: 52, background: "rgba(255,255,255,0.06)", borderRadius: 8 }} />
          <div style={{ width: "65%", height: 7, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginTop: 6 }} />
          <div style={{ width: "40%", height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 4, marginTop: 4 }} />
        </div>
      ))}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════════════

export default function VirtualTryon({ product }: TryonProps) {
  const videoRef     = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef   = useRef<HTMLImageElement>(null);
  const overlayLRef  = useRef<HTMLImageElement>(null);
  const overlayRRef  = useRef<HTMLImageElement>(null);

  const [running, setRunning]   = useState(false);
  const [status, setStatus]     = useState("idle");
  const [mpOk, setMpOk]         = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [items, setItems]             = useState<GalleryItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [subcats, setSubcats]         = useState<string[]>(["All"]);
  const [activeSub, setActiveSub]     = useState("All");
  const [subSubs, setSubSubs]         = useState<string[]>(["All"]);
  const [activeSubSub, setActiveSubSub] = useState("All");
  const [filtered, setFiltered]       = useState<GalleryItem[]>([]);

  const mode   = getModeForProduct(product);
  const config = MODE_CONFIG[mode];
  const sizeConf = SIZE_CONFIG[mode];

  const crownCal = useRef<CrownCalibration>(makeCrownCal());
  const ema      = useRef<EMA>(new EMA(0.4));

  const [selected, setSelected] = useState<GalleryItem | null>(() => {
    if (!product.images?.length) return null;
    return {
      id: product._id, label: product.nameEng,
      src: product.images[0].url, accent: accentFor(product),
      subcategory: product.subcategory ?? "",
      subSubcategory: product.subSubcategory ?? "",
      price: product.price, currency: product.currency,
    };
  });

  const subSubcategoryKey = product.subSubcategory ?? product.subcategory ?? "";

  useEffect(() => { crownCal.current = makeCrownCal(); ema.current.reset(); }, [mode]);

  // ── Fetch siblings ────────────────────────────────────────────────────────
  const fetchSiblings = useCallback(async () => {
    if (!subSubcategoryKey) { setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      const res = await fetch(`${API_BASE}/product/tryon/${encodeURIComponent(subSubcategoryKey)}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? "Unknown error");

      const raw: Product[] = json.data;
      const gallery: GalleryItem[] = raw
        .filter((p) => p.images?.length)
        .map((p) => ({
          id: p._id, label: p.nameEng,
          src: p.images![0].url, accent: accentFor(p),
          subcategory: p.subcategory ?? "", subSubcategory: p.subSubcategory ?? "",
          price: p.price, currency: p.currency,
        }));

      setItems(gallery);
      setSubcats(["All", ...uniq(gallery.map((i) => i.subcategory))]);
      const found = gallery.find((g) => g.id === product._id);
      if (found) setSelected(found);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [subSubcategoryKey, product._id]);

  useEffect(() => { fetchSiblings(); }, [fetchSiblings]);
  useEffect(() => { startCamera(); }, []); // eslint-disable-line

  useEffect(() => {
    const src = activeSub === "All" ? items : items.filter((i) => i.subcategory === activeSub);
    setSubSubs(["All", ...uniq(src.map((i) => i.subSubcategory))]);
    setActiveSubSub("All");
  }, [activeSub, items]);

  useEffect(() => {
    let f = items;
    if (activeSub !== "All") f = f.filter((i) => i.subcategory === activeSub);
    if (activeSubSub !== "All") f = f.filter((i) => i.subSubcategory === activeSubSub);
    setFiltered(f);
  }, [items, activeSub, activeSubSub]);

  useEffect(() => {
    const src = selected?.src ?? "";
    if (overlayRef.current)  overlayRef.current.src  = src;
    if (overlayLRef.current) overlayLRef.current.src = src;
    if (overlayRRef.current) overlayRRef.current.src = src;
  }, [selected]);

  // ── MediaPipe ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoRef.current || !running) return;
    let cam: any, fm: any;

    async function init() {
      try {
        const { FaceMesh } = await import("@mediapipe/face_mesh");
        fm = new FaceMesh({
          locateFile: (f: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
        });
        fm.setOptions({
          maxNumFaces: 1, refineLandmarks: true,
          minDetectionConfidence: 0.5, minTrackingConfidence: 0.5,
        });
        fm.onResults(onResults);

        const { Camera } = await import("@mediapipe/camera_utils");
        cam = new Camera(videoRef.current, {
          onFrame: async () => { await fm.send({ image: videoRef.current }); },
          width: 1280, height: 720,
        });
        cam.start();
      } catch (e) {
        console.warn("Mediapipe unavailable", e);
        setMpOk(false);
      }
    }

    init();
    return () => { cam?.stop(); fm?.close?.(); };
  }, [running, mode]); // eslint-disable-line

  // ══════════════════════════════════════════════════════════════════════════
  // Overlay utilities
  // ══════════════════════════════════════════════════════════════════════════

  function hideAll() {
    for (const r of [overlayRef, overlayLRef, overlayRRef]) {
      if (r.current) r.current.style.opacity = "0";
    }
  }

  /**
   * applyOverlay — positions an <img> overlay with sub-pixel accuracy.
   * x, y = top-left corner in video-pane CSS pixels
   */
  function applyOverlay(
    el: HTMLImageElement | null,
    x: number, y: number, w: number, h: number,
    angleDeg: number,
    extraScale = 1
  ) {
    if (!el) return;
    const sx = ema.current.smooth(`${el.dataset.emaKey ?? "o"}_x`, x);
    const sy = ema.current.smooth(`${el.dataset.emaKey ?? "o"}_y`, y);
    const sw = ema.current.smooth(`${el.dataset.emaKey ?? "o"}_w`, w);
    const sh = ema.current.smooth(`${el.dataset.emaKey ?? "o"}_h`, h);
    const sa = ema.current.smooth(`${el.dataset.emaKey ?? "o"}_a`, angleDeg);

    el.style.opacity = "1";
    el.style.width   = `${sw * extraScale}px`;
    el.style.height  = `${sh}px`;
    el.style.transform = `translate(${sx}px,${sy}px) rotate(${sa}deg)`;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // getVideoMetrics — maps landmark coords to CSS coords in video-pane
  // ══════════════════════════════════════════════════════════════════════════

  function getVideoRect() {
    const v = videoRef.current;
    if (!v) return null;
    const vRect  = v.getBoundingClientRect();
    // intrinsic vs display aspect ratio → letterbox / pillarbox
    const iW = v.videoWidth  || 640;
    const iH = v.videoHeight || 480;
    const dW = vRect.width;
    const dH = vRect.height;

    // objectFit: cover → crop
    const scale  = Math.max(dW / iW, dH / iH);
    const rW     = iW * scale;
    const rH     = iH * scale;
    const offX   = (dW - rW) / 2;
    const offY   = (dH - rH) / 2;

    return { rW, rH, offX, offY, dW, dH, scale };
  }

  /** Convert normalized landmark coords → CSS px inside video pane */
  function lmPx(lmArr: any[], idx: number) {
    const r = getVideoRect();
    if (!r) return { x: 0, y: 0 };
    const l = lmArr[idx];
    return {
      x: l.x * r.rW + r.offX,
      y: l.y * r.rH + r.offY,
    };
  }

  function faceMetrics(lm: any[]) {
    const r = getVideoRect();
    if (!r) return null;

    const toP = (idx: number) => lmPx(lm, idx);

    const lTemple = toP(LM.LEFT_TEMPLE);
    const rTemple = toP(LM.RIGHT_TEMPLE);
    const topHead = toP(LM.TOP_HEAD);
    const chin    = toP(LM.CHIN);
    const lEye    = toP(LM.LEFT_EYE_OUTER);
    const rEye    = toP(LM.RIGHT_EYE_OUTER);
    const lEyeIn  = toP(LM.LEFT_EYE_INNER);
    const rEyeIn  = toP(LM.RIGHT_EYE_INNER);
    const nose    = toP(LM.NOSE_TIP);
    const lEar    = toP(LM.LEFT_EAR_LOBE);
    const rEar    = toP(LM.RIGHT_EAR_LOBE);
    const lJaw    = toP(LM.LEFT_JAW);
    const rJaw    = toP(LM.RIGHT_JAW);
    const lCheek  = toP(LM.LEFT_CHEEK);
    const rCheek  = toP(LM.RIGHT_CHEEK);
    const noseBr  = toP(LM.NOSE_BRIDGE);

    const faceW  = dist(lTemple, rTemple);
    const faceH  = dist(topHead, chin);
    const eyeW   = dist(lEye, rEye);
    const eyeMid = midpoint(lEye, rEye);
    const center = midpoint(lTemple, rTemple);
    const angle  = Math.atan2(rTemple.y - lTemple.y, rTemple.x - lTemple.x) * (180 / Math.PI);

    // bounding box top over all landmarks (to find actual head top)
    let minY = Infinity;
    for (const l of lm) {
      const py = l.y * r.rH + r.offY;
      if (py < minY) minY = py;
    }

    return {
      faceW, faceH, eyeW, eyeMid, center, angle,
      lTemple, rTemple, topHead, chin, lEye, rEye,
      lEyeIn, rEyeIn, nose, lEar, rEar, lJaw, rJaw,
      lCheek, rCheek, noseBr, minY,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // onResults — dispatches to per-mode placement
  // ══════════════════════════════════════════════════════════════════════════

  function onResults(results: any) {
    if (!results.multiFaceLandmarks?.length) {
      hideAll(); setStatus("no face"); return;
    }
    setStatus("face detected");

    const lm = results.multiFaceLandmarks[0];
    const m  = faceMetrics(lm);
    if (!m) return;

    switch (mode) {
      case "crown": return placeCrown(lm, m);
      case "hat":   return placeHat(m);
      case "glasses":
      case "sunglasses": return placeGlasses(m);
      case "earring":    return placeEarrings(m);
      case "earbud":     return placeEarbuds(m);
      case "necklace":   return placeNecklace(m);
      case "headphone":  return placeHeadphone(lm, m);
      case "mask":       return placeMask(m);
      default:           return placeGeneric(m);
    }
  }

  // ── CROWN: per-session auto-calibrated ────────────────────────────────────
  function placeCrown(lm: any[], m: ReturnType<typeof faceMetrics>) {
    if (!m) return;
    hideAll();

    const cal = crownCal.current;
    const rawRatio = (m.topHead.y - m.minY) / Math.max(m.faceH, 1);

    if (cal.samples < CROWN_CAL_TARGET) {
      const alpha = cal.samples === 0 ? 1.0 : 0.35;
      cal.foreheadRatio = cal.foreheadRatio * (1 - alpha) + rawRatio * alpha;
      cal.samples++;
      cal.yShiftMult = 0.62 - Math.min(cal.foreheadRatio, 0.28) * (0.32 / 0.28);
    }

    const crownW = m.faceW * sizeConf.widthRatio;
    const crownH = crownW;
    const crownTop = m.minY - crownW * cal.yShiftMult;

    applyOverlay(
      overlayRef.current,
      m.center.x - crownW / 2, crownTop,
      crownW, crownH, m.angle
    );
  }

  // ── HAT ───────────────────────────────────────────────────────────────────
  function placeHat(m: ReturnType<typeof faceMetrics>) {
    if (!m) return; hideAll();
    const w = m.faceW * sizeConf.widthRatio;
    const h = w * 0.75;
    const y = m.minY - w * 0.52;
    applyOverlay(overlayRef.current, m.center.x - w / 2, y, w, h, m.angle);
  }

  // ── GLASSES / SUNGLASSES ──────────────────────────────────────────────────
  function placeGlasses(m: ReturnType<typeof faceMetrics>) {
    if (!m) return; hideAll();
    // Use inter-eye width as primary reference for more accurate fit
    const w = m.eyeW * 1.38;
    const h = w * (sizeConf.heightRatio || 0.37);
    // Anchor on eye midpoint, centre of eye-sockets
    const x = m.eyeMid.x - w / 2;
    const y = m.eyeMid.y - h * 0.5;
    applyOverlay(overlayRef.current, x, y, w, h, m.angle);
  }

  // ── EARRINGS ──────────────────────────────────────────────────────────────
  function placeEarrings(m: ReturnType<typeof faceMetrics>) {
    if (!m) return;
    if (overlayRef.current) overlayRef.current.style.opacity = "0";

    // Earring hangs below the ear lobe
    const earW = m.faceW * sizeConf.widthRatio;
    const earH = earW * (sizeConf.heightRatio / sizeConf.widthRatio || 2.2);

    if (overlayLRef.current) overlayLRef.current.dataset.emaKey = "L";
    if (overlayRRef.current) overlayRRef.current.dataset.emaKey = "R";

    applyOverlay(
      overlayLRef.current,
      m.lEar.x - earW / 2, m.lEar.y + m.faceH * 0.04,
      earW, earH, 0
    );
    applyOverlay(
      overlayRRef.current,
      m.rEar.x - earW / 2, m.rEar.y + m.faceH * 0.04,
      earW, earH, 0
    );
  }

  // ── EARBUDS ───────────────────────────────────────────────────────────────
  function placeEarbuds(m: ReturnType<typeof faceMetrics>) {
    if (!m) return;
    if (overlayRef.current) overlayRef.current.style.opacity = "0";

    const bW = m.faceW * sizeConf.widthRatio;
    const bH = bW;

    if (overlayLRef.current) overlayLRef.current.dataset.emaKey = "L";
    if (overlayRRef.current) overlayRRef.current.dataset.emaKey = "R";

    // Earbuds sit inside ear canal — slightly inside ear position
    applyOverlay(
      overlayLRef.current,
      m.lEar.x - bW * 0.1, m.lEar.y - bH * 0.5,
      bW, bH, 0
    );
    applyOverlay(
      overlayRRef.current,
      m.rEar.x - bW * 0.9, m.rEar.y - bH * 0.5,
      bW, bH, 0
    );
  }

  // ── NECKLACE ──────────────────────────────────────────────────────────────
  function placeNecklace(m: ReturnType<typeof faceMetrics>) {
    if (!m) return; hideAll();

    const nkW = m.faceW * sizeConf.widthRatio;
    const nkH = nkW * (sizeConf.heightRatio / sizeConf.widthRatio || 0.5);
    // Place below chin with dynamic offset based on face height
    const nkY = m.chin.y + m.faceH * sizeConf.yOffsetRatio;
    applyOverlay(overlayRef.current, m.center.x - nkW / 2, nkY, nkW, nkH, m.angle);
  }

  // ── HEADPHONE ─────────────────────────────────────────────────────────────
  function placeHeadphone(lm: any[], m: ReturnType<typeof faceMetrics>) {
    if (!m) return; hideAll();

    const hpW = m.faceW * sizeConf.widthRatio;
    const hpH = hpW * 1.0;
    // Headphone spans above temples and down over ears
    const hpY = m.topHead.y - hpW * sizeConf.yOffsetRatio * -1;
    applyOverlay(overlayRef.current, m.center.x - hpW / 2, hpY, hpW, hpH, m.angle);
  }

  // ── MASK ──────────────────────────────────────────────────────────────────
  function placeMask(m: ReturnType<typeof faceMetrics>) {
    if (!m) return; hideAll();

    // Mask spans nose bridge down to chin
    const mW = m.faceW * sizeConf.widthRatio;
    const mH = mW * (sizeConf.heightRatio / sizeConf.widthRatio || 0.6);
    // Anchor: just below nose bridge, centred
    const mY = m.noseBr.y - m.faceH * 0.04;
    applyOverlay(overlayRef.current, m.center.x - mW / 2, mY, mW, mH, m.angle);
  }

  // ── GENERIC ───────────────────────────────────────────────────────────────
  function placeGeneric(m: ReturnType<typeof faceMetrics>) {
    if (!m) return; hideAll();
    const gW = m.faceW * sizeConf.widthRatio;
    const gH = gW;
    applyOverlay(
      overlayRef.current,
      m.center.x - gW / 2, m.topHead.y + m.faceH * sizeConf.yOffsetRatio,
      gW, gH, m.angle
    );
  }

  // ── Camera helpers ────────────────────────────────────────────────────────
  async function startCamera() {
    if (running) return;
    setStatus("starting…");
    try {
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      const constraints: MediaStreamConstraints = {
        video: isMobile
          ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setRunning(true); setStatus("running");
    } catch { setStatus("camera error"); }
  }

  function stopCamera() {
    try {
      (videoRef.current?.srcObject as MediaStream)?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch { }
    setRunning(false); setStatus("stopped"); hideAll();
    crownCal.current = makeCrownCal();
    ema.current.reset();
  }

  const dotColor =
    status === "face detected" ? "#3dbf7f" :
    status === "running"       ? "#c9a84c" :
    status === "camera error"  ? "#e05a5a" :
    "rgba(255,255,255,0.22)";

  const accent = selected?.accent ?? config.accentColor;

  const overlayStyle: React.CSSProperties = {
    position: "absolute", left: 0, top: 0,
    pointerEvents: "none", transformOrigin: "center center",
    opacity: 0,
    transition: "opacity 80ms linear",
    userSelect: "none", objectFit: "contain",
    willChange: "transform, opacity",
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Render
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{height:100%;width:100%;overflow:hidden;}

        /* ── Layout ── */
        .tr-page{
          height:100dvh; width:100vw; background:#08070e;
          display:flex; flex-direction:column; overflow:hidden;
          font-family:'DM Sans',sans-serif;
        }

        /* ── Topbar ── */
        .tr-topbar{
          display:flex; align-items:center; justify-content:space-between;
          padding:10px 16px; border-bottom:1px solid rgba(201,168,76,0.10);
          background:linear-gradient(90deg,rgba(201,168,76,0.05) 0%,transparent 60%);
          flex-shrink:0; min-height:50px; gap:8px;
        }
        .tr-topbar-left{display:flex;align-items:center;gap:10px;min-width:0;}
        .tr-back-btn{
          display:flex;align-items:center;gap:5px;padding:5px 12px;
          border-radius:8px; border:1px solid rgba(255,255,255,0.08);
          background:rgba(255,255,255,0.04); color:#777; cursor:pointer;
          font-size:0.68rem; letter-spacing:0.06em; white-space:nowrap;
          transition:color 0.15s,border-color 0.15s; text-decoration:none;
        }
        .tr-back-btn:hover{color:#e8e0d0;border-color:rgba(255,255,255,0.18);}
        .tr-title{
          font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700;
          color:#ede5cf; letter-spacing:0.04em; display:flex; align-items:center;
          gap:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .tr-title-badge{
          font-size:0.5rem; font-weight:500; letter-spacing:0.2em;
          text-transform:uppercase;
          background:linear-gradient(135deg,#c9a84c,#e8d08a); color:#1a1208;
          padding:2px 8px; border-radius:20px; flex-shrink:0;
          font-family:'DM Sans',sans-serif;
        }
        .tr-mode-pill{
          display:flex; align-items:center; gap:5px; padding:4px 12px;
          border-radius:20px; border:1px solid rgba(201,168,76,0.2);
          background:rgba(201,168,76,0.06); font-size:0.58rem;
          letter-spacing:0.1em; color:#c9a84c; text-transform:uppercase;
          white-space:nowrap; flex-shrink:0;
        }
        /* Mobile: hide mode pill, show hamburger */
        .tr-menu-btn{
          display:none; align-items:center; justify-content:center;
          width:34px; height:34px; border-radius:8px; flex-shrink:0;
          border:1px solid rgba(201,168,76,0.18); background:rgba(201,168,76,0.06);
          color:#c9a84c; cursor:pointer; font-size:1.1rem;
        }

        /* ── Product strip ── */
        .tr-product-strip{
          padding:7px 14px; border-bottom:1px solid rgba(201,168,76,0.07);
          display:flex; align-items:center; gap:11px; flex-shrink:0;
          background:rgba(201,168,76,0.02);
        }
        .tr-product-thumb{
          width:42px; height:42px; border-radius:8px; object-fit:contain;
          background:#111; border:1px solid rgba(201,168,76,0.15); padding:3px;
          filter:drop-shadow(0 2px 8px rgba(0,0,0,0.5)); flex-shrink:0;
        }
        .tr-product-info{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1;}
        .tr-product-name{
          font-family:'Playfair Display',serif; font-size:0.88rem; font-weight:500;
          color:#ede5cf; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .tr-product-meta{
          font-size:0.56rem; letter-spacing:0.1em; color:#4a4030;
          display:flex; align-items:center; gap:4px; flex-wrap:wrap;
        }
        .tr-product-price{
          flex-shrink:0; font-family:'Playfair Display',serif;
          font-size:0.95rem; font-weight:700; letter-spacing:0.02em;
        }

        /* ── Body: video + sidebar ── */
        .tr-body{
          display:flex; flex:1; min-height:0; overflow:hidden; position:relative;
        }

        /* ── Video pane ── */
        .tr-video-pane{
          flex:1; position:relative; background:#000;
          display:flex; align-items:stretch; overflow:hidden; min-width:0;
        }
        .tr-video-pane video{
          width:100%; height:100%; object-fit:cover; display:block;
        }
        .tr-badge{
          position:absolute; backdrop-filter:blur(8px);
          font-family:'DM Sans',sans-serif; border-radius:20px;
          border:1px solid rgba(255,255,255,0.07);
        }
        .tr-badge-status{
          left:10px; bottom:10px; background:rgba(0,0,0,0.62);
          padding:3px 10px; font-size:0.56rem; letter-spacing:0.14em;
          text-transform:uppercase; color:#fff;
          display:flex; align-items:center; gap:5px;
        }
        .tr-badge-name{
          top:10px; left:10px; background:rgba(0,0,0,0.68);
          border-color:rgba(201,168,76,0.14); padding:4px 11px;
          font-size:0.58rem; color:#ede5cf;
          display:flex; align-items:center; gap:5px; max-width:220px;
        }
        .tr-badge-name .name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .tr-badge-price{
          top:10px; right:10px; background:rgba(0,0,0,0.68);
          border-color:rgba(201,168,76,0.18); padding:4px 12px;
          font-family:'Playfair Display',serif; font-size:0.85rem; font-weight:500;
        }
        .tr-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}

        /* Crown calibration bar */
        .tr-cal-ring{
          position:absolute; bottom:38px; left:10px;
          display:flex; align-items:center; gap:5px;
          font-size:0.5rem; letter-spacing:0.12em; text-transform:uppercase;
          color:rgba(201,168,76,0.6); background:rgba(0,0,0,0.55);
          border-radius:20px; padding:3px 9px; backdrop-filter:blur(6px);
        }
        .tr-cal-dots{display:flex;gap:2px;}
        .tr-cal-dot{width:4px;height:4px;border-radius:50%;background:rgba(201,168,76,0.2);}
        .tr-cal-dot.lit{background:#c9a84c;}

        .tr-mode-watermark{
          position:absolute; bottom:36px; right:12px;
          font-size:2rem; opacity:0.10; pointer-events:none; user-select:none;
        }

        /* Camera off overlay */
        .tr-cam-off{
          position:absolute; inset:0; display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:12px;
          background:rgba(0,0,0,0.75); backdrop-filter:blur(6px);
        }
        .tr-cam-off-icon{font-size:3rem;filter:drop-shadow(0 0 18px rgba(201,168,76,0.4));}
        .tr-cam-off-text{font-size:0.68rem;letter-spacing:0.14em;text-transform:uppercase;color:#555;}
        .tr-cam-start{
          padding:9px 28px; border-radius:10px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#c9a84c,#e8d08a); color:#1a1208;
          font-size:0.8rem; font-weight:600; letter-spacing:0.09em;
          transition:opacity 0.15s,transform 0.12s;
          box-shadow:0 4px 20px rgba(201,168,76,0.35);
        }
        .tr-cam-start:hover{opacity:0.88;transform:scale(1.04);}

        /* ── Sidebar ── */
        .tr-sidebar{
          width:292px; flex-shrink:0; border-left:1px solid rgba(201,168,76,0.08);
          display:flex; flex-direction:column; overflow:hidden; background:#09080f;
          transition:transform 0.26s cubic-bezier(0.4,0,0.2,1);
        }
        .tr-sidebar-top{
          padding:10px 13px 9px;
          border-bottom:1px solid rgba(201,168,76,0.07); flex-shrink:0;
        }
        .tr-sidebar-label{font-size:0.48rem;letter-spacing:0.2em;text-transform:uppercase;color:#2e2a22;margin-bottom:3px;}
        .tr-sidebar-subcat{
          font-family:'Playfair Display',serif; font-size:0.92rem; font-weight:700;
          color:#c9a84c; letter-spacing:0.03em; display:flex; align-items:center; gap:6px;
        }
        .tr-controls{padding:9px 13px;border-bottom:1px solid rgba(201,168,76,0.07);flex-shrink:0;}
        .tr-section-label{font-size:0.48rem;letter-spacing:0.2em;text-transform:uppercase;color:#2e2a22;margin-bottom:6px;}
        .tr-btn-row{display:flex;gap:6px;}
        .tr-btn{
          flex:1; padding:7px 0; border-radius:9px; border:none; cursor:pointer;
          font-size:0.7rem; font-weight:500; letter-spacing:0.06em;
          transition:opacity 0.15s,transform 0.1s;
        }
        .tr-btn:active{transform:scale(0.97);}
        .tr-btn-gold{background:linear-gradient(135deg,#c9a84c,#e8d08a);color:#1a1208;box-shadow:0 2px 12px rgba(201,168,76,0.22);}
        .tr-btn-gold:disabled{opacity:0.35;cursor:default;box-shadow:none;}
        .tr-btn-dark{background:#161420;color:#777;border:1px solid rgba(201,168,76,0.1);}
        .tr-btn-dark:disabled{opacity:0.35;cursor:default;}

        .tr-filter-zone{padding:7px 13px 0;border-bottom:1px solid rgba(201,168,76,0.05);flex-shrink:0;}
        .tr-filter-label{font-size:0.47rem;letter-spacing:0.2em;text-transform:uppercase;color:#28241c;margin-bottom:4px;}
        .tr-tab-scroll{display:flex;gap:4px;overflow-x:auto;padding-bottom:7px;scrollbar-width:none;}
        .tr-tab-scroll::-webkit-scrollbar{display:none;}
        .tr-tab-l1{
          flex-shrink:0; padding:3px 10px; border-radius:20px; cursor:pointer;
          font-size:0.6rem; border:1px solid rgba(201,168,76,0.1);
          color:#4a3e28; background:transparent; transition:all 0.15s; white-space:nowrap;
        }
        .tr-tab-l1:hover:not(.active){color:#c9a84c;border-color:rgba(201,168,76,0.3);}
        .tr-tab-l1.active{background:linear-gradient(135deg,#c9a84c,#e8d08a);color:#1a1208;border-color:transparent;font-weight:600;}
        .tr-tab-l2{
          flex-shrink:0; padding:3px 9px; border-radius:20px; cursor:pointer;
          font-size:0.56rem; border:1px solid rgba(201,168,76,0.07);
          color:#38301e; background:transparent; transition:all 0.15s; white-space:nowrap;
        }
        .tr-tab-l2:hover:not(.active){color:#c9a84c;border-color:rgba(201,168,76,0.25);}
        .tr-tab-l2.active{background:rgba(201,168,76,0.12);color:#c9a84c;border-color:rgba(201,168,76,0.3);}

        .tr-count{
          padding:6px 13px 2px; flex-shrink:0; font-size:0.52rem;
          color:#262218; letter-spacing:0.15em; text-transform:uppercase;
          display:flex; align-items:center; gap:5px;
        }
        .tr-count-num{font-family:'Playfair Display',serif;font-size:0.84rem;font-weight:500;color:#40381e;letter-spacing:0;}

        .tr-gallery{
          flex:1; overflow-y:auto; padding:7px 10px 12px;
          display:grid; grid-template-columns:repeat(2,1fr); gap:6px; align-content:start;
        }
        .tr-gallery::-webkit-scrollbar{width:2px;}
        .tr-gallery::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.1);border-radius:4px;}

        .tr-item{
          position:relative; cursor:pointer; border-radius:9px;
          border:2px solid transparent; background:#111018;
          padding:7px 5px 6px; display:flex; flex-direction:column;
          align-items:center; gap:3px;
          transition:border-color 0.18s,background 0.18s,transform 0.14s,box-shadow 0.18s;
        }
        .tr-item:hover{transform:translateY(-2px);box-shadow:0 5px 16px rgba(0,0,0,0.5);}
        .tr-item.sel{
          border-color:var(--ac);
          background:color-mix(in srgb,var(--ac) 8%,#111018);
          box-shadow:0 0 0 1px color-mix(in srgb,var(--ac) 18%,transparent),0 4px 16px rgba(0,0,0,0.4);
        }
        .tr-item img{width:100%;height:46px;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.6));}
        .tr-item-label{font-size:0.50rem;text-align:center;color:#3e3828;line-height:1.25;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .tr-item.sel .tr-item-label{color:var(--ac);}
        .tr-item-sub{font-size:0.46rem;color:#28221a;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;}
        .tr-item.sel .tr-item-sub{color:color-mix(in srgb,var(--ac) 55%,#28221a);}
        .tr-item-price{font-family:'Playfair Display',serif;font-size:0.66rem;font-weight:500;color:#403820;}
        .tr-item.sel .tr-item-price{color:var(--ac);}
        .tr-sel-dot{position:absolute;top:4px;right:4px;width:6px;height:6px;border-radius:50%;background:var(--ac);}
        .tr-origin-badge{
          position:absolute;top:4px;left:4px;
          background:rgba(201,168,76,0.18);border:1px solid rgba(201,168,76,0.35);
          border-radius:4px;padding:1px 4px;font-size:0.40rem;letter-spacing:0.1em;color:#c9a84c;text-transform:uppercase;
        }
        .tr-empty{grid-column:span 2;padding:24px 10px;text-align:center;font-size:0.65rem;color:#252218;letter-spacing:0.08em;}
        .tr-retry{
          margin-top:9px;padding:5px 16px;border-radius:7px;
          background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.1);
          color:#7a6a40;cursor:pointer;font-size:0.62rem;transition:background 0.15s,color 0.15s;
        }
        .tr-retry:hover{background:rgba(201,168,76,0.14);color:#c9a84c;}

        /* ── Footer ── */
        .tr-footer{
          padding:9px 18px; border-top:1px solid rgba(201,168,76,0.08);
          display:flex; align-items:center; justify-content:space-between;
          flex-shrink:0; gap:10px; flex-wrap:wrap;
          background:linear-gradient(90deg,rgba(201,168,76,0.03) 0%,transparent 60%);
        }
        .tr-footer-info{
          font-size:0.64rem; color:#383020;
          display:flex; align-items:center; gap:7px; min-width:0; flex:1;
        }
        .tr-footer-name{color:#ede5cf;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;}
        .tr-footer-crumb{font-size:0.54rem;color:#24201a;white-space:nowrap;}
        .tr-footer-btns{display:flex;gap:7px;flex-shrink:0;}
        .tr-footer-btn{
          padding:7px 20px; border-radius:9px; border:none; cursor:pointer;
          font-size:0.72rem; font-weight:500; letter-spacing:0.07em;
          transition:opacity 0.15s,transform 0.1s;
        }
        .tr-footer-btn:active{transform:scale(0.97);}
        .tr-footer-btn.gold{background:linear-gradient(135deg,#c9a84c,#e8d08a);color:#1a1208;box-shadow:0 2px 12px rgba(201,168,76,0.25);}
        .tr-footer-btn.gold:disabled{opacity:0.35;cursor:default;box-shadow:none;}
        .tr-footer-btn.dark{background:#161420;color:#777;border:1px solid rgba(201,168,76,0.1);}
        .tr-footer-btn.dark:disabled{opacity:0.35;cursor:default;}

        /* ══ RESPONSIVE ══════════════════════════════════════════════════════ */

        /* Tablet: narrower sidebar */
        @media (max-width:900px) and (min-width:601px) {
          .tr-sidebar{ width:248px; }
        }

        /* Mobile: sidebar becomes a bottom drawer */
        @media (max-width:600px) {
          .tr-topbar{ padding:8px 12px; }
          .tr-mode-pill{ display:none; }
          .tr-menu-btn{ display:flex; }
          .tr-title{ font-size:0.9rem; }

          .tr-product-strip{ padding:6px 11px; gap:8px; }
          .tr-product-name{ font-size:0.78rem; }

          .tr-body{ flex-direction:column; overflow:visible; }

          /* Video takes full width, fixed aspect ratio */
          .tr-video-pane{
            width:100%; flex:none;
            aspect-ratio:4/3; height:auto;
            max-height:52dvh;
          }

          /* Sidebar slides up from bottom as a sheet */
          .tr-sidebar{
            position:fixed; bottom:0; left:0; right:0; top:auto;
            width:100%; max-height:70dvh;
            border-left:none; border-top:1px solid rgba(201,168,76,0.12);
            border-radius:18px 18px 0 0;
            transform:translateY(100%);
            z-index:40;
            box-shadow:0 -8px 40px rgba(0,0,0,0.6);
            overflow-y:auto;
          }
          .tr-sidebar.open{ transform:translateY(0); }

          /* Drag handle */
          .tr-sidebar::before{
            content:""; display:block; width:36px; height:3px;
            background:rgba(255,255,255,0.12); border-radius:2px;
            margin:10px auto 2px;
          }

          /* Bottom overlay bar replaces footer on mobile */
          .tr-footer{ flex-wrap:nowrap; padding:7px 12px; }
          .tr-footer-crumb{ display:none; }
          .tr-footer-name{ max-width:130px; }

          /* floating try-on btn on mobile */
          .tr-mobile-try-btn{
            display:flex;
          }
        }

        /* Large screens: give sidebar more room */
        @media (min-width:1400px) {
          .tr-sidebar{ width:340px; }
          .tr-gallery{ grid-template-columns:repeat(3,1fr); }
        }

        .tr-mobile-try-btn{
          display:none;
          position:fixed; bottom:68px; right:14px;
          z-index:50; align-items:center; gap:6px;
          padding:10px 18px; border-radius:24px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#c9a84c,#e8d08a); color:#1a1208;
          font-size:0.72rem; font-weight:600; letter-spacing:0.08em;
          box-shadow:0 4px 22px rgba(201,168,76,0.45);
          transition:transform 0.15s;
        }
        .tr-mobile-try-btn:active{ transform:scale(0.96); }

        /* Backdrop for mobile sidebar */
        .tr-backdrop{
          display:none; position:fixed; inset:0; z-index:39;
          background:rgba(0,0,0,0.5); backdrop-filter:blur(2px);
        }
        @media (max-width:600px){
          .tr-backdrop.open{ display:block; }
        }
      `}</style>

      <div className="tr-page">

        {/* Top bar */}
        <div className="tr-topbar">
          <div className="tr-topbar-left">
            <button className="tr-back-btn" onClick={() => window.history.back()}>← Back</button>
            <h1 className="tr-title">
              {config.icon} {config.label}
              <span className="tr-title-badge">Live AR</span>
            </h1>
          </div>
          <div className="tr-mode-pill">
            <span>{config.icon}</span>
            <span>{mode} mode</span>
          </div>
          {/* Mobile menu toggle */}
          <button className="tr-menu-btn" onClick={() => setSidebarOpen(v => !v)}>
            ≡
          </button>
        </div>

        {/* Product strip */}
        {product.images?.length ? (
          <div className="tr-product-strip">
            <img className="tr-product-thumb" src={product.images[0].url} alt={product.nameEng} />
            <div className="tr-product-info">
              <div className="tr-product-name">{product.nameEng}</div>
              <div className="tr-product-meta">
                {product.category && <span>📂 {product.category}</span>}
                {product.subcategory && <span>· {product.subcategory}</span>}
                {product.subSubcategory && <span>· {product.subSubcategory}</span>}
                {product.brand && <span>· {product.brand}</span>}
              </div>
            </div>
            {product.price != null && (
              <div className="tr-product-price" style={{ color: accent }}>
                {currencySymbol(product.currency)}{product.price.toLocaleString()}
              </div>
            )}
          </div>
        ) : null}

        {/* Body */}
        <div className="tr-body" ref={containerRef}>

          {/* Video pane */}
          <div className="tr-video-pane">
            <video ref={videoRef} playsInline muted />

            {/* Overlays */}
            {mpOk && (
              <>
                <img ref={overlayRef} alt="overlay" style={overlayStyle} />
                <img ref={overlayLRef} alt="overlay-left" style={overlayStyle} data-ema-key="L" />
                <img ref={overlayRRef} alt="overlay-right" style={overlayStyle} data-ema-key="R" />
              </>
            )}

            {selected && (
              <div className="tr-badge tr-badge-name">
                <span>{config.icon}</span>
                <span className="name">{selected.label}</span>
              </div>
            )}
            {selected?.price != null && (
              <div className="tr-badge tr-badge-price" style={{ color: selected.accent }}>
                {currencySymbol(selected.currency)}{selected.price.toLocaleString()}
              </div>
            )}
            <div className="tr-badge tr-badge-status">
              <span className="tr-dot" style={{ background: dotColor }} />
              {status}
            </div>

            {/* Crown calibration */}
            {mode === "crown" && running && crownCal.current.samples < CROWN_CAL_TARGET && (
              <div className="tr-cal-ring">
                <div className="tr-cal-dots">
                  {Array.from({ length: CROWN_CAL_TARGET }).map((_, i) => (
                    <div key={i} className={`tr-cal-dot${i < crownCal.current.samples ? " lit" : ""}`} />
                  ))}
                </div>
                calibrating
              </div>
            )}

            <div className="tr-mode-watermark">{config.icon}</div>

            {!running && (
              <div className="tr-cam-off">
                <span className="tr-cam-off-icon">{config.icon}</span>
                <span className="tr-cam-off-text">Allow camera access</span>
                <button className="tr-cam-start" onClick={startCamera}>▶ Start Camera</button>
              </div>
            )}
          </div>

          {/* Mobile backdrop */}
          <div className={`tr-backdrop${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

          {/* Sidebar */}
          <div className={`tr-sidebar${sidebarOpen ? " open" : ""}`}>
            <div className="tr-sidebar-top">
              <p className="tr-sidebar-label">Browsing style</p>
              <div className="tr-sidebar-subcat">
                <span>{config.icon}</span>
                <span>{subSubcategoryKey || product.category || "Products"}</span>
              </div>
            </div>

            <div className="tr-controls">
              <p className="tr-section-label">Camera</p>
              <div className="tr-btn-row">
                <button className="tr-btn tr-btn-gold" onClick={startCamera} disabled={running}>▶ Start</button>
                <button className="tr-btn tr-btn-dark" onClick={stopCamera} disabled={!running}>■ Stop</button>
              </div>
            </div>

            {!loading && subcats.length > 2 && (
              <div className="tr-filter-zone">
                <p className="tr-filter-label">Material</p>
                <div className="tr-tab-scroll">
                  {subcats.map((s) => (
                    <button key={s} className={`tr-tab-l1${activeSub === s ? " active" : ""}`}
                      onClick={() => setActiveSub(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {!loading && subSubs.length > 2 && (
              <div className="tr-filter-zone">
                <p className="tr-filter-label">Style</p>
                <div className="tr-tab-scroll">
                  {subSubs.map((s) => (
                    <button key={s} className={`tr-tab-l2${activeSubSub === s ? " active" : ""}`}
                      onClick={() => setActiveSubSub(s)}>{s === "All" ? "All styles" : s}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="tr-count">
              <span className="tr-count-num">{loading ? "—" : filtered.length}</span>
              item{filtered.length !== 1 ? "s" : ""} available
            </div>

            <div className="tr-gallery">
              {loading ? <Skeleton /> : error ? (
                <div className="tr-empty">
                  <p>⚠️ {error}</p>
                  <button className="tr-retry" onClick={fetchSiblings}>Retry</button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="tr-empty">
                  <p style={{ fontSize: "1.6rem", marginBottom: 8 }}>{config.icon}</p>
                  <p>No items match this filter</p>
                </div>
              ) : (
                filtered.map((item) => (
                  <div key={item.id}
                    className={`tr-item${selected?.id === item.id ? " sel" : ""}`}
                    style={{ "--ac": item.accent } as React.CSSProperties}
                    onClick={() => { setSelected(item); setSidebarOpen(false); }}
                    title={item.label}
                  >
                    {selected?.id === item.id && <span className="tr-sel-dot" />}
                    {item.id === product._id && <span className="tr-origin-badge">Current</span>}
                    <img src={item.src} alt={item.label} />
                    <span className="tr-item-label">{item.label}</span>
                    {(item.subcategory || item.subSubcategory) && (
                      <span className="tr-item-sub">
                        {[item.subcategory, item.subSubcategory].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    {item.price != null && (
                      <span className="tr-item-price">
                        {currencySymbol(item.currency)}{item.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="tr-footer">
          <div className="tr-footer-info">
            {selected ? (
              <>
                <span>{config.icon}</span>
                <span className="tr-footer-name">{selected.label}</span>
                {selected.price != null && (
                  <span style={{ color: selected.accent, fontFamily: "'Playfair Display',serif", fontSize: "0.88rem", fontWeight: 500 }}>
                    {currencySymbol(selected.currency)}{selected.price.toLocaleString()}
                  </span>
                )}
                {(selected.subcategory || selected.subSubcategory) && (
                  <span className="tr-footer-crumb">
                    {selected.subcategory}
                    {selected.subSubcategory ? ` › ${selected.subSubcategory}` : ""}
                  </span>
                )}
              </>
            ) : (
              <span style={{ color: "#1e1c18" }}>Select an item to preview</span>
            )}
          </div>
          <div className="tr-footer-btns">
            <button className="tr-footer-btn gold" onClick={startCamera} disabled={running}>▶ Start</button>
            <button className="tr-footer-btn dark" onClick={stopCamera} disabled={!running}>■ Stop</button>
          </div>
        </div>

        {/* Mobile FAB: open sidebar */}
        <button className="tr-mobile-try-btn" onClick={() => setSidebarOpen(v => !v)}>
          {config.icon} Browse Items
        </button>
      </div>
    </>
  );
}