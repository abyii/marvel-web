import { AppBar, Toolbar, IconButton,Typography,Button, TextField, Paper, Link } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useSelector } from "react-redux";
import { useState } from "react";
import ImageUploading from 'react-images-uploading';
import ImageCompressor from 'browser-image-compression';
import ReactMde from 'react-mde';
import Markdown from 'markdown-to-jsx';
import "./react-mde-all.css";
import sanitizer from 'sanitize-html';

const DbForm = ({setFormOpen, type}) => {
    const {syllabus} = useSelector(state => state.dashboard);
    const {authUser} = useSelector(state => state.auth);
    const [formData, setFormData] = useState({
        title : '', description : '', tags : [], coverPhoto : ''
    });
    const [editorTab, setEditorTab] = useState("write");

    const handleImageUpload = async (imageList) => {
      const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1080, useWebWorker: true };
      try {
        const compressedImage = await ImageCompressor(imageList[0]?.file, options);
        const reader = new FileReader(); reader.readAsDataURL(compressedImage);
        reader.onloadend = ()=>{ setFormData({...formData, coverPhoto : reader?.result}); }
      } catch (error) { console.log(error); }
      };

    const htmlDecode = (input)=> {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
      }

    return (
        <>
        <AppBar sx={{ position: 'fixed' }}>
        <Toolbar>
            <IconButton edge="start" onClick={()=>{setFormOpen(false);}} ><CloseIcon/></IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {type==='PR' ? `Project Report Lvl ${syllabus?.submissionStatus?.forLevel}` : 'Blog'}
            </Typography>
        </Toolbar>
        </AppBar>
        <div style={{display: 'flex', justifyContent: 'center'}}>
        <div style={{padding : '90px 10px 90px 10px',width:'100%', maxWidth:'700px'}}>
        
        <TextField value={formData?.title} onChange={(e)=>(setFormData({...formData, title : e.target.value}))}
        fullWidth variant='outlined' label='Title' required inputProps={{maxLength : 80}}
        InputProps={{style:{fontSize : '13px', lineHeight:'24px'}}} color='secondary'/>
        <br/><br/>

        <ImageUploading onChange={handleImageUpload} dataURLKey="data_url" >
        {({ onImageUpload, dragProps, }) => (
          <div style={{display: 'grid',gridTemplateColumns:`${formData?.coverPhoto ? '1fr 1fr' : '1fr'}`,gridGap: '15px', height:'150px'}}>
            <Paper variant='widget'
              style={{display: 'flex', justifyContent: 'center',alignItems: 'center',cursor:'pointer',maxHeight: '120px'}}
              onClick={()=>{setFormData({...formData?.coverPhoto});onImageUpload();}} 
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
      </ImageUploading>
      <br/>
      <Paper className='container'><ReactMde
        value={formData?.description} label='description'
        onChange={(e)=>(setFormData({...formData, description : e}))}
        selectedTab={editorTab}
        onTabChange={()=>(setEditorTab( editorTab==='write' ? 'preview' : 'write' ))}
        generateMarkdownPreview={markdown =>
          Promise.resolve(
            <Markdown style={{fontFamily: 'Montserrat',fontSize: '14px',lineHeight:'24px'}} 
          options={
            {wrapper : 'p'},
            { overrides: {
                p :{ component: Typography , props: {variant : 'body2'}}, 
                a :{ component : Link, props : {target : '_blank',rel:'noopener noreferrer'} },
                code : {component : Typography, props : { variant : 'code',component : 'code'}},
                img : { props : {width : '100%' }},
                iframe : { props : {width : '100%', height : '315', frameborder : '0'}}
            },
        }}>
          {htmlDecode(sanitizer(markdown, {
              allowedTags: ['iframe'], allowedAttributes: { 'iframe': ['src'] },
              allowedIframeHostnames: ['www.youtube.com'], nestingLimit : 5
            }))}
        </Markdown>
        )
        }
      />
      </Paper>

      <Button onClick={()=>(console.log(formData))}>test</Button>

        </div>
        </div>
        </>
    )
}

export default DbForm;
