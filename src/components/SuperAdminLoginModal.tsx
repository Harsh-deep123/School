import { FormEvent, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldCheck, X } from 'lucide-react';

interface SuperAdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
}

export function SuperAdminLoginModal({
  isOpen,
  onClose,
  onLogin,
}: SuperAdminLoginModalProps) {
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onLogin(username.trim(), password);
      setPassword('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0c3b2e]/55 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="super-admin-login-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-md rounded-2xl bg-white border border-[#d5e2db] shadow-[0_20px_40px_-20px_rgba(12,59,46,0.45)] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[#d5e2db] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#0b6b4c] text-white inline-flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="super-admin-login-title"
                    className="font-display text-base font-semibold text-[#12261f]"
                  >
                    Super Admin Login
                  </h2>
                  <p className="text-xs text-[#3d5248] mt-0.5">
                    Full edit access to timetable, calendar &amp; records
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close login"
                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-[#6b8578] hover:bg-[#f5faf7] hover:text-[#12261f]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-[#3d5248]">
                  Username
                </span>
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1.5 w-full h-11 px-3 rounded-lg border border-[#d5e2db] bg-white text-sm text-[#12261f] outline-none focus:border-[#0b6b4c] focus:ring-2 focus:ring-[#0b6b4c]/15"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-[#3d5248]">
                  Password
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Super Admin password"
                  className="mt-1.5 w-full h-11 px-3 rounded-lg border border-[#d5e2db] bg-white text-sm text-[#12261f] outline-none focus:border-[#0b6b4c] focus:ring-2 focus:ring-[#0b6b4c]/15"
                />
              </label>

              {error && (
                <p className="text-xs font-medium text-[#be123c]">{error}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 px-4 rounded-lg border border-[#d5e2db] bg-white text-sm font-semibold text-[#12261f] hover:bg-[#f5faf7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !password}
                  className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] disabled:opacity-60"
                >
                  {submitting ? 'Signing in…' : 'Enter Super Admin'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
