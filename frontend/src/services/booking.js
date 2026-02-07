import api from './api';

class BookingService {
  // Create a new booking request
  async createBooking(bookingData) {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  }

  // Get student's bookings
  async getMyBookings() {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  }

  // Get tutor's booking requests
  async getTutorBookings() {
    const response = await api.get('/bookings/tutor-bookings');
    return response.data;
  }

  // Update booking status (tutor)
  async updateBookingStatus(bookingId, status) {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status });
    return response.data;
  }

  // Cancel booking (student)
  async cancelBooking(bookingId) {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  }

  // Get single booking details
  async getBookingById(bookingId) {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  }
}

const bookingService = new BookingService();
export default bookingService;
