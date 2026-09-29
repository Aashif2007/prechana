export interface GeocodeResult {
  address: string;
  lat: number;
  lng: number;
}

export interface ReverseGeocodeResult {
  address: string;
}

/**
 * Clean geocoding abstraction.
 * Currently uses OpenStreetMap Nominatim with proper User-Agent and timeout handling.
 * Can be swapped with Google Maps, Mapbox, or Pelias without changing callers.
 */
export async function searchAddress(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("q", trimmed);
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "PRECHANA-CivicApp/1.0",
        "Accept-Language": "en",
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const item = data[0];
    return {
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    };
  } catch (error) {
    console.error("Geocoding search failed:", error);
    return null;
  }
}

export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lon", lng.toString());
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "PRECHANA-CivicApp/1.0",
        "Accept-Language": "en",
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || !data.display_name) return null;

    return {
      address: data.display_name,
    };
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
}
