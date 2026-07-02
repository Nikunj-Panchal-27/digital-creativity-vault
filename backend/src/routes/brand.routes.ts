import { Router } from 'express';
import { getBrandKit, updateBrandKit } from '../controllers/brand.controller';

const router = Router();

router.get('/', getBrandKit);
router.put('/', updateBrandKit);

export default router;
