const initialState = {
    formOpen : false, formType : '',
    viewPostOpen : false, viewPostId : '', viewPostType:'', isViewLoading : false, viewPost : {}, viewPostScope:'',
    editPostOpen : false, editPostId : '', editPostType:'',isEditLoading : false,
    isSyllabusLoading : false,
    isProfileLoading : false,
    isCreateLoading : false,
    isSubLoading : false,
    syllabus : {},
    profile : {bio : '',linkedIn : '',gitHub:'',website:'',id:'',currentLevel : ''},
    submissions : {prs:[], others : [], total : 1},
    toReview : {posts : [], total : 1}, isToReviewLoading : false
}

const dashboardReducer = (state=initialState, action)=>{
    switch (action.type) {
        //editpost
        case 'OPEN_EDIT':
            return {...state, editPostOpen:true}
        case 'CLOSE_EDIT':
            return {...state, editPostOpen:false}
        case 'SET_EDIT_ID':
            return {...state, editPostId : action.payload?.id , editPostType : action.payload.type};
        case 'DELETE_POST':
            return {...state, submissions : {...state.submissions, others : state?.submissions?.others?.filter((p)=>(p?.slug!==action.payload))}, viewPost:{}, viewPostId:''}
        //viewpost
        case 'OPEN_VIEW':
            return {...state, viewPostOpen:true}
        case 'CLOSE_VIEW':
            return {...state, viewPostOpen:false}
        case 'SET_VIEW_ID':
            return {...state, viewPostId : action.payload?.id, viewPostType : action.payload?.type, viewPostScope:action.payload?.scope}
        //form
        case 'OPEN_FORM' :
            return {...state, formOpen : true}
        case 'CLOSE_FORM' :
            return {...state, formOpen : false}
        case 'SET_FORM_TYPE':
            return {...state, formType : action.payload}
        //loading
        case 'START_SYLLABUS_LOADING':
            return {...state, isSyllabusLoading : true}
        case 'END_SYLLABUS_LOADING' : 
            return {...state, isSyllabusLoading : false}
        case 'START_PROFILE_LOADING':
            return { ...state, isProfileLoading : true}
        case 'END_PROFILE_LOADING' :
            return {...state, isProfileLoading:false}
        case 'START_CREATE_LOADING' : 
            return {...state, isCreateLoading : true}
        case 'END_CREATE_LOADING' :
            return {...state, isCreateLoading : false}
        case 'START_SUB_LOADING' : 
            return {...state, isSubLoading : true}
        case 'END_SUB_LOADING' :
            return {...state, isSubLoading : false}
        case 'START_VIEW_LOADING':
            return {...state, isViewLoading : true}
        case 'END_VIEW_LOADING':
            return {...state, isViewLoading:false}
        case 'START_EDIT_LOADING':
            return {...state, isEditLoading : true}
        case 'END_EDIT_LOADING':
            return {...state, isEditLoading:false}
        case 'START_TOREVIEW_LOADING':
            return {...state, isToReviewLoading : true}
        case 'END_TOREVIEW_LOADING':
            return {...state, isToReviewLoading : false}
        //getting
        case 'GET_PROFILE':
            return {...state, profile : {...state.profile, ...action.payload}}
        case 'GET_COURSE' :
            return {...state, syllabus : action.payload}
        case 'GET_SUB_PR':
            return {...state, submissions : {...state.submissions, prs : action.payload?.subs, total : action.payload?.total}};
        case 'GET_SUB_BLOG':
        case 'GET_SUB_RSA':
            return {...state, submissions : {...state.submissions, others : action.payload?.subs, total : action.payload?.total}};
        case 'GET_VIEW_POST':
            return {...state, viewPost : action.payload}
        case 'GET_TOREVIEW':
            return {...state, toReview : {posts : action.payload?.posts, total : action.payload?.total}}
        // create or subbing
        case 'CREATE_PR' :
            return {...state, submissions : { ...state?.submissions, prs : [action.payload, ...state.submissions.prs]}};
        case 'CREATE_BLOG':
        case 'CREATE_RSA':
            return {...state, submissions : {...state?.submissions, others :  state?.submissions?.others?.length>=3 ? [action.payload, ...state.submissions.others].slice(0,-1) : [action?.payload, ...state.submissions?.others]}};
        case 'EDIT_PR' :
            return {...state, submissions : {...state?.submissions, prs : state.submissions.prs.map((k)=>(k._id===action.payload._id ? action.payload : k))}, viewPost:action.payload, viewPostId:action.payload?.slug}
        case 'EDIT_BLOG':
        case 'EDIT_RSA' : 
            return {...state, submissions : {...state?.submissions, others : state.submissions?.others?.map((k)=>(k._id===action.payload._id ? action.payload : k))}, viewPost : action?.payload, viewPostId: action?.payload?.slug}
        case 'REVIEW':
            return {...state, toReview : {...state?.toReview, posts : state.toReview?.posts?.filter((k)=>(k?.slug !== action.payload))}}
        case 'EDIT_SYLLABUS':
            return {...state, syllabus : {...state?.syllabus, levels : action.payload?.levels}};
        case "CLEAR_SYLLABUS":
            return {...state, syllabus:{}};
        default: 
            return state;
    }
}

export default dashboardReducer;