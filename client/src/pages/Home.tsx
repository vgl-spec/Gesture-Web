import { useState } from 'react';
import { CameraView } from '@/components/CameraView';
import { GestureList } from '@/components/GestureList';
import { Button } from '@/components/ui/button';
import { 
  BrainCircuit, 
  ScanLine, 
  Database,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [mode, setMode] = useState<'detection' | 'training'>('detection');
  const [showGesturePanel, setShowGesturePanel] = useState(false);

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* Fullscreen Camera - always on */}
      <CameraView mode={mode} />
      
      {/* Top Overlay - Logo & Mode Toggle */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <div className="flex justify-between items-start">
          {/* Logo */}
          <div className="pointer-events-auto">
            <h1 className="text-2xl font-display font-bold text-white/80">
              Gesture<span className="text-primary">OS</span>
            </h1>
            <span className="text-[10px] font-tech text-primary/60 tracking-widest">NEURAL INTERFACE</span>
          </div>
          
          {/* Mode Toggle Buttons */}
          <div className="flex gap-2 pointer-events-auto">
            <Button
              variant={mode === 'detection' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('detection')}
              className={`glass-panel border-white/10 ${mode === 'detection' ? 'text-primary' : 'text-white'}`}
            >
              <ScanLine className="w-4 h-4 mr-2" />
              Detection
            </Button>
            <Button
              variant={mode === 'training' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('training')}
              className={`glass-panel border-white/10 ${mode === 'training' ? 'text-primary' : 'text-white'}`}
            >
              <BrainCircuit className="w-4 h-4 mr-2" />
              Training
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Right - Gesture Database Toggle */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowGesturePanel(!showGesturePanel)}
          className="glass-panel w-12 h-12 rounded-full border border-white/10 hover:border-primary/50"
        >
          <Database className="w-5 h-5" />
        </Button>
      </div>

      {/* Gesture Panel Slide-out */}
      <AnimatePresence>
        {showGesturePanel && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 z-50 glass-panel border-l border-white/10 p-4 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-lg text-white">Neural Database</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGesturePanel(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <GestureList />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
