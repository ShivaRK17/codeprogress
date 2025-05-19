'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ProgressLog {
  id: string;
  content: string;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [newLog, setNewLog] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchProject = async () => {
      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) throw projectError;

        setProject(projectData);
        setIsOwner(projectData.user_id === user.id);

        const { data: logsData, error: logsError } = await supabase
          .from('progress_logs')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: false });

        if (logsError) throw logsError;
        setLogs(logsData || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user, router, authLoading]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.trim() || !isOwner || !user) return;

    try {
      const { data, error } = await supabase
        .from('progress_logs')
        .insert([
          {
            project_id: id,
            content: newLog.trim(),
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setLogs([data, ...logs]);
      setNewLog('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error adding log:', err);
      setError(err.message);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!isOwner || !user) return;

    try {
      const { error } = await supabase
        .from('progress_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      setLogs(logs.filter(log => log.id !== logId));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error deleting log:', err);
      setError(err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center text-red-600">Project not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to projects
        </Link>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
          <p className="text-gray-600 mb-4">{project.description}</p>
          <p className="text-sm text-gray-500">
            Created on {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {user && isOwner && (
          <form onSubmit={handleAddLog} className="mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Progress Log</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="log" className="block text-sm font-medium text-gray-700">
                    What did you accomplish today?
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="log"
                      name="log"
                      rows={3}
                      value={newLog}
                      onChange={(e) => setNewLog(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Describe your progress..."
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={!newLog.trim()}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Log
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Progress Logs</h2>
          {logs.length === 0 ? (
            <p className="text-gray-500">No progress logs yet.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <p className="text-gray-900">{log.content}</p>
                  {user && isOwner && (
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 