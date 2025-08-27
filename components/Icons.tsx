
import React from 'react';

// Base icon component to reduce boilerplate
function baseIcon(props: { className?: string; title?: string; children: React.ReactNode }) {
  const { className = "", title = "", children } = props;
  return (
    <svg 
      className={className} 
      width="1em" 
      height="1em" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      role="img" 
      aria-hidden={!title} 
      aria-label={title || undefined}
    >
      {children}
    </svg>
  );
}

export function IconCastle(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <path d="M5 8V5h2v2h2V5h2v3l3 2v9H2V10l3-2Z" />
        <path d="M10 14h4" />
      </>
    ),
  });
}
export function IconTrees(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <path d="M7 14l4-7 4 7H7Z" />
        <path d="M11 14v5" />
      </>
    ),
  });
}
export function IconBike(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <circle cx="6" cy="16" r="3" />
        <circle cx="18" cy="16" r="3" />
        <path d="M9 16l3-6h3l-2 3h-3" />
      </>
    ),
  });
}
export function IconFootsteps(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <ellipse cx="8" cy="9" rx="2" ry="3" />
        <circle cx="8" cy="14" r="1" stroke="none" fill="currentColor" />
        <ellipse cx="15.5" cy="13" rx="2" ry="3" />
        <circle cx="15.5" cy="18" r="1" stroke="none" fill="currentColor" />
      </>
    ),
  });
}
export function IconWaves(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <path d="M3 9c2 2 4 2 6 0s4-2 6 0 4 2 6 0" />
        <path d="M3 13c2 2 4 2 6 0s4-2 6 0 4 2 6 0" />
      </>
    ),
  });
}
export function IconHotel(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <rect x="3" y="10" width="18" height="7" rx="1" />
        <path d="M3 10h10a3 3 0 0 1 3 3v4" />
      </>
    ),
  });
}
export function IconTent(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <path d="M3 18l9-12 9 12H3Z" />
        <path d="M12 6v12" />
      </>
    ),
  });
}
export function IconBus(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <rect x="3" y="6" width="18" height="10" rx="2" />
        <circle cx="7" cy="17" r="1.5" stroke="none" fill="currentColor" />
        <circle cx="17" cy="17" r="1.5" stroke="none" fill="currentColor" />
      </>
    ),
  });
}
export function IconSun(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M19.5 4.5l-2 2M4.5 19.5l2-2" />
      </>
    ),
  });
}
export function IconInfo(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v6" />
        <circle cx="12" cy="7" r="1" stroke="none" fill="currentColor" />
      </>
    ),
  });
}
export function IconExternal(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <path d="M14 3h7v7" />
        <path d="M21 3l-10 10" />
        <path d="M21 14v7H3V3h7" />
      </>
    ),
  });
}
export function IconSearch(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="M16.5 16.5L21 21" />
      </>
    ),
  });
}
export function IconMapPin(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <path d="M12 21s7-7 7-11a7 7 0 1 0-14 0c0 4 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  });
}
export function IconPhone(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <path d="M7 3h4l1 4-2 1a14 14 0 0 0 6 6l1-2 4 1v4a2 2 0 0 1-2 2 17 17 0 0 1-16-16 2 2 0 0 1 2-2Z" />
      </>
    ),
  });
}
export function IconMail(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 8l9 6 9-6" />
      </>
    ),
  });
}
export function IconCalendar(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),
  });
}
export function IconClock(props: { className?: string }) {
  return baseIcon({
    ...props,
    children: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  });
}
export function IconSparkles(props: { className?: string }) {
    return baseIcon({
        ...props,
        children: (
            <>
                <path d="M12 3L14.34 8.66L20 11L14.34 13.34L12 19L9.66 13.34L4 11L9.66 8.66L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 20L6.5 16.5L10 15L6.5 13.5L5 10L3.5 13.5L0 15L3.5 16.5L5 20Z" stroke="none" fill="currentColor" />
            </>
        )
    });
}
export function IconMessageCircle(props: { className?: string }) {
    return baseIcon({
        ...props,
        children: (
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        )
    });
}
export function IconX(props: { className?: string }) {
    return baseIcon({
        ...props,
        children: (
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        )
    });
}
export function IconSend(props: { className?: string }) {
    return baseIcon({
        ...props,
        children: (
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
        )
    });
}
export function IconUtensils(props: { className?: string }) {
    return baseIcon({
        ...props,
        children: (
             <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v4c0 1.1.9 2 2 2h3zM21 15v6" />
        )
    });
}
export function IconBot(props: { className?: string }) {
    return baseIcon({
        ...props,
        children: (
            <>
                <rect x="2" y="8" width="20" height="12" rx="2" />
                <path d="M7 8V6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2" />
                <circle cx="8.5" cy="14" r="1.5" stroke="none" fill="currentColor" />
                <circle cx="15.5" cy="14" r="1.5" stroke="none" fill="currentColor" />
            </>
        )
    });
}
export function IconUser(props: { className?: string }) {
    return baseIcon({
        ...props,
        children: (
            <>
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </>
        )
    });
}
export function IconLink(props: { className?: string }) {
    return baseIcon({
        ...props,
        children: (
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        )
    });
}
