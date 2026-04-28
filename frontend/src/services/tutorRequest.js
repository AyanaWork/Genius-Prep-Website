import api from './api';

class TutorRequestService {
  // PUBLIC submission — no auth needed.
  async create(payload) {
    const response = await api.post('/tutor-requests', payload);
    return response.data;
  }

  // ADMIN list / read / update — auth header is added by the api interceptor.
  async adminList(status) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    const response = await api.get(`/admin/tutor-requests${qs}`);
    return response.data;
  }
  async adminGet(id) {
    const response = await api.get(`/admin/tutor-requests/${id}`);
    return response.data;
  }
  async adminUpdate(id, patch) {
    const response = await api.patch(`/admin/tutor-requests/${id}`, patch);
    return response.data;
  }
  async adminShortlist(id) {
    const response = await api.get(`/admin/tutor-requests/${id}/shortlist`);
    return response.data;
  }
}

export default new TutorRequestService();
