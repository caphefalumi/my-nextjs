"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Play, Pause, SkipForward, X, Sparkles } from "lucide-react";

interface DemoStep {
  path: string;
  title: string;
  description: string;
  duration: number;
  highlights?: string[];
}

const DEMO_STEPS: DemoStep[] = [
  {
    path: "/dashboard",
    title: "Network Dashboard",
    description: "Interactive network graph showing employee relationships, collaboration patterns, and team dynamics. Click on nodes to see detailed employee profiles.",
    duration: 6000,
    highlights: ["Network visualization", "Employee connections", "Burnout indicators"],
  },
  {
    path: "/analytics",
    title: "Analytics Dashboard",
    description: "Comprehensive workforce analytics with department distribution, burnout risk analysis, and performance trends over time.",
    duration: 5000,
    highlights: ["Department stats", "Burnout distribution", "Performance trends"],
  },
  {
    path: "/personnel",
    title: "Personnel Management",
    description: "Complete employee directory with advanced filtering, search, and sorting capabilities. View detailed profiles for each team member.",
    duration: 5000,
    highlights: ["Employee list", "Filter & search", "Quick actions"],
  },
  {
    path: "/personnel/1",
    title: "Employee Profile",
    description: "Deep dive into individual employee data including AI-generated insights, performance metrics, chat logs, and commit history.",
    duration: 6000,
    highlights: ["AI summary", "Performance radar", "Activity logs"],
  },
  {
    path: "/insights",
    title: "AI Insights",
    description: "AI-powered recommendations for employee recognition, burnout prevention, and growth opportunities. Identify hidden gems and at-risk employees.",
    duration: 5000,
    highlights: ["Recommendations", "At-risk alerts", "Hidden gems"],
  },
  {
    path: "/performance",
    title: "Performance Leaderboard",
    description: "Track top performers across the organization with department rankings and individual impact scores.",
    duration: 5000,
    highlights: ["Leaderboard", "Department rankings", "Top performers"],
  },
  {
    path: "/settings",
    title: "Settings & Data Import",
    description: "Upload your own CSV data to analyze your workforce. Configure preferences and export reports.",
    duration: 4000,
    highlights: ["CSV upload", "Data import", "Configuration"],
  },
];

export function AIDemoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const startDemo = useCallback(() => {
    setIsRunning(true);
    setCurrentStep(0);
    setProgress(0);
    router.push(DEMO_STEPS[0].path);
  }, [router]);

  const stopDemo = useCallback(() => {
    setIsRunning(false);
    setProgress(0);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setProgress(0);
      router.push(DEMO_STEPS[currentStep + 1].path);
    } else {
      stopDemo();
    }
  }, [currentStep, router, stopDemo]);

  useEffect(() => {
    if (!isRunning) return;

    const step = DEMO_STEPS[currentStep];
    const interval = 50;
    const increment = (interval / step.duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStep();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isRunning, currentStep, nextStep]);

  const currentDemoStep = DEMO_STEPS[currentStep];

  return (
    <>
      {/* Floating Demo Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-lg shadow-purple-500/25"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          boxShadow: isRunning 
            ? ["0 0 20px rgba(139,92,246,0.5)", "0 0 40px rgba(139,92,246,0.8)", "0 0 20px rgba(139,92,246,0.5)"]
            : "0 0 20px rgba(139,92,246,0.25)"
        }}
        transition={{ duration: 1.5, repeat: isRunning ? Infinity : 0 }}
      >
        <Bot className="w-6 h-6" />
      </motion.button>

      {/* Demo Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/50 to-teal-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">AI Demo Mode</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Auto-guided tour of all features
              </p>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {isRunning ? (
                <>
                  {/* Current Step Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-400 font-medium">
                        Step {currentStep + 1} of {DEMO_STEPS.length}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.ceil((currentDemoStep.duration - (progress / 100) * currentDemoStep.duration) / 1000)}s
                      </span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-teal-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white">{currentDemoStep.title}</h4>
                    <p className="text-sm text-gray-400">{currentDemoStep.description}</p>
                  </div>

                  {currentDemoStep.highlights && (
                    <div className="flex flex-wrap gap-2">
                      {currentDemoStep.highlights.map((h) => (
                        <span
                          key={h}
                          className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={stopDemo}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      <Pause className="w-4 h-4" />
                      Stop
                    </button>
                    <button
                      onClick={nextStep}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                    >
                      <SkipForward className="w-4 h-4" />
                      Skip
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Demo Steps Preview */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {DEMO_STEPS.map((step, idx) => (
                      <div
                        key={step.path}
                        className={`p-3 rounded-lg border transition-colors ${
                          pathname === step.path
                            ? "bg-purple-500/20 border-purple-500/50"
                            : "bg-gray-800/50 border-transparent hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 flex items-center justify-center text-xs bg-purple-500/30 text-purple-300 rounded-full">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-white">{step.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={startDemo}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-medium rounded-lg transition-all"
                  >
                    <Play className="w-5 h-5" />
                    Start AI Demo
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/10 bg-black/30">
              <p className="text-xs text-gray-500 text-center">
                Press the bot button anytime to toggle demo panel
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Overlay Indicator */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-purple-600/90 backdrop-blur-sm text-white text-sm font-medium rounded-full flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            AI Demo Active: {currentDemoStep.title}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
