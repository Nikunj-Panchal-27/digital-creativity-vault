import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import User from '../models/User';
import cloudinary from '../utils/cloudinary';
import streamifier from 'streamifier';
import bcrypt from 'bcrypt';

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      user.name = req.body.name || user.name;
      
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'digital_creativity_vault/avatars',
        width: 150,
        height: 150,
        crop: 'fill'
      },
      async (error, result) => {
        if (error) {
          res.status(500).json({ message: 'Cloudinary upload failed', error });
          return;
        }

        if (result) {
          user.avatar = result.secure_url;
          await user.save();

          res.json({
            message: 'Avatar uploaded successfully',
            avatar: user.avatar
          });
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
