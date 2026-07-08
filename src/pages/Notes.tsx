import { useState, useEffect } from 'react';
import { supabase, Note } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, StickyNote, Pin } from 'lucide-react';
import Loading from '../components/Loading';

const NOTE_COLORS = ['#D7E8F2', '#EDDCC8', '#A8C4D8', '#D9B897', '#EEF4F9', '#F7F0E8'];

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', color: '#D7E8F2' });

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNote) {
      const { error } = await supabase
        .from('notes')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', editingNote.id);
      if (error) { console.error(error); return; }
    } else {
      const { error } = await supabase.from('notes').insert([formData]);
      if (error) { console.error(error); return; }
    }
    setShowModal(false);
    resetForm();
    fetchNotes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) { console.error(error); return; }
    fetchNotes();
  };

  const togglePin = async (note: Note) => {
    const { error } = await supabase
      .from('notes')
      .update({ is_pinned: !note.is_pinned, updated_at: new Date().toISOString() })
      .eq('id', note.id);
    if (error) { console.error(error); return; }
    fetchNotes();
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', color: '#D7E8F2' });
    setEditingNote(null);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content, color: note.color });
    setShowModal(true);
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loading />;

  const inputCls = "w-full px-3 py-2 border border-nova-tan-100 rounded-lg bg-white focus:outline-none";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-nova-stone">Notes</h2>
          <p className="text-nova-stone-light mt-1">Capture your thoughts and ideas</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #6B9BBF 0%, #C4956A 100%)' }}
        >
          <Plus className="w-5 h-5" />
          New Note
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nova-stone-light" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-nova-tan-100 rounded-lg bg-white focus:outline-none"
          onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #6B9BBF')}
          onBlur={(e) => (e.target.style.boxShadow = '')}
        />
      </div>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-nova-stone-light">
          <StickyNote className="w-12 h-12 mb-4 text-nova-blue-light" />
          <p className="text-lg font-medium text-nova-stone">No notes found</p>
          <p className="text-sm">Create your first note to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="relative rounded-xl p-4 min-h-[200px] flex flex-col border shadow-sm hover:shadow-md transition-shadow"
              style={{ backgroundColor: note.color, borderColor: note.color === '#EEF4F9' || note.color === '#F7F0E8' ? '#EDDCC8' : 'transparent' }}
            >
              {note.is_pinned && (
                <div className="absolute top-2 right-2">
                  <Pin className="w-4 h-4 fill-current" style={{ color: '#4A7A9B' }} />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-nova-stone mb-2">{note.title}</h3>
                <p className="text-sm text-nova-stone line-clamp-5 whitespace-pre-wrap">
                  {note.content || 'No content'}
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/10">
                <button
                  onClick={() => togglePin(note)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    note.is_pinned
                      ? 'text-nova-blue bg-white/60'
                      : 'text-nova-stone-light hover:text-nova-stone hover:bg-white/50'
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(note)}
                    className="p-1.5 text-nova-stone-light hover:text-nova-blue hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 text-nova-stone-light hover:text-red-600 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border border-nova-tan-100">
            <h3 className="text-xl font-bold text-nova-stone mb-4">
              {editingNote ? 'Edit Note' : 'New Note'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-1">Title</label>
                <input type="text" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputCls}
                  onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #6B9BBF')}
                  onBlur={(e) => (e.target.style.boxShadow = '')}
                  required />
              </div>
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-1">Content</label>
                <textarea value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={inputCls}
                  onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #6B9BBF')}
                  onBlur={(e) => (e.target.style.boxShadow = '')}
                  rows={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-2">Color</label>
                <div className="flex gap-2">
                  {NOTE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-1 ring-nova-stone scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-nova-stone hover:bg-nova-cream-dark rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #6B9BBF 0%, #C4956A 100%)' }}>
                  {editingNote ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
