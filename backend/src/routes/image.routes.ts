import { Router } from 'express';
import { searchImages } from '../controllers/image.controller';

const router = Router();

router.get('/search', searchImages);

export default router;
