// 3D Particle Shape Generators
// Each function returns an array of {x, y, z} positions for particle targets

export interface ShapePoint {
  x: number;
  y: number;
  z: number;
}

// Scale factor for all shapes
const SCALE = 0.8;

// Generate sphere points
export function generateSphere(count: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = Math.cbrt(Math.random()) * SCALE; // Uniform distribution inside sphere
    points.push({
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi)
    });
  }
  return points;
}

// Generate heart shape
export function generateHeart(count: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const s = Math.random(); // For thickness
    const thickness = 0.15;
    
    // Heart parametric equation
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    const z = (Math.random() - 0.5) * thickness * 20;
    
    // Add some thickness variation
    const offset = (Math.random() - 0.5) * thickness * 5;
    
    points.push({
      x: (x / 20 + offset) * SCALE,
      y: (y / 20 + offset) * SCALE,
      z: z / 20 * SCALE
    });
  }
  return points;
}

// Generate gun shape
export function generateGun(count: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let x, y, z;
    
    if (r < 0.5) {
      // Barrel - long cylinder
      x = (Math.random() - 0.5) * 0.15;
      y = Math.random() * 1.2 - 0.2;
      z = (Math.random() - 0.5) * 0.15;
    } else if (r < 0.75) {
      // Handle/grip
      x = (Math.random() - 0.5) * 0.2;
      y = -0.2 - Math.random() * 0.6;
      z = (Math.random() - 0.5) * 0.15 + 0.15;
    } else {
      // Trigger guard
      const angle = Math.random() * Math.PI;
      x = Math.cos(angle) * 0.1;
      y = -0.2 + Math.sin(angle) * 0.15;
      z = 0.1 + (Math.random() - 0.5) * 0.05;
    }
    
    points.push({ x: x * SCALE, y: y * SCALE, z: z * SCALE });
  }
  return points;
}

// Generate sword shape
export function generateSword(count: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let x, y, z;
    
    if (r < 0.6) {
      // Blade - thin and long
      const bladeY = Math.random() * 1.5;
      const taper = 1 - bladeY / 2; // Narrower towards tip
      x = (Math.random() - 0.5) * 0.12 * taper;
      y = bladeY - 0.3;
      z = (Math.random() - 0.5) * 0.03;
    } else if (r < 0.8) {
      // Guard/crossguard
      x = (Math.random() - 0.5) * 0.6;
      y = -0.3 + (Math.random() - 0.5) * 0.08;
      z = (Math.random() - 0.5) * 0.08;
    } else {
      // Handle
      x = (Math.random() - 0.5) * 0.08;
      y = -0.3 - Math.random() * 0.4;
      z = (Math.random() - 0.5) * 0.08;
    }
    
    points.push({ x: x * SCALE, y: y * SCALE, z: z * SCALE });
  }
  return points;
}

// Generate spider shape
export function generateSpider(count: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let x, y, z;
    
    if (r < 0.25) {
      // Body - ellipsoid
      const angle = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      x = Math.sin(v) * Math.cos(angle) * 0.3;
      y = Math.sin(v) * Math.sin(angle) * 0.2;
      z = Math.cos(v) * 0.25;
    } else if (r < 0.35) {
      // Head - smaller sphere
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const radius = 0.12;
      x = Math.sin(phi) * Math.cos(theta) * radius;
      y = Math.sin(phi) * Math.sin(theta) * radius + 0.35;
      z = Math.cos(phi) * radius;
    } else {
      // 8 Legs
      const legIndex = Math.floor(Math.random() * 8);
      const side = legIndex < 4 ? 1 : -1;
      const legNum = legIndex % 4;
      const legProgress = Math.random();
      
      const baseAngle = (legNum - 1.5) * 0.4;
      const bendAngle = legProgress * Math.PI * 0.3;
      
      x = side * (0.15 + legProgress * 0.5 * Math.cos(bendAngle));
      y = (legNum - 1.5) * 0.15;
      z = -legProgress * 0.3 * Math.sin(bendAngle) - 0.1;
    }
    
    points.push({ x: x * SCALE, y: y * SCALE, z: z * SCALE });
  }
  return points;
}

// Generate dog head (sideways)
export function generateDogHead(count: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let x, y, z;
    
    if (r < 0.4) {
      // Main head - rounded box
      x = (Math.random() - 0.5) * 0.5;
      y = (Math.random() - 0.5) * 0.4;
      z = (Math.random() - 0.5) * 0.4;
    } else if (r < 0.55) {
      // Snout/muzzle
      x = 0.25 + Math.random() * 0.35;
      y = (Math.random() - 0.5) * 0.2;
      z = (Math.random() - 0.5) * 0.2 - 0.05;
    } else if (r < 0.75) {
      // Ears (two floppy ears)
      const ear = Math.random() > 0.5 ? 1 : -1;
      x = (Math.random() - 0.5) * 0.15 - 0.15;
      y = ear * (0.2 + Math.random() * 0.25);
      z = 0.1 + Math.random() * 0.15;
    } else if (r < 0.85) {
      // Nose
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      x = 0.55 + Math.sin(phi) * Math.cos(theta) * 0.08;
      y = Math.sin(phi) * Math.sin(theta) * 0.08;
      z = Math.cos(phi) * 0.08 - 0.05;
    } else {
      // Eyes
      const eye = Math.random() > 0.5 ? 1 : -1;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      x = 0.1 + Math.sin(phi) * Math.cos(theta) * 0.05;
      y = eye * 0.12 + Math.sin(phi) * Math.sin(theta) * 0.05;
      z = 0.15 + Math.cos(phi) * 0.05;
    }
    
    points.push({ x: x * SCALE, y: y * SCALE, z: z * SCALE });
  }
  return points;
}

