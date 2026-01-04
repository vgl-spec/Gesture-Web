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
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Camera (Main Focus) */}
          <div className="flex-1 space-y-6">
            <div className="relative group">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary opacity-50"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary opacity-50"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary opacity-50"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary opacity-50"></div>
              
              <CameraView mode={mode} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                subtext="MediaPipe"
              />
              <StatsCard 
                icon={<Cpu className="w-4 h-4 text-orange-400" />}
                label="GPU"
                value="Active"
                subtext="WebGL 2.0"
              />
            </div>
          </div>

          {/* Right Column: Minimized Controls */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Gesture Database */}
            <GestureList />
            
            {/* Minimal Instructions */}
            <div className="glass-panel p-4 rounded-xl border border-white/5 opacity-60 hover:opacity-100 transition-opacity">
              <h3 className="text-xs font-tech uppercase tracking-widest mb-2 text-primary/80">Protocol</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {mode === 'training' 
                  ? "Align hand and capture samples for signature calculation."
                  : "Scanning for matches. Ensue adequate lighting."}
              </p>
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
