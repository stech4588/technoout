import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

export default function ProductCard({ product }: { product: any }) {
    const price = product.price_mode === 'visible' && product.price ? 'PKR ' + Number(product.price).toLocaleString() : 'Request quote';
    const image = product.thumbnail_url || '/images/product-placeholder.svg';
    return (
        <Link
            href={'/products/' + product.slug}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[.035] transition hover:-translate-y-1 hover:border-cyan-300/40"
        >
            <div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,.2),transparent_55%),linear-gradient(135deg,#111b2c,#070b13)]">
                <img src={image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080d17]/70 to-transparent" />
            </div>
            <div className="p-6">
                <div className="mb-3 min-h-5 text-[10px] font-bold tracking-[.18em] text-cyan-300 uppercase">
                    {product.category?.name}
                </div>
                <div className="flex justify-between gap-4">
                    <h3 className="text-lg font-bold">{product.name}</h3>
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-cyan-300" />
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">{product.summary}</p>
                <div className="mt-5 text-xs font-bold tracking-widest text-cyan-300 uppercase">{price}</div>
            </div>
        </Link>
    );
}
