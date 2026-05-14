import { Facebook, Instagram, Phone } from 'lucide-react';
import { BrandMark } from './BrandMark';

const DARK = '#16364f';

type FooterProps = {
  facebookUrl?:  string | null
  instagramUrl?: string | null
  phone?:        string | null
  copyright?:    string | null
}

export function Footer({ facebookUrl, instagramUrl, phone, copyright }: FooterProps = {}) {
  const year = new Date().getFullYear();

  const fb = facebookUrl  ?? 'https://www.facebook.com/asahihuuhu';
  const ig = instagramUrl ?? 'https://www.instagram.com/asahihuuhu';

  return (
    <footer>
      <div className="bg-paper-50 leading-[0]">
        <svg
          viewBox="0 0 1440 64"
          className="w-full block"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,32 C360,64 720,0 1080,32 C1260,48 1380,16 1440,32 L1440,64 L0,64 Z"
            fill={DARK}
          />
        </svg>
      </div>

      <div style={{ background: DARK }} className="text-white/70">
        <div className="container-content py-10 flex flex-col items-center gap-6">
          <BrandMark variant="white" className="h-10 opacity-80" />

          <div className="flex items-center gap-6 text-white/45">
            {fb && (
              <a
                href={fb}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="transition-all duration-200 hover:text-white/90 hover:scale-110"
              >
                <Facebook size={18} />
              </a>
            )}
            {ig && (
              <a
                href={ig}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="transition-all duration-200 hover:text-white/90 hover:scale-110"
              >
                <Instagram size={18} />
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                aria-label="電話"
                className="flex items-center gap-1.5 text-sm font-sans font-light tracking-wide transition-colors duration-200 hover:text-white/90"
              >
                <Phone size={14} />
                {phone}
              </a>
            )}
          </div>

          <p className="font-sans font-light text-[11px] tracking-[0.22em] text-white/25">
            ©{year}&nbsp;{copyright ?? 'ASAHI HUUHU. All Rights Reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
