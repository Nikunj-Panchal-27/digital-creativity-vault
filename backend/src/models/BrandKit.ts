import mongoose, { Schema, Document } from 'mongoose';

export interface IBrandKit extends Document {
  userId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  colors: string[];
  fonts: { heading: string; subheading: string; body: string };
  logos: string[]; // URLs
  createdAt: Date;
  updatedAt: Date;
}

const BrandKitSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  colors: [{ type: String }],
  fonts: {
    heading: { type: String, default: 'Poppins' },
    subheading: { type: String, default: 'Inter' },
    body: { type: String, default: 'Roboto' }
  },
  logos: [{ type: String }]
}, { timestamps: true });

export default mongoose.model<IBrandKit>('BrandKit', BrandKitSchema);
