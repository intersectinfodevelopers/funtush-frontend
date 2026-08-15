import { useId } from 'react';

type ChartWaveProps = {
  color: string;
  gradient: [string, string];
  className?: string;
};

export default function ChartWave({ color, gradient, className }: ChartWaveProps) {
  const id = useId();
  const gradientId = `chart-wave-gradient-${id}`;

  return (
    <svg
      viewBox="0 0 136 73"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto ${className ?? ''}`}
    >
      <path
        d="M15.3138 44.6236C8.51502 46.0611 0.186646 55.8712 0.186646 55.8712V66.5075H135.158V10.7586C135.158 10.7586 130.635 36.486 120.159 39.3666C114.374 40.9575 110.947 37.8992 105.161 36.3102C99.2069 34.6749 96.1959 29.495 90.1673 30.6864C81.4281 32.4134 82.8349 46.4235 75.301 51.959C70.0114 55.8455 66.495 59.4003 60.3042 58.6831C48.4064 57.3049 57.201 24.0008 45.3074 25.4294C36.3736 26.5025 39.011 44.5537 30.3106 47.191C24.5823 48.9274 21.1343 43.393 15.3138 44.6236Z"
        fill={`url(#${gradientId})`}
      />

      <path
        d="M0.186646 55.9691C0.186646 55.9691 8.51502 46.1074 15.3138 44.6054C21.1343 43.3195 24.5823 48.9858 30.3106 47.1714C39.011 44.4155 36.3736 26.665 45.3074 25.5437C57.201 24.0508 48.4064 57.2171 60.3042 58.6573C66.495 59.4067 70.0114 56.0598 75.301 51.9986C82.8349 46.2142 81.4281 32.5395 90.1673 30.7348C96.1959 29.4899 99.2069 34.5876 105.161 36.2964C110.947 37.9569 114.374 41.0747 120.159 39.4123C130.635 36.4022 135.158 10.7586 135.158 10.7586"
        stroke={color}
        strokeWidth="0.489026"
        strokeLinejoin="round"
      />

      <defs>
        <linearGradient
          id={gradientId}
          x1="67.6722"
          y1="10.7586"
          x2="67.6722"
          y2="66.5075"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={gradient[0]} stopOpacity="0.2" />
          <stop offset="1" stopColor={gradient[1]} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
