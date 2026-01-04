import { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { drawHandSkeleton, ParticleSystem, LANDMARK_COLORS } from '@/lib/drawing-utils';
import { useCreateGesture, useGestures } from '@/hooks/use-gestures';
import { Button } from './ui/button';
import { Loader2, Camera, Hand, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { getShapeForGesture, type ShapePoint } from '@/lib/particle-shapes';

// Types for MediaPipe
declare global {
  interface Window {
    Hands: any;
    Camera: any;
    currentGesture: string;
    palmPosition: { x: number; y: number; z: number } | null;
  }
}

interface CameraViewProps {
  mode: 'training' | 'detection';
}

const PARTICLE_COUNT = 3000;

export function CameraView({ mode }: CameraViewProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystem = useRef(new ParticleSystem());
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer;
    particleGroup: THREE.Group;
    geometry: THREE.BufferGeometry;
    targetPositions: Float32Array;
    velocities: Float32Array;
    currentShape: string;
  } | null>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const onResultsRef = useRef<((results: any) => void) | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [lastGesture, setLastGesture] = useState<string>('None');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentLandmarks, setCurrentLandmarks] = useState<any[] | null>(null);
  const [capturedLandmarks, setCapturedLandmarks] = useState<any[] | null>(null); // Landmarks at capture time
  
  const { data: storedGestures } = useGestures();
  const createGesture = useCreateGesture();

  // Initialize Three.js 3D Particle System
  useEffect(() => {
    if (!threeContainerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    
    let containerWidth = 1;
    let containerHeight = 1;
    
    const updateSize = () => {
      if (threeContainerRef.current) {
        containerWidth = threeContainerRef.current.clientWidth;
        containerHeight = threeContainerRef.current.clientHeight;
        renderer.setSize(containerWidth, containerHeight);
        
        // Update orthographic camera to match aspect ratio
        const aspect = containerWidth / containerHeight;
        camera.left = -aspect;
        camera.right = aspect;
        camera.top = 1;
        camera.bottom = -1;
        camera.updateProjectionMatrix();
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    threeContainerRef.current.appendChild(renderer.domElement);

    // Particle System Setup
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    // Initialize with default shape
    const initialShape = getShapeForGesture('None', PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const point = initialShape[i] || { x: 0, y: 0, z: 0 };
      targetPositions[i * 3] = point.x;
      targetPositions[i * 3 + 1] = point.y;
      targetPositions[i * 3 + 2] = point.z;
      
      // Start scattered
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x00ffcc,
      size: 3,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    // Add glow layer with larger, more transparent particles
    const glowGeometry = geometry.clone();
    const glowMaterial = new THREE.PointsMaterial({
      color: 0x00ffcc,
      size: 1,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    const glowPoints = new THREE.Points(glowGeometry, glowMaterial);

    const points = new THREE.Points(geometry, material);
    const particleGroup = new THREE.Group();
    particleGroup.add(glowPoints);
    particleGroup.add(points);
    scene.add(particleGroup);

    camera.position.z = 5;
    camera.lookAt(0, 0, 0);

    threeRef.current = { 
      scene, 
      camera, 
      renderer, 
      particleGroup,
      geometry,
      targetPositions,
      velocities,
      currentShape: 'None'
    };

    // Function to update shape targets
    const updateShapeTargets = (gesture: string) => {
      if (!threeRef.current || threeRef.current.currentShape === gesture) return;
      
      const newShape = getShapeForGesture(gesture, PARTICLE_COUNT);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const point = newShape[i] || { x: 0, y: 0, z: 0 };
        threeRef.current.targetPositions[i * 3] = point.x;
        threeRef.current.targetPositions[i * 3 + 1] = point.y;
        threeRef.current.targetPositions[i * 3 + 2] = point.z;
      }
      threeRef.current.currentShape = gesture;
    };

    const animate = () => {
      if (threeRef.current) {
        const gesture = window.currentGesture || 'None';
        const palmPos = window.palmPosition;
        
        // Update shape when gesture changes
        updateShapeTargets(gesture);
        
        const positionAttr = threeRef.current.geometry.attributes.position;
        const posArray = positionAttr.array as Float32Array;
        const { targetPositions: targets, velocities: vels } = threeRef.current;
        
        // Smoothly animate particles to target positions
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          
          const dx = targets[ix] - posArray[ix];
          const dy = targets[iy] - posArray[iy];
          const dz = targets[iz] - posArray[iz];
          
          // Smooth spring-like motion
          vels[ix] = vels[ix] * 0.9 + dx * 0.08;
          vels[iy] = vels[iy] * 0.9 + dy * 0.08;
          vels[iz] = vels[iz] * 0.9 + dz * 0.08;
          
          posArray[ix] += vels[ix];
          posArray[iy] += vels[iy];
          posArray[iz] += vels[iz];
        }
        
        positionAttr.needsUpdate = true;
        
        // Position the particle group based on palm position
        if (palmPos) {
          // Convert normalized coordinates (0-1) to screen-space (-aspect to aspect, -1 to 1)
          const aspect = containerWidth / containerHeight;
          // Mirror X for webcam, and invert Y
          threeRef.current.particleGroup.position.x = (1 - palmPos.x - 0.5) * 2 * aspect;
          threeRef.current.particleGroup.position.y = (0.5 - palmPos.y) * 2;
          threeRef.current.particleGroup.position.z = 0;
          
          // Subtle rotation based on gesture
          threeRef.current.particleGroup.rotation.y += 0.01;
        }
        
        threeRef.current.renderer.render(threeRef.current.scene, threeRef.current.camera);
      }
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      renderer.dispose();
      threeRef.current = null;
    };
  }, []);

  // Initialize MediaPipe
  useEffect(() => {
    const loadMediaPipe = async () => {
      if (window.Hands) {
        setLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.Hands) {
          const hands = new window.Hands({
            locateFile: (file: string) => {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
            }
          });

          hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          // Use a wrapper that calls the latest onResultsRef
          hands.onResults((results: any) => {
            if (onResultsRef.current) {
              onResultsRef.current(results);
            }
          });

          const processVideo = async () => {
            if (webcamRef.current?.video?.readyState === 4) {
              try {
                const video = webcamRef.current.video;
                await hands.send({ image: video });
              } catch (e) {
                console.error("MediaPipe Error:", e);
              }
            }
            requestAnimationFrame(processVideo);
          };
          
          processVideo();
          setLoading(false);
        }
      };
    };

    if (!window.Hands) {
      loadMediaPipe();
    } else {
      setLoading(false);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const onResults = useCallback((results: any) => {
    if (!canvasRef.current || !webcamRef.current?.video) return;

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    // Process detections
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      setCurrentLandmarks(landmarks);

      // Draw skeleton
      drawHandSkeleton(ctx, landmarks, videoWidth, videoHeight);

      // Calculate palm center from vertices 0 (wrist), 1 (thumb_cmc), 5 (index_mcp), 17 (pinky_mcp)
      const palmVertices = [landmarks[0], landmarks[1], landmarks[5], landmarks[17]];
      const palmCenter = {
        x: palmVertices.reduce((sum, p) => sum + p.x, 0) / 4,
        y: palmVertices.reduce((sum, p) => sum + p.y, 0) / 4,
        z: palmVertices.reduce((sum, p) => sum + p.z, 0) / 4
      };
      
      // Store palm position globally for Three.js animation loop
      window.palmPosition = palmCenter;

      // Gesture Recognition logic
      if (mode === 'detection' && storedGestures?.length) {
        detectGesture(landmarks);
      }
    } else {
      setCurrentLandmarks(null);
      window.palmPosition = null;
      if (mode === 'detection') {
        setLastGesture('None');
        window.currentGesture = 'None';
      }
    }

    // Update and draw particles
    particleSystem.current.update(videoWidth, videoHeight);
    particleSystem.current.draw(ctx);

    ctx.restore();
  }, [mode, storedGestures]);

  // Keep the ref updated with the latest onResults callback
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  const detectGesture = (landmarks: any[]) => {
    if (!storedGestures?.length) return;

    // Feature extraction: Normalized distances from wrist (0) to finger tips (4,8,12,16,20)
    const getFeatures = (lms: any[]) => {
      const wrist = lms[0];
      const fingerTips = [4, 8, 12, 16, 20];
      const joints = [2, 5, 9, 13, 17]; // Bases of each finger
      
      // Reference length: wrist (0) to middle finger base (9)
      const handScale = Math.sqrt(
        Math.pow(lms[9].x - wrist.x, 2) + 
        Math.pow(lms[9].y - wrist.y, 2) + 
        Math.pow(lms[9].z - wrist.z, 2)
      ) || 0.1;

      // 1. Edge length patterns: wrist to tips
      const tipEdges = fingerTips.map(idx => {
        const tip = lms[idx];
        const dist = Math.sqrt(
          Math.pow(tip.x - wrist.x, 2) + 
          Math.pow(tip.y - wrist.y, 2) + 
          Math.pow(tip.z - wrist.z, 2)
        );
        return dist / handScale;
      });

      // 2. Vertex patterns: finger tip to finger base (extension check)
      const extensionEdges = fingerTips.map((tipIdx, i) => {
        const tip = lms[tipIdx];
        const base = lms[joints[i]];
        const dist = Math.sqrt(
          Math.pow(tip.x - base.x, 2) + 
          Math.pow(tip.y - base.y, 2) + 
          Math.pow(tip.z - base.z, 2)
        );
        return dist / handScale;
      });

      return [...tipEdges, ...extensionEdges];
    };

    const currentFeatures = getFeatures(landmarks);
    let bestLabel = 'None';
    let minDiff = 5.0; // Very permissive threshold for matching

    storedGestures.forEach(sample => {
      const sampleLandmarks = sample.landmarks as any[];
      if (!sampleLandmarks || !Array.isArray(sampleLandmarks) || sampleLandmarks.length < 21) {
        console.log(`Invalid landmarks for ${sample.label}:`, sampleLandmarks);
        return;
      }
      
      const sampleFeatures = getFeatures(sampleLandmarks);
      
      // Calculate total edge/vertex length difference
      let totalDiff = 0;
      currentFeatures.forEach((val, i) => {
        totalDiff += Math.abs(val - sampleFeatures[i]);
      });

      console.log(`Gesture: ${sample.label}, Diff: ${totalDiff.toFixed(3)}`);

      if (totalDiff < minDiff) {
        minDiff = totalDiff;
        bestLabel = sample.label;
      }
    });

    setLastGesture(bestLabel);
    
    // Global gesture state for 3D car
    if (window) window.currentGesture = bestLabel;
  };

  const handleCapture = () => {
    if (webcamRef.current && currentLandmarks) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setCapturedLandmarks(currentLandmarks); // Store landmarks at capture time
      }
    }
  };

  const saveSample = (label: string) => {
    if (!capturedLandmarks) return;

    createGesture.mutate({
      label,
      landmarks: capturedLandmarks
    }, {
      onSuccess: () => {
        setCapturedImage(null);
        setCapturedLandmarks(null);
      }
    });
  };

  // Camera content - always fullscreen
  return (
    <div className="fixed inset-0 z-[50] bg-black">
      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-primary font-display tracking-widest text-sm">INITIALIZING NEURAL NETWORK...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Feed */}
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        onUserMedia={() => setCameraReady(true)}
        className="absolute inset-0 w-full h-full object-contain"
        mirrored
      />

      {/* Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.9 }}
      />

      {/* 3D Content Container */}
      <div ref={threeContainerRef} className="absolute inset-0 z-20 pointer-events-none" />

      {/* Overlay UI Layer */}
      <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end pointer-events-none">
        
        {/* Detected Gesture Display - Detection Mode Only */}
        {mode === 'detection' && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel px-8 py-4 rounded-lg border-primary/30 text-center"
            >
              <div className="text-xs text-primary/60 font-tech uppercase mb-1">Detected Gesture</div>
              <div className="text-3xl font-display font-bold text-primary text-shadow-neon">
                {lastGesture.toUpperCase()}
              </div>
            </motion.div>
          </div>
        )}

        {/* Training Controls (Bottom) */}
        {mode === 'training' && (
          <div className="pointer-events-auto w-full flex flex-col items-center gap-4">
            {capturedImage ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel p-4 rounded-xl max-w-2xl w-full"
              >
                <div className="flex gap-4 items-center mb-4">
                  <img src={capturedImage} alt="Captured" className="w-20 h-14 object-cover rounded border border-white/20" />
                  <div className="flex-1">
                    <h3 className="text-white font-display text-sm mb-1">Sample Captured</h3>
                    <p className="text-xs text-white/50">Select a shape to train this gesture</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setCapturedImage(null)}
                    className="px-3 text-white/50 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
                
                {/* Shape Buttons Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[
                    { label: 'Open Palm', icon: '✋', color: 'primary' },
                    { label: 'Closed Fist', icon: '✊', color: 'accent' },
                    { label: 'Sphere', icon: '🔮', color: 'secondary' },
                    { label: 'Heart', icon: '💚', color: 'pink' },
                    { label: 'Gun', icon: '🔫', color: 'orange' },
                    { label: 'Sword', icon: '⚔️', color: 'cyan' },
                    { label: 'Spider', icon: '🕷️', color: 'purple' },
                    { label: 'Dog', icon: '🐕', color: 'yellow' },
                    { label: '1', icon: '1️⃣', color: 'blue' },
                    { label: '2', icon: '2️⃣', color: 'blue' },
                    { label: '3', icon: '3️⃣', color: 'blue' },
                    { label: '4', icon: '4️⃣', color: 'blue' },
                    { label: '5', icon: '5️⃣', color: 'blue' },
                  ].map((shape) => (
                    <Button
                      key={shape.label}
                      onClick={() => saveSample(shape.label)}
                      disabled={createGesture.isPending}
                      className="flex flex-col items-center justify-center p-2 h-auto min-h-[60px] bg-white/5 hover:bg-white/15 border border-white/10 hover:border-primary/50 transition-all"
                    >
                      <span className="text-xl mb-1">{shape.icon}</span>
                      <span className="text-[10px] text-white/70 font-tech uppercase">{shape.label}</span>
                    </Button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <Button 
                onClick={handleCapture}
                className="rounded-full w-16 h-16 bg-white/10 border-2 border-white/50 hover:bg-white/20 hover:scale-105 transition-all shadow-xl backdrop-blur-sm"
              >
                <Camera className="w-8 h-8 text-white" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
