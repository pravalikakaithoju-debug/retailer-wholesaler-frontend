import axios from 'axios';

const API = axios.create({
    baseURL: 'https://retailer-wholesaler-chat.onrender.com/api/'
});

API.interceptors.request.use(
    (config) => {

        const token =
    sessionStorage.getItem(
        'access'
    );

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    }
);

export default API;