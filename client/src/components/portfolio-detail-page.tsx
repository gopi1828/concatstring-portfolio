import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
// import { Separator } from "./ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Eye,
  Star,
  DollarSign,
  User,
  ImageIcon,
  FileText,
  Code,
  Building2,
  Award,
  Globe,
  Download,
} from "lucide-react";
import api from "../lib/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface PortfolioItem {
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
  createdAt?: string;
}

interface PortfolioDetailPageProps {
  id: string;
}

export function PortfolioDetailPage({ id }: PortfolioDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setIsLoading(true);

        const response = await api.get(`/api/portfolios/${id}`);

        const data = response.data;
        const item = (data &&
          (data.result ||
            data.portfolio ||
            data.item ||
            data)) as PortfolioItem | null;
        if (item && (item as any)._id) {
          setPortfolio(item as PortfolioItem);
        } else {
          setError("Portfolio not found");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch portfolio";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPortfolio();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
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
    );
  }

  if (error || !portfolio) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
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
    );
  }

 

  
  const technologiesUsed = Array.isArray(portfolio.technology)
    ? portfolio.technology.filter(Boolean)
    : portfolio.technology
    ? [portfolio.technology]
    : [];

  const isPdfUrl = (url: string) =>
    (url || "").toLowerCase().split("?")[0].endsWith(".pdf");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Image */}
        <div className="relative h-96 lg:h-[500px] overflow-hidden">
          {portfolio.clientInvoices && portfolio.clientInvoices.length > 0 ? (
            <img
              src={portfolio.clientInvoices[selectedImage]}
              alt={portfolio.projectName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <div className="text-center text-white">
                <Code className="h-16 w-16 mx-auto mb-4 opacity-80" />
                <h2 className="text-2xl font-bold">No Preview Available</h2>
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Navigation */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {portfolio.websiteLink && (
              <Button
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                onClick={() => window.open(portfolio.websiteLink, "_blank")}
              >
                <Globe className="mr-2 h-4 w-4" />
                Live Demo
              </Button>
            )}
          </div>

          {/* Project Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  {portfolio.category}
                </Badge>
                {portfolio.industry && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    {portfolio.industry}
                  </Badge>
                )}
                {portfolio.invoiceAmount && (
                  <Badge className="bg-green-500/80 text-white">
                    ${portfolio.invoiceAmount}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold mb-2">
                {portfolio.projectName}
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                {portfolio.description}
              </p>
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {portfolio.clientInvoices && portfolio.clientInvoices.length > 1 && (
          <div className="bg-white/95 backdrop-blur-sm border-t">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex gap-3 overflow-x-auto">
                {portfolio.clientInvoices.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index
                        ? "border-blue-500 scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {isPdfUrl(image) ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
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
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Start Date</p>
                      <p className="text-lg font-bold text-blue-900">
                        {portfolio.startDate
                          ? new Date(portfolio.startDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Completion</p>
                      <p className="text-lg font-bold text-green-900">
                        {portfolio.completionDate
                          ? new Date(portfolio.completionDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Value</p>
                      <p className="text-lg font-bold text-purple-900">
                        {portfolio.invoiceAmount ? `$${portfolio.invoiceAmount}` : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Project Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Project Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {portfolio.industry && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <Building2 className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Industry</p>
                            <p className="font-semibold">{portfolio.industry}</p>
                          </div>
                        </div>
                      )}
                      
                      {portfolio.bidPlatform && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <Globe className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Platform</p>
                            <p className="font-semibold">{portfolio.bidPlatform}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {portfolio.bidPlatformUrl && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Platform URL</p>
                            <p className="text-blue-900">{portfolio.bidPlatformUrl}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(portfolio.bidPlatformUrl, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Technologies */}
                {technologiesUsed.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Technologies Used
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {technologiesUsed.map((tech, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              </TabsContent>

              <TabsContent value="technical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Technical Stack
                    </CardTitle>
                    <CardDescription>
                      Technologies and tools used in this project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {technologiesUsed.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4">Technologies Used</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {technologiesUsed.map((tech, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg text-center">
                              <span className="font-medium text-gray-900">{tech}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {portfolio.pageBuilder && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4">Page Builder</h4>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <span className="font-medium text-green-800">{portfolio.pageBuilder}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
                    {portfolio.clientInvoices && portfolio.clientInvoices.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {portfolio.clientInvoices.map((image, index) => (
                          <div key={index} className="relative group cursor-pointer" onClick={() => window.open(image, "_blank")}>
                            {isPdfUrl(image) ? (
                              <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                                <div className="text-center">
                                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">PDF Document</p>
                                  <Button size="sm" variant="outline" className="mt-2">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="relative overflow-hidden rounded-xl">
                                <img
                                  src={image}
                                  alt={`Gallery image ${index + 1}`}
                                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg text-gray-500">No images available for this project.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            {(portfolio.clientName || portfolio.salesPerson) && (
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {portfolio.clientName && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {portfolio.clientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{portfolio.clientName}</p>
                        <p className="text-sm text-gray-600">Client</p>
                      </div>
                    </div>
                  )}
                  
                  {portfolio.salesPerson && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {portfolio.salesPerson
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{portfolio.salesPerson}</p>
                        <p className="text-sm text-gray-600">Sales Person</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Testimonial */}
            {portfolio.testimonials && (
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Client Testimonial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 rounded-lg border border-yellow-200">
                    <p className="text-gray-700 italic leading-relaxed">
                      "{portfolio.testimonials}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {portfolio.websiteLink && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.open(portfolio.websiteLink, "_blank")}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Visit Live Site
                  </Button>
                )}
                
                {portfolio.bidPlatformUrl && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.open(portfolio.bidPlatformUrl, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Platform
                  </Button>
                )}

                {portfolio.clientInvoices && portfolio.clientInvoices.length > 0 && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      const firstImage = portfolio.clientInvoices[0];
                      if (isPdfUrl(firstImage)) {
                        window.open(firstImage, "_blank");
                      }
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Assets
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
