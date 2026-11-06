import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">Page not found</h1>
        <p className="lede">That page doesn’t exist.</p>
        <Link href="/" className="link-btn" style={{ alignSelf: 'center' }}>Back to home →</Link>
      </div>
    </div>
  );
}
