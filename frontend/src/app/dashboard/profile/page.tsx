"use client";

import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const data: any = { name };
      if (password) data.password = password;
      const res = await api.put('/users/profile', data);
      updateUser(res.data);
      toast.success('Profile updated successfully');
      setPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      updateUser({ avatar: res.data.avatar });
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-zinc-100 mb-8">Profile Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-zinc-800 bg-zinc-900/50 md:col-span-1 h-fit">
            <CardHeader className="text-center">
              <CardTitle className="text-zinc-100">Avatar</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-6">
                <Avatar className="w-32 h-32 border-4 border-zinc-800">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-zinc-800 text-2xl text-zinc-500">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                </Button>
              </div>
              <p className="text-sm text-zinc-500 text-center">
                Allowed *.jpeg, *.jpg, *.png, *.webp<br />
                Max size of 5MB
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-zinc-100">General Information</CardTitle>
              <CardDescription className="text-zinc-400">Update your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-zinc-800/30 border-zinc-800 text-zinc-500 cursor-not-allowed" 
                  />
                  <p className="text-xs text-zinc-500">Email cannot be changed.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-100" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-zinc-300">New Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Leave blank to keep current" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-100" 
                  />
                </div>

                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
