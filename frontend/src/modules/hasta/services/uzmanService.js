import api from '../../../shared/services/api';

export const searchUzmanlar = async (params) => {
    const response = await api.get('/hasta/uzmanlar', { params });
    return response.data;
};

export const getUzmanProfile = async (id) => {
    const response = await api.get(`/hasta/uzman/${id}/profile`);
    return response.data;
};

export const createReview = async (reviewData) => {
    const response = await api.post('/hasta/reviews', reviewData);
    return response.data;
};

export const updateReview = async (id, reviewData) => {
    const response = await api.put(`/hasta/reviews/${id}`, reviewData);
    return response.data;
};

export const deleteReview = async (id) => {
    const response = await api.delete(`/hasta/reviews/${id}`);
    return response.data;
};
