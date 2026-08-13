import React from 'react';
import { Calendar } from 'lucide-react';

interface MobileFooterNavProps {
  onOpenBooking: () => void;
}

export const MobileFooterNav: React.FC<MobileFooterNavProps> = ({ onOpenBooking }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pb-safe md:hidden bg-[#111413]/90 backdrop-blur-xl border-t border-[#e9c349]/30 shadow-2xl">
      <button
        onClick={onOpenBooking}
        className="bg-[#e9c349] text-[#3c2f00] font-bold flex flex-row items-center justify-center gap-2 rounded-xl py-3 px-6 mx-4 my-2 text-sm hover:opacity-90 active:scale-[0.97] transition-all w-full shadow-lg cursor-pointer"
      >
        <Calendar className="w-4 h-4" />
        <span>رزرو مشاوره</span>
      </button>
    </div>
  );
};
