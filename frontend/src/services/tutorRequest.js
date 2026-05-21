import api from './api';

class TutorRequestService {
  // Public submission. Sent with auth header if logged in (interceptor),
  // so the backend can attach requester_user_id.
  async create(payload) {
    const res = await api.post('/tutor-requests', payload);
    return res.data;
  }

  // Logged-in student: see your own requests (matched by user_id OR email).
  async listMine() {
    const res = await api.get('/tutor-requests/my');
    return res.data;
  }
  async getMine(id) {
    const res = await api.get(`/tutor-requests/my/${id}`);
    return res.data;
  }

  // Admin
  async adminList(status) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await api.get(`/admin/tutor-requests${qs}`);
    return res.data;
  }
  async adminGet(id) {
    const res = await api.get(`/admin/tutor-requests/${id}`);
    return res.data;
  }
  async adminUpdate(id, patch) {
    const res = await api.patch(`/admin/tutor-requests/${id}`, patch);
    return res.data;
  }
  async adminShortlist(id) {
    const res = await api.get(`/admin/tutor-requests/${id}/shortlist`);
    return res.data;
  }
}

export default new TutorRequestService();
