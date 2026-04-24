'use client';

interface StreakElementProps {
  level: number; // 0 to 3
  size?: number; // Total width/height in pixels
}

export default function StreakElement({ level, size = 48 }: StreakElementProps) {
  // Clamp level between 0 and 3
  const activeLevel = Math.max(0, Math.min(3, Math.floor(level)));

  const config = {
    0: {
      ringColor: '#d1d5db',
      bladeColor: '#e5e7eb',
      hubColor: '#9ca3af',
      innerRingColor: '#e5e7eb',
      bgColor: 'transparent',
      animation: 'none',
      glow: 'none',
    },
    1: {
      ringColor: '#fde68a',
      bladeColor: '#fbbf24',
      hubColor: '#f59e0b',
      innerRingColor: '#fef3c7',
      bgColor: 'rgba(251,191,36,0.06)',
      animation: 'fan-slow 0.9s steps(3, end) infinite',
      glow: `0 0 ${size * 0.29}px ${size * 0.04}px rgba(251,191,36,0.25)`,
    },
    2: {
      ringColor: '#fdba74',
      bladeColor: '#f97316',
      hubColor: '#ea580c',
      innerRingColor: '#ffedd5',
      bgColor: 'rgba(249,115,22,0.08)',
      animation: 'fan-medium 0.5s steps(3, end) infinite',
      glow: `0 0 ${size * 0.37}px ${size * 0.08}px rgba(249,115,22,0.35)`,
    },
    3: {
      ringColor: '#fca5a5',
      bladeColor: '#ef4444',
      hubColor: '#dc2626',
      innerRingColor: '#ffe4e6',
      bgColor: 'rgba(239,68,68,0.1)',
      animation: 'fan-fast 0.25s steps(4, end) infinite',
      glow: `0 0 ${size * 0.5}px ${size * 0.12}px rgba(239,68,68,0.4)`,
    },
  }[activeLevel]!;

  // Scaling math based on size
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * (20 / 48); // Original was 20 at 48px
  const innerR = size * (6 / 48);  // Original was 6 at 48px
  const bladeLen = outerR - innerR - (size * (4 / 48)); 

  // Generate 6 blade paths
  const blades = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 * Math.PI) / 180;
    const nextAngle = ((i * 60 + 14) * Math.PI) / 180; 

    const x1 = cx + Math.cos(angle) * (innerR + (size * 0.02));
    const y1 = cy + Math.sin(angle) * (innerR + (size * 0.02));
    const x2 = cx + Math.cos(angle) * (innerR + bladeLen);
    const y2 = cy + Math.sin(angle) * (innerR + bladeLen);
    const x3 = cx + Math.cos(nextAngle) * (innerR + bladeLen * 0.9);
    const y3 = cy + Math.sin(nextAngle) * (innerR + bladeLen * 0.9);
    const x4 = cx + Math.cos(nextAngle) * (innerR + (size * 0.02));
    const y4 = cy + Math.sin(nextAngle) * (innerR + (size * 0.02));

    return `M${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)} L${x3.toFixed(2)},${y3.toFixed(2)} L${x4.toFixed(2)},${y4.toFixed(2)} Z`;
  });

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background fill */}
        <circle cx={cx} cy={cy} r={outerR} fill={config.bgColor} />

        {/* Outer nacelle ring */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={config.ringColor} strokeWidth={size * 0.06} />

        {/* Inner ring */}
        <circle cx={cx} cy={cy} r={innerR + (size * 0.02)} fill="none" stroke={config.innerRingColor} strokeWidth={size * 0.03} />

        {/* Fan blades — rotating group */}
        <g
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            animation: config.animation,
          }}
        >
          {blades.map((d, i) => (
            <path
              key={i}
              d={d}
              fill={config.bladeColor}
              stroke={config.bladeColor}
              strokeWidth={size * 0.05}
              strokeLinejoin="round"
              opacity={0.9}
            />
          ))}
        </g>

        {/* Center hub — static */}
        <circle cx={cx} cy={cy} r={innerR * 0.55} fill={config.hubColor} />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r={size * 0.06} fill="white" opacity={0.5} />
      </svg>

      {/* Glow ring overlay */}
      {activeLevel > 0 && (
        <div
            className="engine-glow"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            boxShadow: config.glow,
            pointerEvents: 'none',
          }}
        />
      )}

      <style jsx global>{`
        @keyframes fan-slow {
          0%   { transform: rotate(0deg);   }
          33%  { transform: rotate(40deg);  }
          66%  { transform: rotate(80deg);  }
          100% { transform: rotate(120deg); }
        }
        @keyframes fan-medium {
          0%   { transform: rotate(0deg);   }
          33%  { transform: rotate(60deg);  }
          66%  { transform: rotate(120deg); }
          100% { transform: rotate(180deg); }
        }
        @keyframes fan-fast {
          0%   { transform: rotate(0deg);   }
          25%  { transform: rotate(90deg);  }
          50%  { transform: rotate(180deg); }
          75%  { transform: rotate(270deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes engine-glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1; transform: scale(1.05); }
        }
        .engine-glow {
          animation: engine-glow-pulse 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}