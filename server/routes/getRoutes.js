import express from 'express';
import {getCourse, getProfile, getSubmissionsBlog, getSubmissionsPr, getSubmissionsRsa, getBlog, getPR} from '../controllers/get.js';
import identityMW from '../middleware/identityMW.js'
import optionalMW from '../middleware/optionalMW.js';

const router = express.Router();

router.get('/course/:id', getCourse);
router.get('/profile/:id', getProfile);
router.get('/submissions/blog', identityMW ,getSubmissionsBlog);
router.get('/submissions/pr', identityMW , getSubmissionsPr);
router.get('/submissions/rsa', identityMW, getSubmissionsRsa);
router.get('/pr/:id', optionalMW , getPR);
router.get('/blog/:id',optionalMW ,getBlog);

export default router;