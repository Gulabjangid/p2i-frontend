"use client";
import React, { useEffect, useRef } from "react";

export default function LiquidMetal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create organic moving blobs
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Blob 1 (Purple/Blue)
      const x1 = centerX + Math.sin(time * 0.7) * 200;
      const y1 = centerY + Math.cos(time * 0.5) * 200;
      const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, 600);
      grad1.addColorStop(0, "rgba(76, 29, 149, 0.4)"); // Purple
      grad1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blob 2 (Cyan/Blue)
      const x2 = centerX + Math.cos(time * 0.3) * 300;
      const y2 = centerY + Math.sin(time * 0.8) * 150;
      const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, 500);
      grad2.addColorStop(0, "rgba(30, 58, 138, 0.4)"); // Blue
      grad2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}