import { useEffect, useState } from 'react';

export function SafeImage({
  alt,
  className = '',
  decoding = 'async',
  fallbackClassName = '',
  fallbackLabel = 'Preview',
  fetchPriority = 'auto',
  loading = 'lazy',
  src,
}) {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError) {
    return (
      <div
        aria-label={alt}
        className={`grid place-items-center bg-white/50 text-center ${fallbackClassName || className}`}
        role="img"
      >
        <span className="font-heading text-lg tracking-[-0.03em] text-slate-600">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className={className}
      decoding={decoding}
      fetchPriority={fetchPriority}
      loading={loading}
      onError={() => setHasError(true)}
      src={src}
    />
  );
}
