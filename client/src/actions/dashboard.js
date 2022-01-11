import * as API from '../API/index.js';

export const getCourseData=(courseCode, scope, history) => async(dispatch)=>{
    dispatch({type : `START_${scope==='overview'?'OVERVIEW' : 'SYLLABUS'}_LOADING`});
    try {
        const {data} = await API.getCourseData(courseCode, scope);
        if(data?.status ==='200'){
            dispatch({type : `${scope==='overview' ? 'GET_OVERVIEW': 'GET_COURSE'}`, payload : data?.course});
        }else{
            if(scope==='dashboard'){ alert("Something went wrong at syllabus widget.");}
            else history.push('/404');
        }; 
    } catch (error) { };
    dispatch({type : `END_${scope==='overview'?'OVERVIEW' : 'SYLLABUS'}_LOADING`});
}

export const getProfileData=(id, scope, history)=>async(dispatch)=>{
    dispatch({type : `START_${scope==='page'?'OVERVIEW':'PROFILE'}_LOADING`});
    try {
        const {data} = await API.getProfileData(id,scope);
        if(data?.status==='200'){
            dispatch({type : `GET_${scope==='page'?'OVERVIEW':'PROFILE'}`, payload : data?.profile});
        }else{
            if(scope==='dashboard') alert("Something went wrong at profile widget.");
            else history?.push("/404");
        };
    } catch (error) { }
    dispatch({type : `END_${scope==='page'?'OVERVIEW':'PROFILE'}_LOADING`});
}

export const updateProfile=(id, newProfile)=>async(dispatch)=>{
    dispatch({type : 'START_PROFILE_LOADING'});
    try {
        const {data} = await API.updateProfile(id, newProfile).catch((err)=>(console.log(err)));
        if(data?.status==='201'){
            dispatch({type : 'GET_PROFILE', payload : data?.profile});
        }else{
            alert('Check your profile links and try again.');
        } 
    } catch (error) { }
    dispatch({type : 'END_PROFILE_LOADING'});
}

export const createPost = (formData, formType)=> async (dispatch) => {
    dispatch({type : 'START_CREATE_LOADING'});
    try {
        const {data} = await API.createPost(formData, formType.toLowerCase()).catch(err => console.log(err));
        if(data?.status==='201'){
            dispatch({type : `CREATE_${formType}`, payload : data?.post});
        }else{ alert('Something went wrong :(. Could not create.')};
    } catch (error) { }
    dispatch({type : 'END_CREATE_LOADING'});
    dispatch({type : 'CLOSE_FORM'})
}

export const getSubmissions = (tab, page) => async (dispatch) => {
    try {
        dispatch({type : 'START_SUB_LOADING'});
        const {data} = await API.getSubmissions(tab, page);
        if (data?.status ==='200'){
            dispatch({type : `GET_SUB_${tab?.toUpperCase()}`, payload : { subs : data?.submissions, total : data?.total}});
        }else { alert("something went wrong while getting submissions.") };
        dispatch({type : 'END_SUB_LOADING'});
    } catch (error) { }
}

export const getPost = (type, id, scope) => async (dispatch) => {
    dispatch({type:'START_VIEW_LOADING'});
    try {
        const {data} = await API.getPost(type?.toLowerCase(), id, scope?.toLowerCase());
        if(data?.status==='200'){
            dispatch({type : 'GET_VIEW_POST', payload : {...data?.post, status:200}});
        }else{
            if(scope==='page'){dispatch({type:"GET_VIEW_POST", payload: {status: 404}})}
            else{
                alert("Something went wrong while retrieving post:(");
                dispatch({type:"CLOSE_VIEW"});
            }
        };
    } catch (error) {console.log(error)}
    dispatch({type : 'END_VIEW_LOADING'});
}

export const editPost = (formData, id, type) => async (dispatch) => {
    try {
        dispatch({type:'START_CREATE_LOADING'});
        const {data} = await API.editPost(formData, id, type.toLowerCase());
        if(data?.status==='201'){
            dispatch({type:`EDIT_${type}`, payload : data?.post});
        }else{alert('Something went wrong. Could not edit :(')};
        dispatch({type : 'CLOSE_EDIT'});
        dispatch({type : 'END_CREATE_LOADING'});
    } catch (error) { }
}

export const getToReview = (tab, page, courseFilter) => async (dispatch) => {
    try {
        dispatch({type : 'START_TOREVIEW_LOADING'});
        const {data} = await API.getToReview(tab, page, courseFilter?.join(','));
        if(data?.status==='200'){
            dispatch({type : 'GET_TOREVIEW', payload : {posts : data?.posts, total : data?.total}});
        }else alert("Something went wrong at review widget.");
        dispatch({type : 'END_TOREVIEW_LOADING'});
    } catch (error) { }
}

export const submitFB = (fb, id ,type) => async (dispatch) => {
    try {
        dispatch({type:'START_CREATE_LOADING'});
        const {data} = await API.submitFeedback(fb, id ,type?.toLowerCase());
        if(data?.status==='201'){
            dispatch({type: `REVIEW`, payload: id});
        }else {alert("Something went wrong. Could not write feedback.")}
        dispatch({type : 'END_CREATE_LOADING'});
        dispatch({type: 'CLOSE_VIEW'});
    } catch (error) { }
}

export const approve = (id, type) => async (dispatch) => {
    try {
        dispatch({type : 'START_CREATE_LOADING'});
        const {data} = await API.approve(id, type?.toLowerCase());
        if(data?.status==='201'){
            dispatch({type: `REVIEW`, payload: id});
        }else {alert("Something went wrong. could not approve.")};
        dispatch({type : 'END_CREATE_LOADING'});
        dispatch({type : 'CLOSE_VIEW'});
    } catch (error) { }
}

export const toggleSub = (course, level) => async (dispatch) => {
    dispatch({type : 'START_CREATE_LOADING'});
    try {
        const {data} = await API.toggleSub(course, level);
        if(data?.status==='201'){
            dispatch({type : 'GET_COURSE', payload : data?.course});
        }else{alert("Something went wrong while changing submission status :(")};
    } catch (error) {alert("Something went wrong:(")}
    dispatch({type: 'END_CREATE_LOADING'});
}

export const deletePost = (slug, type, scope) => async (dispatch) => {
    dispatch({type:'START_CREATE_LOADING'});
    try {
        const {data} = await API.deletePost(slug, type);
        if(data?.status==='201'&&scope==='db'){
            dispatch({type:'DELETE_POST',payload:slug});
            dispatch({type:"CLOSE_VIEW"});
            alert(`Your ${type.toUpperCase()==='BLOG' ? "Blog post":type.toUpperCase()==="RSA"?"Resource Article":""} was deleted successully`);
        }else if(data?.status==="201"){
            alert(`Your ${type.toUpperCase()==='BLOG' ? "Blog post":type.toUpperCase()==="RSA"?"Resource Article":""} was deleted successully`);
            window.history.back();
        }
    } catch (error) { }
    dispatch({type:'END_CREATE_LOADING'});
}
