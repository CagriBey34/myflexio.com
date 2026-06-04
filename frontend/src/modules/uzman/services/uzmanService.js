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

export const getOwnReviews = async () => {
    const response = await api.get('/uzman/reviews');
    return response.data;
};

export const getUzmanRandevular = async () => {
    const response = await api.get('/uzman/randevular');
    return response.data;
};

export const createTedaviPlani = async (data) => {
    const response = await api.post('/uzman/tedavi-plani', data);
    return response.data;
};

export const updateIban = async (ibanNo) => {
    const response = await api.patch('/uzman/profile/iban', { ibanNo });
    return response.data;
};

export const getUzmanTedaviPlanlari = async () => {
    const response = await api.get('/uzman/tedavi-planlari');
    return response.data;
};

export const aktiveTedaviPlani = async (planId) => {
    const response = await api.patch(`/uzman/tedavi-plani/${planId}/aktifet`);
    return response.data;
};

export const uzmanSeansVer = async (randevuId) => {
    const response = await api.patch(`/uzman/randevular/${randevuId}/seans-ver`);
    return response.data;
};

export const getUzmanEslesmeler = async () => {
    const response = await api.get('/uzman/eslesmeler');
    return response.data;
};

export const getEslesmeSeanslari = async (planId) => {
    const response = await api.get(`/uzman/eslesmeler/${planId}/seanslar`);
    return response.data;
};

export const setSeansTargihi = async (seansId, tarih) => {
    const response = await api.patch(`/uzman/seanslar/${seansId}/tarih`, { tarih });
    return response.data;
};

export const uzmanSeansOnay = async (seansId) => {
    const response = await api.patch(`/uzman/seanslar/${seansId}/seans-ver`);
    return response.data;
};
