import Image from 'next/image';

export function AdminLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '2px 0' }}>
      <Image
        src="/asahi/logo-black.svg"
        alt="朝日夫婦"
        width={120}
        height={44}
        style={{ display: 'block' }}
        priority
      />
    </div>
  );
}

export default AdminLogo;
