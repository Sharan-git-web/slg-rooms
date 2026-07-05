import api from './api';

export const roomService = {
  getRoomAvailability: async () => {
    // Current backend doesn't have a specific room status endpoint fully implemented, 
    // so we mock the fetch call shape to match what a future API would look like.
    const response = await api.get('/rooms/availability');
    return response.data;
  }
};
