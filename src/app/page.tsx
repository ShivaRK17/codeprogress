'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Plus, Calendar, ArrowRight, Trash2, Edit2 } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

export default function Home() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Current user:', user);
    fetchProjects();
  }, [user]);

  async function fetchProjects() {
    try {
      setError(null);
      console.log('Fetching projects...');
      
      // First, test the connection
      const { data: testData, error: testError } = await supabase
        .from('projects')
        .select('count');
      
      if (testError) {
        console.error('Connection test failed:', testError);
        setError(`Connection test failed: ${testError.message}`);
        return;
      }
      
      console.log('Connection test successful:', testData);

      // Now fetch the actual projects
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!inner(id, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching projects:', error);
        setError(`Error fetching projects: ${error.message}`);
        return;
      }
      
      if (!data) {
        console.log('No projects found');
        setProjects([]);
        return;
      }

      console.log('Fetched projects:', data);
      setProjects(data);
    } catch (err) {
      console.error('Unexpected error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  }

  async function createProject() {
    if (!newProjectTitle.trim() || !user) return;
    
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ 
          title: newProjectTitle,
          user_id: user.id
        }])
        .select(`
          *,
          profiles!inner(id, full_name)
        `);

      if (error) {
        console.error('Error creating project:', error);
        setError(`Error creating project: ${error.message}`);
      } else {
        setProjects([...(data || []), ...projects]);
        setNewProjectTitle('');
      }
    } catch (err) {
      console.error('Unexpected error creating project:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteProject(projectId: string) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
    } else {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  }

  async function updateProject(projectId: string) {
    if (!editTitle.trim()) return;

    const { error } = await supabase
      .from('projects')
      .update({ title: editTitle })
      .eq('id', projectId);

    if (error) {
      console.error('Error updating project:', error);
    } else {
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, title: editTitle } : p
      ));
      setEditingProject(null);
      setEditTitle('');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Track Your Coding Journey
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create projects, log your progress, and watch your coding skills grow.
          </p>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          {user ? (
            <div className="flex gap-4">
              <input
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Enter project name"
                className="flex-1 border text-black border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={createProject}
                disabled={isCreating}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                {isCreating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Link
                href="/auth"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign in to create projects
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Projects List */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          All Projects
        </h2>
        
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed">
            <p className="text-gray-500">No projects yet. Create your first project above!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg border hover:border-blue-500 transition-colors group">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {editingProject?.id === project.id ? (
                      <div className="flex-1 mr-4">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full border text-blue-800 border-gray-200 rounded px-2 py-1"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <Link href={`/project/${project.id}`} className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {project.title}
                        </h3>
                      </Link>
                    )}
                    <div className="flex items-center gap-2">
                      {user?.id === project.user_id && (
                        <>
                          {editingProject?.id === project.id ? (
                            <button
                              onClick={() => updateProject(project.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingProject(project);
                                setEditTitle(project.title);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <Link href={`/project/${project.id}`}>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    <time dateTime={project.created_at}>
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    By {project.profiles?.full_name || 'Anonymous'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
