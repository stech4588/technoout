import { Link } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import ProductVisual from './product-visual';

interface ProductCardProduct {
    id: number;
    slug: string;
    name: string;
    summary?: string | null;
    price_mode: string;
    price?: number | string | null;
    thumbnail_url?: string | null;
    image_alt?: string | null;
    category?: { name: string } | null;
}

export default function ProductCard({ product }: { product: ProductCardProduct }) {
    const price = product.price_mode === 'visible' && product.price ? 'PKR ' + Number(product.price).toLocaleString() : 'Request quote';
    const image = product.thumbnail_url || '/images/product-placeholder.svg';

    return (
        <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[.035] transition hover:-translate-y-1 hover:border-cyan-300/40">
            <Link href={'/products/' + product.slug} className="block" aria-label={`View ${product.name}`}>
                <div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_50%_30%,rgba(9,105,232,.18),transparent_55%),linear-gradient(135deg,#111b2c,#070b13)]">
                    {image === '/images/product-placeholder.svg' ? (
                        <ProductVisual product={product} className="h-full w-full" />
                    ) : (
                        <img src={image} alt={product.image_alt || product.name} loading="lazy" className="h-full w-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080d17]/70 to-transparent" />
                </div>
            </Link>

            <div className="p-6">
                <div className="mb-3 min-h-5 text-[10px] font-bold tracking-[.18em] text-cyan-300 uppercase">{product.category?.name}</div>
                <div className="flex justify-between gap-4">
                    <Link href={'/products/' + product.slug} className="font-bold hover:text-cyan-300">
                        <h3 className="text-lg">{product.name}</h3>
                    </Link>
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-cyan-300" />
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">{product.summary}</p>
                <div className="mt-5 text-xs font-bold tracking-widest text-cyan-300 uppercase">{price}</div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                    <Link href={'/products/' + product.slug} className="text-sm font-semibold text-slate-500 hover:text-cyan-300">
                        Details
                    </Link>
                    <Link
                        href={`/contact?product=${product.id}#request-quote`}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950"
                    >
                        Request quote <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
