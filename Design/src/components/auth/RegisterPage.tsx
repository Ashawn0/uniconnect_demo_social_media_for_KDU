import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Building2, Sparkles, ArrowRight } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface RegisterPageProps {
  onRegister: (data: any) => void;
  onSwitchToLogin: () => void;
}

export const RegisterPage = ({ onRegister, onSwitchToLogin }: RegisterPageProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'student'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(formData);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-primary opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[rgb(var(--accent))] opacity-10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
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
            <h1 className="mb-3">Join UniConnect</h1>
            <p className="text-[rgb(var(--muted-foreground))] text-lg">
              Create your campus profile
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="glass-strong rounded-3xl p-10 shadow-card-xl border-gradient">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                icon={<User className="w-5 h-5" />}
                required
              />

              <Input
                label="University Email"
                type="email"
                placeholder="you@university.edu"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                required
              />

              <Input
                label="Department"
                type="text"
                placeholder="Computer Science"
                value={formData.department}
                onChange={(e) => updateField('department', e.target.value)}
                icon={<Building2 className="w-5 h-5" />}
                required
              />

              <div>
                <label className="block mb-3 text-sm font-medium text-[rgb(var(--foreground))]">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['student', 'faculty'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => updateField('role', role)}
                      className={`px-5 py-3.5 rounded-2xl border-2 transition-all duration-300 font-medium ${
                        formData.role === role
                          ? 'border-[rgb(var(--primary))] bg-gradient-soft text-[rgb(var(--primary))] shadow-card'
                          : 'border-[rgb(var(--border))] text-[rgb(var(--muted-foreground))] hover:border-[rgb(var(--primary)/0.5)] hover:bg-[rgb(var(--muted))]'
                      }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                required
              />

              <Button type="submit" variant="gradient" fullWidth size="lg" glow>
                Create Account
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[rgb(var(--muted-foreground))] text-sm">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-soft))] transition-colors font-semibold"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
