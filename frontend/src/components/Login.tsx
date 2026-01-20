import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch, setToken } from '../api/client';

interface LoginProps {
  onLogin: (user: { full_name: string; role: string }) => void;
  onGoRegister: () => void;
}

export default function Login({ onLogin, onGoRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiFetch<{ token: string; user: { full_name: string; role: string } }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password })
        }
      );

      setToken(data.token);
      localStorage.setItem('erp_user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Logo */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm"
            >
              <img src="/logo.png" alt="ERP logo" className="w-10 h-10" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-semibold text-[#040303] mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to your ERP account</p>
          </motion.div>

          {/* Form */}
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onSubmit={handleSubmit} 
            className="space-y-5"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#040303] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#040303] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
              type="submit"
              className="w-full bg-[#040303] text-white py-3 px-4 rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </motion.button>
          </motion.form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 text-center"
          >
            <a href="#" className="text-sm text-[#040303] hover:text-gray-700 transition-colors duration-200">
              Forgot password?
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-4 text-center"
          >
            <button
              type="button"
              onClick={onGoRegister}
              className="text-sm text-gray-600 hover:text-[#040303] transition-colors duration-200"
            >
              Don’t have an account? Create one
            </button>
          </motion.div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-sm text-gray-400 mt-6"
        >
          © 2026 ERP System. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}