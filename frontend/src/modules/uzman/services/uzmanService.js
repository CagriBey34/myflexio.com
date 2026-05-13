import api from '../../../shared/services/api';

export const completeProfile = async (profileData) => {
    const response = await api.post('/uzman/profile/complete', profileData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/uzman/profile');
    return response.data;
};

export const getUzmanReviews = async (uzmanId) => {
    const response = await api.get(`/uzman/${uzmanId}/reviews`);
    return response.data;
};

export const getUzmanRandevular = async () => {
    const response = await api.get('/uzman/randevular');
    return response.data;
};
