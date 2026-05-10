"use client";

import React, { useEffect, useRef, useState } from "react";

import necklaceImg1 from "../../../assets/goldhar.png";
import necklaceImg2 from "../../../assets/goldhar2.png";
import necklaceImg3 from "../../../assets/goldhar2.png";

const necklaceGallery = [
  { id: 1, name: "Gold Necklace", image: necklaceImg1 },
  { id: 2, name: "Royal Necklace", image: necklaceImg2 },
  { id: 3, name: "Heavy Necklace", image: necklaceImg3 },
];

export default function Neclesstryon() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceMeshRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const sendingRef = useRef(false);
  const necklaceImgRef = useRef<HTMLImageElement | null>(null);

  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [selectedNecklace, setSelectedNecklace] = useState(necklaceGallery[0]);
  const selectedNecklaceRef = useRef(necklaceGallery[0]);

  // Keep ref in sync with state for use inside onResults
  useEffect(() => {
    selectedNecklaceRef.current = selectedNecklace;

    // Preload the necklace image into a real HTMLImageElement
    const img = new Image();
    img.src = selectedNecklace.image.src;
    img.onload = () => {
      necklaceImgRef.current = img;
    };
  }, [selectedNecklace]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  async function initFaceMesh() {
    const { FaceMesh } = await import("@mediapipe/face_mesh");

    const faceMesh = new FaceMesh({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);
    faceMeshRef.current = faceMesh;
  }

  function onResults(results: any) {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const necklaceImg = necklaceImgRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas size to video's natural resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiFaceLandmarks?.length || !necklaceImg) {
      setStatus("no face");
      return;
    }

    setStatus("face detected");

    const landmarks = results.multiFaceLandmarks[0];
    const W = canvas.width;
    const H = canvas.height;

    // Landmarks in canvas pixel space
    const chin      = landmarks[152];
    const leftJaw   = landmarks[234];
    const rightJaw  = landmarks[454];

    const chinX  = chin.x * W;
    const chinY  = chin.y * H;
    const lx     = leftJaw.x * W;
    const rx     = rightJaw.x * W;
    const jawWidth = Math.abs(rx - lx);

    // Necklace dimensions & position
    const necklaceWidth  = jawWidth * 1.1;
    const aspectRatio    = necklaceImg.naturalHeight / necklaceImg.naturalWidth;
    const necklaceHeight = necklaceWidth * aspectRatio;

    const drawX = chinX - necklaceWidth / 2;
    const drawY = chinY + jawWidth * 0.05; // small gap below chin

    ctx.drawImage(necklaceImg, drawX, drawY, necklaceWidth, necklaceHeight);
  }

  async function detectFrame() {
    const video = videoRef.current;
    const faceMesh = faceMeshRef.current;

    if (!video || !faceMesh) return;

    if (
      video.readyState >= 2 &&
      video.videoWidth > 0 &&
      video.videoHeight > 0 &&
      !sendingRef.current
    ) {
      sendingRef.current = true;
      try {
        await faceMesh.send({ image: video });
      } catch (err) {
        console.warn("FaceMesh send error:", err);
        setStatus("tracking error");
      } finally {
        sendingRef.current = false;
      }
    }

    animationRef.current = requestAnimationFrame(detectFrame);
  }

  async function handleStart() {
    if (running) return;
    setStatus("starting...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      await video.play();

      if (!faceMeshRef.current) await initFaceMesh();

      // Preload initial necklace image
      const img = new Image();
      img.src = selectedNecklace.image.src;
      img.onload = () => { necklaceImgRef.current = img; };

      setRunning(true);
      setStatus("running");

      requestAnimationFrame(() => {
        animationRef.current = requestAnimationFrame(detectFrame);
      });
    } catch (err) {
      console.error(err);
      setStatus("camera error");
    }
  }

  function stopCamera() {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());

    if (videoRef.current) videoRef.current.srcObject = null;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (faceMeshRef.current?.close) {
      faceMeshRef.current.close();
      faceMeshRef.current = null;
    }

    sendingRef.current = false;
    setRunning(false);
    setStatus("stopped");
  }

  return (
    <div className="nt-page">
      <style>{`
        .nt-page {
          width: 100%;
          min-height: 100vh;
          padding: 16px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nt-shell {
          width: min(100%, 1100px);
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 16px;
        }
        .nt-video-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.12);
          background: #000;
        }
        .nt-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        /* Canvas sits exactly on top of video */
        .nt-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 2;
          pointer-events: none;
        }
        .nt-status {
          position: absolute;
          left: 12px;
          bottom: 12px;
          z-index: 4;
          color: #fff;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-family: Arial, sans-serif;
          text-transform: uppercase;
          background: rgba(0,0,0,0.4);
        }
        .nt-start-overlay {
          position: absolute;
          inset: 0;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.55);
        }
        .nt-side {
          background: #111118;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 14px;
          color: #fff;
          font-family: Arial, sans-serif;
        }
        .nt-title { margin: 0 0 12px; font-size: 20px; }
        .nt-controls { display: flex; gap: 8px; margin-bottom: 16px; }
        .nt-btn {
          flex: 1; border: 0; border-radius: 10px;
          padding: 10px 12px; color: #fff;
          cursor: pointer; font-weight: 600;
        }
        .nt-btn-start { background: #0ea5e9; }
        .nt-btn-stop  { background: #ef4444; }
        .nt-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .nt-gallery {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .nt-gallery-item {
          border: 2px solid transparent;
          border-radius: 12px; padding: 8px; cursor: pointer;
          background: transparent;
        }
        .nt-gallery-item.active { border-color: #f5c542; }
        .nt-gallery-img {
          width: 100%; height: 74px;
          object-fit: contain; display: block;
        }
        .nt-gallery-name {
          margin-top: 6px; font-size: 12px;
          text-align: center; color: rgba(255,255,255,0.75);
        }
        @media (max-width: 800px) {
          .nt-shell { grid-template-columns: 1fr; }
          .nt-gallery { grid-template-columns: repeat(3, 1fr); }
          .nt-gallery-img { height: 58px; }
        }
        @media (max-width: 480px) {
          .nt-video-frame { aspect-ratio: 3 / 4; }
          .nt-gallery { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="nt-shell">
        <div className="nt-video-frame">
          {/* Video layer */}
          <video ref={videoRef} className="nt-video" playsInline muted />

          {/* Canvas overlay — necklace drawn here */}
          <canvas ref={canvasRef} className="nt-canvas" />

          <div className="nt-status">{status}</div>

          {!running && (
            <div className="nt-start-overlay">
              <button className="nt-btn nt-btn-start" onClick={handleStart}>
                Start Camera
              </button>
            </div>
          )}
        </div>

        <div className="nt-side">
          <h3 className="nt-title">Necklace Gallery</h3>
          <div className="nt-controls">
            <button onClick={handleStart} disabled={running} className="nt-btn nt-btn-start">Start</button>
            <button onClick={stopCamera} disabled={!running} className="nt-btn nt-btn-stop">Stop</button>
          </div>
          <div className="nt-gallery">
            {necklaceGallery.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nt-gallery-item ${selectedNecklace.id === item.id ? "active" : ""}`}
                onClick={() => setSelectedNecklace(item)}
              >
                <img src={item.image.src} alt={item.name} className="nt-gallery-img" />
                <div className="nt-gallery-name">{item.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}