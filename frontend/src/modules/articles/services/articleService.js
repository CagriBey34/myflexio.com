import api from '../../../shared/services/api';

export const getPublicArticles = async (params) => {
    const response = await api.get('/articles', { params });
    return response.data;
};

export const getArticleDetail = async (id) => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
};
