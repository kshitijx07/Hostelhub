import express from 'express';
import { createApplication, getStudentApplications, getAdminApplications, updateApplicationStatus } from '../controllers/applicationController.js';
import { authenticate, isStudent, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, isStudent, createApplication);
router.get('/student/my-applications', authenticate, isStudent, getStudentApplications);
router.get('/admin/applications', authenticate, isAdmin, getAdminApplications);
router.patch('/:id/status', authenticate, isAdmin, updateApplicationStatus);

export default router;
