import {
  filterCyclingActivities,
  filterActivitiesByDateRange,
  aggregateCyclingStats,
  getStatsForPeriod,
  getLastWeekStats,
  getLast30DaysStats,
  getLast60DaysStats
} from '../statsAggregator.js';
import type { Activity } from '../../types/index.js';

describe('Stats Aggregator', () => {
  const mockActivities: Activity[] = [
    {
      id: 1,
      type: 'Ride',
      sport_type: 'Road Bike',
      start_date: '2024-01-15T10:00:00Z',
      distance: 10000,
      total_elevation_gain: 100,
      moving_time: 1800,
      name: 'Morning Ride'
    },
    {
      id: 2,
      type: 'Run',
      sport_type: 'Run',
      start_date: '2024-01-16T08:00:00Z',
      distance: 5000,
      total_elevation_gain: 50,
      moving_time: 1200,
      name: 'Morning Run'
    },
    {
      id: 3,
      type: 'Ride',
      sport_type: 'Mountain Bike',
      start_date: '2024-01-17T14:00:00Z',
      distance: 15000,
      total_elevation_gain: 300,
      moving_time: 2400,
      name: 'Trail Ride'
    },
    {
      id: 4,
      type: 'Workout',
      sport_type: 'Electric Bike',
      start_date: '2024-01-18T10:00:00Z',
      distance: 8000,
      total_elevation_gain: 80,
      moving_time: 1500,
      name: 'E-bike Commute'
    }
  ];

  describe('filterCyclingActivities', () => {
    it('filters activities by type "Ride"', () => {
      const result = filterCyclingActivities(mockActivities);

      expect(result).toHaveLength(3); // Includes "Electric Bike" sport_type
      expect(result[0].type).toBe('Ride');
      expect(result[1].type).toBe('Ride');
      expect(result[2].sport_type).toContain('Bike');
    });

    it('filters activities by sport_type containing "Bike"', () => {
      const result = filterCyclingActivities(mockActivities);

      expect(result.some(activity => activity.sport_type.includes('Bike'))).toBe(true);
    });

    it('returns empty array for non-cycling activities', () => {
      const runActivities: Activity[] = [
        {
          id: 5,
          type: 'Run',
          sport_type: 'Run',
          start_date: '2024-01-19T08:00:00Z',
          distance: 5000,
          total_elevation_gain: 50,
          moving_time: 1200,
          name: 'Morning Run'
        }
      ];

      const result = filterCyclingActivities(runActivities);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterActivitiesByDateRange', () => {
    it('includes activities within date range', () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-16T23:59:59Z');

      const result = filterActivitiesByDateRange(mockActivities, startDate, endDate);

      expect(result).toHaveLength(2);
      expect(result.map(a => a.id)).toEqual([1, 2]);
    });

    it('excludes activities outside date range', () => {
      const startDate = new Date('2024-01-20');
      const endDate = new Date('2024-01-21');

      const result = filterActivitiesByDateRange(mockActivities, startDate, endDate);
      expect(result).toHaveLength(0);
    });

    it('includes activities on boundary dates', () => {
      const startDate = new Date('2024-01-17');
      const endDate = new Date('2024-01-17T23:59:59Z');

      const result = filterActivitiesByDateRange(mockActivities, startDate, endDate);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(3);
    });
  });

  describe('aggregateCyclingStats', () => {
    it('calculates correct totals for cycling activities', () => {
      const cyclingActivities = [mockActivities[0], mockActivities[2]]; // Rides only
      const result = aggregateCyclingStats(cyclingActivities);

      expect(result.totalDistance).toBe(25000);
      expect(result.totalRides).toBe(2);
      expect(result.totalElevationGain).toBe(400);
      expect(result.totalMovingTime).toBe(4200);
    });

    it('handles empty activities array', () => {
      const result = aggregateCyclingStats([]);

      expect(result.totalDistance).toBe(0);
      expect(result.totalRides).toBe(0);
      expect(result.totalElevationGain).toBe(0);
      expect(result.totalMovingTime).toBe(0);
    });

    it('handles activities with undefined values', () => {
      const activitiesWithUndefined: Activity[] = [
        {
          id: 6,
          type: 'Ride',
          sport_type: 'Road Bike',
          start_date: '2024-01-20T10:00:00Z',
          name: 'Incomplete Data Ride'
        }
      ];

      const result = aggregateCyclingStats(activitiesWithUndefined);

      expect(result.totalDistance).toBe(0);
      expect(result.totalRides).toBe(1);
      expect(result.totalElevationGain).toBe(0);
      expect(result.totalMovingTime).toBe(0);
    });
  });

  describe('getStatsForPeriod', () => {
    it('returns stats for activities within the specified day range', () => {
      const recentActivities: Activity[] = [
        {
          id: 7,
          type: 'Ride',
          sport_type: 'Road Bike',
          start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          distance: 12000,
          total_elevation_gain: 150,
          moving_time: 2000,
          name: 'Recent Ride'
        },
        {
          id: 8,
          type: 'Ride',
          sport_type: 'Mountain Bike',
          start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          distance: 8000,
          total_elevation_gain: 200,
          moving_time: 1500,
          name: 'Old Ride'
        }
      ];

      const result = getStatsForPeriod(recentActivities, 7);

      expect(result.totalRides).toBe(1);
      expect(result.totalDistance).toBe(12000);
      expect(result.totalElevationGain).toBe(150);
    });
  });

  describe('convenience period functions', () => {
    const testActivities: Activity[] = [
      {
        id: 9,
        type: 'Ride',
        sport_type: 'Road Bike',
        start_date: new Date().toISOString(),
        distance: 10000,
        total_elevation_gain: 100,
        moving_time: 1800,
        name: 'Today Ride'
      }
    ];

    it('getLastWeekStats returns stats for 7 days', () => {
      const result = getLastWeekStats(testActivities);

      expect(result.totalRides).toBe(1);
      expect(result.totalDistance).toBe(10000);
    });

    it('getLast30DaysStats returns stats for 30 days', () => {
      const result = getLast30DaysStats(testActivities);

      expect(result.totalRides).toBe(1);
      expect(result.totalDistance).toBe(10000);
    });

    it('getLast60DaysStats returns stats for 60 days', () => {
      const result = getLast60DaysStats(testActivities);

      expect(result.totalRides).toBe(1);
      expect(result.totalDistance).toBe(10000);
    });
  });
});