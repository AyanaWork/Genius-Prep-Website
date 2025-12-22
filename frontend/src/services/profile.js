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

  async getAllTutors(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/tutors/all?${params}`);
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
    const response = await api.post('/upload/image', { image: imageData });
    return response.data;
  }
}

export default new ProfileService();