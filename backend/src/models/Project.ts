import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  category: string;
  isTemplate: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  designType?: string;
  userId?: mongoose.Types.ObjectId;
  folderId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  isTrashed: boolean;
  versions: { canvasState: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  isTemplate: { type: Boolean, default: false },
  canvasState: { type: String, required: true },
  canvasWidth: { type: Number, default: 1080 },
  canvasHeight: { type: Number, default: 1080 },
  designType: { type: String, default: 'Custom' },
  thumbnailUrl: { type: String, default: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  folderId: { type: Schema.Types.ObjectId, ref: 'Folder' },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  isTrashed: { type: Boolean, default: false },
  versions: [{ 
    canvasState: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<IProject>('Project', ProjectSchema);
