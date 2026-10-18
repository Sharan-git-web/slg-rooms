import api from './api';

export const revenueService = {
  getDailyRevenue: async () => {
    const response = await api.get('/revenue/daily');
    return response.data;
  },
  
  getWeeklyRevenue: async () => {
    const response = await api.get('/revenue/weekly');
    return response.data;
  },
  
  getMonthlyRevenue: async () => {
    const response = await api.get('/revenue/monthly');
    return response.data;
  },

  getTrends: async (timeframe = '7days') => {
    const response = await api.get(`/revenue/trends?timeframe=${timeframe}`);
    return response.data;
  },

  getDailyWithDate: async (date = '') => {
    const url = date ? `/revenue/daily?date=${date}` : '/revenue/daily';
    const response = await api.get(url);
    return response.data;
  },
  
  getRevenueDashboard: async (timeframe = '7days', selectedDate = '') => {
    try {
      let dailyUrl = '/revenue/daily';
      if (selectedDate) dailyUrl += `?date=${selectedDate}`;
      
      const [daily, weekly, monthly, trends, sources] = await Promise.all([
        api.get(dailyUrl),
        api.get('/revenue/weekly'),
        api.get('/revenue/monthly'),
        api.get(`/revenue/trends?timeframe=${timeframe}`),
        api.get('/revenue/sources')
      ]);
      
      return {
        daily: daily.data.revenue || 0,
        dailyBookings: daily.data.bookingsCount || 0,
        weekly: weekly.data.revenue || 0,
        weeklyBookings: weekly.data.bookingsCount || 0,
        monthly: monthly.data.revenue || 0,
        trends: trends.data.trends || [],
        sources: sources.data.sources || []
      };
    } catch (error) {
      return null;
    }
  }
};
