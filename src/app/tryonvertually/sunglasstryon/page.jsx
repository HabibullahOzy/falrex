"use client";

import React, { useEffect, useRef, useState } from "react";
import img from "../../assets/glass.png";

// ─── Sunglass Gallery ────────────────────────────────────────────────────────
// Replace these src values with your actual imported images.
// e.g. import img from "../../assets/glass.png"; then use img.src
const GLASSES = [
  {
    id: 1,
    label: "Classic Aviator",
    src: img.src,
    emoji: "🕶️",
    accent: "#c9a84c",
  },
  {
    id: 2,
    label: "Round Retro",
    src: "https://pngimg.com/uploads/sunglasses/sunglasses_PNG152.png",
    emoji: "👓",
    accent: "#e07b5a",
  },
  {
    id: 3,
    label: "Wayfarer",
    src: "https://pngimg.com/uploads/sunglasses/sunglasses_PNG133.png",
    emoji: "🕶️",
    accent: "#5a7be0",
  },
  {
    id: 4,
    label: "Cat Eye",
    src: "https://pngimg.com/uploads/sunglasses/sunglasses_PNG41.png",
    emoji: "😎",
    accent: "#9b5ae0",
  },
  {
    id: 5,
    label: "Sport Wrap",
    src: "https://pngimg.com/uploads/sunglasses/sunglasses_PNG150.png",
    emoji: "🥽",
    accent: "#3dbf7f",
  },
];

