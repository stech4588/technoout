import { Box, Cpu, DoorOpen, Factory, Radio, ShieldCheck, TrafficCone } from 'lucide-react';

export default function ProductVisual({product,className=''}:{product:any,className?:string}){
    const category=String(product.category?.name||'').toLowerCase();
    const Icon=category.includes('door')||category.includes('entry')?DoorOpen:category.includes('rfid')||category.includes('access')?Radio:category.includes('security')||category.includes('blocker')||category.includes('detector')?ShieldCheck:category.includes('industrial')||category.includes('loading')?Factory:category.includes('traffic')||category.includes('barrier')?TrafficCone:category.includes('sensor')||category.includes('control')?Cpu:Box;
    return <div className={`relative grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,238,.22),transparent_55%),linear-gradient(135deg,#111b2c,#070b13)] ${className}`}><div className="absolute inset-[12%] rounded-full border border-dashed border-cyan-300/20"/><Icon className="h-20 w-20 text-cyan-300/80" strokeWidth={1}/><span className="absolute bottom-5 max-w-[80%] truncate text-[10px] font-bold uppercase tracking-[.18em] text-cyan-200/70">{product.category?.name||'Technology system'}</span></div>;
}
