/**
 * Geofencing & Distance Utilities for SchoolMate
 */

export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Calculate the great-circle distance between two points in METERS using the Haversine formula.
 */
export function calculateDistanceMeters(
  coord1: Coordinate,
  coord2: Coordinate
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Check if the vehicle has entered a child's pickup radius (e.g., 40 meters)
 */
export function isWithinGeofence(
  vehicleCoord: Coordinate,
  targetCoord: Coordinate,
  radiusMeters = 40
): boolean {
  const distance = calculateDistanceMeters(vehicleCoord, targetCoord);
  return distance <= radiusMeters;
}

/**
 * Proximity Alert Trigger check (e.g., within 1000 meters / 1km)
 */
export function isWithinProximityAlert(
  vehicleCoord: Coordinate,
  targetCoord: Coordinate,
  proximityMeters = 1000
): boolean {
  const distance = calculateDistanceMeters(vehicleCoord, targetCoord);
  return distance <= proximityMeters;
}
