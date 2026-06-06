import React from 'react';
import type { Spot } from "@/app/types/spots";

interface SpotCommentProps {
  spot: Spot;
}

export default function SpotComment({ spot }: SpotCommentProps) {
  if (!spot.comment) {
    return null;
  }

  return (
    <div className="bg-[#fffbeb] border border-[#fcd34d] rounded-[20px] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-[0.06] pointer-events-none text-[#d97706]">
        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      </div>
      <div className="flex items-center gap-2 mb-2 relative z-10">
        <div className="w-8 h-8 rounded-full bg-white border border-[#fde68a] flex items-center justify-center text-[#d97706] shadow-sm">
          <span className="text-sm">💬</span>
        </div>
        <h3 className="text-sm font-bold tracking-tight text-[#92400e]">
          À savoir
        </h3>
      </div>
      <p className="text-[14px] text-[#92400e] leading-relaxed relative z-10 font-medium ml-10">
        {spot.comment}
      </p>
    </div>
  );
}
