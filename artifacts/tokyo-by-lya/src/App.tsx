import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronLeft, Clipboard, LoaderCircle, MapPin, Menu, Navigation, Phone, Plus, RefreshCw, Search, Star, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import { getGetOrderQueryKey, getListOrdersQueryKey, useCreateOrder, useGetOrder, useListMenuItems, useListOrders, useUpdateOrderPayment } from '@workspace/api-client-react';
import type { MenuItem, Order, OrderInputFulfillmentMethod } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { AdminMfaGate, AuthPanel } from '@/components/auth-panel';
import { AuthProvider, clientAdminEmails, useAuth } from '@/lib/auth';
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

function HomePage() {
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
            <div className="hidden items-center gap-4 lg:flex">
              <Link href="/order" className="border-b border-[#cf9e54] pb-2 font-mono text-[0.61rem] uppercase tracking-[0.18em] text-[#cf9e54] transition-colors hover:text-[#f1eadb]" data-testid="link-order-header">Order for tonight</Link>
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
                 <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                 <a href="#menu" className="link-arrow flex shrink-0 items-center gap-3 border-b border-[#cf9e54] pb-3 font-mono text-[0.65rem] uppercase tracking-[0.17em] text-[#cf9e54]" data-testid="link-explore-menu">
                  Explore the menu <ArrowDownRight size={16} strokeWidth={1.2} />
                </a>
                 <Link href="/order" className="link-arrow flex shrink-0 items-center gap-3 border-b border-[#cf9e54] pb-3 font-mono text-[0.65rem] uppercase tracking-[0.17em] text-[#cf9e54]" data-testid="link-order-hero">
                   Order for pickup or delivery <ArrowRight size={16} strokeWidth={1.2} />
                 </Link>
                 </div>
              </div>
            </div>
            <div className="mt-16 flex items-center justify-between border-t border-[#f1eadb]/15 pt-5 sm:mt-24 lg:max-w-[680px]">
              <p className="font-mono text-[0.59rem] uppercase tracking-[0.18em] text-[#9e9281]">Open this evening</p>
               <div className="flex items-center gap-5">
               <Link href="/order" className="flex items-center gap-2 font-mono text-[0.59rem] uppercase tracking-[0.15em] text-[#cf9e54]" data-testid="link-order-hero-strip"><Plus size={13} /> Order ahead</Link>
               <a href="tel:09125984938" className="flex items-center gap-2 font-mono text-[0.59rem] uppercase tracking-[0.15em] text-[#cf9e54]" data-testid="link-hero-call"><Phone size={13} /> Call to enquire</a>
               </div>
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
           <Link href="/order" className="link-arrow flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#cf9e54]" data-testid="link-order-footer">Order for tonight <ArrowRight size={14} strokeWidth={1.3} /></Link>
          <a href="#top" className="link-arrow flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#cf9e54]" data-testid="link-back-top">Back to top <ArrowRight size={14} strokeWidth={1.3} /></a>
        </div>
      </footer>
    </div>
  );
}

const fallbackMenu: MenuItem[] = [
  { id: 'crispy-bites', name: 'Crispy Bites', category: 'Starter', description: 'Golden, crackling, made for passing around.', price: 35000 },
  { id: 'signature-plates', name: 'Signature Plates', category: 'Main', description: 'Big flavour, considered right down to the last detail.', price: 20000 },
  { id: 'golden-fries', name: 'Golden Fries', category: 'Sides', description: 'Crisp edges, soft centres, no regrets.', price: 15000 },
];

