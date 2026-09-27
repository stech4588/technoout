import ProductCard from '@/components/product-card';
import PublicLayout from '@/layouts/public-layout';
import { Head, router } from '@inertiajs/react';
import { ChevronRight, Filter, Search, Sparkles, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type CatalogChild = {
    id: number;
    name: string;
    slug: string;
    products_count: number;
};

type CatalogCategory = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    thumbnail_url?: string | null;
    products_count: number;
    children: CatalogChild[];
};

type CatalogFilters = {
    search?: string;
    category?: string;
};

type ActiveCategory = {
    id: number;
    name: string;
    slug: string;
    parent_id?: number | null;
} | null;

function visitCatalog(params: Record<string, string>) {
    const cleaned = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== ''));
    router.get('/catalog', cleaned, { preserveScroll: true, preserveState: true });
}

function navClass(active: boolean, nested = false, soft = false) {
    return (
        'catalog-nav-btn flex w-full items-center justify-between gap-2 rounded-lg text-left ' +
        (nested ? 'px-2.5 py-2 text-[13px] ' : 'px-3 py-2.5 text-sm font-semibold ') +
        (active
            ? 'is-active bg-[#075fd8] text-white'
            : soft
              ? 'bg-blue-50 text-[#075fd8]'
              : nested
                ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                : 'text-slate-700 hover:bg-slate-100 hover:text-[#075fd8]')
    );
}

