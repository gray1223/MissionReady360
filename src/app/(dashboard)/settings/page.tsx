import { redirect } from "next/navigation";
import {
  User,
  Bell,
  Shield,
  Mail,
  Lock,
  Plane,
} from "lucide-react";
import type { LogbookMode } from "@/lib/types/database";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { EditProfileModal } from "@/components/settings/edit-profile-modal";
import { SignOutButton } from "@/components/settings/sign-out-button";
import { FlightLogPreferencesCard } from "@/components/settings/flight-log-preferences";
import { RatingTrackingPreferencesCard } from "@/components/settings/rating-tracking-preferences";
import { PriorHoursForm } from "@/components/settings/prior-hours-form";
import { CurrencyPreferencesCard } from "@/components/settings/currency-preferences";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const mode: LogbookMode = (profile?.logbook_mode as LogbookMode) || "military";
  const isMilitary = mode === "military";

  const branch = profile?.branch || "Not set";
  const rank = profile?.rank || "Not set";
  const unit = profile?.unit || "Not set";
  const callsign = profile?.callsign || "Not set";
  const dutyStatus = profile?.duty_status
    ? profile.duty_status.charAt(0).toUpperCase() + profile.duty_status.slice(1)
    : "Not set";

  const firstName = profile?.first_name || "Not set";
  const lastName = profile?.last_name || "Not set";
  const homeAirport = profile?.home_airport || "Not set";
  const certificateType = profile?.certificate_type
    ? profile.certificate_type.charAt(0).toUpperCase() + profile.certificate_type.slice(1)
    : "Not set";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile Section — Mode-dependent */}
      {isMilitary ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Military Profile
                  </span>
                </CardTitle>
                <CardDescription>
                  Your military service profile information
                </CardDescription>
              </div>
              {profile && (
                <EditProfileModal profile={profile} userId={user.id} />
              )}
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
              <div className="rounded-lg bg-slate-800/30 px-4 py-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Duty Status
                </p>
                <p className="mt-1 text-sm text-slate-200">{dutyStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <Plane className="h-5 w-5 text-primary" />
                    Pilot Profile
                  </span>
                </CardTitle>
                <CardDescription>
                  Your civilian pilot profile information
                </CardDescription>
              </div>
              {profile && (
                <EditProfileModal profile={profile} userId={user.id} />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-800/30 px-4 py-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  First Name
                </p>
                <p className="mt-1 text-sm text-slate-200">{firstName}</p>
              </div>
              <div className="rounded-lg bg-slate-800/30 px-4 py-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Last Name
                </p>
                <p className="mt-1 text-sm text-slate-200">{lastName}</p>
              </div>
              <div className="rounded-lg bg-slate-800/30 px-4 py-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Home Airport
                </p>
                <p className="mt-1 text-sm text-slate-200">{homeAirport}</p>
              </div>
              <div className="rounded-lg bg-slate-800/30 px-4 py-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Certificate Type
                </p>
                <p className="mt-1 text-sm text-slate-200">{certificateType}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flight Log Preferences */}
      {profile && (
        <FlightLogPreferencesCard
          preferences={profile.flight_log_preferences || {}}
          userId={user.id}
        />
      )}

      {/* Currency Preferences */}
      {profile && (
        <CurrencyPreferencesCard
          preferences={profile.flight_log_preferences || {}}
          userId={user.id}
        />
      )}

      {/* FAA Rating Progress Preferences */}
      {profile && (
        <RatingTrackingPreferencesCard
          preferences={profile.flight_log_preferences || {}}
          userId={user.id}
        />
      )}

      {/* Prior Flight Hours */}
      {profile && (
        <PriorHoursForm
          preferences={profile.flight_log_preferences || {}}
          userId={user.id}
        />
      )}

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
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
              <Shield className="h-5 w-5 text-primary" />
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
                    {user.email || "Not available"}
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
              <SignOutButton />
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
        <div className="h-6 w-11 rounded-full bg-slate-700 peer-checked:bg-primary transition-colors" />
        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}
