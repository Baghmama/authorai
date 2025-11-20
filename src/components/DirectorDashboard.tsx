import React, { useState, useEffect } from 'react';
import { Plus, Folder, Calendar, Trash2, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DirectorProject {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  chapter_count?: number;
}

interface DirectorDashboardProps {
  onSelectProject: (projectId: string) => void;
}

export function DirectorDashboard({ onSelectProject }: DirectorDashboardProps) {
  const [projects, setProjects] = useState<DirectorProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: projectsData, error } = await supabase
        .from('director_projects')
        .select(`
          id,
          title,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const projectsWithCounts = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { count } = await supabase
            .from('director_chapters')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          return {
            ...project,
            chapter_count: count || 0
          };
        })
      );

      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createNewProject() {
    if (!newProjectTitle.trim()) return;

    try {
      setCreating(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: project, error } = await supabase
        .from('director_projects')
        .insert({
          user_id: user.id,
          title: newProjectTitle
        })
        .select()
        .single();

      if (error) throw error;

      if (project) {
        setNewProjectTitle('');
        await loadProjects();
        onSelectProject(project.id);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  async function deleteProject(projectId: string) {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('director_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      await loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Director Mode</h1>
          <p className="text-purple-200">Create and manage your AI-powered writing projects</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Create New Project</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder="Enter project title..."
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && createNewProject()}
              disabled={creating}
            />
            <button
              onClick={createNewProject}
              disabled={creating || !newProjectTitle.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-6 hover:bg-white/15 transition-all cursor-pointer group"
              onClick={() => onSelectProject(project.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Folder className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                      {project.title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.id);
                  }}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>

              <div className="space-y-2 text-sm text-purple-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{project.chapter_count || 0} chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {formatDate(project.updated_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-white/10 rounded-full mb-4">
              <Folder className="w-12 h-12 text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
            <p className="text-purple-200">Create your first project to get started with Director Mode</p>
          </div>
        )}
      </div>
    </div>
  );
}
