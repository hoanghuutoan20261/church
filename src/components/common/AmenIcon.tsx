"use client";

import React from "react";

export interface AmenIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  filled?: boolean;
  showRays?: boolean;
}

/**
 * AmenIcon - Biểu tượng Hiệp Nguyện & Amen tôn nghiêm cho nền tảng Hội Thánh Tin Lành.
 * Thay thế cho emoji 🙏 thông thường bằng biểu tượng đôi bàn tay cầu nguyện với tia sáng ân sủng thiên thượng (Holy Radiance).
 */
export const AmenIcon: React.FC<AmenIconProps> = ({
  className = "w-4 h-4",
  size,
  filled = false,
  showRays = true,
  ...props
}) => {
  const width = size ?? props.width ?? undefined;
  const height = size ?? props.height ?? undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -70 640 582"
      fill="none"
      aria-hidden="true"
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      style={{
        width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
        height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
        ...props.style,
      }}
      {...props}
    >
      <defs>
        {/* Dải màu vàng kim hoàng gia (Sacred Liturgical Gold) */}
        <linearGradient id="amenLiturgicalGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#E5B94E" />
          <stop offset="85%" stopColor="#C5A059" />
          <stop offset="100%" stopColor="#8A641A" />
        </linearGradient>

        {/* Hiệu ứng hào quang phát quang nhẹ khi được kích hoạt */}
        <filter id="amenHolyGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#C5A059" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Tia sáng ân sủng thiên thượng (Holy Radiance Rays trên đỉnh đôi bàn tay hiệp nguyện) */}
      {showRays && (
        <g
          stroke={filled ? "url(#amenLiturgicalGold)" : "currentColor"}
          strokeWidth="18"
          strokeLinecap="round"
          className={filled ? "opacity-95" : "opacity-60"}
        >
          {/* Tia chính giữa thẳng đứng hướng trời */}
          <line x1="320" y1="-50" x2="320" y2="-20" />
          {/* Hai tia góc 45 độ */}
          <line x1="270" y1="-40" x2="288" y2="-16" />
          <line x1="370" y1="-40" x2="352" y2="-16" />
          {/* Hai tia góc rộng mở tỏa ân sủng */}
          <line x1="225" y1="-20" x2="250" y2="-5" />
          <line x1="415" y1="-20" x2="390" y2="-5" />
        </g>
      )}

      {/* Đôi bàn tay hiệp nguyện chắp lại trang nghiêm */}
      <path
        fill={filled ? "url(#amenLiturgicalGold)" : "currentColor"}
        filter={filled ? "url(#amenHolyGlow)" : undefined}
        d="M351.2 4.8c3.2-2 6.6-3.3 10-4.1c4.7-1 9.6-.9 14.1 .1c7.7 1.8 14.8 6.5 19.4 13.6L514.6 194.2c8.8 13.1 13.4 28.6 13.4 44.4l0 73.5c0 6.9 4.4 13 10.9 15.2l79.2 26.4C631.2 358 640 370.2 640 384l0 96c0 9.9-4.6 19.3-12.5 25.4s-18.1 8.1-27.7 5.5L431 465.9c-56-14.9-95-65.7-95-123.7L336 224c0-17.7 14.3-32 32-32s32 14.3 32 32l0 80c0 8.8 7.2 16 16 16s16-7.2 16-16l0-84.9c0-7-1.8-13.8-5.3-19.8L340.3 48.1c-1.7-3-2.9-6.1-3.6-9.3c-1-4.7-1-9.6 .1-14.1c1.9-8 6.8-15.2 14.3-19.9zm-62.4 0c7.5 4.6 12.4 11.9 14.3 19.9c1.1 4.6 1.2 9.4 .1 14.1c-.7 3.2-1.9 6.3-3.6 9.3L213.3 199.3c-3.5 6-5.3 12.9-5.3 19.8l0 84.9c0 8.8 7.2 16 16 16s16-7.2 16-16l0-80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 118.2c0 58-39 108.7-95 123.7l-168.7 45c-9.6 2.6-19.9 .5-27.7-5.5S0 490 0 480l0-96c0-13.8 8.8-26 21.9-30.4l79.2-26.4c6.5-2.2 10.9-8.3 10.9-15.2l0-73.5c0-15.8 4.7-31.2 13.4-44.4L245.2 14.5c4.6-7.1 11.7-11.8 19.4-13.6c4.6-1.1 9.4-1.2 14.1-.1c3.5 .8 6.9 2.1 10 4.1z"
      />
    </svg>
  );
};

export default AmenIcon;
