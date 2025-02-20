//API tests for doctor endpoints
import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { createTestApp } from '../setup';

const app = createTestApp();
const request = supertest(app);

describe('Doctor API Tests', () => {
  // Test location-based doctor search
  it('should fetch doctors with distances when coordinates provided', async () => {
    const response = await request
      .get('/api/doctors')
      .query({
        lat: '19.0760',
        lng: '72.8777'
      });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('distance');
      expect(typeof response.body[0].distance).toBe('number');
    }
  });

  // Test specialty filtering
  it('should filter doctors by specialty', async () => {
    const specialty = 'Cardiologist';
    const response = await request
      .get('/api/doctors')
      .query({ specialty });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    response.body.forEach((doctor: any) => {
      expect(doctor.specialty).toBe(specialty);
    });
  });
});