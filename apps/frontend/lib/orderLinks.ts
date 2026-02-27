export type OrderProvider = "doordash" | "ubereats";

function buildGoogleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function buildDoorDashSearchUrl(restaurantName: string): string {
  return buildGoogleSearchUrl(`site:doordash.com ${restaurantName} Nashville`);
}

export function buildUberEatsSearchUrl(restaurantName: string): string {
  return buildGoogleSearchUrl(`site:ubereats.com ${restaurantName} Nashville`);
}

export function buildOrderProviderUrl(provider: OrderProvider, restaurantName: string): string {
  return provider === "doordash"
    ? buildDoorDashSearchUrl(restaurantName)
    : buildUberEatsSearchUrl(restaurantName);
}

export function buildGoogleMapsUrl(params: {
  restaurantName: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}): string {
  if (Number.isFinite(params.latitude) && Number.isFinite(params.longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${params.latitude},${params.longitude}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${params.restaurantName} ${params.address}`,
  )}`;
}

