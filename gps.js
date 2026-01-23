/**
 * GPS.js - Mock GPS Coordinate System
 * 
 * This simulates how Google Maps uses GPS coordinates (latitude, longitude)
 * to calculate distances between locations. In reality, Google Maps uses
 * the Haversine formula to calculate distances on Earth's surface.
 * 
 * For this simulation, we use a simplified coordinate system and
 * Euclidean distance calculation for demonstration purposes.
 */

/**
 * Calculate distance between two GPS coordinates (in kilometers)
 * Uses simplified Euclidean distance for simulation
 * 
 * In real Google Maps, this would use the Haversine formula:
 * a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
 * c = 2 ⋅ atan2( √a, √(1−a) )
 * d = R ⋅ c
 * 
 * @param {Object} coord1 - {lat: number, lng: number}
 * @param {Object} coord2 - {lat: number, lng: number}
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(coord1, coord2) {
  // Simplified distance calculation for simulation
  // In reality, 1 degree of latitude ≈ 111 km
  // 1 degree of longitude ≈ 111 km * cos(latitude)
  const latDiff = coord2.lat - coord1.lat;
  const lngDiff = coord2.lng - coord1.lng;
  
  // Convert to kilometers (approximate)
  const kmPerDegree = 111;
  const distance = Math.sqrt(
    Math.pow(latDiff * kmPerDegree, 2) + 
    Math.pow(lngDiff * kmPerDegree * Math.cos(coord1.lat * Math.PI / 180), 2)
  );
  
  return distance;
}

/**
 * Convert distance (km) to travel time (minutes)
 * Assumes average speed based on road type
 * 
 * This simulates how Google Maps estimates travel time:
 * - Highway: 100 km/h average
 * - Main road: 60 km/h average  
 * - Local road: 40 km/h average
 * 
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} roadType - Type of road: 'highway', 'main', 'local'
 * @returns {number} Travel time in minutes
 */
export function distanceToTime(distanceKm, roadType = 'main') {
  const speeds = {
    highway: 100,  // km/h
    main: 60,      // km/h
    local: 40      // km/h
  };
  
  const speed = speeds[roadType] || speeds.main;
  const timeHours = distanceKm / speed;
  const timeMinutes = timeHours * 60;
  
  return timeMinutes;
}

/**
 * Convert GPS coordinates to canvas coordinates for visualization
 * This simulates how Google Maps projects Earth's surface onto a 2D map
 * 
 * @param {Object} coord - {lat: number, lng: number}
 * @param {Object} bounds - {minLat, maxLat, minLng, maxLng}
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {Object} {x: number, y: number}
 */
export function gpsToCanvas(coord, bounds, width, height) {
  const latRange = bounds.maxLat - bounds.minLat;
  const lngRange = bounds.maxLng - bounds.minLng;
  
  // Normalize coordinates (0 to 1)
  const normalizedLat = (bounds.maxLat - coord.lat) / latRange;
  const normalizedLng = (coord.lng - bounds.minLng) / lngRange;
  
  // Convert to canvas coordinates
  const x = normalizedLng * width;
  const y = normalizedLat * height;
  
  return { x, y };
}

/**
 * Get bounding box for all nodes with padding
 * @param {Object} nodes - Object with node data containing lat/lng
 * @param {number} paddingPercent - Padding percentage (default 5%)
 * @returns {Object} Bounding box
 */
export function getBounds(nodes, paddingPercent = 5) {
  const coords = Object.values(nodes).map(node => ({
    lat: node.lat,
    lng: node.lng
  }));
  
  const minLat = Math.min(...coords.map(c => c.lat));
  const maxLat = Math.max(...coords.map(c => c.lat));
  const minLng = Math.min(...coords.map(c => c.lng));
  const maxLng = Math.max(...coords.map(c => c.lng));
  
  const latRange = maxLat - minLat;
  const lngRange = maxLng - minLng;
  
  // Add padding
  const latPadding = latRange * (paddingPercent / 100);
  const lngPadding = lngRange * (paddingPercent / 100);
  
  return {
    minLat: minLat - latPadding,
    maxLat: maxLat + latPadding,
    minLng: minLng - lngPadding,
    maxLng: maxLng + lngPadding
  };
}
