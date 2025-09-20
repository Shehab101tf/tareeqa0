import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

import { useRTL } from '../components/common/RTLProvider';
import { useAuth } from '../hooks/useAuth';
import GlassCard from '../components/common/GlassCard';
import GlassButton from '../components/common/GlassButton';

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  const { login } = useAuth();
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast.error(t('validation.required'));
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(credentials.username, credentials.password);
      
      if (success) {
        toast.success(t('auth.loginSuccess') || 'تم تسجيل الدخول بنجاح');
      } else {
        toast.error(t('auth.invalidCredentials'));
      }
    } catch (error) {
      toast.error(t('errors.general'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 mx-auto mb-6 glass rounded-3xl flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center">
              <LogIn className="w-5 h-5 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            className="text-3xl font-bold text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {isRTL ? 'طريقة POS' : 'Tareeqa POS'}
          </motion.h1>
          
          <motion.p
            className="text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {isRTL ? 'نظام نقاط البيع المتقدم' : 'Advanced Point of Sale System'}
          </motion.p>
        </div>

        {/* Login Form */}
        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('auth.login')}
              </h2>
              <p className="text-gray-600 text-sm">
                {isRTL 
                  ? 'يرجى إدخال بيانات الدخول للمتابعة' 
                  : 'Please enter your credentials to continue'
                }
              </p>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.username')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`input-glass w-full ${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
                  placeholder={t('auth.username')}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`input-glass w-full ${isRTL ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10'}`}
                  placeholder={t('auth.password')}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={credentials.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-white/80 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <span className={`text-sm text-gray-600 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                  {t('auth.rememberMe')}
                </span>
              </label>
              
              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>

            {/* Login Button */}
            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              leftIcon={<LogIn className="w-5 h-5" />}
            >
              {t('auth.login')}
            </GlassButton>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-2">
                {isRTL ? 'بيانات تجريبية:' : 'Demo Credentials:'}
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <div>
                  <span className="font-medium">{t('auth.username')}:</span> admin
                </div>
                <div>
                  <span className="font-medium">{t('auth.password')}:</span> admin123
                </div>
              </div>
            </div>
          </form>
        </GlassCard>

        {/* Footer */}
        <motion.div
          className="text-center mt-8 text-white/60 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p>
            © 2024 Tareeqa Technologies • {t('app.version')} 1.0.0
          </p>
          <p className="mt-1">
            {isRTL 
              ? 'مصمم خصيصاً للشركات المصرية' 
              : 'Designed for Egyptian Businesses'
            }
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
