const supabase = require('../config/supabase');
const { ROOMS } = require('../config/rooms');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .neq('status', 'deleted');

    if (error) throw error;

    let occupied = 0;
    let checkIns = 0;
    let revenue = 0;
    const now = new Date();

    const TOTAL_ROOMS = ROOMS.length;

    bookings.forEach(booking => {
      // Check-ins today
      if (new Date(booking.check_in) >= today) {
        checkIns++;
      }

      // Revenue today
      if (new Date(booking.created_at) >= today) {
        revenue += parseFloat(booking.cost || 0);
      }

      // Occupied
      // A room is occupied if current time is between check_in and check_out
      // or if check_out is null (meaning they haven't checked out yet)
      const checkInTime = new Date(booking.check_in);
      const checkOutTime = booking.check_out ? new Date(booking.check_out) : null;
      
      if (checkInTime <= now && (!checkOutTime || checkOutTime >= now)) {
        occupied++;
      }
    });

    const available = TOTAL_ROOMS - occupied;

    res.status(200).json({
      occupied,
      available,
      checkIns,
      revenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};
