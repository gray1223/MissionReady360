"use client";

import { useRouter } from "next/navigation";
import {
  User,
  Bell,
  Shield,
  LogOut,
  Mail,
  Lock,
  Edit,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();

  const callsign = user?.user_metadata?.callsign || "Not set";
  const rank = user?.user_metadata?.rank || "Not set";
  const branch = user?.user_metadata?.branch || "Not set";
  const unit = user?.user_metadata?.unit || "Not set";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-500" />
                  Profile
                </span>
              </CardTitle>
              <CardDescription>
                Your military service profile information
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" disabled>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-slate-800/30 px-4 py-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Branch
              </p>
              <p className="mt-1 text-sm text-slate-200">{branch}</p>
            </div>
            <div className="rounded-lg bg-slate-800/30 px-4 py-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Rank
              </p>
              <p className="mt-1 text-sm text-slate-200">{rank}</p>
            </div>
            <div className="rounded-lg bg-slate-800/30 px-4 py-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Unit
              </p>
              <p className="mt-1 text-sm text-slate-200">{unit}</p>
            </div>
            <div className="rounded-lg bg-slate-800/30 px-4 py-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Callsign
              </p>
              <p className="mt-1 text-sm text-slate-200">{callsign}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-500" />
              Notification Preferences
            </span>
          </CardTitle>
          <CardDescription>
            Configure how you receive alerts and reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <NotificationToggle
              label="Currency Expiration Alerts"
              description="Get notified when currencies are about to expire"
              defaultChecked
            />
            <NotificationToggle
              label="Flight Log Reminders"
              description="Receive reminders to log recent flights"
              defaultChecked
            />
            <NotificationToggle
              label="Qualification Updates"
              description="Alerts for qualification status changes"
              defaultChecked={false}
            />
            <NotificationToggle
              label="Weekly Summary Email"
              description="Receive a weekly summary of your flight activity"
              defaultChecked={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              Account
            </span>
          </CardTitle>
          <CardDescription>
            Manage your account settings and security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center justify-between rounded-lg bg-slate-800/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-200">Email Address</p>
                  <p className="text-xs text-slate-500">
                    {user?.email || "Not available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="flex items-center justify-between rounded-lg bg-slate-800/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-200">Password</p>
                  <p className="text-xs text-slate-500">
                    Last changed: Unknown
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Change Password
              </Button>
            </div>

            {/* Sign Out */}
            <div className="pt-4 border-t border-slate-800">
              <Button
                variant="danger"
                size="md"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  defaultChecked = false,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg bg-slate-800/30 px-4 py-3 cursor-pointer">
      <div>
        <p className="text-sm text-slate-200">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <div className="h-6 w-11 rounded-full bg-slate-700 peer-checked:bg-emerald-600 transition-colors" />
        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}
