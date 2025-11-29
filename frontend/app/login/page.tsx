"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(20, 184, 166, 0.3))",
              boxShadow: "0 0 40px rgba(139, 92, 246, 0.3)",
            }}
            animate={{
              boxShadow: [
                "0 0 40px rgba(139, 92, 246, 0.3)",
                "0 0 60px rgba(20, 184, 166, 0.4)",
                "0 0 40px rgba(139, 92, 246, 0.3)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
              L
            </span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Luminus</h1>
          <p className="text-gray-400">AI-Powered HR Analytics Platform</p>
        </div>

        {/* Login Card */}
        <div
          className="p-8 rounded-2xl border border-white/10"
          style={{
            background: "linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.9))",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Sign in as Admin</h2>
              <p className="text-sm text-gray-400">
                Manage your organization&apos;s workforce analytics
              </p>
            </div>

            {/* Google Sign In Button */}
            <motion.button
              onClick={login}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </motion.button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900 text-gray-500">Secure authentication</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {[
                "Upload and manage employee data",
                "AI-powered workforce insights",
                "Network visualization & analytics",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-teal-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
