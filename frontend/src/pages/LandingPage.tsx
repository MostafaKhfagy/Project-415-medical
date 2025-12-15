import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Stethoscope,
  MessageSquare,
  FileText,
  Shield,
  Clock,
  Brain,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

const LandingPage = () => {
  const { isLoggedIn } = useAuth();

  const features = [
    {
      icon: MessageSquare,
      title: 'تحليل الأعراض',
      description:
        'وصف أعراضك بلغة طبيعية واحصل على رؤى صحية مدعومة بالذكاء الاصطناعي.',
    },
    {
      icon: FileText,
      title: 'رفع المستندات',
      description:
        'ارفع الوصفات الطبية ونتائج الفحوصات لتتبع صحي شامل وتحليل دقيق.',
    },
    {
      icon: Brain,
      title: 'فرز ذكي',
      description:
        'احصل على توصيات ذكية حول مستوى الإلحاح والخطوات التالية لأعراضك.',
    },
    {
      icon: Clock,
      title: 'متاح 24/7',
      description:
        'الوصول إلى الإرشادات الطبية في أي وقت ومن أي مكان - بدون مواعيد.',
    },
  ];

  const benefits = [
    'تقييم فوري للأعراض',
    'تخزين آمن للسجلات الصحية',
    'رؤى صحية مخصصة',
    'تتبع الأدوية',
    'تفسير نتائج الفحوصات',
    'تذكيرات المتابعة',
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 gradient-subtle" />
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Stethoscope className="h-4 w-4" />
              <span>مساعد طبي بالذكاء الاصطناعي</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl animate-fade-in">
              رفيقك الصحي{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                الشخصي
              </span>
            </h1>

            <p className="mb-10 text-lg text-muted-foreground md:text-xl animate-slide-up" style={{ animationDelay: '100ms' }}>
              احصل على إرشادات صحية فورية مدعومة بالذكاء الاصطناعي. صف أعراضك، ارفع المستندات الطبية،
              واحصل على توصيات فرز مخصصة – كل ذلك في منصة واحدة آمنة.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to={isLoggedIn ? '/chat' : '/register'}>
                <Button size="xl" variant="hero">
                  {isLoggedIn ? 'الذهاب للمحادثة' : 'ابدأ الآن'}
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
              {!isLoggedIn && (
                <Link to="/login">
                  <Button size="xl" variant="hero-outline">
                    تسجيل الدخول
                  </Button>
                </Link>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>متوافق مع معايير الخصوصية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>تشفير 256-bit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              كل ما تحتاجه لقرارات صحية أفضل
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              منصتنا المدعومة بالذكاء الاصطناعي تجمع بين التكنولوجيا المتقدمة والمعرفة الطبية
              لتزويدك بإرشادات صحية موثوقة.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-background p-6 shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:gradient-hero group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
                لماذا تختار مساعد الفرز الطبي؟
              </h2>
              <p className="mb-8 text-muted-foreground">
                نجمع بين الذكاء الاصطناعي المتقدم والخبرة الطبية لنقدم لك إرشادات صحية
                دقيقة ومخصصة متى احتجت إليها.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-3xl gradient-hero opacity-10 blur-2xl" />
              <div className="relative rounded-3xl border border-border bg-card p-8 shadow-card">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-hero">
                    <Stethoscope className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">مساعد الفرز الطبي</p>
                    <p className="text-xs text-muted-foreground">متصل الآن</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl rounded-tr-sm bg-assistant-bubble px-4 py-3 text-sm text-assistant-bubble-foreground">
                    مرحباً! أنا هنا لمساعدتك في فهم أعراضك. كيف تشعر اليوم؟
                  </div>
                  <div className="mr-auto max-w-[80%] rounded-2xl rounded-tl-sm bg-user-bubble px-4 py-3 text-sm text-user-bubble-foreground">
                    لدي صداع وحمى خفيفة منذ أمس.
                  </div>
                  <div className="rounded-2xl rounded-tr-sm bg-assistant-bubble px-4 py-3 text-sm text-assistant-bubble-foreground">
                    أفهم ذلك. دعني أسألك بعض الأسئلة لتقييم حالتك بشكل أفضل...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            هل أنت مستعد للسيطرة على صحتك؟
          </h2>
          <p className="mb-8 text-muted-foreground">
            انضم إلى آلاف المستخدمين الذين يثقون بمساعد الفرز الطبي لإرشاداتهم الصحية.
          </p>
          <Link to={isLoggedIn ? '/chat' : '/register'}>
            <Button size="lg" variant="hero">
              {isLoggedIn ? 'فتح المحادثة' : 'ابدأ مجاناً'}
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} مساعد الفرز الطبي. هذا مساعد ذكاء اصطناعي وليس بديلاً
            عن الاستشارة الطبية المتخصصة.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
