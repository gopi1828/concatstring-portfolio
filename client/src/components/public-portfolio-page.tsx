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
} from "./ui/pagination";
import { Search, Code, Eye, Grid3X3, List, FileText } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const navigate = useNavigate();
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

  const getDisplayTags = (item: PortfolioItem) => {
    const techTags =
      typeof item.technology === "string" ? [item.technology] : [];
    const tags = Array.isArray(item.tag) ? item.tag : [];
    return [...techTags, ...tags].filter(Boolean);
  };

  const isPdfUrl = (url: string) =>
    (url || "").toLowerCase().split("?")[0].endsWith(".pdf");

  const getFirstImageUrl = (files: string[] = []) => {
    const firstImage = files.find((u) => u && !isPdfUrl(u));
    return firstImage || "/placeholder.svg";
  };

  const filteredPortfolios = portfolios.filter((item) => {
    const projectName = item.projectName?.toLowerCase() || "";
    const description = item.description?.toLowerCase() || "";
    const technology =
      typeof item.technology === "string" ? item.technology.toLowerCase() : "";
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

  const totalPages = Math.ceil(filteredPortfolios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredPortfolios.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleProjectClick = (id: string) => {
    navigate(`/portfolio/${id}`);
  };

  const TableView = () => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12 sm:w-16 lg:w-20 min-w-[48px]">
              Thumbnail
            </TableHead>
            <TableHead className="min-w-[200px]">Title</TableHead>
            <TableHead className="hidden sm:table-cell min-w-[120px]">
              Tags
            </TableHead>
            <TableHead className="hidden lg:table-cell min-w-[100px]">
              Date
            </TableHead>
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
                    <div className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer text-sm sm:text-base">
                      {item.projectName}
                    </div>
                  </Link>
                  <div className="text-xs sm:text-sm text-gray-500 break-words max-w-xs">
                    {/* Show description only on screens 700px and above */}
                    <div className="hidden sm:block">
                      {item.description && (
                        <div className="truncate">{item.description}</div>
                      )}
                    </div>
                    {/* Show tags on mobile */}
                    <div className="sm:hidden mt-1">
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
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
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
              <TableCell className="hidden lg:table-cell text-gray-600 text-sm">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
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
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex gap-1 sm:gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      handleProjectClick(item._id);
                    }}
                    className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 bg-white/90 hover:bg-white"
                    title="View Details"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <Link to={`/portfolio/${item._id}`}>
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
                {item.projectName}
              </h3>
            </Link>
            {/* Show description only on screens 700px and above */}
            <div className="hidden sm:block">
              {item.description && (
                <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4">
              {getDisplayTags(item).map((tag, index) => (
                <Badge
                  key={`${tag}-${index}`}
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white max-w-[2500px] mx-auto">
        <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Our Portfolio
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 mt-1 sm:mt-2">
                  Loading portfolio items...
                </p>
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
      <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Our Portfolio
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mt-1 sm:mt-2">
                Explore our collection of successful projects and client work
              </p>
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
            <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-lg border border-gray-200 p-1">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
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
                onClick={() => setViewMode("grid")}
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
              <div className="mx-auto w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Code className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No projects found
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "No projects available at the moment"}
              </p>
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
                      className={`text-xs sm:text-sm ${
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                    />
                  </PaginationItem>

                  {totalPages <= 7 ? (
                    [...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                          isActive={currentPage === i + 1}
                          size="icon"
                          className="text-xs sm:text-sm h-7 w-7 sm:h-8 sm:w-8"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))
                  ) : (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(1);
                          }}
                          isActive={currentPage === 1}
                          size="icon"
                          className="text-xs sm:text-sm h-7 w-7 sm:h-8 sm:w-8"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>

                      {currentPage > 3 && (
                        <PaginationItem>
                          <span className="px-2 text-xs sm:text-sm">...</span>
                        </PaginationItem>
                      )}

                      {[...Array(Math.min(3, totalPages - 2))].map((_, i) => {
                        const pageNum = Math.max(2, currentPage - 1) + i;
                        if (pageNum >= totalPages) return null;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNum);
                              }}
                              isActive={currentPage === pageNum}
                              size="icon"
                              className="text-xs sm:text-sm h-7 w-7 sm:h-8 sm:w-8"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <span className="px-2 text-xs sm:text-sm">...</span>
                        </PaginationItem>
                      )}

                      {totalPages > 1 && (
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(totalPages);
                            }}
                            isActive={currentPage === totalPages}
                            size="icon"
                            className="text-xs sm:text-sm h-7 w-7 sm:h-8 sm:w-8"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      className={`text-xs sm:text-sm ${
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
