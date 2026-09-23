import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDownRight, ArrowRight, ArrowUpRight, MapPin, Menu, Navigation, Phone, Star, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();

const navItems = [
  { label: 'Menu', href: '#menu' },
  { label: 'Experience', href: '#experience' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact', href: '#contact' },
];

const menuItems = [
  {
    index: '01',
    category: 'Starter',
    name: 'Crispy Bites',
    description: 'The first hello. Golden, crackling, made for passing around.',
    image: '/crispy-bites.png',
    tone: 'from-[#6d3b27] to-[#2d211b]',
  },
  {
    index: '02',
    category: 'Main',
    name: 'Signature Plates',
    description: 'The reason to stay. Big flavour, considered right down to the last detail.',
    image: '/signature-plate.png',
    tone: 'from-[#a66b31] to-[#402c20]',
  },
  {
    index: '03',
    category: 'Sides',
    name: 'Golden Fries',
    description: 'The ones that disappear first. Crisp edges, soft centres, no regrets.',
    image: '',
    tone: 'from-[#b78b42] via-[#7a4b28] to-[#2f231c]',
  },
];

function TokyoLogo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className={`group flex items-start gap-2 ${compact ? 'scale-90 origin-left' : ''}`} data-testid="link-logo">
      <span className="mt-[3px] h-2 w-2 rounded-full bg-[#cf9e54] transition-transform duration-300 group-hover:scale-125" />
      <span>
        <span className="block font-mono text-[0.68rem] font-medium tracking-[0.26em] text-[#f1eadb]">TOKYO</span>
        <span className="mt-1 block font-mono text-[0.48rem] tracking-[0.26em] text-[#cf9e54]">BY LYA</span>
      </span>
    </a>
  );
}

