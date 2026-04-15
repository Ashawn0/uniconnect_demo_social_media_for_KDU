import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '../ui/alert';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage = ({ onSwitchToRegister }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginMutation } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-primary opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[rgb(var(--accent))] opacity-10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl mb-6 shadow-card-lg glow-primary"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="mb-3">Welcome Back</h1>
            <p className="text-[rgb(var(--muted-foreground))] text-lg">
              Sign in to your campus hub
            </p>
          </motion.div>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="glass-strong rounded-3xl p-10 shadow-card-xl border-gradient">
            <form onSubmit={handleSubmit} className="space-y-6">
              {loginMutation.isError && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {loginMutation.error?.message || 'Invalid email or password'}
                  </AlertDescription>
                </Alert>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                required
                disabled={loginMutation.isPending}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                required
                disabled={loginMutation.isPending}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2.5 text-[rgb(var(--foreground))] cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="peer sr-only" disabled={loginMutation.isPending} />
                    <div className="w-5 h-5 border-2 border-[rgb(var(--border))] rounded-md peer-checked:bg-gradient-primary peer-checked:border-transparent transition-all" />
                    <svg className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="group-hover:text-[rgb(var(--primary))] transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-soft))] transition-colors font-medium">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="gradient"
                fullWidth
                size="lg"
                glow
                disabled={loginMutation.isPending}
                className="relative"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[rgb(var(--muted-foreground))] text-sm">
                Don&apos;t have an account?{' '}
                <button
                  onClick={onSwitchToRegister}
                  className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-soft))] transition-colors font-semibold"
                  disabled={loginMutation.isPending}
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[rgb(var(--muted-foreground))] text-sm mt-8"
        >
          By continuing, you agree to our{' '}
          <a href="#" className="text-[rgb(var(--primary))] hover:underline">Terms</a>
          {' & '}
          <a href="#" className="text-[rgb(var(--primary))] hover:underline">Privacy Policy</a>
        </motion.p>
      </motion.div>
    </div>
  );
};
