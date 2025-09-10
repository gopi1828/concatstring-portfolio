import { useMemo } from "react";
import { Button } from "../components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "react-hot-toast";

export type ExportPortfolioItem = {
  _id: string;
  projectName: string;
  description: string;
  websiteLink: string;
  technology: string;
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
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (/[",\n\r]/.test(stringValue)) {
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

function cleanTextForCsv(text: string, maxLength: number = 100): string {
  if (!text) return "";
  
  // Remove base64 data
  if (text.startsWith('data:image/')) {
    return '[Image Data]';
  }
  
  // Remove excessive whitespace and newlines
  const cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Truncate if too long
  if (cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength - 3) + '...';
  }
  
  return cleaned;
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
      try {
        rows.push([
        cleanTextForCsv(p.projectName || "", 50),
        Array.isArray(p.technology)
          ? p.technology.join(", ")
          : cleanTextForCsv(String(p.technology ?? ""), 30),
        cleanTextForCsv(p.category || "", 30),
        cleanTextForCsv(p.industry || "", 30),
        cleanTextForCsv(p.description || "", 200),
        cleanTextForCsv(p.pageBuilder || "", 20),
        cleanTextForCsv(p.clientName || "", 30),
        cleanTextForCsv(p.websiteLink || "", 50),
        cleanTextForCsv(p.bidPlatform || "", 20),
        cleanTextForCsv(p.bidPlatformUrl || "", 50),
        p.invoiceAmount != null ? String(p.invoiceAmount) : "",
        formatDateForCsv(p.startDate),
        formatDateForCsv(p.completionDate),
        cleanTextForCsv(p.testimonials || "", 150),
        Array.isArray(p.tag) ? p.tag.join(", ") : cleanTextForCsv(String(p.tag ?? ""), 50),
        Array.isArray(p.clientInvoices)
          ? p.clientInvoices
              .filter(url => url && typeof url === 'string')
              .map(url => cleanTextForCsv(url, 50))
              .join(" | ")
          : cleanTextForCsv(String(p.clientInvoices ?? ""), 50),
        ]);
      } catch (error) {
        console.error('Error processing portfolio item:', p, error);
        
        rows.push([
          p.projectName || "ERROR",
          "ERROR",
          "ERROR",
          "ERROR",
          "Error processing this item",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
      }
    }

    const lines = rows.map((r) => r.map(toCsvValue).join(","));
    return lines.join("\n");
  }, [items, allItems]);

  const handleDownload = () => {
    try {
      // Add BOM for proper UTF-8 encoding in Excel
      const BOM = '\uFEFF';
      const content = BOM + csvContent;
      
      const blob = new Blob([content], { 
        type: "text/csv;charset=utf-8;" 
      });
      
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
      link.download = `portfolio_export_${ts}.csv`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      const sourceCount = items && items.length > 0 ? items.length : (allItems?.length ?? 0);
      toast.success(`Successfully exported ${sourceCount} portfolio items`);
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data. Please try again.');
    }
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
