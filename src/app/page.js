"use client";

import { useRef, useState, useEffect } from "react";

export default function Home() {
  const canvasRef = useRef(null);
  const logoRef = useRef(null);

  const [img, setImg] = useState(null);
  const [dotSize, setDotSize] = useState(4);
  const [density, setDensity] = useState(5);
  const [logoOpacity, setLogoOpacity] = useState(0.4);

  useEffect(() => {
    logoRef.current = new Image();
    logoRef.current.src = "/genlayer-logo.png";
  }, []);

  useEffect(() => {
    if (img) generate(img);
  }, [img, dotSize, density, logoOpacity]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const image = new Image();
    image.onload = () => {
      setImg(image);
      generate(image); // 🔥 immediate preview
    };
    image.src = URL.createObjectURL(file);
  };

  const generate = (image) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const size = 600;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);

    ctx.drawImage(image, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#000";

    const spacing = density * density * 0.5;
    const gamma = 1.8;

    for (let y = 0; y < size; y += spacing) {
      for (let x = 0; x < size; x += spacing) {
        const i = (Math.floor(y) * size + Math.floor(x)) * 4;

        const brightness =
          0.299 * data[i] +
          0.587 * data[i + 1] +
          0.114 * data[i + 2];

        const normalized = brightness / 255;
        const adjusted = Math.pow(1 - normalized, gamma);
        const rawR = dotSize * adjusted;

        const minR = 0.6;
        const maxR = dotSize * 0.9;
        const r = Math.min(Math.max(rawR, minR), maxR);

        if (r > 0.5) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // ---- GenLayer logo watermark ----
    const logo = logoRef.current;
    if (logo?.complete) {
      const logoSize = size * 0.15;
      const padding = size * 0.04;

      ctx.globalAlpha = logoOpacity;
      ctx.drawImage(
        logo,
        size - logoSize - padding,
        size - logoSize - padding,
        logoSize,
        logoSize
      );
      ctx.globalAlpha = 1;
    }
  };

  const download = () => {
    const link = document.createElement("a");
    link.download = "genlayer-dot-pfp.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const shareToX = () => {
    const text =
      "Just generated my GenLayer dot-style PFP 🧬⚫⚪";
    const url = "https://genlayer.ai";
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-1 text-center w-full">
        GenLayer AI Agent
      </h1>

      <p className="text-xs text-white/60 mb-6 text-center">
        Black & white dot-based PFP generator
      </p>

      <label className="w-full max-w-sm mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <div className="border border-white rounded-xl py-3 text-center cursor-pointer bg-white text-black hover:opacity-90 transition">
          Upload PFP
        </div>
      </label>

      <canvas
        ref={canvasRef}
        className="w-full max-w-sm aspect-square border border-white rounded-xl mb-6 bg-white"
      />

      {/* Controls */}
      <div className="w-full max-w-sm space-y-5">
        <Slider
          label="Dot Size"
          value={dotSize}
          min={2}
          max={8}
          onChange={setDotSize}
        />

        <Slider
          label="Density"
          value={density}
          min={3}
          max={7}
          onChange={setDensity}
        />

        <Slider
          label="Logo Opacity"
          value={logoOpacity}
          min={0}
          max={1}
          step={0.05}
          onChange={setLogoOpacity}
        />
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={download}
          className="px-8 py-3 bg-white text-black rounded-full text-sm hover:opacity-80 transition"
        >
          Download
        </button>

        <button
          onClick={shareToX}
          className="px-6 py-3 border border-white rounded-full text-sm hover:bg-white hover:text-black transition"
        >
          Share to X
        </button>
      </div>
    </main>
  );
}

/* ---------- Slider Component ---------- */
function Slider({ label, value, min, max, step = 1, onChange }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span className="opacity-60">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          w-full appearance-none h-2 rounded-full
          bg-white/20 accent-white
        "
      />
    </div>
  );
}
