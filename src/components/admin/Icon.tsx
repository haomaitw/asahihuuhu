import Image from 'next/image';

export function AdminIcon() {
  return (
    <Image
      src="/asahi/logo-black.svg"
      alt="朝日夫婦"
      width={32}
      height={32}
      style={{ display: 'block', objectFit: 'contain' }}
      priority
    />
  );
}

export default AdminIcon;
