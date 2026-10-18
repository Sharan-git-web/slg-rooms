const supabase = require('../config/supabase');
const { ROOMS } = require('../config/rooms');

exports.getDashboardStats = async (req, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('room_number, check_in, check_out, cost, created_at')
      .neq('status', 'deleted');

    if (error) throw error;

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const occupiedRoomNumbers = new Set();
    let todayCheckIns = 0;
    let todayRevenue = 0;

    (bookings || []).forEach(b => {
      const checkIn = new Date(b.check_in);
      const checkOut = b.check_out ? new Date(b.check_out) : null;

      if (checkIn <= now && (!checkOut || checkOut >= now)) {
        occupiedRoomNumbers.add(b.room_number);
      }

      if (checkIn >= startOfToday && checkIn <= endOfToday) {
        todayCheckIns += 1;
      }

      const createdAt = new Date(b.created_at);
      if (createdAt >= startOfToday && createdAt <= endOfToday) {
        todayRevenue += parseFloat(b.cost || 0);
      }
    });

    const occupied = occupiedRoomNumbers.size;
    const available = Math.max(0, ROOMS.length - occupied);

    res.status(200).json({
      occupied,
      available,
      checkIns: todayCheckIns,
      revenue: todayRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};
