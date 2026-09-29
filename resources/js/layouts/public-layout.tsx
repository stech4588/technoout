import BrandLogo from '@/components/brand-logo';
import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Facebook,
    Linkedin,
    Mail,
    MapPin,
    Menu,
    Phone,
    Youtube,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type NavChild = [string, string];
type NavItem = [string, string, NavChild[]];

const navigation: NavItem[] = [
    [
        'Company',
        '/about-us',
        [
            ['About us', '/about-us'],
            ['Company history', '/company-history'],
            ['Core values', '/core-values'],
            ['Our team', '/our-team'],
            ['Brand partners', '/brand-partners'],
            ['Our brands', '/our-brands'],
            ['Certifications', '/certifications'],
            ['Careers', '/careers'],
            ['Latest news', '/latest-news'],
        ],
    ],
    [
        'Solutions',
        '/solutions',
        [
            ['All solutions', '/solutions'],
            ['RFID vehicle access', '/rfid-etag-vehicle-access-control-solution'],
            ['Loading bay', '/loading-bay-solution'],
            ['Parking management', '/parking-management-guidance-solution'],
            ['Perimeter security', '/perimeter-security-solutions'],
            ['Personnel access', '/personnel-access-control-solution'],
            ['Visitor management', '/visitor-management-solution'],
            ['Road safety', '/road-safety-solutions'],
        ],
    ],
    ['Products', '/catalog', []],
    ['Projects', '/our-projects', []],
    [
        'Support',
        '/support',
        [
            ['Support overview', '/support'],
            ['Technical support', '/technical-support'],
            ['Warranty', '/warranty'],
            ['Product demonstration', '/product-demonstration'],
        ],
    ],
    ['Contact', '/contact', []],
];

function currentPath(url: string) {
    return url.split('?')[0].split('#')[0] || '/';
}

function isNavActive(href: string, children: NavChild[], path: string) {
    if (href === '/catalog') {
        return path === '/catalog' || path.startsWith('/products/');
    }

    if (children.length > 0) {
        if (path === href) return true;
        return children.some(([, childHref]) => path === childHref || path.startsWith(`${childHref}/`));
    }

    return path === href;
}

function socialIcon(platform: string) {
    const key = platform.toLowerCase();
    if (key.includes('facebook')) return Facebook;
    if (key.includes('linkedin')) return Linkedin;
    if (key.includes('youtube')) return Youtube;
    return null;
}

function contactHref(type: string, value: string) {
    if (type === 'email') return `mailto:${value}`;
    if (['phone', 'mobile', 'whatsapp', 'fax'].includes(type)) {
        return `tel:${value.replace(/[^\d+]/g, '')}`;
    }
    return value.startsWith('http') ? value : undefined;
}

