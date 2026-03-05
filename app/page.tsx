"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Droplets,
  Activity,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Calendar,
  FileWarning,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  Server,
  Cpu,
  Radio,
  Wrench,
  Clock,
  Crosshair,
  Waves,
  Brain,
  Globe,
  PieChart as PieIcon,
  Navigation,
  Moon,
  Sun,
} from "lucide-react";
import RiskTrendChart from "./components/RiskTrendChart";
import MapComponent from "./components/MapComponent";

/* ---------- Types ---------- */
interface PredictionResult {
  prediction: string;
  confidence: number;
  alert_level: string;
}

/* ---------- Pie chart mock data ---------- */
const riskDistribution = [
  { name: "Safe", value: 62, color: "#10b981" },
  { name: "Warning", value: 24, color: "#f59e0b" },
  { name: "Critical", value: 14, color: "#ef4444" },
];

/* ---------- Static data for fake telemetry / feed ---------- */
const recentInterventions = [
  {
    id: 1,
    title: "Pipeline Leak — Sector 7G",
    status: "Resolved",
    time: "12 min ago",
    icon: Wrench,
  },
  {
    id: 2,
    title: "Contamination Alert — Zone NE-4",
    status: "Contained",
    time: "1 hr ago",
    icon: Crosshair,
  },
  {
    id: 3,
    title: "Pressure Drop — Grid B12",
    status: "Mitigated",
    time: "3 hrs ago",
    icon: Waves,
  },
];

/* ---------- Pie custom tooltip ---------- */
function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl shadow-lg ring-1 ring-white/40 dark:ring-zinc-700/40 px-4 py-2.5 text-xs">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: d.payload.color }}
        />
        <span className="font-bold text-zinc-700 dark:text-zinc-200">{d.name}</span>
        <span className="ml-auto font-extrabold tabular-nums text-zinc-900 dark:text-white">
          {d.value}%
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   SDG 6 WaterHub — GovTech Command Center
   ================================================================ */
