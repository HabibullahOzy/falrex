"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import cap1 from "../../../assets/cap.png";
import cap2 from "../../../assets/capb0.png";
import cap3 from "../../../assets/capfow.png";
import capVideo from "../../../assets/cap.png";
import Image from "next/image";

export default function CaptryOn({ product }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);

  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Camera stopped");
  const [controls, setControls] = useState({ scale: 1.2, yOffset: 0.55 });

  const smoothRef = useRef({ x: 0, y: 0, scale: 1, rotateZ: 0 });
  const capImageRef = useRef(null);

  const CAPS = useMemo(() => {
    const getImageUrl = (image) => {
      if (!image) return null;

      if (typeof image === "string") {
        return image.trim() || null;
      }

      if (typeof image === "object") {
        return (
          image.url ||
          image.secure_url ||
          image.src ||
          image.image ||
          image.path ||
          null
        );
      }

      return null;
    };

    const productImages = Array.isArray(product?.images)
      ? product.images.map(getImageUrl).filter(Boolean)
      : [];

    if (productImages.length > 0) {
      return productImages.map((src, index) => ({
        src,
        type: "image",
        label:
          productImages.length === 1
            ? product?.nameEng || product?.name || "Cap"
            : `${product?.nameEng || product?.name || "Cap"} ${index + 1}`,
      }));
    }

    return [
      { src: cap1.src, type: "image", label: "Cap 1" },
      { src: cap2.src, type: "image", label: "Cap 2" },
      { src: cap3.src, type: "image", label: "Cap 3" },
    ];
  }, [product]);

  const productVideo =
    typeof product?.video === "string"
      ? product.video
      : product?.video?.url || product?.video?.src || null;

  const VIDEO_CAP = productVideo
    ? { src: productVideo, type: "video", label: "Video Cap" }
    : { src: capVideo.src, type: "video", label: "Video Cap" };

  const [selectedCap, setSelectedCap] = useState(null);

  useEffect(() => {
    if (CAPS.length > 0) {
      setSelectedCap(CAPS[0]);
    }
  }, [CAPS]);

  useEffect(() => {
    if (!selectedCap?.src || selectedCap.type !== "image") return;

    const browserImage = new window.Image();
    browserImage.crossOrigin = "anonymous";
    browserImage.src = selectedCap.src;
    capImageRef.current = browserImage;
  }, [selectedCap]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!running) return;
    if (!selectedCap?.src) return;

    let cancelled = false;

    async function init() {
      try {
        setStatus("Initializing...");

        const [{ FaceMesh }, { Camera }] = await Promise.all([
          import("@mediapipe/face_mesh"),
          import("@mediapipe/camera_utils"),
        ]);

        if (cancelled) return;

        const faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        faceMeshRef.current = faceMesh;

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

          const leftEar = landmarks[234];
          const rightEar = landmarks[454];
          const topHead = landmarks[10];

          const earDx = (rightEar.x - leftEar.x) * w;
          const earDy = (rightEar.y - leftEar.y) * h;
          const headWidth = Math.hypot(earDx, earDy);
          const rotateZ = Math.atan2(earDy, earDx);

          const anchorX = ((leftEar.x + rightEar.x) / 2) * w;
          const anchorY = topHead.y * h;

          const capW = headWidth * 1.55 * controls.scale;
          const capH = capW * 0.55;
          const capTop = anchorY - capH * (0.5 + controls.yOffset);

          const s = smoothRef.current;
          s.x = smooth(s.x, anchorX);
          s.y = smooth(s.y, capTop + capH / 2);
          s.scale = smooth(s.scale, capW / 260);
          s.rotateZ = smooth(s.rotateZ, rotateZ);

          ctx.save();
          ctx.drawImage(results.image, 0, 0, w, h);

          ctx.translate(s.x, s.y);
          ctx.rotate(s.rotateZ);

          const drawW = 260 * s.scale;
          const drawH = drawW * 0.55;

          if (selectedCap.type === "image" && capImageRef.current?.complete) {
            ctx.drawImage(
              capImageRef.current,
              -drawW / 2,
              -drawH / 2,
              drawW,
              drawH
            );
          } else if (selectedCap.type === "video") {
            const vid = document.getElementById("capVideoElement");

            if (vid && vid.readyState >= 2) {
              ctx.drawImage(vid, -drawW / 2, -drawH / 2, drawW, drawH);
            }
          }

          ctx.restore();
          setStatus("Tracking active");
        };

        faceMesh.onResults(onResults);

        const cam = new Camera(videoRef.current, {
          onFrame: async () => {
            await faceMesh.send({ image: videoRef.current });
          },
          width: 960,
          height: 720,
        });

        cameraRef.current = cam;
        await cam.start();

        setStatus("Camera active");
      } catch (err) {
        console.error("FaceMesh init error:", err);
        setStatus("Initialization failed");
        setRunning(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, selectedCap, controls]);

  function stopCamera() {
    try {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }

      if (faceMeshRef.current?.close) {
        faceMeshRef.current.close();
        faceMeshRef.current = null;
      }

      const video = videoRef.current;

      if (video?.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }

      const canvasEl = canvasRef.current;
      const ctx = canvasEl?.getContext("2d");

      if (ctx && canvasEl) {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      }
    } catch (err) {
      console.warn("Camera stop error:", err);
    }
  }

  function handleStart() {
    if (running) return;
    setRunning(true);
    setStatus("Starting camera...");
  }

  function handleStop() {
    if (!running) return;
    setRunning(false);
    stopCamera();
    setStatus("Camera stopped");
  }

  return (
    <div className="w-full mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="lg:flex lg:items-center justify-center sm:grid sm:grid-cols-1 gap-4 sm:gap-6">
        <div className="relative w-full max-w-[960px] aspect-[4/3] rounded-xl overflow-hidden bg-black shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
          />

          <canvas
            ref={canvasRef}
            width="960"
            height="720"
            className="absolute inset-0 h-full w-full rounded-xl"
          />


          {selectedCap?.type === "video" && selectedCap?.src && (
            <video
              id="capVideoElement"
              src={selectedCap.src}
              loop
              muted
              autoPlay
              playsInline
              style={{ display: "none" }}
            />
          )}
        </div>

        <div className="w-full max-w-3xl rounded-2xl bg-white/70 backdrop-blur-lg p-3 sm:p-4 shadow-lg">
          <p className="text-gray-700 text-center mb-3 text-sm sm:text-base font-medium">
            {status}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={handleStart}
              disabled={running}
              className="rounded-full bg-sky-600 hover:bg-sky-800 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Start
            </button>

            <button
              type="button"
              onClick={handleStop}
              disabled={!running}
              className="rounded-full bg-red-700 hover:bg-red-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Stop
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col items-center gap-1">
              <label className="text-sm font-medium">Cap Size</label>

              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.01"
                value={controls.scale}
                onChange={(e) =>
                  setControls((c) => ({
                    ...c,
                    scale: parseFloat(e.target.value),
                  }))
                }
                className="w-full max-w-xs"
              />

              <span className="text-xs text-gray-500">
                {controls.scale.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <label className="text-sm font-medium">Vertical Position</label>

              <input
                type="range"
                min="-0.5"
                max="1.0"
                step="0.01"
                value={controls.yOffset}
                onChange={(e) =>
                  setControls((c) => ({
                    ...c,
                    yOffset: parseFloat(e.target.value),
                  }))
                }
                className="w-full max-w-xs"
              />

              <span className="text-xs text-gray-500">
                {controls.yOffset.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-3">
            {CAPS.map(({ src, type, label }) => (
              <button
                key={src}
                type="button"
                onClick={() => setSelectedCap({ type, src, label })}
                className={`h-20 sm:h-24 cursor-pointer rounded-lg border-4 bg-gray-100 overflow-hidden ${
                  selectedCap?.src === src
                    ? "bg-yellow-500 hover:bg-yellow-400"
                    : "border-transparent"
                }`}
                title={label}
              >
                <Image
                  src={src}
                  alt={label}
                  width={180}
                  height={100}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              </button>
            ))}

            {VIDEO_CAP?.src && (
              <button
                type="button"
                onClick={() => setSelectedCap(VIDEO_CAP)}
                className={`h-20 sm:h-24 cursor-pointer rounded-lg border-4 bg-gray-100 overflow-hidden ${
                  selectedCap?.src === VIDEO_CAP.src
                    ? "bg-yellow-500 hover:bg-yellow-400"
                    : "border-transparent"
                }`}
                title={VIDEO_CAP.label}
              >
                <Image
                  src={CAPS[0]?.src || cap1.src}
                  alt={VIDEO_CAP.label}
                  width={180}
                  height={100}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import cap1 from "../../../assets/cap.png";
// import cap2 from "../../../assets/capb0.png";
// import cap3 from "../../../assets/capfow.png";
// import capVideo from "../../../assets/cap.png";
// import Image from "next/image";

// export default function CaptryOn({ product }) {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const cameraRef = useRef(null);
//   const faceMeshRef = useRef(null);

//   const [running, setRunning] = useState(false);
//   const [status, setStatus] = useState("Camera stopped");
//   const [controls, setControls] = useState({ scale: 1.2, yOffset: 0.55 });

//   const smoothRef = useRef({ x: 0, y: 0, scale: 1, rotateZ: 0 });
//   const capImageRef = useRef(null);

//   const CAPS = useMemo(() => {
//     const getImageUrl = (image) => {
//       if (!image) return null;

//       if (typeof image === "string") {
//         return image.trim() || null;
//       }

//       if (typeof image === "object") {
//         return (
//           image.url ||
//           image.secure_url ||
//           image.src ||
//           image.image ||
//           image.path ||
//           null
//         );
//       }

//       return null;
//     };

//     const productImages = Array.isArray(product?.images)
//       ? product.images.map(getImageUrl).filter(Boolean)
//       : [];

//     if (productImages.length > 0) {
//       return productImages.map((src, index) => ({
//         src,
//         type: "image",
//         label:
//           productImages.length === 1
//             ? product?.nameEng || product?.name || "Cap"
//             : `${product?.nameEng || product?.name || "Cap"} ${index + 1}`,
//       }));
//     }

//     return [
//       { src: cap1.src, type: "image", label: "Cap 1" },
//       { src: cap2.src, type: "image", label: "Cap 2" },
//       { src: cap3.src, type: "image", label: "Cap 3" },
//     ];
//   }, [product]);

//   const productVideo =
//     typeof product?.video === "string"
//       ? product.video
//       : product?.video?.url || product?.video?.src || null;

//   const VIDEO_CAP = productVideo
//     ? { src: productVideo, type: "video", label: "Video Cap" }
//     : { src: capVideo.src, type: "video", label: "Video Cap" };

//   const [selectedCap, setSelectedCap] = useState(null);

//   useEffect(() => {
//     if (CAPS.length > 0) {
//       setSelectedCap(CAPS[0]);
//     }
//   }, [CAPS]);

//   useEffect(() => {
//     if (!selectedCap?.src || selectedCap.type !== "image") return;

//     const browserImage = new window.Image();
//     browserImage.crossOrigin = "anonymous";
//     browserImage.src = selectedCap.src;
//     capImageRef.current = browserImage;
//   }, [selectedCap]);

//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     if (!running) return;
//     if (!selectedCap?.src) return;

//     let cancelled = false;

//     async function init() {
//       try {
//         setStatus("Initializing...");

//         const [{ FaceMesh }, { Camera }] = await Promise.all([
//           import("@mediapipe/face_mesh"),
//           import("@mediapipe/camera_utils"),
//         ]);

//         if (cancelled) return;

//         const faceMesh = new FaceMesh({
//           locateFile: (file) =>
//             `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
//         });

//         faceMesh.setOptions({
//           maxNumFaces: 1,
//           refineLandmarks: true,
//           minDetectionConfidence: 0.6,
//           minTrackingConfidence: 0.6,
//         });

//         faceMeshRef.current = faceMesh;

//         const canvasEl = canvasRef.current;
//         const ctx = canvasEl.getContext("2d");

//         const smooth = (cur, target, f = 0.18) => cur + (target - cur) * f;

//         const onResults = (results) => {
//           ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

//           if (!results.multiFaceLandmarks?.length) {
//             setStatus("No face detected");
//             return;
//           }

//           const landmarks = results.multiFaceLandmarks[0];
//           const w = canvasEl.width;
//           const h = canvasEl.height;

//           const leftEar = landmarks[234];
//           const rightEar = landmarks[454];
//           const topHead = landmarks[10];

//           const earDx = (rightEar.x - leftEar.x) * w;
//           const earDy = (rightEar.y - leftEar.y) * h;
//           const headWidth = Math.hypot(earDx, earDy);
//           const rotateZ = Math.atan2(earDy, earDx);

//           const anchorX = ((leftEar.x + rightEar.x) / 2) * w;
//           const anchorY = topHead.y * h;

//           const capW = headWidth * 1.55 * controls.scale;
//           const capH = capW * 0.55;
//           const capTop = anchorY - capH * (0.5 + controls.yOffset);

//           const s = smoothRef.current;
//           s.x = smooth(s.x, anchorX);
//           s.y = smooth(s.y, capTop + capH / 2);
//           s.scale = smooth(s.scale, capW / 260);
//           s.rotateZ = smooth(s.rotateZ, rotateZ);

//           ctx.save();
//           ctx.drawImage(results.image, 0, 0, w, h);

//           ctx.translate(s.x, s.y);
//           ctx.rotate(s.rotateZ);

//           const drawW = 260 * s.scale;
//           const drawH = drawW * 0.55;

//           if (selectedCap.type === "image" && capImageRef.current?.complete) {
//             ctx.drawImage(
//               capImageRef.current,
//               -drawW / 2,
//               -drawH / 2,
//               drawW,
//               drawH
//             );
//           } else if (selectedCap.type === "video") {
//             const vid = document.getElementById("capVideoElement");

//             if (vid && vid.readyState >= 2) {
//               ctx.drawImage(vid, -drawW / 2, -drawH / 2, drawW, drawH);
//             }
//           }

//           ctx.restore();
//           setStatus("Tracking active");
//         };

//         faceMesh.onResults(onResults);

//         const cam = new Camera(videoRef.current, {
//           onFrame: async () => {
//             await faceMesh.send({ image: videoRef.current });
//           },
//           width: 960,
//           height: 720,
//         });

//         cameraRef.current = cam;
//         await cam.start();

//         setStatus("Camera active");
//       } catch (err) {
//         console.error("FaceMesh init error:", err);
//         setStatus("Initialization failed");
//         setRunning(false);
//       }
//     }

//     init();

//     return () => {
//       cancelled = true;
//       stopCamera();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [running, selectedCap, controls]);

//   function stopCamera() {
//     try {
//       if (cameraRef.current) {
//         cameraRef.current.stop();
//         cameraRef.current = null;
//       }

//       if (faceMeshRef.current?.close) {
//         faceMeshRef.current.close();
//         faceMeshRef.current = null;
//       }

//       const video = videoRef.current;

//       if (video?.srcObject) {
//         video.srcObject.getTracks().forEach((track) => track.stop());
//         video.srcObject = null;
//       }

//       const canvasEl = canvasRef.current;
//       const ctx = canvasEl?.getContext("2d");

//       if (ctx && canvasEl) {
//         ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
//       }
//     } catch (err) {
//       console.warn("Camera stop error:", err);
//     }
//   }

//   function handleStart() {
//     if (running) return;
//     setRunning(true);
//     setStatus("Starting camera...");
//   }

//   function handleStop() {
//     if (!running) return;
//     setRunning(false);
//     stopCamera();
//     setStatus("Camera stopped");
//   }

//   return (
//     <div className="flex  items-center justify-center py-10 gap-5 space-y-6">
//       <div className="relative">
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           width="960"
//           height="720"
//           className="rounded-xl shadow-lg bg-black object-cover"
//         />

//         <canvas
//           ref={canvasRef}
//           width="960"
//           height="720"
//           className="absolute top-0 left-0 rounded-xl"
//         />

//         {selectedCap?.type === "video" && selectedCap?.src && (
//           <video
//             id="capVideoElement"
//             src={selectedCap.src}
//             loop
//             muted
//             autoPlay
//             playsInline
//             style={{ display: "none" }}
//           />
//         )}
//       </div>

//       <div className="w-full max-w-2xl gap-3 bg-white/60 backdrop-blur-lg p-4 rounded-2xl shadow-lg">
//         <p className="text-gray-700 text-center mb-3 font-medium">{status}</p>

//         <div className="flex justify-center gap-3 mb-4">
//           <button
//             type="button"
//             onClick={handleStart}
//             disabled={running}
//             className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40"
//           >
//             Start
//           </button>

//           <button
//             type="button"
//             onClick={handleStop}
//             disabled={!running}
//             className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40"
//           >
//             Stop
//           </button>
//         </div>

//         <div className="flex justify-center gap-8 mb-4">
//           <div className="flex flex-col items-center gap-1">
//             <label className="text-sm font-medium">Cap Size</label>

//             <input
//               type="range"
//               min="0.5"
//               max="2.0"
//               step="0.01"
//               value={controls.scale}
//               onChange={(e) =>
//                 setControls((c) => ({
//                   ...c,
//                   scale: parseFloat(e.target.value),
//                 }))
//               }
//               className="w-36"
//             />

//             <span className="text-xs text-gray-500">
//               {controls.scale.toFixed(2)}
//             </span>
//           </div>

//           <div className="flex flex-col items-center gap-1">
//             <label className="text-sm font-medium">Vertical Position</label>

//             <input
//               type="range"
//               min="-0.5"
//               max="1.0"
//               step="0.01"
//               value={controls.yOffset}
//               onChange={(e) =>
//                 setControls((c) => ({
//                   ...c,
//                   yOffset: parseFloat(e.target.value),
//                 }))
//               }
//               className="w-36"
//             />

//             <span className="text-xs text-gray-500">
//               {controls.yOffset.toFixed(2)}
//             </span>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4 mt-3">
//           {CAPS.map(({ src, type, label }) => (
//             <button
//               key={src}
//               type="button"
//               onClick={() => setSelectedCap({ type, src, label })}
//               className={`cursor-pointer rounded-lg border-4 bg-black/60 h-20 overflow-hidden ${
//                 selectedCap?.src === src
//                   ? "border-blue-500"
//                   : "border-transparent"
//               }`}
//               title={label}
//             >
//               <Image
//                 src={src}
//                 alt={label}
//                 width={160}
//                 height={80}
//                 unoptimized
//                 className="h-full w-full object-contain"
//               />
//             </button>
//           ))}

//           {VIDEO_CAP?.src && (
//             <button
//               type="button"
//               onClick={() => setSelectedCap(VIDEO_CAP)}
//               className={`cursor-pointer rounded-lg border-4 h-20 bg-black/60 overflow-hidden ${
//                 selectedCap?.src === VIDEO_CAP.src
//                   ? "bg-yellow-500 hover:bg-yellow-400"
//                   : "border-transparent"
//               }`}
//               title={VIDEO_CAP.label}
//             >
//               <Image
//                 src={CAPS[0]?.src || cap1.src}
//                 alt={VIDEO_CAP.label}
//                 width={160}
//                 height={80}
//                 unoptimized
//                 className="h-full w-full object-contain"
//               />
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
