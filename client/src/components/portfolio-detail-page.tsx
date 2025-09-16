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
  tag: string[];
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

 
  const portfolioTags = portfolio.tag || [];

  
  const technologiesUsed = Array.isArray(portfolio.technology)
    ? portfolio.technology.filter(Boolean)
    : portfolio.technology
    ? [portfolio.technology]
    : [];

  const isPdfUrl = (url: string) =>
    (url || "").toLowerCase().split("?")[0].endsWith(".pdf");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {portfolio.projectName}
          </h1>
          <p className="text-gray-600">{portfolio.category}</p>
        </div>
        {/* <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">Completed</Badge>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit  
          </Button>
        </div> */}
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
           <Tabs defaultValue="technical" className="w-full">
             <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="technical">Technical</TabsTrigger>
               <TabsTrigger value="gallery">Gallery</TabsTrigger>
             </TabsList>

             <TabsContent value="technical" className="space-y-6">
               {/* Technical Stack */}
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
                 <CardContent>
                   <div className="space-y-4">
                     {technologiesUsed.length > 0 && (
                       <div>
                         <h4 className="text-sm font-medium text-gray-600 mb-2">Technologies Used</h4>
                         <div className="flex flex-wrap gap-2">
                           {technologiesUsed.map((tech, index) => (
                             <Badge
                               key={index}
                               variant="outline"
                               className="bg-blue-50 text-blue-700 border-blue-200"
                             >
                               {tech}
                             </Badge>
                           ))}
                         </div>
                       </div>
                     )}
                     
                     {portfolio.pageBuilder && (
                       <div>
                         <h4 className="text-sm font-medium text-gray-600 mb-2">Page Builder</h4>
                         <Badge variant="secondary" className="bg-green-50 text-green-700">
                           {portfolio.pageBuilder}
                         </Badge>
                       </div>
                     )}
                   </div>
                 </CardContent>
               </Card>

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
                         View Platform
                       </a>
                     </div>
                   )}
                   {portfolio.invoiceAmount && (
                     <div className="flex items-center justify-between">
                       <span className="text-sm text-gray-600">
                         Invoice Amount
                       </span>
                       <span className="font-medium">
                         ${portfolio.invoiceAmount}
                       </span>
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
          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Project Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Start Date</span>
                </div>
                <span className="font-medium">
                  {portfolio.startDate
                    ? new Date(portfolio.startDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Completion Date</span>
                </div>
                <span className="font-medium">
                  {portfolio.completionDate
                    ? new Date(portfolio.completionDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              {portfolio.invoiceAmount && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Amount</span>
                  </div>
                  <span className="font-medium">
                    ${portfolio.invoiceAmount}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client & Sales Information */}
          {(portfolio.clientName || portfolio.salesPerson || portfolio.testimonials) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client & Sales Information
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
                
                {portfolio.salesPerson && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Sales Person</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {portfolio.salesPerson
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {portfolio.salesPerson}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {portfolio.testimonials && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
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

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            {/* <CardContent>
              <div className="flex flex-wrap gap-2">
                {portfolioTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent> */}
          </Card>
        </div>
      </div>
    </div>
  );
}
