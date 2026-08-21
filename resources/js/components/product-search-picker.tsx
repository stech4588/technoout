import { Search } from 'lucide-react';
import { KeyboardEvent, useId, useMemo, useRef, useState } from 'react';

export interface ProductOption {
    id: number;
    name: string;
    sku?: string | null;
}

interface ProductSearchPickerProps {
    products: ProductOption[];
    selectedIds: number[];
    onSelect: (product: ProductOption) => void;
    disabled?: boolean;
}

export default function ProductSearchPicker({ products, selectedIds, onSelect, disabled = false }: ProductSearchPickerProps) {
    const listId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const matches = useMemo(() => {
        const search = query.trim().toLocaleLowerCase();

        return products
            .filter((product) => !selectedIds.includes(product.id))
            .filter((product) => !search || `${product.name} ${product.sku ?? ''}`.toLocaleLowerCase().includes(search))
            .slice(0, 10);
    }, [products, query, selectedIds]);

    const choose = (product: ProductOption) => {
        onSelect(product);
        setQuery('');
        setActiveIndex(0);
        setOpen(true);
        window.requestAnimationFrame(() => inputRef.current?.focus());
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.min(current + 1, Math.max(0, matches.length - 1)));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((current) => Math.max(0, current - 1));
        } else if (event.key === 'Enter' && open && matches[activeIndex]) {
            event.preventDefault();
            choose(matches[activeIndex]);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <div className="relative">
            <label htmlFor={`${listId}-input`} className="mb-2 block text-sm font-semibold text-slate-700">
                Search and add products
            </label>
            <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    ref={inputRef}
                    id={`${listId}-input`}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls={listId}
                    aria-expanded={open}
                    aria-activedescendant={open && matches[activeIndex] ? `${listId}-${matches[activeIndex].id}` : undefined}
                    autoComplete="off"
                    disabled={disabled}
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setActiveIndex(0);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => window.setTimeout(() => setOpen(false), 120)}
                    onKeyDown={handleKeyDown}
                    placeholder={disabled ? 'Maximum 20 products selected' : 'Search by product name or SKU…'}
                    className="form-input pl-11"
                />
            </div>

            {open && !disabled && (
                <div
                    id={listId}
                    role="listbox"
                    className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                >
                    {matches.length > 0 ? (
                        matches.map((product, index) => (
                            <button
                                id={`${listId}-${product.id}`}
                                key={product.id}
                                type="button"
                                role="option"
                                aria-selected={index === activeIndex}
                                onMouseDown={(event) => event.preventDefault()}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => choose(product)}
                                className={`flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left text-sm ${
                                    index === activeIndex ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <span className="font-semibold">{product.name}</span>
                                {product.sku && <span className="shrink-0 text-xs text-slate-400">{product.sku}</span>}
                            </button>
                        ))
                    ) : (
                        <p className="px-4 py-5 text-sm text-slate-500">No matching products available.</p>
                    )}
                    {!query && matches.length > 0 && (
                        <p className="border-t border-slate-100 px-4 pt-2 text-xs text-slate-400">Type to narrow the product list.</p>
                    )}
                </div>
            )}
        </div>
    );
}
