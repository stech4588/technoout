import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function Form({ resource, title, fields, record, options = {} }: any) {
    const initial: any = { new_images: [], remove_images: [], thumbnail_index: record?.thumbnail_index ?? 0 };
    Object.keys(fields).filter((key) => fields[key] !== 'images').forEach((key) => initial[key] = record?.[key] ?? (fields[key] === 'boolean' ? false : ''));
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
                : <Field key={name} name={name} type={type} value={form.data[name]} set={(value: any) => form.setData(name, value)} options={options}/>
        )}</div>
        {Object.keys(form.errors).length > 0 && <p className="mt-5 text-sm text-red-300">{Object.values(form.errors)[0] as string}</p>}
        <button disabled={form.processing} className="mt-7 rounded-xl bg-cyan-300 px-6 py-3 font-bold text-slate-950">{form.processing ? 'Saving&' : 'Save changes'}</button>
    </form></AdminLayout>;
}

function Field({ name, type, value, set, options }: any) {
    const [base, detail] = type.split(':');
    const choices = detail?.split(',') || [];
    const related = base === 'relation' ? options[detail] || [] : [];
    return <label className={base === 'textarea' ? 'md:col-span-2' : ''}><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">{name.replaceAll('_', ' ')}</span>
        {base === 'textarea' ? <textarea className="form-input min-h-28" value={value || ''} onChange={(e) => set(e.target.value)}/>
        : base === 'relation' ? <select className="form-input" value={value || ''} onChange={(e) => set(e.target.value)}><option value="">No {name === 'parent_id' ? 'parent' : 'category'}</option>{related.map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        : base === 'select' ? <select className="form-input" value={value || ''} onChange={(e) => set(e.target.value)}>{choices.map((item: string) => <option key={item} value={item}>{item}</option>)}</select>
        : base === 'boolean' ? <input type="checkbox" checked={!!value} onChange={(e) => set(e.target.checked)} className="h-6 w-6 accent-cyan-300"/>
        : <input className="form-input" type={base} value={value || ''} onChange={(e) => set(e.target.value)}/>}
    </label>;
}

function Gallery({ record, data, set }: any) {
    const images: string[] = record?.images || [];
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
        <label className="block rounded-xl border border-dashed border-cyan-300/30 p-5"><span className="mb-2 block font-semibold text-cyan-200">Add images</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => set('new_images', Array.from(e.target.files || []))}/><span className="mt-2 block text-xs text-slate-500">JPG, PNG or WebP. Up to 12 files, 5 MB each. Save, then choose any uploaded image as the thumbnail.</span></label>
    </fieldset>;
}
