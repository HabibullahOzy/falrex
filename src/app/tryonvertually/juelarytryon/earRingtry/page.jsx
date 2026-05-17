"use client";

import React, { useEffect, useRef, useState } from "react";
import earringImg from "../../../assets/nosring.png";

export default function EarRingtry() {
  const videoRef = useRef(null);
  const leftEarringRef = useRef(null);
  const rightEarringRef = useRef(null);
  const containerRef = useRef(null); // container relative to video

  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [mediapipeAvailable, setMediapipeAvailable] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [earringSize, setEarringSize] = useState(60);

  async function createCamera(videoElement, faceMesh, onResults) {
    try {
      const { Camera } = await import("@mediapipe/camera_utils");
      faceMesh.onResults(onResults);

      return new Camera(videoElement, {
        onFrame: async () => await faceMesh.send({ image: videoElement }),
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

    async function initFaceMesh() {
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

    initFaceMesh();

    return () => {
      if (cameraInstance) cameraInstance.stop();
      if (faceMesh?.close) faceMesh.close();
    };
  }, [isModalOpen]);

  function onResults(results) {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      if (leftEarringRef.current) leftEarringRef.current.style.opacity = 0;
      if (rightEarringRef.current) rightEarringRef.current.style.opacity = 0;
      setStatus("no face");
      return;
    }

    setStatus("face detected");
    const landmarks = results.multiFaceLandmarks[0];

    const container = containerRef.current;
    if (!container) return;

    const { width: videoWidth, height: videoHeight, left, top } =
      videoRef.current.getBoundingClientRect();

    // Left earlobe (234), Right earlobe (454)
    const leftEar = landmarks[234];
    const rightEar = landmarks[454];

    const lx = leftEar.x * videoWidth;
    const ly = leftEar.y * videoHeight;
    const rx = rightEar.x * videoWidth;
    const ry = rightEar.y * videoHeight;

    // Left earring
    if (leftEarringRef.current) {
      leftEarringRef.current.style.opacity = 1;
      leftEarringRef.current.style.width = `${earringSize}px`;
      leftEarringRef.current.style.top = `${ly - earringSize / 2}px`;
      leftEarringRef.current.style.left = `${lx - earringSize / 2}px`;
    }

    // Right earring
    if (rightEarringRef.current) {
      rightEarringRef.current.style.opacity = 1;
      rightEarringRef.current.style.width = `${earringSize}px`;
      rightEarringRef.current.style.top = `${ry - earringSize / 2}px`;
      rightEarringRef.current.style.left = `${rx - earringSize / 2}px`;
    }
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
    const stream = videoRef.current.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    videoRef.current.srcObject = null;

    if (leftEarringRef.current) leftEarringRef.current.style.opacity = 0;
    if (rightEarringRef.current) rightEarringRef.current.style.opacity = 0;

    setRunning(false);
    setStatus("stopped");
  }

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 bg-sky-500 text-white rounded-xl shadow-lg hover:bg-sky-600 transition"
      >
        Try Earrings
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-4xl h-[80%] flex flex-col">
            <button
              onClick={() => {
                handleStop();
                setIsModalOpen(false);
              }}
              className="absolute top-3 right-3 bg-red-500 text-white rounded-full px-3 py-1 text-sm hover:bg-red-600"
            >
              ✕
            </button>

            {/* Video + Overlay Container */}
            <div
              ref={containerRef}
              className="flex-1 relative flex items-center justify-center"
            >
              <video
                ref={videoRef}
                className="w-full h-full rounded-xl bg-black object-cover"
                playsInline
                muted
              />

              {mediapipeAvailable && (
                <>
                  <Image
                    ref={leftEarringRef}
                    src={earringImg.src}
                    alt="left earring"
                    className="absolute pointer-events-none opacity-0 select-none transition-all"
                  />
                  <Image
                    ref={rightEarringRef}
                    src={earringImg.src}
                    alt="right earring"
                    className="absolute pointer-events-none opacity-0 select-none transition-all"
                  />
                </>
              )}

              <div className="absolute left-3 bottom-3 bg-black/50 text-white text-sm px-3 py-1 rounded-lg">
                {status}
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 flex flex-col items-center gap-4">
              <div className="flex gap-4">
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

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Size:</label>
                <input
                  type="range"
                  min="30"
                  max="150"
                  value={earringSize}
                  onChange={(e) => setEarringSize(Number(e.target.value))}
                  className="w-60"
                />
                <span>{earringSize}px</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
