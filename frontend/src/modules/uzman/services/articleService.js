import api from '../../../shared/services/api';

export const getUzmanArticles = async (params) => {
    const response = await api.get('/uzman/articles', { params });
    return response.data;
};

export const getUzmanArticleById = async (id) => {
    const response = await api.get(`/uzman/articles/${id}`);
    return response.data;
};

export const createArticle = async (articleData) => {
    const response = await api.post('/uzman/articles', articleData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const updateArticle = async (id, articleData) => {
    const response = await api.put(`/uzman/articles/${id}`, articleData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const deleteArticle = async (id) => {
    const response = await api.delete(`/uzman/articles/${id}`);
    return response.data;
};

export const updateArticleStatus = async (id, durum) => {
    const response = await api.patch(`/uzman/articles/${id}/status`, { durum });
    return response.data;
};

// Public articles
export const getPublicArticles = async (params) => {
    const response = await api.get('/articles', { params });
    return response.data;
};

export const getArticleDetail = async (id) => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
};

export const getUzmanPublicArticles = async (uzmanId) => {
    const response = await api.get(`/articles/uzman/${uzmanId}`);
    return response.data;
};
