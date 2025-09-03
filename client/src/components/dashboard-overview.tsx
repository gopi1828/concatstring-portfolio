import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  FolderOpen,
  Eye,
  Star,
  TrendingUp,
  Plus,
  ExternalLink,
  Calendar,
  Activity,
  Settings,
} from "lucide-react"; // Added Settings import
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Total Projects",
    value: "24",
    change: "+2 from last month",
    icon: FolderOpen,
    color: "text-blue-600",
  },
  {
    title: "Total Views",
    value: "12,543",
    change: "+15% from last month",
    icon: Eye,
    color: "text-green-600",
  },
  {
    title: "Stars Received",
    value: "1,247",
    change: "+8% from last month",
    icon: Star,
    color: "text-yellow-600",
  },
  {
    title: "Active Projects",
    value: "18",
    change: "+3 from last month",
    icon: Activity,
    color: "text-purple-600",
  },
];

const recentProjects = [
  {
    id: 1,
    name: "E-commerce Dashboard",
    description: "Modern admin dashboard for e-commerce platform",
    status: "Published",
    views: 1234,
    stars: 45,
    lastUpdated: "2 days ago",
    image: "/placeholder.svg?height=80&width=120",
  },
  {
    id: 2,
    name: "Task Management App",
    description: "Collaborative task management with real-time updates",
    status: "Draft",
    views: 567,
    stars: 23,
    lastUpdated: "5 days ago",
    image: "/placeholder.svg?height=80&width=120",
  },
  {
    id: 3,
    name: "Weather Forecast Widget",
    description: "Beautiful weather widget with animations",
    status: "Published",
    views: 890,
    stars: 67,
    lastUpdated: "1 week ago",
    image: "/placeholder.svg?height=80&width=120",
  },
];

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your portfolio.
          </p>
        </div>
        <Button asChild>
          <Link to="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>
                  Your latest portfolio projects
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/projects">
                  View All
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.name}
                    className="w-20 h-12 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium break-words leading-tight">
                        {project.name}
                      </h3>
                      <Badge
                        variant={
                          project.status === "Published"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground break-words">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {project.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {project.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {project.lastUpdated}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link to="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Project
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link to="/analytics">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates and changes to your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">E-commerce Dashboard</span> was
                  published
                </p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">Task Management App</span>{" "}
                  received 5 new stars
                </p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">Weather Widget</span> reached
                  1,000 views
                </p>
                <p className="text-xs text-muted-foreground">1 week ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
// </merged_code>
