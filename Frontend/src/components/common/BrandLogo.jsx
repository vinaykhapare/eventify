export default function BrandLogo({ showText = true, size = "md", className = "" }) {
  const sizeMap = {
    sm: { mark: "size-8", text: "text-base", sub: "text-[9px]" },
    md: { mark: "size-9", text: "text-lg", sub: "text-[10px]" },
    lg: { mark: "size-11", text: "text-xl", sub: "text-[11px]" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 
        The Eventify Keystone Brand Mark:
        Two precision interlocking architectural planes forming an iconic 'E' monogram
        and an assembly nexus stage. Minimalist, timeless, human-engineered.
      */}
      <div
        className={`${currentSize.mark} rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-150 group-hover:scale-105`}
        title="Eventify"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-5/6"
        >
          {/* Primary Keystone Frame (Top & Left Spine) */}
          <path
            d="M6 26V8C6 6.89543 6.89543 6 8 6H24C25.1046 6 26 6.89543 26 8V12H12V26H6Z"
            fill="currentColor"
          />
          {/* Stage Core / Nexus Crossbar */}
          <rect
            x="15"
            y="14.5"
            width="11"
            height="3.5"
            rx="1.75"
            fill="currentColor"
          />
          {/* Base Alignment Tier */}
          <path
            d="M15 21H24C25.1046 21 26 21.8954 26 23V26H15V21Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-heading font-extrabold ${currentSize.text} tracking-tight text-slate-900 dark:text-white leading-none`}
          >
            Eventify
          </span>
          <span
            className={`${currentSize.sub} font-medium text-slate-400 dark:text-slate-500 mt-0.5 tracking-tight`}
          >
            Event Management
          </span>
        </div>
      )}
    </div>
  );
}
