import api from './api';

class AdminService {
  // List users — optional role filter (student | tutor | admin)
  async listUsers(role) {
    const qs = role ? `?role=${encodeURIComponent(role)}` : '';
    const res = await api.get(`/admin/users${qs}`);
    return res.data;
  }

  // Suspend / reactivate a user (toggle is_active)
  async setUserActive(userId, isActive) {
    const res = await api.patch(`/admin/users/${userId}/active`, { isActive });
    return res.data;
  }

  // Permanently delete a user (CASCADE removes profile + bookings)
  async deleteUser(userId) {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  }
}

export default new AdminService();
