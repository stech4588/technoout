import ProductCard from '@/components/product-card';
import PublicLayout from '@/layouts/public-layout';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';

export default function Catalog({ settings, products, categories, filters }: any) {
    return <PublicLayout settings={settings}><Head title="Product catalog" /><section className="page-hero"><div className="mx-auto max-w-7xl px-5"><p className="section-kicker">Engineered systems</p><h1 className="section-title">Product catalog</h1><p className="mt-5 max-w-2xl text-slate-400">Explore automation, security, access and industrial systems. Every product can be tailored into a complete project quotation.</p></div></section>
        <section className="mx-auto max-w-7xl px-5 py-16"><form onSubmit={e => { e.preventDefault(); const f=new FormData(e.currentTarget); router.get('/catalog',Object.fromEntries(f) as any); }} className="mb-10 grid gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4 md:grid-cols-[1fr_280px_auto]"><label className="relative"><Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" /><input name="search" defaultValue={filters.search} placeholder="Search products…" className="form-input pl-12" /></label><select name="category" defaultValue={filters.category} className="form-input"><option value="">All categories</option>{categories.map((c:any) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select><button className="rounded-xl bg-cyan-300 px-6 font-bold text-slate-950">Filter</button></form>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{products.data.map((item:any) => <ProductCard key={item.id} product={item} />)}</div><div className="mt-10 flex flex-wrap gap-2">{products.links.map((link:any,i:number) => <button key={i} disabled={!link.url} onClick={() => link.url && router.visit(link.url)} dangerouslySetInnerHTML={{__html:link.label}} className={'rounded-lg border px-4 py-2 text-sm '+(link.active?'border-cyan-300 bg-cyan-300 text-slate-950':'border-white/10 text-slate-400')} />)}</div>
        </section>
    </PublicLayout>;
}
