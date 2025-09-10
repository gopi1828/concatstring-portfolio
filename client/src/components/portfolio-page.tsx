import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
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
} from "../components/ui/pagination";
import { AddPortfolioModal } from "../components/add-portfolio-modal";
import EditPortfolioModal from "../components/edit-portfolio-modal";
import {
  Search,
  Plus,
  Grid3X3,
  List,
  Calendar,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "./ui/confirm-delete";

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

const TableSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
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
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
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
        payload?.user?.role ??
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
          const roleFromUser = (user?.role ??
            user?.user?.role ??
            user?.data?.role ??
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

  // Callback function to refresh data when portfolio is added
  const handlePortfolioAdded = () => {
    fetchPortfolios();
  };

  const handleDelete = async (id: string) => {
    setItemToDelete(id);
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
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const filteredItems = portfolioItems.filter((item) => {
    const projectName = item.projectName?.toLowerCase() || "";
    const description = item.description?.toLowerCase() || "";
    const technology = typeof item.technology === 'string' ? item.technology.toLowerCase() : "";
    const tag = Array.isArray(item.tag) ? item.tag : [];
    const search = searchTerm.toLowerCase();

    return (
      projectName.includes(search) ||
      description.includes(search) ||
      technology.includes(search) ||
      tag.some((t) => t?.toLowerCase().includes(search)) ||
      item.category?.toLowerCase().includes(search) ||
      item.industry?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getDisplayTags = (item: PortfolioItem) => {
    const techTags = typeof item.technology === 'string' ? [item.technology] : [];
    const tags = Array.isArray(item.tag) ? item.tag : [];
    return [...techTags, ...tags].filter(Boolean);
  };

  const isPdfUrl = (url: string) =>
    (url || "").toLowerCase().split("?")[0].endsWith(".pdf");
  const getFirstImageUrl = (files: string[] = []) => {
    const firstImage = files.find((u) => u && !isPdfUrl(u));
    return firstImage || "/placeholder.svg";
  };

  const TableView = () => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-20">Thumbnail</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Date</TableHead>
            {isLoggedIn && <TableHead className="w-20">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.map((item) => (
            <TableRow key={item._id} className="hover:bg-gray-50">
              <TableCell>
                {item.clientInvoices &&
                item.clientInvoices.length > 0 &&
                isPdfUrl(item.clientInvoices[0]) ? (
                  <button
                    className="w-12 h-12 flex items-center justify-center rounded-lg border border-gray-200 bg-white"
                    onClick={() =>
                      window.open(item.clientInvoices[0], "_blank")
                    }
                    title="Open PDF"
                  >
                    <FileText className="h-5 w-5 text-gray-600" />
                  </button>
                ) : (
                  <img
                    src={getFirstImageUrl(item.clientInvoices)}
                    alt={item.projectName}
                    onClick={() =>
                      window.open(item.clientInvoices[0], "_blank")
                    }
                    title="Open Image"
                    className="w-12 h-12 object-cover rounded-lg cursor-pointer"
                  />
                )}
              </TableCell>
              <TableCell>
                <div>
                  <Link to={`/dashboard/portfolio/${item._id}`}>
                    <div className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                      {item.projectName}
                    </div>
                  </Link>
                  <div className="text-sm text-gray-500 break-words max-w-xs">
                    {item.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {getDisplayTags(item)
                    .slice(0, 2)
                    .map((tag, index) => (
                      <Badge
                        key={`${item._id}-${tag}-${index}`}
                        variant="secondary"
                        className="text-xs bg-blue-50 text-blue-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </TableCell>
              <TableCell className="text-gray-600">
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
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedItems.map((item) => (
        <Card
          key={item._id}
          className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white"
        >
          <Link to={`/dashboard/portfolio/${item._id}`}>
            <div className="relative overflow-hidden rounded-t-lg">
              {item.clientInvoices &&
              item.clientInvoices.length > 0 &&
              isPdfUrl(item.clientInvoices[0]) ? (
                <div className="w-full h-48 flex items-center justify-center bg-white">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
              ) : (
                <img
                  src={getFirstImageUrl(item.clientInvoices)}
                  alt={item.projectName}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              {isLoggedIn && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditItem(item);
                        setIsEditModalOpen(true);
                      }}
                      className="h-8 w-8 bg-white/90 hover:bg-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white/90 hover:bg-white text-red-600"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(item._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Link>
          <CardContent className="p-6">
            <Link to={`/dashboard/portfolio/${item._id}`}>
              <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                {item.projectName}
              </h3>
            </Link>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {item.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {getDisplayTags(item).map((tag, index) => (
                <Badge
                  key={`${tag}-${index}`}
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {item.completionDate
                  ? new Date(item.completionDate).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
            <p className="text-gray-600">Loading portfolio items...</p>
          </div>
        </div>

        {/* Skeleton Loader */}
        {viewMode === "table" ? <TableSkeleton /> : <GridSkeleton />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600">Manage your portfolio items</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportPortfolio disabled={isLoading} onImported={fetchPortfolios} />
          <ExportPortfolio
            items={filteredItems}
            allItems={portfolioItems}
            disabled={isLoading}
          />
          {isLoggedIn && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Portfolio Item
            </Button>
          )}
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search portfolio items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className={
              viewMode === "table" ? "bg-blue-600 hover:bg-blue-700" : ""
            }
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={
              viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700" : ""
            }
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
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
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {/* Previous */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {/* Page Numbers */}
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                    isActive={currentPage === i + 1}
                    size="icon"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Pass the callback function to the modal */}
      <AddPortfolioModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onPortfolioAdded={handlePortfolioAdded}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Portfolio Item"
        description="Are you sure you want to delete this portfolio item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
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
