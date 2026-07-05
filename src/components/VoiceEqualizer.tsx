import React from 'react';

interface VoiceEqualizerProps {
  isActive: boolean;
  color?: string;
  barCount?: number;
}

export default function VoiceEqualizer({ 
  isActive, 
  color = 'bg-[#F4EE8E]', 
  barCount = 14 
}: VoiceEqualizerProps) {
  if (!isActive) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E4468]/60 border border-amber-200/20 animate-fade-in shadow-md" id="voice-equalizer-wrapper">
      <div className="flex items-center gap-1 h-6">
        {Array.from({ length: barCount }).map((_, i) => {
          // Dynamic organic duration and delay for a high-quality waveform look
          const duration = (0.4 + Math.random() * 0.6).toFixed(2);
          const delay = (Math.random() * 0.5).toFixed(2);
          const height = Math.floor(Math.random() * 3) + 1; // standard height multiplier fallback

          return (
            <span
              key={i}
              className={`w-1 rounded-full ${color} equalizer-bar`}
              style={{
                height: `${height * 6 + 4}px`,
                animationDuration: `${duration}s`,
                animationDelay: `-${delay}s`,
              }}
            />
          );
        })}
      </div>
      <span className="text-xs text-red-400 font-mono font-semibold tracking-wider animate-pulse uppercase flex items-center gap-1 shrink-0">
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" />
        Запись голоса... ИИ слушает
      </span>
    </div>
  );
}
