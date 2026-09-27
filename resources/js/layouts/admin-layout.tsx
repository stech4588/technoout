import BrandLogo from '@/components/brand-logo';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    ChevronLeft,
    ChevronRight,
    FileText,
    Inbox,
    Landmark,
    LayoutDashboard,
    LogOut,
    MapPin,
    Menu,
    Newspaper,
    Package,
    Phone,
    Receipt,
    Share2,
    Shield,
    Tags,
    Users,
    Wallet,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const SIDEBAR_KEY = 'viatech.admin.sidebarCollapsed';

type NavItem = { name: string; href: string; permission: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
    {
        label: 'Operations',
        items: [
            { name: 'Dashboard', href: '/admin', permission: 'dashboard.view', icon: LayoutDashboard },
            { name: 'Requests', href: '/admin/inquiries', permission: 'inquiries.manage', icon: Inbox },
            { name: 'Customers', href: '/admin/customers', permission: 'inquiries.manage', icon: Users },
            { name: 'Quotations', href: '/admin/quotations', permission: 'quotations.manage', icon: FileText },
            { name: 'Invoices', href: '/admin/invoices', permission: 'invoices.manage', icon: Receipt },
            { name: 'Payments', href: '/admin/payments', permission: 'payments.manage', icon: Wallet },
        ],
    },
    {
        label: 'Website',
        items: [
            { name: 'Products', href: '/admin/products', permission: 'products.manage', icon: Package },
            { name: 'Categories', href: '/admin/categories', permission: 'products.manage', icon: Tags },
            { name: 'Content pages', href: '/admin/pages', permission: 'content.manage', icon: Newspaper },
        ],
    },
    {
        label: 'Settings',
        items: [
            { name: 'Business profile', href: '/admin/business', permission: 'business.manage', icon: Building2 },
            { name: 'Locations', href: '/admin/locations', permission: 'business.manage', icon: MapPin },
            { name: 'Contact channels', href: '/admin/contacts', permission: 'business.manage', icon: Phone },
            { name: 'Social links', href: '/admin/social-links', permission: 'business.manage', icon: Share2 },
            { name: 'Bank accounts', href: '/admin/bank-accounts', permission: 'business.manage', icon: Landmark },
            { name: 'Administrators', href: '/admin/users', permission: 'users.manage', icon: Shield },
        ],
    },
];

function initials(name?: string) {
    if (!name) return 'VT';
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

export default function AdminLayout({
    children,
    title,
    backHref,
    backLabel = 'Back',
}: {
    children: React.ReactNode;
    title: string;
    backHref?: string;
    backLabel?: string;
}) {
    const page = usePage<any>();
    const currentUrl = String(page.url || '');
    const permissions: string[] = page.props.auth.user?.permissions || [];
    const allowed = (permission: string) => permissions.includes(permission);

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        try {
            setCollapsed(localStorage.getItem(SIDEBAR_KEY) === '1');
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [currentUrl]);

    const toggleCollapsed = () => {
        setCollapsed((value) => {
            const next = !value;
            try {
                localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
            } catch {
                /* ignore */
            }
            return next;
        });
    };

    const groups = useMemo(
        () =>
            NAV_GROUPS.map((group) => ({
                ...group,
                items: group.items.filter((item) => allowed(item.permission)),
            })).filter((group) => group.items.length > 0),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [permissions.join('|')],
    );

    const isActive = (href: string) => {
        if (href === '/admin') return currentUrl === '/admin' || currentUrl.startsWith('/admin?');
        return currentUrl === href || currentUrl.startsWith(href + '/') || currentUrl.startsWith(href + '?');
    };

    const userName = page.props.auth.user?.name as string | undefined;

    return (
        <div className={`admin-theme admin-shell ${collapsed ? 'is-collapsed' : ''}`}>
            {mobileOpen ? (
                <button
                    type="button"
                    className="admin-sidebar-backdrop"
                    aria-label="Close navigation"
                    onClick={() => setMobileOpen(false)}
                />
            ) : null}

            <aside className={`admin-sidebar ${mobileOpen ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`}>
                <div className="admin-sidebar-top">
                    <BrandLogo />
                    <button
                        type="button"
                        className="admin-sidebar-toggle hidden cursor-pointer lg:grid"
                        onClick={toggleCollapsed}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                    <button
                        type="button"
                        className="admin-sidebar-toggle cursor-pointer lg:hidden"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close navigation"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <nav className="admin-sidebar-nav">
                    {groups.map((group) => (
                        <div key={group.label} className="admin-nav-group">
                            <p className="admin-nav-label">{group.label}</p>
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        title={item.name}
                                        aria-label={item.name}
                                        className={`admin-nav-link ${active ? 'is-active' : ''}`}
                                    >
                                        <Icon className="admin-nav-icon" strokeWidth={1.75} />
                                        <span className="admin-nav-text">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>
            </aside>

            <main className="admin-main min-w-0">
                <header className="admin-topbar">
                    <div className="flex min-w-0 items-start gap-3">
                        <button
                            type="button"
                            className="admin-menu-btn cursor-pointer lg:hidden"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open navigation"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="min-w-0">
                            {backHref ? (
                                <Link href={backHref} className="admin-back-link">
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    {backLabel}
                                </Link>
                            ) : null}
                            <p className="admin-topbar-kicker">ViaTech control center</p>
                            <h1 className="admin-topbar-title">{title}</h1>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                        <div className="admin-user-chip" title={userName}>
                            <span className="admin-user-avatar">{initials(userName)}</span>
                            <span className="admin-user-name">{userName}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="admin-logout-btn cursor-pointer"
                            title="Sign out"
                            aria-label="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Sign out</span>
                        </button>
                    </div>
                </header>

                {page.props.flash?.success ? (
                    <div className="admin-flash admin-flash-success">{page.props.flash.success}</div>
                ) : null}
                {page.props.flash?.error ? (
                    <div className="admin-flash admin-flash-error">{page.props.flash.error}</div>
                ) : null}

                <div className="admin-content">{children}</div>
            </main>
        </div>
    );
}
