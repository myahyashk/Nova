import { LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScrollRotation } from '../hooks/useScrollRotation';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const rotation = useScrollRotation(0.6);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/projects')) return 'Projects';
    if (path.startsWith('/tasks')) return 'Tasks';
    if (path.startsWith('/notes')) return 'Notes';
    if (path.startsWith('/bookmarks')) return 'Bookmarks';
    if (path.startsWith('/resources')) return 'Developer Resources';
    return 'Nova';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="h-16 bg-white border-b border-nova-tan-100 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Logo with scroll-driven spin */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 flex items-center justify-center nova-logo-glow select-none"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <img
              src="/Nova_Logo_Icon.png"
              alt="Nova"
              className="w-9 h-9 object-contain"
              draggable={false}
            />
          </div>
          <span
            className="font-bold text-xl tracking-tight"
            style={{ color: '#4A7A9B' }}
          >
            Nova
          </span>
        </div>

        <div className="h-6 w-px bg-nova-tan-100 mx-3" />
        <h1 className="text-lg font-semibold text-nova-stone">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-nova-blue-50 rounded-full border border-nova-blue-100">
          <User className="w-4 h-4 text-nova-blue" />
          <span className="text-sm text-nova-blue-dark font-medium">
            {user?.email?.split('@')[0]}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-nova-stone hover:text-nova-tan-dark hover:bg-nova-tan-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </header>
  );
}
