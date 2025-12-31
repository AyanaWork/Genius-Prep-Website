import api from './api';

class ReviewService {
  // Create a new review
  async createReview(reviewData) {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  }

  // Get all reviews for a tutor (public)
  async getTutorReviews(tutorId) {
    const response = await api.get(`/reviews/tutor/${tutorId}`);
    return response.data;
  }

  // Get current user's reviews
  async getMyReviews() {
    const response = await api.get('/reviews/my-reviews');
    return response.data;
  }

  // Update a review
  async updateReview(reviewId, reviewData) {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  }

  // Delete a review
  async deleteReview(reviewId) {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }

  // Check if user can review a tutor
  async canReview(tutorId) {
    const response = await api.get(`/reviews/can-review/${tutorId}`);
    return response.data;
  }
}

export default new ReviewService();