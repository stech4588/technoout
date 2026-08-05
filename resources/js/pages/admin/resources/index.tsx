import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
export default function Index({ resource, title, columns, records }: any) {
    const send = (row: any) => {
        const type = resource === 'quotations' ? 'quotation' : 'invoice';
        const subject = prompt('Email subject', `${type} ${row.number} from Technoout`);
        const body = subject && prompt('Email message', `Dear ${row.customer_name}, please review your ${type}.`);
        if (subject && body) router.post(`/admin/documents/${type}/${row.id}/send`, { subject, body });
    };
    const payment = (row: any) => {
        const amount = prompt('Payment amount');
        if (amount) router.post(`/admin/invoices/${row.id}/payments`, { amount, paid_at: new Date().toISOString().slice(0, 10), method: 'bank' });
    };
    return (
        <AdminLayout title={title}>
            <Head title={title} />
            <div className="mb-6 flex justify-end">
                <Link href={'/admin/' + resource + '/create'} className="rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950">
                    Create new
                </Link>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-xs tracking-wider text-slate-500 uppercase">
                        <tr>
                            {columns.map((c: string) => (
                                <th key={c} className="px-5 py-4">
                                    {c.replaceAll('_', ' ')}
                                </th>
                            ))}
                            <th className="px-5 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.data.map((row: any) => (
                            <tr key={row.id} className="border-t border-white/5">
                                {columns.map((c: string) => (
                                    <td key={c} className="max-w-64 truncate px-5 py-4">
                                        {typeof row[c] === 'boolean' ? (row[c] ? 'Yes' : 'No') : String(row[c] ?? '—')}
                                    </td>
                                ))}
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <Link href={'/admin/' + resource + '/' + row.id + '/edit'} className="mr-4 text-cyan-300">
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => confirm('Delete this record?') && router.delete('/admin/' + resource + '/' + row.id)}
                                        className="text-red-300"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex gap-2">
                {records.links.map((l: any, i: number) => (
                    <button
                        key={i}
                        disabled={!l.url}
                        onClick={() => l.url && router.visit(l.url)}
                        dangerouslySetInnerHTML={{ __html: l.label }}
                        className="rounded border border-white/10 px-3 py-2 text-xs"
                    />
                ))}
            </div>
        </AdminLayout>
    );
}
