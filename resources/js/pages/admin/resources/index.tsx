import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
export default function Index({ resource, title, columns, records }: any) {
    const [dialog,setDialog]=useState<any>(null);
    const workflowCreate:any={quotations:{label:'Create from request',href:'/admin/inquiries'},invoices:{label:'Create from accepted quotation',href:'/admin/quotations'},payments:{label:'Record against invoice',href:'/admin/invoices'}};
    return (
        <AdminLayout title={title}>
            <Head title={title} />
            <div className="mb-6 flex justify-end">
                <Link href={resource==='business'&&records.data[0]?`/admin/business/${records.data[0].id}/edit`:workflowCreate[resource]?.href||('/admin/' + resource + '/create')} className="rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950">
                    {resource==='business'&&records.data[0]?'Edit business profile':workflowCreate[resource]?.label||(resource==='inquiries'?'Create new request':'Create new')}
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
                                    {resource === 'inquiries' && row.status !== 'spam' && <button onClick={()=>confirm('Create a draft quotation from this request?')&&router.post(`/admin/inquiries/${row.id}/quotation`)} className="mr-4 text-emerald-300">Quote</button>}
                                    {['quotations','invoices'].includes(resource) && <button onClick={()=>setDialog({type:'send',row,kind:resource==='quotations'?'quotation':'invoice'})} className="mr-4 text-emerald-300">Send</button>}
                                    {resource === 'quotations' && row.status === 'accepted' && <button onClick={()=>router.post(`/admin/quotations/${row.id}/invoice`)} className="mr-4 text-amber-300">Create invoice</button>}
                                    {resource === 'invoices' && !['paid','void'].includes(row.status) && <button onClick={()=>setDialog({type:'payment',row})} className="mr-4 text-amber-300">Record payment</button>}
                                    {resource === 'invoices' && row.status !== 'void' && <button onClick={()=>setDialog({type:'void',row})} className="mr-4 text-red-300">Void</button>}
                                    {resource === 'payments' && !row.reversed_at && <button onClick={()=>setDialog({type:'reverse',row})} className="mr-4 text-amber-300">Reverse</button>}
                                    {!['quotations','invoices','payments','business'].includes(resource) && <button
                                        onClick={() => confirm('Delete this record?') && router.delete('/admin/' + resource + '/' + row.id)}
                                        className="text-red-300"
                                    >
                                        Delete
                                    </button>}
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
            {dialog&&<ActionDialog action={dialog} close={()=>setDialog(null)}/>}
        </AdminLayout>
    );
}

function ActionDialog({action,close}:any){const today=new Date().toISOString().slice(0,10);const [data,setData]=useState<any>(action.type==='send'?{subject:`${action.kind} ${action.row.number} from ViaTech`,body:`Dear ${action.row.customer_name},\n\nPlease review the attached ${action.kind}.`}:action.type==='payment'?{amount:'',paid_at:today,method:'bank',reference:'',notes:''}:{reason:''});const submit=(e:any)=>{e.preventDefault();const url=action.type==='send'?`/admin/documents/${action.kind}/${action.row.id}/send`:action.type==='payment'?`/admin/invoices/${action.row.id}/payments`:action.type==='void'?`/admin/invoices/${action.row.id}/void`:`/admin/payments/${action.row.id}/reverse`;router.post(url,data,{onSuccess:close})};return <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><form onSubmit={submit} className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-[#0b1220] p-7 shadow-2xl"><div className="flex justify-between"><h2 className="text-xl font-bold">{action.type==='send'?'Send document':action.type==='payment'?'Record payment':action.type==='void'?'Void invoice':'Reverse payment'}</h2><button type="button" onClick={close} aria-label="Close">×</button></div>{action.type==='send'?<><label className="block"><span className="mb-2 block text-sm">Subject</span><input required maxLength={190} className="form-input" value={data.subject} onChange={e=>setData({...data,subject:e.target.value})}/></label><label className="block"><span className="mb-2 block text-sm">Message</span><textarea required maxLength={10000} className="form-input min-h-40" value={data.body} onChange={e=>setData({...data,body:e.target.value})}/></label></>:action.type==='payment'?<div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm">Amount</span><input autoFocus required min="0.01" step="0.01" type="number" className="form-input" value={data.amount} onChange={e=>setData({...data,amount:e.target.value})}/></label><label><span className="mb-2 block text-sm">Paid date</span><input required type="date" max={today} className="form-input" value={data.paid_at} onChange={e=>setData({...data,paid_at:e.target.value})}/></label><label><span className="mb-2 block text-sm">Method</span><select className="form-input" value={data.method} onChange={e=>setData({...data,method:e.target.value})}>{['bank','cash','cheque','other'].map(x=><option key={x}>{x}</option>)}</select></label><label><span className="mb-2 block text-sm">Reference</span><input className="form-input" value={data.reference} onChange={e=>setData({...data,reference:e.target.value})}/></label><label className="sm:col-span-2"><span className="mb-2 block text-sm">Notes</span><textarea className="form-input" value={data.notes} onChange={e=>setData({...data,notes:e.target.value})}/></label></div>:<label className="block"><span className="mb-2 block text-sm">Reason</span><textarea autoFocus required maxLength={2000} className="form-input min-h-28" value={data.reason} onChange={e=>setData({reason:e.target.value})}/></label>}<div className="flex justify-end gap-3"><button type="button" onClick={close} className="rounded-xl border border-white/10 px-5 py-2">Cancel</button><button className="rounded-xl bg-cyan-300 px-5 py-2 font-bold text-slate-950">Confirm</button></div></form></div>}
