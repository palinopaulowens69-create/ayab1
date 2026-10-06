export type RoutePoint = [number, number];

export interface DrivingRoute {
  points: RoutePoint[];
  pickup: RoutePoint;
  destination: RoutePoint;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseCoordinate(value: unknown): RoutePoint {
  if (
    !Array.isArray(value) ||
    typeof value[0] !== 'number' ||
    typeof value[1] !== 'number' ||
    !Number.isFinite(value[0]) ||
    !Number.isFinite(value[1])
  ) {
    throw new Error('The routing service returned invalid coordinates.');
  }
  return [value[1], value[0]];
}

export async function fetchDrivingRoute(
  pickup: RoutePoint,
  destination: RoutePoint,
  signal: AbortSignal,
): Promise<DrivingRoute> {
  const coordinates = `${pickup[1]},${pickup[0]};${destination[1]},${destination[0]}`;
  const url = new URL(`https://router.project-osrm.org/route/v1/driving/${coordinates}`);
  url.searchParams.set('overview', 'full');
  url.searchParams.set('geometries', 'geojson');
  url.searchParams.set('steps', 'false');

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Routing service returned HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.routes)) {
    throw new Error('The routing service returned an invalid response.');
  }
  const route = payload.routes[0];
  if (!isRecord(route) || !isRecord(route.geometry) || !Array.isArray(route.geometry.coordinates)) {
    const message = isRecord(payload) && typeof payload.message === 'string' ? payload.message : '';
    throw new Error(message || 'No driving route was found.');
  }

  const points = route.geometry.coordinates.map(parseCoordinate);
  if (points.length < 2) {
    throw new Error('The routing service did not return enough points for a driving route.');
  }
  return {
    points,
    pickup: points[0],
    destination: points[points.length - 1],
  };
}

export async function snapToRoad(point: RoutePoint, signal: AbortSignal): Promise<RoutePoint> {
  const url = new URL(`https://router.project-osrm.org/nearest/v1/driving/${point[1]},${point[0]}`);
  url.searchParams.set('number', '1');

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Road lookup returned HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.waypoints) || !isRecord(payload.waypoints[0])) {
    throw new Error('The road lookup returned an invalid response.');
  }
  const waypoint = payload.waypoints[0];
  if (typeof waypoint.distance === 'number' && waypoint.distance > 150) {
    throw new Error('No nearby road was found. Please choose a point closer to a road.');
  }
  if (waypoint.location === undefined) {
    throw new Error('The road lookup did not return a location.');
  }
  return parseCoordinate(waypoint.location);
}

export function getPointAlongRoute(route: RoutePoint[], progress: number): RoutePoint {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const segmentLengths = route.slice(1).map((point, index) => {
    const previous = route[index];
    const latitudeScale = Math.cos(((previous[0] + point[0]) / 2) * Math.PI / 180);
    return Math.hypot(point[0] - previous[0], (point[1] - previous[1]) * latitudeScale);
  });
  const totalLength = segmentLengths.reduce((total, length) => total + length, 0);
  let remainingDistance = totalLength * clampedProgress;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index];
    if (remainingDistance <= segmentLength) {
      const segmentProgress = segmentLength === 0 ? 0 : remainingDistance / segmentLength;
      return [
        route[index][0] + (route[index + 1][0] - route[index][0]) * segmentProgress,
        route[index][1] + (route[index + 1][1] - route[index][1]) * segmentProgress,
      ];
    }
    remainingDistance -= segmentLength;
  }
  return route[route.length - 1];
}
