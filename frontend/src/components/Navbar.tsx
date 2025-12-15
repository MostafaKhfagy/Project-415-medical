import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">مساعد الفرز الطبي</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 md:flex">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-muted-foreground">
                أهلاً، <span className="font-medium text-foreground">{user?.name}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">ابدأ الآن</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          {isLoggedIn ? (
            <div className="flex flex-col gap-3">
              <span className="text-sm text-muted-foreground">
                أهلاً، <span className="font-medium text-foreground">{user?.name}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="justify-start">
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">
                  ابدأ الآن
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