function CategorySidebar({
    categories,
    selectedSlug,
    onSelect,
}: {
    categories: CatalogCategory[];
    selectedSlug: string;
    onSelect: (slug: string) => void;
}) {
    return (
        <aside className="catalog-panel catalog-sidebar-shell overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100/80 px-4 py-3.5">
                <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[.2em] text-[#075fd8] uppercase">
                        <Sparkles className="h-3 w-3" /> Categories
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">Browse the catalog</p>
                </div>
                {selectedSlug ? (
                    <button
                        type="button"
                        onClick={() => onSelect('')}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#075fd8]"
                    >
                        <X className="h-3.5 w-3.5" /> Clear
                    </button>
                ) : null}
            </div>

            <nav className="max-h-[min(70vh,42rem)] space-y-1 overflow-y-auto p-2.5 lg:max-h-[calc(100vh-9.5rem)]">
                <button type="button" onClick={() => onSelect('')} className={navClass(!selectedSlug)}>
                    <span>All products</span>
                </button>

                {categories.map((category) => {
                    const parentActive = category.slug === selectedSlug;
                    const childActive = category.children.some((child) => child.slug === selectedSlug);
                    const branchOpen = parentActive || childActive;

                    return (
                        <div key={category.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(category.slug)}
                                className={navClass(parentActive, false, childActive && !parentActive)}
                            >
                                <span className="min-w-0 flex-1 truncate">{category.name}</span>
                                <span
                                    className={
                                        'catalog-count shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ' +
                                        (parentActive
                                            ? 'bg-white/20 text-white'
                                            : childActive
                                              ? 'bg-white text-[#075fd8]'
                                              : 'bg-slate-100 text-slate-500')
                                    }
                                >
                                    {category.products_count}
                                </span>
                            </button>

                            {branchOpen && category.children.length > 0 ? (
                                <div className="catalog-branch mt-1 mb-1 ml-3 space-y-0.5 border-l border-slate-200 pl-2">
                                    <button
                                        type="button"
                                        onClick={() => onSelect(category.slug)}
                                        className={navClass(parentActive, true)}
                                    >
                                        <span className="flex items-center gap-1">
                                            <ChevronRight className="h-3 w-3 opacity-60" />
                                            All in category
                                        </span>
                                    </button>
                                    {category.children.map((child) => {
                                        const active = child.slug === selectedSlug;
                                        return (
                                            <button
                                                key={child.id}
                                                type="button"
                                                onClick={() => onSelect(child.slug)}
                                                className={navClass(active, true)}
                                            >
                                                <span className="min-w-0 flex-1 truncate">{child.name}</span>
                                                <span
                                                    className={
                                                        'catalog-count shrink-0 text-[10px] font-bold tabular-nums ' +
                                                        (active ? 'text-white/80' : 'text-slate-400')
                                                    }
                                                >
                                                    {child.products_count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}

export default function Catalog({
    settings,
    products,
    categories,
    filters,
    activeCategory,
}: {
    settings: any;
    products: { data: any[]; links: any[]; total?: number };
    categories: CatalogCategory[];
    filters: CatalogFilters;
    activeCategory: ActiveCategory;
}) {
    const selectedSlug = filters.category || '';
    const hasFilters = Boolean(filters.search || filters.category);
    const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

    const selectCategory = (slug: string) => {
        visitCatalog({ search: filters.search || '', category: slug });
        setMobileCategoriesOpen(false);
    };

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        visitCatalog({
            search: String(form.get('search') || '').trim(),
            category: selectedSlug,
        });
    };

    return (
        <PublicLayout settings={settings}>
            <Head title="Product catalog" />

            <div className="catalog-page">
                <section className="catalog-hero border-b border-slate-200/80">
                    <div className="catalog-hero-grid" aria-hidden />
                    <div className="catalog-orb catalog-orb-a" aria-hidden />
                    <div className="catalog-orb catalog-orb-b" aria-hidden />
                    <div className="catalog-hero-content mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-3 px-4 py-6 sm:px-6 lg:px-8">
                        <div>
                            <p className="section-kicker !mb-2">Engineered systems</p>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                Product catalog
                            </h1>
                            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                                Automation, security, access and industrial systems — ready for project quotation.
                            </p>
                        </div>
                        {products.total !== undefined ? (
                            <div className="rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm text-slate-500 shadow-sm backdrop-blur">
                                <span className="font-semibold text-slate-800">{products.total}</span>{' '}
                                {products.total === 1 ? 'product' : 'products'}
                                {activeCategory ? (
                                    <>
                                        {' '}
                                        in <span className="font-semibold text-[#075fd8]">{activeCategory.name}</span>
                                    </>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </section>

                <section className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
                    <div className="mb-4 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileCategoriesOpen((open) => !open)}
                            className="catalog-panel flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                        >
                            <span>{activeCategory ? activeCategory.name : 'All categories'}</span>
                            <Filter className="h-4 w-4 text-[#075fd8]" />
                        </button>
                        {mobileCategoriesOpen ? (
                            <div className="mt-3">
                                <CategorySidebar
                                    categories={categories}
                                    selectedSlug={selectedSlug}
                                    onSelect={selectCategory}
                                />
                            </div>
                        ) : null}
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-6">
                        <div className="hidden lg:block">
                            <div className="sticky top-24">
                                <CategorySidebar
                                    categories={categories}
                                    selectedSlug={selectedSlug}
                                    onSelect={selectCategory}
                                />
                            </div>
                        </div>

                        <div className="min-w-0">
                            <form
                                key={`${filters.search || ''}|${filters.category || ''}`}
                                onSubmit={onSubmit}
                                className="catalog-panel catalog-toolbar mb-4 flex flex-col gap-2 rounded-2xl p-3 sm:flex-row sm:items-center"
                            >
                                <label className="relative min-w-0 flex-1 cursor-text">
                                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        name="search"
                                        defaultValue={filters.search}
                                        placeholder="Search products, SKU or brand…"
                                        className="form-input !rounded-xl !py-2.5 pl-10"
                                    />
                                </label>
                                <button
                                    type="submit"
                                    className="cta-glow inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#075fd8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#064eaf]"
                                >
                                    <Filter className="h-4 w-4" /> Filter
                                </button>
                            </form>

                            {(activeCategory || filters.search) && (
                                <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                    {activeCategory ? (
                                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                                            {activeCategory.name}
                                            <button
                                                type="button"
                                                aria-label="Clear category"
                                                onClick={() => selectCategory('')}
                                                className="cursor-pointer rounded-full p-0.5 transition hover:bg-slate-100"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </span>
                                    ) : null}
                                    {filters.search ? (
                                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                                            “{filters.search}”
                                            <button
                                                type="button"
                                                aria-label="Clear search"
                                                onClick={() => visitCatalog({ search: '', category: selectedSlug })}
                                                className="cursor-pointer rounded-full p-0.5 transition hover:bg-slate-100"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </span>
                                    ) : null}
                                </div>
                            )}

                            {products.data.length === 0 ? (
                                <div className="catalog-panel rounded-2xl border-dashed px-6 py-14 text-center">
                                    <p className="text-lg font-semibold text-slate-800">No products match these filters</p>
                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                        Try another category or clear the search to browse the full catalog.
                                    </p>
                                    {hasFilters ? (
                                        <button
                                            type="button"
                                            onClick={() => visitCatalog({ search: '', category: '' })}
                                            className="cta-glow mt-5 inline-flex rounded-full bg-[#075fd8] px-6 py-2.5 text-sm font-bold text-white"
                                        >
                                            Clear filters
                                        </button>
                                    ) : null}
                                </div>
                            ) : (
                                <>
                                    <div
                                        key={`${filters.search || ''}|${filters.category || ''}|${products.data[0]?.id}`}
                                        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                                    >
                                        {products.data.map((item: any) => (
                                            <div key={item.id} className="catalog-card-enter">
                                                <ProductCard product={item} premium />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {products.links.map((link: any, i: number) => (
                                            <button
                                                key={i}
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={
                                                    'rounded-lg border px-3.5 py-1.5 text-sm transition ' +
                                                    (link.active
                                                        ? 'cursor-pointer border-[#075fd8] bg-[#075fd8] font-semibold text-white'
                                                        : link.url
                                                          ? 'cursor-pointer border-slate-200 bg-white text-slate-500 hover:border-[#075fd8]/40 hover:text-[#075fd8]'
                                                          : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300')
                                                }
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
