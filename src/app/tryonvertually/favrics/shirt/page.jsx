
// 1st
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const SIZE_SCALE = {
  S: 0.88, M: 1.0, L: 1.1, XL: 1.2, XXL: 1.32, "3XL": 1.45,
};

// Per-garment rendering presets
const GARMENT_PRESETS = {
  shirt: {
    widthMult: 2.1, heightRatio: 1.4, neckOffY: 0.10,
    collarH: 0.08, hasCollar: true, hasButton: true, sleeveLen: 0.38,
  },
  tshirt: {
    widthMult: 1.95, heightRatio: 1.25, neckOffY: 0.12,
    collarH: 0.06, hasCollar: false, hasButton: false, sleeveLen: 0.20,
  },
  punjabi: {
    widthMult: 2.0, heightRatio: 2.0, neckOffY: 0.07,
    collarH: 0.10, hasCollar: true, hasButton: true, sleeveLen: 0.42,
  },
};

const CLOTHES = [
  { id: "shirt",   type: "shirt",   label: "Shirt",   icon: "👔" },
  { id: "tshirt",  type: "tshirt",  label: "T-Shirt", icon: "👕" },
  { id: "punjabi", type: "punjabi", label: "Punjabi", icon: "🧥" },
];

const COLORS = [
  "#2563eb", "#dc2626", "#16a34a", "#7c3aed",
  "#ea580c", "#0f172a", "#f8fafc", "#854d0e",
];

// ─────────────────────────────────────────────
// COLOR UTILITY
// ─────────────────────────────────────────────

function shadeColor(hex, amount) {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount));
  return `rgb(${r},${g},${b})`;
}

// ─────────────────────────────────────────────
// DRAWING FUNCTIONS
// ─────────────────────────────────────────────

function drawShirt(ctx, x, y, w, h, color, p) {
  const sl = w * p.sleeveLen;
  const sw = h * 0.22;
  const neckW = w * 0.18;
  const neckH = h * p.collarH;

  // Body
  const body = new Path2D();
  body.moveTo(x + w * 0.18, y + h * 0.05);
  body.lineTo(x, y + h * 0.12);
  body.lineTo(x, y + h);
  body.lineTo(x + w, y + h);
  body.lineTo(x + w, y + h * 0.12);
  body.lineTo(x + w * 0.82, y + h * 0.05);
  body.closePath();

  ctx.fillStyle = color;
  ctx.fill(body);

  // Vertical pinstripes (dress shirt texture)
  const prevAlpha = ctx.globalAlpha;
  ctx.strokeStyle = shadeColor(color, -15);
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = prevAlpha * 0.35;
  for (let i = x + 10; i < x + w - 5; i += 14) {
    ctx.beginPath();
    ctx.moveTo(i, y + h * 0.08);
    ctx.lineTo(i, y + h);
    ctx.stroke();
  }
  ctx.globalAlpha = prevAlpha;

  // Left sleeve
  const ls = new Path2D();
  ls.moveTo(x, y + h * 0.12);
  ls.lineTo(x - sl, y + h * 0.28);
  ls.lineTo(x - sl + sw * 0.4, y + h * 0.28 + sw);
  ls.lineTo(x + w * 0.08, y + h * 0.22);
  ls.closePath();
  ctx.fillStyle = shadeColor(color, -5);
  ctx.fill(ls);
  ctx.strokeStyle = shadeColor(color, -20);
  ctx.lineWidth = 1.5;
  ctx.stroke(ls);

  // Right sleeve
  const rs = new Path2D();
  rs.moveTo(x + w, y + h * 0.12);
  rs.lineTo(x + w + sl, y + h * 0.28);
  rs.lineTo(x + w + sl - sw * 0.4, y + h * 0.28 + sw);
  rs.lineTo(x + w * 0.92, y + h * 0.22);
  rs.closePath();
  ctx.fillStyle = shadeColor(color, -5);
  ctx.fill(rs);
  ctx.stroke(rs);

  // Collar
  const col = new Path2D();
  col.moveTo(x + w / 2 - neckW, y + h * 0.04);
  col.lineTo(x + w / 2, y + neckH * 1.2);
  col.lineTo(x + w / 2 + neckW, y + h * 0.04);
  col.closePath();
  ctx.fillStyle = shadeColor(color, 15);
  ctx.fill(col);
  ctx.strokeStyle = shadeColor(color, -25);
  ctx.lineWidth = 1;
  ctx.stroke(col);

  // Buttons
  ctx.fillStyle = shadeColor(color, 25);
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * (0.22 + i * 0.14), 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = shadeColor(color, -20);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // Outline
  ctx.strokeStyle = shadeColor(color, -30);
  ctx.lineWidth = 2;
  ctx.stroke(body);
}

function drawTShirt(ctx, x, y, w, h, color, p) {
  const sl = w * p.sleeveLen;
  const sw = h * 0.18;
  const neckW = w * 0.16;
  const neckH = h * p.collarH;

  const body = new Path2D();
  body.moveTo(x + w * 0.15, y + h * 0.04);
  body.lineTo(x + w * 0.05, y + h * 0.14);
  body.lineTo(x, y + h);
  body.lineTo(x + w, y + h);
  body.lineTo(x + w * 0.95, y + h * 0.14);
  body.lineTo(x + w * 0.85, y + h * 0.04);
  body.closePath();

  ctx.fillStyle = color;
  ctx.fill(body);

  // Fabric shading gradient
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, "rgba(255,255,255,0.07)");
  grad.addColorStop(0.5, "rgba(0,0,0,0.04)");
  grad.addColorStop(1, "rgba(0,0,0,0.12)");
  ctx.fillStyle = grad;
  ctx.fill(body);

  // Left sleeve (short)
  const ls = new Path2D();
  ls.moveTo(x + w * 0.05, y + h * 0.14);
  ls.lineTo(x - sl, y + h * 0.2);
  ls.lineTo(x - sl + sw * 0.5, y + h * 0.2 + sw);
  ls.lineTo(x + w * 0.12, y + h * 0.25);
  ls.closePath();
  ctx.fillStyle = shadeColor(color, -8);
  ctx.fill(ls);
  ctx.strokeStyle = shadeColor(color, -25);
  ctx.lineWidth = 1.5;
  ctx.stroke(ls);

  // Right sleeve
  const rs = new Path2D();
  rs.moveTo(x + w * 0.95, y + h * 0.14);
  rs.lineTo(x + w + sl, y + h * 0.2);
  rs.lineTo(x + w + sl - sw * 0.5, y + h * 0.2 + sw);
  rs.lineTo(x + w * 0.88, y + h * 0.25);
  rs.closePath();
  ctx.fillStyle = shadeColor(color, -8);
  ctx.fill(rs);
  ctx.stroke(rs);

  // Round neck
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h * 0.06, neckW, neckH, 0, 0, Math.PI * 2);
  ctx.fillStyle = shadeColor(color, -20);
  ctx.fill();
  ctx.strokeStyle = shadeColor(color, -35);
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.strokeStyle = shadeColor(color, -30);
  ctx.lineWidth = 2;
  ctx.stroke(body);
}

