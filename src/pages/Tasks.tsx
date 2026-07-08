import { useState, useEffect } from 'react';
import { supabase, Task, Project } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, CheckSquare, Calendar } from 'lucide-react';
import Loading from '../components/Loading';

type TaskFormData = {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string;
  project_id: string;
};

const priorityStyles: Record<string, string> = {
  low:    'bg-nova-cream-dark text-nova-stone',
  medium: 'bg-nova-blue-50 text-nova-blue-dark',
  high:   'bg-nova-tan-50 text-nova-tan-dark',
  urgent: 'bg-red-50 text-red-700',
};

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '', description: '', priority: 'medium', status: 'todo', due_date: '', project_id: '',
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*'),
      ]);
      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskData = {
      ...formData,
      due_date: formData.due_date || null,
      project_id: formData.project_id || null,
    };
    if (editingTask) {
      const { error } = await supabase
        .from('tasks')
        .update({ ...taskData, updated_at: new Date().toISOString() })
        .eq('id', editingTask.id);
      if (error) { console.error(error); return; }
    } else {
      const { error } = await supabase.from('tasks').insert([taskData]);
      if (error) { console.error(error); return; }
    }
    setShowModal(false);
    resetForm();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { console.error(error); return; }
    fetchData();
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', task.id);
    if (error) { console.error(error); return; }
    fetchData();
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', priority: 'medium', status: 'todo', due_date: '', project_id: '' });
    setEditingTask(null);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      project_id: task.project_id || '',
    });
    setShowModal(true);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getProjectName = (pid: string | null) =>
    pid ? projects.find((p) => p.id === pid)?.name : null;

  if (loading) return <Loading />;

  const inputCls = "w-full px-3 py-2 border border-nova-tan-100 rounded-lg bg-white focus:outline-none";
  const focusEvents = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      (e.target.style.boxShadow = '0 0 0 2px #6B9BBF'),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      (e.target.style.boxShadow = ''),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-nova-stone">Tasks</h2>
          <p className="text-nova-stone-light mt-1">Track and manage your tasks</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #6B9BBF 0%, #C4956A 100%)' }}
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nova-stone-light" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-nova-tan-100 rounded-lg bg-white focus:outline-none"
            onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #6B9BBF')}
            onBlur={(e) => (e.target.style.boxShadow = '')}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-nova-tan-100 rounded-lg bg-white focus:outline-none"
          onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #6B9BBF')}
          onBlur={(e) => (e.target.style.boxShadow = '')}
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-nova-stone-light">
          <CheckSquare className="w-12 h-12 mb-4 text-nova-blue-light" />
          <p className="text-lg font-medium text-nova-stone">No tasks found</p>
          <p className="text-sm">Create your first task to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-nova-tan-100 p-4 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <button
                onClick={() => toggleStatus(task)}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0"
                style={
                  task.status === 'completed'
                    ? { background: '#C4956A', borderColor: '#C4956A', color: 'white' }
                    : { borderColor: '#A8C4D8' }
                }
              >
                {task.status === 'completed' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium ${
                    task.status === 'completed' ? 'text-nova-stone-light line-through' : 'text-nova-stone'
                  }`}
                >
                  {task.title}
                </h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityStyles[task.priority]}`}>
                    {task.priority}
                  </span>
                  {task.due_date && (
                    <span className="flex items-center gap-1 text-xs text-nova-stone-light">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                  {task.project_id && (
                    <span className="text-xs text-nova-blue">{getProjectName(task.project_id)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(task)}
                  className="p-2 text-nova-stone-light hover:text-nova-blue hover:bg-nova-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 text-nova-stone-light hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border border-nova-tan-100">
            <h3 className="text-xl font-bold text-nova-stone mb-4">
              {editingTask ? 'Edit Task' : 'New Task'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-1">Title</label>
                <input type="text" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputCls} {...focusEvents} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-nova-stone mb-1">Description</label>
                <textarea value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputCls} {...focusEvents} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nova-stone mb-1">Priority</label>
                  <select value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskFormData['priority'] })}
                    className={inputCls} {...focusEvents}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nova-stone mb-1">Status</label>
                  <select value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskFormData['status'] })}
                    className={inputCls} {...focusEvents}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nova-stone mb-1">Due Date</label>
                  <input type="date" value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className={inputCls} {...focusEvents} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nova-stone mb-1">Project</label>
                  <select value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className={inputCls} {...focusEvents}>
                    <option value="">No Project</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
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
                  {editingTask ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
