import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';

export default function Content({ settings, page }: any) {
    return <PublicLayout settings={settings}><Head title={page.title} /><section className="page-hero"><div className="mx-auto max-w-5xl px-5 text-center"><p className="section-kicker">{page.type}</p><h1 className="text-5xl font-black tracking-tight md:text-7xl">{page.title}</h1><p className="mx-auto mt-7 max-w-3xl text-xl leading-8 text-slate-300">{page.eyebrow}</p></div></section><section className="mx-auto max-w-4xl px-5 py-20"><div className="prose-tech whitespace-pre-line text-lg">{page.body}</div><div className="mt-14 rounded-3xl border border-cyan-300/20 bg-cyan-300/[.05] p-9"><h2 className="text-2xl font-bold">Discuss your project with an engineer.</h2><p className="mt-3 text-slate-400">Share your site, operational and security requirements. We’ll help shape the right solution.</p><Link href="/contact" className="mt-6 inline-block rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950">Start a request</Link></div></section></PublicLayout>;
}