export default function Sunglasstryon() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [mediapipeAvailable, setMediapipeAvailable] = useState(true);
  const [sizeLabel, setSizeLabel] = useState("Medium");
  const [faceWidthPx, setFaceWidthPx] = useState(0);

  // ─── Gallery state ───────────────────────────────────────────────────────
  const [selectedGlass, setSelectedGlass] = useState(GLASSES[0]);

  // ─── Keep overlay src in sync with selection ─────────────────────────────
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.src = selectedGlass.src;
    }
  }, [selectedGlass]);

  // ────────────────────────────────────────────────────────────────────────────
  // ALL CODE BELOW IS UNCHANGED FROM THE ORIGINAL
  // ────────────────────────────────────────────────────────────────────────────

  async function createCamera(videoElement, faceMesh, onResults) {
    try {
      const { Camera } = await import("@mediapipe/camera_utils");
      faceMesh.onResults(onResults);
      return new Camera(videoElement, {
        onFrame: async () => {
          await faceMesh.send({ image: videoElement });
        },
        width: 640,
        height: 480,
      });
    } catch (err) {
      console.warn("Camera not available, fallback to raw video loop.", err);
      setMediapipeAvailable(false);
      return null;
    }
  }

  useEffect(() => {
    if (!videoRef.current) return;
    let cameraInstance;
    let faceMesh;

    async function init() {
      try {
        const { FaceMesh } = await import("@mediapipe/face_mesh");
        faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        cameraInstance = await createCamera(
          videoRef.current,
          faceMesh,
          onResults
        );
        if (cameraInstance) cameraInstance.start();
      } catch (err) {
        console.warn("FaceMesh not available, showing raw video only.", err);
        setMediapipeAvailable(false);
      }
    }

    init();

    return () => {
      if (cameraInstance) cameraInstance.stop();
      if (faceMesh?.close) faceMesh.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const smoothState = useRef({ cx: null, cy: null, angle: null, overlayWidth: null });
  const SMOOTHING = 0.50;

  function onResults(results) {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      overlayRef.current.style.opacity = 0;
      setStatus("no face");
      return;
    }
    setStatus("face detected");
    const landmarks = results.multiFaceLandmarks[0];

    const LEFT_IRIS = [468, 469, 470, 471];
    const RIGHT_IRIS = [473, 474, 475, 476];

    const getCenter = (indices) => {
      let x = 0, y = 0;
      indices.forEach((i) => { x += landmarks[i].x; y += landmarks[i].y; });
      return { x: x / indices.length, y: y / indices.length };
    };

    const leftEye = getCenter(LEFT_IRIS);
    const rightEye = getCenter(RIGHT_IRIS);

    const video = videoRef.current;
    const rect = video.getBoundingClientRect();

    const lx = leftEye.x * rect.width;
    const ly = leftEye.y * rect.height;
    const rx = rightEye.x * rect.width;
    const ry = rightEye.y * rect.height;

    const cx = (lx + rx) / 2;
    const cy = (ly + ry) / 2;

    const eyeDist = Math.hypot(rx - lx, ry - ly);
    const angle = Math.atan2(ry - ly, rx - lx) * (180 / Math.PI);

    const LEFT_CHEEK = 234;
    const RIGHT_CHEEK = 454;
    const faceWidth = Math.hypot(
      (landmarks[RIGHT_CHEEK].x - landmarks[LEFT_CHEEK].x) * rect.width,
      (landmarks[RIGHT_CHEEK].y - landmarks[LEFT_CHEEK].y) * rect.height
    );

    let newSizeLabel = "Medium";
    let baseWidth = 2.6;

    if (faceWidth < 280) { newSizeLabel = "Small"; baseWidth = 2.2; }
    else if (faceWidth > 360) { newSizeLabel = "Large"; baseWidth = 3.0; }

    setSizeLabel(newSizeLabel);
    setFaceWidthPx(Math.round(faceWidth));

    const overlayWidth = eyeDist * baseWidth;

    const s = smoothState.current;
    const lerp = (prev, next) =>
      prev === null ? next : prev * (1 - SMOOTHING) + next * SMOOTHING;

    s.cx = lerp(s.cx, cx);
    s.cy = lerp(s.cy, cy);
    s.angle = lerp(s.angle, angle);
    s.overlayWidth = lerp(s.overlayWidth, overlayWidth);

    const overlay = overlayRef.current;
    if (!overlay) return;

    overlay.style.opacity = 1;

    const left = s.cx - s.overlayWidth / 2;
    const top = s.cy - overlay.clientHeight / 2;

    overlay.style.width = `${s.overlayWidth}px`;
    overlay.style.transform = `translate(${left}px, ${top}px) rotate(${s.angle}deg)`;
  }

  async function handleStart() {
    if (running) return;
    setStatus("starting...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      if (!mediapipeAvailable) {
        setRunning(true);
        setStatus("running (fallback: no face tracking)");
        return;
      }

      const { FaceMesh } = await import("@mediapipe/face_mesh");
      const faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      const camera = await createCamera(videoRef.current, faceMesh, onResults);
      if (camera) camera.start();

      videoRef.current._mpCamera = camera;
      videoRef.current._mpFaceMesh = faceMesh;

      setRunning(true);
      setStatus("running");
    } catch (err) {
      console.error(err);
      setStatus("camera error");
    }
  }

  function handleStop() {
    if (!running) return;
    const video = videoRef.current;
    try {
      const camObj = video._mpCamera;
      camObj && camObj.stop();
      const faceMesh = video._mpFaceMesh;
      faceMesh && faceMesh.close && faceMesh.close();
      const stream = video.srcObject;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    } catch (e) {
      console.warn(e);
    }
    setRunning(false);
    setStatus("stopped");
    overlayRef.current.style.opacity = 0;
  }

  // ─── Status badge color ──────────────────────────────────────────────────
  const statusColor =
    status === "face detected" ? "#3dbf7f"
    : status === "running" ? "#c9a84c"
    : status === "camera error" ? "#e05a5a"
    : "rgba(255,255,255,0.5)";

  return (
    <>
      {/* ── Global styles ───────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        .tryon-root {
          font-family: 'DM Sans', sans-serif;
          // background: #0d0d0f;
          color: #e8e6e0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px 40px;
          box-sizing: border-box;
        }

        .tryon-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .tryon-header h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2rem, 6vw, 3.4rem);
          letter-spacing: 0.12em;
          color: #f0ece4;
          margin: 0 0 4px;
        }
        .tryon-header p {
          font-size: 0.82rem;
          color: #888;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0;
        }

        /* ── Main layout ──────────────────────────────────────────────── */
        .tryon-layout {
          width: 100%;
          max-width: 1360px;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 780px) {
          .tryon-layout { grid-template-columns: 1fr; }
        }

        /* ── Video frame ─────────────────────────────────────────────── */
        .video-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          border-radius: 16px;
          overflow: hidden;
          background: #111;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 24px 60px rgba(0,0,0,0.7);
        }
        .video-wrapper video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 16px;
        }
        .video-wrapper img.overlay {
          position: absolute;
          left: 0;
          top: 0;
          pointer-events: none;
          transform-origin: center center;
          opacity: 0;
          transition: opacity 120ms linear, transform 120ms linear;
          user-select: none;
        }

        .status-badge {
          position: absolute;
          left: 12px;
          bottom: 12px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          color: #fff;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Selected glass badge */
        .selected-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          color: #e8e6e0;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* ── Sidebar ─────────────────────────────────────────────────── */
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .card {
          background: #17171a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 18px;
        }
        .card-title {
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #666;
          margin: 0 0 14px;
        }

        /* ── Controls ─────────────────────────────────────────────────── */
        .btn-row {
          display: flex;
          gap: 10px;
        }
        .btn {
          flex: 1;
          padding: 10px 0;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          transition: opacity 0.15s, transform 0.1s;
        }
        .btn:active { transform: scale(0.97); }
        .btn-start {
          background: #c9a84c;
          color: #0d0d0f;
        }
        .btn-start:disabled { opacity: 0.4; cursor: default; }
        .btn-stop {
          background: #2a2a2e;
          color: #e8e6e0;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .btn-stop:disabled { opacity: 0.4; cursor: default; }

        /* ── Size indicator ──────────────────────────────────────────── */
        .size-row {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }
        .size-chip {
          flex: 1;
          padding: 8px 0;
          border-radius: 8px;
          text-align: center;
          font-size: 0.78rem;
          letter-spacing: 0.04em;
          background: #222228;
          color: #555;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .size-chip.active {
          background: rgba(201,168,76,0.12);
          color: #c9a84c;
          border-color: rgba(201,168,76,0.35);
          font-weight: 500;
        }

        /* ── Gallery ─────────────────────────────────────────────────── */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 10px;
        }
        .gallery-item {
          position: relative;
          cursor: pointer;
          border-radius: 10px;
          border: 2px solid transparent;
          background: #222228;
          padding: 10px 8px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          transition: border-color 0.18s, background 0.18s, transform 0.15s;
        }
        .gallery-item:hover { transform: translateY(-2px); }
        .gallery-item.selected {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 10%, #222228);
        }
        .gallery-item img {
          width: 100%;
          height: 38px;
          object-fit: contain;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
        }
        .gallery-label {
          font-size: 0.6rem;
          letter-spacing: 0.04em;
          text-align: center;
          color: #777;
          line-height: 1.2;
        }
        .gallery-item.selected .gallery-label { color: var(--accent); }

        .selected-dot {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
        }
      `}</style>

      <div className="tryon-root">
        {/* Header */}
        <div className="tryon-header">
          {/* <h1>Virtual Try-On</h1> */}
          <p>Face-tracked sunglass fitting</p>
        </div>

        <div className="tryon-layout" ref={containerRef}>
          {/* ── Video frame ── */}
          <div className="video-wrapper">
            <video ref={videoRef} playsInline muted />

            {mediapipeAvailable && (
              <img
                ref={overlayRef}
                className="overlay"
                src={selectedGlass.src}
                alt="glasses overlay"
              />
            )}

            {/* Selected glass label */}
            <div className="selected-badge">
              <span>{selectedGlass.emoji}</span>
              <span>{selectedGlass.label}</span>
            </div>

            {/* Status */}
            <div className="status-badge">
              <span className="status-dot" style={{ background: statusColor }} />
              {status}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="sidebar">
            {/* Controls */}
            <div className="card">
              <p className="card-title">Camera</p>
              <div className="btn-row">
                <button className="btn btn-start" onClick={handleStart} disabled={running}>
                  ▶ Start
                </button>
                <button className="btn btn-stop" onClick={handleStop} disabled={!running}>
                  ■ Stop
                </button>
              </div>
            </div>

            {/* Sunglass Gallery */}
            <div className="card">
              <p className="card-title">Choose Glasses</p>
              <div className="gallery-grid">
                {GLASSES.map((g) => (
                  <div
                    key={g.id}
                    className={`gallery-item${selectedGlass.id === g.id ? " selected" : ""}`}
                    style={{ "--accent": g.accent }}
                    onClick={() => setSelectedGlass(g)}
                    title={g.label}
                  >
                    {selectedGlass.id === g.id && <span className="selected-dot" />}
                    <img src={g.src} alt={g.label} />
                    <span className="gallery-label">{g.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Size indicator */}
            <div className="card">
              <p className="card-title">Suggested Size · {faceWidthPx}px</p>
              <div className="size-row">
                {["Small", "Medium", "Large"].map((s) => (
                  <div key={s} className={`size-chip${sizeLabel === s ? " active" : ""}`}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}




// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import img from "../../assets/glass.png";
// import img1 from "../../assets/glass.png";
// import img2 from "../../assets/glass.png";

// export default function Sunglasstryon() {
//   const videoRef = useRef(null);
//   const containerRef = useRef(null);
//   const overlayRef = useRef(null);
//   const [running, setRunning] = useState(false);
//   const [status, setStatus] = useState("idle");
//   const [mediapipeAvailable, setMediapipeAvailable] = useState(true);
//   const [sizeLabel, setSizeLabel] = useState("Medium");
//   const [faceWidthPx, setFaceWidthPx] = useState(0);

//   async function createCamera(videoElement, faceMesh, onResults) {
//     try {
//       const { Camera } = await import("@mediapipe/camera_utils");
//       faceMesh.onResults(onResults);
//       return new Camera(videoElement, {
//         onFrame: async () => {
//           await faceMesh.send({ image: videoElement });
//         },
//         width: 640,
//         height: 480,
//       });
//     } catch (err) {
//       console.warn(
//         "Camera not available, fallback to raw video loop.",
//         err
//       );
//       setMediapipeAvailable(false);
//       return null;
//     }
//   }

//   useEffect(() => {
//     if (!videoRef.current) return;
//     let cameraInstance;
//     let faceMesh;

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

//         cameraInstance = await createCamera(
//           videoRef.current,
//           faceMesh,
//           onResults
//         );
//         if (cameraInstance) cameraInstance.start();
//       } catch (err) {
//         console.warn(
//           "FaceMesh not available, showing raw video only.",
//           err
//         );
//         setMediapipeAvailable(false);
//       }
//     }

//     init();

//     return () => {
//       if (cameraInstance) {
//         cameraInstance.stop();
//       }
//       if (faceMesh?.close) {
//         faceMesh.close();
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Smoothing state
//   const smoothState = useRef({
//     cx: null,
//     cy: null,
//     angle: null,
//     overlayWidth: null,
//   });
//   const SMOOTHING = 0.25;

//   function onResults(results) {
//     if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
//       overlayRef.current.style.opacity = 0;
//       setStatus("no face");
//       return;
//     }
//     setStatus("face detected");
//     const landmarks = results.multiFaceLandmarks[0];

//     // Iris indices
//     const LEFT_IRIS = [468, 469, 470, 471];
//     const RIGHT_IRIS = [473, 474, 475, 476];

//     // Average landmark helper
//     const getCenter = (indices) => {
//       let x = 0,
//         y = 0;
//       indices.forEach((i) => {
//         x += landmarks[i].x;
//         y += landmarks[i].y;
//       });
//       return { x: x / indices.length, y: y / indices.length };
//     };

//     const leftEye = getCenter(LEFT_IRIS);
//     const rightEye = getCenter(RIGHT_IRIS);

//     const video = videoRef.current;
//     const rect = video.getBoundingClientRect();

//     const lx = leftEye.x * rect.width;
//     const ly = leftEye.y * rect.height;
//     const rx = rightEye.x * rect.width;
//     const ry = rightEye.y * rect.height;

//     const cx = (lx + rx) / 2;
//     const cy = (ly + ry) / 2;

//     const eyeDist = Math.hypot(rx - lx, ry - ly);
//     const angle = Math.atan2(ry - ly, rx - lx) * (180 / Math.PI);

//     // --- Face width measurement (cheek to cheek) ---
//     const LEFT_CHEEK = 234;
//     const RIGHT_CHEEK = 454;
//     const faceWidth = Math.hypot(
//       (landmarks[RIGHT_CHEEK].x - landmarks[LEFT_CHEEK].x) * rect.width,
//       (landmarks[RIGHT_CHEEK].y - landmarks[LEFT_CHEEK].y) * rect.height
//     );

//     let newSizeLabel = "Medium";
//     let baseWidth = 2.6;

//     if (faceWidth < 280) {
//       newSizeLabel = "Small";
//       baseWidth = 2.2;
//     } else if (faceWidth > 360) {
//       newSizeLabel = "Large";
//       baseWidth = 3.0;
//     }

//     setSizeLabel(newSizeLabel);
//     setFaceWidthPx(Math.round(faceWidth));

//     const overlayWidth = eyeDist * baseWidth;

//     // === Smooth values with EMA ===
//     const s = smoothState.current;
//     const lerp = (prev, next) =>
//       prev === null ? next : prev * (1 - SMOOTHING) + next * SMOOTHING;

//     s.cx = lerp(s.cx, cx);
//     s.cy = lerp(s.cy, cy);
//     s.angle = lerp(s.angle, angle);
//     s.overlayWidth = lerp(s.overlayWidth, overlayWidth);

//     const overlay = overlayRef.current;
//     if (!overlay) return;

//     overlay.style.opacity = 1;

//     const left = s.cx - s.overlayWidth / 2;
//     const top = s.cy - overlay.clientHeight / 2;

//     overlay.style.width = `${s.overlayWidth}px`;
//     overlay.style.transform = `translate(${left}px, ${top}px) rotate(${s.angle}deg)`;
//   }

//   async function handleStart() {
//     if (running) return;
//     setStatus("starting...");
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480 },
//         audio: false,
//       });
//       videoRef.current.srcObject = stream;
//       await videoRef.current.play();

//       if (!mediapipeAvailable) {
//         setRunning(true);
//         setStatus("running (fallback: no face tracking)");
//         return;
//       }

//       const { FaceMesh } = await import("@mediapipe/face_mesh");
//       const faceMesh = new FaceMesh({
//         locateFile: (file) =>
//           `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
//       });
//       faceMesh.setOptions({
//         maxNumFaces: 1,
//         refineLandmarks: true,
//         minDetectionConfidence: 0.5,
//         minTrackingConfidence: 0.5,
//       });

//       const camera = await createCamera(videoRef.current, faceMesh, onResults);
//       if (camera) camera.start();

//       videoRef.current._mpCamera = camera;
//       videoRef.current._mpFaceMesh = faceMesh;

//       setRunning(true);
//       setStatus("running");
//     } catch (err) {
//       console.error(err);
//       setStatus("camera error");
//     }
//   }

//   function handleStop() {
//     if (!running) return;
//     const video = videoRef.current;
//     try {
//       const camObj = video._mpCamera;
//       camObj && camObj.stop();
//       const faceMesh = video._mpFaceMesh;
//       faceMesh && faceMesh.close && faceMesh.close();
//       const stream = video.srcObject;
//       if (stream) {
//         const tracks = stream.getTracks();
//         tracks.forEach((t) => t.stop());
//       }
//       video.srcObject = null;
//     } catch (e) {
//       console.warn(e);
//     }
//     setRunning(false);
//     setStatus("stopped");
//     overlayRef.current.style.opacity = 0;
//   }

//   return (
//     <div ref={containerRef} style={{ display: "flex", gap: 20, padding: 20 }}>
//       <div style={{ position: "relative", width: "100%", height: "100%" }}>
//         <video
//           ref={videoRef}
//           style={{
//             width: "100%",
//             height: "100%",
//             borderRadius: 12,
//             background: "#000",
//           }}
//           playsInline
//           muted
//         />

//         {mediapipeAvailable && (
//           <img
//             ref={overlayRef}
//             src={img.src}
//             alt="overlay"
//             style={{
//               position: "absolute",
//               left: 0,
//               top: 0,
//               pointerEvents: "none",
//               transformOrigin: "center center",
//               opacity: 0,
//               transition: "opacity 120ms linear, transform 120ms linear",
//               userSelect: "none",
//             }}
//           />
//         )}

//         <div
//           style={{
//             position: "absolute",
//             left: 12,
//             bottom: 12,
//             background: "rgba(0,0,0,0.4)",
//             color: "#fff",
//             padding: "6px 10px",
//             borderRadius: 8,
//           }}
//         >
//           {status}
//         </div>
//       </div>

//       <div style={{ maxWidth: 360 }}>
//         <h3>Controls</h3>
//         <p>
//           Use the Start button to grant camera permission. If Mediapipe fails,
//           fallback will show only raw camera feed.
//         </p>
//         <div style={{ display: "flex", gap: 8 }}>
//           <button
//             onClick={handleStart}
//             style={{ padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}
//             className="bg-sky-400 hover:bg-sky-600 text-white"
//           >
//             Start
//           </button>
//           <button
//             onClick={handleStop}
//             style={{ padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}
//             className="bg-red-400 hover:bg-red-600 text-white"
//           >
//             Stop
//           </button>
//         </div>

//         <hr style={{ margin: "12px 0" }} />
//         <h4>Suggested Glass Size</h4>
//         <div
//           style={{
//             marginTop: 8,
//             padding: 10,
//             background: "#eef",
//             borderRadius: 8,
//           }}
//         >
//           <strong>{sizeLabel}</strong> ({faceWidthPx}px face width)
//         </div>

//         <hr style={{ margin: "12px 0" }} />
//         {/* <h4>Next steps / Improvements</h4>
//         <ul>
//           <li>Use multiple overlays (hats, jewelry, shirts).</li>
//           <li>Add yaw/pitch/roll for full 3D placement.</li>
//           <li>Switch to 3D models (GLTF + React-Three-Fiber).</li>
//           <li>
//             Send frames to Python backend (FastAPI) for high-quality composites.
//           </li>
//         </ul> */}
//       </div>
//     </div>
//   );
// }





// "use client";

// // Next.js Virtual Try-On Prototype with dynamic imports for FaceMesh and Camera
// // This fixes the Next.js error where @mediapipe modules have no static exports.

// import React, { useEffect, useRef, useState } from 'react';
// import img from '../assets/glass.png';


// export default function TryOnPage() {
//   const videoRef = useRef(null);
//   const containerRef = useRef(null);
//   const overlayRef = useRef(null);
//   const [running, setRunning] = useState(false);
//   const [status, setStatus] = useState('idle');
//   const [mediapipeAvailable, setMediapipeAvailable] = useState(true);

//   async function createCamera(videoElement, faceMesh, onResults) {
//     try {
//       const { Camera } = await import('@mediapipe/camera_utils');

//       faceMesh.onResults(onResults);

//       return new Camera(videoElement, {
//         onFrame: async () => {
//           await faceMesh.send({ image: videoElement });
//         },
//         width: 640,
//         height: 480,
//       });
//     } catch (err) {
//       console.warn('Mediapipe Camera not available, fallback to raw video loop.', err);
//       setMediapipeAvailable(false);
//       return null;
//     }
//   }

//   useEffect(() => {
//     if (!videoRef.current) return;

//     let cameraInstance;
//     let faceMesh;

//     async function init() {
//       try {
//         const { FaceMesh } = await import('@mediapipe/face_mesh');

//         faceMesh = new FaceMesh({
//           locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
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
//         console.warn('Mediapipe FaceMesh not available, showing raw video only.', err);
//         setMediapipeAvailable(false);
//       }
//     }

//     init();

//     return () => {
//       if (cameraInstance) {
//         cameraInstance.stop();
//       }
//       if (faceMesh?.close) {
//         faceMesh.close();
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // function onResults(results) {
//   //   if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
//   //     overlayRef.current.style.opacity = 0;
//   //     setStatus('no face');
//   //     return;
//   //   }
//   //   setStatus('face detected');
//   //   const landmarks = results.multiFaceLandmarks[0];
//   //   const leftIdx = 33;
//   //   const rightIdx = 263;

//   //   const l = landmarks[leftIdx];
//   //   const r = landmarks[rightIdx];

//   //   const video = videoRef.current;
//   //   const rect = video.getBoundingClientRect();

//   //   const lx = l.x * rect.width;
//   //   const ly = l.y * rect.height;
//   //   const rx = r.x * rect.width;
//   //   const ry = r.y * rect.height;

//   //   const cx = (lx + rx) / 2;
//   //   const cy = (ly + ry) / 2;

//   //   const eyeDist = Math.hypot(rx - lx, ry - ly);
//   //   const angle = Math.atan2(ry - ly, rx - lx) * (180 / Math.PI);

//   //   const overlay = overlayRef.current;
//   //   if (!overlay) return;

//   //   overlay.style.opacity = 1;

//   //   const baseWidth = 2.2;
//   //   const overlayWidth = eyeDist * baseWidth;

//   //   const left = cx - overlayWidth / 2;
//   //   const top = cy - overlay.clientHeight / 2;

//   //   overlay.style.width = `${overlayWidth}px`;
//   //   overlay.style.transform = `translate(${left}px, ${top}px) rotate(${angle}deg)`;
//   // }

//   // Store previous smoothed values
// const smoothState = useRef({
//   cx: null,
//   cy: null,
//   angle: null,
//   overlayWidth: null,
// });

// // smoothing factor: 0.15 = smooth but laggy, 0.5 = responsive but jittery
// const SMOOTHING = 0.25;


// function onResults(results) {
//   if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
//     overlayRef.current.style.opacity = 0;
//     setStatus('no face');
//     return;
//   }
//   setStatus('face detected');
//   const landmarks = results.multiFaceLandmarks[0];

//   // Iris landmark indices
//   const LEFT_IRIS = [468, 469, 470, 471];
//   const RIGHT_IRIS = [473, 474, 475, 476];

//   // Compute average for iris centers
//   const getCenter = (indices) => {
//     let x = 0, y = 0;
//     indices.forEach(i => {
//       x += landmarks[i].x;
//       y += landmarks[i].y;
//     });
//     return { x: x / indices.length, y: y / indices.length };
//   };

//   const leftEye = getCenter(LEFT_IRIS);
//   const rightEye = getCenter(RIGHT_IRIS);

//   const video = videoRef.current;
//   const rect = video.getBoundingClientRect();

//   const lx = leftEye.x * rect.width;
//   const ly = leftEye.y * rect.height;
//   const rx = rightEye.x * rect.width;
//   const ry = rightEye.y * rect.height;

//   const cx = (lx + rx) / 2;
//   const cy = (ly + ry) / 2;

//   const eyeDist = Math.hypot(rx - lx, ry - ly);
//   const angle = Math.atan2(ry - ly, rx - lx) * (180 / Math.PI);

//   const baseWidth = 2.6; // adjust for glasses size
//   const overlayWidth = eyeDist * baseWidth;

//   // === Smooth values with EMA ===
//   const s = smoothState.current;
//   const lerp = (prev, next) =>
//     prev === null ? next : prev * (1 - SMOOTHING) + next * SMOOTHING;

//   s.cx = lerp(s.cx, cx);
//   s.cy = lerp(s.cy, cy);
//   s.angle = lerp(s.angle, angle);
//   s.overlayWidth = lerp(s.overlayWidth, overlayWidth);

//   const overlay = overlayRef.current;
//   if (!overlay) return;

//   overlay.style.opacity = 1;

//   const left = s.cx - s.overlayWidth / 2;
//   const top = s.cy - overlay.clientHeight / 2;

//   overlay.style.width = `${s.overlayWidth}px`;
//   overlay.style.transform = `translate(${left}px, ${top}px) rotate(${s.angle}deg)`;
// }


//   async function handleStart() {
//     if (running) return;
//     setStatus('starting...');
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
//       videoRef.current.srcObject = stream;
//       await videoRef.current.play();

//       if (!mediapipeAvailable) {
//         setRunning(true);
//         setStatus('running (fallback: no face tracking)');
//         return;
//       }

//       const { FaceMesh } = await import('@mediapipe/face_mesh');

//       const faceMesh = new FaceMesh({
//         locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
//       });

//       faceMesh.setOptions({
//         maxNumFaces: 1,
//         refineLandmarks: true,
//         minDetectionConfidence: 0.5,
//         minTrackingConfidence: 0.5,
//       });

//       const camera = await createCamera(videoRef.current, faceMesh, onResults);
//       if (camera) camera.start();

//       videoRef.current._mpCamera = camera;
//       videoRef.current._mpFaceMesh = faceMesh;

//       setRunning(true);
//       setStatus('running');
//     } catch (err) {
//       console.error(err);
//       setStatus('camera error');
//     }
//   }

//   function handleStop() {
//     if (!running) return;
//     const video = videoRef.current;
//     try {
//       const camObj = video._mpCamera;
//       camObj && camObj.stop();
//       const faceMesh = video._mpFaceMesh;
//       faceMesh && faceMesh.close && faceMesh.close();
//       const stream = video.srcObject;
//       if (stream) {
//         const tracks = stream.getTracks();
//         tracks.forEach((t) => t.stop());
//       }
//       video.srcObject = null;
//     } catch (e) {
//       console.warn(e);
//     }
//     setRunning(false);
//     setStatus('stopped');
//     overlayRef.current.style.opacity = 0;
//   }

//   return (
//     <div ref={containerRef} style={{ display: 'flex', gap: 20, padding: 20 }}>
//       <div style={{ position: 'relative', width: '100%', height: '100%' }}>
//         <video
//           ref={videoRef}
//           style={{ width: '100%', height: '100%', borderRadius: 12, background: '#000' }}
//           playsInline
//           muted
//         />

//         {mediapipeAvailable && (
//           <img
//             ref={overlayRef}
//             src={img.src}
//             alt="overlay"
//             style={{
//               position: 'absolute',
//               left: 0,
//               top: 0,
//               pointerEvents: 'none',
//               transformOrigin: 'center center',
//               opacity: 0,
//               transition: 'opacity 120ms linear, transform 120ms linear',
//               userSelect: 'none',
//             }}
//           />
//         )}

//         <div style={{ position: 'absolute', left: 12, bottom: 12, background: 'rgba(0,0,0,0.4)', color: '#fff', padding: '6px 10px', borderRadius: 8 }}>
//           {status}
//         </div>
//       </div>

//       <div style={{ maxWidth: 360 }}>
//         <h3>Controls</h3>
//         <p>
//           Use the Start button to grant camera permission. If Mediapipe fails, the fallback will just show raw camera
//           feed without overlays.
//         </p>
//         <div style={{ display: 'flex', gap: 8 }}>
//           <button onClick={handleStart} style={{ padding: '4px 2px', borderRadius: 8 , cursor: 'point',}} className='bg-sky-400 hover:bg-sky-600 text-white'>Start</button>
//           <button onClick={handleStop} style={{ padding: '8px 12px', borderRadius: 8 , cursor: 'point'}} className='bg-red-200 hover:bg-red-400 text-white'>Stop</button>
//         </div>

//         <hr style={{ margin: '12px 0' }} />
//         <h4>Next steps / Improvements</h4>
//         <ul>
//           <li>Use multiple overlays (hats, jewelry, shirts) with different landmark anchors.</li>
//           <li>Add smoothing (temporal filter) to reduce jitter.</li>
//           <li>Switch to 3D models (GLTF) and React-Three-Fiber for more realistic placement.</li>
//           <li>Send a captured frame to a Python backend (FastAPI) for high-quality composite images using VITON-like models.</li>
//         </ul>
//       </div>
//     </div>
//   );
// }
