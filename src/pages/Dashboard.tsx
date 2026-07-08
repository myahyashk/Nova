import { useState, useEffect } from 'react';
import { supabase, Project, Task } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  FolderKanban,
  CheckSquare,
  StickyNote,
  Bookmark as BookmarkIcon,
  Code2,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Loading from '../components/Loading';

interface Stats {
  projects: number;
  tasks: number;
  tasksCompleted: number;
  notes: number;
  bookmarks: number;
  resources: number;
}

const statCards = [
  { label: 'Projects',     key: 'projects' as const, icon: FolderKanban,  grad: 'from-nova-blue to-nova-blue-dark' },
  { label: 'Total Tasks',  key: 'tasks'    as const, icon: CheckSquare,   grad: 'from-nova-tan to-nova-tan-dark' },
  { label: 'Notes',        key: 'notes'    as const, icon: StickyNote,    grad: 'from-nova-blue-light to-nova-blue' },
  { label: 'Bookmarks',    key: 'bookmarks'as const, icon: BookmarkIcon,  grad: 'from-nova-tan-light to-nova-tan' },
  { label: 'Dev Resources',key: 'resources'as const, icon: Code2,         grad: 'from-nova-blue to-nova-tan' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    projects: 0, tasks: 0, tasksCompleted: 0, notes: 0, bookmarks: 0, resources: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes, notesRes, bookmarksRes, resourcesRes] =
        await Promise.all([
          supabase.from('projects').select('*'),
          supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('notes').select('*'),
          supabase.from('bookmarks').select('*'),
          supabase.from('developer_resources').select('*'),
        ]);

      const projects = projectsRes.data || [];
      const tasks = tasksRes.data || [];

      setStats({
        projects: projects.length,
        tasks: tasks.length,
        tasksCompleted: tasks.filter((t) => t.status === 'completed').length,
        notes: notesRes.data?.length || 0,
        bookmarks: bookmarksRes.data?.length || 0,
        resources: resourcesRes.data?.length || 0,
      });

      setRecentTasks(tasks);
      setActiveProjects(projects.filter((p) => p.status === 'active').slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const completionPct = stats.tasks
    ? Math.round((stats.tasksCompleted / stats.tasks) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-nova-stone">Welcome back!</h2>
        <p className="text-nova-stone-light mt-1">Here's an overview of your workspace</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.grad} rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats[stat.key]}</p>
                <p className="text-sm text-white/80">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Progress */}
        <div className="bg-white rounded-xl border border-nova-tan-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-nova-tan" />
            <h3 className="font-semibold text-nova-stone">Task Progress</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-nova-stone-light">Completed</span>
              <span className="text-sm font-semibold text-nova-stone">
                {stats.tasksCompleted} / {stats.tasks}
              </span>
            </div>
            <div className="w-full bg-nova-cream-dark rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${completionPct}%`,
                  background: 'linear-gradient(90deg, #6B9BBF, #C4956A)',
                }}
              />
            </div>
            <p className="text-xs text-nova-stone-light text-right">{completionPct}% complete</p>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-xl border border-nova-tan-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-nova-blue" />
            <h3 className="font-semibold text-nova-stone">Recent Tasks</h3>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-nova-stone-light">No tasks yet. Create your first task!</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-2 border-b border-nova-cream-dark last:border-0"
                >
                  <span className="text-sm text-nova-stone truncate">{task.title}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                      task.status === 'completed'
                        ? 'bg-nova-tan-50 text-nova-tan-dark'
                        : task.status === 'in_progress'
                        ? 'bg-nova-blue-50 text-nova-blue-dark'
                        : 'bg-nova-cream-dark text-nova-stone-light'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white rounded-xl border border-nova-tan-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FolderKanban className="w-5 h-5 text-nova-blue" />
          <h3 className="font-semibold text-nova-stone">Active Projects</h3>
        </div>
        {activeProjects.length === 0 ? (
          <div className="flex items-center gap-2 text-nova-stone-light">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">No active projects. Start a new project!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-xl border border-nova-tan-100 bg-nova-cream hover:border-nova-blue transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <h4 className="font-medium text-nova-stone truncate">{project.name}</h4>
                </div>
                <p className="text-sm text-nova-stone-light line-clamp-2">
                  {project.description || 'No description'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
