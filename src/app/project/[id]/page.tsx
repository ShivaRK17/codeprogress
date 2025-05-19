'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Calendar, Trash2, Edit2 } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

interface ProgressLog {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [newLogContent, setNewLogContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingLog, setEditingLog] = useState<ProgressLog | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchProject();
    fetchLogs();
  }, [id]);

  async function fetchProject() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:user_id(full_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
    } else {
      setProject(data);
    }
  }

  async function fetchLogs() {
    const { data, error } = await supabase
      .from('progress_logs')
      .select(`
        *,
        profiles:user_id(full_name)
      `)
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data || []);
    }
  }

  async function createLog() {
    if (!newLogContent.trim() || !user) return;

    setIsCreating(true);
    const { data, error } = await supabase
      .from('progress_logs')
      .insert([{
        content: newLogContent,
        project_id: id,
        user_id: user.id
      }])
      .select(`
        *,
        profiles:user_id(full_name)
      `);

    if (error) {
      console.error('Error creating log:', error);
    } else {
      setLogs([...(data || []), ...logs]);
      setNewLogContent('');
    }
    setIsCreating(false);
  }

  async function deleteLog(logId: string) {
    if (!confirm('Are you sure you want to delete this log?')) return;

    const { error } = await supabase
      .from('progress_logs')
      .delete()
      .eq('id', logId);

    if (error) {
      console.error('Error deleting log:', error);
    } else {
      setLogs(logs.filter(l => l.id !== logId));
    }
  }

  async function updateLog(logId: string) {
    if (!editContent.trim()) return;

    const { error } = await supabase
      .from('progress_logs')
      .update({ content: editContent })
      .eq('id', logId);

    if (error) {
      console.error('Error updating log:', error);
    } else {
      setLogs(logs.map(l =>
        l.id === logId ? { ...l, content: editContent } : l
      ));
      setEditingLog(null);
      setEditContent('');
    }
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <time dateTime={project.created_at}>
            Created {new Date(project.created_at).toLocaleDateString()}
          </time>
          <span className="mx-2">•</span>
          <span>By {project.profiles?.full_name || 'Anonymous'}</span>
        </div>
      </div>

      {user ? (
        user.id === project.user_id ? (<div className="mb-8">
          <textarea
            value={newLogContent}
            onChange={(e) => setNewLogContent(e.target.value)}
            placeholder="What did you work on today?"
            className="w-full border text-black border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            rows={3}
          />
          <button
            onClick={createLog}
            disabled={isCreating}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Add Progress Log'}
          </button>
        </div>) : (<div></div>)
      ) : (
        <div className="mb-8 text-center">
          <Link
            href="/auth"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign in to add progress logs
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {logs.map((log) => (
          <div key={log.id} className="bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                <time dateTime={log.created_at}>
                  {new Date(log.created_at).toLocaleDateString()}
                </time>
                <span className="mx-2">•</span>
                <span>{log.profiles?.full_name || 'Anonymous'}</span>
              </div>
              {user?.id === log.user_id && (
                <div className="flex items-center gap-2">
                  {editingLog?.id === log.id ? (
                    <button
                      onClick={() => updateLog(log.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingLog(log);
                        setEditContent(log.content);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {editingLog?.id === log.id ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full border border-gray-200 rounded px-2 py-1"
                rows={3}
                autoFocus
              />
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap">{log.content}</p>
            )}
          </div>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed">
            <p className="text-gray-500">No progress logs yet. Add your first log above!</p>
          </div>
        )}
      </div>
    </div>
  );
} 