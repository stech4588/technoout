import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src="/brand/viatech-mark.png" alt="" className={`object-contain ${className}`} {...props} />;
}
