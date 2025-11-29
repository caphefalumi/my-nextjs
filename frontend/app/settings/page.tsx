"use client";

import { CyberpunkLayout } from "@/components/layout/cyberpunk-layout";
import { RequireAuth } from "@/components/auth/require-auth";
import { cn } from "@/lib/utils";
import {
  Bell, Shield, Palette, Database, Download, Upload,
  Moon, Sun, Monitor, Check, ChevronRight, CheckCircle
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface SettingSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
}

const sections: SettingSection[] = [
  { id: "appearance", title: "Appearance", icon: Palette, description: "Customize the look and feel" },
  { id: "notifications", title: "Notifications", icon: Bell, description: "Manage alert preferences" },
  { id: "privacy", title: "Privacy & Security", icon: Shield, description: "Control your data" },
  { id: "data", title: "Data Management", icon: Database, description: "Import, export, and sync" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("appearance");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [accentColor, setAccentColor] = useState("#8b5cf6");
  const [notifications, setNotifications] = useState({
    burnoutAlerts: true,
    performanceUpdates: true,
    weeklyDigest: false,
    newHireAlerts: true,
  });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [dataRetention, setDataRetention] = useState("forever");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleEnable2FA = () => {
    setIs2FAEnabled(true);
    showFeedback("Two-Factor Authentication enabled successfully!");
  };

  const handleSignOutAll = () => {
    showFeedback("All other sessions have been signed out.");
  };

  const handleExportData = () => {
    showFeedback("Data export started. Check your downloads folder.");
  };

  const handleDeleteAllData = () => {
    if (confirm("Are you sure you want to delete all data? This cannot be undone.")) {
      showFeedback("All data has been deleted.");
    }
  };

  return (
    <CyberpunkLayout>
      <div className="space-y-6">
        {/* Feedback Toast */}
        {feedbackMessage && (
          <div className="fixed top-4 right-4 z-50 p-4 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center gap-3 animate-in slide-in-from-right">
            <CheckCircle className="w-5 h-5 text-teal-400" />
            <p className="text-teal-300">{feedbackMessage}</p>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your preferences and account</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full p-4 rounded-xl flex items-center gap-3 transition-all text-left",
                  activeSection === section.id
                    ? "bg-purple-500/20 border border-purple-500/30 text-white"
                    : "bg-gray-900/50 border border-transparent hover:bg-white/5 text-gray-400"
                )}
              >
                <section.icon className="w-5 h-5" />
                <div className="flex-1">
                  <p className="font-medium">{section.title}</p>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
                {activeSection === section.id && (
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="col-span-3 p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            {/* Appearance */}
            {activeSection === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Appearance</h2>
                  <p className="text-gray-400 text-sm">Customize how Luminus.ai looks on your device</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "light", label: "Light", icon: Sun },
                      { id: "system", label: "System", icon: Monitor },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id as typeof theme)}
                        className={cn(
                          "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                          theme === option.id
                            ? "bg-purple-500/20 border-purple-500/50 text-white"
                            : "bg-black/30 border-white/10 text-gray-400 hover:border-white/20"
                        )}
                      >
                        <option.icon className="w-6 h-6" />
                        <span className="text-sm">{option.label}</span>
                        {theme === option.id && (
                          <Check className="w-4 h-4 text-purple-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300">Accent Color</h3>
                  <div className="flex gap-3">
                    {["#8b5cf6", "#2dd4bf", "#ec4899", "#f59e0b", "#10b981"].map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setAccentColor(color);
                          showFeedback("Accent color updated!");
                        }}
                        className={cn(
                          "w-10 h-10 rounded-xl ring-2 ring-offset-2 ring-offset-gray-900 transition-all",
                          accentColor === color ? "ring-white" : "ring-transparent hover:ring-white/50"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Notifications</h2>
                  <p className="text-gray-400 text-sm">Choose what alerts you want to receive</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: "burnoutAlerts", label: "Burnout Risk Alerts", description: "Get notified when employees show high burnout risk" },
                    { key: "performanceUpdates", label: "Performance Updates", description: "Weekly performance score changes" },
                    { key: "weeklyDigest", label: "Weekly Digest", description: "Summary of all workforce metrics" },
                    { key: "newHireAlerts", label: "New Hire Alerts", description: "Notifications for new team members" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/10">
                      <div>
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-gray-500 text-sm">{item.description}</p>
                      </div>
                      <button
                        onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          notifications[item.key as keyof typeof notifications]
                            ? "bg-purple-500"
                            : "bg-gray-700"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                            notifications[item.key as keyof typeof notifications]
                              ? "translate-x-6"
                              : "translate-x-0.5"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy */}
            {activeSection === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Privacy & Security</h2>
                  <p className="text-gray-400 text-sm">Manage your security settings and data privacy</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                    <h3 className="text-white font-medium mb-2">Two-Factor Authentication</h3>
                    <p className="text-gray-500 text-sm mb-3">Add an extra layer of security to your account</p>
                    {is2FAEnabled ? (
                      <div className="flex items-center gap-2 text-teal-400">
                        <Check className="w-4 h-4" />
                        <span>2FA is enabled</span>
                      </div>
                    ) : (
                      <button 
                        onClick={handleEnable2FA}
                        className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                      >
                        Enable 2FA
                      </button>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                    <h3 className="text-white font-medium mb-2">Session Management</h3>
                    <p className="text-gray-500 text-sm mb-3">Manage active sessions and sign out from other devices</p>
                    <button 
                      onClick={handleSignOutAll}
                      className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                    >
                      Sign Out All Devices
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                    <h3 className="text-white font-medium mb-2">Data Retention</h3>
                    <p className="text-gray-500 text-sm mb-3">Control how long your data is stored</p>
                    <select 
                      value={dataRetention}
                      onChange={(e) => {
                        setDataRetention(e.target.value);
                        showFeedback("Data retention policy updated!");
                      }}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-white/10 focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="forever">Keep forever</option>
                      <option value="1year">1 year</option>
                      <option value="6months">6 months</option>
                      <option value="3months">3 months</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management */}
            {activeSection === "data" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Data Management</h2>
                  <p className="text-gray-400 text-sm">Import, export, and manage your workforce data</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-xl bg-black/30 border border-white/10 text-center">
                    <Upload className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-2">Import Data</h3>
                    <p className="text-gray-500 text-sm mb-4">Upload CSV or Excel files</p>
                    <Link href="/">
                      <button className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                        Go to Import
                      </button>
                    </Link>
                  </div>

                  <div className="p-6 rounded-xl bg-black/30 border border-white/10 text-center">
                    <Download className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-2">Export Data</h3>
                    <p className="text-gray-500 text-sm mb-4">Download your workforce data</p>
                    <button 
                      onClick={handleExportData}
                      className="px-4 py-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition-colors"
                    >
                      Export
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <h3 className="text-red-300 font-medium mb-2">Danger Zone</h3>
                  <p className="text-gray-500 text-sm mb-3">Permanently delete all your data. This action cannot be undone.</p>
                  <button 
                    onClick={handleDeleteAllData}
                    className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                  >
                    Delete All Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CyberpunkLayout>
  );
}