function drawPunjabi(ctx, x, y, w, h, color, p) {
  const sl = w * p.sleeveLen;
  const sw = h * 0.19;
  const neckH = h * p.collarH;
  const neckW = w * 0.1;

  // Long flared body
  const body = new Path2D();
  body.moveTo(x + w * 0.16, y + h * 0.04);
  body.lineTo(x + w * 0.05, y + h * 0.12);
  body.quadraticCurveTo(x - w * 0.04, y + h * 0.6, x + w * 0.03, y + h);
  body.lineTo(x + w * 0.97, y + h);
  body.quadraticCurveTo(x + w * 1.04, y + h * 0.6, x + w * 0.95, y + h * 0.12);
  body.lineTo(x + w * 0.84, y + h * 0.04);
  body.closePath();

  ctx.fillStyle = color;
  ctx.fill(body);

  // Fabric gradient
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, "rgba(255,255,255,0.08)");
  grad.addColorStop(1, "rgba(0,0,0,0.15)");
  ctx.fillStyle = grad;
  ctx.fill(body);

  // Side slits
  ctx.strokeStyle = shadeColor(color, -30);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.03, y + h);
  ctx.lineTo(x + w * 0.1, y + h * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.97, y + h);
  ctx.lineTo(x + w * 0.9, y + h * 0.8);
  ctx.stroke();

  // Full sleeves
  const ls = new Path2D();
  ls.moveTo(x + w * 0.05, y + h * 0.12);
  ls.lineTo(x - sl, y + h * 0.32);
  ls.lineTo(x - sl + sw * 0.35, y + h * 0.32 + sw * 0.8);
  ls.lineTo(x + w * 0.1, y + h * 0.26);
  ls.closePath();
  ctx.fillStyle = shadeColor(color, -5);
  ctx.fill(ls);
  ctx.strokeStyle = shadeColor(color, -25);
  ctx.lineWidth = 1.5;
  ctx.stroke(ls);

  const rs = new Path2D();
  rs.moveTo(x + w * 0.95, y + h * 0.12);
  rs.lineTo(x + w + sl, y + h * 0.32);
  rs.lineTo(x + w + sl - sw * 0.35, y + h * 0.32 + sw * 0.8);
  rs.lineTo(x + w * 0.9, y + h * 0.26);
  rs.closePath();
  ctx.fillStyle = shadeColor(color, -5);
  ctx.fill(rs);
  ctx.stroke(rs);

  // Mandarin collar
  const col = new Path2D();
  col.moveTo(x + w / 2 - neckW * 1.5, y + h * 0.03);
  col.lineTo(x + w / 2 - neckW * 1.5, y + h * 0.03 + neckH);
  col.quadraticCurveTo(x + w / 2, y + h * 0.03 + neckH * 1.3, x + w / 2 + neckW * 1.5, y + h * 0.03 + neckH);
  col.lineTo(x + w / 2 + neckW * 1.5, y + h * 0.03);
  col.closePath();
  ctx.fillStyle = shadeColor(color, 12);
  ctx.fill(col);
  ctx.strokeStyle = shadeColor(color, -25);
  ctx.lineWidth = 1;
  ctx.stroke(col);

  // Collar embroidery lines
  const prevAlpha = ctx.globalAlpha;
  ctx.strokeStyle = shadeColor(color, 35);
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = prevAlpha * 0.7;
  for (let i = x + w / 2 - neckW * 1.3; i < x + w / 2 + neckW * 1.3; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, y + h * 0.04);
    ctx.lineTo(i, y + h * 0.04 + neckH * 0.8);
    ctx.stroke();
  }
  ctx.globalAlpha = prevAlpha;

  // Placket buttons
  for (let i = 0; i < 4; i++) {
    const by = y + h * (0.19 + i * 0.1);
    ctx.beginPath();
    ctx.arc(x + w / 2, by, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = shadeColor(color, 20);
    ctx.fill();
    ctx.strokeStyle = shadeColor(color, -15);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Bottom border trim
  ctx.strokeStyle = shadeColor(color, 25);
  ctx.lineWidth = 3;
  ctx.globalAlpha = prevAlpha * 0.6;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.08, y + h * 0.96);
  ctx.lineTo(x + w * 0.92, y + h * 0.96);
  ctx.stroke();
  ctx.globalAlpha = prevAlpha;

  ctx.strokeStyle = shadeColor(color, -30);
  ctx.lineWidth = 2;
  ctx.stroke(body);
}

