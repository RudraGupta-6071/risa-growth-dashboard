import React from 'react';
import { Heart, Coffee } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 py-6 border-t border-[#4A2822] text-xs text-[#BBA69D]">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-1.5 font-medium text-[#FFFBF5]">
          <span>Built for RISA Labs APM Challenge A by Rudra Gupta</span>
          <span className="text-[#F6C445]">✦</span>
          <span className="text-[#BBA69D]">Bangalore, 2025</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#BBA69D]">
          <span>Cleaned 2025 dataset</span>
          <span>•</span>
          <span>Reset button in Diagnosis</span>
        </div>
      </div>
    </footer>
  );
};
