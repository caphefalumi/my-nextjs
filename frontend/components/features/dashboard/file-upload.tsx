"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Table,
} from "lucide-react";
import { useCallback, useState, useRef } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

// Interfaces
export interface ParsedData {
  headers: string[];
  rows: Record<string, string | number | boolean | null>[];
  fileName: string;
  fileType: "csv" | "excel";
  totalRows: number;
}

interface FileUploadProps {
  onDataParsed?: (data: ParsedData) => void;
  onError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  className?: string;
}

type UploadStatus = "idle" | "dragging" | "uploading" | "parsing" | "success" | "error";

// Constants
const DEFAULT_ACCEPTED_TYPES = [".csv", ".xlsx", ".xls"];
const DEFAULT_MAX_SIZE_MB = 10;

// Helpers
function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(results.errors[0].message));
          return;
        }
        const headers = results.meta.fields || [];
        resolve({
          headers,
          rows: results.data as Record<string, string | number | boolean | null>[],
          fileName: file.name,
          fileType: "csv",
          totalRows: results.data.length,
        });
      },
      error: (error) => reject(error),
    });
  });
}

function parseExcel(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

        if (jsonData.length === 0) {
          reject(new Error("Empty spreadsheet"));
          return;
        }

        const headers = (jsonData[0] as string[]).map(String);
        const rows = jsonData.slice(1).map((row) => {
          const obj: Record<string, string | number | boolean | null> = {};
          headers.forEach((header, index) => {
            obj[header] = (row as unknown[])[index] as string | number | boolean | null ?? null;
          });
          return obj;
        });

        resolve({
          headers,
          rows,
          fileName: file.name,
          fileType: "excel",
          totalRows: rows.length,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsBinaryString(file);
  });
}

// Subcomponents
function BackgroundGrid() {
  return (
    <div
      className="absolute inset-0 opacity-10 rounded-2xl overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    />
  );
}

function StatusIcon({ status }: { status: UploadStatus }) {
  switch (status) {
    case "uploading":
    case "parsing":
      return <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />;
    case "success":
      return <CheckCircle className="w-12 h-12 text-teal-400" />;
    case "error":
      return <AlertCircle className="w-12 h-12 text-red-400" />;
    default:
      return <Upload className="w-12 h-12 text-purple-400" />;
  }
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mt-4 w-full max-w-xs">
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">{progress}%</p>
    </div>
  );
}

