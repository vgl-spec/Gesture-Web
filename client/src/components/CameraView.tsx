import { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { drawHandSkeleton, ParticleSystem, LANDMARK_COLORS } from '@/lib/drawing-utils';
import { useCreateGesture, useGestures } from '@/hooks/use-gestures';
import { Button } from './ui/button';
import { Loader2, Camera, Hand, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// Types for MediaPipe
declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

interface CameraViewProps {
  mode: 'training' | 'detection';
}

export function CameraView({ mode }: CameraViewProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystem = useRef(new ParticleSystem());
  const threeRef = useRef<{ scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, car: THREE.Group } | null>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [lastGesture, setLastGesture] = useState<string>('None');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentLandmarks, setCurrentLandmarks] = useState<any[] | null>(null);
  
  const { data: storedGestures } = useGestures();
  const createGesture = useCreateGesture();

  // Initialize Three.js 3D Particle Car
  useEffect(() => {
    if (!threeContainerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const updateSize = () => {
      if (threeContainerRef.current) {
        const width = threeContainerRef.current.clientWidth;
        const height = threeContainerRef.current.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    threeContainerRef.current.appendChild(renderer.domElement);

    // Particle Car Setup
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    // Generate Car Shape Targets
    for (let i = 0; i < particleCount; i++) {
      let tx, ty, tz;
      const r = Math.random();
      if (r < 0.7) {
        // Main body: Box -1 to 1, -0.3 to 0.3, -0.5 to 0.5
        tx = (Math.random() - 0.5) * 2;
        ty = (Math.random() - 0.5) * 0.6;
        tz = (Math.random() - 0.5) * 1.0;
      } else if (r < 0.9) {
        // Cabin: Box -0.6 to 0.4, 0.3 to 0.8, -0.4 to 0.4
        tx = (Math.random() - 0.6) * 1.0;
        ty = 0.3 + Math.random() * 0.5;
        tz = (Math.random() - 0.5) * 0.8;
      } else {
        // Wheels: Cylinders
        const wheelIdx = Math.floor(Math.random() * 4);
        const wX = wheelIdx < 2 ? -0.7 : 0.7;
        const wZ = wheelIdx % 2 === 0 ? 0.5 : -0.5;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 0.3;
        tx = wX + Math.cos(angle) * dist;
        ty = -0.3 + Math.sin(angle) * dist;
        tz = wZ + (Math.random() - 0.5) * 0.2;
      }
      
      targetPositions[i * 3] = tx;
      targetPositions[i * 3 + 1] = ty;
      targetPositions[i * 3 + 2] = tz;
      
      // Initial positions (randomly scattered)
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x00ffcc,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    const carGroup = new THREE.Group();
    carGroup.add(points);
    scene.add(carGroup);

    camera.position.z = 5;
    camera.position.y = 1;
    camera.lookAt(0, 0, 0);

    threeRef.current = { scene, camera, renderer, car: carGroup };

    const animate = () => {
      if (threeRef.current) {
        const gesture = (window as any).currentGesture || 'None';
        const positionAttr = geometry.attributes.position;
        const posArray = positionAttr.array as Float32Array;
        
        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          
          if (gesture === 'Open Palm') {
            // Shatter: move away from center
            velocities[ix] += (posArray[ix] - 0) * 0.001 + (Math.random() - 0.5) * 0.01;
            velocities[iy] += (posArray[iy] - 0) * 0.001 + (Math.random() - 0.5) * 0.01;
            velocities[iz] += (posArray[iz] - 0) * 0.001 + (Math.random() - 0.5) * 0.01;
            
            // Limit velocity
            const maxV = 0.2;
            velocities[ix] = Math.max(-maxV, Math.min(maxV, velocities[ix]));
            velocities[iy] = Math.max(-maxV, Math.min(maxV, velocities[iy]));
            velocities[iz] = Math.max(-maxV, Math.min(maxV, velocities[iz]));
          } else if (gesture === 'Closed Fist') {
            // Reconstruct: move towards target
            const dx = targetPositions[ix] - posArray[ix];
            const dy = targetPositions[iy] - posArray[iy];
            const dz = targetPositions[iz] - posArray[iz];
            
            velocities[ix] = dx * 0.1;
            velocities[iy] = dy * 0.1;
            velocities[iz] = dz * 0.1;
          } else {
            // Normal: subtle drift or stay at target
            const dx = targetPositions[ix] - posArray[ix];
            const dy = targetPositions[iy] - posArray[iy];
            const dz = targetPositions[iz] - posArray[iz];
            
            velocities[ix] = dx * 0.05 + (Math.random() - 0.5) * 0.005;
            velocities[iy] = dy * 0.05 + (Math.random() - 0.5) * 0.005;
            velocities[iz] = dz * 0.05 + (Math.random() - 0.5) * 0.005;
          }
          
          posArray[ix] += velocities[ix];
          posArray[iy] += velocities[iy];
          posArray[iz] += velocities[iz];
        }
        
        positionAttr.needsUpdate = true;
        threeRef.current.car.rotation.y += 0.005;
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

          hands.onResults(onResults);

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

      // Particle effects on fingertips - EMPHASIZED
      [4, 8, 12, 16, 20].forEach(idx => {
        const pt = landmarks[idx];
        // Emit more particles for emphasis
        for(let i=0; i<3; i++) {
          particleSystem.current.emit(
            (1 - pt.x) * videoWidth, 
            pt.y * videoHeight, 
            idx === 4 ? LANDMARK_COLORS.thumb : LANDMARK_COLORS.index
          );
        }
      });

      // Move 3D car based on palm position (index 9)
      if (threeRef.current) {
        const palm = landmarks[9];
        // Map 0-1 range to roughly -3 to 3 for Three.js scene
        // Mirror X because cam is mirrored
        threeRef.current.car.position.x = (palm.x - 0.5) * -6;
        threeRef.current.car.position.y = (0.5 - palm.y) * 4;
      }

      // Gesture Recognition logic
      if (mode === 'detection' && storedGestures?.length) {
        detectGesture(landmarks);
      }
    } else {
      setCurrentLandmarks(null);
      if (mode === 'detection') setLastGesture('None');
    }

    // Update and draw particles
    particleSystem.current.update(videoWidth, videoHeight);
    particleSystem.current.draw(ctx);

    ctx.restore();
  }, [mode, storedGestures]);

  const detectGesture = (landmarks: any[]) => {
    if (!storedGestures?.length) return;

    // Feature extraction: Normalized distances from wrist (0) to finger tips (4,8,12,16,20)
    const getFeatures = (lms: any[]) => {
      const wrist = lms[0];
      const fingerTips = [4, 8, 12, 16, 20];
      
      // Calculate distances from wrist to fingertips
      const distances = fingerTips.map(idx => {
        const tip = lms[idx];
        return Math.sqrt(
          Math.pow(tip.x - wrist.x, 2) + 
          Math.pow(tip.y - wrist.y, 2) + 
          Math.pow(tip.z - wrist.z, 2)
        );
      });

      // Normalize by the length of the hand (wrist to middle finger base, index 9)
      const handScale = Math.sqrt(
        Math.pow(lms[9].x - wrist.x, 2) + 
        Math.pow(lms[9].y - wrist.y, 2) + 
        Math.pow(lms[9].z - wrist.z, 2)
      );

      return distances.map(d => d / (handScale || 1));
    };

    const currentFeatures = getFeatures(landmarks);
    let bestLabel = 'None';
    let minScore = 0.8; // Relaxed similarity threshold

    storedGestures.forEach(sample => {
      const sampleLandmarks = sample.landmarks as any[];
      if (!sampleLandmarks || !Array.isArray(sampleLandmarks)) return;
      
      const sampleFeatures = getFeatures(sampleLandmarks);
      
      // Calculate weighted Euclidean distance between feature vectors
      let diff = 0;
      currentFeatures.forEach((f, i) => {
        // Higher weight for index and middle fingers
        const weight = (i === 1 || i === 2) ? 1.5 : 1.0;
        diff += Math.pow(f - sampleFeatures[i], 2) * weight;
      });
      const score = Math.sqrt(diff);

      if (score < minScore) {
        minScore = score;
        bestLabel = sample.label;
      }
    });

    setLastGesture(bestLabel);
    
    // Global gesture state for 3D car
    if (window) (window as any).currentGesture = bestLabel;
  };

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) setCapturedImage(imageSrc);
    }
  };

  const saveSample = (label: string) => {
    if (!currentLandmarks) return;

    createGesture.mutate({
      label,
      landmarks: currentLandmarks
    }, {
      onSuccess: () => {
        setCapturedImage(null);
      }
    });
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5">
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
        className="absolute inset-0 w-full h-full object-cover"
        mirrored
      />

      {/* Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      />

      {/* 3D Content Container */}
      <div ref={threeContainerRef} className="absolute inset-0 z-20 pointer-events-none" />

      {/* Overlay UI Layer */}
      <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between pointer-events-none">
        
        {/* Top Header */}
        <div className="flex justify-between items-start">
          <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${cameraReady ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
            <span className="font-tech text-sm uppercase tracking-wider text-white/80">
              {cameraReady ? 'SYSTEM ONLINE' : 'WAITING FOR INPUT'}
            </span>
          </div>
          
          {mode === 'detection' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel px-6 py-3 rounded-lg border-primary/30"
            >
              <div className="text-xs text-primary/60 font-tech uppercase mb-1">Detected Gesture</div>
              <div className="text-2xl font-display font-bold text-primary text-shadow-neon">
                {lastGesture.toUpperCase()}
              </div>
            </motion.div>
          )}
        </div>

        {/* Training Controls (Bottom) */}
        {mode === 'training' && (
          <div className="pointer-events-auto w-full flex flex-col items-center gap-4">
            {capturedImage ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel p-4 rounded-xl max-w-md w-full"
              >
                <div className="flex gap-4 items-center mb-4">
                  <img src={capturedImage} alt="Captured" className="w-24 h-16 object-cover rounded border border-white/20" />
                  <div className="flex-1">
                    <h3 className="text-white font-display text-sm mb-1">Sample Captured</h3>
                    <p className="text-xs text-white/50">Assign a label to train the model</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => saveSample('Open Palm')}
                    disabled={createGesture.isPending}
                    className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50"
                  >
                    Open Palm
                  </Button>
                  <Button 
                    onClick={() => saveSample('Closed Fist')}
                    disabled={createGesture.isPending}
                    className="flex-1 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50"
                  >
                    Closed Fist
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setCapturedImage(null)}
                    className="px-3 text-white/50 hover:text-white"
                  >
                    Cancel
                  </Button>
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