function drawSkeleton(ctx, lsx, lsy, rsx, rsy, lhx, lhy, rhx, rhy, nosex, nosey, sx, sy, color) {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.lineCap = "round";

  const lines = [
    [lsx, lsy, rsx, rsy],
    [lsx, lsy, lhx, lhy],
    [rsx, rsy, rhx, rhy],
    [lhx, lhy, rhx, rhy],
    [sx, sy, nosex, nosey],
  ];

  lines.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  ctx.setLineDash([]);

  [[lsx, lsy], [rsx, rsy], [lhx, lhy], [rhx, rhy], [nosex, nosey], [sx, sy]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  ctx.restore();
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function ShirtTryOn() {
  const videoRef    = useRef(null);
  const skelCanvasRef  = useRef(null);
  const clothCanvasRef = useRef(null);
  const poseRef     = useRef(null);

  const [selectedType,  setSelectedType]  = useState("shirt");
  const [selectedColor, setSelectedColor] = useState("#2563eb");
  const [selectedSize,  setSelectedSize]  = useState("M");
  const [scale,         setScale]         = useState(1.0);
  const [yOffset,       setYOffset]       = useState(0);
  const [opacity,       setOpacity]       = useState(90);
  const [showSkeleton,  setShowSkeleton]  = useState(true);

  const [status,        setStatus]        = useState("Initializing camera...");
  const [bodyDetected,  setBodyDetected]  = useState(false);
  const [measurements,  setMeasurements]  = useState(null);
  const [fitScores,     setFitScores]     = useState(null);

  // Keep a mutable ref for rendering options so onResults closure always has fresh values
  const optRef = useRef({ selectedType, selectedColor, selectedSize, scale, yOffset, opacity, showSkeleton });
  useEffect(() => {
    optRef.current = { selectedType, selectedColor, selectedSize, scale, yOffset, opacity, showSkeleton };
  }, [selectedType, selectedColor, selectedSize, scale, yOffset, opacity, showSkeleton]);

  // ── Resize canvases to match the video element ──
  const resizeCanvases = useCallback(() => {
    const vid = videoRef.current;
    const sk  = skelCanvasRef.current;
    const cl  = clothCanvasRef.current;
    if (!vid || !sk || !cl) return;
    const rect = vid.getBoundingClientRect();
    const w = rect.width  || 960;
    const h = rect.height || 720;
    sk.width = w;  sk.height = h;
    cl.width = w;  cl.height = h;
  }, []);

  // ── Main result handler ──
  const onResults = useCallback((results) => {
    const sk = skelCanvasRef.current;
    const cl = clothCanvasRef.current;
    if (!sk || !cl) return;

    const skelCtx  = sk.getContext("2d");
    const clothCtx = cl.getContext("2d");
    const cw = cl.width, ch = cl.height;

    skelCtx.clearRect(0, 0, cw, ch);
    clothCtx.clearRect(0, 0, cw, ch);

    if (!results.poseLandmarks) {
      setBodyDetected(false);
      setStatus("No body detected — step back");
      return;
    }

    const lm = results.poseLandmarks;
    setBodyDetected(true);

    // Mirror X (video is mirrored via CSS)
    const mx = (nx) => (1 - nx) * cw;

    const lsx = mx(lm[11].x), lsy = lm[11].y * ch;
    const rsx = mx(lm[12].x), rsy = lm[12].y * ch;
    const lhx = mx(lm[23].x), lhy = lm[23].y * ch;
    const rhx = mx(lm[24].x), rhy = lm[24].y * ch;
    const nosex = mx(lm[0].x), nosey = lm[0].y * ch;

    // Derived points
    const sx = (lsx + rsx) / 2;
    const sy = (lsy + rsy) / 2;
    const hx = (lhx + rhx) / 2;
    const hy = (lhy + rhy) / 2;

    // Pixel measurements
    const shoulderWidth = Math.abs(rsx - lsx);
    const torsoHeight   = Math.abs(hy - sy);
    const hipWidth      = Math.abs(rhx - lhx);

    // Neck: interpolate between shoulder midpoint and nose
    const neckY = sy - Math.abs(sy - nosey) * 0.28;

    // Shoulder tilt angle (radians)
    const shoulderAngle = Math.atan2(rsy - lsy, rsx - lsx);

    // Depth (z) for slight 3-D scaling
    const avgZ = ((lm[11].z || 0) + (lm[12].z || 0)) / 2;
    const depthScale = Math.max(0.85, Math.min(1.15, 1 + avgZ * 0.6));

    // Update React state for measurements panel
    const px2cm = (px) => ((px / cw) * 50).toFixed(1);
    setMeasurements({
      shoulder: px2cm(shoulderWidth),
      torso:    px2cm(torsoHeight),
      hip:      px2cm(hipWidth),
      chest:    px2cm(shoulderWidth * 0.9),
    });

    const opts = optRef.current;
    const p = GARMENT_PRESETS[opts.selectedType];
    const sizeScale = SIZE_SCALE[opts.selectedSize] ?? 1.0;
    const finalScale = sizeScale * opts.scale * depthScale;

    const baseW = shoulderWidth * p.widthMult * finalScale;
    const baseH = baseW * p.heightRatio;
    const leftX = sx - baseW / 2;
    const topY  = neckY - baseH * p.neckOffY + opts.yOffset;

    // ── Draw skeleton ──
    if (opts.showSkeleton) {
      drawSkeleton(skelCtx, lsx, lsy, rsx, rsy, lhx, lhy, rhx, rhy, nosex, nosey, sx, sy, opts.selectedColor);
    }

    // ── Draw clothing ──
    clothCtx.save();
    clothCtx.globalAlpha = opts.opacity / 100;

    // Apply shoulder tilt
    const pivotX = sx;
    const pivotY = topY + baseH * p.neckOffY;
    clothCtx.translate(pivotX, pivotY);
    clothCtx.rotate(shoulderAngle * 0.45);
    clothCtx.translate(-pivotX, -pivotY);

    if (opts.selectedType === "shirt")   drawShirt(clothCtx, leftX, topY, baseW, baseH, opts.selectedColor, p);
    if (opts.selectedType === "tshirt")  drawTShirt(clothCtx, leftX, topY, baseW, baseH, opts.selectedColor, p);
    if (opts.selectedType === "punjabi") drawPunjabi(clothCtx, leftX, topY, baseW, baseH, opts.selectedColor, p);

    clothCtx.restore();

    // ── Fit analysis ──
    const shoulderFit = Math.min(100, Math.round((shoulderWidth / (cw * 0.2)) * 70));
    const lengthFit   = Math.min(100, Math.round((torsoHeight / (ch * 0.25)) * 80));
    setFitScores({ shoulder: shoulderFit, length: lengthFit, overall: Math.round((shoulderFit + lengthFit) / 2) });
    setStatus(`3D Fit Active · ${opts.selectedType} · ${opts.selectedSize}`);
  }, []);

  // ── Camera + MediaPipe init ──
  useEffect(() => {
    let cam;
    let poseInst;

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 960, height: 720, facingMode: "user" },
        });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;

        await new Promise((res) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            resizeCanvases();
            res();
          };
        });

        const { Pose }   = await import("@mediapipe/pose");
        const { Camera } = await import("@mediapipe/camera_utils");

        poseInst = new Pose({
          locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
        });

        poseInst.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        poseInst.onResults(onResults);
        poseRef.current = poseInst;

        cam = new Camera(videoRef.current, {
          onFrame: async () => {
            if (poseInst) await poseInst.send({ image: videoRef.current });
          },
          width: 960,
          height: 720,
        });

        cam.start();
        setStatus("Body tracking active");
      } catch (err) {
        console.error(err);
        setStatus("Camera / Pose error — check permissions");
      }
    }

    init();

    const handleResize = () => setTimeout(resizeCanvases, 200);
    window.addEventListener("resize", handleResize);

    return () => {
      cam?.stop?.();
      poseInst?.close?.();
      window.removeEventListener("resize", handleResize);
    };
  }, [onResults, resizeCanvases]);

  // ── Snapshot ──
  function takeSnapshot() {
    const cl = clothCanvasRef.current;
    const vid = videoRef.current;
    if (!cl || !vid) return;
    const snap = document.createElement("canvas");
    snap.width  = cl.width;
    snap.height = cl.height;
    const ctx = snap.getContext("2d");
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(vid, -snap.width, 0, snap.width, snap.height);
    ctx.restore();
    ctx.drawImage(skelCanvasRef.current, 0, 0);
    ctx.drawImage(cl, 0, 0);
    const a = document.createElement("a");
    a.href = snap.toDataURL("image/png");
    a.download = `tryon-${selectedType}-${selectedSize}.png`;
    a.click();
  }

  // ─────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-gray-950 text-white flex flex-col items-center p-5 gap-5">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-pink-400 to-teal-400 bg-clip-text text-transparent">
          ✦ Virtual Try-On Studio
        </h1>
        <p className="text-gray-500 text-sm mt-1">AI body detection · Dynamic clothing fit · Real-time rendering</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 w-full max-w-6xl">
        {/* ── Camera Area ── */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Camera box */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-black shadow-2xl shadow-indigo-950"
               style={{ aspectRatio: "4/3" }}>
            <video
              ref={videoRef}
              autoPlay playsInline muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />

            {/* Skeleton canvas (mirrored by CSS on video, but canvas draws corrected) */}
            <canvas ref={skelCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 5 }}
            />

            {/* Clothing canvas */}
            <canvas ref={clothCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 10 }}
            />

            {/* HUD top-left */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
              <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs backdrop-blur border ${
                bodyDetected ? "bg-black/70 border-teal-500/40" : "bg-black/70 border-gray-700"
              }`}>
                <span className={`w-2 h-2 rounded-full ${bodyDetected ? "bg-teal-400 shadow-[0_0_6px_#2dd4bf]" : "bg-gray-500"}`} />
                {status}
              </div>
            </div>

            {/* Measurements overlay */}
            {measurements && bodyDetected && (
              <div className="absolute bottom-3 right-3 z-20 bg-black/80 backdrop-blur border border-gray-700 rounded-xl p-3 text-xs min-w-[160px]">
                <div className="text-indigo-400 font-bold uppercase tracking-widest mb-2 text-[10px]">📐 Body Fit Data</div>
                {[["Shoulder", measurements.shoulder], ["Torso H", measurements.torso],
                  ["Hip W", measurements.hip], ["Chest W", measurements.chest]].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-gray-400 mb-1">
                    <span>{label}</span>
                    <span className="text-white font-medium">{val} cm</span>
                  </div>
                ))}
              </div>
            )}

            {/* No-body prompt */}
            {!bodyDetected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20">
                <div className="text-5xl mb-3">🧍</div>
                <p className="text-gray-400 text-sm">Stand back so your upper body is visible</p>
              </div>
            )}
          </div>

          {/* Fit Analysis */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Fit Analysis</h3>
            <div className="flex flex-col gap-2">
              {[
                ["Shoulder", fitScores?.shoulder ?? 0],
                ["Length",   fitScores?.length   ?? 0],
                ["Overall",  fitScores?.overall  ?? 0],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="text-gray-400 text-xs w-16">{label}</div>
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                  <div className="text-white text-xs font-semibold w-8 text-right">{val ? `${val}%` : "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Side Panel ── */}
        <div className="flex flex-col gap-4 w-full lg:w-72">
          {/* Garment picker */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Select Garment</h3>
            <div className="grid grid-cols-3 gap-2">
              {CLOTHES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedType(c.type)}
                  className={`rounded-xl py-3 text-center text-xs font-semibold transition-all border ${
                    selectedType === c.type
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                      : "border-gray-800 bg-gray-800/50 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <div className="text-2xl mb-1">{c.icon}</div>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Color</h3>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{ background: c }}
                  className={`w-7 h-7 rounded-full transition-all border-2 ${
                    selectedColor === c
                      ? "border-white scale-110 shadow-lg"
                      : "border-transparent hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Size</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(SIZE_SCALE).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`rounded-lg py-2 text-sm font-bold transition-all border ${
                    selectedSize === s
                      ? "bg-indigo-500 border-indigo-500 text-white shadow-[0_4px_15px_rgba(99,102,241,0.4)]"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-indigo-500 hover:text-indigo-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Fine Tune */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Fine Tune</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: "Width Scale", value: scale.toFixed(2) + "×", min: 0.7, max: 1.6, step: 0.01, state: scale, set: setScale },
                { label: "Vertical Offset", value: yOffset + "px", min: -100, max: 150, step: 1, state: yOffset, set: setYOffset },
                { label: "Opacity", value: opacity + "%", min: 40, max: 100, step: 1, state: opacity, set: setOpacity },
              ].map(({ label, value, min, max, step, state: val, set }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-indigo-400 font-semibold">{value}</span>
                  </div>
                  <input
                    type="range" min={min} max={max} step={step}
                    value={val}
                    onChange={(e) => set(Number(e.target.value))}
                    className="w-full h-1 rounded-full bg-gray-700 outline-none cursor-pointer accent-indigo-500"
                  />
                </div>
              ))}

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400">Show Skeleton</span>
                  <span className="text-indigo-400 font-semibold">{showSkeleton ? "On" : "Off"}</span>
                </div>
                <input
                  type="range" min={0} max={1} step={1}
                  value={showSkeleton ? 1 : 0}
                  onChange={(e) => setShowSkeleton(Number(e.target.value) === 1)}
                  className="w-full h-1 rounded-full bg-gray-700 outline-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex gap-3 w-full max-w-6xl">
        <button
          onClick={takeSnapshot}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm tracking-wide
            bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
            hover:from-indigo-400 hover:to-pink-400
            shadow-lg shadow-indigo-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          📸 Capture Snapshot
        </button>
        <button
          onClick={() => { setScale(1); setYOffset(0); setOpacity(90); }}
          className="px-6 py-3.5 rounded-xl font-bold text-sm text-gray-300
            bg-gray-800 border border-gray-700 hover:border-indigo-500 hover:text-indigo-300 transition-all"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
}

