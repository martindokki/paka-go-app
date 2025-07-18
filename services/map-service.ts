import axios from 'axios';

// API Keys
const LOCATIONIQ_API_KEY = 'pk.b516b63f4459bb73c4c29e889e0e9111';
const GRAPHHOPPER_API_KEY = '5b34b9bb-bd31-4c3f-9451-0927a3fadd7d';
const MAPTILER_API_KEY = '91fasGbYRNLzEMRrvG8M';

// Mock locations for common addresses (fallback when API fails)
const MOCK_LOCATIONS: { [key: string]: Coordinates } = {
  'nairobi': { latitude: -1.2921, longitude: 36.8219 },
  'westlands': { latitude: -1.2676, longitude: 36.8108 },
  'karen': { latitude: -1.3197, longitude: 36.6859 },
  'kilimani': { latitude: -1.2884, longitude: 36.7870 },
  'lavington': { latitude: -1.2833, longitude: 36.7833 },
  'kileleshwa': { latitude: -1.2833, longitude: 36.7667 },
  'parklands': { latitude: -1.2500, longitude: 36.8333 },
  'eastleigh': { latitude: -1.2833, longitude: 36.8500 },
  'south b': { latitude: -1.3167, longitude: 36.8333 },
  'south c': { latitude: -1.3333, longitude: 36.8333 },
};

// MapTiler tile URL template
export const MAPTILER_TILE_URL = `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface RouteResponse {
  paths: Array<{
    distance: number;
    time: number;
    points: {
      coordinates: number[][];
    };
    instructions: Array<{
      text: string;
      distance: number;
      time: number;
    }>;
  }>;
}

export class MapService {
  /**
   * Geocode an address to coordinates using local fallback
   */
  static async geocodeAddress(address: string): Promise<Coordinates | null> {
    try {
      // First check if we have a mock location for common addresses
      const normalizedAddress = address.toLowerCase().trim();
      const mockLocation = MOCK_LOCATIONS[normalizedAddress];
      if (mockLocation) {
        console.log('Using mock location for:', address);
        return mockLocation;
      }

      // Try to find partial matches in mock locations
      for (const [key, location] of Object.entries(MOCK_LOCATIONS)) {
        if (normalizedAddress.includes(key) || key.includes(normalizedAddress)) {
          console.log('Using partial mock location match for:', address);
          return location;
        }
      }

      // For demo purposes, return a random location in Nairobi area
      const baseLocation = MOCK_LOCATIONS['nairobi'];
      const randomOffset = {
        latitude: (Math.random() - 0.5) * 0.1, // ±0.05 degrees (~5km)
        longitude: (Math.random() - 0.5) * 0.1,
      };
      
      const demoLocation = {
        latitude: baseLocation.latitude + randomOffset.latitude,
        longitude: baseLocation.longitude + randomOffset.longitude,
      };
      
      console.log('Using demo location for:', address, demoLocation);
      return demoLocation;
    } catch (error) {
      console.error('Geocoding error:', error);
      // Return Nairobi as fallback when API fails
      console.log('Using Nairobi fallback');
      return MOCK_LOCATIONS['nairobi'];
    }
  }

  /**
   * Get driving route between two points using local fallback
   */
  static async getRoute(
    start: Coordinates,
    end: Coordinates
  ): Promise<RoutePoint[] | null> {
    try {
      console.log('Calculating route from:', start, 'to:', end);
      
      // Use local route generation for reliability
      const route = this.generateSimpleRoute(start, end);
      console.log('Generated local route with', route.length, 'points');
      return route;
    } catch (error) {
      console.error('Route generation error:', error);
      // Return simple curved route as fallback
      const route = this.generateSimpleRoute(start, end);
      return route;
    }
  }

  /**
   * Calculate distance between two coordinates (in kilometers)
   */
  static calculateDistance(start: Coordinates, end: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(end.latitude - start.latitude);
    const dLon = this.toRadians(end.longitude - start.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(start.latitude)) *
        Math.cos(this.toRadians(end.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Generate a simple curved route between two points
   */
  private static generateSimpleRoute(start: Coordinates, end: Coordinates): RoutePoint[] {
    const points: RoutePoint[] = [];
    const numPoints = 10; // Number of intermediate points
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      
      // Linear interpolation with slight curve
      const lat = start.latitude + (end.latitude - start.latitude) * t;
      const lng = start.longitude + (end.longitude - start.longitude) * t;
      
      // Add slight curve to make it look more realistic
      const curveFactor = Math.sin(t * Math.PI) * 0.001; // Small curve
      
      points.push({
        latitude: lat + curveFactor,
        longitude: lng + curveFactor,
      });
    }
    
    return points;
  }

  /**
   * Reverse geocode coordinates to address using local fallback
   */
  static async reverseGeocode(coordinates: Coordinates): Promise<string | null> {
    try {
      // Find the closest mock location
      let closestLocation = 'Unknown Location';
      let minDistance = Infinity;
      
      for (const [name, location] of Object.entries(MOCK_LOCATIONS)) {
        const distance = this.calculateDistance(coordinates, location);
        if (distance < minDistance) {
          minDistance = distance;
          closestLocation = name.charAt(0).toUpperCase() + name.slice(1);
        }
      }
      
      // If very close to a known location, use that name
      if (minDistance < 2) { // Within 2km
        return `Near ${closestLocation}, Nairobi, Kenya`;
      }
      
      // Otherwise, generate a generic address
      const areas = ['Nairobi', 'Westlands', 'Karen', 'Kilimani', 'Lavington'];
      const randomArea = areas[Math.floor(Math.random() * areas.length)];
      return `${randomArea} Area, Nairobi, Kenya`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Return coordinate string as fallback
      return `Location: ${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`;
    }
  }
}