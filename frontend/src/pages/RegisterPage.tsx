import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password validation
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'حقول مفقودة',
        description: 'يرجى ملء جميع الحقول.',
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        variant: 'destructive',
        title: 'كلمة مرور ضعيفة',
        description: 'يرجى استيفاء جميع متطلبات كلمة المرور.',
      });
      return;
    }

    if (!doPasswordsMatch) {
      toast({
        variant: 'destructive',
        title: 'كلمات المرور غير متطابقة',
        description: 'يرجى التأكد من تطابق كلمتي المرور.',
      });
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({ name, email, password });
      toast({
        title: 'تم إنشاء الحساب!',
        description: 'يرجى تسجيل الدخول بحسابك الجديد.',
      });
      navigate('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'فشل التسجيل',
        description: error instanceof Error ? error.message : 'تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Right side - Decorative (appears first in RTL) */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMmMtNS41MjMgMC0xMC00LjQ3Ny0xMC0xMHM0LjQ3Ny0xMCAxMC0xMCAxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-center text-primary-foreground">
            <h2 className="mb-4 text-3xl font-bold">انضم إلى مساعد الفرز الطبي اليوم</h2>
            <p className="text-lg opacity-90">
              أنشئ حسابك المجاني واحصل على وصول فوري للإرشادات الصحية المدعومة بالذكاء الاصطناعي،
              وتحليل الأعراض، والتوصيات المخصصة.
            </p>
          </div>
        </div>
      </div>

      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">مساعد الفرز الطبي</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">إنشاء حسابك</h1>
            <p className="mt-2 text-muted-foreground">
              ابدأ رحلتك نحو رؤى صحية أفضل
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                type="text"
                placeholder="أحمد محمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                dir="ltr"
                className="text-left"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="أنشئ كلمة مرور قوية"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  dir="ltr"
                  className="text-left"
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password requirements */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  {[
                    { check: passwordChecks.length, text: '8 أحرف على الأقل' },
                    { check: passwordChecks.uppercase, text: 'حرف كبير واحد' },
                    { check: passwordChecks.lowercase, text: 'حرف صغير واحد' },
                    { check: passwordChecks.number, text: 'رقم واحد' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2 text-xs">
                      <CheckCircle
                        className={`h-3.5 w-3.5 ${item.check ? 'text-success' : 'text-muted-foreground'}`}
                      />
                      <span className={item.check ? 'text-success' : 'text-muted-foreground'}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="أكد كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                dir="ltr"
                className="text-left"
              />
              {confirmPassword && (
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle
                    className={`h-3.5 w-3.5 ${doPasswordsMatch ? 'text-success' : 'text-muted-foreground'}`}
                  />
                  <span className={doPasswordsMatch ? 'text-success' : 'text-muted-foreground'}>
                    كلمات المرور متطابقة
                  </span>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                'إنشاء حساب'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
