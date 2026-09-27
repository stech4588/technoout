import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { FileText, Percent, Receipt, TrendingUp } from 'lucide-react';

export default function Dashboard({ stats, report, topProducts, inquiries, invoices }: any) {
    const money = (v: any) => `PKR ${Number(v || 0).toLocaleString()}`;
    return (
        <AdminLayout title="Command center">
            <Head title="Admin dashboard" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((s: any) => (
                    <Link href={s.href} key={s.label} className="admin-dash-card">
                        <p className="text-sm text-slate-500">{s.label}</p>
                        <p className="mt-3 text-4xl font-black text-cyan-300">{s.value}</p>
                    </Link>
                ))}
            </div>
            <h2 className="mt-10 mb-4 text-xl font-bold">Business report</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric label="Outstanding receivables" value={money(report.receivables)} icon={TrendingUp} />
                <Metric label="Paid this month" value={money(report.paid_this_month)} icon={Receipt} />
                <Metric label="Overdue invoices" value={report.overdue_count} icon={FileText} />
                <Metric label="Quote conversion" value={`${report.quote_conversion}%`} icon={Percent} />
            </div>
            <div className="mt-8 grid gap-6 xl:grid-cols-2">
                <Panel title="Recent requests" rows={inquiries} fields={['reference', 'name', 'status']} />
                <Panel title="Recent invoices" rows={invoices} fields={['number', 'customer_name', 'status']} />
                <Panel title="Top accepted products" rows={topProducts} fields={['name', 'quantity', 'value']} />
            </div>
        </AdminLayout>
    );
}

function Metric({ label, value, icon: Icon }: any) {
    return (
        <div className="admin-dash-card">
            <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">{label}</p>
                <span className="admin-metric-icon">
                    <Icon className="h-4 w-4" />
                </span>
            </div>
            <p className="text-2xl font-black text-emerald-300">{value}</p>
        </div>
    );
}

function Panel({ title, rows, fields }: any) {
    return (
        <section className="admin-dash-panel">
            <h2 className="font-bold">{title}</h2>
            <div className="mt-5 space-y-2">
                {rows.map((row: any) => (
                    <div key={row.id} className="grid grid-cols-3 gap-3 rounded-lg bg-white/[.03] p-3 text-sm">
                        {fields.map((f: string) => (
                            <span key={f} className="truncate">
                                {String(row[f] ?? '—')}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}
