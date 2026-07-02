import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  members: { userId: mongoose.Types.ObjectId; role: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema = new Schema({
  name: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'editor' }
  }]
}, { timestamps: true });

export default mongoose.model<ITeam>('Team', TeamSchema);
