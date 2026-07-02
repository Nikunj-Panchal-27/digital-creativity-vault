import express from 'express';
import { register, login, forgotPassword, verifyOTP } from '../controllers/auth.controller';

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);

export default router;
