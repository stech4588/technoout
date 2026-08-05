import BrandLogo from '@/components/brand-logo';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function PublicLayout({ children, settings }: { children: React.ReactNode; settings: any }) {
    const [open, setOpen] = useState(false);
    const page = usePage<any>();
    const links = [['Company','/about-us'],['Solutions','/solutions'],['Products','/catalog'],['Projects','/our-projects'],['Support','/support'],['Contact','/contact']];
    return <div className="min-h-screen bg-[#060a12] text-slate-100">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060a12]/90 backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
                <BrandLogo />
                <nav className="hidden items-center gap-7 lg:flex">
                    {links.map(([n,h]) => <Link key={h} href={h} className="text-sm text-slate-300 hover:text-cyan-300">{n}</Link>)}
                    <Link href="/contact" className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950">Request a quote</Link>
                </nav>
                <button aria-label="Toggle navigation" onClick={() => setOpen(!open)} className="rounded-lg border border-white/10 p-2 lg:hidden">{open ? <X /> : <Menu />}</button>
            </div>
            {open && <nav className="border-t border-white/10 px-5 py-5 lg:hidden">{links.map(([n,h]) => <Link onClick={() => setOpen(false)} key={h} href={h} className="block border-b border-white/5 py-3">{n}</Link>)}</nav>}
        </header>
        {page.props.flash?.success && <div className="fixed right-5 top-24 z-50 rounded-xl border border-emerald-400/30 bg-emerald-950 px-5 py-4 text-emerald-200">{page.props.flash.success}</div>}
        <main>{children}</main>
        <footer className="border-t border-white/10 bg-[#04070d]">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
                <div className="md:col-span-2"><BrandLogo /><p className="mt-5 max-w-md text-sm leading-7 text-slate-400">{settings?.profile?.footer_text}</p></div>
                <div><h3 className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Explore</h3>{links.slice(0,5).map(([n,h]) => <Link className="mb-2 block text-sm text-slate-400" key={h} href={h}>{n}</Link>)}</div>
                <div><h3 className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Contact</h3>{settings?.contacts?.map((c:any) => <p key={c.id} className="mb-2 text-sm text-slate-400">{c.value}</p>)}</div>
            </div>
            <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} Technoout. Engineered for what’s next.</div>
        </footer>
    </div>;
}
