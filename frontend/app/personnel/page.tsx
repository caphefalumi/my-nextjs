"use client";

import { useState, useMemo } from "react";
import { CyberpunkLayout } from "@/components/layout/cyberpunk-layout";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, AlertTriangle, MapPin, Mail, Building } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PersonnelPage() {
  const { 
    employees, 
    searchQuery, 
    setSearchQuery, 
    filterDepartment, 
    setFilterDepartment,
    filterBurnoutRisk,
    setFilterBurnoutRisk,
    getFilteredEmployees, 
    getDepartments 
  } = useStore();

  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredEmployees = getFilteredEmployees();
  const departments = getDepartments();

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      const getValue = (emp: typeof a, field: string): string | number => {
        switch (field) {
          case "name": return emp.name;
          case "department": return emp.department;
          case "role": return emp.role;
          case "location": return emp.location;
          case "impactScore": return emp.impactScore;
          case "burnoutRisk": return emp.burnoutRisk;
          default: return emp.name;
        }
      };
      
      let aVal = getValue(a, sortField);
      let bVal = getValue(b, sortField);
      
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredEmployees, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getBurnoutColor = (risk: number) => {
    if (risk >= 70) return "text-red-400 bg-red-500/10";
    if (risk >= 40) return "text-yellow-400 bg-yellow-500/10";
    return "text-teal-400 bg-teal-500/10";
  };

  const getImpactColor = (score: number) => {
    if (score >= 80) return "text-purple-400";
    if (score >= 60) return "text-teal-400";
    return "text-gray-400";
  };

  return (
    <CyberpunkLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Personnel Directory</h1>
          <p className="text-gray-400 mt-1">Manage and view all employees</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-xl",
                "bg-gray-900/90 border border-white/10",
                "text-white placeholder:text-gray-500",
                "focus:outline-none focus:border-purple-500/50",
                "transition-colors"
              )}
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className={cn(
                "appearance-none px-4 py-3 pr-10 rounded-xl",
                "bg-gray-900/90 border border-white/10",
                "text-white",
                "focus:outline-none focus:border-purple-500/50",
                "transition-colors cursor-pointer"
              )}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Burnout Risk Filter */}
          <div className="relative">
            <select
              value={filterBurnoutRisk}
              onChange={(e) => setFilterBurnoutRisk(e.target.value)}
              className={cn(
                "appearance-none px-4 py-3 pr-10 rounded-xl",
                "bg-gray-900/90 border border-white/10",
                "text-white",
                "focus:outline-none focus:border-purple-500/50",
                "transition-colors cursor-pointer"
              )}
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk (70%+)</option>
              <option value="medium">Medium Risk (40-69%)</option>
              <option value="low">Low Risk (&lt;40%)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing {sortedEmployees.length} of {employees.length} employees
          </p>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-gray-900/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  {[
                    { key: "name", label: "Employee" },
                    { key: "department", label: "Department" },
                    { key: "role", label: "Role" },
                    { key: "location", label: "Location" },
                    { key: "impactScore", label: "Impact" },
                    { key: "burnoutRisk", label: "Burnout Risk" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={cn(
                        "px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider",
                        "cursor-pointer hover:text-white transition-colors"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {col.label}
                        {sortField === col.key && (
                          <ChevronDown className={cn(
                            "w-4 h-4 transition-transform",
                            sortDirection === "desc" && "rotate-180"
                          )} />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedEmployees.map((employee, index) => (
                  <motion.tr
                    key={employee.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          "bg-gradient-to-br from-purple-500/20 to-teal-500/20",
                          "text-white font-medium text-sm"
                        )}>
                          {employee.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-white font-medium">{employee.name}</p>
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-300">{employee.department}</span>
                      </div>
                      <p className="text-gray-500 text-sm">{employee.team}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{employee.role}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-400">
                        <MapPin className="w-4 h-4" />
                        {employee.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("font-semibold", getImpactColor(employee.impactScore))}>
                        {employee.impactScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm",
                        getBurnoutColor(employee.burnoutRisk)
                      )}>
                        {employee.burnoutRisk >= 70 && <AlertTriangle className="w-3 h-3" />}
                        {employee.burnoutRisk}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/personnel/${employee.id}`}>
                        <button className={cn(
                          "px-4 py-2 rounded-lg text-sm",
                          "bg-purple-500/20 text-purple-300",
                          "hover:bg-purple-500/30 transition-colors"
                        )}>
                          View Profile
                        </button>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedEmployees.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">No employees found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </CyberpunkLayout>
  );
}
