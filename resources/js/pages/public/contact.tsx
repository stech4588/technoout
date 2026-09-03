import ProductSearchPicker, { ProductOption } from '@/components/product-search-picker';
import PublicLayout from '@/layouts/public-layout';
import { Head, useForm } from '@inertiajs/react';
import { Minus, PackageCheck } from 'lucide-react';
import { FormEvent, useMemo } from 'react';

interface ProductLine {
    [key: string]: string | number;
    id: string;
    quantity: number | string;
}

interface ContactChannel {
    id: number;
    type: string;
    label: string;
    value: string;
}

interface OfficeLocation {
    id: number;
    name: string;
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    postal_code?: string | null;
    country: string;
    contacts: ContactChannel[];
}

interface QuoteRequestForm {
    [key: string]: string | ProductLine[] | File[];
    type: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    city: string;
    subject: string;
    message: string;
    products: ProductLine[];
    attachments: File[];
}

interface ContactProps {
    settings: { locations: OfficeLocation[] };
    products: ProductOption[];
    selectedProductId?: number | null;
}

export default function Contact({ settings, products, selectedProductId = null }: ContactProps) {
    const productOptions = products;
    const initialProducts: ProductLine[] = selectedProductId ? [{ id: String(selectedProductId), quantity: 1 }] : [];
    const form = useForm<QuoteRequestForm>({
        type: 'quote',
        name: '',
        company: '',
        email: '',
        phone: '',
        city: '',
        subject: '',
        message: '',
        products: initialProducts,
        attachments: [],
    });

    const productsById = useMemo(() => new Map(productOptions.map((product) => [product.id, product])), [productOptions]);
    const selectedIds = form.data.products.map((line: ProductLine) => Number(line.id));

    const addProduct = (product: ProductOption) => {
        if (form.data.products.length >= 20 || selectedIds.includes(product.id)) return;
        form.setData('products', [...form.data.products, { id: String(product.id), quantity: 1 }]);
    };

    const updateQuantity = (index: number, quantity: string) => {
        form.setData(
            'products',
            form.data.products.map((line: ProductLine, lineIndex: number) => (lineIndex === index ? { ...line, quantity } : line)),
        );
    };

    const removeProduct = (index: number) => {
        form.setData(
            'products',
            form.data.products.filter((_: ProductLine, lineIndex: number) => lineIndex !== index),
        );
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/contact', { forceFormData: true, preserveScroll: true });
    };

    return (
        <PublicLayout settings={settings}>
            <Head title="Contact & quotation request" />
            <section className="page-hero">
                <div className="mx-auto max-w-7xl px-5">
                    <p className="section-kicker">Talk to ViaTech</p>
                    <h1 className="section-title">Let’s engineer the right solution.</h1>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 pt-16">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="section-kicker">Find us</p>
                        <h2 className="text-3xl font-black tracking-tight text-slate-950">Lahore Office</h2>
                        <p className="mt-2 text-sm text-slate-500">Office No. 5, First Floor, Mozang Hights, 43 Mozang Rd, Lahore</p>
                    </div>
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=Office%20No.%205%2C%20First%20Floor%2C%20Mozang%20Hights%2C%2043%20Mozang%20Rd%2C%20Lahore"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-blue-700 hover:text-blue-800"
                    >
                        Open in Google Maps ↗
                    </a>
                </div>
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <iframe
                        title="Google Map showing the Lahore Office at Mozang Hights"
                        src="https://www.google.com/maps?q=Office%20No.%205%2C%20First%20Floor%2C%20Mozang%20Hights%2C%2043%20Mozang%20Rd%2C%20Lahore&output=embed"
                        className="h-[360px] w-full border-0 md:h-[460px]"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                    />
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[.7fr_1.3fr]">
                <div>
                    <h2 className="text-2xl font-bold">Our branches</h2>
                    {settings.locations.map((office) => (
                        <div key={office.id} className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-6">
                            <h3 className="font-bold text-cyan-300">{office.name}</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                {office.address_line_1}
                                {office.address_line_2 && (
                                    <>
                                        <br />
                                        {office.address_line_2}
                                    </>
                                )}
                                <br />
                                {office.city}
                                {office.postal_code ? `, ${office.postal_code}` : ''}, {office.country}
                            </p>
                            {office.contacts.map((contact) => (
                                <p key={contact.id} className="mt-2 text-sm">
                                    {contact.label}:{' '}
                                    <a
                                        href={`${contact.type === 'email' ? 'mailto:' : 'tel:'}${contact.value}`}
                                        className="text-slate-400 hover:text-blue-700"
                                    >
                                        {contact.value}
                                    </a>
                                </p>
                            ))}
                        </div>
                    ))}
                </div>

                <form id="request-quote" onSubmit={submit} className="scroll-mt-28 rounded-3xl border border-white/10 bg-white/[.035] p-6 md:p-10">
                    <div className="grid gap-5 md:grid-cols-2">
                        <select className="form-input" value={form.data.type} onChange={(event) => form.setData('type', event.target.value)}>
                            <option value="quote">Quotation request</option>
                            <option value="general">General inquiry</option>
                        </select>
                        <input className="form-input" placeholder="Full name *" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required />
                        <input className="form-input" placeholder="Company" value={form.data.company} onChange={(event) => form.setData('company', event.target.value)} />
                        <input className="form-input" type="email" placeholder="Email *" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} required />
                        <input className="form-input" placeholder="Phone" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} />
                        <input className="form-input" placeholder="City" value={form.data.city} onChange={(event) => form.setData('city', event.target.value)} />

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2 md:p-5">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-slate-900">Products</h3>
                                    <p className="mt-1 text-xs text-slate-500">Add up to 20 products and set the required quantity for each.</p>
                                </div>
                                {form.data.products.length > 0 && (
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                        {form.data.products.length} selected
                                    </span>
                                )}
                            </div>

                            <ProductSearchPicker
                                products={productOptions}
                                selectedIds={selectedIds}
                                onSelect={addProduct}
                                disabled={form.data.products.length >= 20}
                            />

                            {form.data.products.length > 0 ? (
                                <div className="mt-4 space-y-2">
                                    {form.data.products.map((line: ProductLine, index: number) => {
                                        const product = productsById.get(Number(line.id));

                                        return (
                                            <div key={line.id} className="grid items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_130px_auto]">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
                                                        <PackageCheck className="h-4 w-4" />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-slate-800">{product?.name ?? 'Selected product'}</p>
                                                        {product?.sku && <p className="mt-0.5 text-xs text-slate-400">{product.sku}</p>}
                                                    </div>
                                                </div>
                                                <label className="flex items-center gap-2 text-xs text-slate-500">
                                                    Qty
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="100000"
                                                        step="1"
                                                        required
                                                        value={line.quantity}
                                                        onChange={(event) => updateQuantity(index, event.target.value)}
                                                        className="form-input h-10 px-3 py-2"
                                                        aria-label={`Quantity for ${product?.name ?? 'product'}`}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => removeProduct(index)}
                                                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                    aria-label={`Remove ${product?.name ?? 'product'}`}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-5 text-center text-sm text-slate-500">
                                    No products selected yet. You can still submit a request for a custom solution.
                                </p>
                            )}
                        </div>

                        <input className="form-input md:col-span-2" placeholder="Subject" value={form.data.subject} onChange={(event) => form.setData('subject', event.target.value)} />
                        <textarea className="form-input min-h-36 md:col-span-2" placeholder="Describe your site, requirements and timeline *" value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} required />
                        <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => form.setData('attachments', Array.from(event.target.files || []))} className="form-input md:col-span-2" />
                    </div>

                    {Object.keys(form.errors).length > 0 && (
                        <p className="mt-4 text-sm text-red-600">{Object.values(form.errors)[0] as string}</p>
                    )}
                    <button disabled={form.processing} className="mt-7 rounded-full bg-cyan-300 px-8 py-4 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
                        {form.processing ? 'Sending…' : 'Submit request'}
                    </button>
                </form>
            </section>
        </PublicLayout>
    );
}
