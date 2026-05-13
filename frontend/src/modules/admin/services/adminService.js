import api from '../../../shared/services/api';

export const getDashboardStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

export const getUzmanApplications = async (params) => {
    const response = await api.get('/admin/uzman-basvurular', { params });
    return response.data;
};

export const getUzmanApplicationDetail = async (id) => {
    const response = await api.get(`/admin/uzman-basvurular/${id}`);
    return response.data;
};

export const updateApplicationStatus = async (id, status, reason) => {
    const response = await api.patch(`/admin/uzman-basvurular/${id}`, { status, reason });
    return response.data;
};

export const getUsers = async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
};

export const updateUserStatus = async (id, status) => {
    const response = await api.patch(`/admin/users/${id}/status`, { status });
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
};

export const getRandevular = async (params) => {
    const response = await api.get('/admin/randevular', { params });
    return response.data;
};

export const updateRandevuDurum = async (id, durum, red_notu) => {
    const response = await api.patch(`/admin/randevular/${id}`, { durum, red_notu });
    return response.data;
};

export const getYorumlar = async (params) => {
    const response = await api.get('/admin/yorumlar', { params });
    return response.data;
};
export const deleteYorum = async (id) => {
    const response = await api.delete(`/admin/yorumlar/${id}`);
    return response.data;
};

export const getSorular = async () => {
    const response = await api.get('/admin/sorular');
    return response.data;
};
export const createSoru = async (data) => {
    const response = await api.post('/admin/sorular', data);
    return response.data;
};
export const updateSoru = async (id, data) => {
    const response = await api.put(`/admin/sorular/${id}`, data);
    return response.data;
};
export const deleteSoru = async (id) => {
    const response = await api.delete(`/admin/sorular/${id}`);
    return response.data;
};

export const getHastalar = async (params) => {
    const response = await api.get('/admin/hastalar', { params });
    return response.data;
};
export const getHastaDetail = async (id) => {
    const response = await api.get(`/admin/hastalar/${id}`);
    return response.data;
};
export const getAdminUzmanlar = async (params) => {
    const response = await api.get('/admin/uzmanlar-list', { params });
    return response.data;
};
export const getUzmanDetail = async (id) => {
    const response = await api.get(`/admin/uzmanlar-list/${id}`);
    return response.data;
};