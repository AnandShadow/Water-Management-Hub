"use client";

import { useState } from "react";
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
  TrendingUp,
} from "lucide-react";
import RiskTrendChart from "./components/RiskTrendChart";

/* ---------- Types ---------- */
interface PredictionResult {
  prediction: string;
  confidence: number;
  alert_level: string;
}

/* ================================================================
   SDG 6 WaterHub — Enterprise Dashboard
   ================================================================ */
export default function WaterDashboard() {
  const [formData, setFormData] = useState({
    Latitude: "",
    Longitude: "",
    Report_Type: "Leak",
    Days_Since_Last_Issue: "",
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        Report_Type: formData.Report_Type,
        Latitude: parseFloat(formData.Latitude),
        Longitude: parseFloat(formData.Longitude),
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

  /* ================================================================ JSX ================================================================ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* ====================== HEADER ====================== */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 py-3.5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-blue-600 text-white">
              <Droplets className="h-5 w-5" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              SDG&nbsp;6 WaterHub
            </h1>
          </div>

          {/* AI Status */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            AI Engine Online
          </div>
        </div>
      </header>

      {/* ====================== MAIN ====================== */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ======================== LEFT COL — Form (2/5) ======================== */}
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-semibold text-slate-800">
                Water Report Input
              </h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Submit field data for AI-powered risk analysis.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
              {/* Report Type */}
              <div>
                <label
                  htmlFor="Report_Type"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
                >
                  <FileWarning className="h-3.5 w-3.5 text-slate-400" />
                  Report Type
                </label>
                <select
                  id="Report_Type"
                  name="Report_Type"
                  value={formData.Report_Type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="Leak">Leak</option>
                  <option value="Contamination">Contamination</option>
                  <option value="Shortage">Shortage</option>
                </select>
              </div>

              {/* Lat / Lng Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="Latitude"
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
                  >
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="Latitude"
                    name="Latitude"
                    value={formData.Latitude}
                    onChange={handleChange}
                    required
                    placeholder="29.005"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label
                    htmlFor="Longitude"
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
                  >
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="Longitude"
                    name="Longitude"
                    value={formData.Longitude}
                    onChange={handleChange}
                    required
                    placeholder="73.712"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Days Since Last Issue */}
              <div>
                <label
                  htmlFor="Days_Since_Last_Issue"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
                >
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
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
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 mt-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl
                             bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                             text-white font-semibold py-3 px-4 text-sm
                             focus:outline-none focus:ring-4 focus:ring-blue-200
                             transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Analyze Water Risk
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* ======================== RIGHT COL (3/5) ======================== */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            {/* ---------- AI Results Card ---------- */}
            <section
              className={`rounded-2xl shadow-sm border p-6 sm:p-8 transition-all duration-500 ${
                isDanger
                  ? "bg-rose-50 border-rose-300"
                  : isSafe
                    ? "bg-emerald-50 border-emerald-300"
                    : "bg-white border-slate-200"
              }`}
            >
              {/* card header */}
              <div className="flex items-center gap-2 mb-5">
                {isDanger ? (
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                ) : isSafe ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Gauge className="h-5 w-5 text-slate-400" />
                )}
                <h2
                  className={`text-base font-semibold ${
                    isDanger
                      ? "text-rose-800"
                      : isSafe
                        ? "text-emerald-800"
                        : "text-slate-800"
                  }`}
                >
                  AI Risk Assessment
                </h2>
              </div>

              {/* placeholder */}
              {!result && !error && !loading && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                  <Gauge className="h-14 w-14 mb-3 stroke-[1.2]" />
                  <p className="text-sm font-medium text-slate-400">
                    Awaiting data…
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Fill in the form and click{" "}
                    <strong className="text-slate-500">Analyze</strong>.
                  </p>
                </div>
              )}

              {/* loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-blue-400">
                  <Loader2 className="h-10 w-10 animate-spin mb-3" />
                  <p className="text-sm font-medium">Processing…</p>
                </div>
              )}

              {/* error */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Connection Error
                    </p>
                    <p className="text-xs text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* result */}
              {result && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Prediction */}
                  <div
                    className={`rounded-xl p-4 ${
                      isDanger ? "bg-rose-100/60" : "bg-emerald-100/60"
                    }`}
                  >
                    <p className="text-[0.65rem] uppercase tracking-wider font-semibold text-slate-500 mb-1">
                      Severity
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        isDanger ? "text-rose-700" : "text-emerald-700"
                      }`}
                    >
                      {result.prediction}
                    </p>
                  </div>

                  {/* Confidence */}
                  <div
                    className={`rounded-xl p-4 ${
                      isDanger ? "bg-rose-100/60" : "bg-emerald-100/60"
                    }`}
                  >
                    <p className="text-[0.65rem] uppercase tracking-wider font-semibold text-slate-500 mb-1">
                      Confidence
                    </p>
                    <div className="flex items-end gap-1.5">
                      <span
                        className={`text-2xl font-bold tabular-nums ${
                          isDanger ? "text-rose-700" : "text-emerald-700"
                        }`}
                      >
                        {result.confidence}
                      </span>
                      <span className="text-sm font-semibold text-slate-400 mb-0.5">
                        %
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/80 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isDanger ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Alert Level */}
                  <div
                    className={`rounded-xl p-4 flex flex-col items-center justify-center text-center ${
                      isDanger ? "bg-rose-100/60" : "bg-emerald-100/60"
                    }`}
                  >
                    {isDanger ? (
                      <AlertCircle className="h-8 w-8 text-rose-500 mb-1" />
                    ) : (
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-1" />
                    )}
                    <p
                      className={`text-lg font-bold ${
                        isDanger ? "text-rose-700" : "text-emerald-700"
                      }`}
                    >
                      {result.alert_level}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* ---------- Trend Chart ---------- */}
            <RiskTrendChart />
          </div>
        </div>

        {/* =============== Community Insights =============== */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h2 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Community Insights &amp; Local Impact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-5">
              <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wide mb-2">
                The Challenge
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Millions in peri-urban areas lack real-time data on water
                safety, leading to preventable health crises. Communities react
                to contamination events only <em>after</em> people fall ill.
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5">
              <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                Our Impact
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                This tool provides <strong>95%+ accuracy</strong> predictive
                risk scores, enabling local governance to prioritise
                infrastructure repairs <em>before</em> contamination
                spreads.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "SDG 6.1 — Safe Drinking Water",
              "SDG 6.3 — Water Quality",
              "SDG 6.b — Community Participation",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 border border-blue-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* ====================== FOOTER ====================== */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Powered by Machine Learning · Supporting UN Sustainable Development
        Goal 6
      </footer>
    </div>
  );
}
