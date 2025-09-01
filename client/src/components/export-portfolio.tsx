"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export type ExportPortfolioItem = {
  _id: string;
  projectName: string;
  description: string;
  websiteLink: string;
  technology: string[];
  category: string;
  industry: string;
  pageBuilder: string;
  clientName: string;
  clientInvoices: string[];
  bidPlatform: string;
  bidPlatformUrl: string;
  invoiceAmount: number;
  startDate: string;
  completionDate: string;
  testimonials: string;
  tag: string[];
};

type ExportPortfolioProps = {
  items: ExportPortfolioItem[];
  allItems?: ExportPortfolioItem[];
  disabled?: boolean;
};

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }
  return stringValue;
}

function formatDateForCsv(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function ExportPortfolio({
  items,
  allItems,
  disabled,
}: ExportPortfolioProps) {
  const hasData = (items?.length ?? 0) > 0 || (allItems?.length ?? 0) > 0;

  const csvContent = useMemo(() => {
    const rows: string[][] = [];
    const headers = [
      "Project Name",
      "Technology",
      "Category",
      "Industry",
      "Description",
      "Page Builder",
      "Client Name",
      "Website Link",
      "Bid Platform",
      "Bid Platform URL",
      "Invoice Amount",
      "Start Date",
      "Completion Date",
      "Testimonials",
      "Tag",
      "Client Invoices",
    ];
    rows.push(headers);

    const source = items && items.length > 0 ? items : allItems ?? [];

    for (const p of source) {
      rows.push([
        p.projectName || "",
        Array.isArray(p.technology)
          ? p.technology.join(", ")
          : String(p.technology ?? ""),
        p.category || "",
        p.industry || "",
        p.description || "",
        p.pageBuilder || "",
        p.clientName || "",
        p.websiteLink || "",
        p.bidPlatform || "",
        p.bidPlatformUrl || "",
        p.invoiceAmount != null ? String(p.invoiceAmount) : "",
        formatDateForCsv(p.startDate),
        formatDateForCsv(p.completionDate),
        p.testimonials || "",
        Array.isArray(p.tag) ? p.tag.join(", ") : String(p.tag ?? ""),
        Array.isArray(p.clientInvoices)
          ? p.clientInvoices.join(" | ")
          : String(p.clientInvoices ?? ""),
      ]);
    }

    const lines = rows.map((r) => r.map(toCsvValue).join(","));
    return lines.join("\n");
  }, [items, allItems]);

  const handleDownload = () => {
    const content = csvContent;
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const now = new Date();
    const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;
    link.href = url;
    link.download = `projects_export_${ts}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || !hasData}
      variant="secondary"
      className="bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 hover:shadow-md transition-all duration-150"
    >
      <Upload className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}
