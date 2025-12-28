"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface ResizableCellProps {
  columnId: string;
  width: number;
  minWidth: number;
  maxWidth: number;
  onResize: (columnId: string, width: number) => void;
  isHeader?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const ResizableCell: React.FC<ResizableCellProps> = ({
  columnId,
  width,
  minWidth,
  maxWidth,
  onResize,
  isHeader = false,
  className = "",
  children,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(width);

  useEffect(() => {
    if (!isResizing) {
      startWidthRef.current = width;
    }
  }, [width, isResizing]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidthRef.current + diff)
      );
      onResize(columnId, newWidth);
    },
    [isResizing, minWidth, maxWidth, columnId, onResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const CellTag = isHeader ? "th" : "td";

  return (
    <CellTag
      style={{
        width: `${width}px`,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
      }}
      className={`${className} relative`}
    >
      {children}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary bg-transparent z-10 transition-colors"
        onMouseDown={handleMouseDown}
        style={{ marginRight: "-2px" }}
        title="Drag to resize"
      />
    </CellTag>
  );
};
