import * as API from '../API/index.js';

export const getRsaFeedByCourse = (courseCode, page, title) => async (dispatch) => {
    dispatch({type : 'START_FEED_LOADING'});
    try {
        const {data} = await API.getRsaFeedByCourse(courseCode, page, title);
        if(data?.status==='200'){
            dispatch({type: 'GET_FEED', payload: { feed: data?.feed, total:data?.total}});
        }else {alert("Something went wrong while getting resourse articles. :(")};
    } catch (error) {alert("Something went wrong while getting resourse articles. :(");}
    dispatch({type: 'END_FEED_LOADING'});
}

export const getProfileFeed = (id, tab, page, title) => async (dispatch) => {
    dispatch({type:'START_FEED_LOADING'});
    try {
        const {data} = await API.getProfileFeed(id, tab, page, title);
        if(data?.status==='200'){
            dispatch({type: 'GET_FEED', payload: {feed : data?.feed, total: data?.total}});
        }else{alert("Something went wrong while searching.");}
    } catch (error) {alert("Something went wrong while getting feed :(");}
    dispatch({type:'END_FEED_LOADING'});
}

export const getSearchFeed = (type, domain, title, courseCode, authorName, tags, page)=>async(dispatch)=>{
    dispatch({type:'START_FEED_LOADING'});
    try {
        const {data} = await API.getSearchFeed(type, domain, title, courseCode, authorName, tags, page);
        if(data?.status==='200'){
            dispatch({type:'GET_FEED', payload: {feed: data?.feed, total: data?.total}});
        }else{alert("Something went wrong while searching.");}
    } catch (error) {console.log(error); alert("Something went wrong while searching."); }
    dispatch({type:'END_FEED_LOADING'});
}