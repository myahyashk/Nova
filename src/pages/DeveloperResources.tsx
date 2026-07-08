import { useState, useEffect } from 'react';
import { supabase, DeveloperResource } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, Code2, ExternalLink, Tag } from 'lucide-react';
import Loading from '../components/Loading';

type ResourceFormData = {
  title: string;
  url: string;
  description: string;
  category: 'tool' | 'library' | 'documentation' | 'tutorial' | 'course' | 'other';
  tags: string;
};

const categoryStyles: Record<string, string> = {
  tool:          'bg-nova-blue-50 text-nova-blue-dark',
  library:       'bg-nova-tan-50 text-nova-tan-dark',
  documentation: 'bg-nova-blue-100 text-nova-blue-dark',
  tutorial:      'bg-nova-tan-100 text-nova-tan-dark',
  course:        'bg-nova-cream-dark text-nova-stone',
  other:         'bg-nova-cream text-nova-stone-light',
};

const categoryEmojis: Record<string, string> = {
  tool:          '🔧',
  library:       '📦',
  documentation: '📖',
  tutorial:      '🎓',
  course:        '📚',
  other:         '💡',
};

export default function DeveloperResources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<DeveloperResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<DeveloperResource | null>(null);
  const [formData, setFormData] = useState<ResourceFormData>({
    title: '', url: '', description: '', category: 'tool', tags: '',
  });

  useEffect(() => {
    if (user) fetchResources();
  }, [user]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('developer_resources')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resourceData = {
      ...formData,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    if (editingResource) {
      const { error } = await supabase.from('developer_resources').update(resourceData).eq('id', editingResource.id);
      if (error) { console.error(error); return; }
    } else {
      const { error } = await supabase.from('developer_resources').insert([resourceData]);
      if (error) { console.error(error); return; }
    }
    setShowModal(false);
    resetForm();
    fetchResources();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    const { error } = await supabase.from('developer_resources').delete().eq('id', id);
    if (error) { console.error(error); return; }
    fetchResources();
  };

  const resetForm = () => {
    setFormData({ title: '', url: '', description: '', category: 'tool', tags: '' });
    setEditingResource(null);
  };

  const openEditModal = (r: DeveloperResource) => {
    setEditingResource(r);
    setFormData({ title: r.title, url: r.url, description: r.description, category: r.category, tags: r.tags.join(', ') });
    setShowModal(true);
  };

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch && (filterCategory === 'all' || r.category === filterCategory);
  });

  if (loading) return <Loading />;

  const inputCls = "w-full px-3 py-2 border border-nova-tan-100 rounded-lg bg-white focus:outline-none";
  const focusBlur = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      (e.target.style.boxShadow = '0 0 0 2px #6B9BBF'),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      (e.target.style.boxShadow = ''),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-nova-stone">Developer Resources</h2>
          <p className="text-nova-stone-light mt-1">Curated collection of tools and references</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #6B9BBF 0%, #C4956A 100%)' }}
        >
          <Plus className="w-5 h-5" />
          New Resource
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nova-stone-light" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-nova-tan-100 rounded-lg bg-white focus:outline-none"
            onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #6B9BBF')}
            onBlur={(e) => (e.target.style.boxShadow = '')}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-nova-tan-100 rounded-lg bg-white focus:outline-none"
          onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #6B9BBF')}
          onBlur={(e) => (e.target.style.boxShadow = '')}
        >
          <option value="all">All Categories</option>
          <option value="tool">Tool</option>
          <option value="library">Library</option>
          <option value="documentation">Documentation</option>
          <option value="tutorial">Tutorial</option>
          <option value="course">Course</option>
          <option value="other">Other</option>
        </select>
      </div>

      {filteredResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-nova-stone-light">
          <Code2 className="w-12 h-12 mb-4 text-nova-blue-light" />
          <p className="text-lg font-medium text-nova-stone">No resources found</p>
          <p className="text-sm">Add your first developer resource</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-xl border border-nova-tan-100 p-5 hover:shadow-md transition-all hover:border-nova-blue-light group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: 'linear-gradient(135deg, #EEF4F9, #F7F0E8)' }}
                  >
                    {categoryEmojis[resource.category]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-nova-stone">{resource.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryStyles[resource.category]}`}>
                      {resource.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(resource)}
                    className="p-1.5 text-nova-stone-light hover:text-nova-blue hover:bg-nova-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="p-1.5 text-nova-stone-light hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-nova-stone-light mb-3 line-clamp-2">
                {resource.description || 'No description'}
              </p>
              {resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {resource.tags.slice(0, 4).map((tag, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-nova-cream text-nova-stone"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 4 && (
                    <span className="text-xs text-nova-stone-light">+{resource.tags.length - 4}</span>
                  )}
                </div>
              )}
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm transition-colors hover:underline"
                style={{ color: '#6B9BBF' }}
              >
                <span className="truncate max-w-[200px]">{resource.url}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border border-nova-tan-100">
            <h3 className="text-xl font-bold text-nova-stone mb-4">
              {editingResource ? 'Edit Resource' : 'New Resource'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-1">Title</label>
                <input type="text" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputCls} {...focusBlur} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-1">URL</label>
                <input type="url" value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className={inputCls} {...focusBlur} placeholder="https://..." required />
              </div>
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-1">Description</label>
                <textarea value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputCls} {...focusBlur} rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-1">Category</label>
                <select value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ResourceFormData['category'] })}
                  className={inputCls} {...focusBlur}>
                  <option value="tool">Tool</option>
                  <option value="library">Library</option>
                  <option value="documentation">Documentation</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="course">Course</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-1">Tags (comma separated)</label>
                <input type="text" value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className={inputCls} {...focusBlur} placeholder="react, typescript, frontend" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-nova-stone hover:bg-nova-cream-dark rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #6B9BBF 0%, #C4956A 100%)' }}>
                  {editingResource ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
