import { Utensils } from 'lucide-react';

interface FooterProps {
  onNavigate: (id: string) => void;
  navItems: { id: string; label: string }[];
}

export default function Footer({ onNavigate, navItems }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cinema-alt border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-cinema-amber flex items-center justify-center">
                <Utensils className="w-4 h-4 text-cinema-bg" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-cinema-text font-bold text-sm">
                  SRM AP Mess Intelligence
                </div>
                <div className="text-cinema-amber text-xs font-semibold">Campus Dining Platform</div>
              </div>
            </div>
            <p className="text-cinema-secondary text-xs leading-relaxed max-w-xs">
              A campus dining information platform for students to check wait
              times, explore menus, rate food, and plan meals.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-cinema-text text-sm font-semibold mb-3">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="text-cinema-secondary text-sm hover:text-cinema-amber transition-colors duration-300 text-left w-fit"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-cinema-text text-sm font-semibold mb-3">About</h4>
            <p className="text-cinema-secondary text-xs leading-relaxed">
              This is a student-facing prototype. Mess status comes from
              Supabase, while menus remain demo content and AI wait estimates
              use synthetic training data. All three messes share the same
              timetable.
            </p>
            <p className="text-cinema-secondary/40 text-xs mt-3">
              Not officially endorsed by SRM University.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-cinema-secondary/40 text-xs">
            &copy; {currentYear} SRM AP Campus Mess Intelligence
          </p>
          <p className="text-cinema-secondary/40 text-xs">
            Built for campus dining
          </p>
        </div>
      </div>
    </footer>
  );
}
