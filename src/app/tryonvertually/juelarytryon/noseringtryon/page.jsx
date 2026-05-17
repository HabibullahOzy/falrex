  "use client";

import React, { useEffect, useRef, useState } from "react";
import img from "../../../assets/nosring.png";
import Image from "next/image";

export default function JewalTryOnPage() {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [mediapipeAvailable, setMediapipeAvailable] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      console.warn("Mediapipe Camera not available", err);
      setMediapipeAvailable(false);
      return null;
    }
  }

  useEffect(() => {
    if (!videoRef.current || !isModalOpen) return;

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

        cameraInstance = await createCamera(videoRef.current, faceMesh, onResults);
        if (cameraInstance) cameraInstance.start();
      } catch (err) {
        console.warn("Mediapipe FaceMesh not available", err);
        setMediapipeAvailable(false);
      }
    }

    init();

    return () => {
      if (cameraInstance) cameraInstance.stop();
      if (faceMesh?.close) faceMesh.close();
    };
  }, [isModalOpen]);

  function onResults(results) {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    overlayRef.current.style.opacity = 0;
    setStatus('no face');
    return;
  }
  setStatus('face detected');
  const landmarks = results.multiFaceLandmarks[0];

  // Example: Left earlobe (234), Right earlobe (454)
  const leftEar = landmarks[125];
  const rightEar = landmarks[456];

  const video = videoRef.current;
  const rect = video.getBoundingClientRect();

  const lx = leftEar.x * rect.width;
  const ly = leftEar.y * rect.height;
  const rx = rightEar.x * rect.width;
  const ry = rightEar.y * rect.height;

  // Position jewelry (for example left earring overlay)
  const overlay = overlayRef.current;
  if (!overlay) return;

  overlay.style.opacity = 1;
  overlay.style.width = `60px`; // adjust size for your jewelry
  overlay.style.transform = `translate(${lx - 30}px, ${ly - 15}px)`; // center image on ear
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
      const stream = video.srcObject;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      video.srcObject = null;
    } catch (e) {
      console.warn(e);
    }
    setRunning(false);
    setStatus("stopped");
    if (overlayRef.current) overlayRef.current.style.opacity = 0;
  }

  return (
    <div className="flex flex-col items-center justify-center py-10">
      {/* Trigger Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 bg-sky-500 text-white rounded-xl shadow-lg hover:bg-sky-600 transition"
      >
        Try Jewelry
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-4xl h-[80%] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => {
                handleStop();
                setIsModalOpen(false);
              }}
              className="absolute top-3 right-3 bg-red-500 text-white rounded-full px-3 py-1 text-sm hover:bg-red-600"
            >
              ✕
            </button>

            {/* Video Area */}
            <div className="flex-1 relative flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full rounded-xl bg-black object-cover"
                playsInline
                muted
              />

              {mediapipeAvailable && (
                <Image
                  ref={overlayRef}
                  src={img.src}
                  alt="overlay"
                  className="absolute left-0 top-0 pointer-events-none opacity-0 select-none transition-transform"
                />
              )}

              <div className="absolute left-3 bottom-3 bg-black/50 text-white text-sm px-3 py-1 rounded-lg">
                {status}
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 flex justify-center gap-4">
              <button
                onClick={handleStart}
                className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
              >
                Start
              </button>
              <button
                onClick={handleStop}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}