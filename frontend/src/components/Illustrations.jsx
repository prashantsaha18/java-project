import React from 'react'

/* Thin ink-stroke line art, drawn to match the rest of the app's identity
   (forest green / brass / stamp red on kraft paper) — no stock illustration
   style, no gradient blobs. Used for empty states and section flourishes. */

const stroke = 'var(--ink-soft)'

export function EmptyShelfIllustration({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      {/* a bare shelf with one book leaning, dust motes drifting */}
      <line x1="14" y1="88" x2="106" y2="88" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="88" x2="14" y2="100" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <line x1="106" y1="88" x2="106" y2="100" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <g transform="translate(60 62) rotate(9)">
        <rect x="-10" y="-24" width="20" height="48" rx="1.5" stroke="var(--brass)" strokeWidth="2" />
        <line x1="-5" y1="-24" x2="-5" y2="24" stroke="var(--brass)" strokeWidth="1" opacity="0.5" />
      </g>
      <circle cx="30" cy="40" r="1.6" fill={stroke} opacity="0.5" />
      <circle cx="86" cy="30" r="1.2" fill={stroke} opacity="0.4" />
      <circle cx="94" cy="50" r="1.8" fill={stroke} opacity="0.35" />
    </svg>
  )
}

export function TiedStackIllustration({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      {/* a stack of borrowed books tied with string, for "no borrows yet" */}
      <rect x="24" y="72" width="72" height="10" rx="1.5" stroke={stroke} strokeWidth="2" />
      <rect x="30" y="60" width="60" height="12" rx="1.5" stroke={stroke} strokeWidth="2" />
      <rect x="22" y="46" width="64" height="14" rx="1.5" stroke="var(--brass)" strokeWidth="2" />
      <path d="M60 40 L60 88" stroke="var(--stamp)" strokeWidth="1.6" strokeDasharray="1 0" />
      <path d="M44 40 Q60 30 76 40" stroke="var(--stamp)" strokeWidth="1.6" fill="none" />
      <circle cx="60" cy="36" r="2.2" fill="var(--stamp)" />
    </svg>
  )
}

export function DrawerMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" aria-hidden="true">
      {/* the navbar mark: a card-catalog drawer front with a brass pull */}
      <rect x="3" y="6" width="24" height="19" rx="1.5" stroke="#d9d1bd" strokeWidth="1.6" />
      <rect x="11" y="13" width="8" height="3" rx="1.5" fill="var(--brass-bright)" />
      <line x1="3" y1="11" x2="27" y2="11" stroke="#d9d1bd" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

export function DeskLampIllustration({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {/* a classic brass banker's lamp: weighted base, straight stem, dome shade */}
      <ellipse cx="32" cy="57" rx="13" ry="3" fill={stroke} opacity="0.15" />
      <rect x="26" y="47" width="12" height="9" rx="1.5" fill="var(--brass)" />
      <line x1="32" y1="47" x2="32" y2="27" stroke="var(--brass)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M17 27 Q32 11 47 27 L44 31 Q32 19 20 31 Z" fill="var(--brass)" />
      <ellipse cx="32" cy="27.5" rx="15" ry="2.6" fill="var(--brass-bright)" />
      <path d="M20 33 L11 44" stroke="var(--stamp)" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <path d="M32 34 L32 47" stroke="var(--stamp)" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
      <path d="M44 33 L53 44" stroke="var(--stamp)" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}
