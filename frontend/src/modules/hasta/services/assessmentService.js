import api from '../../../shared/services/api';

export const createAssessment = async (assessmentData) => {
    const response = await api.post('/hasta/assessment', assessmentData);
    return response.data;
};

export const getAssessments = async () => {
    const response = await api.get('/hasta/assessments');
    return response.data;
};

export const getAssessment = async (id) => {
    const response = await api.get(`/hasta/assessment/${id}`);
    return response.data;
};