function App() {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.12 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [navOpen]);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="tokyo-page grain min-h-[100dvh]">
      <header className="absolute inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
          <TokyoLogo />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="font-mono text-[0.61rem] uppercase tracking-[0.18em] text-[#d6ccba] transition-colors hover:text-[#cf9e54]" data-testid={`link-nav-${item.label.toLowerCase()}`}>
                {item.label}
              </a>
            ))}
            <a href="tel:09125984938" className="group flex items-center gap-2 font-mono text-[0.61rem] uppercase tracking-[0.18em] text-[#cf9e54]" data-testid="link-call-header">
              <Phone size={13} strokeWidth={1.5} className="transition-transform group-hover:rotate-12" /> Call Us
            </a>
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <MapPin size={13} strokeWidth={1.5} className="text-[#cf9e54]" />
            <span className="font-mono text-[0.6rem] tracking-[0.16em] text-[#d6ccba]">IKOYI • LAGOS</span>
          </div>
          <button type="button" onClick={() => setNavOpen((open) => !open)} className="relative z-50 flex h-10 w-10 items-center justify-end text-[#f1eadb] lg:hidden" aria-label={navOpen ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
            {navOpen ? <X size={24} strokeWidth={1.3} /> : <Menu size={24} strokeWidth={1.3} />}
          </button>
        </div>
        {navOpen && (
          <div className="absolute inset-x-0 top-0 min-h-[100dvh] bg-[#211d17] px-6 pt-28 lg:hidden">
            <div className="absolute right-6 top-7"><TokyoLogo compact /></div>
            <div className="section-rule mb-10" />
            <p className="eyebrow mb-8">Navigate the evening</p>
            <nav className="flex flex-col gap-5">
              {navItems.map((item, index) => (
                <a key={item.href} href={item.href} onClick={closeNav} className="display-serif text-5xl text-[#f1eadb]" data-testid={`link-mobile-${item.label.toLowerCase()}`}>
                  <span className="mr-3 font-mono text-[0.62rem] align-middle text-[#cf9e54]">0{index + 1}</span>{item.label}
                </a>
              ))}
              <a href="tel:09125984938" onClick={closeNav} className="mt-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-[#cf9e54]" data-testid="link-mobile-call">
                <Phone size={14} /> 0912 598 4938
              </a>
            </nav>
            <div className="absolute bottom-10 left-6 flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.18em] text-[#a99d8a]">
              <MapPin size={13} className="text-[#cf9e54]" /> IKOYI • LAGOS
            </div>
          </div>
        )}
      </header>

      <main id="top">
        <section className="hero-glow relative min-h-[760px] overflow-hidden border-b border-[#f1eadb]/10 sm:min-h-[820px]">
          <div className="absolute inset-y-0 right-0 w-full lg:w-[65%]">
            <img src="/tokyo-hero.png" alt="Warmly lit Tokyo by LYA dining room" className="h-full w-full object-cover opacity-75 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#211d17] via-[#211d17]/72 to-[#211d17]/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#211d17] via-transparent to-[#211d17]/30" />
          </div>
          <div className="absolute bottom-0 left-[8%] top-32 hidden w-px bg-[#f1eadb]/10 lg:block" />
          <div className="relative mx-auto flex min-h-[760px] max-w-[1440px] flex-col justify-end px-5 pb-16 pt-40 sm:min-h-[820px] sm:px-8 sm:pb-20 lg:px-12 lg:pb-28">
            <div className="max-w-[760px]">
              <p className="eyebrow fade-up mb-7 flex items-center gap-3"><span className="h-px w-10 bg-[#cf9e54]" /> Ikoyi, Lagos · Est. for tonight</p>
              <h1 className="display-serif fade-up-delay max-w-[680px] text-[clamp(4.2rem,11vw,9.5rem)] leading-[0.82] tracking-[-0.045em] text-[#f1eadb]">
                A table worth <em className="text-[#cf9e54]">talking</em> about.
              </h1>
              <div className="fade-up-delay-2 mt-9 flex max-w-[440px] flex-col gap-7 sm:flex-row sm:items-end">
                <p className="max-w-[285px] text-[0.9rem] leading-[1.7] text-[#c3b7a3]">Great food, good company, and the kind of memorable moments that start with “one more round.”</p>
                <a href="#menu" className="link-arrow flex shrink-0 items-center gap-3 border-b border-[#cf9e54] pb-3 font-mono text-[0.65rem] uppercase tracking-[0.17em] text-[#cf9e54]" data-testid="link-explore-menu">
                  Explore the menu <ArrowDownRight size={16} strokeWidth={1.2} />
                </a>
              </div>
            </div>
            <div className="mt-16 flex items-center justify-between border-t border-[#f1eadb]/15 pt-5 sm:mt-24 lg:max-w-[680px]">
              <p className="font-mono text-[0.59rem] uppercase tracking-[0.18em] text-[#9e9281]">Open this evening</p>
              <a href="tel:09125984938" className="flex items-center gap-2 font-mono text-[0.59rem] uppercase tracking-[0.15em] text-[#cf9e54]" data-testid="link-hero-call"><Phone size={13} /> Call to enquire</a>
            </div>
          </div>
          <div className="absolute bottom-8 right-6 hidden -rotate-90 font-mono text-[0.57rem] uppercase tracking-[0.22em] text-[#8c8070] lg:block">Scroll to linger</div>
        </section>

        <section id="experience" className="relative mx-auto max-w-[1440px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
            <div className="reveal">
              <p className="eyebrow mb-5">The dining promise</p>
              <h2 className="display-serif max-w-[430px] text-[clamp(3.3rem,6vw,6.1rem)] leading-[0.87] tracking-[-0.04em] text-[#f1eadb]">Come for the <em className="text-[#cf9e54]">flavour.</em><br />Stay for the feeling.</h2>
            </div>
            <div className="reveal pt-1 lg:pt-12">
              <div className="grid gap-10 sm:grid-cols-[1fr_1.4fr]">
                <div>
                  <div className="section-rule mb-4" />
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#cf9e54]">01 / The mood</p>
                </div>
                <div>
                  <p className="text-[1.05rem] leading-[1.75] text-[#d6ccba]">Tokyo is where Ikoyi comes to loosen its tie. A warm room, a generous table, and an evening that takes its time.</p>
                  <p className="mt-6 text-[0.9rem] leading-[1.75] text-[#988d7d]">Built for the spontaneous dinner, the long-awaited catch-up, and those nights that quietly become stories.</p>
                </div>
              </div>
              <div className="mt-16 flex flex-wrap gap-x-8 gap-y-5 border-t border-[#f1eadb]/15 pt-6">
                <p className="font-mono text-[0.61rem] uppercase tracking-[0.16em] text-[#a99d8a]"><span className="mr-2 text-[#cf9e54]">⌁</span>Dine-in</p>
                <p className="font-mono text-[0.61rem] uppercase tracking-[0.16em] text-[#a99d8a]"><span className="mr-2 text-[#cf9e54]">⌁</span>Relaxed dining</p>
                <p className="font-mono text-[0.61rem] uppercase tracking-[0.16em] text-[#a99d8a]"><span className="mr-2 text-[#cf9e54]">⌁</span>9PM+</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 pb-24 sm:px-8 sm:pb-32 lg:px-12">
          <div className="relative min-h-[360px] overflow-hidden border border-[#f1eadb]/15 bg-[#30241d] sm:min-h-[440px]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(207,158,84,.34),transparent_26%),radial-gradient(ellipse_at_78%_75%,rgba(145,59,34,.45),transparent_35%)]" />
            <div className="absolute -right-8 top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full border border-[#cf9e54]/35 sm:right-[8%] sm:h-[500px] sm:w-[500px]" />
            <div className="absolute -right-2 top-1/2 h-[240px] w-[240px] -translate-y-1/2 rounded-full border border-[#f1eadb]/15 sm:right-[14%] sm:h-[340px] sm:w-[340px]" />
            <div className="relative flex min-h-[360px] flex-col justify-between p-6 sm:min-h-[440px] sm:p-10 lg:p-14">
              <div className="flex items-start justify-between">
                <p className="eyebrow">Tonight at Tokyo</p>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#a99d8a]">Keffi Street / 06°27′N</span>
              </div>
              <div className="max-w-[560px]">
                <p className="display-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.84] tracking-[-0.04em] text-[#f1eadb]">Made for cravings,<br /><em className="text-[#cf9e54]">conversations</em><br />& celebrations.</p>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-3 pt-8">
                {['Ikoyi', '9 Keffi St', 'Evening atmosphere', 'Premium experience'].map((item, i) => (
                  <span key={item} className="font-mono text-[0.58rem] uppercase tracking-[0.15em] text-[#d6ccba]"><span className="mr-2 text-[#cf9e54]">0{i + 1}</span>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="menu" className="border-y border-[#f1eadb]/10 bg-[#29211b]">
          <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
            <div className="reveal mb-14 flex flex-col justify-between gap-7 sm:flex-row sm:items-end lg:mb-20">
              <div>
                <p className="eyebrow mb-5">The menu story</p>
                <h2 className="display-serif max-w-[600px] text-[clamp(3.5rem,7vw,7.4rem)] leading-[0.82] tracking-[-0.045em] text-[#f1eadb]">Start with a<br /><em className="text-[#cf9e54]">craving.</em></h2>
              </div>
              <p className="max-w-[280px] text-[0.88rem] leading-[1.7] text-[#a99d8a]">A short, confident edit of the things we love to put in the middle of the table.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {menuItems.map((item, index) => (
                <article key={item.name} className="menu-card reveal group border border-[#f1eadb]/15 bg-[#211d17]">
                  <div className={`relative h-[340px] overflow-hidden bg-gradient-to-br ${item.tone} sm:h-[390px]`}>
                    {item.image ? <img src={item.image} alt={item.name} className="menu-card-image h-full w-full object-cover opacity-85 mix-blend-screen" /> : (
                      <div className="absolute inset-0">
                        <div className="absolute left-1/2 top-[47%] h-[148px] w-[245px] -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] rounded-[48%] bg-[#d9a84f] shadow-[0_20px_35px_rgba(0,0,0,.3)]" />
                        <div className="absolute left-[42%] top-[37%] h-3 w-16 rotate-[-23deg] rounded-full bg-[#f5d781] opacity-80" />
                        <div className="absolute left-[59%] top-[54%] h-2 w-14 rotate-[22deg] rounded-full bg-[#f5d781] opacity-70" />
                        <div className="absolute left-[31%] top-[59%] h-2 w-16 rotate-[14deg] rounded-full bg-[#f5d781] opacity-70" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#211d17]/75 via-transparent to-transparent" />
                    <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-[#f1eadb]/30 font-mono text-[0.58rem] text-[#f1eadb]">{item.index}</div>
                    <div className="absolute bottom-5 left-5">
                      <p className="font-mono text-[0.57rem] uppercase tracking-[0.18em] text-[#cf9e54]">{item.category}</p>
                    </div>
                  </div>
                  <div className="p-6 pb-7">
                    <h3 className="display-serif text-[2.25rem] leading-none text-[#f1eadb]">{item.name}</h3>
                    <p className="mt-4 max-w-[280px] text-[0.82rem] leading-[1.65] text-[#a99d8a]">{item.description}</p>
                    <div className="mt-7 h-px w-10 bg-[#cf9e54] transition-all duration-500 group-hover:w-20" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#a14e32]">
          <div className="absolute -right-12 -top-20 h-[330px] w-[330px] rounded-full border border-[#e6ad71]/35 sm:h-[500px] sm:w-[500px]" />
          <div className="absolute right-[14%] top-1/2 h-[180px] w-[180px] -translate-y-1/2 rounded-full border border-[#f4d1a2]/25 sm:h-[260px] sm:w-[260px]" />
          <div className="relative mx-auto flex max-w-[1440px] flex-col justify-between gap-10 px-5 py-24 sm:px-8 sm:py-32 lg:flex-row lg:items-end lg:px-12 lg:py-36">
            <div>
              <p className="eyebrow mb-6 !text-[#f5d3a4]">Make a night of it</p>
              <h2 className="display-serif max-w-[700px] text-[clamp(4rem,9vw,9.4rem)] leading-[0.8] tracking-[-0.05em] text-[#211d17]">Your next<br /><em>favourite</em><br />hangout.</h2>
            </div>
            <p className="max-w-[250px] text-[0.88rem] leading-[1.7] text-[#f8d7b0]">Come as you are. Leave a little later than planned.</p>
          </div>
        </section>

        <section id="reviews" className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
          <div className="grid gap-16 lg:grid-cols-[.75fr_1.25fr] lg:gap-24">
            <div className="reveal">
              <p className="eyebrow mb-5">Reviews</p>
              <h2 className="display-serif text-[clamp(3.4rem,6.5vw,6.5rem)] leading-[0.84] tracking-[-0.045em] text-[#f1eadb]">Good nights<br />get <em className="text-[#cf9e54]">repeated.</em></h2>
              <div className="mt-12 flex items-end gap-4">
                <span className="display-serif text-7xl leading-none text-[#cf9e54]">3.0</span>
                <div className="pb-1">
                  <div className="flex gap-1 text-[#cf9e54]">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} fill={star <= 3 ? 'currentColor' : 'none'} strokeWidth={1} />)}</div>
                  <p className="mt-2 font-mono text-[0.57rem] uppercase tracking-[0.16em] text-[#978b7a]">Google · 4 reviews</p>
                </div>
              </div>
            </div>
            <div className="reveal divide-y divide-[#f1eadb]/15 border-y border-[#f1eadb]/15">
              <blockquote className="grid gap-5 py-8 sm:grid-cols-[100px_1fr] sm:gap-10">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.17em] text-[#cf9e54]">01 / Guest</span>
                <div><p className="display-serif max-w-[510px] text-[2rem] leading-[1.05] text-[#f1eadb]">“The kind of place where the evening just starts to unfold.”</p><footer className="mt-5 font-mono text-[0.57rem] uppercase tracking-[0.15em] text-[#988d7d]">Google review · Lagos</footer></div>
              </blockquote>
              <blockquote className="grid gap-5 py-8 sm:grid-cols-[100px_1fr] sm:gap-10">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.17em] text-[#cf9e54]">02 / Guest</span>
                <div><p className="display-serif max-w-[510px] text-[2rem] leading-[1.05] text-[#f1eadb]">“Good energy, great plates. We stayed much longer than planned.”</p><footer className="mt-5 font-mono text-[0.57rem] uppercase tracking-[0.15em] text-[#988d7d]">Google review · Ikoyi</footer></div>
              </blockquote>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-[#f1eadb]/10 bg-[#29211b]">
          <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1fr_1fr] lg:gap-24 lg:px-12 lg:py-36">
            <div className="reveal">
              <p className="eyebrow mb-5">Find us tonight</p>
              <h2 className="display-serif max-w-[540px] text-[clamp(3.8rem,7.4vw,7.6rem)] leading-[0.81] tracking-[-0.05em] text-[#f1eadb]">Meet us on<br /><em className="text-[#cf9e54]">Keffi Street.</em></h2>
              <a href="tel:09125984938" className="mt-10 inline-flex items-center gap-3 border-b border-[#cf9e54] pb-3 font-mono text-[0.67rem] uppercase tracking-[0.17em] text-[#cf9e54]" data-testid="link-contact-phone"><Phone size={15} /> 0912 598 4938</a>
            </div>
            <div className="reveal lg:pt-14">
              <div className="border-y border-[#f1eadb]/15 py-6">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#cf9e54]">Address</p>
                <p className="mt-5 max-w-[330px] text-[1rem] leading-[1.7] text-[#d6ccba]">9 Keffi St, off Awolowo Road,<br />Ikoyi, Eti Osa, Lagos 101233</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-5 pt-7">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#a99d8a]"><span className="mr-2 text-[#cf9e54]">Open</span> Evening atmosphere</p>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#a99d8a]"><span className="mr-2 text-[#cf9e54]">Type</span> Dine-in</p>
              </div>
              <a href="https://www.google.com/maps/search/?api=1&query=9%20Keffi%20St%2C%20Ikoyi%2C%20Lagos" target="_blank" rel="noreferrer" className="link-arrow mt-12 inline-flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.17em] text-[#cf9e54]" data-testid="link-directions">
                <Navigation size={15} strokeWidth={1.3} /> Get directions <ArrowUpRight size={15} strokeWidth={1.3} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#f1eadb]/10 bg-[#211d17]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <TokyoLogo />
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#8f8373]">Ikoyi, Lagos · Dine-in</p>
          <a href="#top" className="link-arrow flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#cf9e54]" data-testid="link-back-top">Back to top <ArrowRight size={14} strokeWidth={1.3} /></a>
        </div>
      </footer>
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary resetKey="tokyo-home">{children}</ErrorBoundary>;
}

export default function RootApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RoutedErrorBoundary>
          <App />
        </RoutedErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}