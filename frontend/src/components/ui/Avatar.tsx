import React, { useState, useEffect } from 'react';

export function getInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return '?';
  const cleanName = name.trim();
  if (!cleanName) return '?';
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0].substring(0, 1).toUpperCase();
  }
  const first = parts[0][0] || '';
  const last = parts[parts.length - 1][0] || '';
  return (first + last).toUpperCase();
}

const BG_GRADIENTS = [
  'bg-gradient-to-br from-indigo-500 to-purple-600',
  'bg-gradient-to-br from-blue-500 to-cyan-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-rose-500 to-pink-600',
  'bg-gradient-to-br from-violet-500 to-fuchsia-600',
  'bg-gradient-to-br from-sky-500 to-indigo-600',
  'bg-gradient-to-br from-teal-500 to-emerald-600',
];

export function getAvatarBg(name?: string | null): string {
  if (!name) return BG_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BG_GRADIENTS.length;
  return BG_GRADIENTS[index];
}

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  alt?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  title?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  className = 'w-10 h-10 rounded-full',
  alt,
  onClick,
  title,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const isValidSrc =
    src &&
    typeof src === 'string' &&
    src.trim() !== '' &&
    !src.includes('unsplash.com') &&
    !src.includes('ui-avatars.com');

  const initials = getInitials(name);
  const bgClass = getAvatarBg(name || initials);

  if (!isValidSrc || imgError) {
    const hasTextSize = /\btext-(xs|sm|base|lg|xl|2xl|3xl)\b/.test(className);
    const textSize = hasTextSize
      ? ''
      : className.includes('w-6') || className.includes('w-7') || className.includes('w-8')
      ? 'text-xs'
      : className.includes('w-12') || className.includes('w-14') || className.includes('w-16')
      ? 'text-base'
      : className.includes('w-20') || className.includes('w-24')
      ? 'text-xl'
      : 'text-sm';

    return (
      <div
        onClick={onClick}
        title={title || name || undefined}
        className={`flex items-center justify-center font-bold text-white uppercase select-none shrink-0 ${bgClass} ${textSize} ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name || 'Avatar'}
      title={title || name || undefined}
      onClick={onClick}
      onError={() => setImgError(true)}
      className={`object-cover shrink-0 ${className}`}
    />
  );
};

export default Avatar;
