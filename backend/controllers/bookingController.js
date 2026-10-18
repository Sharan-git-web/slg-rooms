const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const { ROOMS } = require('../config/rooms');

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

// In-memory cache for resolved signed URLs: path -> { url, expiresAt }
// Avoids repeated remote Supabase Storage calls on every request.
const signedUrlCache = new Map();

function cleanAadhaarPath(rawPath) {
  if (!rawPath) return '';
  return rawPath.includes('/aadhaar-images/')
    ? rawPath.split('/aadhaar-images/').pop()
    : rawPath;
}

async function batchResolveAadhaarImages(bookings) {
  if (!Array.isArray(bookings) || bookings.length === 0) return bookings;

  const now = Date.now();
  const pathsToFetch = new Set();

  // Find all unique uncached paths
  for (const b of bookings) {
    if (!b?.aadhaar_image) continue;
    const paths = b.aadhaar_image.split(',').map(s => s.trim()).filter(Boolean);
    for (const raw of paths) {
      const p = cleanAadhaarPath(raw);
      const cached = signedUrlCache.get(p);
      if (!cached || cached.expiresAt <= now) {
        pathsToFetch.add(p);
      }
    }
  }

  // Batch fetch any missing paths in a single call to Supabase
  if (pathsToFetch.size > 0) {
    try {
      const pathArray = Array.from(pathsToFetch);
      const { data, error } = await supabase
        .storage
        .from('aadhaar-images')
        .createSignedUrls(pathArray, SIGNED_URL_TTL_SECONDS);

      if (!error && Array.isArray(data)) {
        // Cache for 55 minutes (leaving 5 minutes safety buffer before 1-hr TTL)
        const expiresAt = now + (SIGNED_URL_TTL_SECONDS - 300) * 1000;
        for (const item of data) {
          if (item?.signedUrl) {
            signedUrlCache.set(item.path, { url: item.signedUrl, expiresAt });
          }
        }
      }
    } catch (err) {
      console.error('Batch signed URL generation failed:', err.message);
    }
  }

  // Map resolved URLs back onto bookings
  return bookings.map(b => {
    if (!b?.aadhaar_image) return b;
    const paths = b.aadhaar_image.split(',').map(s => s.trim()).filter(Boolean);
    const resolvedUrls = paths.map(raw => {
      const p = cleanAadhaarPath(raw);
      return signedUrlCache.get(p)?.url || null;
    }).filter(Boolean);

    return { ...b, aadhaar_image: resolvedUrls.length > 0 ? resolvedUrls.join(',') : null };
  });
}

async function resolveAadhaarImage(booking) {
  if (!booking) return booking;
  const [resolved] = await batchResolveAadhaarImages([booking]);
  return resolved;
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

    // Handle image uploads to Supabase Storage if files are present
    if (req.files && req.files.length > 0) {
      const uploadedFiles = [];
      for (const file of req.files) {
        const fileExt = file.originalname.split('.').pop() || 'jpg';
        let prefix = '';
        if (file.originalname.startsWith('p1_front_') || file.fieldname === 'p1_front') prefix = 'p1_front_';
        else if (file.originalname.startsWith('p1_back_') || file.fieldname === 'p1_back') prefix = 'p1_back_';
        else if (file.originalname.startsWith('p2_front_') || file.fieldname === 'p2_front') prefix = 'p2_front_';
        else if (file.originalname.startsWith('p2_back_') || file.fieldname === 'p2_back') prefix = 'p2_back_';

        const fileName = `${prefix}${uuidv4()}.${fileExt}`;
        const { error: uploadError } = await supabase
          .storage
          .from('aadhaar-images')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }
        uploadedFiles.push(fileName);
      }
      aadhaar_image = uploadedFiles.join(',');
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

    res.status(200).json(await batchResolveAadhaarImages(bookings || []));
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
