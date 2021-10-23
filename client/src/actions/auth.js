import * as API from '../API/index.js'
import tokenRefresher from '../utils/functions/refresher.js';

export const auth = (res, history) => async (dispatch) => {
    dispatch({ type : 'START_AUTH_LOADING'});
    const {data : {status , authUser}} = await API.auth(res?.tokenId);
    if(status==='404'){
        history.push('/404');
    }else if(status==='UNKNOWN' || status==='200'){
        sessionStorage.setItem('deez', res.tokenId);
        dispatch({type : 'AUTH', payload : authUser});
        tokenRefresher(res);
    }else{
        alert('Sorry. Something went wrong :(');
    }
    dispatch({ type : 'END_AUTH_LOADING'});
}