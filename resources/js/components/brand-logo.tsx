import { Link } from '@inertiajs/react';

export default function BrandLogo({ compact = false }: { compact?: boolean }) {
    return (
        <Link href="/" className="flex items-center gap-3">
            <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/40 bg-cyan-400/10">
                <span className="absolute h-6 w-5 rounded-t-[10px] border-2 border-cyan-300 border-b-0" />
                <span className="absolute bottom-2 h-0.5 w-6 bg-cyan-300" />
            </span>
            {!compact && (
                <span className="text-xl font-extrabold tracking-[.16em] text-white">
                    TECHNO<span className="text-cyan-300">OUT</span>
                </span>
            )}
        </Link>
    );
}
