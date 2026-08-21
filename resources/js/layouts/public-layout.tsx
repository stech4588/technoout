import BrandLogo from '@/components/brand-logo';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navigation:any[] = [
    ['Company','/about-us',[["About us",'/about-us'],['Company history','/company-history'],['Core values','/core-values'],['Our team','/our-team'],['Brand partners','/brand-partners'],['Our brands','/our-brands'],['Certifications','/certifications'],['Careers','/careers'],['Latest news','/latest-news']]],
    ['Solutions','/solutions',[["All solutions",'/solutions'],['RFID vehicle access','/rfid-etag-vehicle-access-control-solution'],['Loading bay','/loading-bay-solution'],['Parking management','/parking-management-guidance-solution'],['Perimeter security','/perimeter-security-solutions'],['Personnel access','/personnel-access-control-solution'],['Visitor management','/visitor-management-solution'],['Road safety','/road-safety-solutions']]],
    ['Products','/catalog',[]],
    ['Projects','/our-projects',[]],
    ['Support','/support',[["Support overview",'/support'],['Technical support','/technical-support'],['Warranty','/warranty'],['Product demonstration','/product-demonstration']]],
    ['Contact','/contact',[]],
];

export default function PublicLayout({ children, settings }: { children: React.ReactNode; settings: any }) {
    const [open, setOpen] = useState(false);
    const page = usePage<any>();
    return <div className="public-theme min-h-screen bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
                <BrandLogo />
                <nav className="hidden items-center gap-6 lg:flex">{navigation.map(([name,href,children])=><div key={href} className="group relative"><Link href={href} className="flex items-center gap-1 py-7 text-sm text-slate-600 hover:text-[#075fd8]">{name}{children.length>0&&<ChevronDown className="h-3.5 w-3.5"/>}</Link>{children.length>0&&<div className="invisible absolute left-1/2 top-[4.7rem] w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">{children.map(([label,url]:string[])=><Link key={url} href={url} className="block rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#075fd8]">{label}</Link>)}</div>}</div>)}<Link href="/contact" className="rounded-full bg-[#075fd8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#064eaf]">Request a quote</Link></nav>
                <button aria-label="Toggle navigation" onClick={() => setOpen(!open)} className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden">{open ? <X /> : <Menu />}</button>
            </div>
            {open && <nav className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-slate-200 bg-white px-5 py-4 lg:hidden">{navigation.map(([name,href,children])=><div key={href} className="border-b border-slate-100 py-2"><Link onClick={()=>setOpen(false)} href={href} className="block py-2 font-semibold">{name}</Link>{children.length>0&&<div className="grid grid-cols-2 gap-x-4">{children.slice(1).map(([label,url]:string[])=><Link onClick={()=>setOpen(false)} key={url} href={url} className="py-2 text-xs text-slate-500">{label}</Link>)}</div>}</div>)}</nav>}
        </header>
        {page.props.flash?.success && <div className="fixed right-5 top-24 z-50 rounded-xl border border-emerald-400/30 bg-emerald-950 px-5 py-4 text-emerald-200">{page.props.flash.success}</div>}
        <main>{children}</main>
        <footer className="border-t border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4"><div className="md:col-span-2"><img src="/brand/viatech-lockup.png" alt="ViaTech Technical Consultants" className="w-44 object-contain" /><p className="mt-5 max-w-md text-sm leading-7 text-slate-500">{settings?.profile?.footer_text}</p></div><div><h3 className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[#075fd8]">Explore</h3>{navigation.slice(0,5).map(([name,href])=><Link className="mb-2 block text-sm text-slate-500 hover:text-[#075fd8]" key={href} href={href}>{name}</Link>)}</div><div><h3 className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[#075fd8]">Contact</h3>{settings?.contacts?.map((contact:any)=><p key={contact.id} className="mb-2 text-sm text-slate-500">{contact.value}</p>)}</div></div><div className="border-t border-slate-100 py-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} ViaTech. Measure · Control · Solve.</div></footer>
    </div>;
}
