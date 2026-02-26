"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BRANCHES, DUTY_STATUSES } from "@/lib/constants/branches";
import { RANKS } from "@/lib/constants/ranks";
import { QUALIFICATION_LEVELS } from "@/lib/constants/mission-symbols";
import type {
  MilitaryBranch,
  QualificationLevel,
  AircraftType,
  LogbookMode,
  CertificateType,
} from "@/lib/types/database";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  Star,
  Plane,
  User,
  Award,
  ClipboardCheck,
  GraduationCap,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AircraftSelection {
  aircraft_type_id: string;
  designation: string;
  name: string;
  qualification_level: QualificationLevel;
  is_primary: boolean;
}

interface OnboardingState {
  // Military - Step 1
  branch: MilitaryBranch | "";
  rank: string;
  duty_status: string;
  unit: string;
  callsign: string;
  // Civilian - Step 1
  first_name: string;
  last_name: string;
  home_airport: string;
  certificate_type: CertificateType | "";
  // Shared - Aircraft
  selectedAircraft: AircraftSelection[];
  // Civilian - Prior Experience
  prior_hours_choice: "none" | "enter_totals" | "log_every" | "start_zero" | "";
  prior_total_time: string;
  prior_pic_time: string;
  prior_xc_time: string;
  prior_night_time: string;
  prior_instrument_actual: string;
  prior_instrument_sim: string;
  prior_solo_time: string;
  prior_dual_received_time: string;
  // FAA Info
  track_faa: boolean;
  faa_certificate_number: string;
  faa_medical_class: string;
  faa_medical_expiry: string;
}

interface StepDef {
  label: string;
  icon: typeof User;
}

const MILITARY_STEPS: StepDef[] = [
  { label: "Service Info", icon: User },
  { label: "Aircraft", icon: Plane },
  { label: "FAA Info", icon: Award },
  { label: "Review", icon: ClipboardCheck },
];

const CIVILIAN_STEPS: StepDef[] = [
  { label: "About You", icon: User },
  { label: "Aircraft", icon: Plane },
  { label: "Prior Experience", icon: Clock },
  { label: "FAA Info", icon: GraduationCap },
  { label: "Review", icon: ClipboardCheck },
];

const CERTIFICATE_TYPES = [
  { value: "none", label: "None" },
  { value: "student", label: "Student Pilot" },
  { value: "sport", label: "Sport Pilot" },
  { value: "recreational", label: "Recreational Pilot" },
  { value: "private", label: "Private Pilot" },
  { value: "commercial", label: "Commercial Pilot" },
  { value: "atp", label: "Airline Transport Pilot" },
];