// 2nd

// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import shirt1 from "../../../assets/shirt.png";
// import shirt2 from "../../../assets/shirtfull.png";

// export default function ShirtTryOn() {
//   const videoRef = useRef(null);
//   const overlayRef = useRef(null);

//   const [selectedItem, setSelectedItem] = useState(null);
//   const [status, setStatus] = useState("Initializing camera...");
//   const [scale, setScale] = useState(1);
//   const [yOffset, setYOffset] = useState(0);
//   const [selectedSize, setSelectedSize] = useState("M");

//   // === Clothing gallery ===
//   const items = [
//     { id: "shirt1", src: shirt1.src, type: "shirt", label: "Shirt" },
//     { id: "tshirt1", src: shirt2.src, type: "tshirt", label: "T-Shirt" },
//     { id: "punjabi1", src: "/assets/clothes/punjabi1.png", type: "punjabi", label: "Punjabi" },
//   ];

//   // === Size scaling ===
//   const SIZE_SCALE = {
//     S: 0.9,
//     M: 1.0,
//     L: 1.1,
//     XL: 1.2,
//     XXL: 1.3,
//     "3XL": 1.4,
//   };

//   useEffect(() => {
//     let pose;
//     async function init() {
//       try {
//         const { Pose } = await import("@mediapipe/pose");
//         const { Camera } = await import("@mediapipe/camera_utils");

//         pose = new Pose({
//           locateFile: (file) =>
//             `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
//         });

//         pose.setOptions({
//           modelComplexity: 1,
//           smoothLandmarks: true,
//           enableSegmentation: false,
//           minDetectionConfidence: 0.5,
//           minTrackingConfidence: 0.5,
//         });

//         pose.onResults(onResults);

//         if (videoRef.current) {
//           const camera = new Camera(videoRef.current, {
//             onFrame: async () => {
//               await pose.send({ image: videoRef.current });
//             },
//             width: 960, // bigger video
//             height: 720,
//           });
//           camera.start();
//         }

//         setStatus("Camera active");
//       } catch (error) {
//         console.error("Pose init error:", error);
//         setStatus("Mediapipe load failed");
//       }
//     }

