import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import ProductCard from '@/components/product-card';
import ProductVisual from '@/components/product-visual';
import { CheckCircle2, Download, MoveRight } from 'lucide-react';
import { useState } from 'react';

export default function Product({ settings, product, related = [] }: any) {
    const gallery:string[]=product.images?.length?product.images:[product.thumbnail_url || '/images/product-placeholder.svg'];
    const documents:string[]=product.documents?.length?product.documents:(product.brochure_url?[product.brochure_url]:[]);
    const [activeImage,setActiveImage]=useState(product.thumbnail_url || gallery[0]);
    return (
        <PublicLayout settings={settings}>
            <Head title={product.name} />
            <section className="page-hero">
                <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2">
                    <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#090f1b]">
                        {activeImage==='/images/product-placeholder.svg'?<ProductVisual product={product} className="h-full w-full"/>:<img src={activeImage} alt={product.image_alt || product.name} className="h-full w-full object-cover" />}
                    </div>
                    {gallery.length>1&&<div className="-mt-8 flex flex-wrap gap-3 lg:col-start-1">{gallery.map((image,index)=><button type="button" key={image} onClick={()=>setActiveImage(image)} aria-label={`View ${product.name} image ${index+1}`} className={`overflow-hidden rounded-xl border ${activeImage===image?'border-cyan-300':'border-white/10'}`}><img src={image} alt="" className="h-20 w-24 object-cover"/></button>)}</div>}
                    <div className="self-center">
                        <p className="section-kicker">{product.category?.name}</p>
                        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{product.name}</h1>
                        <p className="mt-6 text-lg leading-8 text-slate-300">{product.summary}</p>
                        <Link
                            href={'/contact?product=' + product.id + '#request-quote'}
                            className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-7 py-4 font-bold text-slate-950"
                        >
                            Request quote <MoveRight className="h-4 w-4" />
                        </Link>
                        {product.brochure_url&&<a href={product.brochure_url} target="_blank" rel="noreferrer" className="ml-3 mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 font-bold text-cyan-200"><Download className="h-4 w-4"/> Download brochure</a>}
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
            {documents.length>0&&<section className="mx-auto max-w-7xl px-5 pb-20"><div className="rounded-2xl border border-white/10 bg-white/[.03] p-7"><h2 className="text-2xl font-bold">Downloads</h2><div className="mt-5 flex flex-wrap gap-3">{documents.map((document,index)=><a key={document} href={document} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-cyan-200"><Download className="h-4 w-4"/> Download document {documents.length>1?index+1:''}</a>)}</div></div></section>}
            {related.length>0&&<section className="mx-auto max-w-7xl px-5 pb-20"><h2 className="mb-8 text-3xl font-bold">Related products</h2><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{related.map((item:any)=><ProductCard key={item.id} product={item}/>)}</div></section>}
        </PublicLayout>
    );
}
