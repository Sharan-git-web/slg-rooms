const supabase = require('../config/supabase');
const { ROOMS, AC_ROOMS } = require('../config/rooms');

exports.getRoomAvailability = async (req, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .neq('status', 'deleted')
      .order('check_in', { ascending: false });

    if (error) throw error;

    const now = new Date();
    
    // Map of the latest active booking per room
    const activeBookings = {};
    bookings.forEach(b => {
      const checkIn = new Date(b.check_in);
      const checkOut = b.check_out ? new Date(b.check_out) : null;
      
      if (checkIn <= now && (!checkOut || checkOut >= now)) {
        if (!activeBookings[b.room_number]) {
          activeBookings[b.room_number] = b;
        }
      }
    });

    const roomsData = ROOMS.map(num => {
      const activeBooking = activeBookings[num];
      
      if (activeBooking) {
        // Find if checkout is within 2 hours
        let status = 'Occupied';
        if (activeBooking.check_out) {
          const checkOutTime = new Date(activeBooking.check_out);
          const hoursUntilCheckout = (checkOutTime - now) / (1000 * 60 * 60);
          if (hoursUntilCheckout > 0 && hoursUntilCheckout <= 2) {
            status = 'Checkout Soon';
          }
        }
        
        return {
          number: num.toString(),
          type: AC_ROOMS.includes(num) ? 'Standard AC' : 'Non-AC Room',
          status: status,
          checkIn: new Date(activeBooking.check_in).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          checkOut: activeBooking.check_out ? new Date(activeBooking.check_out).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Pending',
          members: `${activeBooking.members} Members`,
          isReady: false,
          showAssign: false,
          bookingId: activeBooking.id
        };
      } else {
        return {
          number: num.toString(),
          type: AC_ROOMS.includes(num) ? 'Standard AC' : 'Non-AC Room',
          status: 'Available',
          checkIn: null,
          checkOut: null,
          members: 'Vacant',
          isReady: true,
          showAssign: true
        };
      }
    });

    res.status(200).json({ rooms: roomsData });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room availability', error: error.message });
  }
};
