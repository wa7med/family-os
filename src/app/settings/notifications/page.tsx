"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Bell, Mail, TestTube } from "lucide-react";
import { apiPost } from "@/hooks/use-fetch";

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [smtpSettings, setSmtpSettings] = useState({
    host: "",
    port: "587",
    secure: "starttls",
    user: "",
    password: "",
    fromEmail: "",
    fromName: "Family Life OS",
    recipientEmail: "",
  });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load saved settings on mount
  useEffect(() => {
    const saved = localStorage.getItem("smtpSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSmtpSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse saved SMTP settings");
      }
    }
  }, []);

  async function handleSave() {
    setLoading(true);
    try {
      const settingsToSave = {
        host: smtpSettings.host,
        port: smtpSettings.port,
        secure: smtpSettings.secure,
        user: smtpSettings.user,
        password: smtpSettings.password,
        fromEmail: smtpSettings.fromEmail,
        fromName: smtpSettings.fromName,
        recipientEmail: smtpSettings.recipientEmail,
      };
      localStorage.setItem("smtpSettings", JSON.stringify(settingsToSave));
      setTestResult({ success: true, message: "SMTP settings saved successfully!" });
      setTimeout(() => setTestResult(null), 3000);
    } catch (err) {
      setTestResult({ success: false, message: "Failed to save settings" });
    } finally {
      setLoading(false);
    }
  }

  async function handleTest() {
    setTestLoading(true);
    setTestResult(null);
    try {
      await apiPost("/api/test-email", {
        host: smtpSettings.host,
        port: parseInt(smtpSettings.port),
        secure: smtpSettings.secure === "tls",
        user: smtpSettings.user,
        password: smtpSettings.password,
        fromEmail: smtpSettings.fromEmail,
        fromName: smtpSettings.fromName,
        recipientEmail: smtpSettings.recipientEmail,
      });
      setTestResult({ success: true, message: "Test email sent successfully! Check your inbox." });
    } catch (err) {
      setTestResult({ success: false, message: "Failed to send test email. Check your SMTP settings." });
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold text-sage-900">Notifications</h2>
      </div>

      {/* SMTP Settings */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Mail className="h-5 w-5 text-sage-600" />
            <h3 className="font-semibold text-sage-900">SMTP Settings</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-sage-700 block mb-1">SMTP Host</label>
              <Input
                placeholder="smtp.example.com"
                value={smtpSettings.host}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-sage-700 block mb-1">Port</label>
                <Input
                  placeholder="587"
                  value={smtpSettings.port}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-sage-700 block mb-1">Security</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={smtpSettings.secure}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, secure: e.target.value })}
                >
                  <option value="starttls">STARTTLS</option>
                  <option value="tls">TLS/SSL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-sage-700 block mb-1">Username</label>
              <Input
                placeholder="your@email.com"
                value={smtpSettings.user}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, user: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-sage-700 block mb-1">Password</label>
              <Input
                type="password"
                placeholder="App password or SMTP password"
                value={smtpSettings.password}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, password: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-sage-700 block mb-1">From Email</label>
                <Input
                  placeholder="noreply@example.com"
                  value={smtpSettings.fromEmail}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, fromEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-sage-700 block mb-1">From Name</label>
                <Input
                  placeholder="Family Life OS"
                  value={smtpSettings.fromName}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, fromName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-sage-700 block mb-1">Recipient Email</label>
              <Input
                type="email"
                placeholder="notifications@example.com"
                value={smtpSettings.recipientEmail}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, recipientEmail: e.target.value })}
              />
              <p className="text-xs text-sage-500 mt-1">Email address to receive notifications</p>
            </div>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg text-sm ${testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {testResult.message}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleTest}
              disabled={testLoading || !smtpSettings.host || !smtpSettings.user}
            >
              <TestTube className="h-4 w-4" />
              {testLoading ? "Sending..." : "Send Test"}
            </Button>
            <Button
              className="flex-1 bg-sage-600 hover:bg-sage-700"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="shadow-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Bell className="h-5 w-5 text-sage-600" />
            <h3 className="font-semibold text-sage-900">Notification Preferences</h3>
          </div>

          <div className="space-y-3">
            {[
              { label: "Contract cancellation reminders", desc: "Get notified before contract cancellation deadlines" },
              { label: "Daily task reminders", desc: "Morning reminder for urgent tasks" },
              { label: "Weekly summary", desc: "Summary of the week's activities" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-sage-900">{item.label}</p>
                  <p className="text-xs text-sage-500">{item.desc}</p>
                </div>
                <button className="relative w-11 h-6 bg-sage-200 rounded-full peer-checked:bg-sage-500">
                  <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow peer-checked:translate-x-5 transition-all" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
