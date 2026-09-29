import ProductSearchPicker, { ProductOption } from '@/components/product-search-picker';
import { useForm } from '@inertiajs/react';
import { Minus, PackageCheck, Send } from 'lucide-react';
import { FormEvent, useMemo } from 'react';

interface ProductLine {
    [key: string]: string | number;
    id: string;
    quantity: number | string;
}

interface QuoteRequestFormData {
    [key: string]: string | ProductLine[];
    type: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    city: string;
    subject: string;
    message: string;
    products: ProductLine[];
}

interface QuoteRequestFormProps {
    brand: string;
    products: ProductOption[];
    selectedProductId?: number | null;
    id?: string;
    className?: string;
    showTypeSelect?: boolean;
}

export default function QuoteRequestForm({
    brand,
    products,
    selectedProductId = null,
    id = 'request-quote',
    className = 'contact-form-shell scroll-mt-28 p-6 md:p-10',
    showTypeSelect = true,
}: QuoteRequestFormProps) {
    const productOptions = products;
    const initialProducts: ProductLine[] = selectedProductId ? [{ id: String(selectedProductId), quantity: 1 }] : [];
    const form = useForm<QuoteRequestFormData>({
        type: 'quote',
        name: '',
        company: '',
        email: '',
        phone: '',
        city: '',
        subject: '',
        message: '',
        products: initialProducts,
    });

    const isQuote = form.data.type === 'quote';
    const productsById = useMemo(() => new Map(productOptions.map((product) => [product.id, product])), [productOptions]);
    const selectedIds = form.data.products.map((line: ProductLine) => Number(line.id));

    const setType = (type: string) => {
        form.setData({
            ...form.data,
            type,
            products: type === 'general' ? [] : form.data.products,
        });
    };

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
        const payload =
            form.data.type === 'general'
                ? { ...form.data, products: [] as ProductLine[] }
                : form.data;
        form.transform(() => payload);
        form.post('/contact', {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => form.transform((data) => data),
        });
    };

    return (
        <form id={id} onSubmit={submit} className={className}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{isQuote ? 'Request a quote' : 'Send an inquiry'}</h2>
                <p className="mt-2 text-sm text-slate-500">
                    {isQuote
                        ? `Tell ${brand} about your site requirements — we will respond with a tailored proposal.`
                        : `Share your contact details and question — ${brand} will get back to you.`}
                </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
                {showTypeSelect ? (
                    <select className="form-input" value={form.data.type} onChange={(event) => setType(event.target.value)}>
                        <option value="quote">Quotation request</option>
                        <option value="general">General inquiry</option>
                    </select>
                ) : null}
                <input
                    className={showTypeSelect ? 'form-input' : 'form-input md:col-span-2'}
                    placeholder="Full name *"
                    value={form.data.name}
                    onChange={(event) => form.setData('name', event.target.value)}
                    required
                />
                <input
                    className="form-input"
                    placeholder="Company (optional)"
                    value={form.data.company}
                    onChange={(event) => form.setData('company', event.target.value)}
                />
                <input
                    className="form-input"
                    type="email"
                    placeholder="Email *"
                    value={form.data.email}
                    onChange={(event) => form.setData('email', event.target.value)}
                    required
                />
                <input
                    className="form-input"
                    type="tel"
                    placeholder="Phone *"
                    value={form.data.phone}
                    onChange={(event) => form.setData('phone', event.target.value)}
                    required
                />
                <input
                    className="form-input"
                    placeholder="City (optional)"
                    value={form.data.city}
                    onChange={(event) => form.setData('city', event.target.value)}
                />

                {isQuote ? (
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
                                        <div
                                            key={line.id}
                                            className="grid items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_130px_auto]"
                                        >
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
                                                className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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
                ) : null}

                <textarea
                    className="form-input min-h-36 md:col-span-2"
                    placeholder={
                        isQuote
                            ? 'Describe your site, requirements and timeline *'
                            : 'How can we help? Share your question or details *'
                    }
                    value={form.data.message}
                    onChange={(event) => form.setData('message', event.target.value)}
                    required
                />
            </div>

            {Object.keys(form.errors).length > 0 && (
                <p className="mt-4 text-sm text-red-600">{Object.values(form.errors)[0] as string}</p>
            )}
            <button
                disabled={form.processing}
                className="contact-submit mt-7 inline-flex cursor-pointer items-center gap-2 rounded-full bg-cyan-300 px-8 py-4 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <Send className="h-4 w-4" />
                {form.processing ? 'Sending…' : 'Submit request'}
            </button>
        </form>
    );
}
