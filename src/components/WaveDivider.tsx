import clsx from 'clsx';

export function WaveDivider({
  flip = false,
  fill = '#FBF8F3',
  className,
}: {
  flip?: boolean;
  fill?: string;
  className?: string;
}) {
  return (
    <div
      className={clsx('w-full leading-[0]', flip && 'rotate-180', className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="block w-full h-12 md:h-16"
      >
        <path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