function DataPreview({ data }: { data: ParsedData }) {
  const visibleHeaders = data.headers.slice(0, 6);
  const hasMoreHeaders = data.headers.length > 6;
  const visibleRows = data.rows.slice(0, 5);
  const hasMoreRows = data.totalRows > 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-2xl overflow-hidden",
        "bg-gray-900/95",
        "border border-white/10"
      )}
    >
      {/* Preview Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Table className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-white font-medium">Data Preview</h3>
            <p className="text-xs text-gray-500">
              {data.totalRows} rows, {data.headers.length} columns
            </p>
          </div>
        </div>
        <span
          className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            data.fileType === "csv"
              ? "bg-teal-500/20 text-teal-400"
              : "bg-purple-500/20 text-purple-400"
          )}
        >
          {data.fileType.toUpperCase()}
        </span>
      </div>

      {/* Table Preview */}
      <div className="overflow-x-auto max-h-80">
        <table className="w-full text-sm">
          <thead className="bg-white/5 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                #
              </th>
              {visibleHeaders.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
              {hasMoreHeaders && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                  +{data.headers.length - 6} more
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {visibleRows.map((row, index) => (
              <tr key={index} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                {visibleHeaders.map((header) => (
                  <td key={header} className="px-4 py-3 text-gray-300">
                    {row[header] !== null && row[header] !== undefined
                      ? String(row[header]).slice(0, 30)
                      : "-"}
                  </td>
                ))}
                {hasMoreHeaders && <td className="px-4 py-3 text-gray-500">...</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMoreRows && (
        <div className="px-6 py-3 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">Showing 5 of {data.totalRows} rows</p>
        </div>
      )}
    </motion.div>
  );
}

// Main Component
export function FileUpload({
  onDataParsed,
  onError,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  className,
}: FileUploadProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStatus("idle");
    setFileName(null);
    setErrorMessage(null);
    setParsedData(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFile = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setStatus("uploading");
      setProgress(10);

      try {
        const extension = file.name.split(".").pop()?.toLowerCase();
        const maxSize = maxSizeMB * 1024 * 1024;

        if (file.size > maxSize) {
          throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
        }

        const isValidType = acceptedTypes.some((type) =>
          file.name.toLowerCase().endsWith(type.replace(".", ""))
        );
        if (!isValidType) {
          throw new Error(`Invalid file type. Accepted: ${acceptedTypes.join(", ")}`);
        }

        setStatus("parsing");
        setProgress(30);

        let data: ParsedData;
        if (extension === "csv") {
          data = await parseCSV(file);
        } else if (extension === "xlsx" || extension === "xls") {
          data = await parseExcel(file);
        } else {
          throw new Error("Unsupported file format");
        }

        setProgress(100);
        setParsedData(data);
        setStatus("success");
        onDataParsed?.(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to parse file";
        setErrorMessage(message);
        setStatus("error");
        onError?.(message);
      }
    },
    [onDataParsed, onError, maxSizeMB, acceptedTypes]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setStatus("idle");
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setStatus("dragging");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setStatus("idle");
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleZoneClick = () => {
    if (status === "idle") fileInputRef.current?.click();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetState();
  };

  const getStatusText = (): string => {
    switch (status) {
      case "dragging":
        return "Drop file here";
      case "uploading":
        return "Uploading...";
      case "parsing":
        return "Parsing data...";
      case "success":
        return "File processed successfully";
      case "error":
        return errorMessage || "Error processing file";
      default:
        return "Drag & drop your file here";
    }
  };

  const isProcessing = status === "uploading" || status === "parsing";
  const isComplete = status === "success" || status === "error";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone */}
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleZoneClick}
        className={cn(
          "relative p-8 rounded-2xl cursor-pointer",
          "border-2 border-dashed transition-colors duration-200",
          "bg-gray-900/90",
          status === "dragging" && "border-purple-500 bg-purple-500/10",
          status === "success" && "border-teal-500/50 bg-teal-500/5",
          status === "error" && "border-red-500/50 bg-red-500/5",
          status === "idle" && "border-white/20 hover:border-purple-500/50 hover:bg-white/5",
          isProcessing && "border-purple-500/50 pointer-events-none"
        )}

      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleInputChange}
          className="hidden"
        />

        <BackgroundGrid />

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            animate={{
              y: status === "dragging" ? -10 : 0,
              scale: status === "dragging" ? 1.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <StatusIcon status={status} />
          </motion.div>

          <p className="mt-4 text-lg font-medium text-white">{getStatusText()}</p>

          {status === "idle" && (
            <p className="mt-2 text-sm text-gray-400">
              or{" "}
              <span className="text-purple-400 hover:text-purple-300 transition-colors">
                browse files
              </span>
            </p>
          )}

          {fileName && status !== "idle" && (
            <div className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <FileSpreadsheet className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">{fileName}</span>
              {isComplete && (
                <button
                  onClick={handleRemoveFile}
                  className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          )}

          {isProcessing && <ProgressBar progress={progress} />}

          {status === "idle" && (
            <div className="mt-6 flex items-center gap-4 text-xs text-gray-500">
              <span>Supported: CSV, XLSX, XLS</span>
              <span>Max: {maxSizeMB}MB</span>
            </div>
          )}
        </div>

        {status === "dragging" && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)",
              backgroundSize: "200% 100%",
            }}
          />
        )}
      </motion.div>

      {/* Data Preview */}
      <AnimatePresence>
        {parsedData && status === "success" && <DataPreview data={parsedData} />}
      </AnimatePresence>
    </div>
  );
}

export default FileUpload;
