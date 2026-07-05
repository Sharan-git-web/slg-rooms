import api from './api';

export const dashboardService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (e) {
      return null;
    }
  }
};