export default function PublicLayout({ children, settings }: { children: React.ReactNode; settings: any }) {
    const [open, setOpen] = useState(false);
    const page = usePage<any>();
    const path = currentPath(page.url);
    const contacts = settings?.contacts ?? [];
    const locations = settings?.locations ?? [];
    const social = settings?.social ?? [];
    const primaryLocation = locations.find((item: any) => item.is_primary) || locations[0];

    const activeMap = useMemo(() => {
        return Object.fromEntries(
            navigation.map(([name, href, children]) => [name, isNavActive(href, children, path)]),
        ) as Record<string, boolean>;
    }, [path]);

    return (
        <div className="public-theme min-h-screen bg-slate-50 text-slate-900">
            <header className="site-header sticky top-0 z-50">
                <div className="site-header-glow" aria-hidden />
                <div className="relative mx-auto flex h-[4.75rem] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <BrandLogo />

                    <nav className="hidden items-center gap-1 xl:gap-1.5 lg:flex">
                        {navigation.map(([name, href, children]) => {
                            const active = activeMap[name];
                            return (
                                <div key={href} className="group relative">
                                    <Link
                                        href={href}
                                        aria-current={active ? 'page' : undefined}
                                        className={
                                            'site-nav-link relative flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition ' +
                                            (active
                                                ? 'is-active text-[#075fd8]'
                                                : 'text-slate-600 hover:bg-slate-100/80 hover:text-[#075fd8]')
                                        }
                                    >
                                        {name}
                                        {children.length > 0 ? (
                                            <ChevronDown
                                                className={
                                                    'h-3.5 w-3.5 transition group-hover:rotate-180 ' +
                                                    (active ? 'text-[#075fd8]' : 'text-slate-400')
                                                }
                                            />
                                        ) : null}
                                        <span className="site-nav-underline" aria-hidden />
                                    </Link>

                                    {children.length > 0 ? (
                                        <div className="invisible absolute left-1/2 top-[calc(100%+0.55rem)] z-50 w-72 -translate-x-1/2 rounded-2xl border border-slate-200/90 bg-white/95 p-2 opacity-0 shadow-[0_24px_60px_-28px_rgba(7,95,216,.45)] backdrop-blur-xl transition group-hover:visible group-hover:opacity-100">
                                            {children.map(([label, url]) => {
                                                const childActive = path === url;
                                                return (
                                                    <Link
                                                        key={url}
                                                        href={url}
                                                        aria-current={childActive ? 'page' : undefined}
                                                        className={
                                                            'block rounded-xl px-4 py-2.5 text-sm transition ' +
                                                            (childActive
                                                                ? 'bg-blue-50 font-semibold text-[#075fd8]'
                                                                : 'text-slate-600 hover:bg-slate-50 hover:text-[#075fd8]')
                                                        }
                                                    >
                                                        {label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}

                        <Link
                            href="/quote"
                            className="site-cta ml-2 inline-flex items-center rounded-full bg-[#075fd8] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(7,95,216,.8)] transition hover:-translate-y-0.5 hover:bg-[#064eaf]"
                        >
                            Request a quote
                        </Link>
                    </nav>

                    <button
                        aria-label="Toggle navigation"
                        onClick={() => setOpen(!open)}
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-[#075fd8] lg:hidden"
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {open ? (
                    <nav className="max-h-[calc(100vh-4.75rem)] overflow-y-auto border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-xl lg:hidden">
                        {navigation.map(([name, href, children]) => {
                            const active = activeMap[name];
                            return (
                                <div key={href} className="border-b border-slate-100 py-2">
                                    <Link
                                        onClick={() => setOpen(false)}
                                        href={href}
                                        aria-current={active ? 'page' : undefined}
                                        className={
                                            'block rounded-lg px-2 py-2 font-semibold transition ' +
                                            (active ? 'bg-blue-50 text-[#075fd8]' : 'text-slate-800')
                                        }
                                    >
                                        {name}
                                    </Link>
                                    {children.length > 0 ? (
                                        <div className="mt-1 grid grid-cols-2 gap-x-3 px-2">
                                            {children.slice(1).map(([label, url]) => (
                                                <Link
                                                    onClick={() => setOpen(false)}
                                                    key={url}
                                                    href={url}
                                                    className={
                                                        'py-2 text-xs transition ' +
                                                        (path === url
                                                            ? 'font-semibold text-[#075fd8]'
                                                            : 'text-slate-500 hover:text-[#075fd8]')
                                                    }
                                                >
                                                    {label}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                        <Link
                            href="/quote"
                            onClick={() => setOpen(false)}
                            className="mt-4 block rounded-full bg-[#075fd8] px-5 py-3 text-center text-sm font-bold text-white"
                        >
                            Request a quote
                        </Link>
                    </nav>
                ) : null}
            </header>

            {page.props.flash?.success && (
                <div className="fixed top-24 right-5 z-50 rounded-xl border border-emerald-400/30 bg-emerald-950 px-5 py-4 text-emerald-200">
                    {page.props.flash.success}
                </div>
            )}

            <main>{children}</main>

            <footer className="site-footer">
                <div className="site-footer-glow" aria-hidden />
                <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:px-8">
                    <div className="lg:col-span-5">
                        <img
                            src="/brand/viatech-lockup.png"
                            alt="ViaTech Technical Consultants"
                            className="site-footer-logo w-44 object-contain"
                        />
                        <p className="site-footer-copy mt-5 max-w-md text-sm leading-7">
                            {settings?.profile?.footer_text ||
                                'Automation, security and industrial access systems—measured, controlled and solved with care.'}
                        </p>
                        {social.length > 0 ? (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {social.map((item: any) => {
                                    const Icon = socialIcon(item.platform || item.icon || '');
                                    return (
                                        <a
                                            key={item.id}
                                            href={item.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={item.platform}
                                            className="site-footer-social inline-flex h-10 w-10 items-center justify-center rounded-full border transition"
                                        >
                                            {Icon ? <Icon className="h-4 w-4" /> : <span className="text-xs font-bold">{String(item.platform).slice(0, 2).toUpperCase()}</span>}
                                        </a>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="site-footer-heading mb-4 text-xs font-bold tracking-[.2em] uppercase">Explore</h3>
                        <div className="space-y-1.5">
                            {navigation.slice(0, 5).map(([name, href]) => (
                                <Link
                                    key={href}
                                    href={href}
                                    aria-current={activeMap[name] ? 'page' : undefined}
                                    className={
                                        'site-footer-link block rounded-md px-0 py-1.5 text-sm transition ' +
                                        (activeMap[name] ? 'is-active' : '')
                                    }
                                >
                                    {name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="site-footer-heading mb-4 text-xs font-bold tracking-[.2em] uppercase">Solutions</h3>
                        <div className="space-y-1.5">
                            {navigation[1][2].slice(0, 5).map(([label, url]) => (
                                <Link
                                    key={url}
                                    href={url}
                                    className={
                                        'site-footer-link block py-1.5 text-sm transition ' +
                                        (path === url ? 'is-active' : '')
                                    }
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <h3 className="site-footer-heading mb-4 text-xs font-bold tracking-[.2em] uppercase">Contact</h3>
                        <div className="space-y-3">
                            {contacts.map((contact: any) => {
                                const href = contactHref(contact.type, contact.value);
                                const Icon = contact.type === 'email' ? Mail : Phone;
                                const content = (
                                    <>
                                        <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
                                        <span>{contact.value}</span>
                                    </>
                                );
                                return href ? (
                                    <a key={contact.id} href={href} className="site-footer-link flex items-start gap-2.5 text-sm">
                                        {content}
                                    </a>
                                ) : (
                                    <p key={contact.id} className="site-footer-copy flex items-start gap-2.5 text-sm">
                                        {content}
                                    </p>
                                );
                            })}
                            {primaryLocation ? (
                                <p className="site-footer-copy flex items-start gap-2.5 text-sm leading-6">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
                                    <span>
                                        {[
                                            primaryLocation.address_line_1,
                                            primaryLocation.address_line_2,
                                            [primaryLocation.city, primaryLocation.postal_code].filter(Boolean).join(' '),
                                            primaryLocation.country,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </span>
                                </p>
                            ) : null}
                        </div>
                        <Link
                            href="/quote"
                            className="site-footer-cta mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-bold transition"
                        >
                            Request a quote
                        </Link>
                    </div>
                </div>

                <div className="site-footer-bar relative">
                    <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row sm:px-6 lg:px-8">
                        <p>© {new Date().getFullYear()} ViaTech. Measure · Control · Solve.</p>
                        <p className="opacity-80">Pakistan’s technology infrastructure partner</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
