import QuoteRequestForm from '@/components/quote-request-form';
import { ProductOption } from '@/components/product-search-picker';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

interface QuoteProps {
    settings: {
        profile?: { name?: string | null; tagline?: string | null } | null;
    };
    products: ProductOption[];
    selectedProductId?: number | null;
}

export default function Quote({ settings, products, selectedProductId = null }: QuoteProps) {
    const brand = settings.profile?.name || 'ViaTech';

    return (
        <PublicLayout settings={settings}>
            <Head title={`Request a quote | ${brand}`} />
            <div className="contact-page">
                <section className="contact-hero page-hero">
                    <div className="contact-hero-grid" aria-hidden />
                    <div className="contact-orb contact-orb-a" aria-hidden />
                    <div className="contact-orb contact-orb-b" aria-hidden />
                    <div className="contact-orb contact-orb-c" aria-hidden />
                    <div className="contact-hero-content mx-auto max-w-7xl px-5">
                        <p className="section-kicker">Quotation</p>
                        <h1 className="contact-hero-title section-title">Request a quote</h1>
                        <p className="mt-4 max-w-2xl text-base text-slate-500">
                            Share your requirements and preferred products — {brand} will prepare a tailored proposal.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-3xl px-5 py-12 md:py-16">
                    <QuoteRequestForm
                        brand={brand}
                        products={products}
                        selectedProductId={selectedProductId}
                        showTypeSelect={false}
                    />
                </section>
            </div>
        </PublicLayout>
    );
}
