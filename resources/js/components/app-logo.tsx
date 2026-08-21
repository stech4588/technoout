import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex h-9 w-12 items-center justify-center">
                <AppLogoIcon className="h-auto w-full" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-bold tracking-wide">ViaTech</span>
                <span className="text-muted-foreground truncate text-[10px] leading-none">Control center</span>
            </div>
        </>
    );
}
