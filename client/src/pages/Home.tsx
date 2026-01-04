import { useState } from 'react';
import { CameraView } from '@/components/CameraView';
import { GestureList } from '@/components/GestureList';
import { Button } from '@/components/ui/button';
import { 
  BrainCircuit, 
  ScanLine, 
  Activity, 
  Cpu,
  Github
} from 'lucide-react';

export default function Home() {
  const [mode, setMode] = useState<'detection' | 'training'>('detection');

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-white selection:bg-primary/30">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Cpu className="w-5 h-5" />
              <span className="font-tech tracking-[0.2em] text-xs">V1.0.0 // NEURAL INTERFACE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
              Gesture<span className="text-primary">OS</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
            <Button
              variant={mode === 'detection' ? 'default' : 'neon'}
              onClick={() => setMode('detection')}
              className="w-full md:w-auto"
            >
              <ScanLine className="w-4 h-4 mr-2" />
              Detection
            </Button>
            <Button
              variant={mode === 'training' ? 'default' : 'neon'}
              onClick={() => setMode('training')}
              className="w-full md:w-auto"
            >
              <BrainCircuit className="w-4 h-4 mr-2" />
              Training
            </Button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Camera */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative group">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary opacity-50"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary opacity-50"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary opacity-50"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary opacity-50"></div>
              
              <CameraView mode={mode} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard 
                icon={<Activity className="w-4 h-4 text-secondary" />}
                label="Latency"
                value="12ms"
                subtext="Real-time"
              />
              <StatsCard 
                icon={<ScanLine className="w-4 h-4 text-accent" />}
                label="Tracking"
                value="21 Pts"
                subtext="High Precision"
              />
              <StatsCard 
                icon={<BrainCircuit className="w-4 h-4 text-primary" />}
                label="Model"
                value="Lite"
                subtext="MediaPipe Hands"
              />
            </div>
          </div>

          {/* Right Column: Controls & Data */}
          <div className="space-y-6">
            
            {/* Instruction Panel */}
            <div className="glass-panel p-6 rounded-xl border border-white/5">
              <h3 className="font-display text-lg mb-4 text-white">
                {mode === 'training' ? 'Training Protocol' : 'System Status'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light mb-4">
                {mode === 'training' 
                  ? "Align your hand within the frame. Capture multiple samples for 'Open Palm' and 'Closed Fist' to improve recognition accuracy. The system uses these samples to calculate Euclidean distance signatures."
                  : "System is actively scanning for gesture matches. Ensure adequate lighting and keep hand within 1-2 meters of the sensor array. Particle effects indicate active tracking points."}
              </p>
              
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary/50 w-2/3 animate-pulse"></div>
              </div>
            </div>

            {/* Gesture Database */}
            <GestureList />

            {/* Footer */}
            <div className="pt-6 border-t border-white/5 flex justify-between items-center opacity-50 hover:opacity-100 transition-opacity">
               <span className="text-xs font-mono">POWERED BY MEDIAPIPE</span>
               <a href="#" className="hover:text-primary transition-colors">
                 <Github className="w-5 h-5" />
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, subtext }: { icon: any, label: string, value: string, subtext: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors group">
      <div className="p-2 rounded-lg bg-black/40 border border-white/10 group-hover:border-primary/50 transition-colors">
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground font-tech uppercase tracking-wider">{label}</div>
        <div className="text-xl font-bold font-display text-white">{value}</div>
        <div className="text-[10px] text-white/30">{subtext}</div>
      </div>
    </div>
  );
}
