import { Router } from 'express';
import { getProject, autoSaveProject, createProject, getUserProjects, getTrashedProjects, moveToTrash, restoreFromTrash } from '../controllers/project.controller';

const router = Router();

router.get('/', getUserProjects);
router.post('/', createProject);
router.get('/trash', getTrashedProjects);
router.get('/:id', getProject);
router.put('/:id', autoSaveProject);
router.put('/:id/trash', moveToTrash);
router.put('/:id/restore', restoreFromTrash);

export default router;
