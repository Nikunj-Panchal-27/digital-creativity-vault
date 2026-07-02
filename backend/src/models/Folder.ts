import mongoose, { Schema, Document } from 'mongoose';

export interface IFolder extends Document {
  name: string;
  userId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema: Schema = new Schema({
  name: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
}, { timestamps: true });

export default mongoose.model<IFolder>('Folder', FolderSchema);
