"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddTechnologyModal } from "@/components/add-technology-modal"
import { EditTechnologyModal } from "@/components/edit-technology-modal"
import { ConfirmDialog } from "@/components/confirmDelete "
import { Search, Plus, Edit, Trash2, Code2, Star, TrendingUp } from "lucide-react"
import toast from "react-hot-toast"
import { Skeleton } from "@/components/ui/skeleton" 
import axios from "axios"

interface Technology {
  _id: string
  name: string
  description: string
  category: string
  icon: string
  color: string
  website: string
  popularity: number
  count?: number
}

const categories = [
  "All",
  "Frontend Framework",
  "Full-stack Framework",
  "Programming Language",
  "CSS Framework",
  "Backend Runtime",
  "Database",
  "DevOps",
]

export function TechnologiesPage() {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [technologyToEdit, setTechnologyToEdit] = useState<Technology | null>(null)
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [technologyToDelete, setTechnologyToDelete] = useState<Technology | null>(null)

const fetchTechnologies = async () => {
  setLoading(true)
  setError("")
  try {
    const response = await axios.get("/api/technology")
    const data: Technology[] = response.data

    const cleaned = data.filter(
      (tech) =>
        typeof tech.name === "string" &&
        typeof tech.description === "string" &&
        typeof tech.category === "string"
    )

    setTechnologies(cleaned)
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error fetching technologies"
    setError(errorMessage)
  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    fetchTechnologies()    
  }, [])

  const handleEditTechnology = (technology: Technology) => {
    setTechnologyToEdit(technology)
    setIsEditModalOpen(true)
  }

  const handleDeleteTechnology = async () => {
    if (!technologyToDelete) return
    setDeleteLoading(true)
   try {
  const response = await axios.delete(`/api/technology/${technologyToDelete._id}`)

  const result = response.data
  if (result?.success === false) {
    throw new Error(result.message || "Failed to delete technology")
  }

  await fetchTechnologies()
  toast.success("Technology deleted successfully!")
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete technology"
      toast.error(errorMessage)
    } finally {
      setDeleteLoading(false)
      setTechnologyToDelete(null)
    }
  }

const filteredTechnologies = technologies.filter((tech) => {
  const name = (tech.name || "").toLowerCase()
  const description = (tech.description || "").toLowerCase()
  const search = searchTerm.toLowerCase()

  const matchesSearch =
    name.includes(search) || description.includes(search)

  const matchesCategory =
    selectedCategory === "All" || tech.category === selectedCategory

  return matchesSearch && matchesCategory
})



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technologies</h1>
          <p className="text-gray-600">Manage technologies used in your projects</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Technology
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
  {/* Search Input */}
  <div className="relative w-full max-w-md">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
    <Input
      placeholder="Search technologies..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-black"
    />
  </div>

  {/* Filter Buttons */}
  <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
    {categories.map((category) => (
      <Button
        key={category}
        variant={selectedCategory === category ? "default" : "outline"}
        size="sm"
        onClick={() => setSelectedCategory(category)}
        className={`whitespace-nowrap ${
          selectedCategory === category
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "border-gray-200 hover:bg-gray-50 bg-transparent"
        }`}
      >
        {category}
      </Button>
    ))}
  </div>
</div>


      {/* Loader / Error */}
      {loading && (
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
      )}

      {error && (
        <div className="text-center py-12 text-red-500">{error}</div>
      )}

      {/* Technologies Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechnologies.map((tech) => (
            <Card
              key={tech._id || tech.name}
              className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white"
            >
                            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="text-2xl flex-shrink-0">{tech.icon}</div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-gray-900 break-words leading-tight">
                        {tech.name || "Unnamed"}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1 break-words">
                        {tech.category || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-accent"
                      onClick={() => handleEditTechnology(tech)}
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-accent"
                      onClick={() => setTechnologyToDelete(tech)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {tech.description}
                </p>

                {/* Popularity Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Popularity</span>
                    <span className="font-medium">{tech.popularity}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${tech.popularity}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={tech.color}>
                    {(tech.count ?? 0)}{" "}
                    {tech.count === 1 ? "project" : "projects"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {tech.popularity >= 90 && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs">Popular</span>
                      </div>
                    )}
                    {tech.popularity >= 85 && tech.popularity < 90 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs">Trending</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && filteredTechnologies.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Code2 className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No technologies found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== "All"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first technology"}
          </p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Technology
          </Button>
        </div>
      )}

      <AddTechnologyModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onTechnologyAdded={fetchTechnologies}
      />

      <EditTechnologyModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onTechnologyUpdated={fetchTechnologies}
        technology={technologyToEdit}
      />

      <ConfirmDialog
        isOpen={!!technologyToDelete}
        title="Delete Technology"
        description={`Are you sure you want to delete "${technologyToDelete?.name}"? This action cannot be undone.`}
        confirmText={deleteLoading ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDeleteTechnology}
        onCancel={() => setTechnologyToDelete(null)}
      />
    </div>
  )
}
