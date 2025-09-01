"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Star,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";

const projects = [
  {
    id: 1,
    name: "E-commerce Dashboard",
    description:
      "Modern admin dashboard for e-commerce platform with real-time analytics and inventory management",
    status: "Published",
    category: "Web App",
    views: 1234,
    stars: 45,
    lastUpdated: "2024-01-15",
    image: "/placeholder.svg?height=200&width=300",
    technologies: ["React", "TypeScript", "Tailwind CSS"],
  },
  {
    id: 2,
    name: "Task Management App",
    description:
      "Collaborative task management application with real-time updates and team collaboration features",
    status: "Draft",
    category: "Web App",
    views: 567,
    stars: 23,
    lastUpdated: "2024-01-12",
    image: "/placeholder.svg?height=200&width=300",
    technologies: ["Next.js", "Prisma", "PostgreSQL"],
  },
  {
    id: 3,
    name: "Weather Forecast Widget",
    description:
      "Beautiful weather widget with smooth animations and detailed forecasts",
    status: "Published",
    category: "Component",
    views: 890,
    stars: 67,
    lastUpdated: "2024-01-10",
    image: "/placeholder.svg?height=200&width=300",
    technologies: ["React", "Framer Motion", "API Integration"],
  },
  {
    id: 4,
    name: "Portfolio Website",
    description:
      "Personal portfolio website with dark mode and responsive design",
    status: "Published",
    category: "Website",
    views: 2341,
    stars: 89,
    lastUpdated: "2024-01-08",
    image: "/placeholder.svg?height=200&width=300",
    technologies: ["Next.js", "Tailwind CSS", "MDX"],
  },
  {
    id: 5,
    name: "Chat Application",
    description:
      "Real-time chat application with file sharing and emoji support",
    status: "In Progress",
    category: "Web App",
    views: 123,
    stars: 12,
    lastUpdated: "2024-01-14",
    image: "/placeholder.svg?height=200&width=300",
    technologies: ["Socket.io", "Node.js", "MongoDB"],
  },
  {
    id: 6,
    name: "Data Visualization Dashboard",
    description:
      "Interactive dashboard for data visualization with charts and graphs",
    status: "Published",
    category: "Dashboard",
    views: 756,
    stars: 34,
    lastUpdated: "2024-01-05",
    image: "/placeholder.svg?height=200&width=300",
    technologies: ["D3.js", "React", "Chart.js"],
  },
];

const statusColors = {
  Published: "default",
  Draft: "secondary",
  "In Progress": "outline",
} as const;

export function ProjectsList() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Web App", "Component", "Website", "Dashboard"];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center 4justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and organize your portfolio projects
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          placeholder="Search projects..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          <Input className="pl-10" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {selectedCategory}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="group hover:shadow-lg transition-all duration-200"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={project.image || "/placeholder.svg"}
                alt={project.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute top-3 right-3">
                <Badge
                  variant={
                    statusColors[project.status as keyof typeof statusColors]
                  }
                >
                  {project.status}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg break-words leading-tight">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground break-words">
                    {project.category}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Live
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {project.technologies.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {project.technologies.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{project.technologies.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {project.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {project.stars}
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(project.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <FolderOpen className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== "All"
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first project"}
          </p>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