//     init();

//     return () => {
//       if (pose && pose.close) pose.close();
//     };
//   }, []);

//   // function onResults(results) {
//   //   if (!overlayRef.current || !videoRef.current) return;
//   //   const overlay = overlayRef.current;
//   //   const video = videoRef.current;

//   //   if (!results.poseLandmarks) {
//   //     overlay.style.opacity = 0;
//   //     setStatus("No body detected");
//   //     return;
//   //   }

//   //   const landmarks = results.poseLandmarks;
//   //   const leftShoulder = landmarks[11];
//   //   const rightShoulder = landmarks[12];
//   //   const leftHip = landmarks[23];
//   //   const rightHip = landmarks[24];
//   //   const neck1 = landmarks[9];
//   //   const neck2 = landmarks[10];

//   //   if (!leftShoulder || !rightShoulder || !neck1 || !neck2) {
//   //     overlay.style.opacity = 0;
//   //     setStatus("No upper body");
//   //     return;
//   //   }

//   //   const rect = video.getBoundingClientRect();
//   //   const lx = leftShoulder.x * rect.width;
//   //   const rx = rightShoulder.x * rect.width;
//   //   const sx = (lx + rx) / 2;
//   //   const ny = ((neck1.y + neck2.y) / 2) * rect.height;

//   //   const shoulderWidth = Math.abs(rx - lx);

//   //   // === Type-specific clothing presets ===
//   //   const presets = {
//   //     shirt: { widthScale: 2.3, heightRatio: 1.35, neckOffset: 0.14 },
//   //     tshirt: { widthScale: 2.1, heightRatio: 1.25, neckOffset: 0.12 },
//   //     punjabi: { widthScale: 2.5, heightRatio: 1.8, neckOffset: 0.1 },
//   //   };

//   //   const type = selectedItem?.type || "shirt";
//   //   const { widthScale, heightRatio, neckOffset } = presets[type];
//   //   const baseScale = SIZE_SCALE[selectedSize] ?? 1.0;

//   //   const overlayWidth = shoulderWidth * widthScale * scale * baseScale;
//   //   const overlayHeight = overlayWidth * heightRatio;
//   //   const left = sx - overlayWidth / 2;
//   //   const top = ny - overlayHeight * neckOffset + yOffset;

//   //   overlay.style.opacity = 1;
//   //   overlay.style.position = "absolute";
//   //   overlay.style.width = `${overlayWidth}px`;
//   //   overlay.style.height = `${overlayHeight}px`;
//   //   overlay.style.left = `${left}px`;
//   //   overlay.style.top = `${top}px`;
//   //   overlay.style.transition = "all 120ms ease-out";
//   //   overlay.style.pointerEvents = "none";
//   //   overlay.style.zIndex = 2;

//   //   setStatus(`Body detected (${type}, ${selectedSize})`);
//   // }

//   function onResults(results) {
//   if (!overlayRef.current || !videoRef.current) return;
//   const overlay = overlayRef.current;
//   const video = videoRef.current;

//   if (!results.poseLandmarks) {
//     overlay.style.opacity = 0;
//     setStatus("No body detected");
//     return;
//   }

//   const landmarks = results.poseLandmarks;
//   const leftShoulder = landmarks[11];
//   const rightShoulder = landmarks[12];
//   const leftHip = landmarks[23];
//   const rightHip = landmarks[24];
//   const neck1 = landmarks[9];
//   const neck2 = landmarks[10];

//   if (!leftShoulder || !rightShoulder || !neck1 || !neck2) {
//     overlay.style.opacity = 0;
//     setStatus("No upper body");
//     return;
//   }

//   const rect = video.getBoundingClientRect();

//   const lx = leftShoulder.x * rect.width;
//   const ly = leftShoulder.y * rect.height;

//   const rx = rightShoulder.x * rect.width;
//   const ry = rightShoulder.y * rect.height;

//   const sx = (lx + rx) / 2;
//   const sy = (ly + ry) / 2;

//   const ny = ((neck1.y + neck2.y) / 2) * rect.height;

//   const shoulderWidth = Math.abs(rx - lx);

//   // === 🔥 BODY ROTATION (3D EFFECT) ===
//   const shoulderAngle = Math.atan2(ry - ly, rx - lx) * (180 / Math.PI);

//   // depth illusion (forward/back lean)
//   const bodyDepth =
//     ((leftShoulder.z || 0) + (rightShoulder.z || 0)) / 2;

//   // === Type presets ===
//   const presets = {
//     shirt: { widthScale: 2.3, heightRatio: 1.35, neckOffset: 0.14 },
//     tshirt: { widthScale: 2.1, heightRatio: 1.25, neckOffset: 0.12 },
//     punjabi: { widthScale: 2.5, heightRatio: 1.8, neckOffset: 0.1 },
//   };

//   const type = selectedItem?.type || "shirt";
//   const { widthScale, heightRatio, neckOffset } = presets[type];
//   const baseScale = SIZE_SCALE[selectedSize] ?? 1.0;

//   // === Depth scaling ===
//   const depthScale = 1 + bodyDepth * 0.8;

//   const overlayWidth =
//     shoulderWidth * widthScale * scale * baseScale * depthScale;

//   const overlayHeight = overlayWidth * heightRatio;

//   const left = sx - overlayWidth / 2;
//   const top = ny - overlayHeight * neckOffset + yOffset;

//   // === APPLY 3D TRANSFORM ===
//   overlay.style.opacity = 1;
//   overlay.style.position = "absolute";
//   overlay.style.width = `${overlayWidth}px`;
//   overlay.style.height = `${overlayHeight}px`;
//   overlay.style.left = `${left}px`;
//   overlay.style.top = `${top}px`;

//   overlay.style.transform = `
//     perspective(1000px)
//     rotateZ(${shoulderAngle}deg)
//     rotateY(${shoulderAngle * 0.4}deg)
//     scale(${depthScale})
//   `;

//   overlay.style.transformOrigin = "top center";

//   overlay.style.transition = "all 100ms ease-out";
//   overlay.style.pointerEvents = "none";
//   overlay.style.zIndex = 2;

//   setStatus(`3D Fit Active (${type}, ${selectedSize})`);
// }

//   return (
//     <div className="relative min-h-screen bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
//       <h2 className="text-white text-3xl font-semibold mb-3">👕 Virtual Try-On</h2>
//       <p className="text-gray-400 text-sm mb-6">{status}</p>

//       {/* === Camera View === */}
//       <div className="relative w-[960px] h-[720px] rounded-2xl overflow-hidden shadow-2xl border border-gray-700 bg-black">
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="w-full h-full object-cover"
//         />
//         <AnimatePresence>
//           {selectedItem && (
//             <motion.img
//               key={selectedItem.id}
//               ref={overlayRef}
//               src={selectedItem.src}
//               alt={selectedItem.label}
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.3 }}
//               className="absolute"
//             />
//           )}
//         </AnimatePresence>
//       </div>

