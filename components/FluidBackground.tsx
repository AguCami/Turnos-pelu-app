"use client";
import { useEffect, useRef } from "react";

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    let mouseX = w / 2;
    let mouseY = h / 2;

    const blobs: Blob[] = [
      { x: w * 0.3, y: h * 0.35, vx: 0.3, vy: 0.2, radius: w * 0.38, color: "#C9A227", alpha: 0.22 },
      { x: w * 0.7, y: h * 0.6,  vx: -0.2, vy: 0.3, radius: w * 0.32, color: "#D4AF37", alpha: 0.18 },
      { x: w * 0.5, y: h * 0.2,  vx: 0.15, vy: -0.2, radius: w * 0.28, color: "#A07C10", alpha: 0.14 },
      { x: w * 0.2, y: h * 0.75, vx: -0.3, vy: -0.15, radius: w * 0.25, color: "#FFD700", alpha: 0.10 },
      // Mouse blob
      { x: mouseX, y: mouseY, vx: 0, vy: 0, radius: w * 0.22, color: "#E8C040", alpha: 0.16 },
    ];

    const MOUSE_BLOB = 4;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", onResize);

    let id: number;
    const draw = () => {
      id = requestAnimationFrame(draw);

      // Dark base
      ctx.fillStyle = "#080806";
      ctx.fillRect(0, 0, w, h);

      // Mouse blob smoothly follows cursor
      blobs[MOUSE_BLOB].x += (mouseX - blobs[MOUSE_BLOB].x) * 0.055;
      blobs[MOUSE_BLOB].y += (mouseY - blobs[MOUSE_BLOB].y) * 0.055;

      // Drift other blobs
      for (let i = 0; i < blobs.length - 1; i++) {
        const b = blobs[i];
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.radius) b.x = w + b.radius;
        if (b.x > w + b.radius) b.x = -b.radius;
        if (b.y < -b.radius) b.y = h + b.radius;
        if (b.y > h + b.radius) b.y = -b.radius;
      }

      // Draw blobs with radial gradients — multiple passes for softness
      ctx.globalCompositeOperation = "screen";

      for (const b of blobs) {
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
        grad.addColorStop(0, hexToRgba(b.color, b.alpha));
        grad.addColorStop(0.4, hexToRgba(b.color, b.alpha * 0.5));
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.radius, b.radius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sharp gold specular near mouse — the "Apple shine"
      ctx.globalCompositeOperation = "screen";
      const specX = blobs[MOUSE_BLOB].x;
      const specY = blobs[MOUSE_BLOB].y;
      const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, w * 0.08);
      specGrad.addColorStop(0, "rgba(255, 240, 140, 0.18)");
      specGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(specX, specY, w * 0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";

      // Subtle noise grain overlay for texture (Apple does this)
      ctx.globalAlpha = 0.025;
      for (let y = 0; y < h; y += 4) {
        for (let x = 0; x < w; x += 4) {
          const v = Math.random() > 0.5 ? 255 : 0;
          ctx.fillStyle = `rgba(${v},${v},${v},1)`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.globalAlpha = 1;
    };

    draw();

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