const initialState: OnboardingState = {
  branch: "",
  rank: "",
  duty_status: "",
  unit: "",
  callsign: "",
  first_name: "",
  last_name: "",
  home_airport: "",
  certificate_type: "",
  selectedAircraft: [],
  prior_hours_choice: "",
  prior_total_time: "",
  prior_pic_time: "",
  prior_xc_time: "",
  prior_night_time: "",
  prior_instrument_actual: "",
  prior_instrument_sim: "",
  prior_solo_time: "",
  prior_dual_received_time: "",
  track_faa: false,
  faa_certificate_number: "",
  faa_medical_class: "",
  faa_medical_expiry: "",
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-[320px] flex items-center justify-center text-text-muted">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode: LogbookMode =
    (searchParams.get("mode") as LogbookMode) || "military";
  const isMilitary = mode === "military";

  const STEPS = isMilitary ? MILITARY_STEPS : CIVILIAN_STEPS;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Aircraft state
  const [aircraftTypes, setAircraftTypes] = useState<AircraftType[]>([]);
  const [aircraftSearch, setAircraftSearch] = useState("");
  const [loadingAircraft, setLoadingAircraft] = useState(false);

  // Fetch aircraft when branch changes (military) or on mount (civilian)
  useEffect(() => {
    if (isMilitary && !form.branch) {
      setAircraftTypes([]);
      return;
    }

    let cancelled = false;
    async function fetchAircraft() {
      setLoadingAircraft(true);
      const supabase = createClient();
      let query = supabase
        .from("aircraft_types")
        .select("*")
        .order("designation");

      if (isMilitary) {
        query = query.eq("branch", form.branch);
      } else {
        query = query.eq("is_military", false);
      }

      const { data } = await query;

      if (!cancelled && data) {
        setAircraftTypes(data as AircraftType[]);
      }
      setLoadingAircraft(false);
    }

    fetchAircraft();
    return () => {
      cancelled = true;
    };
  }, [form.branch, isMilitary]);

  // ------- Field updater -------
  function updateField<K extends keyof OnboardingState>(
    key: K,
    value: OnboardingState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  // ------- Determine which logical step we're on -------
  // Military: 0=Service, 1=Aircraft, 2=FAA, 3=Review
  // Civilian: 0=About You, 1=Aircraft, 2=Prior Exp, 3=FAA, 4=Review

  function getAircraftStepIndex() {
    return 1;
  }
  function getFaaStepIndex() {
    return isMilitary ? 2 : 3;
  }
  function getReviewStepIndex() {
    return STEPS.length - 1;
  }

  // ------- Validation per step -------
  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};

    if (s === 0) {
      if (isMilitary) {
        if (!form.branch) errs.branch = "Branch is required";
        if (!form.rank) errs.rank = "Rank is required";
        if (!form.duty_status) errs.duty_status = "Duty status is required";
        if (!form.unit.trim()) errs.unit = "Unit is required";
      } else {
        if (!form.first_name.trim()) errs.first_name = "First name is required";
        if (!form.last_name.trim()) errs.last_name = "Last name is required";
      }
    }

    if (s === getAircraftStepIndex()) {
      if (form.selectedAircraft.length === 0) {
        errs.aircraft = "Select at least one aircraft";
      } else {
        const hasPrimary = form.selectedAircraft.some((a) => a.is_primary);
        if (!hasPrimary) errs.aircraft = "Mark one aircraft as primary";
      }
    }

    if (isMilitary && s === getFaaStepIndex() && form.track_faa) {
      if (!form.faa_certificate_number.trim())
        errs.faa_certificate_number = "Certificate number is required";
      if (!form.faa_medical_class)
        errs.faa_medical_class = "Medical class is required";
      if (!form.faa_medical_expiry)
        errs.faa_medical_expiry = "Medical expiry date is required";
    }

    // Civilian prior experience step — no required fields

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  }

  function handleBack() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  // ------- Aircraft helpers -------
  function toggleAircraft(aircraft: AircraftType) {
    setForm((prev) => {
      const exists = prev.selectedAircraft.find(
        (a) => a.aircraft_type_id === aircraft.id
      );
      if (exists) {
        return {
          ...prev,
          selectedAircraft: prev.selectedAircraft.filter(
            (a) => a.aircraft_type_id !== aircraft.id
          ),
        };
      }
      const isFirst = prev.selectedAircraft.length === 0;
      return {
        ...prev,
        selectedAircraft: [
          ...prev.selectedAircraft,
          {
            aircraft_type_id: aircraft.id,
            designation: aircraft.designation,
            name: aircraft.name,
            qualification_level: "basic",
            is_primary: isFirst,
          },
        ],
      };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.aircraft;
      return next;
    });
  }

  function setPrimaryAircraft(aircraftTypeId: string) {
    setForm((prev) => ({
      ...prev,
      selectedAircraft: prev.selectedAircraft.map((a) => ({
        ...a,
        is_primary: a.aircraft_type_id === aircraftTypeId,
      })),
    }));
  }

  function setAircraftQual(
    aircraftTypeId: string,
    level: QualificationLevel
  ) {
    setForm((prev) => ({
      ...prev,
      selectedAircraft: prev.selectedAircraft.map((a) =>
        a.aircraft_type_id === aircraftTypeId
          ? { ...a, qualification_level: level }
          : a
      ),
    }));
  }

  const filteredAircraft = aircraftTypes.filter(
    (a) =>
      a.designation.toLowerCase().includes(aircraftSearch.toLowerCase()) ||
      a.name.toLowerCase().includes(aircraftSearch.toLowerCase())
  );

  // ------- Submit -------
  async function handleSubmitOnboarding() {
    if (!validateStep(step)) return;

    setSubmitting(true);
    setSubmitError(null);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitError("Not authenticated. Please sign in again.");
      setSubmitting(false);
      return;
    }

    const primaryAircraft = form.selectedAircraft.find((a) => a.is_primary);

    // Build profile payload
    const profilePayload: Record<string, unknown> = {
      id: user.id,
      logbook_mode: mode,
      primary_aircraft_id: primaryAircraft?.aircraft_type_id ?? null,
    };

    if (isMilitary) {
      profilePayload.branch = form.branch || null;
      profilePayload.rank = form.rank || null;
      profilePayload.duty_status = form.duty_status || null;
      profilePayload.unit = form.unit.trim() || null;
      profilePayload.callsign = form.callsign.trim() || null;
      profilePayload.faa_certificate_number = form.track_faa
        ? form.faa_certificate_number.trim() || null
        : null;
      profilePayload.faa_medical_class = form.track_faa
        ? form.faa_medical_class || null
        : null;
      profilePayload.faa_medical_expiry = form.track_faa
        ? form.faa_medical_expiry || null
        : null;
    } else {
      profilePayload.first_name = form.first_name.trim() || null;
      profilePayload.last_name = form.last_name.trim() || null;
      profilePayload.home_airport = form.home_airport.trim().toUpperCase() || null;
      profilePayload.certificate_type = form.certificate_type || null;
      profilePayload.faa_certificate_number =
        form.faa_certificate_number.trim() || null;
      profilePayload.faa_medical_class = form.faa_medical_class || null;
      profilePayload.faa_medical_expiry = form.faa_medical_expiry || null;

      // Build flight_log_preferences for civilian
      const priorHours: Record<string, number> = {};
      if (form.prior_hours_choice === "enter_totals") {
        if (form.prior_total_time) priorHours.total_time = Number(form.prior_total_time) || 0;
        if (form.prior_pic_time) priorHours.pic_time = Number(form.prior_pic_time) || 0;
        if (form.prior_xc_time) priorHours.xc_time = Number(form.prior_xc_time) || 0;
        if (form.prior_night_time) priorHours.night_time = Number(form.prior_night_time) || 0;
        if (form.prior_instrument_actual)
          priorHours.instrument_actual = Number(form.prior_instrument_actual) || 0;
        if (form.prior_instrument_sim)
          priorHours.instrument_sim = Number(form.prior_instrument_sim) || 0;
        if (form.prior_solo_time) priorHours.solo_time = Number(form.prior_solo_time) || 0;
        if (form.prior_dual_received_time)
          priorHours.dual_received_time = Number(form.prior_dual_received_time) || 0;
      }

      profilePayload.flight_log_preferences = {
        showRatingProgress: true,
        showFaaCurrencies: true,
        priorHours: Object.keys(priorHours).length > 0 ? priorHours : undefined,
      };
    }

    // Insert profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profilePayload);

    if (profileError) {
      setSubmitError(profileError.message);
      setSubmitting(false);
      return;
    }

    // Insert user_aircraft records
    if (form.selectedAircraft.length > 0) {
      const aircraftRows = form.selectedAircraft.map((a) => ({
        user_id: user.id,
        aircraft_type_id: a.aircraft_type_id,
        qualification_level: a.qualification_level,
        is_primary: a.is_primary,
      }));

      const { error: aircraftError } = await supabase
        .from("user_aircraft")
        .insert(aircraftRows);

      if (aircraftError) {
        setSubmitError(aircraftError.message);
        setSubmitting(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  // ------- Rank options -------
  const rankOptions = form.branch
    ? RANKS[form.branch as MilitaryBranch] ?? []
    : [];

  // ------- Determine if certificate is "rated" (has prior experience) -------
  const isRatedCertificate =
    form.certificate_type === "private" ||
    form.certificate_type === "commercial" ||
    form.certificate_type === "atp";

  // ------- Render -------
  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isCompleted = i < step;
            return (
              <div key={s.label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-medium",
                      isCompleted &&
                        "border-primary-button bg-primary-button text-white",
                      isActive &&
                        "border-primary bg-primary/20 text-primary",
                      !isActive &&
                        !isCompleted &&
                        "border-slate-700 bg-transparent text-text-muted"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs whitespace-nowrap",
                      isActive
                        ? "font-medium text-primary"
                        : "text-text-muted"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mb-5 mx-2 h-0.5 flex-1",
                      i < step ? "bg-primary" : "bg-slate-700"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {submitError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {submitError}
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[320px]">
        {/* =================== MILITARY STEP 0: Service Info =================== */}
        {isMilitary && step === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-100">
              Service Information
            </h3>
            <p className="text-sm text-text-secondary">
              Tell us about your military service.
            </p>

            <Select
              id="branch"
              label="Branch"
              placeholder="Select your branch"
              options={BRANCHES}
              value={form.branch}
              error={errors.branch}
              onChange={(e) => {
                updateField("branch", e.target.value as MilitaryBranch | "");
                updateField("rank", "");
                updateField("selectedAircraft", []);
              }}
            />

            <Select
              id="rank"
              label="Rank"
              placeholder={
                form.branch ? "Select your rank" : "Select a branch first"
              }
              options={rankOptions}
              value={form.rank}
              error={errors.rank}
              disabled={!form.branch}
              onChange={(e) => updateField("rank", e.target.value)}
            />

            <Select
              id="duty_status"
              label="Duty Status"
              placeholder="Select your duty status"
              options={DUTY_STATUSES}
              value={form.duty_status}
              error={errors.duty_status}
              onChange={(e) => updateField("duty_status", e.target.value)}
            />

            <Input
              id="unit"
              label="Unit"
              placeholder="e.g. 1st Fighter Wing"
              value={form.unit}
              error={errors.unit}
              onChange={(e) => updateField("unit", e.target.value)}
            />

            <Input
              id="callsign"
              label="Callsign"
              placeholder="Optional"
              hint="Your pilot callsign, if you have one"
              value={form.callsign}
              onChange={(e) => updateField("callsign", e.target.value)}
            />
          </div>
        )}

        {/* =================== CIVILIAN STEP 0: About You =================== */}
        {!isMilitary && step === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-100">
              About You
            </h3>
            <p className="text-sm text-text-secondary">
              Tell us a bit about yourself.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="first_name"
                label="First Name"
                placeholder="John"
                value={form.first_name}
                error={errors.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
              />
              <Input
                id="last_name"
                label="Last Name"
                placeholder="Doe"
                value={form.last_name}
                error={errors.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
              />
            </div>

            <Input
              id="home_airport"
              label="Home Airport"
              placeholder="ICAO code (e.g., KJFK)"
              hint="Optional — your primary airport"
              value={form.home_airport}
              onChange={(e) => updateField("home_airport", e.target.value)}
            />

            <Select
              id="certificate_type"
              label="Certificate Type"
              placeholder="Select your certificate"
              options={CERTIFICATE_TYPES}
              value={form.certificate_type}
              onChange={(e) =>
                updateField("certificate_type", e.target.value as CertificateType | "")
              }
            />
          </div>
        )}

        {/* =================== SHARED: Aircraft (step 1) =================== */}
        {step === getAircraftStepIndex() && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-100">
              Your Aircraft
            </h3>
            <p className="text-sm text-text-secondary">
              Select the aircraft you fly and{" "}
              {isMilitary
                ? "set your qualification level for each."
                : "mark one as your primary aircraft."}
            </p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search aircraft..."
                value={aircraftSearch}
                onChange={(e) => setAircraftSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {errors.aircraft && (
              <p className="text-sm text-red-400">{errors.aircraft}</p>
            )}

            {/* Aircraft list */}
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-700/50 bg-bg-base/50 p-2">
              {loadingAircraft ? (
                <p className="py-4 text-center text-sm text-text-muted">
                  Loading aircraft...
                </p>
              ) : filteredAircraft.length === 0 ? (
                <p className="py-4 text-center text-sm text-text-muted">
                  {isMilitary && !form.branch
                    ? "Select a branch first"
                    : "No aircraft found"}
                </p>
              ) : (
                filteredAircraft.map((aircraft) => {
                  const isSelected = form.selectedAircraft.some(
                    (a) => a.aircraft_type_id === aircraft.id
                  );
                  return (
                    <button
                      key={aircraft.id}
                      type="button"
                      onClick={() => toggleAircraft(aircraft)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm",
                        isSelected
                          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                          : "text-text-secondary hover:bg-slate-800"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-slate-600"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="font-medium">
                        {aircraft.designation}
                      </span>
                      <span className="text-text-muted">{aircraft.name}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Selected aircraft config */}
            {form.selectedAircraft.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-text-secondary">
                  Configure selected aircraft
                </h4>
                {form.selectedAircraft.map((sa) => (
                  <div
                    key={sa.aircraft_type_id}
                    className="flex flex-col gap-2 rounded-lg border border-slate-700/50 bg-bg-base/50 p-3 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex flex-1 items-center gap-2">
                      <button
                        type="button"
                        title={
                          sa.is_primary
                            ? "Primary aircraft"
                            : "Set as primary"
                        }
                        onClick={() => setPrimaryAircraft(sa.aircraft_type_id)}
                        className={cn(
                          "shrink-0",
                          sa.is_primary
                            ? "text-amber-400"
                            : "text-slate-600 hover:text-slate-400"
                        )}
                      >
                        <Star
                          className="h-4 w-4"
                          fill={sa.is_primary ? "currentColor" : "none"}
                        />
                      </button>
                      <span className="text-sm font-medium text-slate-200">
                        {sa.designation}
                      </span>
                      <span className="text-xs text-text-muted">
                        {sa.name}
                      </span>
                    </div>
                    {isMilitary && (
                      <select
                        value={sa.qualification_level}
                        onChange={(e) =>
                          setAircraftQual(
                            sa.aircraft_type_id,
                            e.target.value as QualificationLevel
                          )
                        }
                        className="rounded-md border border-slate-700 bg-slate-800/50 px-2 py-1.5 text-xs text-slate-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {QUALIFICATION_LEVELS.map((q) => (
                          <option key={q.value} value={q.value}>
                            {q.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
                <p className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Star className="h-3 w-3 text-amber-400" fill="currentColor" />
                  = Primary aircraft
                </p>
              </div>
            )}
          </div>
        )}

        {/* =================== CIVILIAN STEP 2: Prior Experience =================== */}
        {!isMilitary && step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-100">
              Prior Experience
            </h3>
            <p className="text-sm text-text-secondary">
              {isRatedCertificate
                ? "How would you like to start your logbook?"
                : "Do you have any prior flight hours?"}
            </p>

            {isRatedCertificate ? (
              <div className="space-y-2">
                {[
                  { value: "enter_totals", label: "Enter my totals & resume logging from here" },
                  { value: "log_every", label: "I want to log every flight from the beginning" },
                  { value: "start_zero", label: "Start at zero" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("prior_hours_choice", option.value as OnboardingState["prior_hours_choice"])}
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                      form.prior_hours_choice === option.value
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-slate-700 text-slate-300 hover:border-slate-600"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  { value: "enter_totals", label: "Yes, I have prior hours" },
                  { value: "start_zero", label: "No, starting fresh" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("prior_hours_choice", option.value as OnboardingState["prior_hours_choice"])}
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                      form.prior_hours_choice === option.value
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-slate-700 text-slate-300 hover:border-slate-600"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {form.prior_hours_choice === "enter_totals" && (
              <div className="space-y-4 pt-2">
                <p className="text-sm text-text-secondary">
                  Enter your prior flight time totals. These will be added to your
                  logged flights for rating progress tracking.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="prior_total_time"
                    label="Total Time"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={form.prior_total_time}
                    onChange={(e) => updateField("prior_total_time", e.target.value)}
                  />
                  <Input
                    id="prior_pic_time"
                    label="PIC Time"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={form.prior_pic_time}
                    onChange={(e) => updateField("prior_pic_time", e.target.value)}
                  />
                  <Input
                    id="prior_xc_time"
                    label="Cross-Country"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={form.prior_xc_time}
                    onChange={(e) => updateField("prior_xc_time", e.target.value)}
                  />
                  <Input
                    id="prior_night_time"
                    label="Night Time"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={form.prior_night_time}
                    onChange={(e) => updateField("prior_night_time", e.target.value)}
                  />
                  <Input
                    id="prior_instrument_actual"
                    label="Instrument (Actual)"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={form.prior_instrument_actual}
                    onChange={(e) =>
                      updateField("prior_instrument_actual", e.target.value)
                    }
                  />
                  <Input
                    id="prior_instrument_sim"
                    label="Instrument (Sim)"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={form.prior_instrument_sim}
                    onChange={(e) =>
                      updateField("prior_instrument_sim", e.target.value)
                    }
                  />
                  <Input
                    id="prior_solo_time"
                    label="Solo Time"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={form.prior_solo_time}
                    onChange={(e) => updateField("prior_solo_time", e.target.value)}
                  />
                  <Input
                    id="prior_dual_received_time"
                    label="Dual Received"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={form.prior_dual_received_time}
                    onChange={(e) =>
                      updateField("prior_dual_received_time", e.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================== FAA Info (military step 2 / civilian step 3) =================== */}
        {step === getFaaStepIndex() && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-100">
              FAA Information
            </h3>
            <p className="text-sm text-text-secondary">
              {isMilitary
                ? "Optionally track your FAA certificates and medical currency."
                : "Enter your FAA certificate and medical information."}
            </p>

            {isMilitary && (
              <label className="flex cursor-pointer items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.track_faa}
                  onClick={() => updateField("track_faa", !form.track_faa)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent",
                    form.track_faa ? "bg-primary" : "bg-slate-700"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 rounded-full bg-white shadow-sm",
                      form.track_faa ? "translate-x-5" : "translate-x-1"
                    )}
                  />
                </button>
                <span className="text-sm font-medium text-slate-200">
                  Track FAA currencies
                </span>
              </label>
            )}

            {(form.track_faa || !isMilitary) && (
              <div className="space-y-4 pt-2">
                <Input
                  id="faa_certificate_number"
                  label="FAA Certificate Number"
                  placeholder="e.g. 1234567"
                  hint="Optional"
                  value={form.faa_certificate_number}
                  error={errors.faa_certificate_number}
                  onChange={(e) =>
                    updateField("faa_certificate_number", e.target.value)
                  }
                />

                <Select
                  id="faa_medical_class"
                  label="Medical Class"
                  placeholder="Select medical class"
                  options={[
                    { value: "first", label: "First Class" },
                    { value: "second", label: "Second Class" },
                    { value: "third", label: "Third Class" },
                    { value: "basicmed", label: "BasicMed" },
                  ]}
                  value={form.faa_medical_class}
                  error={errors.faa_medical_class}
                  onChange={(e) =>
                    updateField("faa_medical_class", e.target.value)
                  }
                />

                <Input
                  id="faa_medical_expiry"
                  type="date"
                  label="Medical Expiry Date"
                  value={form.faa_medical_expiry}
                  error={errors.faa_medical_expiry}
                  onChange={(e) =>
                    updateField("faa_medical_expiry", e.target.value)
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* =================== Review (last step for both modes) =================== */}
        {step === getReviewStepIndex() && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-slate-100">
              Review &amp; Complete
            </h3>
            <p className="text-sm text-text-secondary">
              Confirm your details before completing setup.
            </p>

            {/* Military: Service Info Summary */}
            {isMilitary && (
              <div className="space-y-2 rounded-lg border border-slate-700/50 bg-bg-base/50 p-4">
                <h4 className="text-sm font-medium text-primary">
                  Service Info
                </h4>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <dt className="text-text-muted">Branch</dt>
                  <dd className="text-slate-200">
                    {BRANCHES.find((b) => b.value === form.branch)?.label ?? "-"}
                  </dd>
                  <dt className="text-text-muted">Rank</dt>
                  <dd className="text-slate-200">{form.rank || "-"}</dd>
                  <dt className="text-text-muted">Duty Status</dt>
                  <dd className="text-slate-200">
                    {DUTY_STATUSES.find((d) => d.value === form.duty_status)
                      ?.label ?? "-"}
                  </dd>
                  <dt className="text-text-muted">Unit</dt>
                  <dd className="text-slate-200">{form.unit || "-"}</dd>
                  {form.callsign && (
                    <>
                      <dt className="text-text-muted">Callsign</dt>
                      <dd className="text-slate-200">{form.callsign}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}

            {/* Civilian: About You Summary */}
            {!isMilitary && (
              <div className="space-y-2 rounded-lg border border-slate-700/50 bg-bg-base/50 p-4">
                <h4 className="text-sm font-medium text-primary">
                  About You
                </h4>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <dt className="text-text-muted">Name</dt>
                  <dd className="text-slate-200">
                    {form.first_name} {form.last_name}
                  </dd>
                  {form.home_airport && (
                    <>
                      <dt className="text-text-muted">Home Airport</dt>
                      <dd className="text-slate-200">{form.home_airport.toUpperCase()}</dd>
                    </>
                  )}
                  <dt className="text-text-muted">Certificate</dt>
                  <dd className="text-slate-200">
                    {CERTIFICATE_TYPES.find(
                      (c) => c.value === form.certificate_type
                    )?.label ?? "Not set"}
                  </dd>
                </dl>
              </div>
            )}

            {/* Aircraft Summary */}
            <div className="space-y-2 rounded-lg border border-slate-700/50 bg-bg-base/50 p-4">
              <h4 className="text-sm font-medium text-primary">
                Aircraft
              </h4>
              {form.selectedAircraft.length === 0 ? (
                <p className="text-sm text-text-muted">None selected</p>
              ) : (
                <ul className="space-y-1">
                  {form.selectedAircraft.map((a) => (
                    <li
                      key={a.aircraft_type_id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {a.is_primary && (
                        <Star
                          className="h-3.5 w-3.5 text-amber-400"
                          fill="currentColor"
                        />
                      )}
                      <span className="font-medium text-slate-200">
                        {a.designation}
                      </span>
                      {isMilitary && (
                        <>
                          <span className="text-text-muted">-</span>
                          <span className="text-text-secondary">
                            {QUALIFICATION_LEVELS.find(
                              (q) => q.value === a.qualification_level
                            )?.label ?? a.qualification_level}
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* FAA Summary */}
            <div className="space-y-2 rounded-lg border border-slate-700/50 bg-bg-base/50 p-4">
              <h4 className="text-sm font-medium text-primary">
                FAA Info
              </h4>
              {(form.track_faa || !isMilitary) &&
              (form.faa_certificate_number || form.faa_medical_class) ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {form.faa_certificate_number && (
                    <>
                      <dt className="text-text-muted">Certificate #</dt>
                      <dd className="text-slate-200">
                        {form.faa_certificate_number}
                      </dd>
                    </>
                  )}
                  {form.faa_medical_class && (
                    <>
                      <dt className="text-text-muted">Medical Class</dt>
                      <dd className="text-slate-200 capitalize">
                        {form.faa_medical_class}
                      </dd>
                    </>
                  )}
                  {form.faa_medical_expiry && (
                    <>
                      <dt className="text-text-muted">Medical Expiry</dt>
                      <dd className="text-slate-200">
                        {form.faa_medical_expiry}
                      </dd>
                    </>
                  )}
                </dl>
              ) : (
                <p className="text-sm text-text-muted">
                  {isMilitary
                    ? "Not tracking FAA currencies"
                    : "No FAA info provided"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-border-default pt-4">
        {step > 0 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={submitting}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={handleNext}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmitOnboarding}
            loading={submitting}
            size="lg"
          >
            <Check className="h-4 w-4" />
            Complete Setup
          </Button>
        )}
      </div>
    </div>
  );
}
