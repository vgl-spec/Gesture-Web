import { useGestures, useDeleteGesture } from "@/hooks/use-gestures";
import { Button } from "./ui/button";
import { Trash2, Database, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GestureList() {
  const { data: gestures, isLoading } = useGestures();
  const deleteGesture = useDeleteGesture();

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground animate-pulse font-tech">Loading gesture database...</div>;
  }

  if (!gestures || gestures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
        <Database className="w-8 h-8 text-muted-foreground mb-3" />
        <h3 className="text-muted-foreground font-display text-sm">No Samples Found</h3>
        <p className="text-xs text-white/30 mt-1">Switch to Training Mode to record gestures.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-white text-lg flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          Neural Database
        </h3>
        <span className="text-xs font-tech text-white/40">{gestures.length} SAMPLES</span>
      </div>

      <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {gestures.map((gesture, index) => (
            <motion.div
              key={gesture.id || `gesture-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-background border border-white/10">
                  <Fingerprint className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">{gesture.label}</h4>
                  <p className="text-[10px] font-mono text-white/40">ID: {gesture.id} • {(gesture.landmarks as any[]).length} PTS</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteGesture.mutate(gesture.id)}
                disabled={deleteGesture.isPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
