import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User as UserIcon, Phone, Shield } from 'lucide-react';
import { CosmicBackground } from '../Layout/CosmicBackground';

export const LoginPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { signIn, signUp, sendPhoneOTP, verifyPhoneOTP } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'email') {
        if (isLogin) {
          await signIn(email, password);
        } else {
          await signUp(email, password, displayName);
        }
      } else {
        if (!otpSent) {
          if (!phoneNumber.startsWith('+')) {
            setError('Phone number must include country code (e.g., +1234567890)');
            setLoading(false);
            return;
          }
          await sendPhoneOTP(phoneNumber);
          setOtpSent(true);
          setError('');
        } else {
          await verifyPhoneOTP(otp);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMessage = err.message || 'Authentication failed';
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Invalid email or password.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Please confirm your email address.');
      } else if (errorMessage.includes('User already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else if (errorMessage.includes('Password should be at least 6 characters')) {
        setError('Password should be at least 6 characters.');
      } else if (errorMessage.includes('Invalid email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-background flex items-center justify-center p-4 relative overflow-hidden">
      <CosmicBackground />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orbit-ring" style={{ width: '400px', height: '400px', top: '10%', left: '5%' }} />
        <div className="orbit-ring" style={{ width: '600px', height: '600px', top: '50%', right: '0%' }} />
        <div className="orbit-ring" style={{ width: '300px', height: '300px', bottom: '10%', left: '40%' }} />
      </div>

      <div className={`w-full max-w-md relative z-10 ${mounted ? 'animate-scale-in' : 'opacity-0'}`}>
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-[#00FFF0]/20 to-[#8A2BE2]/20 shadow-2xl shadow-[#00FFF0]/30 backdrop-blur-xl border-2 border-white/20 p-4 animate-pulse-glow">
            <img
              src="/logo.svg"
              alt="Kosmio"
              className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,255,240,0.6)]"
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="text-glow-teal">Kosmio</span>
            </h1>
            <p className="text-white/70 text-sm font-light tracking-wide">
              Creating at cosmic scale
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-3xl shadow-2xl p-6 border border-white/20 backdrop-blur-2xl">
          <div className="flex gap-2 mb-4 glass-panel rounded-2xl p-1">
            <button
              onClick={() => {
                setAuthMode('email');
                setError('');
                setOtpSent(false);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all text-sm blur-transition ${
                authMode === 'email'
                  ? 'bg-gradient-to-r from-[#00FFF0]/30 to-[#8A2BE2]/30 text-white shadow-lg border border-[#00FFF0]/50'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </button>
            <button
              onClick={() => {
                setAuthMode('phone');
                setError('');
                setOtpSent(false);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all text-sm blur-transition ${
                authMode === 'phone'
                  ? 'bg-gradient-to-r from-[#00FFF0]/30 to-[#8A2BE2]/30 text-white shadow-lg border border-[#00FFF0]/50'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Phone className="w-4 h-4 inline mr-1" />
              Phone
            </button>
          </div>

          {authMode === 'email' && (
            <div className="flex gap-2 mb-6 glass-panel rounded-2xl p-1">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all text-sm blur-transition ${
                  isLogin
                    ? 'bg-gradient-to-r from-[#00FFF0]/30 to-[#8A2BE2]/30 text-white shadow-lg border border-[#00FFF0]/50'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all text-sm blur-transition ${
                  !isLogin
                    ? 'bg-gradient-to-r from-[#00FFF0]/30 to-[#8A2BE2]/30 text-white shadow-lg border border-[#00FFF0]/50'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'email' ? (
              <>
                {!isLogin && (
                  <div className="animate-fade-in-up">
                    <label className="block text-xs font-medium text-white/80 mb-2">
                      Display Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 glass-panel border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none blur-transition"
                        placeholder="John Doe"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 glass-panel border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none blur-transition"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 glass-panel border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none blur-transition"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 glass-panel border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none blur-transition"
                      placeholder="+1234567890"
                      required
                      disabled={otpSent}
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-2">Include country code (e.g., +1 for US)</p>
                </div>

                {otpSent && (
                  <div className="animate-fade-in-up">
                    <label className="block text-xs font-medium text-white/80 mb-2">
                      Verification Code
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 glass-panel border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none blur-transition"
                        placeholder="123456"
                        required
                        maxLength={6}
                      />
                    </div>
                    <p className="text-xs text-white/40 mt-2">Enter the 6-digit code sent to your phone</p>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-xs animate-fade-in-up">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white py-3 px-4 rounded-xl font-medium hover:shadow-xl hover:shadow-[#00FFF0]/40 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed button-press text-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                  <span>Please wait...</span>
                </div>
              ) : authMode === 'phone' ? (
                otpSent ? 'Verify Code' : 'Send Code'
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            {authMode === 'phone' && otpSent && (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                  setError('');
                }}
                className="w-full text-white/70 hover:text-white py-2 text-sm transition-all"
              >
                Change phone number
              </button>
            )}
          </form>

          {authMode === 'email' && (
            <div className="mt-6 text-center">
              <p className="text-xs text-white/50">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-[#00FFF0] hover:text-[#00FFF0]/80 font-medium transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          )}

          <div id="recaptcha-container"></div>
        </div>

        <div className="text-center mt-6 text-white/40 text-xs">
          <p>Kosmio © 2025 — Crafted with intelligence</p>
          {authMode === 'phone' && (
            <p className="mt-2 text-[10px] text-white/30">Protected by reCAPTCHA</p>
          )}
        </div>
      </div>
    </div>
  );
};
