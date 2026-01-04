// Utilities for drawing hand skeletons and particles

export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],         // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],         // Index
  [0, 17], [17, 18], [18, 19], [19, 20],  // Pinky
  [5, 9], [9, 13], [13, 17],              // Palm Base
  [9, 10], [10, 11], [11, 12],            // Middle
  [13, 14], [14, 15], [15, 16]            // Ring
];

// Color palette for skeleton
export const LANDMARK_COLORS = {
  thumb: '#00ff00',   // Green
  index: '#0088ff',   // Blue
  middle: '#ff00ff',  // Magenta
  ring: '#ffff00',    // Yellow
  pinky: '#ff8800',   // Orange
  palm: '#ffffff',    // White
  point: '#ff0000',   // Red circles
};

export interface Point {
  x: number;
  y: number;
  z?: number;
}

export function drawHandSkeleton(ctx: CanvasRenderingContext2D, landmarks: Point[], width: number, height: number) {
  // Helper to map normalized coordinates to pixel coordinates
  // Mirroring horizontally because it's front cam
  const toPixel = (pt: Point) => ({
    x: (1 - pt.x) * width,
    y: pt.y * height
  });

  // Draw connections - faint and subtle
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.15;

  HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const start = toPixel(landmarks[startIdx]);
    const end = toPixel(landmarks[endIdx]);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  });

  // Draw landmarks - very faint small dots
  ctx.globalAlpha = 0.1;
  landmarks.forEach((landmark) => {
    const { x, y } = toPixel(landmark);
    
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });

  // Reset alpha
  ctx.globalAlpha = 1.0;
}

// Particle System
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export class ParticleSystem {
  particles: Particle[] = [];

  emit(x: number, y: number, color: string) {
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        color
      });
    }
  }

  update(width: number, height: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // We assume context is already cleared by the skeleton drawer if shared,
    // otherwise clear it here if it's a separate layer.
    // For now, we draw on top.
    
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  }
}
