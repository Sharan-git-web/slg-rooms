const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const upload = require('../middleware/uploadMiddleware');

// Booking routes - upload.any() allows multiple Aadhaar card images (front and back for Person 1 & Person 2)
router.post('/', upload.any(), bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
