"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Loader2, Download } from "lucide-react";
import { toast } from "../hooks/use-toast";

type ImportResultItem = {
  projectName: string;
  reason?: string;
};

type ImportResult = {
  inserted: ImportResultItem[];
  skipped: ImportResultItem[];
};

type ImportPortfolioProps = {
  disabled?: boolean;
  onImported?: () => void;
};

function parseCsvRow(row: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = parseCsvRow(lines[0]).map((h) => h.trim());
  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvRow(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (values[idx] ?? "").trim();
    });
    rows.push(obj);
  }
  return rows;
}

function toIsoDate(value?: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ImportPortfolio({
  disabled,
  onImported,
}: ImportPortfolioProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const isDisabled = useMemo(
    () => disabled || isImporting,
    [disabled, isImporting]
  );

  const handleClick = () => {
    if (!isDisabled) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      // Fetch existing project names to avoid duplicate POSTs that cause 400
      const existingRes = await fetch("/api/portfolio", { cache: "no-store" });
      const existingData: Array<{ projectName?: string }> = existingRes.ok
        ? await existingRes.json()
        : [];
      const existingNames = new Set(
        (existingData || [])
          .map((p) => (p.projectName || "").trim().toLowerCase())
          .filter(Boolean)
      );
      const seenInFile = new Set<string>();
      const normalizedAll = rows
        .map((project) => ({
          projectName: (project["Project Name"] || "").trim(),
          technology: (project["Technology"] || "").trim(),
          category: (project["Category"] || "").trim(),
          industry: (project["Industry"] || "").trim(),
          description: (project["Description"] || "").trim(),
          pageBuilder: (project["Page Builder"] || "").trim(),
          clientName: (project["Client Name"] || "").trim(),
          websiteLink: (project["Website Link"] || "").trim(),
          bidPlatform: (project["Bid Platform"] || "").trim(),
          bidPlatformUrl: (project["Bid Platform URL"] || "").trim(),
          invoiceAmount: project["Invoice Amount"] || "",
          startDate: toIsoDate(project["Start Date"]),
          completionDate: toIsoDate(project["Completion Date"]),
          testimonials: (project["Testimonials"] || "").trim(),
          tag: (project["Tag"] || "").trim(),
        }))
        .filter((p) => p.projectName && p.technology);

      const duplicates: ImportResultItem[] = [];
      const normalized: typeof normalizedAll = [];
      for (const p of normalizedAll) {
        const key = p.projectName.trim().toLowerCase();
        if (!key) continue;
        if (existingNames.has(key) || seenInFile.has(key)) {
          duplicates.push({
            projectName: p.projectName,
            reason: "Already exists",
          });
        } else {
          seenInFile.add(key);
          normalized.push(p);
        }
      }

      if (normalized.length === 0) {
        toast({
          title: "Import",
          description: "No valid projects found in CSV.",
        });
        return;
      }

      const inserted: ImportResultItem[] = [];
      const skipped: ImportResultItem[] = [...duplicates];

      for (const p of normalized) {
        try {
          const formData = new FormData();
          formData.append("projectName", p.projectName);
          formData.append("websiteLink", p.websiteLink);
          formData.append("technology", p.technology);
          formData.append("category", p.category);
          formData.append("industry", p.industry);
          formData.append("description", p.description);
          formData.append("pageBuilder", p.pageBuilder);
          formData.append("clientName", p.clientName);
          formData.append("bidPlatform", p.bidPlatform);
          formData.append("bidPlatformUrl", p.bidPlatformUrl);
          if (p.invoiceAmount !== "")
            formData.append("invoiceAmount", String(p.invoiceAmount));
          if (p.startDate) formData.append("startDate", p.startDate);
          if (p.completionDate)
            formData.append("completionDate", p.completionDate);
          formData.append("testimonials", p.testimonials);
          const tagsArray = p.tag
            ? p.tag
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [];
          formData.append("tags", JSON.stringify(tagsArray));

          const res = await fetch("/api/portfolio", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            const reasonText = await res.text();
            const reason = reasonText || "Failed";
            skipped.push({ projectName: p.projectName, reason });
            if (/same name/i.test(reason)) {
              toast({
                title: "Duplicate project",
                description: `${p.projectName} already exists`,
              });
            }
          } else {
            inserted.push({ projectName: p.projectName });
          }
        } catch (err) {
          skipped.push({ projectName: p.projectName, reason: "Network error" });
        }
      }

      setResult({ inserted, skipped });
      setDialogOpen(true);
      const duplicateCount = duplicates.length;
      if (duplicateCount > 0) {
        const sample = duplicates
          .slice(0, 3)
          .map((d) => d.projectName)
          .join(", ");
        const more =
          duplicateCount > 3 ? ` and ${duplicateCount - 3} more` : "";
        toast({
          title: "Duplicates skipped",
          description: `${duplicateCount} project(s) with same name: ${sample}${more}`,
        });
      } else {
        toast({
          title: "Import completed",
          description: `${inserted.length} inserted, ${skipped.length} skipped`,
        });
      }
      onImported?.();
    } catch (err) {
      toast({ title: "Import failed", description: "Unable to read CSV file" });
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <Button
        onClick={handleClick}
        disabled={isDisabled}
        variant="secondary"
        className="bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 hover:shadow-md transition-all duration-150"
      >
        {isImporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {isImporting ? "Importing..." : "Import"}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Results</DialogTitle>
            <DialogDescription>
              {result
                ? `${result.inserted.length} inserted, ${result.skipped.length} skipped`
                : "No results"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-64 overflow-auto">
            {result?.skipped?.length ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">Skipped items</p>
                <ul className="list-disc ml-5 space-y-1">
                  {result.skipped.map((s, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      <span className="font-medium">{s.projectName}</span>{" "}
                      <span className="text-gray-500">
                        - {s.reason || "Already exists"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
