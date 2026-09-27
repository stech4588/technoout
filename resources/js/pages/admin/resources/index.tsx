import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Ban,
    Banknote,
    Check,
    FilePlus,
    Pencil,
    Plus,
    Receipt,
    Send,
    Trash2,
    Undo2,
    X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

function ActionBtn({
    tone = 'default',
    label,
    children,
    onClick,
    href,
}: {
    tone?: 'default' | 'success' | 'warn' | 'danger';
    label: string;
    children: ReactNode;
    onClick?: () => void;
    href?: string;
}) {
    const className = `admin-action-btn admin-action-${tone}`;
    if (href) {
        return (
            <Link href={href} className={className} title={label} aria-label={label}>
                {children}
                <span className="admin-action-label">{label}</span>
            </Link>
        );
    }
    return (
        <button type="button" onClick={onClick} className={className} title={label} aria-label={label}>
            {children}
            <span className="admin-action-label">{label}</span>
        </button>
    );
}

export default function Index({ resource, title, columns, records }: any) {
    const [dialog, setDialog] = useState<any>(null);
    const workflowCreate: any = {
        quotations: { label: 'Create from request', href: '/admin/inquiries' },
        invoices: { label: 'Create from accepted quotation', href: '/admin/quotations' },
        payments: { label: 'Record against invoice', href: '/admin/invoices' },
    };
    const createHref =
        resource === 'business' && records.data[0]
            ? `/admin/business/${records.data[0].id}/edit`
            : workflowCreate[resource]?.href || '/admin/' + resource + '/create';
    const createLabel =
        resource === 'business' && records.data[0]
            ? 'Edit business profile'
            : workflowCreate[resource]?.label || (resource === 'inquiries' ? 'Create new request' : 'Create new');

    return (
        <AdminLayout title={title} backHref="/admin" backLabel="Back to dashboard">
            <Head title={title} />
            <div className="mb-6 flex justify-end">
                <Link href={createHref} className="admin-primary-cta">
                    <Plus className="h-4 w-4" />
                    {createLabel}
                </Link>
            </div>
            <div className="admin-table-shell overflow-x-auto">
                <table className="admin-table w-full text-left text-sm">
                    <thead>
                        <tr>
                            {columns.map((c: string) => (
                                <th key={c}>{c.replaceAll('_', ' ')}</th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-5 py-12 text-center text-slate-500">
                                    No records yet. Use “{createLabel}” to get started.
                                </td>
                            </tr>
                        ) : (
                            records.data.map((row: any) => (
                                <tr key={row.id}>
                                    {columns.map((c: string) => (
                                        <td key={c} className="max-w-64 truncate">
                                            {c === 'is_returning' ? (
                                                row.is_returning ? (
                                                    <span className="inline-flex rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-bold text-amber-200">
                                                        Returning
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-bold text-emerald-200">
                                                        New
                                                    </span>
                                                )
                                            ) : typeof row[c] === 'boolean' ? (
                                                row[c] ? 'Yes' : 'No'
                                            ) : (
                                                String(row[c] ?? '—')
                                            )}
                                        </td>
                                    ))}
                                    <td>
                                        <div className="admin-action-row">
                                            <ActionBtn
                                                label="Edit"
                                                href={'/admin/' + resource + '/' + row.id + '/edit'}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </ActionBtn>
                                            {resource === 'inquiries' && row.status !== 'spam' && (
                                                <ActionBtn
                                                    tone="success"
                                                    label="Quote"
                                                    onClick={() =>
                                                        confirm('Create a draft quotation from this request?') &&
                                                        router.post(`/admin/inquiries/${row.id}/quotation`)
                                                    }
                                                >
                                                    <FilePlus className="h-3.5 w-3.5" />
                                                </ActionBtn>
                                            )}
                                            {['quotations', 'invoices'].includes(resource) && (
                                                <ActionBtn
                                                    tone="success"
                                                    label="Send"
                                                    onClick={() =>
                                                        setDialog({
                                                            type: 'send',
                                                            row,
                                                            kind: resource === 'quotations' ? 'quotation' : 'invoice',
                                                        })
                                                    }
                                                >
                                                    <Send className="h-3.5 w-3.5" />
                                                </ActionBtn>
                                            )}
                                            {resource === 'quotations' && row.status === 'accepted' && (
                                                <ActionBtn
                                                    tone="warn"
                                                    label="Create invoice"
                                                    onClick={() => router.post(`/admin/quotations/${row.id}/invoice`)}
                                                >
                                                    <Receipt className="h-3.5 w-3.5" />
                                                </ActionBtn>
                                            )}
                                            {resource === 'invoices' && !['paid', 'void'].includes(row.status) && (
                                                <ActionBtn
                                                    tone="warn"
                                                    label="Record payment"
                                                    onClick={() => setDialog({ type: 'payment', row })}
                                                >
                                                    <Banknote className="h-3.5 w-3.5" />
                                                </ActionBtn>
                                            )}
                                            {resource === 'invoices' && row.status !== 'void' && (
                                                <ActionBtn
                                                    tone="danger"
                                                    label="Void"
                                                    onClick={() => setDialog({ type: 'void', row })}
                                                >
                                                    <Ban className="h-3.5 w-3.5" />
                                                </ActionBtn>
                                            )}
                                            {resource === 'payments' && !row.reversed_at && (
                                                <ActionBtn
                                                    tone="warn"
                                                    label="Reverse"
                                                    onClick={() => setDialog({ type: 'reverse', row })}
                                                >
                                                    <Undo2 className="h-3.5 w-3.5" />
                                                </ActionBtn>
                                            )}
                                            {!['quotations', 'invoices', 'payments', 'business'].includes(resource) && (
                                                <ActionBtn
                                                    tone="danger"
                                                    label="Delete"
                                                    onClick={() =>
                                                        confirm('Delete this record?') &&
                                                        router.delete('/admin/' + resource + '/' + row.id)
                                                    }
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </ActionBtn>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
                {records.links.map((l: any, i: number) => (
                    <button
                        key={i}
                        type="button"
                        disabled={!l.url}
                        onClick={() => l.url && router.visit(l.url)}
                        dangerouslySetInnerHTML={{ __html: l.label }}
                        className="cursor-pointer rounded-lg border border-white/10 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                    />
                ))}
            </div>
            {dialog && <ActionDialog action={dialog} close={() => setDialog(null)} />}
        </AdminLayout>
    );
}

function ActionDialog({ action, close }: any) {
    const today = new Date().toISOString().slice(0, 10);
    const [data, setData] = useState<any>(
        action.type === 'send'
            ? {
                  subject: `${action.kind} ${action.row.number} from ViaTech`,
                  body: `Dear ${action.row.customer_name},\n\nPlease review the attached ${action.kind}.`,
              }
            : action.type === 'payment'
              ? { amount: '', paid_at: today, method: 'bank', reference: '', notes: '' }
              : { reason: '' },
    );
    const submit = (e: any) => {
        e.preventDefault();
        const url =
            action.type === 'send'
                ? `/admin/documents/${action.kind}/${action.row.id}/send`
                : action.type === 'payment'
                  ? `/admin/invoices/${action.row.id}/payments`
                  : action.type === 'void'
                    ? `/admin/invoices/${action.row.id}/void`
                    : `/admin/payments/${action.row.id}/reverse`;
        router.post(url, data, { onSuccess: close });
    };

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
            <form
                onSubmit={submit}
                className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-[#0b1220] p-7 shadow-2xl"
            >
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">
                        {action.type === 'send'
                            ? 'Send document'
                            : action.type === 'payment'
                              ? 'Record payment'
                              : action.type === 'void'
                                ? 'Void invoice'
                                : 'Reverse payment'}
                    </h2>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close"
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {action.type === 'send' ? (
                    <>
                        <label className="block">
                            <span className="mb-2 block text-sm">Subject</span>
                            <input
                                required
                                maxLength={190}
                                className="form-input"
                                value={data.subject}
                                onChange={(e) => setData({ ...data, subject: e.target.value })}
                            />
                        </label>
                        <label className="block">
                            <span className="mb-2 block text-sm">Message</span>
                            <textarea
                                required
                                maxLength={10000}
                                className="form-input min-h-40"
                                value={data.body}
                                onChange={(e) => setData({ ...data, body: e.target.value })}
                            />
                        </label>
                    </>
                ) : action.type === 'payment' ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label>
                            <span className="mb-2 block text-sm">Amount</span>
                            <input
                                autoFocus
                                required
                                min="0.01"
                                step="0.01"
                                type="number"
                                className="form-input"
                                value={data.amount}
                                onChange={(e) => setData({ ...data, amount: e.target.value })}
                            />
                        </label>
                        <label>
                            <span className="mb-2 block text-sm">Paid date</span>
                            <input
                                required
                                type="date"
                                max={today}
                                className="form-input"
                                value={data.paid_at}
                                onChange={(e) => setData({ ...data, paid_at: e.target.value })}
                            />
                        </label>
                        <label>
                            <span className="mb-2 block text-sm">Method</span>
                            <select
                                className="form-input"
                                value={data.method}
                                onChange={(e) => setData({ ...data, method: e.target.value })}
                            >
                                {['bank', 'cash', 'cheque', 'other'].map((x) => (
                                    <option key={x}>{x}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className="mb-2 block text-sm">Reference</span>
                            <input
                                className="form-input"
                                value={data.reference}
                                onChange={(e) => setData({ ...data, reference: e.target.value })}
                            />
                        </label>
                        <label className="sm:col-span-2">
                            <span className="mb-2 block text-sm">Notes</span>
                            <textarea
                                className="form-input"
                                value={data.notes}
                                onChange={(e) => setData({ ...data, notes: e.target.value })}
                            />
                        </label>
                    </div>
                ) : (
                    <label className="block">
                        <span className="mb-2 block text-sm">Reason</span>
                        <textarea
                            autoFocus
                            required
                            maxLength={2000}
                            className="form-input min-h-28"
                            value={data.reason}
                            onChange={(e) => setData({ reason: e.target.value })}
                        />
                    </label>
                )}
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={close} className="admin-dialog-btn admin-dialog-cancel">
                        <X className="h-4 w-4" />
                        Cancel
                    </button>
                    <button type="submit" className="admin-dialog-btn admin-dialog-confirm">
                        <Check className="h-4 w-4" />
                        Confirm
                    </button>
                </div>
            </form>
        </div>
    );
}
