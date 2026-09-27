import QuoteRequestForm from '@/components/quote-request-form';
import { ProductOption } from '@/components/product-search-picker';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { Building2, MapPin, Phone } from 'lucide-react';
import { useRef, type MouseEvent as ReactMouseEvent } from 'react';

interface ContactChannel {
    id: number;
    type: string;
    label: string;
    value: string;
}

interface OfficeLocation {
    id: number;
    name: string;
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    region?: string | null;
    postal_code?: string | null;
    country: string;
    map_url?: string | null;
    is_primary?: boolean;
    contacts: ContactChannel[];
}

interface ContactProps {
    settings: {
        profile?: { name?: string | null; tagline?: string | null } | null;
        locations: OfficeLocation[];
        contacts?: ContactChannel[];
    };
    products: ProductOption[];
    selectedProductId?: number | null;
}

function formatOfficeAddress(office: OfficeLocation) {
    return [
        office.address_line_1,
        office.address_line_2,
        [office.city, office.postal_code].filter(Boolean).join(', '),
        office.country,
    ]
        .filter(Boolean)
        .join(', ');
}

function brandedAddress(office: OfficeLocation, brand: string) {
    return `${brand}, ${formatOfficeAddress(office)}`;
}

function officeMapEmbed(office: OfficeLocation, brand: string) {
    if (office.map_url?.trim()) return office.map_url.trim();
    return `https://www.google.com/maps?q=${encodeURIComponent(brandedAddress(office, brand))}&z=17&output=embed`;
}

function officeMapOpen(office: OfficeLocation, brand: string) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brandedAddress(office, brand))}`;
}

function BranchCard({ office, index }: { office: OfficeLocation; index: number }) {
    const cardRef = useRef<HTMLDivElement>(null);

    const onMove = (event: ReactMouseEvent<HTMLDivElement>) => {
        const el = cardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 14;
        const rotateX = (0.5 - y) * 10;
        el.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
        el.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
        el.style.setProperty('--glow-x', `${(x * 100).toFixed(1)}%`);
        el.style.setProperty('--glow-y', `${(y * 100).toFixed(1)}%`);
    };

    const onLeave = () => {
        const el = cardRef.current;
        if (!el) return;
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-y', '0deg');
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className="contact-branch-card"
            style={{ animationDelay: `${0.12 + index * 0.08}s` }}
        >
            <div className="contact-branch-card-inner">
                <div className="flex items-start justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#075fd8]/12 text-[#075fd8]">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                        Branch {String(index + 1).padStart(2, '0')}
                    </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{office.name}</h3>
                <p className="mt-2 flex gap-2 text-sm leading-6 text-slate-500">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#075fd8]" />
                    <span>
                        {[office.address_line_1, office.address_line_2].filter(Boolean).join(', ')}
                        <br />
                        {[office.city, office.postal_code].filter(Boolean).join(', ')}, {office.country}
                    </span>
                </p>
                {office.contacts.map((contact) => (
                    <p key={contact.id} className="mt-3 flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-500">{contact.label}:</span>
                        <a
                            href={`${contact.type === 'email' ? 'mailto:' : 'tel:'}${contact.value}`}
                            className="cursor-pointer font-semibold text-[#075fd8] hover:underline"
                        >
                            {contact.value}
                        </a>
                    </p>
                ))}
            </div>
        </div>
    );
}

export default function Contact({ settings, products, selectedProductId = null }: ContactProps) {
    const brand = settings.profile?.name || 'ViaTech';
    const primaryOffice =
        settings.locations.find((office) => office.is_primary) ||
        settings.locations.find((office) => office.city?.toLowerCase() === 'lahore') ||
        settings.locations[0];
    const officeAddress = primaryOffice ? formatOfficeAddress(primaryOffice) : '';

    return (
        <PublicLayout settings={settings}>
            <Head title={`Contact ${brand}`} />
            <div className="contact-page">
                <section className="contact-hero page-hero">
                    <div className="contact-hero-grid" aria-hidden />
                    <div className="contact-orb contact-orb-a" aria-hidden />
                    <div className="contact-orb contact-orb-b" aria-hidden />
                    <div className="contact-orb contact-orb-c" aria-hidden />
                    <div className="contact-hero-content mx-auto max-w-7xl px-5">
                        <p className="section-kicker">Talk to {brand}</p>
                        <h1 className="contact-hero-title section-title">Let’s engineer the right solution.</h1>
                        {settings.profile?.tagline ? (
                            <p className="mt-4 max-w-2xl text-base text-slate-500">{settings.profile.tagline}</p>
                        ) : null}
                    </div>
                </section>

                {primaryOffice ? (
                    <section className="contact-map-section mx-auto max-w-7xl px-5 pt-12 md:pt-14">
                        <div className="contact-map-header mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="section-kicker">Find us</p>
                                <h2 className="text-3xl font-black tracking-tight text-slate-950">{primaryOffice.name}</h2>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                    <span className="font-semibold text-slate-700">Office Address:</span> {officeAddress}
                                </p>
                            </div>
                            <a
                                href={officeMapOpen(primaryOffice, brand)}
                                target="_blank"
                                rel="noreferrer"
                                className="contact-map-link inline-flex cursor-pointer items-center gap-1 text-sm font-bold text-blue-700 hover:text-blue-800"
                            >
                                Open in Google Maps ↗
                            </a>
                        </div>
                        <div className="contact-map-frame">
                            <div className="contact-map-glow" aria-hidden />
                            {/* Covers Google’s place info card (TASMIYA…) — iframe/src/pin unchanged */}
                            <div className="contact-map-brand-card" role="group" aria-label={`${brand} office`}>
                                <p className="text-[15px] font-bold tracking-tight text-slate-900">{brand}</p>
                                <p className="mt-1.5 text-[12px] leading-[1.45] text-slate-500">
                                    <span className="font-semibold text-slate-600">Office Address:</span> {officeAddress}
                                </p>
                            </div>
                            <iframe
                                title={`${primaryOffice.name} office location map`}
                                src={officeMapEmbed(primaryOffice, brand)}
                                className="h-[360px] w-full border-0 md:h-[460px]"
                                loading="lazy"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </section>
                ) : null}

                <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[.7fr_1.3fr]">
                    <div className="contact-branches" style={{ perspective: '1200px' }}>
                        <h2 className="text-2xl font-bold text-slate-900">Our branches</h2>
                        {settings.locations.length === 0 ? (
                            <p className="mt-6 text-sm text-slate-500">Branch details will appear here once locations are published.</p>
                        ) : (
                            settings.locations.map((office, index) => <BranchCard key={office.id} office={office} index={index} />)
                        )}
                    </div>

                    <QuoteRequestForm brand={brand} products={products} selectedProductId={selectedProductId} />
                </section>
            </div>
        </PublicLayout>
    );
}
