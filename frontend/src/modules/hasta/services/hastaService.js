/**
 * Hasta Service
 * API calls for patient profile management
 */

import api from '../../../shared/services/api';

/**
 * Complete patient profile with additional information
 * @param {Object} profileData - Profile completion data
 * @returns {Promise} API response
 */
export const completeProfile = async (profileData) => {
    const response = await api.post('/hasta/profile/complete', profileData);
    return response.data;
};

/**
 * Get patient profile
 * @returns {Promise} API response with profile data
 */
export const getProfile = async () => {
    const response = await api.get('/hasta/profile');
    return response.data;
};

/**
 * Upload medical report
 * @param {File} file - Medical report file
 * @param {Object} data - Report metadata (tip, aciklama)
 * @returns {Promise} API response
 */
export const uploadMedicalReport = async (file, data) => {
    const formData = new FormData();
    formData.append('medicalReport', file);
    formData.append('tip', data.tip);
    if (data.aciklama) {
        formData.append('aciklama', data.aciklama);
    }

    const response = await api.post('/hasta/reports', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getAssessmentRecommendations = async (assessmentId) => {
    const response = await api.get(`/hasta/assessment/${assessmentId}/recommendations`);
    return response.data;
};

/**
 * Get all medical reports
 * @returns {Promise} API response with reports list
 */
export const getMedicalReports = async () => {
    const response = await api.get('/hasta/reports');
    return response.data;
};

export const getHastaTedaviPlani = async () => {
    const response = await api.get('/hasta/tedavi-plani');
    return response.data;
};

export const uploadDekont = async (planId, file) => {
    const formData = new FormData();
    formData.append('dekont', file);
    const response = await api.post(`/hasta/tedavi-plani/${planId}/dekont`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const hastaSeansAl = async (randevuId) => {
    const response = await api.patch(`/hasta/randevu/${randevuId}/seans-al`);
    return response.data;
};

export const getHastaSeanslari = async () => {
    const response = await api.get('/hasta/seanslar');
    return response.data;
};

export const hastaSeansOnay = async (seansId) => {
    const response = await api.patch(`/hasta/seanslar/${seansId}/seans-al`);
    return response.data;
};
