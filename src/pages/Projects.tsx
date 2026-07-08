import { useState, useEffect } from 'react';
import { supabase, Project } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, FolderKanban } from 'lucide-react';
import Loading from '../components/Loading';

type ProjectFormData = {
  name: string;
  description: string;
  color: string;
  status: 'active' | 'completed' | 'archived';
};

const PROJECT_COLORS = ['#6B9BBF', '#C4956A', '#A8C4D8', '#D9B897', '#4A7A9B', '#A0744A'];

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '', description: '', color: '#6B9BBF', status: 'active',
  });

  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      const { error } = await supabase
        .from('projects')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', editingProject.id);
      if (error) { console.error(error); return; }
    } else {
      const { error } = await supabase.from('projects').insert([formData]);
      if (error) { console.error(error); return; }
    }
    setShowModal(false);
    resetForm();
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { console.error(error); return; }
    fetchProjects();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', color: '#6B9BBF', status: 'active' });
    setEditingProject(null);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description, color: project.color, status: project.status });
    setShowModal(true);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loading />;

  const statusBadge = (status: string) => {
    if (status === 'active')    return 'bg-nova-blue-50 text-nova-blue-dark';
    if (status === 'completed') return 'bg-nova-tan-50 text-nova-tan-dark';
    return 'bg-nova-cream-dark text-nova-stone-light';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-nova-stone">Projects</h2>
          <p className="text-nova-stone-light mt-1">Manage your projects and initiatives</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6B9BBF 0%, #C4956A 100%)' }}
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nova-stone-light" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-nova-tan-100 rounded-lg bg-white focus:outline-none"
          onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #6B9BBF')}
          onBlur={(e) => (e.target.style.boxShadow = '')}
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-nova-stone-light">
          <FolderKanban className="w-12 h-12 mb-4 text-nova-blue-light" />
          <p className="text-lg font-medium text-nova-stone">No projects found</p>
          <p className="text-sm">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-nova-tan-100 p-5 hover:shadow-md transition-all hover:border-nova-blue-light group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
                  <h3 className="font-semibold text-nova-stone">{project.name}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(project)}
                    className="p-1.5 text-nova-stone-light hover:text-nova-blue hover:bg-nova-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 text-nova-stone-light hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-nova-stone-light line-clamp-2 mb-3">
                {project.description || 'No description'}
              </p>
              <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(project.status)}`}>
                {project.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border border-nova-tan-100">
            <h3 className="text-xl font-bold text-nova-stone mb-4">
              {editingProject ? 'Edit Project' : 'New Project'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-nova-tan-100 rounded-lg focus:outline-none"
                  onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #6B9BBF')}
                  onBlur={(e) => (e.target.style.boxShadow = '')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-nova-tan-100 rounded-lg focus:outline-none"
                  onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #6B9BBF')}
                  onBlur={(e) => (e.target.style.boxShadow = '')}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-2">Color</label>
                <div className="flex gap-2">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-nova-stone scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectFormData['status'] })}
                  className="w-full px-3 py-2 border border-nova-tan-100 rounded-lg focus:outline-none bg-white"
                  onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #6B9BBF')}
                  onBlur={(e) => (e.target.style.boxShadow = '')}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-nova-stone hover:bg-nova-cream-dark rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #6B9BBF 0%, #C4956A 100%)' }}
                >
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
