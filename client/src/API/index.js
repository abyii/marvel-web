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
export const updateProfile = async (id, newProfile)=>API.post(`/update/profile/${id}`, newProfile);
export const createPost = async (formData, formType) => API.post(`/create/${formType}`,formData);
export const getSubmissions = async (tab,page) => API.get(`/get/submissions/${tab}?page=${page}`);
export const getPost = async (type, id, scope) => API.get(`/get/${type}/${id}?scope=${scope || 'none'}`);
export const editPost = async (formData, id, type)=> API.post(`/update/${type}/${id}`, formData);
export const getToReview = async (tab, page, courseFilter)=> API.get(`/get/toreview/${tab}?page=${page}&crsfltr=${courseFilter || 'none'}`);
export const submitFeedback = async (fb, id, type)=> API.post(`/action/feedback/${type}/${id}`,fb);

