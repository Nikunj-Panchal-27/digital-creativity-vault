"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Palette } from 'lucide-react';

export default function BrandKitPage() {
  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState({ heading: '', subheading: '', body: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newColor, setNewColor] = useState('#000000');

  useEffect(() => {
    fetch('http://localhost:5000/api/brand')
      .then(res => res.json())
      .then(data => {
        if (data.brandKit) {
          setColors(data.brandKit.colors || []);
          setFonts(data.brandKit.fonts || { heading: 'Poppins', subheading: 'Inter', body: 'Roboto' });
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('http://localhost:5000/api/brand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors, fonts })
      });
      alert('Brand Kit saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save Brand Kit.');
    } finally {
      setIsSaving(false);
    }
  };

  const addColor = () => {
    if (!colors.includes(newColor)) {
      setColors([...colors, newColor]);
    }
  };

  const removeColor = (color: string) => {
    setColors(colors.filter(c => c !== color));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
            <Palette className="w-8 h-8 text-indigo-500" /> Brand Kit
          </h1>
          <p className="text-zinc-500 mt-2">Manage your brand colors, fonts, and logos across all projects.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>

      {/* Colors Section */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Brand Colors</h2>
        <div className="flex flex-wrap gap-4 mb-6">
          {colors.map((color) => (
            <div key={color} className="group relative w-16 h-16 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700" style={{ backgroundColor: color }}>
              <button 
                onClick={() => removeColor(color)}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {color}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Input 
            type="color" 
            value={newColor} 
            onChange={(e) => setNewColor(e.target.value)} 
            className="w-16 h-10 p-1 cursor-pointer"
          />
          <Input 
            type="text" 
            value={newColor} 
            onChange={(e) => setNewColor(e.target.value.toUpperCase())}
            className="w-32 uppercase font-mono"
          />
          <Button onClick={addColor} variant="outline" className="border-zinc-200 dark:border-zinc-700">
            <Plus className="w-4 h-4 mr-2" /> Add Color
          </Button>
        </div>
      </section>

      {/* Fonts Section */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-zinc-100">Brand Fonts</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Heading Font</Label>
            <Input 
              value={fonts.heading} 
              onChange={(e) => setFonts({ ...fonts, heading: e.target.value })} 
              placeholder="e.g. Poppins"
            />
          </div>
          <div className="space-y-2">
            <Label>Subheading Font</Label>
            <Input 
              value={fonts.subheading} 
              onChange={(e) => setFonts({ ...fonts, subheading: e.target.value })} 
              placeholder="e.g. Inter"
            />
          </div>
          <div className="space-y-2">
            <Label>Body Font</Label>
            <Input 
              value={fonts.body} 
              onChange={(e) => setFonts({ ...fonts, body: e.target.value })} 
              placeholder="e.g. Roboto"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
