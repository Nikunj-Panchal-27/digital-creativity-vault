import { Request, Response } from 'express';
import Project from '../models/Project';

export const getProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error });
  }
};

export const autoSaveProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { canvasState, thumbnailUrl, canvasWidth, canvasHeight, designType } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Update main state
    project.canvasState = canvasState;
    if (thumbnailUrl) project.thumbnailUrl = thumbnailUrl;
    if (canvasWidth) project.canvasWidth = canvasWidth;
    if (canvasHeight) project.canvasHeight = canvasHeight;
    if (designType) project.designType = designType;

    // Push to version history (keep last 10 versions max)
    project.versions.push({ canvasState, createdAt: new Date() });
    if (project.versions.length > 10) {
      project.versions.shift(); // Remove oldest
    }

    await project.save();
    res.status(200).json({ message: 'Auto-saved successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Error saving project', error });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { canvasWidth, canvasHeight, designType } = req.body || {};
    const project = new Project({
      name: 'Untitled Design',
      canvasState: '{}',
      canvasWidth: canvasWidth || 1080,
      canvasHeight: canvasHeight || 1080,
      designType: designType || 'Custom',
      versions: [{ canvasState: '{}', createdAt: new Date() }]
    });
    await project.save();
    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error });
  }
};

export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find({ isTemplate: { $ne: true }, isTrashed: false }).sort({ updatedAt: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error });
  }
};

export const getTrashedProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find({ isTrashed: true }).sort({ updatedAt: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trash', error });
  }
};

export const moveToTrash = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { isTrashed: true }, { new: true });
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Error trashing project', error });
  }
};

export const restoreFromTrash = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { isTrashed: false }, { new: true });
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring project', error });
  }
};