const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`;

function OrderHeader({ eyebrow = 'Tokyo by LYA / Order desk' }: { eyebrow?: string }) {
  return (
    <header className="border-b border-[#f1eadb]/10 bg-[#211d17]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-start gap-2" data-testid="link-order-logo">
          <span className="mt-[3px] h-2 w-2 rounded-full bg-[#cf9e54] transition-transform group-hover:scale-125" />
          <span>
            <span className="block font-mono text-[0.68rem] font-medium tracking-[0.26em] text-[#f1eadb]">TOKYO</span>
            <span className="mt-1 block font-mono text-[0.48rem] tracking-[0.26em] text-[#cf9e54]">BY LYA</span>
          </span>
        </Link>
        <div className="text-right">
          <p className="eyebrow">{eyebrow}</p>
          <Link href="/" className="mt-2 inline-flex items-center gap-2 font-mono text-[0.59rem] uppercase tracking-[0.16em] text-[#a99d8a] transition-colors hover:text-[#cf9e54]" data-testid="link-back-home">
            <ChevronLeft size={13} /> Back to restaurant
          </Link>
        </div>
      </div>
    </header>
  );
}

function OrderFrame({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) {
  return <div className="tokyo-page grain min-h-[100dvh] bg-[#211d17] text-[#f1eadb]"><OrderHeader eyebrow={eyebrow} />{children}</div>;
}

function MenuLoading() {
  return <div className="space-y-4" data-testid="loading-menu"><div className="h-28 animate-pulse border border-[#f1eadb]/10 bg-[#29211b]" /><div className="h-28 animate-pulse border border-[#f1eadb]/10 bg-[#29211b]" /><div className="h-28 animate-pulse border border-[#f1eadb]/10 bg-[#29211b]" /></div>;
}

function QuantityControl({ value, onDecrease, onIncrease, name }: { value: number; onDecrease: () => void; onIncrease: () => void; name: string }) {
  return (
    <div className="flex items-center border border-[#f1eadb]/20" aria-label={`Quantity for ${name}`}>
      <button type="button" onClick={onDecrease} disabled={value === 0} className="flex h-9 w-9 items-center justify-center text-[#cf9e54] transition-colors hover:bg-[#cf9e54]/10 disabled:cursor-not-allowed disabled:opacity-35" data-testid={`button-decrease-${name.toLowerCase().replaceAll(' ', '-')}`} aria-label={`Decrease ${name} quantity`}>−</button>
      <span className="flex h-9 w-8 items-center justify-center border-x border-[#f1eadb]/20 font-mono text-xs text-[#f1eadb]" data-testid={`text-quantity-${name.toLowerCase().replaceAll(' ', '-')}`}>{value}</span>
      <button type="button" onClick={onIncrease} disabled={value >= 20} className="flex h-9 w-9 items-center justify-center text-[#cf9e54] transition-colors hover:bg-[#cf9e54]/10 disabled:cursor-not-allowed disabled:opacity-35" data-testid={`button-increase-${name.toLowerCase().replaceAll(' ', '-')}`} aria-label={`Increase ${name} quantity`}>+</button>
    </div>
  );
}

function OrderPage() {
  const { user } = useAuth();
  const { data: menu, isLoading: menuLoading, isError: menuError, refetch: refetchMenu } = useListMenuItems();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const items = menu?.length ? menu : fallbackMenu;
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [fulfillment, setFulfillment] = useState<OrderInputFulfillmentMethod>('pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const selectedItems = items.filter((item) => (quantities[item.id] ?? 0) > 0);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * (quantities[item.id] ?? 0), 0);

  const adjust = (id: string, amount: number) => {
    setQuantities((current) => ({ ...current, [id]: Math.max(0, Math.min(20, (current[id] ?? 0) + amount)) }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    if (!user) return setFormError('Sign in before placing an order.');
    if (!selectedItems.length) return setFormError('Choose at least one plate before continuing.');
    if (customerName.trim().length < 2) return setFormError('Please enter your name.');
    if (customerPhone.trim().length < 7) return setFormError('Please enter a valid phone number.');
    if (fulfillment === 'delivery' && deliveryAddress.trim().length < 8) return setFormError('Please enter the delivery address.');
    createOrder.mutate({
      data: {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        fulfillmentMethod: fulfillment,
        deliveryAddress: fulfillment === 'delivery' ? deliveryAddress.trim() : null,
        notes: notes.trim() || null,
        items: selectedItems.map((item) => ({ menuItemId: item.id, quantity: quantities[item.id] ?? 0 })),
      },
    }, {
      onSuccess: (order) => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(order.orderNumber) });
        setLocation(`/order/${order.orderNumber}`);
      },
      onError: () => setFormError('We could not place that order. Please try again or call the restaurant.'),
    });
  };

  return (
    <OrderFrame>
      <main className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="mb-12 max-w-[700px]">
          <p className="eyebrow mb-5">Pickup or delivery · Bank transfer</p>
          <h1 className="display-serif text-[clamp(4rem,8vw,8rem)] leading-[0.82] tracking-[-0.05em]">Make it a<br /><em className="text-[#cf9e54]">Tokyo night.</em></h1>
          <p className="mt-7 max-w-[470px] text-[0.94rem] leading-[1.75] text-[#b9ad9c]">Choose your plates, tell us where to send them, then transfer the subtotal. Our team will confirm delivery and any delivery fee personally.</p>
          <div className="mt-8 max-w-[560px]"><AuthPanel compact /></div>
        </div>
        <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1.35fr_.65fr] lg:gap-16">
          <section aria-labelledby="menu-heading">
            <div className="mb-5 flex items-end justify-between border-b border-[#f1eadb]/15 pb-4">
              <div><p className="eyebrow mb-2">01 / The edit</p><h2 id="menu-heading" className="display-serif text-4xl text-[#f1eadb]">Choose your plates</h2></div>
              {menuError && <button type="button" onClick={() => refetchMenu()} className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-[#cf9e54]" data-testid="button-retry-menu"><RefreshCw size={13} /> Retry</button>}
            </div>
            {menuLoading && !menu ? <MenuLoading /> : (
              <div className="divide-y divide-[#f1eadb]/15 border-y border-[#f1eadb]/15">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between gap-5 py-6" data-testid={`row-menu-${item.id}`}>
                    <div className="flex min-w-0 items-start gap-4"><span className="mt-1 font-mono text-[0.58rem] text-[#cf9e54]">0{index + 1}</span><div><h3 className="display-serif text-[2rem] leading-none text-[#f1eadb]">{item.name}</h3><p className="mt-2 max-w-[360px] text-[0.78rem] leading-[1.55] text-[#958a7a]">{item.description}</p></div></div>
                    <div className="flex shrink-0 flex-col items-end gap-3"><span className="font-mono text-[0.7rem] text-[#cf9e54]">{naira(item.price)}</span><QuantityControl name={item.name} value={quantities[item.id] ?? 0} onDecrease={() => adjust(item.id, -1)} onIncrease={() => adjust(item.id, 1)} /></div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-12">
              <p className="eyebrow mb-5">02 / The handoff</p>
              <fieldset>
                <legend className="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#d6ccba]">How should we bring it to you?</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(['pickup', 'delivery'] as const).map((method) => (
                    <label key={method} className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${fulfillment === method ? 'border-[#cf9e54] bg-[#cf9e54]/[.06]' : 'border-[#f1eadb]/15 hover:border-[#f1eadb]/35'}`} data-testid={`label-fulfillment-${method}`}>
                      <input type="radio" name="fulfillment" value={method} checked={fulfillment === method} onChange={() => setFulfillment(method)} className="mt-1 accent-[#cf9e54]" data-testid={`radio-fulfillment-${method}`} />
                      <span><span className="block font-mono text-[0.67rem] uppercase tracking-[0.16em] text-[#f1eadb]">{method === 'pickup' ? 'Pick up at Ikoyi' : 'Deliver to me'}</span><span className="mt-2 block text-[0.73rem] leading-[1.5] text-[#958a7a]">{method === 'pickup' ? 'Ready when you arrive at 9 Keffi St.' : 'Delivery fee is confirmed by staff after your order.'}</span></span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="block"><span className="field-label">Your name</span><input required minLength={2} value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="field-input" placeholder="Name for the order" data-testid="input-customer-name" /></label>
                <label className="block"><span className="field-label">Phone number</span><input required minLength={7} value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="field-input" placeholder="0912 598 4938" data-testid="input-customer-phone" /></label>
              </div>
              {fulfillment === 'delivery' && <label className="mt-5 block"><span className="field-label">Delivery address</span><textarea required minLength={8} value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} className="field-input min-h-24 resize-y" placeholder="Street, landmark, area" data-testid="input-delivery-address" /></label>}
              <label className="mt-5 block"><span className="field-label">Notes <span className="text-[#817667]">(optional)</span></span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="field-input min-h-20 resize-y" placeholder="Anything the kitchen should know?" data-testid="input-order-notes" /></label>
            </div>
          </section>
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="border border-[#f1eadb]/15 bg-[#29211b] p-6 sm:p-8">
              <p className="eyebrow mb-4">03 / Transfer details</p>
              <h2 className="display-serif text-4xl text-[#f1eadb]">Your order</h2>
              <div className="mt-6 divide-y divide-[#f1eadb]/10 border-y border-[#f1eadb]/10">
                {selectedItems.length ? selectedItems.map((item) => <div key={item.id} className="flex justify-between gap-3 py-3 font-mono text-[0.68rem]"><span className="text-[#b9ad9c]">{quantities[item.id]} × {item.name}</span><span className="text-[#f1eadb]">{naira(item.price * (quantities[item.id] ?? 0))}</span></div>) : <p className="py-5 text-[0.78rem] text-[#958a7a]" data-testid="text-empty-order">Your table is waiting. Add a plate.</p>}
                <div className="flex justify-between py-4 font-mono text-[0.72rem] uppercase tracking-[0.12em]"><span>Transfer total</span><span className="text-[#cf9e54]" data-testid="text-order-total">{naira(subtotal)}</span></div>
              </div>
              {fulfillment === 'delivery' && <p className="mt-5 border-l border-[#cf9e54] pl-4 text-[0.76rem] leading-[1.6] text-[#c1b4a1]">Delivery fee is not included. Transfer <strong className="text-[#f1eadb]">{naira(subtotal)}</strong>; our staff will confirm the fee and final delivery total with you.</p>}
              <div className="mt-7 border border-[#cf9e54]/40 bg-[#cf9e54]/[.05] p-4"><p className="font-mono text-[0.61rem] uppercase tracking-[0.17em] text-[#cf9e54]">Bank transfer only</p><p className="mt-3 text-[0.84rem] leading-[1.65] text-[#d6ccba]">GTBank<br /><strong className="text-[#f1eadb]">TokyobyLA</strong><br /><strong className="font-mono text-[#f1eadb]">9031979146</strong></p></div>
              {formError && <p className="mt-5 border border-[#c46d52]/50 bg-[#c46d52]/10 p-3 text-[0.75rem] leading-[1.5] text-[#e7aa8d]" role="alert" data-testid="text-order-error">{formError}</p>}
              <button type="submit" disabled={createOrder.isPending} className="mt-7 flex w-full items-center justify-center gap-3 bg-[#cf9e54] px-5 py-4 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[#211d17] transition-colors hover:bg-[#e1b96f] disabled:cursor-wait disabled:opacity-60" data-testid="button-submit-order">{createOrder.isPending ? <><LoaderCircle size={15} className="animate-spin" /> Sending order</> : <>Place order <ArrowRight size={15} /></>}</button>
              <p className="mt-4 text-center font-mono text-[0.56rem] uppercase leading-[1.5] tracking-[0.12em] text-[#817667]">Payment is checked by the Tokyo team</p>
            </div>
          </aside>
        </form>
      </main>
    </OrderFrame>
  );
}

