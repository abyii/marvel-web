import { Typography, Paper, Divider, Avatar,CardActions, Chip, IconButton, AppBar, Toolbar, Tabs, Tab, Button, CircularProgress, Card, TextField, Skeleton, Pagination, CardMedia, CardContent, CardActionArea } from "@mui/material";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getProfileData } from "../../actions/dashboard.js";
import {getProfileFeed} from "../../actions/other.js"
import { Box } from "@mui/system";
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import ShareIcon from '@mui/icons-material/Share';
import SearchIcon from '@mui/icons-material/Search';
import moment from 'moment';

const ProfilePage = () => {
    const location = useLocation();
    const query = new URLSearchParams(location?.search);
    const {id} = useParams();
    const dispatch = useDispatch();
    const {authUser} = useSelector(state => state.auth);
    const {overview, isOverviewLoading,feed, isFeedLoading, totalFeedPages} = useSelector(state => state.other);
    const [tab, setTab] = useState(['#pr','#blog','#cert','#rsa'].includes(location?.hash) ? location?.hash?.slice(1) : 'blog');
    const [page, setPage] = useState(query.get('page')||1);
    const [searchTitle, setSearchTitle] = useState("");
    const [titleField, setTitleField] = useState("");

    useEffect(() => {
        dispatch(getProfileData(id, 'page'));
        return ()=>{
            dispatch({type:'CLEAR_OVERVIEW'});
        }
    }, [id])

    useEffect(()=>{
        dispatch(getProfileFeed(id, tab, page, searchTitle));
        return ()=>{
            dispatch({type:'CLEAR_FEED'});
        }
    }, [id, tab, page, searchTitle]);

    const handleShare = (slug) => {
        try {
        if(!slug){
            navigator.clipboard.writeText(window.location.href);
            alert("Profile Link copied to clipboard successfully.!");
        }else{
            navigator.clipboard.writeText(`${window.location.origin}/${tab}/${slug}`);
            alert("Link copied to clipboard!")
        }
        } catch (error) {
            alert("Coud'nt copy link to clipboard :(");
        }
    }

    return (
    //entire screen
    <Paper square elevation={0} sx={{display:'flex',justifyContent:'center', width:'100vw',backgroundColor:'#121212',minHeight:'100vh'}}>
    <Navbar/>
    {/* ENTIRE WEBSITE */}
    <div style={{maxWidth:'1300px',width:'100%'}}>
        <Paper square elevation={0} sx={{backgroundColor: '#2B0F12', padding:'85px 20px 20px 20px', minHeight:'300px',
        display:'flex',maxHeight:'350px',maxWidth:'1300px',width:'100%', justifyContent:'center',alignItems:'center'}}>
        {isOverviewLoading ? 
        <Skeleton animation='wave' sx={{width:'100%', maxWidth:'400px', borderRadius:'12px', height:'250px',margin:'0px 20px 0px 0px'}}/> :
        <Box maxWidth='400px' padding='0px 20px 0px 0px' display='grid' gridTemplateColumns='1fr 4fr' gap='10px' width='100%' position='relative'> 
        <IconButton onClick={()=>handleShare('')} sx={{position:'absolute',right:'20px'}} ><ShareIcon/></IconButton>
        <Avatar src={overview?.profilePic} sx={{width: '60px', height:'60px'}}/> 
        <div>
            <Typography variant="h6">{overview?.name}</Typography> 
            {overview?.currentRole==='STU' ? 
            <>
            <Typography variant='caption' sx={{color: 'primary.light'}}>STUDENT</Typography>
            <br/><br/><Divider/><br/>
            <Chip label={overview?.currentStuCourse} variant="outlined" color='secondary' size='small' clickable/>
            </>
            : overview?.currentRole==='INS' ? 
            <>
            <Typography variant='caption' sx={{color: 'primary.light'}}>INSTRUCTOR</Typography>
            <br/><br/><Divider/><br/>
            <span>
            {overview?.currentInsCourse?.map((c)=>(
            <Link key={c} to={`/course/${c}`} style={{textDecoration:'none',  marginTop:'8px'}}>
            <Chip label={c} key={c} variant="outlined" color='secondary' size='small' clickable/>&nbsp;&nbsp;&nbsp;&nbsp;
            </Link>
            ))}
            </span>
            </>
            :<></>// nothing happens here
            }<br/><br/>
            <Divider/><br/>
        <span>
            <IconButton href={overview?.gitHub} target="_blank" rel="noopener noreferrer" disabled={overview?.gitHub!=="" ? false:true}  sx={{color:'primary.main'}}><GitHubIcon/></IconButton>&nbsp;&nbsp;
            <IconButton href={overview?.linkedIn} target="_blank" rel="noopener noreferrer" disabled={overview?.linkedIn!=="" ? false:true}  sx={{color:'primary.main'}}><LinkedInIcon/></IconButton>&nbsp;&nbsp;
            <IconButton href={overview?.website} target="_blank" rel="noopener noreferrer" disabled={overview?.website!=="" ? false:true}  sx={{color:'primary.main'}}><LanguageIcon/></IconButton>
        </span>
        </div>
        </Box >}
        <Divider orientation="vertical" flexItem sx={{justifySelf:'center'}}/>
        {isOverviewLoading ? 
        <Skeleton animation='wave' sx={{width:'100%', maxWidth:'400px', borderRadius:'12px', height:'250px',margin:'0px 0px 0px 20px'}}/> :
        <Box maxWidth='400px' padding='0px 0px 0px 20px' width='100%' >
            <div style={{padding:'20px', position:'relative',display:'flex',justifyContent: 'center'}}>
            <Typography variant="h2" lineHeight='0px' sx={{color:'secondary.light', position:'absolute', left:'0px',top:'0px',fontFamily:'Source Code Pro'}} >&ldquo;</Typography>
            <Typography variant='body2' sx={{color:'secondary.light'}}>{overview?.bio}</Typography>
            <Typography variant="h2" lineHeight='0px' sx={{color:'secondary.light', position:'absolute', right:'0px',bottom:'0px',fontFamily:'Source Code Pro'}} >&rdquo;</Typography>
            </div>
        </Box>}
        </Paper>
        <Divider/>
        <AppBar position="sticky" sx={{background:'#1a1a1a'}}>
        <Toolbar sx={{display:'flex',justifyContent:'center',alignItems:'end'}}>
            <Tabs textColor='inherit' value={tab} onChange={(e, value)=>(setTab(value))} >
            <Tab label="Blog" value='blog'/>
            <Tab label="PRs" value='pr'/>
            {authUser?.id && <Tab label="Res Articles" value='rsa'/>}
            <Tab label="Certificates" value='cert'/>
            </Tabs>  
        </Toolbar>
        </AppBar>
        <Box padding='20px 20px 60px 20px' display='flex' flexDirection='column' alignItems='center' width='100%'>
        <span style={{display:'flex'}}>
        <TextField placeholder='Search by Title' value={titleField} onChange={(e)=>(setTitleField(e.target.value))} fullWidth />&nbsp;&nbsp;&nbsp;&nbsp;
        <Button onClick={(e)=>(setSearchTitle(titleField))} variant='outlined'><SearchIcon/></Button>
        </span>
        <br/><br/>
        {isFeedLoading ? <CircularProgress/> : feed?.length===0 ? 
        <Typography variant="h6" fontWeight='600' color='#808080'>We found nothing.</Typography> :
        <Box sx={{display:'grid',gridTemplateColumns: '1fr 1fr',gap:'20px'}}>
        {feed?.map((p)=>(
        <div key={p?.slug}>
        <Card variant='outlined' sx={{width:'400px',padding:'0px',height:'max-content',position:'relative', opacity:`${["PENDING","FLAGGED"].includes(p?.reviewStatus) ? '0.4':'1'}`}}>
        {["blog","cert"].includes(tab) && 
        <>
        <IconButton onClick={()=>handleShare(p?.slug)}
        sx={{position:'absolute',top:'10px',right:'10px',color:'primary.light',backgroundColor:'rgba(0,0,0,0.5)',":hover":{backgroundColor:'rgba(0,0,0,0.5)'}}}><ShareIcon/></IconButton>
            <CardMedia
            component="img"
            height="100%" sx={{maxHeight:'150px',objectFit:'cover'}}
            image={tab==='blog'? p?.coverPhoto: p?.certImage}
            alt={p?.title}
            /></>}
            <CardContent>
               <Typography variant='h6' sx={{overflow: 'hidden',textOverflow:'ellipsis',wordWrap:'break-word',whiteSpace:'nowrap'}}>{p?.title}</Typography>
                <Typography style={{color:'#c4c4c4'}} variant='caption'>
                    <span>{p?.authorName}</span>&nbsp;&nbsp; &#8226; &nbsp;&nbsp;
                    {(tab==='pr' || tab==='rsa') && 
                    <><span>{`${tab==='pr'?'Level':''} ${p?.[tab==='pr' ? 'level' : 'courseCode']}`}</span>
                    &nbsp;&nbsp; &#8226; &nbsp;&nbsp;</>}
                    <span>{moment(p?.updatedAt).fromNow()}</span>
                </Typography>
            </CardContent>
            <CardActions sx={{paddingTop: '0px',display:'flex',justifyContent: 'flex-end', width:'100%',position:'relative'}}>
            {((tab==='pr'||tab==='blog')&&p?.reviewStatus==='PENDING'||p?.reviewStatus==='FLAGGED') &&
            <Chip label={p?.reviewStatus} color={'warning'} sx={{position:'absolute',left:'12px',bottom:'12px'}} size='small' variant='filled'/> 
            }
            {["pr","rsa"].includes(tab)&& 
            <Button variant='text' color='secondary' size='small' onClick={()=>handleShare(p?.slug)}> Share
            </Button>}&nbsp;&nbsp;
            <Link to={`/${tab}/${p?.slug}`} style={{textDecoration:'none'}}>
            <Button variant='text' color='secondary' size='small'> READ
            </Button>
            </Link>
            &nbsp;&nbsp;
            </CardActions>
        </Card>
        </div>
        ))}
        </Box>
        }
        <br/><br/>
        <Pagination count={totalFeedPages} variant="outlined" page={page} 
        color="secondary" onChange={(e, page)=>(setPage(page))}
        style={{justifySelf:'center'}}/>
        </Box>
    </div>
    </Paper>
    )
}

export default ProfilePage;