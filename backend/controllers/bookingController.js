const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const { ROOMS } = require('../config/rooms');

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

// aadhaar_image is stored as a private-bucket file path. Resolve it to a
// short-lived signed URL on the way out so the raw path is never public.
// Also handles legacy rows that still hold a full public URL from before
// the bucket was made private.
async function resolveAadhaarImage(booking) {
  if (!booking?.aadhaar_image) return booking;

  const path = booking.aadhaar_image.includes('/aadhaar-images/')
    ? booking.aadhaar_image.split('/aadhaar-images/').pop()
    : booking.aadhaar_image;

  const { data, error } = await supabase
    .storage
    .from('aadhaar-images')
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  return { ...booking, aadhaar_image: error ? null : data.signedUrl };
}

exports.createBooking = async (req, res) => {
  try {
    const { room_number, members, check_in, check_out, cost, aadhaar_number, guest_name, phone_number } = req.body;

    // Validation
    if (!room_number || !members || !check_in || !check_out || !cost || !aadhaar_number || !guest_name || !phone_number) {
      return res.status(400).json({ message: 'Missing required fields. All fields are required.' });
    }

    const roomNumberInt = parseInt(room_number);
    if (!ROOMS.includes(roomNumberInt)) {
      return res.status(400).json({ message: `Invalid room number. Valid rooms are: ${ROOMS.join(', ')}` });
    }

    if (new Date(check_in) >= new Date(check_out)) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
    }

    // Prevent double-booking: reject if the room has another active booking
    // whose stay window overlaps the requested check_in/check_out range.
    const { data: existingBookings, error: overlapError } = await supabase
      .from('bookings')
      .select('check_in, check_out')
      .eq('room_number', roomNumberInt)
      .neq('status', 'deleted');

    if (overlapError) throw overlapError;

    const newCheckIn = new Date(check_in);
    const newCheckOut = new Date(check_out);
    const hasOverlap = (existingBookings || []).some(b => {
      const existingCheckIn = new Date(b.check_in);
      const existingCheckOut = b.check_out ? new Date(b.check_out) : null;
      return existingCheckIn < newCheckOut && (!existingCheckOut || existingCheckOut > newCheckIn);
    });

    if (hasOverlap) {
      return res.status(409).json({ message: `Room ${roomNumberInt} is already booked for the selected dates.` });
    }

    let aadhaar_image = null;

    // Handle image upload to Supabase Storage if file is present
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const { data, error: uploadError } = await supabase
        .storage
        .from('aadhaar-images')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // Store the file path only; the bucket is private, so a signed URL
      // is generated on read (see resolveAadhaarImage).
      aadhaar_image = fileName;
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([{
        id: uuidv4(),
        room_number: roomNumberInt,
        members: parseInt(members),
        aadhaar_number: aadhaar_number || null,
        aadhaar_image: aadhaar_image,
        check_in: new Date(check_in).toISOString(),
        check_out: check_out ? new Date(check_out).toISOString() : null,
        cost: parseFloat(cost),
        guest_name: guest_name,
        phone_number: phone_number,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Booking created successfully', booking: await resolveAadhaarImage(booking) });
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(await Promise.all(bookings.map(resolveAadhaarImage)));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Booking not found' });
      }
      throw error;
    }

    res.status(200).json(await resolveAadhaarImage(booking));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Booking not found' });
      }
      throw error;
    }

    res.status(200).json({ message: 'Booking updated', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'deleted' })
      .eq('id', req.params.id);

    if (error) throw error;

    res.status(200).json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
};
