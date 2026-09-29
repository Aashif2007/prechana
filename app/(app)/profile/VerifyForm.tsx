"use client";

import { useState } from "react";
import { card, btn, input } from "@/lib/ui";
import { sendAadhaarOtp, verifyAadhaarOtp } from "./actions";

export function VerifyForm({ reference }: { reference?: string }) {
  const [aadhaar, setAadhaar] = useState("");
  const isDemo = process.env.NEXT_PUBLIC_AADHAAR_DEMO !== "false";

  if (reference) {
    return (
      <form action={verifyAadhaarOtp} className={card + " space-y-3"}>
        <p className="font-medium">Enter the OTP</p>
        <p className="text-sm text-slate-500">
          {isDemo
            ? "Demo mode: no real OTP was sent. Enter 123456 to simulate a successful verification."
            : "An OTP was sent to your Aadhaar-registered mobile number."}
        </p>
        <input type="hidden" name="reference" value={reference} />
        <input
          name="otp"
          inputMode="numeric"
          maxLength={8}
          required
          placeholder="6-digit OTP"
          className={input}
        />
        <button className={btn}>Verify</button>
      </form>
    );
  }

  return (
    <form action={sendAadhaarOtp} className={card + " space-y-3"}>
      <p className="font-medium">Verify your identity with Aadhaar</p>
      <p className="text-sm text-slate-500">
        {isDemo
          ? "Demo mode: any 12-digit number is accepted. No real Aadhaar check is performed."
          : "You'll receive an OTP on your Aadhaar-registered mobile number."}
      </p>
      <input
        name="aadhaarNumber"
        value={aadhaar}
        onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
        inputMode="numeric"
        maxLength={12}
        required
        placeholder="12-digit Aadhaar number"
        className={input}
      />
      <p className="text-xs text-slate-400">
        Only the last 4 digits are ever stored. The full number is never saved.
      </p>
      <button className={btn} disabled={aadhaar.length !== 12}>Send OTP</button>
    </form>
  );
}
