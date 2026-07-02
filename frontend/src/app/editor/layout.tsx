import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editor | Digital Creativity Vault',
  description: 'Design and edit your projects',
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {children}
    </div>
  );
}
