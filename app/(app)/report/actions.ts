"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { classifyComplaint } from "@/services/ai/classifyComplaint";
import { routeComplaint } from "@/services/routing/complaintRouter";
import { addTimelineEvent } from "@/services/timeline/addEvent";
import { CATEGORY_LABELS, DEPARTMENT_FOR_CATEGORY } from "@/lib/categories";

type PhotoCheck = { error?: string; bytes?: Buffer; ext?: string; mime?: string };

// Checks size and the file's real type (magic bytes), not just its name
async function checkPhoto(file: File): Promise<PhotoCheck> {
  if (file.size > 5 * 1024 * 1024) return { error: "Photo must be under 5 MB" };

  const bytes = Buffer.from(await file.arrayBuffer());
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;

  if (isJpeg) return { bytes, ext: "jpg", mime: "image/jpeg" };
  if (isPng) return { bytes, ext: "png", mime: "image/png" };
  return { error: "Only JPG or PNG photos are allowed" };
}

export async function analyzeComplaint(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not logged in");

  const description = String(formData.get("description") ?? "").slice(0, 1000);
  let imageBase64: string | undefined;
  let imageMimeType: string | undefined;

  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    const check = await checkPhoto(file);
    if (check.bytes) {
      imageBase64 = check.bytes.toString("base64");
      imageMimeType = check.mime;
    }
  }

  return classifyComplaint({
    description,
    lat: Number(formData.get("latitude")) || 0,
    lng: Number(formData.get("longitude")) || 0,
    imageBase64,
    imageMimeType,
  });
}

export async function geocodeAddressAction(query: string) {
  const { searchAddress } = await import("@/services/geocoding/geocodingService");
  return searchAddress(query);
}

export async function reverseGeocodeAction(lat: number, lng: number) {
  const { reverseGeocodeCoordinates } = await import("@/services/geocoding/geocodingService");
  return reverseGeocodeCoordinates(lat, lng);
}

const SubmitSchema = z.object({
  description: z.string().min(10).max(1000),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  category: z.enum(Object.keys(CATEGORY_LABELS) as [string, ...string[]]),
  severity: z.enum(["low", "medium", "high"]),
  address: z.string().max(1000).optional(),
  subcategory: z.string().max(60).optional(),
  aiCategory: z.string().max(40).optional(),
  aiSummary: z.string().max(200).optional(),
  aiConfidence: z.coerce.number().min(0).max(1).optional(),
});

function fail(message: string): never {
  redirect("/report?error=" + encodeURIComponent(message));
}

export async function submitComplaint(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (!formData.get("latitude") || !formData.get("longitude")) {
    fail("Please choose a location first");
  }

  const parsed = SubmitSchema.safeParse({
    description: formData.get("description"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    category: formData.get("category"),
    severity: formData.get("severity"),
    address: formData.get("address") || undefined,
    subcategory: formData.get("subcategory") || undefined,
    aiCategory: formData.get("aiCategory") || undefined,
    aiSummary: formData.get("aiSummary") || undefined,
    aiConfidence: formData.get("aiConfidence") || undefined,
  });
  if (!parsed.success) fail("Please check the form: description needs at least 10 characters");
  const data = parsed.data;

  const db = createAdminClient();

  // Simple rate limit: 10 complaints per hour per user
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await db
    .from("complaints")
    .select("id", { count: "exact", head: true })
    .eq("citizen_id", profile.id)
    .gte("created_at", hourAgo);
  if ((count ?? 0) >= 10) fail("Too many complaints in the last hour. Please try again later.");

  // Check the photo before creating anything
  let photo: PhotoCheck | null = null;
  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    photo = await checkPhoto(file);
    if (photo.error) fail(photo.error);
  }

  const { data: complaint, error } = await db
    .from("complaints")
    .insert({
      citizen_id: profile.id,
      category: data.category,
      subcategory: data.subcategory ?? null,
      severity: data.severity,
      department_category: DEPARTMENT_FOR_CATEGORY[data.category],
      description: data.description,
      ai_summary: data.aiSummary ?? null,
      ai_confidence: data.aiConfidence ?? null,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address ?? null,
    })
    .select("id, public_id")
    .single();
  if (error || !complaint) fail("Could not save your complaint. Please try again.");

  if (photo && photo.bytes) {
    const path = complaint.id + "/" + randomUUID() + "." + photo.ext;
    const upload = await db.storage
      .from("complaint-photos")
      .upload(path, photo.bytes, { contentType: photo.mime });
    if (!upload.error) {
      await db.from("complaint_media").insert({ complaint_id: complaint.id, storage_path: path });
    }
  }

  await addTimelineEvent(db, complaint.id, "submitted", "Complaint submitted.");

  if (data.aiSummary) {
    const aiLabel = CATEGORY_LABELS[data.aiCategory ?? "other"] ?? "Other civic issue";
    const percent = Math.round((data.aiConfidence ?? 0) * 100);
    await addTimelineEvent(db, complaint.id, "ai", "AI suggested: " + aiLabel + " (confidence " + percent + "%).");
    if (data.aiCategory && data.aiCategory !== data.category) {
      await addTimelineEvent(db, complaint.id, "category_corrected",
        "Citizen changed the category to " + CATEGORY_LABELS[data.category] + ".");
    }
  }

  await routeComplaint(db, complaint.id);
  redirect("/complaints/" + complaint.id + "?created=1");
}
