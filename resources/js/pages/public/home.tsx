import ProductCard from '@/components/product-card';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CircuitBoard, Factory, ShieldCheck } from 'lucide-react';

export default function Home({ settings, products, solutions }: any) {
    const icons = [ShieldCheck, Factory, CircuitBoard];
    return <PublicLayout settings={settings}><Head title="Home of intelligent access & security" />
        <section className="relative overflow-hidden border-b border-white/10"><div className="tech-grid absolute inset-0 opacity-40" /><div className="absolute -right-40 top-10 h-[32rem] w-[32rem] rounded-full bg-cyan-400/10 blur-[100px]" />
            <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 py-24 lg:grid-cols-[1.1fr_.9fr] lg:py-36"><div><p className="section-kicker">Pakistan’s technology infrastructure partner</p><h1 className="text-5xl font-black leading-[.96] tracking-[-.045em] sm:text-6xl lg:text-8xl">Control every <span className="text-cyan-300">threshold.</span></h1><p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">Future-ready automatic entry, access control, industrial doors and physical security—designed, installed and supported as one dependable system.</p><div className="mt-10 flex flex-wrap gap-4"><Link href="/contact" className="flex items-center gap-2 rounded-full bg-cyan-300 px-7 py-4 font-bold text-slate-950">Plan your solution <ArrowRight className="h-4 w-4" /></Link><Link href="/catalog" className="rounded-full border border-white/20 px-7 py-4 font-bold">Explore products</Link></div></div>
                <div className="relative mx-auto aspect-square w-full max-w-lg"><div className="absolute inset-0 rounded-full border border-cyan-300/10" /><div className="absolute inset-[12%] rounded-full border border-dashed border-cyan-300/30" /><div className="absolute inset-[25%] rounded-[2.5rem] border border-cyan-300/40 bg-cyan-300/5 shadow-[0_0_100px_rgba(34,211,238,.18)]" /><div className="absolute inset-[34%] rounded-t-[4rem] border-2 border-cyan-200/70 border-b-0" /></div>
            </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-24"><p className="section-kicker">Integrated portfolio</p><h2 className="section-title">Technology for every point of access.</h2><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{products.map((p:any) => <ProductCard key={p.id} product={p} />)}</div></section>
        <section className="border-y border-white/10 bg-white/[.025]"><div className="mx-auto max-w-7xl px-5 py-24"><p className="section-kicker">Complete solutions</p><h2 className="section-title">Built around your operation.</h2><div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">{solutions.map((s:any,i:number) => { const Icon=icons[i%3]; return <Link href={'/'+s.slug} key={s.id} className="bg-[#080d17] p-8"><Icon className="mb-8 h-8 w-8 text-cyan-300" /><h3 className="text-xl font-bold">{s.title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{s.excerpt}</p></Link>; })}</div></div></section>
    </PublicLayout>;
}
