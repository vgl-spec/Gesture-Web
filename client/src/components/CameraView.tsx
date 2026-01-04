import { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { drawHandSkeleton, ParticleSystem, LANDMARK_COLORS } from '@/lib/drawing-utils';
import { useCreateGesture, useGestures } from '@/hooks/use-gestures';
import { Button } from './ui/button';
import { Loader2, Camera, Hand, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  const [loading, setLoading] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [lastGesture, setLastGesture] = useState<string>('None');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentLandmarks, setCurrentLandmarks] = useState<any[] | null>(null);
  
  const { data: storedGestures } = useGestures();
  const createGesture = useCreateGesture();

  // Initialize MediaPipe
  useEffect(() => {
    const loadMediaPipe = async () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = async () => {
        if (window.Hands) {
          const hands = new window.Hands({
            locateFile: (file: string) => {
              if (file.endsWith('.data') || file.endsWith('.wasm')) {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${window.Hands.VERSION}/${file}`;
              }
              return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
          });

          hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          hands.onResults(onResults);

          // Start processing loop
          const processVideo = () => {
            if (webcamRef.current?.video?.readyState === 4) {
              const video = webcamRef.current.video;
              hands.send({ image: video });
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

      // Particle effects on fingertips
      [4, 8, 12, 16, 20].forEach(idx => {
        const pt = landmarks[idx];
        particleSystem.current.emit(
          pt.x * videoWidth, 
          pt.y * videoHeight, 
          idx === 4 ? LANDMARK_COLORS.thumb : LANDMARK_COLORS.index
        );
      });

      // Gesture Recognition logic (Simple Euclidean)
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
    if (!storedGestures) return;

    let minDistance = Infinity;
    let detectedLabel = 'Unknown';

    storedGestures.forEach(sample => {
      const sampleLandmarks = sample.landmarks as any[];
      if (!sampleLandmarks) return;
      
      // Simple comparison of finger tips (indices 4, 8, 12, 16, 20)
      let dist = 0;
      [4, 8, 12, 16, 20].forEach(idx => {
        const p1 = landmarks[idx];
        const p2 = sampleLandmarks[idx];
        const d = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) + 
          Math.pow(p1.y - p2.y, 2) + 
          Math.pow(p1.z - p2.z, 2)
        );
        dist += d;
      });

      if (dist < minDistance) {
        minDistance = dist;
        detectedLabel = sample.label;
      }
    });

    // Threshold for detection
    if (minDistance < 1.0) { // Tunable threshold
      setLastGesture(detectedLabel);
    } else {
      setLastGesture('Unknown');
    }
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
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

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
