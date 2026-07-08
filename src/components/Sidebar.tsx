import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  StickyNote,
  Bookmark,
  Code2,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects',  icon: FolderKanban,    label: 'Projects' },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks' },
  { to: '/notes',     icon: StickyNote,      label: 'Notes' },
  { to: '/bookmarks', icon: Bookmark,        label: 'Bookmarks' },
  { to: '/resources', icon: Code2,           label: 'Developer Resources' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-nova-tan-100 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'text-white shadow-md'
                  : 'text-nova-stone hover:bg-nova-tan-50 hover:text-nova-tan-dark'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background:
                      'linear-gradient(135deg, #6B9BBF 0%, #C4956A 100%)',
                  }
                : {}
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
