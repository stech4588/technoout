import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

export default function Form({ resource, title, fields, record, options = {} }: any) {
    if (resource === 'quotations' && record) return <QuotationForm title={title} record={record} products={options.products||[]}/>;
    if (resource === 'invoices' && record) return <InvoiceForm title={title} record={record}/>;
    if (resource === 'payments' && record) return <PaymentDetails title={title} record={record}/>;
    const initial: any = { new_images: [], remove_images: [], thumbnail_index: record?.thumbnail_index ?? 0 };
    Object.keys(fields).filter((key) => fields[key] !== 'images').forEach((key) => {const type=String(fields[key]);initial[key]=record?.[key]??(type==='boolean'?false:type.startsWith('select:')?type.slice(7).split(',')[0]:'');});
    if(resource==='inquiries') initial.products=(record?.items||[]).map((item:any)=>({product_id:item.product_id,quantity:item.quantity}));
    if(resource==='inquiries') initial.attachments=[];
    if(resource==='products') initial.specifications=Object.entries(record?.specifications||{}).map(([key,value])=>({key,value}));
    Object.keys(fields).filter(key=>String(fields[key]).startsWith('file:')||String(fields[key]).startsWith('files:')).forEach(key=>initial[key]=String(fields[key]).startsWith('files:')?[]:null);
    const form = useForm(initial);
    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (record) form.transform((data) => ({ ...data, _method: 'put' })).post('/admin/' + resource + '/' + record.id, { forceFormData: true });
        else form.post('/admin/' + resource, { forceFormData: true });
    };
    return <AdminLayout title={title}><Head title={title}/><form onSubmit={submit} className="max-w-4xl rounded-2xl border border-white/10 bg-white/[.03] p-6 md:p-9">
        <div className="grid gap-5 md:grid-cols-2">{Object.entries(fields).map(([name, type]: any) =>
            type === 'images'
                ? <Gallery key={name} record={record} data={form.data} set={form.setData}/>
                : <Field key={name} name={name} type={type} value={form.data[name]} current={record?.[name]} recordId={record?.id} set={(value: any) => form.setData(name, value)} options={options}/>
        )}</div>
        {Object.keys(form.errors).length > 0 && <p className="mt-5 text-sm text-red-300">{Object.values(form.errors)[0] as string}</p>}
        <button disabled={form.processing} className="mt-7 rounded-xl bg-cyan-300 px-6 py-3 font-bold text-slate-950">{form.processing ? 'Saving…' : 'Save changes'}</button>
    </form></AdminLayout>;
}

