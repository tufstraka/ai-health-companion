'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { login, verifyIdentity } from "@/services/icp";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, ArrowLeft } from "lucide-react";
import toast from 'react-hot-toast';
import { motion } from "framer-motion";

const COOKIE_NAME = 'user_session' as const;
const COOKIE_EXPIRY = 7;

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const isAuthenticated = await verifyIdentity();
      if (isAuthenticated) {
        router.replace('/health');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      toast('Failed to verify current session. Please try again.', { icon: '❌', style: { backgroundColor: '#ff4d4f', color: '#fff' } });
    } finally {
      setIsAuthChecking(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    toast('Authenticating with Internet Identity...', { icon: '🔐' });

    try {
      const loginResponse = await login();
      
      if (!loginResponse) {
        throw new Error('Authentication failed');
      }

      toast('Login successful! Redirecting to dashboard...', { icon: '🎉' });

      router.replace('/health');
    } catch (error) {
      toast('Authentication failed. Please try again.', { icon: '❌', style: { backgroundColor: '#ff4d4f', color: '#fff' } });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/90">
          <CardHeader className="space-y-1 pb-8">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <motion.div 
              className="flex justify-center mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-center">Welcome Back to Afya</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Continue your secure health journey with Internet Identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 transition-all duration-200 ease-in-out"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      'Login with Internet Identity'
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button
                    type="button"
                    onClick={() => router.push('/auth/register')}
                    className="w-full bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 py-6 transition-all duration-200 ease-in-out"
                    disabled={isLoading}
                  >
                    Create New Account
                  </Button>
                </motion.div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Protected by Internet Identity</span>
            </div>
            <p className="text-xs text-center max-w-sm">
              By continuing, you agree to Afya's Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}