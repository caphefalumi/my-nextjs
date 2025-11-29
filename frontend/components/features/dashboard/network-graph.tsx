"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

// Interfaces
export interface Employee {
  // Identity & Role
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: string;
  department: string;
  team: string;
  managerId: string | null;
  joinDate: string;
  location: string;
  // Performance
  impactScore: number;
  burnoutRisk: number;
  // Network
  collaborators: string[];
  avatar?: string;
}

interface NodePosition {
  x: number;
  y: number;
}

interface NetworkGraphProps {
  employees: Employee[];
  onNodeClick?: (employee: Employee) => void;
  className?: string;
}

interface ConnectionLine {
  from: string;
  to: string;
  key: string;
}

// Helpers
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function getNodeGlow(impactScore: number): string {
  if (impactScore >= 80) return "shadow-[0_0_30px_rgba(139,92,246,0.8)]";
  if (impactScore >= 60) return "shadow-[0_0_20px_rgba(139,92,246,0.5)]";
  if (impactScore >= 40) return "shadow-[0_0_15px_rgba(45,212,191,0.5)]";
  return "shadow-[0_0_10px_rgba(100,116,139,0.3)]";
}

function getNodeColor(impactScore: number): string {
  if (impactScore >= 80) return "from-purple-500 to-pink-500";
  if (impactScore >= 60) return "from-purple-400 to-teal-400";
  if (impactScore >= 40) return "from-teal-400 to-cyan-400";
  return "from-slate-400 to-slate-500";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

// Subcomponents
function BackgroundGrid() {
  return (
    <div
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 30px 30px, 30px 30px",
      }}
    />
  );
}

function ConnectionLines({
  connections,
  nodePositions,
  hoveredNode,
}: {
  connections: ConnectionLine[];
  nodePositions: Record<string, NodePosition>;
  hoveredNode: string | null;
}) {
  return (
    <svg className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
          <stop offset="100%" stopColor="rgba(45, 212, 191, 0.6)" />
        </linearGradient>
      </defs>

      {connections.map(({ from, to, key }) => {
        const fromPos = nodePositions[from];
        const toPos = nodePositions[to];
        const isHighlighted = hoveredNode === from || hoveredNode === to;

        return (
          <motion.line
            key={key}
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke={isHighlighted ? "url(#lineGradient)" : "rgba(139, 92, 246, 0.2)"}
            strokeWidth={isHighlighted ? 2 : 1}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        );
      })}
    </svg>
  );
}

function NodeTooltip({ employee }: { employee: Employee }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 -bottom-16",
        "px-3 py-2 rounded-lg",
        "bg-black/80 backdrop-blur-sm",
        "border border-purple-500/30",
        "whitespace-nowrap z-10"
      )}
    >
      <p className="text-white text-sm font-medium">{employee.name}</p>
      <p className="text-purple-300 text-xs">{employee.role}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-teal-400 text-xs">Impact:</span>
        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${employee.impactScore}%` }}
          />
        </div>
        <span className="text-white text-xs">{employee.impactScore}</span>
      </div>
    </motion.div>
  );
}

function Legend() {
  const items = [
    { color: "from-purple-500 to-pink-500", label: "High (80+)" },
    { color: "from-purple-400 to-teal-400", label: "Medium (60-79)" },
    { color: "from-teal-400 to-cyan-400", label: "Growing (40-59)" },
    { color: "from-slate-400 to-slate-500", label: "New (<40)" },
  ];

  return (
    <div className="absolute bottom-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10">
      <p className="text-xs text-gray-400 mb-2">Impact Score Legend</p>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full bg-gradient-to-r", item.color)} />
            <span className="text-xs text-gray-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Component
export function NetworkGraph({ employees, onNodeClick, className }: NetworkGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodePositions = useMemo(() => {
    const positions: Record<string, NodePosition> = {};
    const centerX = 400;
    const centerY = 300;
    const radius = 200;

    employees.forEach((emp, index) => {
      const angle = (2 * Math.PI * index) / employees.length - Math.PI / 2;
      const variance = (seededRandom(index + emp.id.charCodeAt(0)) - 0.5) * 60;
      positions[emp.id] = {
        x: centerX + (radius + variance) * Math.cos(angle),
        y: centerY + (radius + variance) * Math.sin(angle),
      };
    });

    return positions;
  }, [employees]);

  const connections = useMemo(() => {
    const lines: ConnectionLine[] = [];
    const seen = new Set<string>();

    employees.forEach((emp) => {
      emp.collaborators.forEach((collabId) => {
        const key = [emp.id, collabId].sort().join("-");
        if (!seen.has(key) && nodePositions[collabId]) {
          seen.add(key);
          lines.push({ from: emp.id, to: collabId, key });
        }
      });
    });

    return lines;
  }, [employees, nodePositions]);

  const handleNodeHover = (nodeId: string | null) => setHoveredNode(nodeId);
  const handleNodeSelect = (employee: Employee) => onNodeClick?.(employee);

  return (
    <div
      className={cn(
        "relative w-full h-[600px] rounded-2xl overflow-hidden",
        "bg-gray-900/90",
        "border border-white/10",
        className
      )}
    >
      <BackgroundGrid />
      <ConnectionLines
        connections={connections}
        nodePositions={nodePositions}
        hoveredNode={hoveredNode}
      />

      {/* Nodes */}
      {employees.map((employee, index) => {
        const pos = nodePositions[employee.id];
        const isHovered = hoveredNode === employee.id;
        const nodeSize = 40 + (employee.impactScore / 100) * 30;

        return (
          <motion.div
            key={employee.id}
            className="absolute cursor-pointer"
            style={{
              left: pos.x - nodeSize / 2,
              top: pos.y - nodeSize / 2,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
            }}
            whileHover={{ scale: 1.15 }}
            onMouseEnter={() => handleNodeHover(employee.id)}
            onMouseLeave={() => handleNodeHover(null)}
            onClick={() => handleNodeSelect(employee)}
          >
            {/* Pulse Ring - CSS animation instead of framer-motion */}
            {employee.impactScore >= 70 && (
              <div
                className={cn(
                  "absolute inset-0 rounded-full bg-gradient-to-r animate-pulse",
                  getNodeColor(employee.impactScore)
                )}
                style={{ width: nodeSize, height: nodeSize, opacity: 0.3 }}
              />
            )}

            {/* Node Circle */}
            <div
              className={cn(
                "relative rounded-full bg-gradient-to-br",
                getNodeColor(employee.impactScore),
                getNodeGlow(employee.impactScore),
                "border-2 border-white/30",
                "flex items-center justify-center",
                "font-bold text-white text-xs",
                "transition-transform duration-200"
              )}
              style={{ width: nodeSize, height: nodeSize }}
            >
              {getInitials(employee.name)}
            </div>

            {isHovered && <NodeTooltip employee={employee} />}
          </motion.div>
        );
      })}

      <Legend />

      {/* Title */}
      <div className="absolute top-4 left-4">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">
          Galaxy View
        </h2>
        <p className="text-xs text-gray-400">Personnel Network Visualization</p>
      </div>
    </div>
  );
}

export default NetworkGraph;
