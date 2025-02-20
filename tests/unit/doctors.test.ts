//Unit tests for doctor-related functionality
import { describe, it, expect } from 'vitest';
import { calculateDistance } from '../../server/utils';

describe('Doctor Service Unit Tests', () => {
  // Test distance calculation between two points
  it('should calculate distance correctly between two points', () => {
    // Mumbai coordinates
    const lat1 = 19.0760;
    const lng1 = 72.8777;

    // Delhi coordinates
    const lat2 = 28.6139;
    const lng2 = 77.2090;

    const distance = calculateDistance(lat1, lng1, lat2, lng2);

    // The actual distance between Mumbai and Delhi is approximately 1,148 km
    // Allow for some floating-point variation
    expect(distance).toBeGreaterThan(1140);
    expect(distance).toBeLessThan(1160);
  });

  // Test same location distance
  it('should return zero distance for same coordinates', () => {
    const lat = 19.0760;
    const lng = 72.8777;

    const distance = calculateDistance(lat, lng, lat, lng);
    expect(distance).toBe(0);
  });
});