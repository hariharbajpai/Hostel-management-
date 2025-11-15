import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Building2, Shield, Users, ChevronRight } from 'lucide-react';
import authService from '../services/authService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const data = await authService.googleLogin(credentialResponse.credential);
      setSession(data);
      toast.success(`Welcome, ${data.user.name}!`);
      
      // Navigate based on role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google authentication failed. Please try again.');
  };

  const features = [
    { icon: Building2, title: 'Room Management', desc: 'Seamless hostel room allocation' },
    { icon: Users, title: 'Student Portal', desc: 'Easy room preferences & swaps' },
    { icon: Shield, title: 'Secure Access', desc: 'VIT Bhopal email authentication' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <motion.h1 
            className="text-7xl font-black mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Vit<span className="text-gray-400">Stay</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your gateway to streamlined hostel management at VIT Bhopal
          </motion.p>

          <div className="space-y-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-start gap-4 group"
              >
                <div className="p-3 bg-black text-white rounded-xl group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="bg-white border-4 border-black rounded-3xl p-8 md:p-12 shadow-2xl"
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8">
              <h1 className="text-5xl font-black mb-2">
                Vit<span className="text-gray-400">Stay</span>
              </h1>
              <p className="text-gray-600">Hostel Management System</p>
            </div>

            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.4 }}
                className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Building2 className="w-10 h-10" />
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in with your VIT Bhopal account</p>
            </div>

            {/* Google Login Button */}
            <div className="flex justify-center mb-6">
              {loading ? (
                <div className="w-full flex justify-center">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="300"
                />
              )}
            </div>

            {/* Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p className="font-semibold mb-1">Secure Authentication</p>
                  <p>Only @vitbhopal.ac.in email addresses are allowed</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                By signing in, you agree to our Terms & Privacy Policy
              </p>
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="hidden lg:block absolute -z-10 top-20 right-20 w-32 h-32 bg-black/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="hidden lg:block absolute -z-10 bottom-20 right-40 w-40 h-40 bg-black/5 rounded-full blur-3xl"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
