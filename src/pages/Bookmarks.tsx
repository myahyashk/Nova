import { useState, useEffect } from 'react';
import { supabase, Bookmark } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, Bookmark as BookmarkIcon, ExternalLink, Globe } from 'lucide-react';
import Loading from '../components/Loading';

const siteEmojis = [
  { pattern: 'github',        icon: '🐙' },
  { pattern: 'stackoverflow', icon: '📚' },
  { pattern: 'youtube',       icon: '📺' },
  { pattern: 'twitter',       icon: '🐦' },
  { pattern: 'linkedin',      icon: '💼' },
  { pattern: 'medium',        icon: '📰' },
  { pattern: 'dev.to',        icon: '👩‍💻' },
  { pattern: 'netlify',       icon: '🚀' },
  { pattern: 'vercel',        icon: '▲' },
];

function getFavicon(url: string, saved: string): string {
  if (saved) return saved;
  const lower = url.toLowerCase();
  for (const { pattern, icon } of siteEmojis) {
    if (lower.includes(pattern)) return icon;
  }
  return '🔗';
}

export default function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '', description: '', category: 'general' });

  useEffect(() => {
    if (user) fetchBookmarks();
  }, [user]);

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBookmark) {
      const { error } = await supabase.from('bookmarks').update(formData).eq('id', editingBookmark.id);
      if (error) { console.error(error); return; }
    } else {
      const { error } = await supabase.from('bookmarks').insert([formData]);
      if (error) { console.error(error); return; }
    }
    setShowModal(false);
    resetForm();
    fetchBookmarks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bookmark?')) return;
    const { error } = await supabase.from('bookmarks').delete().eq('id', id);
    if (error) { console.error(error); return; }
    fetchBookmarks();
  };

  const resetForm = () => {
    setFormData({ title: '', url: '', description: '', category: 'general' });
    setEditingBookmark(null);
  };

  const openEditModal = (b: Bookmark) => {
    setEditingBookmark(b);
    setFormData({ title: b.title, url: b.url, description: b.description, category: b.category });
    setShowModal(true);
  };

  const categories = ['all', ...Array.from(new Set(bookmarks.map((b) => b.category)))];

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (filterCategory === 'all' || b.category === filterCategory);
  });

  if (loading) return <Loading />;

  const inputCls = "w-full px-3 py-2 border border-nova-tan-100 rounded-lg bg-white focus:outline-none";
  const focusBlur = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      (e.target.style.boxShadow = '0 0 0 2px #6B9BBF'),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      (e.target.style.boxShadow = ''),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-nova-stone">Bookmarks</h2>
          <p className="text-nova-stone-light mt-1">Save and organize your favorite links</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #6B9BBF 0%, #C4956A 100%)' }}
        >
          <Plus className="w-5 h-5" />
          New Bookmark
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nova-stone-light" />
          <input
            type="text"
            placeholder="Search bookmarks..."
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
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
          ))}
        </select>
      </div>

      {filteredBookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-nova-stone-light">
          <BookmarkIcon className="w-12 h-12 mb-4 text-nova-tan-light" />
          <p className="text-lg font-medium text-nova-stone">No bookmarks found</p>
          <p className="text-sm">Save your first bookmark to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white rounded-xl border border-nova-tan-100 p-5 hover:shadow-md transition-all hover:border-nova-tan-light group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: 'linear-gradient(135deg, #EEF4F9, #F7F0E8)' }}
                  >
                    {getFavicon(bookmark.url, bookmark.favicon)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-nova-stone">{bookmark.title}</h3>
                    <span className="text-xs text-nova-stone-light">{bookmark.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(bookmark)}
                    className="p-1.5 text-nova-stone-light hover:text-nova-blue hover:bg-nova-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(bookmark.id)}
                    className="p-1.5 text-nova-stone-light hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-nova-stone-light mb-3 line-clamp-2">
                {bookmark.description || 'No description'}
              </p>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm transition-colors hover:underline"
                style={{ color: '#6B9BBF' }}
              >
                <Globe className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{bookmark.url}</span>
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
              {editingBookmark ? 'Edit Bookmark' : 'New Bookmark'}
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
                <input type="text" value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={inputCls} {...focusBlur} placeholder="e.g., tools, learning" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-nova-stone hover:bg-nova-cream-dark rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #6B9BBF 0%, #C4956A 100%)' }}>
                  {editingBookmark ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
