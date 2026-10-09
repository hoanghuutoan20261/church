"use client";

import React from "react";

export interface CrossIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  variant?: "outline" | "solid";
}

/**
 * CrossIcon - Biểu tượng Thập Tự Giá Cơ Đốc chuẩn mực và trang nghiêm.
 * Tỉ lệ Latin Cross thanh khiết, tượng trưng cho Ơn Cứu Rỗi và Tin Nhận Chúa Cứu Thế.
 */
export const CrossIcon: React.FC<CrossIconProps> = ({
  className = "w-4 h-4",
  size,
  variant = "solid",
  ...props
}) => {
  const width = size ?? props.width ?? undefined;
  const height = size ?? props.height ?? undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={variant === "solid" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={variant === "solid" ? "0.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      style={{
        width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
        height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
        ...props.style,
      }}
      {...props}
    >
      {/* Tỉ lệ Thập Tự Giá Latin: thân dọc dài, thanh ngang đặt ở 1/3 phía trên */}
      <path
        d="M10.5 2.5C10.5 1.95 10.95 1.5 11.5 1.5H12.5C13.05 1.5 13.5 1.95 13.5 2.5V6.5H17.5C18.05 6.5 18.5 6.95 18.5 7.5V8.5C18.5 9.05 18.05 9.5 17.5 9.5H13.5V21.5C13.5 22.05 13.05 22.5 12.5 22.5H11.5C10.95 22.5 10.5 22.05 10.5 21.5V9.5H6.5C5.95 9.5 5.5 9.05 5.5 8.5V7.5C5.5 6.95 5.95 6.5 6.5 6.5H10.5V2.5Z"
      />
    </svg>
  );
};

export default CrossIcon;
