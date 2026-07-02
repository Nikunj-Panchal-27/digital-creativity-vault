import { Router } from 'express';
import { getTemplates, saveTemplate, duplicateTemplate } from '../controllers/template.controller';

const router = Router();

router.get('/', getTemplates);
router.post('/', saveTemplate);
router.post('/:id/duplicate', duplicateTemplate);

export default router;
