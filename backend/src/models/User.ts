import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  googleId?: string;
  githubId?: string;
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  refreshToken?: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String, default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  googleId: { type: String },
  githubId: { type: String },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  refreshToken: { type: String },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
