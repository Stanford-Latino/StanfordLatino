import { ImageIcon } from './Icons';

export default function Placeholder({ label, ratio = '4 / 3' }: { label?: string; ratio?: string }) {
  return (
    <div className="ph" style={{ width: '100%', aspectRatio: ratio }}>
      <ImageIcon />
      {label && <span>{label}</span>}
    </div>
  );
}
