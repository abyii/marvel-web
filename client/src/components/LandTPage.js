import { useSelector, useDispatch } from "react-redux";
import { Box } from "@mui/system";
import { CircularProgress, Typography, Divider, Chip} from "@mui/material";
import TaskCard from "./TaskCard.js";
import {editCourse} from '../actions/other.js';
import {useParams} from "react-router-dom";

const LandTPage = () => {
    const {syllabus, isSyllabusLoading} = useSelector(state => state.dashboard);
    const {authUser} = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const {id} = useParams();

    const handleModify = (operation, tskIndex, lvIndex)=>{
        dispatch(editCourse(id , operation, tskIndex, lvIndex));
    };

    return (
        <div>
        <Box sx={{display:'grid',gridTemplateColumns: '1fr 1fr', justifyItems:'center',width:'max-content',gap:'20px', opacity:`${isSyllabusLoading?'0.4':'1'}`, pointerEvents:`${isSyllabusLoading? 'none':'auto'}`}} >
        
        { syllabus?.levels?.map((lvl, lvIndex)=>(
        <div key={lvIndex} style={{maxWidth:'500px'}}>
        <br/>
        <Typography variant='heading' component='div' key={lvl.lvIndex}>&nbsp;&nbsp;
                {`Level  ${lvIndex+1}`}
        </Typography>
        { authUser?.currentRole==='INS' && 
        <Divider textAlign="center" sx={{marginTop:'15px'}}> 
            <Chip variant="outlined" onClick={()=>(handleModify('addTask',0, lvIndex))}
            clickable label="Add new Task here"  /> 
        </Divider>}
        { lvl.tasks.map((tsk, tskIndex)=>{
            return(
                <div key={tskIndex}>
                <TaskCard tsk={tsk} tskIndex={tskIndex} lvIndex={lvIndex} key={tskIndex}/>
                { authUser?.currentRole==='INS' && 
                <Divider  textAlign="center" sx={{marginTop:'15px'}}> 
                    <Chip variant="outlined" onClick={()=>(handleModify("addTask",tskIndex+1, lvIndex))}
                    clickable label="Add new Task here"  /> 
                </Divider>}
                </div>
            )
        })}
            </div>
        ))}
        </Box>
        </div>
    )
}

export default LandTPage