//       {/* === Clothing Gallery === */}
//       <div className="flex gap-4 mt-8 flex-wrap justify-center">
//         {items.map((item) => (
//           <motion.button
//             key={item.id}
//             onClick={() => setSelectedItem(item)}
//             whileHover={{ scale: 1.08 }}
//             whileTap={{ scale: 0.95 }}
//             className={`rounded-xl p-2 border ${
//               selectedItem?.id === item.id
//                 ? "border-blue-500 bg-gray-800"
//                 : "border-gray-700 bg-gray-800/50"
//             } hover:bg-gray-700 transition`}
//           >
//             <img
//               src={item.src}
//               alt={item.label}
//               className="w-24 h-24 object-contain rounded-lg"
//             />
//             <p className="text-gray-300 text-sm text-center mt-1">{item.label}</p>
//           </motion.button>
//         ))}
//       </div>

//       {/* === Size + Adjust Controls === */}
//       <div className="mt-6 w-[960px] max-w-full bg-gray-800/60 rounded-xl p-4 text-white space-y-4">
//         <div className="flex gap-6 flex-wrap justify-between items-center">
//           <div>
//             <label className="block mb-1 text-sm">Select Size</label>
//             <select
//               value={selectedSize}
//               onChange={(e) => setSelectedSize(e.target.value)}
//               className="bg-gray-900 border border-gray-700 rounded px-3 py-1"
//             >
//               {Object.keys(SIZE_SCALE).map((size) => (
//                 <option key={size} value={size}>
//                   {size}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="w-1/3">
//             <label className="block mb-1 text-sm">Scale</label>
//             <input
//               type="range"
//               min="0.8"
//               max="2.0"
//               step="0.01"
//               value={scale}
//               onChange={(e) => setScale(Number(e.target.value))}
//               className="w-full"
//             />
//             <div className="text-xs mt-1">Scale: {scale.toFixed(2)}</div>
//           </div>

//           <div className="w-1/3">
//             <label className="block mb-1 text-sm">Vertical Offset (Y)</label>
//             <input
//               type="range"
//               min="-200"
//               max="300"
//               step="1"
//               value={yOffset}
//               onChange={(e) => setYOffset(Number(e.target.value))}
//               className="w-full"
//             />
//             <div className="text-xs mt-1">Offset: {yOffset}px</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// 3rd

// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import shirt1 from "../../../assets/shirt.png";
// import shirt2 from "../../../assets/shirtfull.png";


// export default function ShirtTryOn() {
//   const videoRef = useRef(null);
//   const overlayRef = useRef(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [status, setStatus] = useState("Loading...");
//   const [scale, setScale] = useState(1);
//   const [yOffset, setYOffset] = useState(0);

//   useEffect(() => {
//     let pose;
//     async function init() {
//       try {
//         const { Pose } = await import("@mediapipe/pose");
//         const { Camera } = await import("@mediapipe/camera_utils");

//         pose = new Pose({
//           locateFile: (file) =>
//             `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
//         });

//         pose.setOptions({
//           modelComplexity: 1,
//           smoothLandmarks: true,
//           enableSegmentation: false,
//           minDetectionConfidence: 0.5,
//           minTrackingConfidence: 0.5,
//         });

//         pose.onResults(onResults);

//         if (videoRef.current) {
//           const camera = new Camera(videoRef.current, {
//             onFrame: async () => {
//               await pose.send({ image: videoRef.current });
//             },
//             width: 640,
//             height: 480,
//           });
//           camera.start();
//         }

//         setStatus("Camera ready");
//       } catch (error) {
//         console.error("Pose init error:", error);
//         setStatus("Mediapipe load failed");
//       }
//     }

//     init();

//     return () => {
//       if (pose && pose.close) pose.close();
//     };
//   }, []);

//   function onResults(results) {
//     if (!overlayRef.current || !videoRef.current) return;
//     const overlay = overlayRef.current;
//     const video = videoRef.current;

//     if (!results.poseLandmarks) {
//       overlay.style.opacity = 0;
//       setStatus("No body detected");
//       return;
//     }

//     const landmarks = results.poseLandmarks;
//     const leftShoulder = landmarks[11];
//     const rightShoulder = landmarks[12];
//     const neck1 = landmarks[9];
//     const neck2 = landmarks[10];

//     if (!leftShoulder || !rightShoulder || !neck1 || !neck2) {
//       overlay.style.opacity = 0;
//       setStatus("No upper body detected");
//       return;
//     }

//     const rect = video.getBoundingClientRect();
//     const lx = leftShoulder.x * rect.width;
//     const rx = rightShoulder.x * rect.width;
//     const sx = (lx + rx) / 2;
//     const ny = ((neck1.y + neck2.y) / 2) * rect.height;
//     const shoulderWidth = Math.abs(rx - lx);

//     // === Auto Presets per clothing type ===
//     const presets = {
//       shirt: { widthScale: 2.3, heightRatio: 1.35, neckOffset: 0.15 },
//       tshirt: { widthScale: 2.1, heightRatio: 1.2, neckOffset: 0.12 },
//       punjabi: { widthScale: 2.4, heightRatio: 1.9, neckOffset: 0.1 },
//     };

//     const type = selectedItem?.type || "shirt";
//     const { widthScale, heightRatio, neckOffset } = presets[type];

//     const overlayWidth = shoulderWidth * widthScale * scale;
//     const overlayHeight = overlayWidth * heightRatio;
//     const left = sx - overlayWidth / 2;
//     const top = ny - overlayHeight * neckOffset + yOffset;

//     overlay.style.opacity = 1;
//     overlay.style.position = "absolute";
//     overlay.style.width = `${overlayWidth}px`;
//     overlay.style.height = `${overlayHeight}px`;
//     overlay.style.left = `${left}px`;
//     overlay.style.top = `${top}px`;
//     overlay.style.transition = "all 150ms ease-in-out";
//     overlay.style.pointerEvents = "none";
//     overlay.style.zIndex = 2;

//     setStatus(`Body detected (${type})`);
//   }

//   // === Item gallery ===
//   const items = [
//     { id: "shirt1", src: shirt1.src, type: "shirt", label: "Shirt" },
//     { id: "tshirt1", src: shirt2.src, type: "tshirt", label: "T-Shirt" },
//     { id: "punjabi1", src: "/assets/clothes/punjabi1.png", type: "punjabi", label: "Punjabi" },
//   ];

//   return (
//     <div className="relative w-full h-screen bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
//       <h2 className="text-white text-2xl font-semibold mb-2">Virtual Try-On</h2>
//       <p className="text-gray-400 text-sm mb-4">{status}</p>

//       {/* Camera feed */}
//       <div className="relative w-[640px] h-[480px] rounded-2xl overflow-hidden shadow-lg border border-gray-700">
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="w-full h-full object-cover"
//         ></video>

