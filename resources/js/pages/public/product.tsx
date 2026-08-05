import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, MoveRight } from 'lucide-react';

export default function Product({ settings, product }: any) {
    return (
        <PublicLayout settings={settings}>
            <Head title={product.name} />
            <section className="page-hero">
                <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2">
                    <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#090f1b]">
                        <img src={product.thumbnail_url || '/images/product-placeholder.svg'} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="self-center">
                        <p className="section-kicker">{product.category?.name}</p>
                        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{product.name}</h1>
                        <p className="mt-6 text-lg leading-8 text-slate-300">{product.summary}</p>
                        <Link
                            href={'/contact?product=' + product.id}
                            className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-7 py-4 font-bold text-slate-950"
                        >
                            Request quote <MoveRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
            <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1fr_380px]">
                <div>
                    <h2 className="text-3xl font-bold">Overview</h2>
                    <div className="prose-tech mt-6 whitespace-pre-line">{product.description}</div>
                </div>
                <aside className="rounded-2xl border border-white/10 bg-white/[.03] p-7">
                    <h3 className="font-bold">Product details</h3>
                    <div className="mt-5 space-y-4">
                        {Object.entries(product.specifications || {}).map(([key, value]) => (
                            <div key={key} className="flex gap-3 border-b border-white/5 pb-4">
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-300" />
                                <div>
                                    <div className="text-xs tracking-wider text-slate-500 uppercase">{key}</div>
                                    <div className="mt-1 text-sm">{String(value)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </section>
        </PublicLayout>
    );
}
