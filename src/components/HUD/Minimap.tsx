import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface MinimapProps {
  playerPos: THREE.Vector3;
  playerHeading: number;
  targetPos: { x: number; z: number } | null;
  trafficPositions: THREE.Vector3[];
  onClick?: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerPos,
  playerHeading,
  targetPos,
  trafficPositions,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const half = size / 2;
    const scale = 0.55; // pixels per world meter

    ctx.clearRect(0, 0, size, size);

    // Save state and rotate map around player heading
    ctx.save();
    ctx.translate(half, half);
    ctx.rotate(playerHeading);

    // World relative offset: (wx - px) * scale, (wz - pz) * scale
    const toMapX = (wx: number) => (wx - playerPos.x) * scale;
    const toMapY = (wz: number) => (wz - playerPos.z) * scale;

    // 1. Draw Ocean Water boundary (x > 130)
    const oceanLeft = toMapX(130);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(oceanLeft, -half * 3, half * 4, half * 6);

    // 2. Draw Roads (Asphalt Gray lines)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Coastal Highway (x: 60)
    const hwyX = toMapX(60);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 14 * scale;
    ctx.beginPath();
    ctx.moveTo(hwyX, toMapY(-400));
    ctx.lineTo(hwyX, toMapY(400));
    ctx.stroke();

    // Highway center divider (yellow line)
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(hwyX, toMapY(-400));
    ctx.lineTo(hwyX, toMapY(400));
    ctx.stroke();

    // Downtown Boulevard (x: -100)
    const dtX = toMapX(-100);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 12 * scale;
    ctx.beginPath();
    ctx.moveTo(dtX, toMapY(-400));
    ctx.lineTo(dtX, toMapY(400));
    ctx.stroke();

    // Cross Streets (z: -240, -120, 0, 120, 240)
    const crossZ = [-240, -120, 0, 120, 240];
    crossZ.forEach((z) => {
      const cy = toMapY(z);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 10 * scale;
      ctx.beginPath();
      ctx.moveTo(toMapX(-250), cy);
      ctx.lineTo(toMapX(120), cy);
      ctx.stroke();
    });

    // 3. Buildings / City Blocks (Dark rectangles)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    const blocks = [
      { x: -30, z: -60, w: 38, d: 38 },
      { x: -30, z: 60, w: 36, d: 34 },
      { x: -30, z: 180, w: 40, d: 42 },
      { x: -160, z: -60, w: 48, d: 48 },
      { x: -160, z: 60, w: 44, d: 40 },
      { x: 105, z: -60, w: 45, d: 120 }, // City Mall
    ];
    blocks.forEach((b) => {
      ctx.fillRect(
        toMapX(b.x - b.w / 2),
        toMapY(b.z - b.d / 2),
        b.w * scale,
        b.d * scale
      );
    });

    // 4. Traffic vehicle markers (small orange dots)
    ctx.fillStyle = '#f97316';
    trafficPositions.forEach((tp) => {
      const tx = toMapX(tp.x);
      const ty = toMapY(tp.z);
      if (Math.hypot(tx, ty) < half - 6) {
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. Mission Objective Destination Pin
    if (targetPos) {
      const gx = toMapX(targetPos.x);
      const gy = toMapY(targetPos.z);
      const distFromCenter = Math.hypot(gx, gy);

      // Clamp to map edge if offscreen
      let pinX = gx;
      let pinY = gy;
      if (distFromCenter > half - 12) {
        const angle = Math.atan2(gy, gx);
        pinX = Math.cos(angle) * (half - 12);
        pinY = Math.sin(angle) * (half - 12);
      }

      // Golden pulsing mission diamond
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(pinX, pinY - 7);
      ctx.lineTo(pinX + 6, pinY);
      ctx.lineTo(pinX, pinY + 7);
      ctx.lineTo(pinX - 6, pinY);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    // 6. Player Arrow (Fixed in center pointing UP)
    ctx.save();
    ctx.translate(half, half);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 7. North Indicator Badge
    ctx.save();
    const northAngle = playerHeading - Math.PI / 2;
    const nx = half + Math.cos(northAngle) * (half - 14);
    const ny = half + Math.sin(northAngle) * (half - 14);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', nx, ny);
    ctx.restore();
  }, [playerPos, playerHeading, targetPos, trafficPositions]);

  return (
    <div
      onClick={onClick}
      className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900/80 cursor-pointer pointer-events-auto hover:border-cyan-400/60 transition-colors group"
      title="Click to open Full World Map"
    >
      <canvas
        ref={canvasRef}
        width={144}
        height={144}
        className="w-full h-full"
      />
      {/* Compass / Location label overlay */}
      <div className="absolute bottom-1 inset-x-0 text-center">
        <span className="px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white/80 tracking-widest uppercase">
          COASTAL HWY
        </span>
      </div>
    </div>
  );
};
