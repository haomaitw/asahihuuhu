import Image from 'next/image';
import clsx from 'clsx';

export function BrandMark({
  className,
  variant = 'black',
}: {
  className?: string;
  variant?: 'black' | 'white';
}) {
  const src = variant === 'white' ? '/asahi/logo-white.svg' : '/asahi/logo-black.svg';
  return (
    <Image
      src={src}
      alt="ASAHI HUUHU 朝日夫婦"
      width={200}
      height={80}
      priority
      className={clsx('w-auto select-none', className)}
    />
  );
}
