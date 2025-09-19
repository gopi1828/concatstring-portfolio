import { useEffect, useState } from "react";
import api from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink, 
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "./ui/pagination";
import { Search, Grid3X3, List, Calendar, FileText } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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
          <TableHead>Technology</TableHead>
          <TableHead>Date</TableHead>
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
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
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

export function PublicPortfolioPage() {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">(() => {
    const savedViewMode = localStorage.getItem("portfolioViewMode");
    return (savedViewMode as "table" | "grid") || "table";
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/public/portfolios");
      setPortfolios(response.data || []);
    } catch (err: unknown) {
      console.error("Error fetching portfolios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const getDisplayTechnology = (item: PortfolioItem) => {
    return typeof item.technology === 'string' ? item.technology : '';
  };

  const truncateTooltipText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

  const filteredPortfolios = portfolios.filter((item) => {
    const projectName = item.projectName?.toLowerCase() || "";
    const description = item.description?.toLowerCase() || "";
    const technology =
      typeof item.technology === "string" ? item.technology.toLowerCase() : "";
    const tag = Array.isArray(item.tag) ? item.tag : [];
    const category = item.category?.toLowerCase() || "";
    const industry = item.industry?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return (
      projectName.includes(search) ||
      description.includes(search) ||
      technology.includes(search) ||
      tag.some((t) => t?.toLowerCase().includes(search)) ||
      category.includes(search) ||
      industry.includes(search)
    );
  });

  const totalPages = Math.ceil(filteredPortfolios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredPortfolios.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleViewModeChange = (mode: "table" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("portfolioViewMode", mode);
  };

  const TableView = () => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <Table>
              <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-20">Thumbnail</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Technology</TableHead>
            <TableHead>Date</TableHead>
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
                  <Link to={`/portfolio/${item._id}`}>
                    <div className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                          {item.projectName}
                        </div>
                  </Link>
                  <div className="text-sm text-gray-500 break-words max-w-xs">
                    {shouldShowTooltip(item.description, 50) ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="truncate cursor-help hover:text-gray-700 transition-colors" 
                            >
                              {item.description}
                            </div>
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
                      <div className="truncate">
                        {item.description}
                      </div>
                    )}
                    {item.industry && (
                      <span className="block text-xs text-blue-600 mt-1">
                       {item.industry}
                      </span>
                    )}
                        </div>
                      </div>
                    </TableCell>
              <TableCell>
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
              <TableCell className="text-gray-600">
                {item.completionDate
                  ? new Date(item.completionDate).toLocaleDateString()
                  : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {paginatedItems.map((item) => (
        <Card
          key={item._id}
          className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white"
        >
          <Link to={`/portfolio/${item._id}`}>
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
            </div>
          </Link>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <Link to={`/portfolio/${item._id}`}>
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
                {item.projectName}
              </h3>
            </Link>
            {shouldShowTooltip(item.description, 50) ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p 
                      className="text-gray-600 text-sm mb-2 truncate cursor-help hover:text-gray-700 transition-colors" 
                    >
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
              <p className="text-gray-600 text-sm mb-2 truncate">
                {item.description}
              </p>
            )}
            {item.industry && (
              <p className="text-xs text-blue-600 mb-4">
                Industry: {item.industry}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {getDisplayTechnology(item) && (
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs"
                >
                  {getDisplayTechnology(item)}
                </Badge>
              )}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white max-w-[2500px] mx-auto">
        <div className="px-6 sm:px-12 lg:px-20 xl:px-32 py-4 sm:py-6 lg:py-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <img src="/frame.svg" alt="logo" className="h-12 w-auto" />

              </div>
            </div>
            {viewMode === "table" ? <TableSkeleton /> : <GridSkeleton />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white max-w-[2500px] mx-auto">
      <div className="px-6 sm:px-12 lg:px-20 xl:px-32 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <img src="/frame.svg" alt="logo" className="h-12 w-auto" />
              <p className="text-lg text-gray-600 mt-2">
                Explore our collection of successful projects and client work
              </p>
            </div>
          </div>

          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md -mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search portfolio items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 sm:pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm sm:text-base h-8 sm:h-10"
              />
            </div>
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

          {/* Content */}
          {filteredPortfolios.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {portfolios.length === 0
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
                  filteredPortfolios.length
                )} of {filteredPortfolios.length} results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
