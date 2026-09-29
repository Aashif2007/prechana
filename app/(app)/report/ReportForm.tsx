"use client";

import { useRef, useState, useTransition } from "react";
import {
  Search,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { ComplaintMap } from "@/components/ComplaintMap";
import { CATEGORY_LABELS, DEPARTMENT_FOR_CATEGORY, DEPARTMENT_LABELS } from "@/lib/categories";
import { card, btn, btnLight, input } from "@/lib/ui";
import {
  analyzeComplaint,
  submitComplaint,
  geocodeAddressAction,
  reverseGeocodeAction,
} from "./actions";

export function ReportForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const locationSectionRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Internal coordinates (never displayed to citizen)
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [readableAddress, setReadableAddress] = useState("");
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);

  // Address search & geocoding states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [locationValidationError, setLocationValidationError] = useState("");

  // Complaint categorization states
  const [analysis, setAnalysis] = useState<any>(null);
  const [category, setCategory] = useState("other");
  const [severity, setSeverity] = useState("medium");
  const [isPending, startTransition] = useTransition();

  function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  // Search address and move map
  async function handleSearchAddress() {
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError("");
    setLocationValidationError("");

    try {
      const result = await geocodeAddressAction(query);
      if (result) {
        setLat(result.lat.toFixed(6));
        setLng(result.lng.toFixed(6));
        setReadableAddress(result.address);
        setIsLocationConfirmed(false);
      } else {
        setSearchError(
          "Could not locate that address. Please check spelling or select the spot directly on the map."
        );
      }
    } catch {
      setSearchError("Unable to search address at this time. Please click directly on the map.");
    } finally {
      setIsSearching(false);
    }
  }

  // Reverse geocode when pin is clicked or dragged
  async function updateCoordinatesWithAddress(pickedLat: number, pickedLng: number) {
    const latStr = pickedLat.toFixed(6);
    const lngStr = pickedLng.toFixed(6);
    setLat(latStr);
    setLng(lngStr);
    setIsLocationConfirmed(false);
    setSearchError("");
    setLocationValidationError("");
    setIsReverseGeocoding(true);

    try {
      const result = await reverseGeocodeAction(pickedLat, pickedLng);
      if (result && result.address) {
        setReadableAddress(result.address);
      } else {
        setReadableAddress("Pinned Location on Map");
      }
    } catch {
      setReadableAddress("Pinned Location on Map");
    } finally {
      setIsReverseGeocoding(false);
    }
  }

  function pickOnMap(pickedLat: number, pickedLng: number) {
    updateCoordinatesWithAddress(pickedLat, pickedLng);
  }

  // Browser GPS Geolocation
  function fillMyLocation() {
    setSearchError("");
    setLocationValidationError("");
    if (!navigator.geolocation) {
      setSearchError("Location is not supported in this browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        updateCoordinatesWithAddress(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setIsLocating(false);
        setSearchError("Could not retrieve GPS location. Please search or pick it on the map.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  function handleConfirmLocation() {
    if (!lat || !lng) {
      setLocationValidationError("Please pick a location on the map before confirming.");
      return;
    }
    setIsLocationConfirmed(true);
    setLocationValidationError("");
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

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!lat || !lng || !isLocationConfirmed) {
      event.preventDefault();
      setLocationValidationError("Please select and confirm the problem location before submitting.");
      locationSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  const points = lat && lng ? [{ lat: Number(lat), lng: Number(lng), label: "Problem location" }] : [];
  const departmentKey = DEPARTMENT_FOR_CATEGORY[category];

  return (
    <form ref={formRef} action={submitComplaint} onSubmit={handleFormSubmit} className="space-y-5">
      {/* ── 1. PHOTO UPLOAD ──────────────────────────────────────────────── */}
      <div className={card + " space-y-3"}>
        <p className="font-semibold text-slate-100">1. Upload a photo of the problem</p>
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png"
          onChange={handlePhoto}
          className="text-sm text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-teal-500"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="max-h-56 rounded-xl object-cover border border-white/10" />
        )}
        <p className="text-xs text-slate-400">JPG or PNG, up to 5 MB. One photo for now.</p>
      </div>

      {/* ── 2. DESCRIPTION ──────────────────────────────────────────────── */}
      <div className={card + " space-y-3"}>
        <p className="font-semibold text-slate-100">2. Describe the problem</p>
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

      {/* ── 3. PROBLEM LOCATION (CIVIC-TECH UX) ─────────────────────────── */}
      <div ref={locationSectionRef} className={card + " space-y-4"}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-100">3. Problem Location</p>
            <p className="text-xs text-slate-400">
              Search by address, landmark, or tap on the map to pinpoint the problem.
            </p>
          </div>
          <button
            type="button"
            onClick={fillMyLocation}
            disabled={isLocating}
            className={`${btnLight} self-start sm:self-auto flex items-center gap-1.5 py-1.5 px-3 text-xs`}
          >
            {isLocating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-400" />
            ) : (
              <Navigation className="h-3.5 w-3.5 text-teal-400" />
            )}
            <span>Use Current Location</span>
          </button>
        </div>

        {/* Address Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchAddress();
                }
              }}
              placeholder="Search address, area, landmark... (e.g. Anna Nagar, Chennai)"
              className={`${input} pr-10`}
            />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSearchAddress}
            disabled={isSearching || !searchQuery.trim()}
            className={`${btn} shrink-0 px-4 py-2.5 text-xs font-semibold disabled:opacity-50`}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-1.5 hidden sm:inline">Search</span>
          </button>
        </div>

        {/* Error Feedback */}
        {searchError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Interactive Responsive Map */}
        <div className="space-y-1.5">
          <ComplaintMap points={points} onPick={pickOnMap} />
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-teal-400 font-bold">Tip:</span>
            Drag the pin or click anywhere on the map to adjust the exact location.
          </p>
        </div>

        {/* Location Selection & Confirmation Card */}
        {lat && lng ? (
          <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-4 transition-all duration-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{isLocationConfirmed ? "Location Confirmed" : "Location Selected"}</span>
                </div>
                <p className="text-sm font-medium text-slate-200 leading-snug">
                  {isReverseGeocoding ? (
                    <span className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-400" />
                      Resolving address details...
                    </span>
                  ) : (
                    readableAddress || "Selected point on map"
                  )}
                </p>
              </div>

              {!isLocationConfirmed ? (
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  className={`${btn} shrink-0 px-4 py-2 text-xs font-semibold`}
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Confirm Location
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300">
                    <Check className="h-3.5 w-3.5" />
                    Confirmed
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLocationConfirmed(false)}
                    className="text-xs text-slate-400 underline hover:text-slate-200 transition-colors"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <p className="text-xs text-slate-400">
              No location selected yet. Use the search bar above or tap on the map to pin the incident site.
            </p>
          </div>
        )}

        {/* Validation Error */}
        {locationValidationError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{locationValidationError}</span>
          </div>
        )}

        {/* Hidden internal location inputs for database and server actions */}
        <input type="hidden" name="latitude" value={isLocationConfirmed ? lat : ""} />
        <input type="hidden" name="longitude" value={isLocationConfirmed ? lng : ""} />
        <input type="hidden" name="address" value={readableAddress} />
      </div>

      {/* ── 4. CATEGORY & SEVERITY ──────────────────────────────────────── */}
      <div className={card + " space-y-3"}>
        <p className="font-semibold text-slate-100">4. Check the category</p>
        <button type="button" onClick={handleAnalyze} disabled={isPending} className={btnLight}>
          {isPending ? "Analysing..." : "Suggest category with AI"}
        </button>

        {analysis && (
          <div className="rounded-xl bg-teal-950/30 border border-teal-500/20 p-3 text-sm">
            <p className="font-semibold text-teal-300">Detected Issue</p>
            <p className="text-slate-200">{analysis.summary}</p>
            <p className="text-xs text-slate-400 mt-1">Confidence: {Math.round(analysis.confidence * 100)}%</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
            {Object.keys(CATEGORY_LABELS).map((key) => (
              <option key={key} value={key} className="bg-slate-900 text-slate-100">
                {CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={input}>
            <option value="low" className="bg-slate-900 text-slate-100">Low severity</option>
            <option value="medium" className="bg-slate-900 text-slate-100">Medium severity</option>
            <option value="high" className="bg-slate-900 text-slate-100">High severity</option>
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

      <button
        type="submit"
        disabled={!lat || !lng || !isLocationConfirmed}
        className={`${btn} w-full py-3.5 text-base font-semibold shadow-[0_0_30px_rgba(20,184,166,0.25)] hover:shadow-[0_0_40px_rgba(20,184,166,0.45)] disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        Submit Complaint
      </button>
    </form>
  );
}
