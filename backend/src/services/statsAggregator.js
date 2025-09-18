/**
 * Statistics aggregation service functions
 */

/**
 * Filter activities to cycling activities only
 */
export const filterCyclingActivities = (activities) => {
  console.log(`Filtering ${activities.length} activities for cycling activities`);

  const cyclingActivities = activities.filter(activity =>
    activity.type === 'Ride' ||
    activity.sport_type.includes('Bike') ||
    activity.sport_type.includes('Ride')
  );

  console.log(`Found ${cyclingActivities.length} cycling activities`);
  return cyclingActivities;
};

/**
 * Filter activities within a date range
 * Single responsibility: just date filtering
 */
export const filterActivitiesByDateRange = (
  activities,
  startDate,
  endDate
) => {
  console.log(`Filtering activities from ${startDate.toISOString()} to ${endDate.toISOString()}`);

  const filtered = activities.filter(activity => {
    const activityDate = new Date(activity.start_date);
    return activityDate >= startDate && activityDate <= endDate;
  });

  console.log(`Found ${filtered.length} activities in date range`);
  return filtered;
};

/**
 * Aggregate cycling statistics from activities
 * Single responsibility: just calculate totals
 */
export const aggregateCyclingStats = (activities) => {
  console.log(`Aggregating stats from ${activities.length} activities`);

  const stats = activities.reduce((totals, activity) => ({
    totalDistance: totals.totalDistance + (activity.distance || 0),
    totalRides: totals.totalRides + 1,
    totalElevationGain: totals.totalElevationGain + (activity.total_elevation_gain || 0),
    totalMovingTime: totals.totalMovingTime + (activity.moving_time || 0)
  }), {
    totalDistance: 0,
    totalRides: 0,
    totalElevationGain: 0,
    totalMovingTime: 0
  });

  console.log('Stats aggregated:', {
    rides: stats.totalRides,
    distance: `${(stats.totalDistance / 1000).toFixed(1)}km`,
    elevation: `${stats.totalElevationGain}m`
  });

  return stats;
};

/**
 * Get stats for a specific time period
 */
export const getStatsForPeriod = (activities, days) => {
  console.log(`Getting last ${days} days cycling stats`);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const today = new Date();

  const cyclingActivities = filterCyclingActivities(activities);
  const recentActivities = filterActivitiesByDateRange(cyclingActivities, startDate, today);

  return aggregateCyclingStats(recentActivities);
};

/**
 * Get stats for last 7 days
 */
export const getLastWeekStats = (activities) => {
  return getStatsForPeriod(activities, 7);
};

/**
 * Get stats for last 30 days
 */
export const getLast30DaysStats = (activities) => {
  return getStatsForPeriod(activities, 30);
};

/**
 * Get stats for last 60 days
 */
export const getLast60DaysStats = (activities) => {
  return getStatsForPeriod(activities, 60);
};