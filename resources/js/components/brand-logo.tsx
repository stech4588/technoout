import { Link } from '@inertiajs/react';

export default function BrandLogo({ compact = false }: { compact?: boolean }) {
    return (
        <Link href="/" aria-label="ViaTech home" className="brand-logo flex items-center gap-3">
            <span className="grid h-11 w-16 shrink-0 place-items-center">
                <img src="/brand/viatech-mark.png" alt="" className="h-auto w-full object-contain" />
            </span>
            {!compact && (
                <span className="brand-wordmark leading-none">
                    <span className="block text-xl font-black tracking-[.08em]">
                        <span className="brand-wordmark-silver">VIA</span>
                        <span className="brand-wordmark-blue">TECH</span>
                    </span>
                    <span className="brand-wordmark-tagline mt-1 block text-[7px] font-bold uppercase tracking-[.28em]">
                        Technical consultants
                    </span>
                </span>
            )}
        </Link>
    );
}
