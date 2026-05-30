type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({ className = "", style }: Props) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-[#EAE6D8] ${className}`}
      style={style}
    />
  );
}
