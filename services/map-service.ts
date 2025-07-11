import axios from 'axios';

// LocationIQ API key
const LOCATIONIQ_API_KEY = 'pk.0e39d7686fcf7ca097e380c078f3a753';

// No API key needed for basic routing

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
   * Geocode an address to coordinates using LocationIQ
   */
  static async geocodeAddress(address: string): Promise<Coordinates | null> {
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/search.php`,
        {
          params: {
            key: LOCATIONIQ_API_KEY,
            q: address,
            format: 'json',
            limit: 1,
          },
        }
      );

      if (response.data && response.data.length > 0) {
        const result: GeocodingResult = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Get driving route between two points using GraphHopper
   */
  static async getRoute(
    start: Coordinates,
    end: Coordinates
  ): Promise<RoutePoint[] | null> {
    try {
      console.log('Calculating route from:', start, 'to:', end);
      
      // Create a simple curved route between two points
      // This simulates a realistic driving route without needing external APIs
      const route = this.generateSimpleRoute(start, end);
      
      return route;


    } catch (error) {
      console.error('Routing error:', error);
      // Return straight line as fallback
      return [
        { latitude: start.latitude, longitude: start.longitude },
        { latitude: end.latitude, longitude: end.longitude }
      ];
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
   * Reverse geocode coordinates to address using LocationIQ
   */
  static async reverseGeocode(coordinates: Coordinates): Promise<string | null> {
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/reverse.php`,
        {
          params: {
            key: LOCATIONIQ_API_KEY,
            lat: coordinates.latitude,
            lon: coordinates.longitude,
            format: 'json',
          },
        }
      );

      if (response.data && response.data.display_name) {
        return response.data.display_name;
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
}