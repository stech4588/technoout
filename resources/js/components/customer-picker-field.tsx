import { Search, UserRound, X } from 'lucide-react';
import { KeyboardEvent, useId, useMemo, useRef, useState } from 'react';

export interface CustomerOption {
    id: number;
    name: string;
    company?: string | null;
    email: string;
    phone?: string | null;
    city?: string | null;
}

function customerLabel(customer: CustomerOption) {
    return [customer.name, customer.email, customer.phone].filter(Boolean).join(' · ');
}

interface CustomerPickerFieldProps {
    customers: CustomerOption[];
    value?: string | number | null;
    onSelect: (customer: CustomerOption | null) => void;
}

export default function CustomerPickerField({ customers, value, onSelect }: CustomerPickerFieldProps) {
    const listId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const selected = useMemo(
        () => customers.find((customer) => String(customer.id) === String(value ?? '')) ?? null,
        [customers, value],
    );

    const matches = useMemo(() => {
        const search = query.trim().toLocaleLowerCase();

        return customers
            .filter((customer) => {
                if (!search) return true;
                const haystack = `${customer.name} ${customer.company ?? ''} ${customer.email} ${customer.phone ?? ''} ${customer.city ?? ''}`;
                return haystack.toLocaleLowerCase().includes(search);
            })
            .slice(0, 12);
    }, [customers, query]);

    const choose = (customer: CustomerOption) => {
        onSelect(customer);
        setQuery('');
        setOpen(false);
        setActiveIndex(0);
    };

    const clear = () => {
        onSelect(null);
        setQuery('');
        setOpen(false);
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
        <div className="md:col-span-2">
            <span className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase">Customer</span>
            {selected ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-300/20 text-cyan-200">
                        <UserRound className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{customerLabel(selected)}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                            Contact fields filled from customer #{selected.id}. You can still edit them below.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={clear}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            ref={inputRef}
                            id={`${listId}-input`}
                            role="combobox"
                            aria-label="Search customers by name, email, or phone"
                            aria-autocomplete="list"
                            aria-controls={listId}
                            aria-expanded={open}
                            aria-activedescendant={open && matches[activeIndex] ? `${listId}-${matches[activeIndex].id}` : undefined}
                            autoComplete="off"
                            placeholder="Search existing customer by name, email, or phone…"
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setActiveIndex(0);
                                setOpen(true);
                            }}
                            onFocus={() => setOpen(true)}
                            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
                            onKeyDown={handleKeyDown}
                            className="form-input pl-11"
                        />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                        Leave empty for a walk-in / new contact — a customer record will be created or matched by email/phone on save.
                    </p>
                    {open ? (
                        <ul
                            id={listId}
                            role="listbox"
                            className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-white/10 bg-slate-950 py-1 shadow-xl"
                        >
                            {matches.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-slate-500">No customers match that search.</li>
                            ) : (
                                matches.map((customer, index) => (
                                    <li key={customer.id} role="presentation">
                                        <button
                                            type="button"
                                            id={`${listId}-${customer.id}`}
                                            role="option"
                                            aria-selected={index === activeIndex}
                                            className={
                                                'flex w-full cursor-pointer flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm ' +
                                                (index === activeIndex ? 'bg-cyan-300/15 text-cyan-100' : 'text-slate-200 hover:bg-white/5')
                                            }
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => choose(customer)}
                                        >
                                            <span className="font-semibold">{customer.name}</span>
                                            <span className="text-xs text-slate-400">
                                                {[customer.email, customer.phone, customer.company].filter(Boolean).join(' · ')}
                                            </span>
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    ) : null}
                </div>
            )}
        </div>
    );
}