//         {/* Overlay */}
//         <AnimatePresence>
//           {selectedItem && (
//             <motion.img
//               key={selectedItem.id}
//               ref={overlayRef}
//               src={selectedItem.src}
//               alt={selectedItem.type}
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.8 }}
//               transition={{ duration: 0.3 }}
//               className="absolute"
//             />
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Controls */}
//       <div className="flex gap-4 mt-6">
//         {items.map((item) => (
//           <motion.button
//             key={item.id}
//             onClick={() => setSelectedItem(item)}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.95 }}
//             className={`rounded-xl p-1 border ${
//               selectedItem?.id === item.id
//                 ? "border-blue-400"
//                 : "border-transparent"
//             } bg-gray-800 hover:bg-gray-700 transition`}
//           >
//             <img
//               src={item.src}
//               alt={item.label}
//               className="w-20 h-20 object-contain rounded-lg"
//             />
//             <p className="text-gray-300 text-sm text-center mt-1">
//               {item.label}
//             </p>
//           </motion.button>
//         ))}
//       </div>
//     </div>
//   );
// }









// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import shirt1 from "../../../assets/shirt.png";
// import shirt2 from "../../../assets/shirtfull.png";

// /*
//   Try-on Gallery Component
//   - Click a clothing thumbnail to preview it on camera
//   - Uses Mediapipe FaceMesh (dynamic import) to approximate chin and jaw
//   - Uses jaw width to scale the clothing overlay and places it under the chin
//   - Size selector shows measurements (from your provided chart)
//   - Manual scale / offset sliders allow fine positioning
//   - Replace the sample image paths with your real transparent PNG overlays
// */

// const CLOTHES = [
//   {
//     id: "tshirt-white",
//     title: "T-Shirt (White)",
//     // Use transparent PNGs (shirt artwork) in your public/images or import them
//     // Example using public folder: "/images/tshirt_white.png"
//     src: shirt1,
//     thumb: shirt1,
//   },
//   {
//     id: "shirt-blue",
//     title: "Shirt (Blue)",
//     src: shirt2,
//     thumb: shirt2,
//   },
//   {
//     id: "punjabi",
//     title: "Punjabi",
//     src: "/images/punjabi.png",
//     thumb: "/images/punjabi_thumb.png",
//   },
// ];

// const SIZE_TABLE = {
//   M: { chest: 40, length: 28.5, collar: 15.5 },
//   L: { chest: 42, length: 29, collar: 16 },
//   XL: { chest: 44, length: 30, collar: 16.5 },
//   XXL: { chest: 46, length: 30.5, collar: 17 },
//   "3XL": { chest: 48, length: 31, collar: 17.5 },
// };

// export default function Shirt() {
//   const videoRef = useRef(null);
//   const overlayRef = useRef(null);
//   const [currentCloth, setCurrentCloth] = useState(CLOTHES[0]);
//   const [running, setRunning] = useState(false);
//   const [status, setStatus] = useState("idle");
//   const [scale, setScale] = useState(1.0); // manual multiplier
//   const [yOffset, setYOffset] = useState(0); // manual vertical offset (px)
//   const [selectedSize, setSelectedSize] = useState("M");
//   const [mediapipeAvailable, setMediapipeAvailable] = useState(true);

//   // Create and start Mediapipe camera (dynamically)
//   async function createCamera(videoEl, faceMesh, onResults) {
//     try {
//       const { Camera } = await import("@mediapipe/camera_utils");
//       faceMesh.onResults(onResults);

//       return new Camera(videoEl, {
//         onFrame: async () => {
//           await faceMesh.send({ image: videoEl });
//         },
//         width: 640,
//         height: 480,
//       });
//     } catch (err) {
//       console.warn("Mediapipe Camera not available", err);
//       setMediapipeAvailable(false);
//       return null;
//     }
//   }

//   useEffect(() => {
//     if (!videoRef.current) return;
//     let cameraInstance = null;
//     let faceMesh = null;

//     async function init() {
//       try {
//         const { FaceMesh } = await import("@mediapipe/face_mesh");

//         faceMesh = new FaceMesh({
//           locateFile: (file) =>
//             `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
//         });

//         faceMesh.setOptions({
//           maxNumFaces: 1,
//           refineLandmarks: true,
//           minDetectionConfidence: 0.5,
//           minTrackingConfidence: 0.5,
//         });

//         cameraInstance = await createCamera(videoRef.current, faceMesh, onResults);
//         if (cameraInstance) cameraInstance.start();
//       } catch (err) {
//         console.warn("Mediapipe FaceMesh not available", err);
//         setMediapipeAvailable(false);
//       }
//     }

//     init();

//     return () => {
//       if (cameraInstance) cameraInstance.stop();
//       if (faceMesh?.close) faceMesh.close();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   function onResults(results) {
//     if (!overlayRef.current || !videoRef.current) return;

//     const overlay = overlayRef.current;
//     const video = videoRef.current;

//     if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
//       overlay.style.opacity = "0";
//       setStatus("no face");
//       return;
//     }
//     setStatus("face detected");
//     overlay.style.opacity = "1";

//     // Use first face
//     const landmarks = results.multiFaceLandmarks[0];
//     const rect = video.getBoundingClientRect();

//     // Landmarks used:
//     // 152: chin, 234: left jaw, 454: right jaw
//     // FaceMesh coordinates are normalized [0..1] relative to the video element
//     const chin = landmarks[152];
//     const leftJaw = landmarks[234];
//     const rightJaw = landmarks[454];

//     // calculate center and approximate width
//     const cx = chin.x * rect.width;
//     const cy = chin.y * rect.height;
//     const lx = leftJaw.x * rect.width;
//     const rx = rightJaw.x * rect.width;
//     const jawWidth = Math.abs(rx - lx);

//     // Placement strategy:
//     // - center X = chin.x
//     // - top Y = chin.y - (some multiplier of overlay height) (we want collar area)
//     // - width = jawWidth * factor * scale (manual)
//     // NOTE: FaceMesh only covers face; to cover full shirt horizontally we enlarge by factor
//     const baseWidth = jawWidth * 2.2; // tune this factor to make overlay wider than jaw
//     const finalWidth = baseWidth * scale;
//     const overlayWidthPx = Math.max(80, finalWidth); // clamp minimal width

//     // compute left (so overlay centered horizontally at cx)
//     const leftPx = cx - overlayWidthPx / 2;

//     // compute top: we want overlay to start a bit below chin (collar area)
//     // move overlay down by a multiplier of jaw-to-chin vertical difference
//     const topPx = cy + 5 + Number(yOffset); // allow manual yOffset control

//     // apply styles
//     overlay.style.width = `${overlayWidthPx}px`;
//     overlay.style.left = `${leftPx}px`;
//     overlay.style.top = `${topPx}px`;
//     overlay.style.pointerEvents = "none";
//     overlay.style.transform = `translate(0, 0)`;
//     overlay.style.transition = `left 60ms linear, top 60ms linear, width 60ms linear`;
//   }

