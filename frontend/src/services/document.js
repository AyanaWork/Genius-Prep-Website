import api from './api';

class DocumentService {
  // Status — tells the UI whether to render the locked or browse view.
  async getMyStatus() {
    const res = await api.get('/documents/status');
    return res.data;
  }

  // List approved documents (gated server-side).
  async list(filters = {}) {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    );
    const params = new URLSearchParams(cleaned).toString();
    const res = await api.get(`/documents?${params}`);
    return res.data;
  }

  async getOne(id) {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  }

  async listMyUploads() {
    const res = await api.get('/documents/my-uploads');
    return res.data;
  }

  async getModuleCodes() {
    const res = await api.get('/documents/module-codes');
    return res.data;
  }

  // Upload a file with metadata. Pass a File object plus the form fields.
  async upload({ file, docType, subject, moduleCode, institution, year, semester, title, description }) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('docType', docType);
    if (subject) fd.append('subject', subject);
    if (moduleCode) fd.append('moduleCode', moduleCode);
    if (institution) fd.append('institution', institution);
    if (year) fd.append('year', year);
    if (semester) fd.append('semester', semester);
    fd.append('title', title);
    if (description) fd.append('description', description);
    const res = await api.post('/documents', fd);
    return res.data;
  }

  // ---- Admin moderation ----
  async adminList(status = 'pending') {
    const res = await api.get(`/documents/admin/list?status=${encodeURIComponent(status)}`);
    return res.data;
  }
  async adminApprove(id) {
    const res = await api.post(`/documents/admin/${id}/approve`);
    return res.data;
  }
  async adminReject(id, reason) {
    const res = await api.post(`/documents/admin/${id}/reject`, { reason });
    return res.data;
  }
  async adminDelete(id) {
    const res = await api.delete(`/documents/admin/${id}`);
    return res.data;
  }
}

export default new DocumentService();
