
"use client";

import React, { useEffect, useRef, useState } from "react";
import img from "../assets/glass.png";

export default function TryOnPage() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [mediapipeAvailable, setMediapipeAvailable] = useState(true);
  const [sizeLabel, setSizeLabel] = useState("Medium");
  const [faceWidthPx, setFaceWidthPx] = useState(0);

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
      console.warn(
        "Mediapipe Camera not available, fallback to raw video loop.",
        err
      );
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
        console.warn(
          "Mediapipe FaceMesh not available, showing raw video only.",
          err
        );
        setMediapipeAvailable(false);
      }
    }

    init();

    return () => {
      if (cameraInstance) {
        cameraInstance.stop();
      }
      if (faceMesh?.close) {
        faceMesh.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smoothing state
  const smoothState = useRef({
    cx: null,
    cy: null,
    angle: null,
    overlayWidth: null,
  });
  const SMOOTHING = 0.25;

  function onResults(results) {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      overlayRef.current.style.opacity = 0;
      setStatus("no face");
      return;
    }
    setStatus("face detected");
    const landmarks = results.multiFaceLandmarks[0];

    // Iris indices
    const LEFT_IRIS = [468, 469, 470, 471];
    const RIGHT_IRIS = [473, 474, 475, 476];

    // Average landmark helper
    const getCenter = (indices) => {
      let x = 0,
        y = 0;
      indices.forEach((i) => {
        x += landmarks[i].x;
        y += landmarks[i].y;
      });
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

    // --- Face width measurement (cheek to cheek) ---
    const LEFT_CHEEK = 234;
    const RIGHT_CHEEK = 454;
    const faceWidth = Math.hypot(
      (landmarks[RIGHT_CHEEK].x - landmarks[LEFT_CHEEK].x) * rect.width,
      (landmarks[RIGHT_CHEEK].y - landmarks[LEFT_CHEEK].y) * rect.height
    );

    let newSizeLabel = "Medium";
    let baseWidth = 2.6;

    if (faceWidth < 280) {
      newSizeLabel = "Small";
      baseWidth = 2.2;
    } else if (faceWidth > 360) {
      newSizeLabel = "Large";
      baseWidth = 3.0;
    }

    setSizeLabel(newSizeLabel);
    setFaceWidthPx(Math.round(faceWidth));

    const overlayWidth = eyeDist * baseWidth;

    // === Smooth values with EMA ===
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
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((t) => t.stop());
      }
      video.srcObject = null;
    } catch (e) {
      console.warn(e);
    }
    setRunning(false);
    setStatus("stopped");
    overlayRef.current.style.opacity = 0;
  }

  return (
    <div ref={containerRef} style={{ display: "flex", gap: 20, padding: 20 }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 12,
            background: "#000",
          }}
          playsInline
          muted
        />

        {mediapipeAvailable && (
          <img
            ref={overlayRef}
            src={img.src}
            alt="overlay"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              pointerEvents: "none",
              transformOrigin: "center center",
              opacity: 0,
              transition: "opacity 120ms linear, transform 120ms linear",
              userSelect: "none",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            background: "rgba(0,0,0,0.4)",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: 8,
          }}
        >
          {status}
        </div>
      </div>

      <div style={{ maxWidth: 360 }}>
        <h3>Controls</h3>
        <p>
          Use the Start button to grant camera permission. If Mediapipe fails,
          fallback will show only raw camera feed.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleStart}
            style={{ padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}
            className="bg-sky-400 hover:bg-sky-600 text-white"
          >
            Start
          </button>
          <button
            onClick={handleStop}
            style={{ padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}
            className="bg-red-400 hover:bg-red-600 text-white"
          >
            Stop
          </button>
        </div>

        <hr style={{ margin: "12px 0" }} />
        <h4>Suggested Glass Size</h4>
        <div
          style={{
            marginTop: 8,
            padding: 10,
            background: "#eef",
            borderRadius: 8,
          }}
        >
          <strong>{sizeLabel}</strong> ({faceWidthPx}px face width)
        </div>

        <hr style={{ margin: "12px 0" }} />
        <h4>Next steps / Improvements</h4>
        <ul>
          <li>Use multiple overlays (hats, jewelry, shirts).</li>
          <li>Add yaw/pitch/roll for full 3D placement.</li>
          <li>Switch to 3D models (GLTF + React-Three-Fiber).</li>
          <li>
            Send frames to Python backend (FastAPI) for high-quality composites.
          </li>
        </ul>
      </div>
    </div>
  );
}





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
