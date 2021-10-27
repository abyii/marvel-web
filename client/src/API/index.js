import axios from 'axios';

const API = axios.create({baseURL : 'http://localhost:3000/'});

API.interceptors.request.use((req) => {
    if(sessionStorage.getItem('deez')){
        req.headers.Authorization = `Bearer ${sessionStorage.getItem('deez')}`;
    }
    return req;
})

export const auth = async (token) => API.post('/auth', {token : token});
export const getCourseData = async (courseCode, scope)=> API.get(`/get/course/${courseCode}?scope=${scope}`);
export const getProfileData = async (id, scope)=>API.get(`/get/profile/${id}?scope=${scope}`);