//   async function handleStartCamera() {
//     if (running) return;
//     setStatus("starting camera...");
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480 },
//         audio: false,
//       });
//       const video = videoRef.current;
//       video.srcObject = stream;
//       await video.play();
//       setRunning(true);
//       setStatus("camera running");
//     } catch (err) {
//       console.error("camera error:", err);
//       setStatus("camera error");
//     }
//   }

//   function handleStopCamera() {
//     if (!running) return;
//     const video = videoRef.current;
//     try {
//       const stream = video.srcObject;
//       if (stream) stream.getTracks().forEach((t) => t.stop());
//       video.srcObject = null;
//     } catch (e) {
//       console.warn(e);
//     } finally {
//       setRunning(false);
//       setStatus("stopped");
//       if (overlayRef.current) overlayRef.current.style.opacity = 0;
//     }
//   }

//   // When user switches cloth we set the overlay src
//   useEffect(() => {
//     if (overlayRef.current) {
//       overlayRef.current.src = currentCloth.src;
//       // quick hide & show to avoid flicker when no face:
//       overlayRef.current.style.opacity = 0;
//       setTimeout(() => {
//         if (overlayRef.current) overlayRef.current.style.opacity = 1;
//       }, 60);
//     }
//   }, [currentCloth]);

//   return (
//     <div className="p-4" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
//       <h2 className="text-xl font-semibold mb-3">Try-On: Shirt / T-Shirt / Punjabi</h2>

//       <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
//         {/* Camera + overlay */}
//         <div style={{ position: "relative", width: 640, maxWidth: "100%" }}>
//           <video
//             ref={videoRef}
//             style={{
//               width: "100%",
//               borderRadius: 12,
//               background: "#000",
//               display: "block",
//             }}
//             playsInline
//             muted
//           />

//           <img
//             ref={overlayRef}
//             alt="clothing overlay"
//             style={{
//               position: "absolute",
//               left: 0,
//               top: 0,
//               opacity: 0,
//               pointerEvents: "none",
//               transformOrigin: "center top",
//               userSelect: "none",
//             }}
//             // src will be set by effect when currentCloth changes
//           />

//           <div
//             style={{
//               position: "absolute",
//               left: 10,
//               bottom: 10,
//               background: "rgba(0,0,0,0.45)",
//               color: "#fff",
//               padding: "8px 10px",
//               borderRadius: 8,
//               fontSize: 13,
//             }}
//           >
//             {status}
//             {mediapipeAvailable ? "" : " — Mediapipe not available"}
//           </div>
//         </div>

//         {/* Controls */}
//         <div style={{ width: 320, maxWidth: "100%" }}>
//           <div className="mb-3">
//             <button
//               onClick={handleStartCamera}
//               className="px-3 py-2 rounded mr-2"
//               style={{ background: "#06b6d4", color: "#fff" }}
//             >
//               Start
//             </button>
//             <button
//               onClick={handleStopCamera}
//               className="px-3 py-2 rounded"
//               style={{ background: "#ef4444", color: "#fff" }}
//             >
//               Stop
//             </button>
//           </div>

//           <div className="mb-3">
//             <label className="block font-medium mb-1">Choose item</label>
//             <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//               {CLOTHES.map((c) => (
//                 <button
//                   key={c.id}
//                   onClick={() => setCurrentCloth(c)}
//                   style={{
//                     border:
//                       currentCloth.id === c.id
//                         ? "2px solid #065f46"
//                         : "1px solid #ddd",
//                     padding: 4,
//                     borderRadius: 8,
//                     background: "#fff",
//                     cursor: "pointer",
//                     width: 86,
//                     height: 86,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                   title={c.title}
//                 >
//                   <img
//                     src={c.thumb.src}
//                     alt={c.title}
//                     style={{ maxWidth: "100%", maxHeight: "100%" }}
//                   />
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="mb-3">
//             <label className="block font-medium mb-1">Select size</label>
//             <select
//               value={selectedSize}
//               onChange={(e) => setSelectedSize(e.target.value)}
//               style={{
//                 width: "100%",
//                 padding: "8px 10px",
//                 borderRadius: 8,
//                 border: "1px solid #ddd",
//               }}
//             >
//               {Object.keys(SIZE_TABLE).map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select>

//             <div style={{ marginTop: 8, fontSize: 13 }}>
//               <strong>Measurements (in)</strong>
//               <div>
//                 Chest: {SIZE_TABLE[selectedSize].chest} — Length:{" "}
//                 {SIZE_TABLE[selectedSize].length} — Collar:{" "}
//                 {SIZE_TABLE[selectedSize].collar}
//               </div>
//             </div>
//           </div>

//           <div className="mb-3">
//             <label className="block font-medium mb-1">Scale</label>
//             <input
//               type="range"
//               min="0.6"
//               max="2.0"
//               step="0.01"
//               value={scale}
//               onChange={(e) => setScale(Number(e.target.value))}
//               style={{ width: "100%" }}
//             />
//             <div style={{ fontSize: 13, marginTop: 4 }}>Scale: {scale}</div>
//           </div>

//           <div className="mb-3">
//             <label className="block font-medium mb-1">Vertical offset</label>
//             <input
//               type="range"
//               min="-100"
//               max="200"
//               step="1"
//               value={yOffset}
//               onChange={(e) => setYOffset(Number(e.target.value))}
//               style={{ width: "100%" }}
//             />
//             <div style={{ fontSize: 13, marginTop: 4 }}>
//               Y Offset: {yOffset}px
//             </div>
//           </div>

//           <div style={{ fontSize: 13, color: "#555", marginTop: 8 }}>
//             Tip: Use scale & vertical offset to fine tune overlay. For best
//             results upload transparent PNGs sized approximately to the canvas
//             dimensions.
//           </div>
//         </div>
//       </div>

//       <hr style={{ margin: "18px 0" }} />

//       <div>
//         <h3 className="text-lg font-semibold mb-2">Size Chart (from image)</h3>
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(4, 1fr)",
//             gap: 8,
//             maxWidth: 640,
//             width: "100%",
//           }}
//         >
//           <div style={{ fontWeight: 700 }}>Size</div>
//           <div style={{ fontWeight: 700 }}>Chest (In)</div>
//           <div style={{ fontWeight: 700 }}>Length (In)</div>
//           <div style={{ fontWeight: 700 }}>Collar (In)</div>

//           {Object.entries(SIZE_TABLE).map(([k, v]) => (
//             <React.Fragment key={k}>
//               <div style={{ padding: "6px 8px", background: "#f3f8f2" }}>
//                 {k}
//               </div>
//               <div style={{ padding: "6px 8px", background: "#f3f8f2" }}>
//                 {v.chest}
//               </div>
//               <div style={{ padding: "6px 8px", background: "#f3f8f2" }}>
//                 {v.length}
//               </div>
//               <div style={{ padding: "6px 8px", background: "#f3f8f2" }}>
//                 {v.collar}
//               </div>
//             </React.Fragment>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
