import React from 'react';
import { useContent } from '../context/ContentContext';
import { Award, CheckCircle2, Sparkles, Calendar } from 'lucide-react';

interface InstructorsPageProps {
  onOpenBooking: (instructorName?: string) => void;
}

export const InstructorsPage: React.FC<InstructorsPageProps> = ({ onOpenBooking }) => {
  const { content } = useContent();
  const instructors = content.instructors || [];

  return (
    <div className="w-full min-h-screen text-right pt-24 pb-16 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-[#e9c349] text-xs font-bold uppercase tracking-wider border border-[#e9c349]/30 px-3 py-1 rounded-full">
          کادر آموزشی آکادمی
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-[#e2e3e0] font-display">
          اساتید و طراحان رقص بین‌المللی
        </h1>
        <p className="text-xs md:text-sm text-[#c0c8c4]">
          با بااستعدادترین مربیان و طراحان حرکت که بیش از ۵۰۰ طراحی رقص ماندگار را ثبت کرده‌اند آشنا شوید.
        </p>
      </div>

      <div className="space-y-12">
        {instructors.map((ins, index) => (
          <div
            key={ins.id}
            className={`bg-[#181a19] border border-[#e9c349]/20 rounded-3xl p-6 md:p-10 flex flex-col ${
              index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'
            } gap-8 items-center shadow-xl`}
          >
            {/* Image */}
            <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-2xl overflow-hidden border-2 border-[#e9c349] p-1.5 shadow-2xl">
              <img src={ins.image} alt={ins.name} className="w-full h-full object-cover rounded-xl" />
            </div>

            {/* Content */}
            <div className="space-y-4 flex-1">
              <div className="inline-block bg-[#063b2f]/80 text-[#a0d1c0] border border-[#e9c349]/30 text-xs px-3 py-1 rounded-full">
                {ins.title}
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-[#e2e3e0] font-display">{ins.name}</h2>

              <p className="text-xs md:text-sm text-[#c0c8c4] leading-relaxed">{ins.bio}</p>

              <div className="flex flex-wrap gap-2 pt-1">
                {ins.featuredStyles.map((style, i) => (
                  <span
                    key={i}
                    className="bg-[#111413] text-[#e9c349] border border-[#e9c349]/20 text-xs px-3 py-1 rounded-full"
                  >
                    {style}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-[#e9c349]/15 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-6 text-xs text-[#c0c8c4]">
                  <div>
                    <span>سابقه فعالیت: </span>
                    <strong className="text-[#e2e3e0]">{ins.experienceYears} سال</strong>
                  </div>
                  <div>
                    <span>طراحی رقص‌های موفق: </span>
                    <strong className="text-[#e2e3e0]">+{ins.choreographiesCount} زوج</strong>
                  </div>
                </div>

                <button
                  onClick={() => onOpenBooking(`کلاس با ${ins.name}`)}
                  className="bg-[#063b2f] hover:bg-[#084b3c] text-[#a0d1c0] font-bold text-xs px-6 py-2.5 rounded-full border border-[#e9c349]/30 hover-gold-glow cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-[#e9c349]" />
                  <span>رزرو جلسه با این استاد</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
