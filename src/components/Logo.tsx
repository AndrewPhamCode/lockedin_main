"use client";

export default function Logo() {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Stylized lock badge */}
      <div className="relative">
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle border */}
          <circle
            cx="28"
            cy="28"
            r="26"
            stroke="#6b1a1a"
            strokeWidth="2"
            fill="white"
          />
          
          {/* Inner accent circle */}
          <circle
            cx="28"
            cy="28"
            r="22"
            fill="#6b1a1a"
            opacity="0.05"
          />
          
          {/* Lock shackle */}
          <path
            d="M22 26V22C22 18.6863 24.6863 16 28 16C31.3137 16 34 18.6863 34 22V26"
            stroke="#6b1a1a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Lock body */}
          <rect
            x="20"
            y="26"
            width="16"
            height="12"
            rx="2"
            fill="#6b1a1a"
          />
          
          {/* Checkmark in lock */}
          <path
            d="M24 32L26.5 34.5L32 29"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {/* Text logo with modern styling */}
      <div className="flex items-baseline gap-1">
        <span 
          className="text-neutral-900" 
          style={{ 
            fontSize: '42px', 
            letterSpacing: '-0.03em',
            fontWeight: '600'
          }}
        >
          Locked
        </span>
        <span 
          style={{ 
            fontSize: '42px', 
            letterSpacing: '-0.03em',
            color: '#6b1a1a',
            fontWeight: '700'
          }}
        >
          In
        </span>
      </div>
    </div>
  );
}