function OrderStatus({ order }: { order: Order }) {
  const statusLabel = order.paymentStatus === 'confirmed' ? 'Payment confirmed' : order.paymentStatus === 'rejected' ? 'Payment needs attention' : 'Awaiting payment confirmation';
  const statusTone = order.paymentStatus === 'confirmed' ? 'text-[#a8c19b] border-[#a8c19b]/40 bg-[#a8c19b]/10' : order.paymentStatus === 'rejected' ? 'text-[#e7aa8d] border-[#c46d52]/40 bg-[#c46d52]/10' : 'text-[#cf9e54] border-[#cf9e54]/40 bg-[#cf9e54]/10';
  return <div className="border border-[#f1eadb]/15 bg-[#29211b] p-6 sm:p-10" data-testid="card-order-status">
    <div className="flex flex-col justify-between gap-6 border-b border-[#f1eadb]/15 pb-7 sm:flex-row sm:items-start"><div><p className="eyebrow mb-3">Order reference</p><h1 className="font-mono text-2xl tracking-[0.12em] text-[#f1eadb]" data-testid="text-order-reference">{order.orderNumber}</h1></div><span className={`inline-flex w-fit items-center gap-2 border px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] ${statusTone}`} data-testid="status-payment"><span className="h-1.5 w-1.5 rounded-full bg-current" />{statusLabel}</span></div>
    <div className="grid gap-8 py-8 sm:grid-cols-2"><div><p className="eyebrow mb-3">For</p><p className="text-[0.95rem] text-[#f1eadb]">{order.customerName}</p><p className="mt-1 font-mono text-[0.68rem] text-[#9d917f]">{order.customerPhone}</p></div><div><p className="eyebrow mb-3">Handoff</p><p className="text-[0.95rem] capitalize text-[#f1eadb]">{order.fulfillmentMethod}</p><p className="mt-1 text-[0.76rem] text-[#9d917f]">{order.fulfillmentMethod === 'delivery' ? order.deliveryAddress : '9 Keffi St, Ikoyi'}</p></div></div>
    <div className="border-y border-[#f1eadb]/10 py-4">{order.items.map((item) => <div key={item.menuItemId} className="flex justify-between py-2 font-mono text-[0.7rem]"><span className="text-[#b9ad9c]">{item.quantity} × {item.name}</span><span>{naira(item.lineTotal)}</span></div>)}<div className="mt-2 flex justify-between border-t border-[#f1eadb]/10 pt-4 font-mono text-[0.73rem] uppercase"><span>Subtotal</span><span className="text-[#cf9e54]">{naira(order.subtotal)}</span></div></div>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><p className="text-[0.76rem] leading-[1.6] text-[#958a7a]">{order.staffNote ?? 'The Tokyo team will update you once your transfer is checked.'}</p>{order.fulfillmentMethod === 'delivery' && <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[#cf9e54]">Delivery fee confirmed by staff</p>}</div>
  </div>;
}

function OrderLookupPage() {
  const { user } = useAuth();
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber ?? '';
  const { data: order, isLoading, isError, refetch } = useGetOrder(orderNumber, { query: { enabled: Boolean(user), queryKey: getGetOrderQueryKey(orderNumber) } });
  return <OrderFrame eyebrow="Tokyo by LYA / Order status"><main className="mx-auto max-w-[820px] px-5 py-14 sm:px-8 sm:py-20">{!user && <AuthPanel />}{isLoading && <div className="h-96 animate-pulse bg-[#29211b]" data-testid="loading-order" />}{isError && <div className="border border-[#c46d52]/40 bg-[#c46d52]/10 p-8" data-testid="text-lookup-error"><p className="eyebrow mb-4 !text-[#e7aa8d]">That reference wandered off</p><h1 className="display-serif text-4xl">We could not find this order.</h1><button type="button" onClick={() => refetch()} className="mt-6 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#cf9e54]" data-testid="button-retry-order"><RefreshCw size={14} /> Try again</button></div>}{order && <><div className="mb-7"><Link href="/order" className="inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#cf9e54]" data-testid="link-new-order"><ChevronLeft size={14} /> Start another order</Link></div><OrderStatus order={order} /></>}</main></OrderFrame>;
}

function AdminPage() {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.email && clientAdminEmails.has(user.email.toLowerCase()));
  const { data: orders, isLoading, isError, refetch } = useListOrders({ query: { enabled: isAdmin, queryKey: getListOrdersQueryKey() } });
  const updatePayment = useUpdateOrderPayment();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const visibleOrders = useMemo(() => (orders ?? []).filter((order) => `${order.orderNumber} ${order.customerName} ${order.customerPhone}`.toLowerCase().includes(search.toLowerCase())), [orders, search]);
  const update = (order: Order, paymentStatus: 'confirmed' | 'rejected') => {
    updatePayment.mutate({ orderNumber: order.orderNumber, data: { paymentStatus, staffNote: notes[order.orderNumber]?.trim() || null } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(order.orderNumber) });
      },
    });
  };
  if (!user) return <OrderFrame eyebrow="Staff console / Sign in"><main className="mx-auto max-w-[560px] px-5 py-14 sm:px-8 sm:py-20"><AuthPanel /></main></OrderFrame>;
  if (!isAdmin) return <OrderFrame eyebrow="Staff console / Access denied"><main className="mx-auto max-w-[560px] px-5 py-14 sm:px-8 sm:py-20"><div className="border border-[#c46d52]/40 bg-[#c46d52]/10 p-8" role="alert" data-testid="text-admin-access-denied"><p className="eyebrow mb-4 !text-[#e7aa8d]">403 / Staff only</p><h1 className="display-serif text-4xl">This console is private.</h1><p className="mt-4 text-[0.82rem] leading-[1.7] text-[#e7aa8d]">Your account is not on the staff allowlist.</p></div></main></OrderFrame>;
  return <OrderFrame eyebrow="Staff console / Payment review"><AdminMfaGate><main className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12"><div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow mb-4">Private view · MFA protected</p><h1 className="display-serif text-[clamp(3.5rem,7vw,7rem)] leading-[.82] tracking-[-.05em]">Tonight's<br /><em className="text-[#cf9e54]">orders.</em></h1></div><label className="flex items-center gap-3 border-b border-[#f1eadb]/20 pb-3 md:w-72"><Search size={15} className="text-[#cf9e54]" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent font-mono text-[0.67rem] uppercase tracking-[0.12em] text-[#f1eadb] outline-none placeholder:text-[#817667]" placeholder="Search orders" data-testid="input-search-orders" /></label></div>
    {isLoading && <div className="space-y-4" data-testid="loading-admin"><div className="h-40 animate-pulse bg-[#29211b]" /><div className="h-40 animate-pulse bg-[#29211b]" /></div>}
    {isError && <div className="border border-[#c46d52]/40 bg-[#c46d52]/10 p-8" data-testid="text-admin-error"><p className="text-[#e7aa8d]">Orders could not be loaded.</p><button type="button" onClick={() => refetch()} className="mt-5 flex items-center gap-2 font-mono text-[0.63rem] uppercase tracking-[.15em] text-[#cf9e54]" data-testid="button-retry-admin"><RefreshCw size={14} /> Retry</button></div>}
    {updatePayment.isError && <p className="mb-5 border border-[#c46d52]/40 bg-[#c46d52]/10 p-4 text-[0.75rem] text-[#e7aa8d]" role="alert" data-testid="text-payment-update-error">That payment update did not save. Please try again.</p>}
    {!isLoading && !isError && !visibleOrders.length && <div className="border border-dashed border-[#f1eadb]/20 p-12 text-center" data-testid="text-empty-admin"><Clipboard className="mx-auto mb-4 text-[#cf9e54]" size={23} /><p className="display-serif text-3xl">No orders here yet.</p><p className="mt-3 text-[0.8rem] text-[#958a7a]">{search ? 'Try another search.' : 'Incoming bank transfer orders will appear here.'}</p></div>}
    <div className="space-y-4">{visibleOrders.map((order) => <article key={order.orderNumber} className="border border-[#f1eadb]/15 bg-[#29211b] p-5 sm:p-7" data-testid={`card-admin-order-${order.orderNumber}`}><div className="flex flex-col justify-between gap-5 border-b border-[#f1eadb]/10 pb-5 lg:flex-row lg:items-start"><div><div className="flex flex-wrap items-center gap-3"><span className="font-mono text-[0.72rem] tracking-[.12em] text-[#cf9e54]">{order.orderNumber}</span><span className={`border px-2 py-1 font-mono text-[0.54rem] uppercase tracking-[.12em] ${order.paymentStatus === 'confirmed' ? 'border-[#a8c19b]/40 text-[#a8c19b]' : order.paymentStatus === 'rejected' ? 'border-[#c46d52]/40 text-[#e7aa8d]' : 'border-[#cf9e54]/40 text-[#cf9e54]'}`} data-testid={`status-admin-payment-${order.orderNumber}`}>{order.paymentStatus}</span></div><h2 className="mt-3 display-serif text-3xl text-[#f1eadb]">{order.customerName}</h2><p className="mt-1 font-mono text-[0.65rem] text-[#958a7a]">{order.customerPhone} · {order.fulfillmentMethod}</p></div><div className="lg:text-right"><p className="font-mono text-[0.62rem] uppercase tracking-[.15em] text-[#958a7a]">Transfer amount</p><p className="mt-1 font-mono text-xl text-[#cf9e54]">{naira(order.subtotal)}</p>{order.fulfillmentMethod === 'delivery' && <p className="mt-1 text-[0.65rem] text-[#958a7a]">+ delivery fee to confirm</p>}</div></div><div className="grid gap-6 py-5 lg:grid-cols-[1.1fr_.9fr]"><div><p className="eyebrow mb-3">Items</p><div className="space-y-2">{order.items.map((item) => <div key={item.menuItemId} className="flex justify-between gap-4 font-mono text-[0.68rem]"><span className="text-[#b9ad9c]">{item.quantity} × {item.name}</span><span>{naira(item.lineTotal)}</span></div>)}</div>{order.deliveryAddress && <p className="mt-4 text-[0.74rem] text-[#958a7a]"><span className="text-[#cf9e54]">Deliver to:</span> {order.deliveryAddress}</p>}{order.notes && <p className="mt-3 text-[0.74rem] italic text-[#958a7a]">“{order.notes}”</p>}</div><div><label className="eyebrow mb-3 block" htmlFor={`note-${order.orderNumber}`}>Staff note <span className="text-[#817667]">(optional)</span></label><textarea id={`note-${order.orderNumber}`} value={notes[order.orderNumber] ?? order.staffNote ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [order.orderNumber]: event.target.value }))} className="field-input min-h-20 resize-y" placeholder="Add context for the customer" data-testid={`input-staff-note-${order.orderNumber}`} /></div></div><div className="flex flex-wrap justify-end gap-3 border-t border-[#f1eadb]/10 pt-5"><button type="button" onClick={() => update(order, 'rejected')} disabled={updatePayment.isPending} className="border border-[#c46d52]/50 px-4 py-3 font-mono text-[0.61rem] uppercase tracking-[.14em] text-[#e7aa8d] transition-colors hover:bg-[#c46d52]/10 disabled:opacity-50" data-testid={`button-reject-payment-${order.orderNumber}`}>Reject payment</button><button type="button" onClick={() => update(order, 'confirmed')} disabled={updatePayment.isPending} className="flex items-center gap-2 bg-[#cf9e54] px-5 py-3 font-mono text-[0.61rem] uppercase tracking-[.14em] text-[#211d17] transition-colors hover:bg-[#e1b96f] disabled:opacity-50" data-testid={`button-confirm-payment-${order.orderNumber}`}><Check size={14} /> Confirm payment</button></div></article>)}</div>
  </main></AdminMfaGate></OrderFrame>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary resetKey="tokyo-routes">{children}</ErrorBoundary>;
}

export default function RootApp() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RoutedErrorBoundary>
            <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/order" component={OrderPage} />
            <Route path="/order/:orderNumber" component={OrderLookupPage} />
            <Route path="/admin" component={AdminPage} />
            <Route component={() => <OrderFrame><main className="mx-auto max-w-[720px] px-5 py-24 text-center"><p className="eyebrow mb-5">404 / Page not found</p><h1 className="display-serif text-6xl">Nothing here.</h1><Link href="/" className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[.15em] text-[#cf9e54]" data-testid="link-not-found-home">Return to Tokyo <ArrowRight size={15} /></Link></main></OrderFrame>} />
            </Switch>
          </RoutedErrorBoundary>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}