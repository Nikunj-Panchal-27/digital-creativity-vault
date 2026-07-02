import { LayoutTemplate } from 'lucide-react';

export default function TemplatesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
        <LayoutTemplate className="w-10 h-10 text-zinc-500" />
      </div>
      <h1 className="text-3xl font-bold text-zinc-100 mb-4">Templates</h1>
      <p className="text-zinc-400 max-w-md">
        Browse thousands of professionally designed templates to jumpstart your creativity.
      </p>
    </div>
  );
}
