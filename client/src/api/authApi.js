import API from './axios';

export const register = async (userData) => {
    const res = await API.post('/auth/register', {
        fullname: userData.fullname,
        email: userData.email,
        password: userData.password
    });
    return res.data;
};

export const login = async (credentials) => {
    const res = await API.post('/auth/login', credentials);
    return res.data;
};

export const logout = async () => {
    const res = await API.post('/auth/logout');
    return res.data;
};

export const getUser = async (userId) => {
    const res = await API.get(`/auth/users/${userId}`);
    return res.data;
};

export const updateUser = async (userId, data) => {
    const res = await API.patch(`/auth/users/${userId}`, data);
    return res.data;
};

export const deleteUser = async (userId) => {
    const res = await API.delete(`/auth/users/${userId}`);
    return res.data;
};
