'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { register, verifyIdentity } from "@/services/icp";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Mail, User, ArrowLeft } from "lucide-react";
import toast from 'react-hot-toast';
import { motion } from "framer-motion";
import { z } from "zod";

// Define strong types for form data and validation
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address')
});

type FormData = z.infer<typeof formSchema>;

const COOKIE_NAME = 'user_session' as const;
const COOKIE_EXPIRY = 7;

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  });
  
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
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

  const validateField = (name: keyof FormData, value: string): string | null => {
    try {
      formSchema.shape[name].parse(value);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0].message;
      }
      return 'Invalid input';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name as keyof FormData, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    toast('Authenticating...', { icon: '🔐' });

    try {
      // Validate all fields
      const validatedData = formSchema.parse(formData);

      const registerResponse = await register(validatedData.name, validatedData.email);
      
      if (!registerResponse) {
        throw new Error('Authentication failed');
      }

      // Set cookie with secure options
      document.cookie = `${COOKIE_NAME}=${JSON.stringify(validatedData)}; max-age=${COOKIE_EXPIRY * 24 * 60 * 60}; path=/; secure; samesite=strict`;

      toast('Registration successful! Redirecting to dashboard...', { icon: '🎉' });

      router.replace('/health');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce((acc, curr) => ({
          ...acc,
          [curr.path[0]]: curr.message
        }), {});
        setFormErrors(errors);
        toast('Please check the form for errors.', { icon: '❌', style: { backgroundColor: '#ff4d4f', color: '#fff' } });
      } else {
        toast('An unexpected error occurred', { icon: '❌', style: { backgroundColor: '#ff4d4f', color: '#fff' } });
      }
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
            <CardTitle className="text-2xl font-bold text-center">Welcome to Afya</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Begin your secure health journey with Internet Identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={`pl-10 ${formErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                      aria-invalid={!!formErrors.name}
                    />
                    {formErrors.name && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-500 mt-1"
                      >
                        {formErrors.name}
                      </motion.p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={`pl-10 ${formErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                      aria-invalid={!!formErrors.email}
                    />
                    {formErrors.email && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-500 mt-1"
                      >
                        {formErrors.email}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
                  disabled={isLoading }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    'Register with Internet Identity'
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={() => router.push('/auth/login')}
                  className="w-full bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 py-6 transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  Login with Internet Identity
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-500 gap-2">
            <Shield className="w-4 h-4" />
            <span>Protected by Internet Identity</span>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}