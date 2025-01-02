'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { verifyIdentity } from "@/utils/icp";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from 'react-hot-toast';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pulseAnimation = {
  scale: [1, 1.1, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const isAuthenticated = await verifyIdentity();
      if (isAuthenticated) {
        toast('Welcome back! Redirecting to dashboard...', { icon: '🎉' });
        router.replace('/health');
      } else {
        router.replace('/auth/register');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      toast('Authentication check failed. Redirecting to registration...', { icon: '❌', style: { backgroundColor: '#ff4d4f', color: '#fff' } });
      router.replace('/auth/register');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => {
        checkAuth();
      }, 1000); // Small delay for smooth animation

      return () => clearTimeout(timer);
    }
  }, [checkAuth, isMounted]);

  // Prevent hydration issues by not rendering until mounted
  if (!isMounted) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeIn}
          className="w-full max-w-2xl"
        >
          <Card className="bg-white/80 backdrop-blur shadow-xl border-0">
            <CardContent className="p-8 space-y-8">
              <motion.div 
                className="flex items-center justify-center space-x-4"
                animate={pulseAnimation}
              >
                <Heart className="w-12 h-12 text-blue-500" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Afya
                </h1>
              </motion.div>
              
              <motion.p 
                className="text-xl text-center text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Your Personal Health Companion
              </motion.p>

              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 transition-all duration-300 ease-in-out"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Preparing your experience...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span>Redirecting...</span>
                    </div>
                  )}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-sm text-gray-500"
              >
                Secure health tracking powered by Internet Identity
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}