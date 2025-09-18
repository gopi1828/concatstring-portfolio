import { useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Loader2,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import api from "../lib/api";

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
  const shouldOpenDialogRef = useRef(false);

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

      if (rows.length === 0) {
        setResult({ inserted: [], skipped: [] });
        shouldOpenDialogRef.current = true;
        setDialogOpen(true);
        return;
      }

      const headers = Object.keys(rows[0] || {});

      const headerMap: Record<string, string> = {};
      const possibleHeaders = {
        "Project Name": [
          "project name",
          "projectname",
          "project_name",
          "title",
          "name",
        ],
        Technology: ["technology", "tech", "technologies", "stack"],
        Category: ["category", "categories", "type"],
        Industry: ["industry", "sector", "domain"],
        Description: ["description", "desc", "details", "summary"],
        "Page Builder": [
          "page builder",
          "pagebuilder",
          "page_builder",
          "builder",
        ],
        "Client Name": ["client name", "clientname", "client_name", "client"],
        "Website Link": [
          "website link",
          "websitelink",
          "website_link",
          "url",
          "website",
          "link",
        ],
        "Bid Platform": [
          "bid platform",
          "bidplatform",
          "bid_platform",
          "platform",
        ],
        "Bid Platform URL": [
          "bid platform url",
          "bidplatformurl",
          "bid_platform_url",
          "platform url",
        ],
        "Invoice Amount": [
          "invoice amount",
          "invoiceamount",
          "invoice_amount",
          "amount",
          "price",
          "cost",
        ],
        "Start Date": [
          "start date",
          "startdate",
          "start_date",
          "started",
          "begin date",
        ],
        "Completion Date": [
          "completion date",
          "completiondate",
          "completion_date",
          "end date",
          "finished",
        ],
        Testimonials: ["testimonials", "testimonial", "feedback", "review"],
        Tag: ["tag", "tags", "keywords", "labels"],
      };

      for (const [standardName, variations] of Object.entries(
        possibleHeaders
      )) {
        for (const header of headers) {
          if (
            variations.some(
              (variation) =>
                header.toLowerCase().trim() === variation.toLowerCase()
            )
          ) {
            headerMap[header] = standardName;
            break;
          }
        }
      }

      const hasProjectName = Object.values(headerMap).includes("Project Name");
      const hasTechnology = Object.values(headerMap).includes("Technology");

      if (!hasProjectName || !hasTechnology) {
        const missing = [];
        if (!hasProjectName) missing.push("Project Name");
        if (!hasTechnology) missing.push("Technology");

        setResult({
          inserted: [],
          skipped: [
            {
              projectName: "CSV Validation Error",
              reason: `Missing required columns: ${missing.join(
                ", "
              )}. Found columns: ${headers.join(", ")}`,
            },
          ],
        });
        shouldOpenDialogRef.current = true;
        setDialogOpen(true);
        return;
      }

      const existingRes = await api.get("/api/portfolios");
      const existingData: Array<{ projectName?: string }> =
        existingRes.data || [];
      const existingNames = new Set(
        (existingData || [])
          .map((p) => (p.projectName || "").trim().toLowerCase())
          .filter(Boolean)
      );
      const seenInFile = new Set<string>();
      const normalizedAll = rows
        .map((project) => {
          const getValue = (standardName: string) => {
            const originalHeader = Object.keys(headerMap).find(
              (h) => headerMap[h] === standardName
            );
            return originalHeader ? (project[originalHeader] || "").trim() : "";
          };

          const normalized = {
            projectName: getValue("Project Name"),
            technology: getValue("Technology"),
            category: getValue("Category"),
            industry: getValue("Industry"),
            description: getValue("Description"),
            pageBuilder: getValue("Page Builder"),
            clientName: getValue("Client Name"),
            websiteLink: getValue("Website Link"),
            bidPlatform: getValue("Bid Platform"),
            bidPlatformUrl: getValue("Bid Platform URL"),
            invoiceAmount: getValue("Invoice Amount"),
            startDate: toIsoDate(getValue("Start Date")),
            completionDate: toIsoDate(getValue("Completion Date")),
            testimonials: getValue("Testimonials"),
            tag: getValue("Tag"),
          };

          return normalized;
        })
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

      const inserted: ImportResultItem[] = [];
      const skipped: ImportResultItem[] = [...duplicates];

      if (normalized.length === 0) {
        setResult({ inserted, skipped });
        shouldOpenDialogRef.current = true;
        setDialogOpen(true);
        return;
      }

      for (const p of normalized) {
        try {
          if (!p.projectName.trim()) {
            skipped.push({
              projectName: p.projectName || "Unknown",
              reason: "Missing project name",
            });
            continue;
          }

          if (!p.technology.trim()) {
            skipped.push({
              projectName: p.projectName,
              reason: "Missing technology",
            });
            continue;
          }

          const tagsArray = p.tag
            ? p.tag
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [];

          const portfolioData = {
            projectName: p.projectName,
            websiteLink: p.websiteLink,
            technology: p.technology,
            category: p.category,
            industry: p.industry,
            description: p.description,
            pageBuilder: p.pageBuilder,
            clientName: p.clientName,
            bidPlatform: p.bidPlatform,
            bidPlatformUrl: p.bidPlatformUrl,
            invoiceAmount:
              p.invoiceAmount !== "" ? parseFloat(p.invoiceAmount) : undefined,
            startDate: p.startDate || undefined,
            completionDate: p.completionDate || undefined,
            testimonials: p.testimonials,
            tag: tagsArray,
          };

          await api.post("/api/portfolios", portfolioData);
          inserted.push({ projectName: p.projectName });
        } catch (err: any) {
          let reason = "Failed to create project";

          if (err.response?.status === 400) {
            reason = "Invalid data format";
          } else if (err.response?.status === 409) {
            reason = "Project already exists";
          } else if (err.response?.status === 422) {
            reason = "Validation error";
          } else if (err.response?.data?.message) {
            reason = err.response.data.message;
          } else if (err.message) {
            reason = err.message;
          }

          skipped.push({ projectName: p.projectName, reason });
          console.error(`Failed to import project ${p.projectName}:`, err);
        }
      }

      setResult({ inserted, skipped });
      shouldOpenDialogRef.current = true;

      setDialogOpen(true);
    } catch (err: any) {
      console.error("Import failed:", err);
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            shouldOpenDialogRef.current = false;

            onImported?.();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Import Results
            </DialogTitle>
            <DialogDescription>
              {result
                ? `Import completed with ${result.inserted.length} successful and ${result.skipped.length} skipped projects.`
                : "No results available"}
            </DialogDescription>
          </DialogHeader>

          {result && (
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-medium text-gray-900">
                Import Summary
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>
                    Success:{" "}
                    <strong className="text-green-600">
                      {result.inserted.length}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span>
                    Skipped:{" "}
                    <strong className="text-yellow-600">
                      {result.skipped.length}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>
                    Total:{" "}
                    <strong>
                      {result.inserted.length + result.skipped.length}
                    </strong>
                  </span>
                </div>
              </div>
              {result.inserted.length > 0 && (
                <div className="text-sm text-green-700 bg-green-50 p-2 rounded mt-3">
                  ✓ Your portfolio has been updated with{" "}
                  {result.inserted.length} new project
                  {result.inserted.length !== 1 ? "s" : ""}.
                </div>
              )}
            </div>
          )}

          <div className="space-y-6 max-h-96 overflow-auto">
            {/* Successfully Imported */}
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h4 className="text-base font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Successfully Imported ({result?.inserted?.length || 0})
              </h4>
              {result?.inserted && result.inserted.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {result.inserted.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm bg-white p-2 rounded border border-green-100"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-800 font-medium">
                        {item.projectName}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No projects were successfully imported.
                </p>
              )}
            </div>

            {/* Skipped Items */}
            <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <h4 className="text-base font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Skipped Projects ({result?.skipped?.length || 0})
              </h4>
              {result?.skipped && result.skipped.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {result.skipped.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded border border-yellow-100"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 mt-1"></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 text-sm">
                            {item.projectName}
                          </div>
                          <div className="text-xs text-yellow-700 mt-1">
                            {item.reason || "Already exists"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No projects were skipped.
                </p>
              )}
            </div>

            {/* Empty state */}
            {result &&
              result.inserted.length === 0 &&
              result.skipped.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>
                    No projects were processed. Please check your CSV file and
                    try again.
                  </p>
                </div>
              )}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              onClick={() => setDialogOpen(false)}
              className="min-w-[100px]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
