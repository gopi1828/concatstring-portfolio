import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "../components/ui/pagination";
import { AddPortfolioModal } from "../components/add-portfolio-modal";
import EditPortfolioModal from "../components/edit-portfolio-modal";
import {
  Search,
  Plus,
  Grid3X3,
  List,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "./ui/confirm-delete";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

import ExportPortfolio from "../components/export-portfolio";
import ImportPortfolio from "../components/import-portfolio";
import { Skeleton } from "./ui/skeleton";
import api from "../lib/api";
import { toast } from "react-hot-toast";

type PortfolioItem = {
  _id: string;
  projectName: string;
  description: string;
  websiteLink: string;
  technology: string;
  category: string;
  industry: string;
  pageBuilder: string;
  clientName: string;
  salesPerson: string;
  clientInvoices: string[];
  bidPlatform: string;
  bidPlatformUrl: string;
  invoiceAmount: number;
  startDate: string;
  completionDate: string;
  testimonials: string;
  tag: string[];
  createdAt?: string;
};

const TableSkeleton = ({ showSelectColumn = false }: { showSelectColumn?: boolean }) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
          {showSelectColumn && <TableHead className="w-8">Select</TableHead>}
          <TableHead className="w-20">Thumbnail</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-20">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(6)].map((_, i) => (
          <TableRow key={i}>
            {showSelectColumn && (
              <TableCell>
                <Skeleton className="w-3 h-3 rounded" />
              </TableCell>
            )}
            <TableCell>
              <Skeleton className="w-12 h-12 rounded-lg" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-48" />
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="border-0 shadow-md bg-white">
        <Skeleton className="w-full h-48 rounded-t-lg" />
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">(() => {
    const savedViewMode = localStorage.getItem("adminPortfolioViewMode");
    return (savedViewMode as "table" | "grid") || "table";
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToDeleteName, setItemToDeleteName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState<boolean>(false);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const itemsPerPage = 10;

  const decodeJwtPayload = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/portfolios", {
        headers: {
          "Cache-Control": "no-store",
        },
      });

      const data = response.data;

      const portfolios = Array.isArray(data) ? data : data.result || [];
      setPortfolioItems(portfolios);
    } catch (error) {
      toast.error("Failed to fetch portfolios");
      setPortfolioItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    let detectedRole: string | null = null;

    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwtPayload(token);

      const roleFromToken = (payload?.role ??
        (Array.isArray(payload?.roles) ? payload.roles[0] : null)) as
        | string
        | null;
      if (typeof roleFromToken === "string") {
        detectedRole = roleFromToken;
      }
    }

    if (!detectedRole) {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log("user", user);

          const roleFromUser = (user?.role ??
            (Array.isArray(user?.roles) ? user.roles[0] : null)) as
            | string
            | null;
          if (typeof roleFromUser === "string") {
            detectedRole = roleFromUser;
          }
        } catch {
          detectedRole = null;
        }
      }
    }

    setUserRole(detectedRole ? detectedRole.toUpperCase() : null);
    const hasUserData = !!localStorage.getItem("user");
    setIsLoggedIn(!!token || hasUserData);
  }, []);

  const isAdmin = (userRole ?? "").toUpperCase() === "ADMIN";

  const handlePortfolioAdded = () => {
    fetchPortfolios();
  };

  const handleDelete = async (id: string, projectName: string) => {
    setItemToDelete(id);
    setItemToDeleteName(projectName);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await api.delete(`/api/portfolios/${itemToDelete}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = response.data;

      if (result?.success === false) {
        throw new Error(result.error || "Delete operation failed");
      }

      setPortfolioItems((prev) =>
        prev.filter((item) => item._id !== itemToDelete)
      );
      toast.success("Portfolio deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete portfolio");
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      setItemToDeleteName(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
    setItemToDeleteName(null);
  };

  const handleSelectionModeToggle = (checked: boolean) => {
    setIsSelectionMode(checked);
    if (!checked) {
      
      setSelectedItems(new Set());
      setIsSelectAll(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedItems.map(item => item._id));
      setSelectedItems(allIds);
      setIsSelectAll(true);
    } else {
      setSelectedItems(new Set());
      setIsSelectAll(false);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    if (checked) {
      newSelectedItems.add(itemId);
    } else {
      newSelectedItems.delete(itemId);
    }
    setSelectedItems(newSelectedItems);
    setIsSelectAll(newSelectedItems.size === paginatedItems.length);
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    try {
      const deletePromises = Array.from(selectedItems).map(id =>
        api.delete(`/api/portfolios/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

      await Promise.all(deletePromises);

      setPortfolioItems((prev) =>
        prev.filter((item) => !selectedItems.has(item._id))
      );
      
      setSelectedItems(new Set());
      setIsSelectAll(false);
      setBulkDeleteConfirmOpen(false);
      
      toast.success(`${selectedItems.size} portfolio item(s) deleted successfully!`);
    } catch (error) {
      toast.error("Failed to delete selected portfolio items");
    }
  };

  const cancelBulkDelete = () => {
    setBulkDeleteConfirmOpen(false);
  };

  
  useEffect(() => {
    setSelectedItems(new Set());
    setIsSelectAll(false);
  }, [currentPage, searchTerm]);

  
  useEffect(() => {
    if (selectedItems.size === 0 && isSelectionMode) {
      setIsSelectAll(false);
    }
  }, [selectedItems.size, isSelectionMode]);

  const handleViewModeChange = (mode: "table" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("adminPortfolioViewMode", mode);
  };

  const filteredItems = portfolioItems.filter((item) => {
    const projectName = item.projectName?.toLowerCase() || "";
    const websiteLink = item.websiteLink?.toLowerCase() || "";
    const clientName = item.clientName?.toLowerCase() || "";
    const salesPerson = item.salesPerson?.toLowerCase() || "";
    const technology =
      typeof item.technology === "string" ? item.technology.toLowerCase() : "";
    const tag = Array.isArray(item.tag) ? item.tag : [];
    const category = item.category?.toLowerCase() || "";
    const industry = item.industry?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return (
      projectName.includes(search) ||
      websiteLink.includes(search) ||
      clientName.includes(search) ||
      salesPerson.includes(search) ||
      technology.includes(search) ||
      tag.some((t) => t?.toLowerCase().includes(search)) ||
      category.includes(search) ||
      industry.includes(search)
    );
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getDisplayTechnology = (item: PortfolioItem) => {
    return typeof item.technology === "string" ? item.technology : "";
  };

  const truncateTooltipText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const shouldShowTooltip = (text: string, maxLength: number = 50) => {
    return text.length > maxLength;
  };

  const isPdfUrl = (url: string) =>
    (url || "").toLowerCase().split("?")[0].endsWith(".pdf");
  const getFirstImageUrl = (files: string[] = []) => {
    const firstImage = files.find((u) => u && !isPdfUrl(u));
    return firstImage || "/placeholder.svg";
  };

  const getVisibleResultsMin = (currentPage: number, itemsPerPage: number) => {
    return (currentPage - 1) * itemsPerPage + 1;
  };

  const getVisibleResultsMax = (currentPage: number, itemsPerPage: number, totalItems: number) => {
    return Math.min(currentPage * itemsPerPage, totalItems);
  };

  const TableView = () => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {isLoggedIn && isSelectionMode && (
              <TableHead className="w-8 min-w-[32px]">
                <Checkbox
                  checked={isSelectAll}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-3 w-3 [&>span]:h-2.5 [&>span]:w-2.5"
                />
              </TableHead>
            )}
            <TableHead className="w-12 sm:w-16 lg:w-20 min-w-[48px]">
              Thumbnail
            </TableHead>
            <TableHead className="min-w-[200px]">Title</TableHead>
            <TableHead className="hidden sm:table-cell min-w-[120px]">
              Technology
            </TableHead>
            <TableHead className="hidden lg:table-cell min-w-[100px]">
              Date
            </TableHead>
            {isLoggedIn && (
              <TableHead className="w-16 sm:w-20 lg:w-24 min-w-[64px]">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.map((item) => (
            <TableRow key={item._id} className="hover:bg-gray-50">
              {isLoggedIn && isSelectionMode && (
                <TableCell>
                  <Checkbox
                    checked={selectedItems.has(item._id)}
                    onCheckedChange={(checked) => handleSelectItem(item._id, checked as boolean)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-3 w-3 [&>span]:h-2.5 [&>span]:w-2.5"
                  />
                </TableCell>
              )}
              <TableCell>
                {item.clientInvoices &&
                item.clientInvoices.length > 0 &&
                isPdfUrl(item.clientInvoices[0]) ? (
                  <button
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-lg border border-gray-200 bg-white"
                    onClick={() =>
                      window.open(item.clientInvoices[0], "_blank")
                    }
                    title="Open PDF"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-gray-600" />
                  </button>
                ) : (
                  <img
                    src={getFirstImageUrl(item.clientInvoices)}
                    alt={item.projectName}
                    onClick={() =>
                      window.open(item.clientInvoices[0], "_blank")
                    }
                    title="Open Image"
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-cover rounded-lg cursor-pointer"
                  />
                )}
              </TableCell>
              <TableCell>
                <div>
                  <Link to={`/dashboard/portfolio/${item._id}`}>
                    <div className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer text-sm sm:text-base">
                      {item.projectName}
                    </div>
                  </Link>
                  <div className="text-xs sm:text-sm text-gray-500 break-words max-w-xs">
                    {/* Show description only on screens 700px and above */}
                    <div className="hidden sm:block">
                      {item.description &&
                        (shouldShowTooltip(item.description, 50) ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="truncate cursor-help hover:text-gray-700 transition-colors">
                                  {item.description}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                className="max-w-xs rounded-lg bg-white text-black text-xs p-2 border border-gray-200 shadow-lg"
                                side="top"
                              >
                                <p>
                                  {truncateTooltipText(item.description, 80)}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <div className="truncate">{item.description}</div>
                        ))}
                    </div>
                    {/* Show industry only on screens 700px and above */}
                    <div className="hidden sm:block">
                      {item.industry && (
                        <span className="block text-xs text-blue-600 mt-1">
                          {item.industry}
                        </span>
                      )}
                    </div>
                    {/* Show technology on mobile */}
                    <div className="sm:hidden mt-1">
                      {getDisplayTechnology(item) && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-50 text-blue-700"
                        >
                          {getDisplayTechnology(item)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex flex-wrap gap-1">
                  {getDisplayTechnology(item) && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-50 text-blue-700"
                    >
                      {getDisplayTechnology(item)}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-gray-600 text-sm">
                {item.completionDate
                  ? new Date(item.completionDate).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              {isLoggedIn && (
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditItem(item);
                        setIsEditModalOpen(true);
                      }}
                      className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                      title="Edit"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-red-600"
                        onClick={() => handleDelete(item._id, item.projectName)}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
      {paginatedItems.map((item) => (
        <Card
          key={item._id}
          className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white relative"
        >
          {isLoggedIn && isSelectionMode && (
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selectedItems.has(item._id)}
                onCheckedChange={(checked) => handleSelectItem(item._id, checked as boolean)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 bg-white/90 h-3 w-3 [&>span]:h-2.5 [&>span]:w-2.5"
              />
            </div>
          )}
          <Link to={`/dashboard/portfolio/${item._id}`}>
            <div className="relative overflow-hidden rounded-t-lg">
              {item.clientInvoices &&
              item.clientInvoices.length > 0 &&
              isPdfUrl(item.clientInvoices[0]) ? (
                <div className="w-full h-32 sm:h-40 lg:h-48 flex items-center justify-center bg-white">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-600" />
                </div>
              ) : (
                <img
                  src={getFirstImageUrl(item.clientInvoices)}
                  alt={item.projectName}
                  className="w-full h-32 sm:h-40 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              {isLoggedIn && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditItem(item);
                        setIsEditModalOpen(true);
                      }}
                      className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 bg-white/90 hover:bg-white"
                      title="Edit"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 bg-white/90 hover:bg-white text-red-600"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(item._id, item.projectName);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Link>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <Link to={`/dashboard/portfolio/${item._id}`}>
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
                {item.projectName}
              </h3>
            </Link>
            {/* Show description only on screens 700px and above */}
            <div className="hidden sm:block">
              {item.description &&
                (shouldShowTooltip(item.description, 50) ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-gray-600 text-xs sm:text-sm mb-2 truncate cursor-help hover:text-gray-700 transition-colors">
                          {item.description}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent
                        className="max-w-xs rounded-lg bg-white text-black text-xs p-2 border border-gray-200 shadow-lg"
                        side="top"
                      >
                        <p>{truncateTooltipText(item.description, 80)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 truncate">
                    {item.description}
                  </p>
                ))}
            </div>
            {/* Show industry only on screens 700px and above */}
            <div className="hidden sm:block">
              {item.industry && (
                <p className="text-xs text-blue-600 mb-2 sm:mb-4">
                  Industry: {item.industry}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4">
              {getDisplayTechnology(item) && (
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs"
                >
                  {getDisplayTechnology(item)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Portfolio
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Loading portfolio items...
            </p>
          </div>
        </div>

        {/* Skeleton Loader */}
        {viewMode === "table" ? <TableSkeleton showSelectColumn={isLoggedIn && isSelectionMode} /> : <GridSkeleton />}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Portfolio
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your portfolio items
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <ImportPortfolio
              disabled={isLoading}
              onImported={fetchPortfolios}
            />
            <ExportPortfolio
              items={filteredItems}
              allItems={portfolioItems}
              disabled={isLoading}
            />
            {isLoggedIn && selectedItems.size > 0 && (
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                className="text-sm sm:text-base"
                disabled={!isAdmin}
              >
                <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Delete ({selectedItems.size})
              </Button>
            )}
          </div>
          {isLoggedIn && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
            >
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Add Project</span>
              <span className="xs:hidden">Add</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
          <Input
            placeholder="Search portfolio items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 sm:pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm sm:text-base h-8 sm:h-10"
          />
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <Checkbox
                checked={isSelectionMode}
                onCheckedChange={handleSelectionModeToggle}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-3 w-3 [&>span]:h-2.5 [&>span]:w-2.5"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Select</span>
            </div>
          )}
          <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-lg border border-gray-200 p-1">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange("table")}
              className={`h-7 w-7 sm:h-8 sm:w-8 ${
                viewMode === "table" ? "bg-blue-600 hover:bg-blue-700" : ""
              }`}
              title="Table View"
            >
              <List className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange("grid")}
              className={`h-7 w-7 sm:h-8 sm:w-8 ${
                viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700" : ""
              }`}
              title="Grid View"
            >
              <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {portfolioItems.length === 0
              ? "No portfolio items found."
              : "No items match your search."}
          </div>
        </div>
      ) : (
        <>{viewMode === "table" ? <TableView /> : <GridView />}</>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                // Show first page, last page, current page, and pages around current page
                const shouldShow = 
                  pageNumber === 1 || 
                  pageNumber === totalPages || 
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                
                if (!shouldShow) {
                  // Show ellipsis for gaps
                  if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                }
                
                 return (
                   <PaginationItem key={pageNumber}>
                     <PaginationLink
                       href="#"
                       onClick={(e) => {
                         e.preventDefault();
                         setCurrentPage(pageNumber);
                       }}
                       isActive={currentPage === pageNumber}
                       className={`cursor-pointer h-8 w-8 p-0 flex items-center justify-center text-sm rounded-md ${
                         currentPage === pageNumber 
                           ? "bg-blue-600 text-white hover:bg-blue-600 hover:text-white" 
                           : "hover:bg-gray-100 hover:text-gray-900"
                       }`}
                     >
                       {pageNumber}
                     </PaginationLink>
                   </PaginationItem>
                 );
              })}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          {/* Results info */}
          <div className="text-sm text-gray-600">
            Showing {getVisibleResultsMin(currentPage, itemsPerPage)}-{getVisibleResultsMax(
              currentPage,
              itemsPerPage,
              filteredItems.length
            )} of {filteredItems.length} results
          </div>
        </div>
      )}

      <AddPortfolioModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onPortfolioAdded={handlePortfolioAdded}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Portfolio Item"
        description={`Are you sure you want to delete "${itemToDeleteName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ConfirmDialog
        isOpen={bulkDeleteConfirmOpen}
        title="Delete Selected Items"
        description={`Are you sure you want to delete ${selectedItems.size} selected portfolio item(s)?`}
        confirmText="Delete All"
        cancelText="Cancel"
        onConfirm={confirmBulkDelete}
        onCancel={cancelBulkDelete}
      />

      {editItem && (
        <EditPortfolioModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          initialValues={editItem}
          portfolioId={editItem._id}
          onUpdated={fetchPortfolios}
        />
      )}
    </div>
  );
}

