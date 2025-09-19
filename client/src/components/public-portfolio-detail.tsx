import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  ArrowLeft, 
  ExternalLink, 
  User, 
  FileText,
  ImageIcon,
  Eye,
} from "lucide-react";

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

export function PublicPortfolioDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/public/portfolios/${id}`);
        const data = response.data;
        const item = data as PortfolioItem | null;
        if (item && (item as any)._id) {
          setPortfolio(item as PortfolioItem);
        } else {
          setError("Portfolio not found");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch portfolio";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPortfolio();
    }
  }, [id]);

  const isPdfUrl = (url: string) =>
    (url || "").toLowerCase().split("?")[0].endsWith(".pdf");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/portfolio")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
              </div>
            </div>
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-500">
                Loading portfolio details...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/portfolio")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Error</h1>
              </div>
            </div>
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-red-500">
                {error || "Portfolio not found"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const portfolioTags = portfolio.tag || [];
  const technologiesUsed = Array.isArray(portfolio.technology)
    ? portfolio.technology.filter(Boolean)
    : portfolio.technology
    ? [portfolio.technology]
    : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/portfolio")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {portfolio.projectName}
              </h1>
              <p className="text-gray-600">{portfolio.category}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card>
                <CardContent className="p-0">
                  <div className="relative">
                    {portfolio.clientInvoices &&
                    portfolio.clientInvoices.length > 0 &&
                    isPdfUrl(portfolio.clientInvoices[selectedImage]) ? (
                      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-t-lg border-b">
                        <Button
                          onClick={() =>
                            window.open(
                              portfolio.clientInvoices[selectedImage],
                              "_blank"
                            )
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" /> Open PDF
                        </Button>
                      </div>
                    ) : (
                      <img
                        src={
                          portfolio.clientInvoices &&
                          portfolio.clientInvoices.length > 0
                            ? portfolio.clientInvoices[selectedImage]
                            : "/placeholder.svg"
                        }
                        alt={portfolio.projectName}
                        className="w-full h-96 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {portfolio.websiteLink && (
                        <Button
                          size="sm"
                          className="bg-white/90 text-gray-900 hover:bg-white"
                          onClick={() =>
                            window.open(portfolio.websiteLink, "_blank")
                          }
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Live Demo
                        </Button>
                      )}
                    </div>
                  </div>
                  {portfolio.clientInvoices &&
                    portfolio.clientInvoices.length > 0 && (
                      <div className="p-4">
                        <div className="flex gap-2 overflow-x-auto">
                          {portfolio.clientInvoices.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImage(index)}
                              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                                selectedImage === index
                                  ? "border-blue-500"
                                  : "border-gray-200"
                              }`}
                            >
                              {isPdfUrl(image) ? (
                                <div className="w-full h-full flex items-center justify-center bg-white">
                                  <FileText className="h-4 w-4 text-gray-600" />
                                </div>
                              ) : (
                                <img
                                  src={image}
                                  alt={`View ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Project Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{portfolio.description}</p>
                </CardContent>
              </Card>

              {/* Tabs Content */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Project Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Information</CardTitle>
                      <CardDescription>
                        Business and project details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {portfolio.industry && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Industry</span>
                          <span className="font-medium">
                            {portfolio.industry}
                          </span>
                        </div>
                      )}
                      {portfolio.category && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Category</span>
                          <span className="font-medium">
                            {portfolio.category}
                          </span>
                        </div>
                      )}
                      {portfolio.bidPlatform && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Bid Platform
                          </span>
                          <span className="font-medium">
                            {portfolio.bidPlatform}
                          </span>
                        </div>
                      )}
                      {portfolio.bidPlatformUrl && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Platform URL
                          </span>
                          <a 
                            href={portfolio.bidPlatformUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            {portfolio.bidPlatformUrl}
                          </a>
                        </div>
                      )}
                      {technologiesUsed.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Technology</span>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {technologiesUsed.map((tech, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {portfolio.pageBuilder && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Page Builder</span>
                          <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                            {portfolio.pageBuilder}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Project Tags */}
                  {portfolioTags.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Project Tags</CardTitle>
                        <CardDescription>
                          Additional tags and keywords for this project
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {portfolioTags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-purple-50 text-purple-700"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="gallery" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Project Gallery
                      </CardTitle>
                      <CardDescription>
                        All project screenshots and images
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {portfolio.clientInvoices &&
                      portfolio.clientInvoices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {portfolio.clientInvoices.map((image, index) => (
                            <div key={index} className="relative group">
                              {isPdfUrl(image) ? (
                                <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg border">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => window.open(image, "_blank")}
                                  >
                                    <FileText className="mr-2 h-4 w-4" /> Open PDF
                                  </Button>
                                </div>
                              ) : (
                                <img
                                  src={image}
                                  alt={`Gallery image ${index + 1}`}
                                  className="w-full h-64 object-cover rounded-lg"
                                />
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-lg" />
                              <Button
                                size="icon"
                                variant="secondary"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={() => window.open(image, "_blank")}
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No images available for this project.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Client & Sales Information */}
              {(portfolio.clientName || portfolio.salesPerson || portfolio.testimonials) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Client Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {portfolio.clientName && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Client</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {portfolio.clientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {portfolio.clientName}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {portfolio.testimonials && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Testimonial</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 italic">
                            "{portfolio.testimonials}"
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
