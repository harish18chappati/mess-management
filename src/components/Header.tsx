import { useEffect, useRef, useState } from 'react';
import { Utensils, Menu, X } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
}

interface HeaderProps {
  navItems: NavItem[];
  activeSection: string;
  onNavigate: (id: string) => void;
}

export default function Header({ navItems, activeSection, onNavigate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    function handleScroll() {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          tickingRef.current = false;
        });
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleNavClick(id: string) {
    onNavigate(id);
    setMobileOpen(false);
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-cinema-bg/85 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('welcome')}
            className="flex items-center gap-2.5 group transition-transform duration-300 hover:scale-[1.02]"
            aria-label="SRM AP Campus Mess Intelligence — Home"
          >
            <div className="w-9 h-9 rounded-lg bg-cinema-amber flex items-center justify-center transition-all duration-300 group-hover:shadow-amber-glow">
              <Utensils className="w-4 h-4 text-cinema-bg" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="text-cinema-text font-bold text-sm leading-tight">SRM AP</div>
              <div className="text-cinema-amber text-[10px] font-semibold tracking-wide leading-tight">
                Mess Intelligence
              </div>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-2 text-sm font-medium transition-colors duration-300 ${
                    isActive ? 'text-cinema-amber' : 'text-cinema-secondary hover:text-cinema-text'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-3 right-3 h-px bg-cinema-amber transition-all duration-300 ${
                      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-cinema-text hover:bg-white/5 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav className="md:hidden bg-cinema-bg/95 backdrop-blur-xl border-t border-white/10 animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-cinema-amber bg-cinema-amber/5'
                      : 'text-cinema-secondary hover:text-cinema-text hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
