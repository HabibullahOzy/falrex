"use client";
import React, { useEffect, useRef, useState } from "react";
import cap1 from "../../../assets/cap.png";
import cap2 from "../../../assets/capb0.png";
import cap3 from "../../../assets/capfow.png";
import capVideo from "../../../assets/cap.png";

export default function CaptryOn() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Initializing...");
  const [selectedCap, setSelectedCap] = useState({ type: "image", src: cap1.src });
  const [controls, setControls] = useState({ scale: 1.2, yOffset: 0.55 });

  const smoothRef = useRef({ x: 0, y: 0, scale: 1, rotateZ: 0 });
  const capImageRef = useRef(null);

  // Pre-load cap image into a persistent ref
  useEffect(() => {
    if (selectedCap.type !== "image") return;
    const img = new Image();
    img.src = selectedCap.src;
    capImageRef.current = img;
  }, [selectedCap]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let camera = null;
    let faceMesh = null;

    async function init() {
      try {
        const [{ FaceMesh }, { Camera }] = await Promise.all([
          import("@mediapipe/face_mesh"),
          import("@mediapipe/camera_utils"),
        ]);

        faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        const canvasEl = canvasRef.current;
        const ctx = canvasEl.getContext("2d");

        const smooth = (cur, target, f = 0.18) => cur + (target - cur) * f;

        const onResults = (results) => {
          ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

          if (!results.multiFaceLandmarks?.length) {
            setStatus("No face detected");
            return;
          }

          const landmarks = results.multiFaceLandmarks[0];
          const w = canvasEl.width;
          const h = canvasEl.height;

          // Ear-to-ear width for scale
          const leftEar  = landmarks[234];
          const rightEar = landmarks[454];
          const topHead  = landmarks[10];   // crown / forehead top

          const earDx = (rightEar.x - leftEar.x) * w;
          const earDy = (rightEar.y - leftEar.y) * h;
          const headWidth = Math.hypot(earDx, earDy);
          const rotateZ   = Math.atan2(earDy, earDx);

          // Cap anchor: horizontally centred between ears, vertically at the crown
          const anchorX = ((leftEar.x + rightEar.x) / 2) * w;
          const anchorY = topHead.y * h;

          // Cap dimensions (cap image aspect ratio ≈ 2:1 wide)
          const capW = headWidth * 1.55 * controls.scale;
          const capH = capW * 0.55; // adjust to your image's actual aspect ratio

          // How far above the anchor the cap sits (yOffset = 0–1, 0 = flush, 1 = fully above)
          const capTop = anchorY - capH * (0.5 + controls.yOffset);

          // Smooth all values
          const s = smoothRef.current;
          s.x       = smooth(s.x,       anchorX);
          s.y       = smooth(s.y,       capTop + capH / 2); // centre point for transform
          s.scale   = smooth(s.scale,   capW / 260);        // internal scale relative to base 260px draw size
          s.rotateZ = smooth(s.rotateZ, rotateZ);

          // Draw camera frame
          ctx.save();
          ctx.drawImage(results.image, 0, 0, w, h);

          // Move to cap center, rotate, draw cap centred on that point
          ctx.translate(s.x, s.y);
          ctx.rotate(s.rotateZ);

          const drawW = 260 * s.scale;
          const drawH = drawW * 0.55;

          if (selectedCap.type === "image" && capImageRef.current?.complete) {
            ctx.drawImage(capImageRef.current, -drawW / 2, -drawH / 2, drawW, drawH);
          } else if (selectedCap.type === "video") {
            const vid = document.getElementById("capVideoElement");
            if (vid && vid.readyState >= 2) {
              ctx.drawImage(vid, -drawW / 2, -drawH / 2, drawW, drawH);
            }
          }

          ctx.restore();
          setStatus("Tracking active ✓");
        };

        faceMesh.onResults(onResults);

        const cam = new Camera(videoRef.current, {
          onFrame: async () => {
            await faceMesh.send({ image: videoRef.current });
          },
          width: 960,
          height: 720,
        });

        cam.start();
        camera = cam;
        setStatus("Camera active");
      } catch (err) {
        console.error("FaceMesh init error:", err);
        setStatus("Initialization failed");
      }
    }

    init();

    return () => {
      if (camera) camera.stop();
      if (faceMesh?.close) faceMesh.close();
    };
  }, [selectedCap, controls]);

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-6">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay playsInline muted
          width="960" height="720"
          className="rounded-xl shadow-lg bg-black object-cover"
        />
        <canvas
          ref={canvasRef}
          width="960" height="720"
          className="absolute top-0 left-0 rounded-xl"
        />
        {selectedCap.type === "video" && (
          <video
            id="capVideoElement"
            src={selectedCap.src}
            loop muted autoPlay playsInline
            style={{ display: "none" }}
          />
        )}
      </div>

      <div className="w-full max-w-3xl bg-white/60 backdrop-blur-lg p-4 rounded-2xl shadow-lg">
        <p className="text-gray-700 text-center mb-3 font-medium">{status}</p>

        <div className="flex justify-center gap-8 mb-4">
          <div className="flex flex-col items-center gap-1">
            <label className="text-sm font-medium">Cap Size</label>
            <input
              type="range" min="0.5" max="2.0" step="0.01"
              value={controls.scale}
              onChange={(e) =>
                setControls((c) => ({ ...c, scale: parseFloat(e.target.value) }))
              }
              className="w-36"
            />
            <span className="text-xs text-gray-500">{controls.scale.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <label className="text-sm font-medium">Vertical Position</label>
            <input
              type="range" min="-0.5" max="1.0" step="0.01"
              value={controls.yOffset}
              onChange={(e) =>
                setControls((c) => ({ ...c, yOffset: parseFloat(e.target.value) }))
              }
              className="w-36"
            />
            <span className="text-xs text-gray-500">{controls.yOffset.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-3">
          {[
            { src: cap1.src, type: "image", label: "Cap 1" },
            { src: cap2.src, type: "image", label: "Cap 2" },
            { src: cap3.src, type: "image", label: "Cap 3" },
          ].map(({ src, type, label }) => (
            <img
              key={src}
              src={src}
              alt={label}
              onClick={() => setSelectedCap({ type, src })}
              className={`cursor-pointer rounded-lg border-4 object-contain bg-gray-100 h-20 ${
                selectedCap.src === src ? "border-blue-500" : "border-transparent"
              }`}
            />
          ))}
          <video
            src={capVideo}
            onClick={() => setSelectedCap({ type: "video", src: capVideo })}
            className={`cursor-pointer rounded-lg border-4 h-20 object-contain bg-gray-100 ${
              selectedCap.src === capVideo ? "border-blue-500" : "border-transparent"
            }`}
          />
        </div>
      </div>
    </div>
  );
}