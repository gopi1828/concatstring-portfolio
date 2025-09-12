import { useEffect, useState } from "react";
import api from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Search, Plus, Edit, Trash2, Building2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import toast from "react-hot-toast";
import { ConfirmDialog } from "./ui/confirm-delete";
import { Skeleton } from "./ui/skeleton";
import { AddIndustryModal } from "./add-industry-modal";
import { EditIndustryModal } from "./edit-industry-modal";

type IndustryType = {
  _id: string;
  name: string;
  count: number;
};

export function IndustryPage() {
  const [industries, setIndustries] = useState<IndustryType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [industryToDelete, setIndustryToDelete] = useState<IndustryType | null>(null);
  const [industryToEdit, setIndustryToEdit] = useState<IndustryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchIndustries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/industry");
      setIndustries(res.data);
    } catch (error) {
      toast.error("Error fetching industries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustries();
  }, []);

  const handleIndustryAdded = () => {
    fetchIndustries();
  };

  const handleEditIndustry = (industry: IndustryType) => {
    setIndustryToEdit(industry);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!industryToDelete) return;
    try {
      await api.delete(`/api/industry/${industryToDelete._id}`);
      toast.success("Industry deleted successfully");
      fetchIndustries();
    } catch (error) {
      toast.error("Failed to delete industry");
    } finally {
      setIndustryToDelete(null);
    }
  };

  const filteredIndustries = industries.filter((industry) =>
    industry.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Industries</h1>
          <p className="text-gray-600">Manage industries for your portfolio projects</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Industry
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search industries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
        />
      </div>

      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 border-0 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIndustries.map((industry) => (
              <Card
                key={industry._id}
                className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="text-2xl flex-shrink-0">🏢</div>
                      <div className="flex-1 min-w-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CardTitle className="text-lg text-gray-900 break-words leading-tight cursor-help">
                                {industry.name}
                              </CardTitle>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs break-words">
                                {industry.name}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-accent"
                        onClick={() => handleEditIndustry(industry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-accent"
                        onClick={() => setIndustryToDelete(industry)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                <Badge className="bg-blue-100 text-blue-800">
                    {industry.count ?? 0}{" "}
                    {industry.count === 1 ? "project" : "projects"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredIndustries.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No industries found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Get started by creating your first industry"}
              </p>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!industryToDelete}
        title="Delete Industry"
        description={`Are you sure you want to delete "${industryToDelete?.name}"?`}
        onCancel={() => setIndustryToDelete(null)}
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Add Industry Modal */}
      <AddIndustryModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onIndustryAdded={handleIndustryAdded}
      />

      {/* Edit Industry Modal */}
      <EditIndustryModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onIndustryUpdated={handleIndustryAdded}
        industry={industryToEdit}
      />
    </div>
  );
}
