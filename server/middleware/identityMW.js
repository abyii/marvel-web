import {OAuth2Client} from 'google-auth-library';
import dotenv from 'dotenv';
import user from '../models/user.js';

const identityMW = async (req, res, next) => {
try {
    dotenv.config();
    const gClient = new OAuth2Client(process.env.CIENT_ID);
    let userData;
    try {
        token = req.headers.authorization?.split(' ')?.[1];
        const ticket = await gClient.verifyIdToken({idToken : token, audience : process.env.CIENT_ID});
        userData = ticket.getPayload();
    } catch (error) {
        if(error.message=='token is not defined'){
            return res.json({status : '403', message : 'Access denied. No token'});
        }else{
            return res.json({status : 'BRUH', message : 'Verificaion failed'});
        }
    }
    const existingUser = await user.findOne({id : userData?.sub}, "-bio -website -linkedIn -gitHub").lean();
    if(existingUser?.enrollmentStatus==='BANNED')return res.json({status : '404',message:'banned'})

    if(!existingUser || existingUser?.enrollmentStatus==='UNKNOWN'){
        return res.json({message : 'unrecognizable request', status:'403'});
    }else{
        req.user = existingUser;
        next();
    } 
    
} catch (err) {
    // console.log(err);
    return res.json({status : 'BRUH', message : 'Request failed. wdk why.'})
}
}

export default identityMW;