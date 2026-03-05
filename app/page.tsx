"use client";

import { useState } from "react";

/* ---------- Types ---------- */
interface PredictionResult {
  prediction: string;
  confidence: number;
  alert_level: string;
}

/* ================================================================
   SDG 6 — Smart Water Quality Dashboard
   ================================================================ */
export default function WaterDashboard() {
  /* ---- form state ---- */
  const [formData, setFormData] = useState({
    Latitude: "",
    Longitude: "",
    Report_Type: "Contamination",
    Days_Since_Last_Issue: "",
  });

  /* ---- API result state ---- */
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---- handlers ---- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        Latitude: parseFloat(formData.Latitude),
        Longitude: parseFloat(formData.Longitude),
        Report_Type: formData.Report_Type,
        Days_Since_Last_Issue: parseInt(formData.Days_Since_Last_Issue, 10),
      };

      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const data: PredictionResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the backend. Is the API running on port 8000?"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---- dynamic border/text colour for result card ---- */
  const isCritical = result?.alert_level === "Critical";
  const isHigh = result?.alert_level === "High Risk";
  const isNormal = result?.alert_level === "Normal";
  const borderColor = result
    ? isCritical
      ? "border-red-600 bg-red-600 animate-pulse"
      : isHigh
        ? "border-red-500"
        : isNormal
          ? "border-green-500"
          : "border-yellow-500"
    : "border-gray-200";

  /* ================================================================
     JSX
     ================================================================ */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* -------- Top Navigation Bar -------- */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💧</span>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              SDG 6 Water Management Hub
            </h1>
          </div>
          <span className="hidden sm:inline text-xs text-gray-400">
            Predictive Water Risk&nbsp;API&nbsp;v1
          </span>
        </div>
      </header>

      {/* -------- Main Content -------- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ======================== LEFT — Input Form ======================== */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Submit Water Metrics
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter location &amp; report data to analyse risk.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ---- Latitude ---- */}
              <div>
                <label
                  htmlFor="Latitude"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                  placeholder="e.g. 29.005"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* ---- Longitude ---- */}
              <div>
                <label
                  htmlFor="Longitude"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                  placeholder="e.g. 73.712"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* ---- Report Type (select) ---- */}
              <div>
                <label
                  htmlFor="Report_Type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Report Type
                </label>
                <select
                  id="Report_Type"
                  name="Report_Type"
                  value={formData.Report_Type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="Contamination">Contamination</option>
                  <option value="Leak">Leak</option>
                  <option value="Shortage">Shortage</option>
                </select>
              </div>

              {/* ---- Days Since Last Issue ---- */}
              <div>
                <label
                  htmlFor="Days_Since_Last_Issue"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                  placeholder="e.g. 15"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* ---- Submit ---- */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg
                           bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                           text-white font-semibold py-3 px-4 text-sm
                           focus:outline-none focus:ring-4 focus:ring-blue-300
                           transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    {/* spinner */}
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Analyzing…
                  </>
                ) : (
                  "Analyze Water Risk"
                )}
              </button>
            </form>
          </section>

          {/* ==================== RIGHT — Results Dashboard ==================== */}
          <section
            className={`rounded-2xl shadow-sm border-2 p-6 sm:p-8 transition-all duration-300 ${
              isCritical ? borderColor : `bg-white ${borderColor}`
            }`}
          >
            <h2 className={`text-lg font-semibold mb-1 ${
              isCritical ? "text-white" : "text-gray-800"
            }`}>
              Risk Assessment
            </h2>
            <p className={`text-sm mb-6 ${
              isCritical ? "text-red-100" : "text-gray-500"
            }`}>
              AI-powered prediction results.
            </p>

            {/* ---- placeholder state ---- */}
            {!result && !error && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2
                       2v6a2 2 0 002 2h2a2 2 0 002-2zm0
                       0V9a2 2 0 012-2h2a2 2 0 012
                       2v10m-6 0a2 2 0 002 2h2a2 2 0
                       002-2m0 0V5a2 2 0 012-2h2a2 2
                       0 012 2v14a2 2 0 01-2 2h-2a2
                       2 0 01-2-2z"
                  />
                </svg>
                <p className="text-sm font-medium">Awaiting Data…</p>
                <p className="text-xs mt-1">
                  Fill in the form and click <strong>Analyze</strong>.
                </p>
              </div>
            )}

            {/* ---- loading state ---- */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-blue-400">
                <svg
                  className="animate-spin h-12 w-12 mb-4"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <p className="text-sm font-medium">Processing prediction…</p>
              </div>
            )}

            {/* ---- error state ---- */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Connection Error
                </p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            )}

            {/* ---- result state ---- */}
            {result && (
              <div className="space-y-5">
                {/* Prediction */}
                <div className={`rounded-xl p-4 ${
                  isCritical ? "bg-red-700/50" : "bg-gray-50"
                }`}>
                  <p className={`text-xs uppercase tracking-wide mb-1 ${
                    isCritical ? "text-red-200" : "text-gray-400"
                  }`}>
                    Severity Prediction
                  </p>
                  <p className={`text-2xl font-bold ${
                    isCritical ? "text-white" : "text-gray-900"
                  }`}>
                    {result.prediction}
                  </p>
                </div>

                {/* Confidence */}
                <div className={`rounded-xl p-4 ${
                  isCritical ? "bg-red-700/50" : "bg-gray-50"
                }`}>
                  <p className={`text-xs uppercase tracking-wide mb-2 ${
                    isCritical ? "text-red-200" : "text-gray-400"
                  }`}>
                    Confidence
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 h-3 rounded-full overflow-hidden ${
                      isCritical ? "bg-red-900" : "bg-gray-200"
                    }`}>
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isCritical ? "bg-white" : "bg-blue-500"
                        }`}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${
                      isCritical ? "text-white" : "text-gray-800"
                    }`}>
                      {result.confidence}%
                    </span>
                  </div>
                </div>

                {/* Alert Level */}
                <div className={`rounded-xl p-4 ${
                  isCritical ? "bg-red-700/50" : "bg-gray-50"
                }`}>
                  <p className={`text-xs uppercase tracking-wide mb-1 ${
                    isCritical ? "text-red-200" : "text-gray-400"
                  }`}>
                    Alert Level
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isCritical
                        ? "text-white"
                        : isHigh
                          ? "text-red-600"
                          : isNormal
                            ? "text-green-600"
                            : "text-yellow-600"
                    }`}
                  >
                    {isCritical && "🚨 "}
                    {isHigh && "⚠️ "}
                    {result.alert_level === "Medium Risk" && "⚡ "}
                    {isNormal && "✅ "}
                    {result.alert_level}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* =============== Community Insights — SDG 6 Impact =============== */}
        <section className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌍</span> Community Insights &amp; Local Impact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Challenge */}
            <div className="rounded-xl bg-red-50 border border-red-100 p-5">
              <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-2">
                The Challenge
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Millions in peri-urban areas lack real-time data on water
                safety, leading to preventable health crises. Without
                predictive tools, communities react to contamination events
                only <em>after</em> people fall ill.
              </p>
            </div>

            {/* Our Impact */}
            <div className="rounded-xl bg-green-50 border border-green-100 p-5">
              <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-2">
                Our Impact
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                This tool provides a <strong>95%+ accuracy</strong> predictive
                risk score, allowing local governance to prioritise
                infrastructure repairs <em>before</em> contamination spreads —
                turning reactive response into proactive prevention.
              </p>
            </div>
          </div>

          {/* SDG 6 Targets */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "SDG 6.1 — Safe Drinking Water",
              "SDG 6.3 — Water Quality",
              "SDG 6.b — Community Participation",
            ].map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* -------- Footer -------- */}
      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Powered by Machine Learning&nbsp;·&nbsp;Supporting UN Sustainable
        Development Goal&nbsp;6
      </footer>
    </div>
  );
}
