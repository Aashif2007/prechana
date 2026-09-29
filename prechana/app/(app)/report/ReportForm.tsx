"use client";

import { useRef, useState, useTransition } from "react";
import { ComplaintMap } from "@/components/ComplaintMap";
import { CATEGORY_LABELS, DEPARTMENT_FOR_CATEGORY, DEPARTMENT_LABELS } from "@/lib/categories";
import { card, btn, btnLight, input } from "@/lib/ui";
import { analyzeComplaint, submitComplaint } from "./actions";

export function ReportForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [category, setCategory] = useState("other");
  const [severity, setSeverity] = useState("medium");
  const [locationError, setLocationError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function fillMyLocation() {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Location is not available in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
      },
      () => setLocationError("Could not get your location. Pick it on the map instead.")
    );
  }

  function pickOnMap(pickedLat: number, pickedLng: number) {
    setLat(pickedLat.toFixed(6));
    setLng(pickedLng.toFixed(6));
  }

  function handleAnalyze() {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    startTransition(async () => {
      const result = await analyzeComplaint(data);
      setAnalysis(result);
      setCategory(result.category);
      setSeverity(result.severity);
    });
  }

  const points = lat && lng ? [{ lat: Number(lat), lng: Number(lng), label: "Problem location" }] : [];
  const departmentKey = DEPARTMENT_FOR_CATEGORY[category];

  return (
    <form ref={formRef} action={submitComplaint} className="space-y-4">
      <div className={card + " space-y-3"}>
        <p className="font-medium">1. Upload a photo of the problem</p>
        <input type="file" name="photo" accept="image/jpeg,image/png" onChange={handlePhoto} className="text-sm" />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="max-h-56 rounded-xl object-cover" />
        )}
        <p className="text-xs text-slate-400">JPG or PNG, up to 5 MB. One photo for now.</p>
      </div>

      <div className={card + " space-y-3"}>
        <p className="font-medium">2. Describe the problem</p>
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={1000}
          rows={3}
          placeholder="Street light near my street has not been working for 5 days."
          className={input}
        />
      </div>

      <div className={card + " space-y-3"}>
        <p className="font-medium">3. Location</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={fillMyLocation} className={btnLight}>Use My Location</button>
          <span className="self-center text-xs text-slate-500">or tap the map</span>
        </div>
        {locationError && <p className="text-sm text-red-600">{locationError}</p>}
        <ComplaintMap points={points} onPick={pickOnMap} />
        <div className="grid grid-cols-2 gap-2">
          <input name="latitude" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" className={input} />
          <input name="longitude" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude" className={input} />
        </div>
        <input name="address" maxLength={200} placeholder="Landmark or address (optional)" className={input} />
      </div>

      <div className={card + " space-y-3"}>
        <p className="font-medium">4. Check the category</p>
        <button type="button" onClick={handleAnalyze} disabled={isPending} className={btnLight}>
          {isPending ? "Analysing..." : "Suggest category with AI"}
        </button>

        {analysis && (
          <div className="rounded-xl bg-emerald-50 p-3 text-sm">
            <p className="font-semibold">Detected Issue</p>
            <p>{analysis.summary}</p>
            <p className="text-slate-600">Confidence: {Math.round(analysis.confidence * 100)}%</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
            {Object.keys(CATEGORY_LABELS).map((key) => (
              <option key={key} value={key}>{CATEGORY_LABELS[key]}</option>
            ))}
          </select>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={input}>
            <option value="low">Low severity</option>
            <option value="medium">Medium severity</option>
            <option value="high">High severity</option>
          </select>
        </div>
        <p className="text-xs text-slate-500">
          Department type: {DEPARTMENT_LABELS[departmentKey]}. AI can be wrong, so please correct it.
          The responsible authority is picked from the verified database, never by AI.
        </p>
      </div>

      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="severity" value={severity} />
      <input type="hidden" name="subcategory" value={analysis?.subcategory ?? ""} />
      <input type="hidden" name="aiCategory" value={analysis?.category ?? ""} />
      <input type="hidden" name="aiSummary" value={analysis?.summary ?? ""} />
      <input type="hidden" name="aiConfidence" value={analysis?.confidence ?? ""} />

      <button type="submit" disabled={!lat || !lng} className={btn + " w-full py-3"}>
        Submit Complaint
      </button>
    </form>
  );
}
