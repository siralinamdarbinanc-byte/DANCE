import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('لطفا رمز عبور مدیریت را وارد کنید.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await api.loginAdmin(password);
    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'رمز عبور اشتباه است.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in-up">
      <div className="relative w-full max-w-md bg-[#181a19] border border-[#e9c349]/40 rounded-3xl p-8 shadow-2xl text-right space-y-6">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-4 bg-[#063b2f] border border-[#e9c349]/40 rounded-2xl text-[#e9c349] shadow-lg shadow-[#063b2f]/50">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-[#e2e3e0]">
              ورود امن به پنل مدیریت DANCE ACADEMY
            </h2>
            <p className="text-xs text-[#c0c8c4] mt-1">
              جهت مشاهده CRM، رزروها و تنظیمات محتوا رمز عبور را وارد کنید.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-950/40 border border-red-500/40 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#c0c8c4] mb-1.5">
              رمز عبور مدیریت:
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور مدیریت را وارد کنید..."
                className="w-full bg-[#111413] border border-[#e9c349]/30 focus:border-[#e9c349] text-white px-4 py-3 rounded-xl text-sm outline-none pl-10 transition-colors"
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-[#e9c349] absolute left-3 top-3.5" />
            </div>
            <p className="text-[11px] text-[#c0c8c4]/70 mt-1">
              (رمز پیش‌فرض پیش‌نمایش: <code className="text-[#e9c349]">123456</code> یا <code className="text-[#e9c349]">admin</code>)
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-[#111413] hover:bg-white/5 border border-white/10 text-[#c0c8c4] text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-[#e9c349] to-[#c9a329] text-[#111413] font-bold text-xs rounded-xl hover:brightness-110 shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span>در حال بررسی...</span>
              ) : (
                <>
                  <span>ورود به پنل</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
