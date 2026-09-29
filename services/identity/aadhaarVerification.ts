import { randomUUID } from "crypto";

// Real Aadhaar OTP verification requires becoming a UIDAI-licensed Sub-AUA/KUA,
// which is done through a partner such as Setu or Surepass (a business
// onboarding process, not just an API key). Until that is set up, PRECHANA
// runs in demo mode: it simulates the OTP flow so the rest of the app can be
// built and tested. Swap in a real provider by implementing this interface.

export interface AadhaarProvider {
  // Starts verification. Returns an opaque reference id — never the Aadhaar number itself.
  sendOtp(aadhaarNumber: string): Promise<{ reference: string }>;
  // Confirms the OTP against a reference from sendOtp.
  verifyOtp(reference: string, otp: string): Promise<{ verified: boolean }>;
}

export function maskAadhaar(aadhaarNumber: string): string {
  const last4 = aadhaarNumber.slice(-4);
  return "XXXX XXXX " + last4;
}

// Demo provider: no real UIDAI call, no real OTP sent anywhere.
// Accepts any well-formed 12-digit number. OTP is always 123456.
class DemoAadhaarProvider implements AadhaarProvider {
  async sendOtp(_aadhaarNumber: string): Promise<{ reference: string }> {
    return { reference: "demo_" + randomUUID() };
  }

  async verifyOtp(reference: string, otp: string): Promise<{ verified: boolean }> {
    if (!reference.startsWith("demo_")) return { verified: false };
    return { verified: otp === "123456" };
  }
}

// Fill this in once you have a Setu or Surepass sandbox/production account.
// Consult that provider's own current API reference for the exact request
// and response shape — don't guess at endpoints or field names.
class RealAadhaarProvider implements AadhaarProvider {
  async sendOtp(_aadhaarNumber: string): Promise<{ reference: string }> {
    throw new Error(
      "Real Aadhaar verification is not configured. Set AADHAAR_PROVIDER=demo, " +
      "or complete Sub-AUA/KUA onboarding with a licensed provider and implement this method."
    );
  }

  async verifyOtp(_reference: string, _otp: string): Promise<{ verified: boolean }> {
    throw new Error("Real Aadhaar verification is not configured.");
  }
}

export function getAadhaarProvider(): AadhaarProvider {
  if (process.env.AADHAAR_PROVIDER === "real") {
    return new RealAadhaarProvider();
  }
  return new DemoAadhaarProvider();
}

// Used only to catch obviously malformed input before calling the provider.
// This is a format check, not a validity check — it cannot confirm the
// number is real or belongs to the person entering it.
export function isValidAadhaarFormat(value: string): boolean {
  return /^\d{12}$/.test(value);
}
