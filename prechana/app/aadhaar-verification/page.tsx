
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markAadhaarVerified } from "./actions";

export default function AadhaarVerificationPage() {
  const router = useRouter();

  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  function sendDemoOtp() {
    setError("");

    if (aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) {
      setError("Enter a 12-digit demo Aadhaar number.");
      return;
    }

    setOtpSent(true);
  }

  async function verifyDemoOtp() {
    setError("");

   if (otp === "123456") {
  const result = await markAadhaarVerified();

  if (!result.success) {
    setError(result.error ?? "Verification failed.");
    return;
  }

  router.push("/dashboard");
} else {
  setError("Invalid demo OTP. Use 123456.");
}
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">
          Aadhaar Verification
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Complete verification to continue to PRECHANA.
        </p>

        <div className="mt-5 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          Demo verification only. Do not enter your real Aadhaar number.
        </div>

        {!otpSent ? (
          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="aadhaar"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Demo Aadhaar Number
              </label>

              <input
                id="aadhaar"
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={aadhaar}
                onChange={(e) =>
                  setAadhaar(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter 12 digits"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              onClick={sendDemoOtp}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-700"
            >
              Send OTP
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              Demo OTP sent successfully.
              <br />
              Use OTP: <strong>123456</strong>
            </div>

            <div>
              <label
                htmlFor="otp"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Enter OTP
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter 123456"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              onClick={verifyDemoOtp}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-700"
            >
              Verify Aadhaar
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
