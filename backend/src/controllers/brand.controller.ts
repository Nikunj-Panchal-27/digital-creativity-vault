import { Request, Response } from 'express';
import BrandKit from '../models/BrandKit';

export const getBrandKit = async (req: Request, res: Response) => {
  try {
    let brandKit = await BrandKit.findOne();
    if (!brandKit) {
      brandKit = new BrandKit({ colors: ['#4F46E5', '#10B981', '#F59E0B'] });
      await brandKit.save();
    }
    res.status(200).json({ brandKit });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching brand kit', error });
  }
};

export const updateBrandKit = async (req: Request, res: Response) => {
  try {
    const { colors, fonts, logos } = req.body;
    let brandKit = await BrandKit.findOne();
    if (!brandKit) brandKit = new BrandKit();

    if (colors) brandKit.colors = colors;
    if (fonts) brandKit.fonts = fonts;
    if (logos) brandKit.logos = logos;

    await brandKit.save();
    res.status(200).json({ brandKit });
  } catch (error) {
    res.status(500).json({ message: 'Error updating brand kit', error });
  }
};
