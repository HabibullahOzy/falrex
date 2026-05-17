"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import imgold from "../../../assets/goldhar.png";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface ProductImage {
  url: string;
  public_id?: string;
}

interface ProductVariation {
  color?: string;
  size?: string;
  stock?: string;
}

interface Product {
  _id?: string;
  nameEng?: string;
  category?: string;
  subcategory?: string;
  subSubcategory?: string;

  images?: ProductImage[];

  variations?: ProductVariation[];

  price?: number;

  currency?: string;
}

interface NecklaceItem {
  id: number;
  name: string;
  src: string;

  // tuning
  scale?: number;
  yOffset?: number;
  xOffset?: number;
  rotateFactor?: number;

  suggestedSize?: string;
}

interface NecklaceTryOnProps {
  product?: Product;
}

// ─────────────────────────────────────────────────────────────
// SMOOTH STATE
// ─────────────────────────────────────────────────────────────

const smooth = {
  x: 0,
  y: 0,
  width: 0,
  angle: 0,
};

function lerp(start: number, end: number, alpha: number) {
  return start + (end - start) * alpha;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function NecklaceTryOn({
  product,
}: NecklaceTryOnProps) {
  // ───────────────────────────────────────────────────────────
  // REFS
  // ───────────────────────────────────────────────────────────

  console.log(product);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const animationRef = useRef<number | null>(null);

  const faceMeshRef = useRef<any>(null);

  const sendingRef = useRef(false);

  const necklaceImageRef = useRef<HTMLImageElement | null>(
    null
  );

  // ───────────────────────────────────────────────────────────
  // GALLERY FROM DATABASE
  // ───────────────────────────────────────────────────────────

  const gallery: NecklaceItem[] = useMemo(() => {
    console.log(product);

    // DB Images
    if (product?.images?.length) {
      return product.images.map((img, index) => ({
        id: index + 1,
        name:
          product?.nameEng ||
          `Necklace ${index + 1}`,

        src: img.url,

        // Fine tuning
        scale: 1.85,

        yOffset: 0.26,

        xOffset: 0,

        rotateFactor: 1,

        suggestedSize:
          product?.variations?.[0]?.size ||
          "Standard",
      }));
    }

    // Fallback
    return [
      {
        id: 1,
        name: "Gold Necklace",
        src: imgold.src,
        scale: 1.8,
        yOffset: 0.25,
        xOffset: 0,
        rotateFactor: 1,
        suggestedSize: "42g",
      },
    ];
  }, [product]);

  // ───────────────────────────────────────────────────────────
  // STATE
  // ───────────────────────────────────────────────────────────

  const [selectedNecklace, setSelectedNecklace] =
    useState<NecklaceItem | null>(null);

  const [running, setRunning] = useState(false);

  const [status, setStatus] =
    useState("Camera Stopped");

  const [faceWidthText, setFaceWidthText] =
    useState("");

  // ───────────────────────────────────────────────────────────
  // INITIAL ITEM
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (gallery.length > 0) {
      setSelectedNecklace(gallery[0]);
    }
  }, [gallery]);

  // ───────────────────────────────────────────────────────────
  // PRELOAD IMAGE
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!selectedNecklace) return;

    const img = new window.Image();

    img.crossOrigin = "anonymous";

    img.src = selectedNecklace.src;

    img.onload = () => {
      necklaceImageRef.current = img;
    };
  }, [selectedNecklace]);

  // ───────────────────────────────────────────────────────────
  // CLEANUP
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // ───────────────────────────────────────────────────────────
  // FACEMESH
  // ───────────────────────────────────────────────────────────

  async function initFaceMesh() {
    const { FaceMesh } = await import(
      "@mediapipe/face_mesh"
    );

    const faceMesh = new FaceMesh({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,

      refineLandmarks: true,

      minDetectionConfidence: 0.7,

      minTrackingConfidence: 0.7,
    });

    faceMesh.onResults(onResults);

    faceMeshRef.current = faceMesh;
  }

  // ───────────────────────────────────────────────────────────
  // RESULTS
  // ───────────────────────────────────────────────────────────

  const onResults = useCallback(
    (results: any) => {
      const canvas = canvasRef.current;

      const video = videoRef.current;

      const necklaceImg =
        necklaceImageRef.current;

      if (
        !canvas ||
        !video ||
        !necklaceImg ||
        !selectedNecklace
      )
        return;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // canvas size
      canvas.width = video.videoWidth;

      canvas.height = video.videoHeight;

      const W = canvas.width;

      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // ─────────────────────────────────────────────────────
      // FACE
      // ─────────────────────────────────────────────────────

      if (!results.multiFaceLandmarks?.length) {
        setStatus("No Face Detected");
        return;
      }

      setStatus("Face Detected");

      const face =
        results.multiFaceLandmarks[0];

      // ─────────────────────────────────────────────────────
      // LANDMARKS
      // ─────────────────────────────────────────────────────

      const chin = face[152];

      const leftJaw = face[234];

      const rightJaw = face[454];

      const neckLeft = face[172];

      const neckRight = face[397];

      // shoulder support
      const leftLower = face[58];

      const rightLower = face[288];

      // ─────────────────────────────────────────────────────
      // PIXELS
      // ─────────────────────────────────────────────────────

      const chinX = chin.x * W;

      const chinY = chin.y * H;

      const jawWidth = Math.abs(
        rightJaw.x * W - leftJaw.x * W
      );

      const neckWidth = Math.abs(
        neckRight.x * W - neckLeft.x * W
      );

      const lowerWidth = Math.abs(
        rightLower.x * W - leftLower.x * W
      );

      const faceWidth = Math.max(
        jawWidth,
        neckWidth,
        lowerWidth
      );

      // ─────────────────────────────────────────────────────
      // FACE SIZE SUGGESTION
      // ─────────────────────────────────────────────────────

      if (faceWidth < 180) {
        setFaceWidthText("Suggested: Small");
      } else if (faceWidth < 250) {
        setFaceWidthText("Suggested: Medium");
      } else {
        setFaceWidthText("Suggested: Large");
      }

      // ─────────────────────────────────────────────────────
      // DYNAMIC SIZE
      // ─────────────────────────────────────────────────────

      const necklaceWidth =
        faceWidth *
        (selectedNecklace.scale || 1.85);

      const aspectRatio =
        necklaceImg.naturalHeight /
        necklaceImg.naturalWidth;

      const necklaceHeight =
        necklaceWidth * aspectRatio;

      // ─────────────────────────────────────────────────────
      // DYNAMIC POSITION
      // ─────────────────────────────────────────────────────

      const xOffset =
        faceWidth *
        (selectedNecklace.xOffset || 0);

      const yOffset =
        faceWidth *
        (selectedNecklace.yOffset || 0.26);

      // better centered
      const targetX =
        chinX -
        necklaceWidth / 2 +
        xOffset;

      // better neck placement
      const targetY =
        chinY + yOffset;

      // ─────────────────────────────────────────────────────
      // HEAD ROTATION
      // ─────────────────────────────────────────────────────

      const angle =
        Math.atan2(
          rightJaw.y - leftJaw.y,
          rightJaw.x - leftJaw.x
        ) *
        (180 / Math.PI);

      // ─────────────────────────────────────────────────────
      // SMOOTHING
      // ─────────────────────────────────────────────────────

      smooth.x = lerp(
        smooth.x,
        targetX,
        0.2
      );

      smooth.y = lerp(
        smooth.y,
        targetY,
        0.2
      );

      smooth.width = lerp(
        smooth.width,
        necklaceWidth,
        0.2
      );

      smooth.angle = lerp(
        smooth.angle,
        angle,
        0.15
      );

      const smoothHeight =
        smooth.width * aspectRatio;

      // ─────────────────────────────────────────────────────
      // DRAW
      // ─────────────────────────────────────────────────────

      ctx.save();

      ctx.imageSmoothingEnabled = true;

      ctx.imageSmoothingQuality = "high";

      ctx.translate(
        smooth.x + smooth.width / 2,
        smooth.y + smoothHeight / 2
      );

      ctx.rotate(
        (smooth.angle *
          (selectedNecklace.rotateFactor || 1) *
          Math.PI) /
          180
      );

      ctx.drawImage(
        necklaceImg,
        -smooth.width / 2,
        -smoothHeight / 2,
        smooth.width,
        smoothHeight
      );

      ctx.restore();
    },
    [selectedNecklace]
  );

  // ───────────────────────────────────────────────────────────
  // DETECT LOOP
  // ───────────────────────────────────────────────────────────

  async function detectFrame() {
    const video = videoRef.current;

    const faceMesh = faceMeshRef.current;

    if (!video || !faceMesh) return;

    if (
      video.readyState >= 2 &&
      !sendingRef.current &&
      video.videoWidth > 0
    ) {
      sendingRef.current = true;

      try {
        await faceMesh.send({
          image: video,
        });
      } catch (error) {
        console.log(error);
      } finally {
        sendingRef.current = false;
      }
    }

    animationRef.current =
      requestAnimationFrame(detectFrame);
  }

  // ───────────────────────────────────────────────────────────
  // START CAMERA
  // ───────────────────────────────────────────────────────────

  async function startCamera() {
    if (running) return;

    try {
      setStatus("Starting Camera...");

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1080 },
            height: { ideal: 620 },
          },

          audio: false,
        });

      const video = videoRef.current;

      if (!video) return;

      video.srcObject = stream;

      await video.play();

      if (!faceMeshRef.current) {
        await initFaceMesh();
      }

      setRunning(true);

      setStatus("Camera Running");

      animationRef.current =
        requestAnimationFrame(detectFrame);
    } catch (error) {
      console.log(error);

      setStatus(
        "Camera Permission Denied"
      );
    }
  }

  // ───────────────────────────────────────────────────────────
  // STOP
  // ───────────────────────────────────────────────────────────

  function stopCamera() {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const stream =
      videoRef.current?.srcObject as MediaStream;

    stream?.getTracks().forEach((track) =>
      track.stop()
    );

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext("2d");

      ctx?.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    if (faceMeshRef.current?.close) {
      faceMeshRef.current.close();

      faceMeshRef.current = null;
    }

    sendingRef.current = false;

    setRunning(false);

    setStatus("Stopped");
  }

  // ───────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="mx-auto grid lg:grid-cols-[1fr_360px] gap-6">
        {/* CAMERA */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 aspect-[4/5] md:aspect-video">
          {/* VIDEO */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />

          {/* CANVAS */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
          />

          {/* STATUS */}
          <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-sm">
            {status}
          </div>

          {/* START */}
          {!running && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
              <button
                onClick={startCamera}
                className="px-8 py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg transition-all"
              >
                Start Try On
              </button>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-5">
          <h2 className="text-2xl font-bold mb-2">
            {product?.nameEng ||
              "Necklace Collection"}
          </h2>

          <p className="text-white/60 text-sm mb-5">
            {product?.currency}{" "}
            {product?.price?.toLocaleString()}
          </p>

          {/* SIZE */}
          <div className="mb-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 p-4">
            <p className="text-sm text-yellow-300">
              {faceWidthText}
            </p>

            <p className="text-xs text-white/50 mt-1">
              Product Size:{" "}
              {selectedNecklace?.suggestedSize}
            </p>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={startCamera}
              disabled={running}
              className="flex-1 py-3 rounded-xl bg-sky-500 font-semibold disabled:opacity-50"
            >
              Start
            </button>

            <button
              onClick={stopCamera}
              disabled={!running}
              className="flex-1 py-3 rounded-xl bg-red-500 font-semibold disabled:opacity-50"
            >
              Stop
            </button>
          </div>

          {/* IMAGES */}
          <div className="grid grid-cols-2 gap-4">
            {gallery.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  setSelectedNecklace(item)
                }
                className={`rounded-2xl border p-3 transition-all ${
                  selectedNecklace?.id === item.id
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <div className="relative w-full h-28">
                  <Image
                    src={item.src}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>

                <p className="mt-3 text-sm text-center line-clamp-2">
                  {item.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}





// "use client";

// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import imgold from '../../../assets/goldhar.png'

// // ─────────────────────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────────────────────

// interface ProductImage {
//   url: string;
//   public_id?: string;
// }

// interface ProductVariation {
//   color?: string;
//   size?: string;
//   stock?: string;
// }

// interface Product {
//   _id?: string;
//   nameEng?: string;
//   category?: string;
//   subcategory?: string;
//   subSubcategory?: string;

//   images?: ProductImage[];

//   variations?: ProductVariation[];

//   price?: number;

//   currency?: string;
// }

// interface NecklaceItem {
//   id: number;
//   name: string;
//   src: string;

//   // tuning
//   scale?: number;
//   yOffset?: number;
//   xOffset?: number;
//   rotateFactor?: number;

//   suggestedSize?: string;
// }

// interface NecklaceTryOnProps {
//   product?: Product;
// }

// // ─────────────────────────────────────────────────────────────
// // SMOOTH STATE
// // ─────────────────────────────────────────────────────────────

// const smooth = {
//   x: 0,
//   y: 0,
//   width: 0,
//   angle: 0,
// };

// function lerp(start: number, end: number, alpha: number) {
//   return start + (end - start) * alpha;
// }

// // ─────────────────────────────────────────────────────────────
// // COMPONENT
// // ─────────────────────────────────────────────────────────────

// export default function NecklaceTryOn({
//   product,
// }: NecklaceTryOnProps) {
//   // ───────────────────────────────────────────────────────────
//   // REFS
//   // ───────────────────────────────────────────────────────────

//   console.log(product)

//   const videoRef = useRef<HTMLVideoElement | null>(null);

//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   const animationRef = useRef<number | null>(null);

//   const faceMeshRef = useRef<any>(null);

//   const sendingRef = useRef(false);

//   const necklaceImageRef = useRef<HTMLImageElement | null>(
//     null
//   );

//   // ───────────────────────────────────────────────────────────
//   // GALLERY FROM DATABASE
//   // ───────────────────────────────────────────────────────────

//   const gallery: NecklaceItem[] = useMemo(() => {
//     console.log(product)
//     // DB Images
//     if (product?.images?.length) {
//       return product.images.map((img, index) => ({
//         id: index + 1,
//         name:
//           product?.nameEng ||
//           `Necklace ${index + 1}`,

//         src: img.url,

//         // Fine tuning
//         scale: 1.85,

//         yOffset: 0.26,

//         xOffset: 0,

//         rotateFactor: 1,

//         suggestedSize:
//           product?.variations?.[0]?.size ||
//           "Standard",
//       }));
//     }

//     // Fallback
//     return [
//       {
//         id: 1,
//         name: "Gold Necklace",
//         src: imgold.src,
//         scale: 1.8,
//         yOffset: 0.25,
//         xOffset: 0,
//         rotateFactor: 1,
//         suggestedSize: "42g",
//       },
//     ];
//   }, [product]);

//   // ───────────────────────────────────────────────────────────
//   // STATE
//   // ───────────────────────────────────────────────────────────

//   const [selectedNecklace, setSelectedNecklace] =
//     useState<NecklaceItem | null>(null);

//   const [running, setRunning] = useState(false);

//   const [status, setStatus] =
//     useState("Camera Stopped");

//   const [faceWidthText, setFaceWidthText] =
//     useState("");

//   // ───────────────────────────────────────────────────────────
//   // INITIAL ITEM
//   // ───────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (gallery.length > 0) {
//       setSelectedNecklace(gallery[0]);
//     }
//   }, [gallery]);

//   // ───────────────────────────────────────────────────────────
//   // PRELOAD IMAGE
//   // ───────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (!selectedNecklace) return;

//     const img = new Image();

//     img.crossOrigin = "anonymous";

//     img.src = selectedNecklace.src;

//     img.onload = () => {
//       necklaceImageRef.current = img;
//     };
//   }, [selectedNecklace]);

//   // ───────────────────────────────────────────────────────────
//   // CLEANUP
//   // ───────────────────────────────────────────────────────────

//   useEffect(() => {
//     return () => {
//       stopCamera();
//     };
//   }, []);

//   // ───────────────────────────────────────────────────────────
//   // FACEMESH
//   // ───────────────────────────────────────────────────────────

//   async function initFaceMesh() {
//     const { FaceMesh } = await import(
//       "@mediapipe/face_mesh"
//     );

//     const faceMesh = new FaceMesh({
//       locateFile: (file: string) =>
//         `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
//     });

//     faceMesh.setOptions({
//       maxNumFaces: 1,

//       refineLandmarks: true,

//       minDetectionConfidence: 0.7,

//       minTrackingConfidence: 0.7,
//     });

//     faceMesh.onResults(onResults);

//     faceMeshRef.current = faceMesh;
//   }

//   // ───────────────────────────────────────────────────────────
//   // RESULTS
//   // ───────────────────────────────────────────────────────────

//   const onResults = useCallback(
//     (results: any) => {
//       const canvas = canvasRef.current;

//       const video = videoRef.current;

//       const necklaceImg =
//         necklaceImageRef.current;

//       if (
//         !canvas ||
//         !video ||
//         !necklaceImg ||
//         !selectedNecklace
//       )
//         return;

//       const ctx = canvas.getContext("2d");

//       if (!ctx) return;

//       // canvas size
//       canvas.width = video.videoWidth;

//       canvas.height = video.videoHeight;

//       const W = canvas.width;

//       const H = canvas.height;

//       ctx.clearRect(0, 0, W, H);

//       // ─────────────────────────────────────────────────────
//       // FACE
//       // ─────────────────────────────────────────────────────

//       if (!results.multiFaceLandmarks?.length) {
//         setStatus("No Face Detected");
//         return;
//       }

//       setStatus("Face Detected");

//       const face =
//         results.multiFaceLandmarks[0];

//       // ─────────────────────────────────────────────────────
//       // LANDMARKS
//       // ─────────────────────────────────────────────────────

//       const chin = face[152];

//       const leftJaw = face[234];

//       const rightJaw = face[454];

//       const neckLeft = face[172];

//       const neckRight = face[397];

//       // shoulder support
//       const leftLower = face[58];

//       const rightLower = face[288];

//       // ─────────────────────────────────────────────────────
//       // PIXELS
//       // ─────────────────────────────────────────────────────

//       const chinX = chin.x * W;

//       const chinY = chin.y * H;

//       const jawWidth = Math.abs(
//         rightJaw.x * W - leftJaw.x * W
//       );

//       const neckWidth = Math.abs(
//         neckRight.x * W - neckLeft.x * W
//       );

//       const lowerWidth = Math.abs(
//         rightLower.x * W - leftLower.x * W
//       );

//       const faceWidth = Math.max(
//         jawWidth,
//         neckWidth,
//         lowerWidth
//       );

//       // ─────────────────────────────────────────────────────
//       // FACE SIZE SUGGESTION
//       // ─────────────────────────────────────────────────────

//       if (faceWidth < 180) {
//         setFaceWidthText("Suggested: Small");
//       } else if (faceWidth < 250) {
//         setFaceWidthText("Suggested: Medium");
//       } else {
//         setFaceWidthText("Suggested: Large");
//       }

//       // ─────────────────────────────────────────────────────
//       // DYNAMIC SIZE
//       // ─────────────────────────────────────────────────────

//       const necklaceWidth =
//         faceWidth *
//         (selectedNecklace.scale || 1.85);

//       const aspectRatio =
//         necklaceImg.naturalHeight /
//         necklaceImg.naturalWidth;

//       const necklaceHeight =
//         necklaceWidth * aspectRatio;

//       // ─────────────────────────────────────────────────────
//       // DYNAMIC POSITION
//       // ─────────────────────────────────────────────────────

//       const xOffset =
//         faceWidth *
//         (selectedNecklace.xOffset || 0);

//       const yOffset =
//         faceWidth *
//         (selectedNecklace.yOffset || 0.26);

//       // better centered
//       const targetX =
//         chinX -
//         necklaceWidth / 2 +
//         xOffset;

//       // better neck placement
//       const targetY =
//         chinY + yOffset;

//       // ─────────────────────────────────────────────────────
//       // HEAD ROTATION
//       // ─────────────────────────────────────────────────────

//       const angle =
//         Math.atan2(
//           rightJaw.y - leftJaw.y,
//           rightJaw.x - leftJaw.x
//         ) *
//         (180 / Math.PI);

//       // ─────────────────────────────────────────────────────
//       // SMOOTHING
//       // ─────────────────────────────────────────────────────

//       smooth.x = lerp(
//         smooth.x,
//         targetX,
//         0.2
//       );

//       smooth.y = lerp(
//         smooth.y,
//         targetY,
//         0.2
//       );

//       smooth.width = lerp(
//         smooth.width,
//         necklaceWidth,
//         0.2
//       );

//       smooth.angle = lerp(
//         smooth.angle,
//         angle,
//         0.15
//       );

//       const smoothHeight =
//         smooth.width * aspectRatio;

//       // ─────────────────────────────────────────────────────
//       // DRAW
//       // ─────────────────────────────────────────────────────

//       ctx.save();

//       ctx.imageSmoothingEnabled = true;

//       ctx.imageSmoothingQuality = "high";

//       ctx.translate(
//         smooth.x + smooth.width / 2,
//         smooth.y + smoothHeight / 2
//       );

//       ctx.rotate(
//         (smooth.angle *
//           (selectedNecklace.rotateFactor || 1) *
//           Math.PI) /
//           180
//       );

//       ctx.drawImage(
//         necklaceImg,
//         -smooth.width / 2,
//         -smoothHeight / 2,
//         smooth.width,
//         smoothHeight
//       );

//       ctx.restore();
//     },
//     [selectedNecklace]
//   );

//   // ───────────────────────────────────────────────────────────
//   // DETECT LOOP
//   // ───────────────────────────────────────────────────────────

//   async function detectFrame() {
//     const video = videoRef.current;

//     const faceMesh = faceMeshRef.current;

//     if (!video || !faceMesh) return;

//     if (
//       video.readyState >= 2 &&
//       !sendingRef.current &&
//       video.videoWidth > 0
//     ) {
//       sendingRef.current = true;

//       try {
//         await faceMesh.send({
//           image: video,
//         });
//       } catch (error) {
//         console.log(error);
//       } finally {
//         sendingRef.current = false;
//       }
//     }

//     animationRef.current =
//       requestAnimationFrame(detectFrame);
//   }

//   // ───────────────────────────────────────────────────────────
//   // START CAMERA
//   // ───────────────────────────────────────────────────────────

//   async function startCamera() {
//     if (running) return;

//     try {
//       setStatus("Starting Camera...");

//       const stream =
//         await navigator.mediaDevices.getUserMedia({
//           video: {
//             facingMode: "user",
//             width: { ideal: 1080 },
//             height: { ideal: 620 },
//           },

//           audio: false,
//         });

//       const video = videoRef.current;

//       if (!video) return;

//       video.srcObject = stream;

//       await video.play();

//       if (!faceMeshRef.current) {
//         await initFaceMesh();
//       }

//       setRunning(true);

//       setStatus("Camera Running");

//       animationRef.current =
//         requestAnimationFrame(detectFrame);
//     } catch (error) {
//       console.log(error);

//       setStatus(
//         "Camera Permission Denied"
//       );
//     }
//   }

//   // ───────────────────────────────────────────────────────────
//   // STOP
//   // ───────────────────────────────────────────────────────────

//   function stopCamera() {
//     if (animationRef.current) {
//       cancelAnimationFrame(animationRef.current);
//     }

//     const stream =
//       videoRef.current?.srcObject as MediaStream;

//     stream?.getTracks().forEach((track) =>
//       track.stop()
//     );

//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }

//     const canvas = canvasRef.current;

//     if (canvas) {
//       const ctx = canvas.getContext("2d");

//       ctx?.clearRect(
//         0,
//         0,
//         canvas.width,
//         canvas.height
//       );
//     }

//     if (faceMeshRef.current?.close) {
//       faceMeshRef.current.close();

//       faceMeshRef.current = null;
//     }

//     sendingRef.current = false;

//     setRunning(false);

//     setStatus("Stopped");
//   }

//   // ───────────────────────────────────────────────────────────
//   // UI
//   // ───────────────────────────────────────────────────────────

//   return (
//     <div className="min-h-screen bg-black text-white p-4">
//       <div className=" mx-auto grid lg:grid-cols-[1fr_360px] gap-6">
//         {/* CAMERA */}
//         <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 aspect-[4/5] md:aspect-video">
//           {/* VIDEO */}
//           <video
//             ref={videoRef}
//             playsInline
//             muted
//             className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
//           />

//           {/* CANVAS */}
//           <canvas
//             ref={canvasRef}
//             className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
//           />

//           {/* STATUS */}
//           <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-sm">
//             {status}
//           </div>

//           {/* START */}
//           {!running && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
//               <button
//                 onClick={startCamera}
//                 className="px-8 py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg transition-all"
//               >
//                 Start Try On
//               </button>
//             </div>
//           )}
//         </div>

//         {/* SIDEBAR */}
//         <div className="bg-neutral-900 border border-white/10 rounded-3xl p-5">
//           <h2 className="text-2xl font-bold mb-2">
//             {product?.nameEng ||
//               "Necklace Collection"}
//           </h2>

//           <p className="text-white/60 text-sm mb-5">
//             {product?.currency}{" "}
//             {product?.price?.toLocaleString()}
//           </p>

//           {/* SIZE */}
//           <div className="mb-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 p-4">
//             <p className="text-sm text-yellow-300">
//               {faceWidthText}
//             </p>

//             <p className="text-xs text-white/50 mt-1">
//               Product Size:{" "}
//               {selectedNecklace?.suggestedSize}
//             </p>
//           </div>

//           {/* BUTTONS */}
//           <div className="flex gap-3 mb-6">
//             <button
//               onClick={startCamera}
//               disabled={running}
//               className="flex-1 py-3 rounded-xl bg-sky-500 font-semibold disabled:opacity-50"
//             >
//               Start
//             </button>

//             <button
//               onClick={stopCamera}
//               disabled={!running}
//               className="flex-1 py-3 rounded-xl bg-red-500 font-semibold disabled:opacity-50"
//             >
//               Stop
//             </button>
//           </div>

//           {/* IMAGES */}
//           <div className="grid grid-cols-2 gap-4">
//             {gallery.map((item) => (
//               <button
//                 key={item.id}
//                 onClick={() =>
//                   setSelectedNecklace(item)
//                 }
//                 className={`rounded-2xl border p-3 transition-all ${
//                   selectedNecklace?.id === item.id
//                     ? "border-yellow-400 bg-yellow-400/10"
//                     : "border-white/10 hover:border-white/30"
//                 }`}
//               >
//                 <img
//                   src={item.src}
//                   alt={item.name}
//                   className="w-full h-28 object-contain"
//                 />

//                 <p className="mt-3 text-sm text-center line-clamp-2">
//                   {item.name}
//                 </p>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }