import { Request, Response } from 'express';
import Project from '../models/Project';

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    let filter: any = { isTemplate: true };

    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }
    if (search) {
      filter.name = new RegExp(search as string, 'i');
    }

    const templates = await Project.find(filter).sort({ createdAt: -1 });
    
    // Seed templates if none exist
    if (templates.length === 0 && !search && (!category || category === 'All')) {
      const defaultTemplates = [
        { name: 'Minimalist Resume', category: 'Resume', isTemplate: true, canvasState: '{"version":"5.3.0","objects":[{"type":"rect","left":50,"top":50,"width":400,"height":600,"fill":"#f3f4f6"},{"type":"i-text","left":70,"top":70,"fontFamily":"Poppins","fontSize":32,"fontWeight":"bold","text":"JOHN DOE","fill":"#1f2937"}]}', thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80' },
        { name: 'Tech Startup Poster', category: 'Poster', isTemplate: true, canvasState: '{"version":"5.3.0","objects":[{"type":"rect","left":0,"top":0,"width":800,"height":800,"fill":"#4f46e5"},{"type":"i-text","left":100,"top":300,"fontFamily":"Poppins","fontSize":64,"fontWeight":"bold","text":"INNOVATE","fill":"#ffffff"}]}', thumbnailUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80' },
        { name: 'Cyberpunk Banner', category: 'Banner', isTemplate: true, canvasState: '{"version":"5.3.0","objects":[{"type":"rect","left":0,"top":0,"width":1200,"height":400,"fill":"#000000"},{"type":"circle","left":500,"top":100,"radius":150,"fill":"#ec4899"}]}', thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80' },
      ];
      await Project.insertMany(defaultTemplates);
      const newTemplates = await Project.find(filter).sort({ createdAt: -1 });
      return res.status(200).json({ templates: newTemplates });
    }

    res.status(200).json({ templates });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching templates', error });
  }
};

export const saveTemplate = async (req: Request, res: Response) => {
  try {
    const { name, category, canvasState, thumbnailUrl } = req.body;
    
    if (!name || !canvasState) {
      return res.status(400).json({ message: 'Name and canvasState are required' });
    }

    const template = new Project({
      name,
      category: category || 'General',
      isTemplate: true,
      canvasState,
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80',
    });

    await template.save();
    res.status(201).json({ message: 'Template saved successfully', template });
  } catch (error) {
    res.status(500).json({ message: 'Error saving template', error });
  }
};

export const duplicateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await Project.findById(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const duplicate = new Project({
      name: `${template.name} (Copy)`,
      category: template.category,
      isTemplate: false, // The duplicate belongs to the user, not a template anymore
      canvasState: template.canvasState,
      thumbnailUrl: template.thumbnailUrl
    });

    await duplicate.save();
    res.status(201).json({ message: 'Project duplicated successfully', project: duplicate });
  } catch (error) {
    res.status(500).json({ message: 'Error duplicating template', error });
  }
};
