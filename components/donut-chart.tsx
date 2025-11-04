"use client";

import type React from "react";
import { useState } from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface ChartData {
  label: string;
  value: number;
  color: string;
  hoverColor: string;
  icon: React.ReactNode;
}

export function DonutChart() {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const totalBalance = 8000;
  const completedProjects = 3;

  const data: ChartData[] = [
    {
      label: "In progress",
      value: 40,
      color: "#0E3CFF",
      hoverColor: "#2E5AFF",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: "Canceled",
      value: 50,
      color: "#273186",
      hoverColor: "#3A4196",
      icon: <XCircle className="w-4 h-4" />,
    },
    {
      label: "Done",
      value: 10,
      color: "#2E96FF",
      hoverColor: "#4EA6FF",
      icon: <CheckCircle className="w-4 h-4" />,
    },
  ];

  return (
    <div
      className="p-6 sm:p-6 lg:p-8 text-white relative h-full flex items-center justify-center lg:min-h-[336px]"
      style={{
        borderRadius: "30px",
        background: "rgba(22, 19, 44, 0.6)",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-sm rounded-[30px] -z-10" />

      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-4 lg:gap-16 relative z-10">
        {/* Simple Donut Chart */}
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
            {/* Individual segments for hover effects */}
            <div
              className="relative w-full h-full"
              style={{ isolation: "isolate" }}
            >
              {/* In progress segment (40%) */}
              <div
                className={`absolute inset-0 rounded-full cursor-pointer transition-all duration-300 ease-out ${
                  hoveredSegment === 0
                    ? "scale-110 translate-x-1 translate-y-1"
                    : "scale-100 translate-x-0 translate-y-0"
                }`}
                style={{
                  background: `conic-gradient(
                    #0E3CFF 0deg 144deg,
                    transparent 144deg 360deg
                  )`,
                  mask: "radial-gradient(circle at center, transparent 60px, black 60px)",
                  WebkitMask:
                    "radial-gradient(circle at center, transparent 60px, black 60px)",
                  transformOrigin: "center",
                  zIndex: hoveredSegment === 0 ? 10 : 1,
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                  perspective: "1000px",
                }}
                onMouseEnter={() => setHoveredSegment(0)}
                onMouseLeave={() => setHoveredSegment(null)}
              ></div>

              {/* Canceled segment (50%) */}
              <div
                className={`absolute inset-0 rounded-full cursor-pointer transition-all duration-300 ease-out ${
                  hoveredSegment === 1
                    ? "scale-110 -translate-x-1 translate-y-1"
                    : "scale-100 translate-x-0 translate-y-0"
                }`}
                style={{
                  background: `conic-gradient(
                    transparent 0deg 144deg,
                    #273186 144deg 324deg,
                    transparent 324deg 360deg
                  )`,
                  mask: "radial-gradient(circle at center, transparent 60px, black 60px)",
                  WebkitMask:
                    "radial-gradient(circle at center, transparent 60px, black 60px)",
                  transformOrigin: "center",
                  zIndex: hoveredSegment === 1 ? 10 : 1,
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                  perspective: "1000px",
                }}
                onMouseEnter={() => setHoveredSegment(1)}
                onMouseLeave={() => setHoveredSegment(null)}
              ></div>

              {/* Done segment (10%) */}
              <div
                className={`absolute inset-0 rounded-full cursor-pointer transition-all duration-300 ease-out ${
                  hoveredSegment === 2
                    ? "scale-110 -translate-x-1 -translate-y-1"
                    : "scale-100 translate-x-0 translate-y-0"
                }`}
                style={{
                  background: `conic-gradient(
                    transparent 0deg 324deg,
                    #2E96FF 324deg 360deg
                  )`,
                  mask: "radial-gradient(circle at center, transparent 60px, black 60px)",
                  WebkitMask:
                    "radial-gradient(circle at center, transparent 60px, black 60px)",
                  transformOrigin: "center",
                  zIndex: hoveredSegment === 2 ? 10 : 1,
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                  perspective: "1000px",
                }}
                onMouseEnter={() => setHoveredSegment(2)}
                onMouseLeave={() => setHoveredSegment(null)}
              ></div>
            </div>
          </div>

          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {hoveredSegment !== null ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-white/80">
                    {data[hoveredSegment].icon}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {data[hoveredSegment].value}%
                  </div>
                  <div className="text-sm text-white/60">
                    {data[hoveredSegment].label}
                  </div>
                </div>
              ) : (
                <div className="text-4xl font-bold text-white">40%</div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Graphs section with legend */}
        <div className="hidden lg:flex flex-col w-full max-w-sm justify-between min-h-[192px] bg-[#16132C] rounded-3xl px-8 py-6">
            {/* Total balance section */}
          <div className="flex justify-between mb-4">
              <div className="w-8/12 text-2xl font-bold">Total balance</div>
              <div className="w-4/12 text-2xl font-bold text-white">
                ${totalBalance.toLocaleString("en-US")}
              </div>
            </div>

            {/* Vertical legend */}
            <div className="space-y-4 w-full">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="flex w-full items-center justify-between min-w-[200px]"
                >
                  <div className="w-8/12 flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-white/80 text-sm">{item.label}</span>
                  </div>
                  <span className="w-4/12 text-white font-semibold text-sm text-left">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        {/* Mobile: Total balance, projects, and legend */}
        <div className="flex flex-col gap-4 w-full lg:hidden">
          <div className="flex flex-col gap-3 w-full bg-[#16132C] rounded-2xl px-6 py-4">
            <div className="text-lg font-bold">Total balance</div>
            <div className="text-xl font-bold text-white">
              ${totalBalance.toLocaleString("en-US")}
            </div>
          </div>

          <div className="w-full bg-[#16132C] flex items-center justify-center space-x-2 relative z-10 rounded-full px-6 py-3">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-white/80 text-base">
              {completedProjects} projects
            </span>
          </div>

          {/* Mobile Legend */}
          <div className="flex flex-col gap-3 w-full bg-[#16132C] rounded-2xl px-6 py-4">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white/80 text-sm">{item.label}</span>
                </div>
                <span className="text-white font-semibold text-sm">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
