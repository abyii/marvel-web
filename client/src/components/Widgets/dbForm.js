import { AppBar, Toolbar, IconButton,Typography,Button, TextField, Paper, Chip, 
  CircularProgress, Dialog, Select, MenuItem, FormControl, InputLabel, Alert, Snackbar, Slide } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from "react";
import ImageUploading from 'react-images-uploading';
import ImageCompressor from 'browser-image-compression';
import Editor from "../Editor.js";
import { createPost } from "../../API/index.js";
import useHashParams from "../../utils/hooks/useHashParams.js"
import { useNavigate } from "react-router-dom";
import {useMutation, useQueryClient} from "react-query";
import useAuth from "../../utils/hooks/useAuth.js";

const DbForm = () => {
    const params = useHashParams();
    const navigate = useNavigate(); 
    const queryClient = useQueryClient();
    const {authUser} = useAuth();
    const formOpen = params?.mode==='form';
    const formType = params?.type || 'none' ;
    if((!["pr", "blog", "rsa"].includes(formType)&&formOpen) ||
      (authUser?.currentRole==="STU"&&formType==='rsa')||
      ((authUser?.currentRole==="INS"&&formType==='pr')&&formOpen)
      ){ navigate({hash:""}); }

    const [formData, setFormData] = useState({
        title : '', content : '', tags : [ ], coverPhoto : '', courseCode : ''
    });
    const [newTag, setNewTag] = useState('');
    const [editorTab, setEditorTab] = useState("write");
    const [alertInfo, setAlertInfo] = useState({open:false, message:''})

    useEffect(() => {
      setFormData({title : '', content : '', tags : [ ], coverPhoto : '', courseCode : ''});
    }, [params])
    
    const {mutate:sendCreate, isLoading:isCreateLoading} = useMutation(()=>(createPost(formData, formType)),{
      onSuccess:(response)=>{
        if(["404","403","BRUH","401"].includes(response?.status)){
          alert("Something went wrong. Could'nt create. Reason: Bad request");
        }else{
          queryClient.setQueryData([formType,response?.post?.slug],()=>({post: response?.post, status:'200'}));
          queryClient.invalidateQueries([{nature:'feed', place:'dashboard', widget:'subs', postType:formType, authUser:authUser?.id }]);
          queryClient.invalidateQueries([{nature:'feed',place:'profile', ProfileSlug:authUser?.slug, postType:formType}]);
          if(formType==='rsa'){
            queryClient.invalidateQueries([{nature:'feed', place:'course', courseCode:formData?.courseCode}]);
          }else if(formType==='pr'){
            queryClient.setQueryData(['hasSubmittedPr', {authUser:authUser?.id}], (prev)=>{
              prev.meta.hasSubmittedPr = true;
              prev.meta.reviewStatus = 'PENDING';
              return prev;
            });
          }
          navigate({hash:""});
          setAlertInfo({open:true, message:"Posted! 🚀🚀"});
        }
      },
      onError:()=>{
        alert("Could'nt post. Something went wrong on our side.");
        navigate({hash:""});
      }
    });

    const handleImageUpload = async (imageList) => {
      const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1080, useWebWorker: true };
      try {
        const compressedImage = await ImageCompressor(imageList[0]?.file, options);
        const reader = new FileReader(); reader.readAsDataURL(compressedImage);
        reader.onloadend = ()=>{ setFormData({...formData, coverPhoto : reader?.result}); }
      } catch (error) { console.log(error); }
      };

    const handleSubmit = (e)=>{
      e.preventDefault();
      if(formType==='pr' || formType==='rsa'){
        if(!formData?.title) return alert(`Title of your ${formType==='pr' ? 'Project Report' : 'Resource Article'} cannot be empty.`)
        if(!formData?.content)return alert(`The content of your ${formType==='pr' ? 'Project Report' : 'Resource Article'} cannot be empty!`);
      }else if(formType==='blog'){
        if(!formData?.title) return alert(`Title of your blog post cannot be empty.`)
        if(!formData?.content) return alert('The content of your Blog Post cannot be empty!');
        if(!formData?.coverPhoto) return alert('Cover photo is required for blog posts.');
      }
      sendCreate();
    }

    return (
        <>
        {alertInfo?.open && <Snackbar open={alertInfo?.open} autoHideDuration={8000} 
        TransitionComponent={(props)=><Slide direction="up" {...props}/>}
        anchorOrigin={{vertical:'bottom',horizontal:'center'}} 
        onClose={()=>(setAlertInfo({...alertInfo, open:false}))}>
          <Alert variant="filled" onClose={()=>(setAlertInfo({...alertInfo, open:false}))} severity="success">
            {alertInfo?.message}
          </Alert>
        </Snackbar>}
        <Dialog open={formOpen} fullScreen onClose={()=>{setFormData({title:'',content:'',courseCode:'',coverPhoto:'',tags:[]});navigate({hash:""})}} >
        <AppBar sx={{ position: 'fixed' }}>
        <Toolbar>
            <IconButton edge="start" onClick={()=>{navigate({hash:""});setFormData({title:'',content:'',courseCode:'',coverPhoto:'',tags:[]})}} >
              <CloseIcon/>
            </IconButton>
            <Typography variant="h6" component="div">
            {formType==='pr' ? `Project Report Lvl ${authUser?.currentLevel}` : formType==='rsa' ? 'Resource Article' : 'Blog'}
            </Typography>
        </Toolbar>
        </AppBar>
        <div style={{display: 'flex', justifyContent: 'center'}}>
        <div style={{padding : '90px 10px 90px 10px',width:'100%', maxWidth:'700px'}}>
        
        <TextField value={formData?.title} onChange={(e)=>(setFormData({...formData, title : e.target.value}))}
        fullWidth variant='outlined' placeholder='An interesting title' label='Title' required inputProps={{maxLength : 80}}
        InputProps={{style:{fontSize : '13px', lineHeight:'24px'}}} color='secondary' disabled={isCreateLoading} />
        <br/><br/>

        {(authUser?.currentRole==='INS' && formType==='rsa') && 
        <FormControl fullWidth disabled={isCreateLoading} >
        <InputLabel color='secondary' id='course-select' >Course code</InputLabel>
        <Select color='secondary'
        labelId="course-select"
        value={formData?.courseCode}
        label="Course Code"
        onChange={(e)=>(setFormData({...formData, courseCode : e.target.value}))}
      >
        {authUser?.currentInsCourse.map((course)=>(
          <MenuItem key={course} value={course}>{course}</MenuItem>
        ))}
      </Select><br/></FormControl>}

        {/* IMAGE UPLOAD */}
        {formType==='blog' && 
        <ImageUploading onChange={handleImageUpload} dataURLKey="data_url" >
          {({ onImageUpload, dragProps, }) => (
            <div style={{display: 'grid',gridTemplateColumns:`${formData?.coverPhoto ? '1fr 1fr' : '1fr'}`,gridGap: '15px', height:'150px'}}>
              <Paper variant='widget'
                style={{display: 'flex', justifyContent: 'center',alignItems: 'center',cursor:'pointer',maxHeight: '120px'}}
                onClick={()=>{setFormData({...formData, coverPhoto : ''});onImageUpload();}} 
                {...dragProps}
              >
                <Typography variant='caption'>Cover Photo. Click or Drop here</Typography>
              </Paper>
              {formData?.coverPhoto &&
              <div style={{maxHeight: '150px',minHeight:'100%',}}>
              <img src={formData?.coverPhoto} alt='cover photo' height='150'width='100%' style={{borderRadius:'12px',objectFit:'cover'}}/>
              </div>
              }
            </div>
          )}
        </ImageUploading>}

        <br/>
        {/* DESCRIPTION MARKDOWN */}
        <Editor
        value={formData?.content} 
        onChange={(e)=>(setFormData({...formData, content : e}))}
        selectedTab={editorTab}
        onTabChange={()=>(setEditorTab( editorTab==='write' ? 'preview' : 'write' ))}
        />
        <br/>
          
        {/* CHIPS */}
        <Paper variant='widget'>
          <TextField fullWidth color='secondary' value={newTag} disabled={isCreateLoading}
          onChange={(e)=>{
            if(e.target.value.slice(-1) === ','&& newTag!==''){
              if(formData?.tags?.length < 8){
                if(formData?.tags?.includes(e.target?.value?.slice(0,-1))) return alert(`You've already added that tag`);
                setFormData({...formData, tags : [...formData?.tags, e.target?.value?.slice(0,-1)]})
                setNewTag('');
              }else{alert('Maximum number of tags is 8');}
            }else{
              setNewTag(`${e.target.value}`);
            }
          }} 
          label='Relevant Tags' placeholder='Press comma ( , ) after each tag to add.'
          />
          {/* <br/><br/> */}
          {formData?.tags?.map((tag)=>(
            <span key={tag}>
            <Chip style={{marginTop : '10px'}} key={tag} label={tag} variant='outlined' color='secondary' disabled={isCreateLoading}
            onDelete={()=>(setFormData({...formData, tags : formData?.tags.filter((i)=>(i!==tag))}))}/>
            &nbsp;&nbsp;
            </span>
          ))}
        </Paper>
        
        <br/>
        <div style={{display: 'flex',justifyContent: 'flex-end'}}>
           &nbsp;&nbsp;&nbsp;&nbsp;
          <Button size='large' disabled={isCreateLoading} onClick={handleSubmit} variant='contained'>
            { isCreateLoading ? <CircularProgress/> : 'Submit'}
          </Button>
         
        </div>
        

        </div>
        </div>
        </Dialog></>
    )
}

export default DbForm;