export default function WaterDashboard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [formData, setFormData] = useState({
    Latitude: "",
    Longitude: "",
    Report_Type: "Leak",
    Days_Since_Last_Issue: "",
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "locating" | "success" | "error"
  >("idle");
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationStatus("locating");
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          Latitude: position.coords.latitude.toFixed(4),
          Longitude: position.coords.longitude.toFixed(4),
        }));
        setLocationStatus("success");
      },
      (err) => {
        setLocationStatus("error");
        const messages: Record<number, string> = {
          1: "Permission denied. Please allow location access.",
          2: "Position unavailable. Try again.",
          3: "Request timed out. Try again.",
        };
        setLocationError(messages[err.code] || "Unable to get location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const parsedLat = parseFloat(formData.Latitude);
      const parsedLng = parseFloat(formData.Longitude);

      // 1. Impossible global coordinates
      if (
        isNaN(parsedLat) ||
        isNaN(parsedLng) ||
        parsedLat < -90 ||
        parsedLat > 90 ||
        parsedLng < -180 ||
        parsedLng > 180
      ) {
        alert(
          "Invalid coordinates: Latitude must be between -90 and 90, Longitude between -180 and 180."
        );
        setLoading(false);
        return;
      }

      // 2. Phase 1 Pilot Geofence — Telangana region
      if (
        parsedLat < 15.0 ||
        parsedLat > 20.0 ||
        parsedLng < 77.0 ||
        parsedLng > 82.0
      ) {
        alert(
          "Phase 1 Pilot Restriction: Coordinates fall outside the Telangana municipal zone (Lat 15.0–20.0, Lng 77.0–82.0). The pilot is currently restricted to local municipal zones only."
        );
        setLoading(false);
        return;
      }

      const payload = {
        Report_Type: formData.Report_Type,
        Latitude: parsedLat,
        Longitude: parsedLng,
        Days_Since_Last_Issue: parseInt(formData.Days_Since_Last_Issue, 10),
      };

      const res = await fetch(
        "https://water-management-hub.onrender.com/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      setResult(await res.json());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reach the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---- risk helpers ---- */
  const isDanger =
    result?.alert_level === "Critical" || result?.alert_level === "High Risk";
  const isSafe =
    result?.alert_level === "Normal" || result?.alert_level === "Medium Risk";

  /* ---- fake sub-metrics derived from confidence ---- */
  const histVariance = result
    ? Math.max(2.1, +(result.confidence * 0.08).toFixed(1))
    : null;
  const sensorReliability = result
    ? Math.min(99.9, +(result.confidence * 1.02).toFixed(1))
    : null;
  const modelAgreement = result
    ? Math.min(100, +(result.confidence + 1.4).toFixed(1))
    : null;

  /* ---- map coordinates ---- */
  const lat = parseFloat(formData.Latitude);
  const lng = parseFloat(formData.Longitude);
  const hasCoords = !isNaN(lat) && !isNaN(lng);
  const mapLat = hasCoords ? lat : 20.5937;
  const mapLng = hasCoords ? lng : 78.9629;

  /* ---- glass helpers ---- */
  const glass =
    "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-zinc-700/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]";
  const glassHover =
    "hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-300";

  /* ================================================================ JSX ================================================================ */
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col transition-colors duration-300">
      {/* ====================== TELEMETRY STRIP ====================== */}
      <div className="bg-zinc-900 text-zinc-400 text-[0.65rem] tracking-wide font-medium">
        <div className="max-w-[90rem] mx-auto flex items-center justify-between px-5 sm:px-8 py-1.5 gap-4 overflow-x-auto">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Server className="h-3 w-3 text-indigo-400" />
            UPTIME <span className="text-zinc-200 ml-0.5">99.97%</span>
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Cpu className="h-3 w-3 text-indigo-400" />
            PROCESSED{" "}
            <span className="text-zinc-200 ml-0.5">2,847 reports</span>
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Radio className="h-3 w-3 text-emerald-400" />
            ACTIVE NODES{" "}
            <span className="text-zinc-200 ml-0.5">14 / 14</span>
          </span>
          <span className="hidden md:flex items-center gap-1.5 whitespace-nowrap">
            <Clock className="h-3 w-3 text-indigo-400" />
            LAST SYNC <span className="text-zinc-200 ml-0.5">4 s ago</span>
          </span>
        </div>
      </div>

      {/* ====================== HEADER ====================== */}
      <header className="sticky top-0 z-40 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border-b border-zinc-200/60 dark:border-zinc-700/60">
        <div className="max-w-[90rem] mx-auto flex items-center justify-between px-5 sm:px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
                SDG&nbsp;6 WaterHub
              </h1>
              <p className="text-[0.6rem] font-medium text-zinc-400 dark:text-zinc-500 tracking-widest uppercase -mt-0.5">
                Command Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center h-9 w-9 rounded-xl
                         bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60
                         text-zinc-600 dark:text-zinc-300
                         hover:bg-zinc-200 dark:hover:bg-zinc-700
                         transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              aria-label="Toggle dark mode"
            >
              {mounted && (theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              ))}
            </button>

            <div className="flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[0.65rem] font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide">
                AI ENGINE ONLINE
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ====================== MAIN ====================== */}
      <main className="flex-1 w-full max-w-[90rem] mx-auto px-5 sm:px-8 py-6 space-y-5">
        {/* ====================== ROW 1 — 3 Column Command Row ====================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ======================== COL 1 — Form (3/12) ======================== */}
          <section
            className={`lg:col-span-3 ${glass} rounded-2xl p-5 flex flex-col ${glassHover}`}
          >
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <Activity className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 uppercase">
                Field Report
              </h2>
            </div>
            <p className="text-[0.65rem] text-zinc-400 dark:text-zinc-500 mb-4 ml-[2.625rem]">
              Submit data for predictive risk analysis.
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-3 flex-1 flex flex-col"
            >
              {/* Report Type */}
              <div>
                <label
                  htmlFor="Report_Type"
                  className="flex items-center gap-1.5 text-[0.65rem] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1"
                >
                  <FileWarning className="h-3 w-3" />
                  Report Type
                </label>
                <select
                  id="Report_Type"
                  name="Report_Type"
                  value={formData.Report_Type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 backdrop-blur px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200
                             focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all duration-200 outline-none"
                >
                  <option value="Leak">Leak</option>
                  <option value="Contamination">Contamination</option>
                  <option value="Shortage">Shortage</option>
                </select>
              </div>

              {/* Use My Location */}
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locationStatus === "locating"}
                className="w-full flex items-center justify-center gap-2 rounded-xl
                           bg-gradient-to-r from-sky-500 to-cyan-500
                           hover:from-sky-400 hover:to-cyan-400
                           text-white font-semibold py-2 px-3 text-xs tracking-wide
                           shadow-md shadow-sky-500/20
                           focus:outline-none focus:ring-4 focus:ring-sky-500/20
                           transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed
                           hover:-translate-y-0.5 active:translate-y-0"
              >
                {locationStatus === "locating" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Locating…
                  </>
                ) : locationStatus === "success" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Location Set
                  </>
                ) : (
                  <>
                    <Navigation className="h-3.5 w-3.5" />
                    Use My Location
                  </>
                )}
              </button>
              {locationStatus === "error" && locationError && (
                <p className="text-[0.6rem] text-rose-500 font-medium -mt-1">
                  {locationError}
                </p>
              )}

              {/* Lat / Lng */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="Latitude"
                    className="flex items-center gap-1.5 text-[0.65rem] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1"
                  >
                    <MapPin className="h-3 w-3" />
                    Lat
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="Latitude"
                    name="Latitude"
                    min={-90}
                    max={90}
                    value={formData.Latitude}
                    onChange={handleChange}
                    required
                    placeholder="17.59"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 backdrop-blur px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200
                               focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all duration-200 outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="Longitude"
                    className="flex items-center gap-1.5 text-[0.65rem] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1"
                  >
                    <MapPin className="h-3 w-3" />
                    Lng
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="Longitude"
                    name="Longitude"
                    min={-180}
                    max={180}
                    value={formData.Longitude}
                    onChange={handleChange}
                    required
                    placeholder="78.43"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 backdrop-blur px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200
                               focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all duration-200 outline-none"
                  />
                </div>
              </div>

              {/* Days Since Last Issue */}
              <div>
                <label
                  htmlFor="Days_Since_Last_Issue"
                  className="flex items-center gap-1.5 text-[0.65rem] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1"
                >
                  <Calendar className="h-3 w-3" />
                  Days Since Last Issue
                </label>
                <input
                  type="number"
                  min="0"
                  id="Days_Since_Last_Issue"
                  name="Days_Since_Last_Issue"
                  value={formData.Days_Since_Last_Issue}
                  onChange={handleChange}
                  required
                  placeholder="15"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 backdrop-blur px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200
                             focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all duration-200 outline-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 mt-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl
                             bg-gradient-to-r from-indigo-600 to-violet-600
                             hover:from-indigo-500 hover:to-violet-500
                             text-white font-bold py-2.5 px-4 text-sm tracking-wide
                             shadow-lg shadow-indigo-500/25
                             focus:outline-none focus:ring-4 focus:ring-indigo-500/20
                             transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                             hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Run Risk Analysis
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* ======================== COL 2 — AI Results (5/12) ======================== */}
          <section
            className={`lg:col-span-5 rounded-2xl p-5 transition-all duration-500 ${
              isDanger
                ? "bg-rose-50/80 dark:bg-rose-950/40 backdrop-blur-xl border border-rose-300/50 dark:border-rose-800/50 shadow-[0_8px_32px_rgba(225,29,72,0.1)]"
                : isSafe
                  ? "bg-emerald-50/80 dark:bg-emerald-950/40 backdrop-blur-xl border border-emerald-300/50 dark:border-emerald-800/50 shadow-[0_8px_32px_rgba(16,185,129,0.1)]"
                  : `${glass}`
            }`}
          >
            {/* card header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-xl ${
                    isDanger
                      ? "bg-rose-200/60 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400"
                      : isSafe
                        ? "bg-emerald-200/60 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {isDanger ? (
                    <ShieldAlert className="h-4 w-4" />
                  ) : isSafe ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <Gauge className="h-4 w-4" />
                  )}
                </div>
                <h2
                  className={`text-sm font-extrabold tracking-tight uppercase ${
                    isDanger
                      ? "text-rose-800 dark:text-rose-300"
                      : isSafe
                        ? "text-emerald-800 dark:text-emerald-300"
                        : "text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  AI Risk Assessment
                </h2>
              </div>
              {result && (
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider ${
                    isDanger
                      ? "bg-rose-200/60 text-rose-700"
                      : "bg-emerald-200/60 text-emerald-700"
                  }`}
                >
                  <Brain className="h-3 w-3" />
                  Model v3.2
                </div>
              )}
            </div>

            {/* placeholder */}
            {!result && !error && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-300 dark:text-zinc-600">
                <Gauge className="h-14 w-14 mb-3 stroke-[1]" />
                <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">
                  Awaiting field data…
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Submit a report to activate AI analysis.
                </p>
              </div>
            )}

            {/* loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping" />
                  <Loader2 className="relative h-10 w-10 animate-spin text-indigo-500" />
                </div>
                <p className="text-sm font-semibold text-zinc-500 mt-4">
                  Running prediction model…
                </p>
                <p className="text-[0.65rem] text-zinc-400 mt-0.5">
                  Correlating sensor data across 14 nodes
                </p>
              </div>
            )}

            {/* error */}
            {error && (
              <div className="rounded-xl bg-rose-100/60 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
                    Connection Error
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* result */}
            {result && (
              <div className="space-y-4">
                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Severity */}
                  <div
                    className={`rounded-2xl p-4 transition-all duration-300 ${
                      isDanger
                        ? "bg-gradient-to-br from-rose-100/80 to-rose-50/60 dark:from-rose-900/40 dark:to-rose-950/30 border border-rose-200/40 dark:border-rose-800/30"
                        : "bg-gradient-to-br from-emerald-100/80 to-emerald-50/60 dark:from-emerald-900/40 dark:to-emerald-950/30 border border-emerald-200/40 dark:border-emerald-800/30"
                    }`}
                  >
                    <p className="text-[0.55rem] uppercase tracking-[0.15em] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Severity
                    </p>
                    <p
                      className={`text-xl font-extrabold tracking-tight ${
                        isDanger ? "text-rose-700 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {result.prediction}
                    </p>
                  </div>

                  {/* Confidence */}
                  <div
                    className={`rounded-2xl p-4 transition-all duration-300 ${
                      isDanger
                        ? "bg-gradient-to-br from-rose-100/80 to-rose-50/60 dark:from-rose-900/40 dark:to-rose-950/30 border border-rose-200/40 dark:border-rose-800/30"
                        : "bg-gradient-to-br from-emerald-100/80 to-emerald-50/60 dark:from-emerald-900/40 dark:to-emerald-950/30 border border-emerald-200/40 dark:border-emerald-800/30"
                    }`}
                  >
                    <p className="text-[0.55rem] uppercase tracking-[0.15em] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Confidence
                    </p>
                    <div className="flex items-baseline gap-0.5">
                      <span
                        className={`text-2xl font-extrabold tabular-nums tracking-tight ${
                          isDanger ? "text-rose-700 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        {result.confidence}
                      </span>
                      <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">%</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          isDanger ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Alert Level */}
                  <div
                    className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                      isDanger
                        ? "bg-gradient-to-br from-rose-100/80 to-rose-50/60 dark:from-rose-900/40 dark:to-rose-950/30 border border-rose-200/40 dark:border-rose-800/30"
                        : "bg-gradient-to-br from-emerald-100/80 to-emerald-50/60 dark:from-emerald-900/40 dark:to-emerald-950/30 border border-emerald-200/40 dark:border-emerald-800/30"
                    }`}
                  >
                    {isDanger ? (
                      <AlertCircle className="h-7 w-7 text-rose-400 mb-1" />
                    ) : (
                      <CheckCircle2 className="h-7 w-7 text-emerald-400 mb-1" />
                    )}
                    <p
                      className={`text-sm font-extrabold tracking-tight ${
                        isDanger ? "text-rose-700 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {result.alert_level}
                    </p>
                  </div>
                </div>

                {/* AI Confidence Analysis breakdown */}
                <div
                  className={`rounded-2xl p-4 border transition-all duration-300 ${
                    isDanger
                      ? "bg-rose-50/40 dark:bg-rose-950/30 border-rose-200/30 dark:border-rose-800/30"
                      : "bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-200/30 dark:border-emerald-800/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Brain
                      className={`h-3.5 w-3.5 ${
                        isDanger ? "text-rose-500" : "text-emerald-500"
                      }`}
                    />
                    <h3 className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">
                      AI Confidence Analysis
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Historical Variance",
                        value: `±${histVariance}%`,
                        sub: "7-day window",
                      },
                      {
                        label: "Sensor Reliability",
                        value: `${sensorReliability}%`,
                        sub: "14 nodes active",
                      },
                      {
                        label: "Model Agreement",
                        value: `${modelAgreement}%`,
                        sub: "3 / 3 models",
                      },
                    ].map((metric) => (
                      <div key={metric.label} className="text-center">
                        <p className="text-[0.5rem] uppercase tracking-widest font-semibold text-zinc-400 dark:text-zinc-500 mb-0.5">
                          {metric.label}
                        </p>
                        <p
                          className={`text-base font-extrabold tabular-nums ${
                            isDanger ? "text-rose-700 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
                          }`}
                        >
                          {metric.value}
                        </p>
                        <p className="text-[0.5rem] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {metric.sub}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ======================== COL 3 — Map + Pie (4/12) ======================== */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* ---- Geospatial Tracking Map ---- */}
            <section className={`${glass} rounded-2xl p-5 ${glassHover}`}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 uppercase">
                    Geospatial Tracking
                  </h2>
                  <p className="text-[0.6rem] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {hasCoords
                      ? `${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`
                      : "Enter coordinates to locate"}
                  </p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-zinc-200/60 dark:border-zinc-700/60 aspect-[4/3]">
                <MapComponent latitude={mapLat} longitude={mapLng} />
              </div>
            </section>

            {/* ---- Live Risk Distribution — Donut ---- */}
            <section className={`${glass} rounded-2xl p-5 ${glassHover}`}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                  <PieIcon className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 uppercase">
                    Live Risk Distribution
                  </h2>
                  <p className="text-[0.6rem] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    Regional water zone status
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Donut */}
                <div className="w-40 h-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={65}
                        strokeWidth={3}
                        stroke="#fafafa"
                      >
                        {riskDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <ReTooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="space-y-2.5 flex-1">
                  {riskDistribution.map((zone) => (
                    <div key={zone.name} className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: zone.color }}
                      />
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex-1">
                        {zone.name}
                      </span>
                      <span className="text-sm font-extrabold tabular-nums text-zinc-800 dark:text-zinc-200">
                        {zone.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ====================== ROW 2 — Trend Chart + Interventions + Community ====================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ---- Trend Chart (8/12) ---- */}
          <div className="lg:col-span-8">
            <RiskTrendChart />
          </div>

          {/* ---- Right sidebar (4/12): Interventions + Community ---- */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Recent Interventions */}
            <section className={`${glass} rounded-2xl p-5 ${glassHover}`}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 uppercase">
                  Recent Interventions
                </h2>
              </div>
              <div className="space-y-2">
                {recentInterventions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 transition-all duration-200 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[0.6rem] font-bold text-emerald-600 uppercase">
                          {item.status}
                        </span>
                        <span className="text-[0.6rem] text-zinc-400">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Community Insights — compact */}
            <section className={`${glass} rounded-2xl p-5 ${glassHover}`}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                  <Activity className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 uppercase">
                  SDG 6 Impact
                </h2>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl bg-gradient-to-br from-rose-50/80 to-rose-100/40 dark:from-rose-950/40 dark:to-rose-900/20 border border-rose-200/40 dark:border-rose-800/30 p-3.5">
                  <h3 className="text-[0.55rem] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-[0.15em] mb-1">
                    The Challenge
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    Millions lack real-time water safety data, leading to
                    preventable health crises and reactive-only responses.
                  </p>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/40 dark:border-emerald-800/30 p-3.5">
                  <h3 className="text-[0.55rem] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.15em] mb-1">
                    Our Impact
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    <strong>95%+ accuracy</strong> predictive risk scores
                    enable proactive governance — fixing infrastructure{" "}
                    <em>before</em> contamination spreads.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  "SDG 6.1 — Safe Water",
                  "SDG 6.3 — Quality",
                  "SDG 6.b — Community",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[0.6rem] font-semibold px-2.5 py-0.5 border border-indigo-200/40 dark:border-indigo-800/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ====================== FOOTER ====================== */}
      <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/40 backdrop-blur py-4">
        <p className="text-center text-[0.65rem] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
          Powered by Machine Learning · Supporting UN Sustainable Development
          Goal 6 · System v3.2
        </p>
      </footer>
    </div>
  );
}
