import api from './api';

class ProfileService {
  // Tutor profile methods
  async createTutorProfile(profileData) {
    const response = await api.post('/tutors/profile', profileData);
    return response.data;
  }

  async getTutorProfile() {
    const response = await api.get('/tutors/profile');
    return response.data;
  }

  async updateTutorProfile(profileData) {
    const response = await api.post('/tutors/profile', profileData);
    return response.data;
  }

  async toggleAvailability() {
    const response = await api.patch('/tutors/availability');
    return response.data;
  }

  // List tutors with filters + pagination + sort.
  // Returns { tutors, count, total, page, limit, totalPages }
  async getAllTutors(filters = {}) {
    // Drop empty values so we don't ship `subject=` to the API.
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    );
    const params = new URLSearchParams(cleaned).toString();
    const response = await api.get(`/tutors/all?${params}`);
    return response.data;
  }

  // Free-text search (used by the search bar / autocomplete).
  async searchTutors(q) {
    const response = await api.get(`/tutors/search?q=${encodeURIComponent(q)}`);
    return response.data;
  }

  // Distinct module codes across all approved tutors. Cached in-memory
  // by the BrowseTutors page after first load.
  async getModuleCodes() {
    const response = await api.get('/tutors/module-codes');
    return response.data;
  }

  async getTutorById(id) {
    const response = await api.get(`/tutors/${id}`);
    return response.data;
  }

  // Student profile methods
  async createStudentProfile(profileData) {
    const response = await api.post('/students/profile', profileData);
    return response.data;
  }

  async getStudentProfile() {
    const response = await api.get('/students/profile');
    return response.data;
  }

  async updateStudentProfile(profileData) {
    const response = await api.post('/students/profile', profileData);
    return response.data;
  }

  // Image upload
  async uploadImage(imageData) {
    if (imageData instanceof File) {
      const formData = new FormData();
      formData.append('image', imageData);
      const response = await api.post('/upload/image', formData, {});
      return response.data;
    } else {
      const response = await api.post('/upload/image', { image: imageData });
      return response.data;
    }
  }
}

export default new ProfileService();
