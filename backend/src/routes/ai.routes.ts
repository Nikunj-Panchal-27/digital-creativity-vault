import { Router } from 'express';
import { generateText, generatePalette, generateTemplate } from '../controllers/ai.controller';

const router = Router();

router.post('/text', generateText);
router.post('/palette', generatePalette);
router.post('/template', generateTemplate);

export default router;
