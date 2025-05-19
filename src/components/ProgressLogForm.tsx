import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ProgressLogFormProps {
  projectId: string;
  onLogAdded: () => void;
}

export default function ProgressLogForm({ projectId, onLogAdded }: ProgressLogFormProps) {
  const [content, setContent] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    const { error } = await supabase
      .from('progress_logs')
      .insert([{ project_id: projectId, content }]);

    if (error) {
      console.error('Error adding log:', error);
    } else {
      setContent('');
      onLogAdded();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What did you do today?"
        className="border p-2 w-full mb-2"
        rows={3}
      />
      <button type="submit" className="bg-green-500 text-white p-2 rounded">Add Progress</button>
    </form>
  );
} 