// Generate number shapes (1-5)
function generateDigitPoints(digit: number, count: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  const thickness = 0.08;
  
  // Helper to add line segment
  const addSegment = (x1: number, y1: number, x2: number, y2: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      points.push({
        x: (x1 + (x2 - x1) * t + (Math.random() - 0.5) * thickness) * SCALE,
        y: (y1 + (y2 - y1) * t + (Math.random() - 0.5) * thickness) * SCALE,
        z: (Math.random() - 0.5) * thickness * SCALE
      });
    }
  };
  
  const perSegment = Math.floor(count / 4);
  
  switch(digit) {
    case 1:
      addSegment(0, -0.5, 0, 0.5, count * 0.7); // Vertical
      addSegment(-0.15, 0.3, 0, 0.5, count * 0.15); // Top flag
      addSegment(-0.2, -0.5, 0.2, -0.5, count * 0.15); // Base
      break;
    case 2:
      addSegment(-0.25, 0.5, 0.25, 0.5, perSegment); // Top
      addSegment(0.25, 0.5, 0.25, 0.1, perSegment); // Top right
      addSegment(0.25, 0.1, -0.25, -0.3, perSegment); // Diagonal
      addSegment(-0.25, -0.3, -0.25, -0.5, perSegment * 0.5); // Bottom left
      addSegment(-0.25, -0.5, 0.25, -0.5, perSegment * 0.5); // Bottom
      break;
    case 3:
      addSegment(-0.25, 0.5, 0.25, 0.5, perSegment); // Top
      addSegment(0.25, 0.5, 0.25, 0, perSegment); // Top right
      addSegment(-0.1, 0, 0.25, 0, perSegment * 0.5); // Middle
      addSegment(0.25, 0, 0.25, -0.5, perSegment); // Bottom right
      addSegment(-0.25, -0.5, 0.25, -0.5, perSegment * 0.5); // Bottom
      break;
    case 4:
      addSegment(-0.25, 0.5, -0.25, 0, perSegment); // Top left down
      addSegment(-0.25, 0, 0.25, 0, perSegment); // Middle horizontal
      addSegment(0.25, 0.5, 0.25, -0.5, count * 0.5); // Right vertical
      break;
    case 5:
      addSegment(-0.25, 0.5, 0.25, 0.5, perSegment * 0.8); // Top
      addSegment(-0.25, 0.5, -0.25, 0, perSegment * 0.8); // Top left
      addSegment(-0.25, 0, 0.25, 0, perSegment * 0.8); // Middle
      addSegment(0.25, 0, 0.25, -0.5, perSegment * 0.8); // Bottom right
      addSegment(-0.25, -0.5, 0.25, -0.5, perSegment * 0.8); // Bottom
      break;
  }
  
  return points;
}

export const generateOne = (count: number) => generateDigitPoints(1, count);
export const generateTwo = (count: number) => generateDigitPoints(2, count);
export const generateThree = (count: number) => generateDigitPoints(3, count);
export const generateFour = (count: number) => generateDigitPoints(4, count);
export const generateFive = (count: number) => generateDigitPoints(5, count);

// Default car shape (original)
export function generateCar(count: number): ShapePoint[] {
  const points: ShapePoint[] = [];
  for (let i = 0; i < count; i++) {
    let x, y, z;
    const r = Math.random();
    
    if (r < 0.7) {
      // Main body
      x = (Math.random() - 0.5) * 2;
      y = (Math.random() - 0.5) * 0.6;
      z = (Math.random() - 0.5) * 1.0;
    } else if (r < 0.9) {
      // Cabin
      x = (Math.random() - 0.6) * 1.0;
      y = 0.3 + Math.random() * 0.5;
      z = (Math.random() - 0.5) * 0.8;
    } else {
      // Wheels
      const wheelIdx = Math.floor(Math.random() * 4);
      const wX = wheelIdx < 2 ? -0.7 : 0.7;
      const wZ = wheelIdx % 2 === 0 ? 0.5 : -0.5;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 0.3;
      x = wX + Math.cos(angle) * dist;
      y = -0.3 + Math.sin(angle) * dist;
      z = wZ + (Math.random() - 0.5) * 0.2;
    }
    
    points.push({ x: x * SCALE * 0.5, y: y * SCALE * 0.5, z: z * SCALE * 0.5 });
  }
  return points;
}

// Shape registry - maps gesture labels to shape generators
export const SHAPE_REGISTRY: Record<string, (count: number) => ShapePoint[]> = {
  'None': generateCar,
  'Closed Fist': generateSphere,
  'Open Palm': generateCar,
  'Heart': generateHeart,
  'Finger Heart': generateHeart,
  'Gun': generateGun,
  'Sword': generateSword,
  'Spider': generateSpider,
  'Dog': generateDogHead,
  'Dog Head': generateDogHead,
  'One': generateOne,
  '1': generateOne,
  'Two': generateTwo,
  '2': generateTwo,
  'Three': generateThree,
  '3': generateThree,
  'Four': generateFour,
  '4': generateFour,
  'Five': generateFive,
  '5': generateFive,
  'Sphere': generateSphere,
};

// Get shape generator for a gesture, with fallback
export function getShapeForGesture(gesture: string, count: number): ShapePoint[] {
  const generator = SHAPE_REGISTRY[gesture] || SHAPE_REGISTRY['None'];
  return generator(count);
}
