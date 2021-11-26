import { Paper, Typography, Tab, Tabs, Skeleton, Card, Chip, Button } from "@mui/material";
import { useEffect, useState } from "react";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import {getToReview} from '../../actions/dashboard.js';

const DbToReview = () => {
    const dispatch = useDispatch();
    const { toReview, isToReviewLoading } = useSelector(state => state.dashboard);
    const {authUser} = useSelector(state => state.auth);
    const [tab, setTab] = useState('pr');
    const [page, setPage] = useState(1);
    const [courseFilter, setCourseFilter] = useState([]);

    useEffect(() => {
        dispatch(getToReview(tab, page, courseFilter));
    }, [tab, page, courseFilter]);
    
    return (
        <div>
        <Paper variant="widget" height="420px">
            <Typography variant="widget-heading">review</Typography>
            <br/><br/>
            <Tabs variant='fullWidth' textColor='inherit' value={tab} onChange={(e, value)=>(setTab(value))}>
            <Tab label="Project reports" value='pr'/>
            <Tab label="Blog posts" value='blog'/>
            </Tabs>
            <br/>
            {isToReviewLoading ? 
            <div>
                <Skeleton variant='rectangular' height='100px' animation='wave' style={{borderRadius: '8px'}}/><br/>
                <Skeleton variant='rectangular' height='100px' animation='wave' style={{borderRadius: '8px'}}/><br/>
                <Skeleton variant='rectangular' height='100px' animation='wave' style={{borderRadius: '8px'}}/><br/>
            </div> 
            : 
            <div>
            { !toReview?.posts.length ? 
            <Typography variant='caption' >
                There are submissions to Review for now!
            </Typography>
            :
            <div style={{display:'grid', gridTemplateColumns:'1fr',gap:'15px'}}>
            {toReview?.posts?.map((sub)=>(
                <div key={sub?.slug}> 
                <Card variant='outlined'>
                    <Typography variant='body1'>{sub?.title}</Typography>
                    <br/>
                    <Typography style={{color:'#c4c4c4'}} variant='caption'>
                        <span>{sub?.authorName}</span>
                        &nbsp;&nbsp; &#8226; &nbsp;&nbsp;
                        {tab==='pr'&& <span>{`Lv ${sub?.level}`}&nbsp;&nbsp; &#8226; &nbsp;&nbsp;</span>}
                        <span>{moment(sub?.updatedAt).fromNow()}</span>
                    </Typography>
                    <br/><br/>
                    <span style={{display:'flex',justifyContent:'space-between'}}>
                    {(tab==='pr') ?
                    <Chip label={sub?.courseCode} color='primary' variant='outlined' size='small'/> :
                    <div></div>
                    }
                    <div>
                    <Button variant='text' color='secondary' size='small' 
                    onClick={()=>{dispatch({type:'SET_VIEW_ID',payload:{id: sub?.slug, type: tab.toUpperCase(), scope:'INS'}});dispatch({type:'OPEN_VIEW'});}}>
                        view
                    </Button>&nbsp;&nbsp;
                    <Button variant='text' color='secondary' size='small' 
                    onClick={()=>{dispatch({type:'SET_EDIT_ID',payload:{id: sub?.slug, type: tab.toUpperCase(), scope:'INS'}});dispatch({type:'OPEN_EDIT'})}}
                    >
                        edit
                    </Button>
                    </div>
                    </span>
                </Card> <br/> 
                </div>
            ))}
            </div>}
            </div>
            }
            
        </Paper>
        </div>
    )
}

export default DbToReview;