function InvoiceForm({title,record}:any){const form=useForm({status:record.status,notes:record.notes||'',terms:record.terms||''});const money=(v:any)=>`${record.currency} ${Number(v||0).toFixed(2)}`;return <AdminLayout title={title}><Head title={title}/><div className="space-y-6"><section className="grid gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-6 md:grid-cols-4"><div><small className="text-slate-500">Invoice</small><strong className="block">{record.number}</strong></div><div><small className="text-slate-500">Customer</small><strong className="block">{record.customer_name}</strong><span>{record.customer_email}</span></div><div><small className="text-slate-500">Due</small><strong className="block">{String(record.due_date).slice(0,10)}</strong></div><div><small className="text-slate-500">Status</small><strong className="block uppercase text-cyan-300">{record.status}</strong></div></section><section className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-sm"><thead><tr><th className="p-4 text-left">Description</th><th>Qty</th><th>Unit</th><th>Tax</th><th className="p-4 text-right">Total</th></tr></thead><tbody>{record.items.map((x:any)=><tr key={x.id} className="border-t border-white/5"><td className="p-4">{x.description}</td><td>{x.quantity}</td><td>{money(x.unit_price)}</td><td>{x.tax_rate}%</td><td className="p-4 text-right">{money(x.total)}</td></tr>)}</tbody></table><div className="ml-auto max-w-sm space-y-2 p-6 text-right"><p>Subtotal: {money(record.subtotal)}</p><p>Tax: {money(record.tax)}</p><p className="text-xl font-bold">Total: {money(record.total)}</p><p>Paid: {money(record.paid_amount)}</p><p>Balance: {money(Math.max(0,Number(record.total)-Number(record.paid_amount)))}</p></div></section><section className="rounded-2xl border border-white/10 bg-white/[.03] p-6"><h2 className="mb-4 font-bold">Payment history</h2>{record.payments.length?<div className="space-y-2">{record.payments.map((p:any)=><div key={p.id} className="grid gap-2 rounded-lg bg-white/[.03] p-3 sm:grid-cols-4"><span>{String(p.paid_at).slice(0,10)}</span><span>{money(p.amount)}</span><span>{p.method}</span><span>{p.reversed_at?'Reversed':p.reference||'Posted'}</span></div>)}</div>:<p className="text-slate-500">No payments recorded.</p>}</section><form onSubmit={e=>{e.preventDefault();form.transform(data=>({...data,_method:'put'})).post(`/admin/invoices/${record.id}`)}} className="grid gap-5 rounded-2xl border border-white/10 bg-white/[.03] p-6 md:grid-cols-2"><Field name="notes" type="textarea" value={form.data.notes} set={(v:any)=>form.setData('notes',v)} options={{}}/><Field name="terms" type="textarea" value={form.data.terms} set={(v:any)=>form.setData('terms',v)} options={{}}/><button className="rounded-xl bg-cyan-300 px-6 py-3 font-bold text-slate-950 md:col-span-2">Save notes and terms</button></form></div></AdminLayout>}
function PaymentDetails({title,record}:any){return <AdminLayout title={title}><Head title={title}/><section className="max-w-3xl rounded-2xl border border-white/10 bg-white/[.03] p-7"><dl className="grid gap-6 sm:grid-cols-2">{[['Invoice',record.invoice?.number],['Amount',`${record.invoice?.currency||''} ${Number(record.amount).toFixed(2)}`],['Paid date',String(record.paid_at).slice(0,10)],['Method',record.method],['Reference',record.reference||'—'],['Status',record.reversed_at?'Reversed':'Posted'],['Notes',record.notes||'—'],['Reversal reason',record.reversal_reason||'—']].map(([k,v])=><div key={k}><dt className="text-xs uppercase tracking-wider text-slate-500">{k}</dt><dd className="mt-1 font-semibold">{v}</dd></div>)}</dl><p className="mt-7 text-sm text-slate-500">Posted payments are immutable. Use the controlled reversal action from the payments list to correct an entry.</p></section></AdminLayout>}

function QuotationForm({title,record,products}:any){
    const form=useForm({customer_name:record.customer_name||'',customer_company:record.customer_company||'',customer_email:record.customer_email||'',customer_phone:record.customer_phone||'',expires_at:String(record.expires_at||'').slice(0,10),discount:record.discount||0,notes:record.notes||'',terms:record.terms||'',items:(record.items||[]).map((x:any)=>({product_id:x.product_id,description:x.description,quantity:x.quantity,unit_price:x.unit_price,tax_rate:x.tax_rate||0}))});
    const setItem=(index:number,key:string,value:any)=>form.setData('items',form.data.items.map((item:any,i:number)=>i===index?{...item,[key]:value}:item));
    const total=form.data.items.reduce((sum:number,item:any)=>sum+Number(item.quantity||0)*Number(item.unit_price||0)*(1+Number(item.tax_rate||0)/100),0)-Number(form.data.discount||0);
    return <AdminLayout title={title}><Head title={title}/><form onSubmit={(e)=>{e.preventDefault();form.put(`/admin/quotations/${record.id}/details`)}} className="space-y-6 rounded-2xl border border-white/10 bg-white/[.03] p-6 md:p-9">
        {record.status!=='draft'&&<p className="rounded-xl bg-amber-400/10 p-4 text-amber-200">Issued quotations are read-only. Create a revision to change commercial terms.</p>}
        <div className="grid gap-5 md:grid-cols-2">{[['customer_name','text'],['customer_company','text'],['customer_email','email'],['customer_phone','text'],['expires_at','date'],['discount','number']].map(([name,type])=><Field key={name} name={name} type={type} value={(form.data as any)[name]} set={(v:any)=>form.setData(name as any,v)} options={{}}/>)}<Field name="notes" type="textarea" value={form.data.notes} set={(v:any)=>form.setData('notes',v)} options={{}}/><Field name="terms" type="textarea" value={form.data.terms} set={(v:any)=>form.setData('terms',v)} options={{}}/></div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th>Catalog product</th><th>Description</th><th>Qty</th><th>Unit price</th><th>Tax %</th><th></th></tr></thead><tbody>{form.data.items.map((item:any,index:number)=><tr key={index}><td className="p-1"><select className="form-input" value={item.product_id||''} onChange={e=>{const product=products.find((p:any)=>String(p.id)===e.target.value);form.setData('items',form.data.items.map((row:any,i:number)=>i===index?{...row,product_id:e.target.value||null,description:product?.name||row.description}:row))}}><option value="">Custom line</option>{products.map((p:any)=><option key={p.id} value={p.id}>{p.name}{p.sku?` (${p.sku})`:''}</option>)}</select></td>{['description','quantity','unit_price','tax_rate'].map(key=><td key={key} className="p-1"><input className="form-input" type={key==='description'?'text':'number'} step={key==='description'?undefined:'0.01'} value={item[key]??''} onChange={e=>setItem(index,key,e.target.value)}/></td>)}<td><button type="button" onClick={()=>form.setData('items',form.data.items.filter((_:any,i:number)=>i!==index))} className="text-red-300">Remove</button></td></tr>)}</tbody></table></div>
        <div className="flex flex-wrap items-center justify-between gap-4"><button type="button" onClick={()=>form.setData('items',[...form.data.items,{product_id:null,description:'',quantity:1,unit_price:0,tax_rate:0}])} className="rounded-xl border border-white/10 px-4 py-2">Add line</button><strong>Estimated total: {record.currency} {Math.max(total,0).toFixed(2)}</strong></div>
        {Object.keys(form.errors).length>0&&<p role="alert" className="text-red-300">{Object.values(form.errors)[0] as string}</p>}<button disabled={form.processing||record.status!=='draft'} className="rounded-xl bg-cyan-300 px-6 py-3 font-bold text-slate-950">Save and recalculate</button>
    </form></AdminLayout>
}

function Field({ name, type, value, current, recordId, set, options }: any) {
    const [base, detail] = type.split(':');
    const choices = detail?.split(',') || [];
    const related = base === 'relation' ? options[detail] || [] : [];
    return <label className={['textarea','product-lines','specifications','images','files'].includes(base) ? 'md:col-span-2' : ''}><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">{name.replaceAll('_', ' ')}</span>
        {base === 'product-lines' ? <ProductLines value={value||[]} set={set} products={options.products||[]}/>
        : base === 'specifications' ? <Specifications value={value||[]} set={set}/>
        : base === 'file' ? <FileField kind={detail} current={current} set={set}/>
        : base === 'files' ? <FilesField kind={detail} current={current} recordId={recordId} set={set}/>
        : base === 'textarea' ? <textarea className="form-input min-h-28" value={value || ''} onChange={(e) => set(e.target.value)}/>
        : base === 'relation' ? <select className="form-input" value={value || ''} onChange={(e) => set(e.target.value)}><option value="">None</option>{related.map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        : base === 'select' ? <select className="form-input" value={value || ''} onChange={(e) => set(e.target.value)}>{choices.map((item: string) => <option key={item} value={item}>{item}</option>)}</select>
        : base === 'boolean' ? <input type="checkbox" checked={!!value} onChange={(e) => set(e.target.checked)} className="h-6 w-6 accent-cyan-300"/>
        : <input className="form-input" type={base} value={value || ''} onChange={(e) => set(e.target.value)}/>}
    </label>;
}

function Specifications({value,set}:any){const update=(i:number,key:string,next:string)=>set(value.map((row:any,index:number)=>index===i?{...row,[key]:next}:row));return <div className="space-y-2">{value.map((row:any,index:number)=><div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><input className="form-input" placeholder="Specification" value={row.key} onChange={e=>update(index,'key',e.target.value)}/><input className="form-input" placeholder="Value" value={row.value} onChange={e=>update(index,'value',e.target.value)}/><button type="button" className="text-red-300" onClick={()=>set(value.filter((_:any,i:number)=>i!==index))}>Remove</button></div>)}<button type="button" onClick={()=>set([...value,{key:'',value:''}])} className="rounded-lg border border-cyan-300/30 px-4 py-2 text-cyan-200">Add specification</button></div>}
function FileField({kind,current,set}:any){const accept=kind==='pdf'?'application/pdf':'image/jpeg,image/png,image/webp,image/svg+xml';return <div><input type="file" accept={accept} onChange={e=>set(e.target.files?.[0]||null)}/>{typeof current==='string'&&current&&<a className="mt-2 block text-cyan-300" href={current} target="_blank" rel="noreferrer">View current file</a>}<p className="mt-2 text-xs text-slate-500">{kind==='pdf'?'PDF, up to 20 MB.':'JPG, PNG, WebP or SVG, up to 5 MB.'}</p></div>}
function FilesField({set,current,recordId}:any){return <div>{Array.isArray(current)&&current.length>0&&<div className="mb-3 space-y-1">{current.map((_:string,index:number)=><a key={index} className="block text-cyan-300" href={`/admin/inquiries/${recordId}/attachments/${index}`}>Download attachment {index+1}</a>)}</div>}<input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" onChange={e=>set(Array.from(e.target.files||[]))}/><p className="mt-2 text-xs text-slate-500">Up to 10 private attachments, 20 MB each.</p></div>}

function ProductLines({value,set,products}:any){
    const add=()=>set([...value,{product_id:'',quantity:1}]);
    const update=(index:number,key:string,next:any)=>set(value.map((row:any,i:number)=>i===index?{...row,[key]:next}:row));
    return <div className="space-y-3"><div className="space-y-2">{value.map((row:any,index:number)=><div key={index} className="grid gap-2 sm:grid-cols-[1fr_120px_auto]"><select required className="form-input" value={row.product_id||''} onChange={e=>update(index,'product_id',e.target.value)}><option value="">Select product</option>{products.map((product:any)=><option disabled={value.some((x:any,i:number)=>i!==index&&String(x.product_id)===String(product.id))} key={product.id} value={product.id}>{product.name}{product.sku?` (${product.sku})`:''}</option>)}</select><input required aria-label="Quantity" className="form-input" type="number" min="0.01" max="100000" step="0.01" value={row.quantity} onChange={e=>update(index,'quantity',e.target.value)}/><button type="button" onClick={()=>set(value.filter((_:any,i:number)=>i!==index))} className="rounded-lg border border-red-400/20 px-3 text-red-300">Remove</button></div>)}</div><button type="button" onClick={add} className="rounded-lg border border-cyan-300/30 px-4 py-2 text-cyan-200">Attach product</button><p className="text-xs text-slate-500">Attach multiple catalog products and specify the requested quantity for each.</p></div>
}

function Gallery({ record, data, set }: any) {
    const images: string[] = record?.images || [];
    const uploads: File[] = data.new_images || [];
    const [previews, setPreviews] = useState<string[]>([]);
    useEffect(() => { const next=uploads.map((file)=>URL.createObjectURL(file));setPreviews(next);return()=>next.forEach(URL.revokeObjectURL); }, [uploads]);
    const toggleRemove = (index: number) => {
        const current: number[] = data.remove_images || [];
        set('remove_images', current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
    };
    return <fieldset className="md:col-span-2"><legend className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Image gallery</legend>
        {images.length > 0 && <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{images.map((image, index) => <div key={image + index} className="overflow-hidden rounded-xl border border-white/10 bg-[#080d17]">
            <img src={image} alt="" className="aspect-[4/3] w-full object-cover"/>
            <div className="flex items-center justify-between gap-3 p-3 text-xs">
                <label className="flex items-center gap-2"><input type="radio" name="thumbnail" checked={Number(data.thumbnail_index) === index} onChange={() => set('thumbnail_index', index)}/> Thumbnail</label>
                <label className="flex items-center gap-2 text-red-300"><input type="checkbox" checked={(data.remove_images || []).includes(index)} onChange={() => toggleRemove(index)}/> Remove</label>
            </div>
        </div>)}</div>}
        {previews.length > 0 && <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{previews.map((image,index)=><div key={image} className="overflow-hidden rounded-xl border border-cyan-300/20 bg-[#080d17]"><img src={image} alt={`New upload ${index+1}`} className="aspect-[4/3] w-full object-cover"/><label className="flex items-center gap-2 p-3 text-xs"><input type="radio" name="thumbnail" checked={Number(data.thumbnail_index)===images.length+index} onChange={()=>set('thumbnail_index',images.length+index)}/> Use as default image</label></div>)}</div>}
        <label className="block rounded-xl border border-dashed border-cyan-300/30 p-5"><span className="mb-2 block font-semibold text-cyan-200">Add images</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => {const files=Array.from(e.target.files || []);set('new_images',files);if(images.length===0&&files.length)set('thumbnail_index',0)}}/><span className="mt-2 block text-xs text-slate-500">JPG, PNG or WebP. Up to 12 files, 5 MB each. Preview and select the default catalog image before saving.</span></label>
    </fieldset>;
}
