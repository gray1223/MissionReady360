"use client";

import { useState } from "react";
import { SCENARIO_CATEGORIES, type EpSetupData, type ScenarioCategory } from "@/lib/types/ep-practice";

interface EpSetupFormProps {
  defaultCallsign: string;
  onSubmit: (data: EpSetupData) => void;
}

export function EpSetupForm({ defaultCallsign, onSubmit }: EpSetupFormProps) {
  const [callsign, setCallsign] = useState(defaultCallsign);
  const [isSolo, setIsSolo] = useState(false);
  const [abosStatus, setAbosStatus] = useState<"above" | "below">("above");
  const [runway, setRunway] = useState("17L");
  const [weather, setWeather] = useState<"vmc" | "imc">("vmc");
  const [scenarioCategory, setScenarioCategory] =
    useState<ScenarioCategory>("random");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      callsign: callsign.trim() || "Student",
      isSolo,
      abosStatus,
      runway: runway.trim() || "17L",
      weather,
      scenarioCategory,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Callsign */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Callsign
          </label>
          <input
            type="text"
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            placeholder="Viper 01"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        {/* Runway */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Departure Runway
          </label>
          <input
            type="text"
            value={runway}
            onChange={(e) => setRunway(e.target.value)}
            placeholder="17L"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        {/* Solo/Dual */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Configuration
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsSolo(false)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                !isSolo
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              Dual
            </button>
            <button
              type="button"
              onClick={() => setIsSolo(true)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isSolo
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              Solo
            </button>
          </div>
        </div>

        {/* ABOS */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            ABOS Status
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAbosStatus("above")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                abosStatus === "above"
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              Above
            </button>
            <button
              type="button"
              onClick={() => setAbosStatus("below")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                abosStatus === "below"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              Below
            </button>
          </div>
        </div>

        {/* Weather */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Weather
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWeather("vmc")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                weather === "vmc"
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              VMC
            </button>
            <button
              type="button"
              onClick={() => setWeather("imc")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                weather === "imc"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              IMC
            </button>
          </div>
        </div>

        {/* Scenario Category */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Scenario Category
          </label>
          <select
            value={scenarioCategory}
            onChange={(e) =>
              setScenarioCategory(e.target.value as ScenarioCategory)
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            {SCENARIO_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-primary-button px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-button-hover transition-colors"
      >
        Start EP Practice
      </button>
    </form>
  );
}
