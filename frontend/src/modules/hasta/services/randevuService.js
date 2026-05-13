import api from '../../../shared/services/api';

export const createRandevu = async (data) => {
    const response = await api.post('/hasta/randevu', data);
    return response.data;
};

export const getHastaRandevular = async () => {
    const response = await api.get('/hasta/randevular');
    return response.data;
};

export const hastaKarar = async (id, karar) => {
    const response = await api.patch(`/hasta/randevu/${id}/karar`, { karar });
    return response.data;
};