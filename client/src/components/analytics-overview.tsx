"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Star,
  Users,
  Globe,
  Calendar,
} from "lucide-react";

const metrics = [
  {
    title: "Total Views",
    value: "45,231",
    change: "+12.5%",
    trend: "up",
    icon: Eye,
    description: "vs last month",
  },
  {
    title: "Unique Visitors",
    value: "12,543",
    change: "+8.2%",
    trend: "up",
    icon: Users,
    description: "vs last month",
  },
  {
    title: "Total Stars",
    value: "1,247",
    change: "-2.1%",
    trend: "down",
    icon: Star,
    description: "vs last month",
  },
  {
    title: "Countries",
    value: "34",
    change: "+5",
    trend: "up",
    icon: Globe,
    description: "new countries",
  },
];

const topProjects = [
  { name: "E-commerce Dashboard", views: 12543, change: "+15%" },
  { name: "Portfolio Website", views: 8921, change: "+8%" },
  { name: "Task Management App", views: 6754, change: "+22%" },
  { name: "Weather Widget", views: 4532, change: "-3%" },
  { name: "Chat Application", views: 3210, change: "+45%" },
];

const recentActivity = [
  {
    project: "E-commerce Dashboard",
    action: "New view from United States",
    time: "2 minutes ago",
  },
  {
    project: "Portfolio Website",
    action: "Starred by user",
    time: "5 minutes ago",
  },
  {
    project: "Task Management App",
    action: "New view from Germany",
    time: "8 minutes ago",
  },
  {
    project: "Weather Widget",
    action: "Shared on social media",
    time: "12 minutes ago",
  },
  {
    project: "Chat Application",
    action: "New view from Canada",
    time: "15 minutes ago",
  },
];

export function AnalyticsOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your portfolio performance and engagement metrics
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {metric.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }
                >
                  {metric.change}
                </span>
                <span className="text-muted-foreground">
                  {metric.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Projects */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Projects</CardTitle>
            <CardDescription>
              Projects with the most views this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProjects.map((project, index) => (
                <div
                  key={project.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      project.change.startsWith("+") ? "default" : "destructive"
                    }
                  >
                    {project.change}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest interactions with your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.project}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>
              Where your visitors are coming from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Direct</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-3/5 h-full bg-primary"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">60%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Search Engines</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-blue-500"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">25%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Social Media</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-2/12 h-full bg-green-500"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">10%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Referrals</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-1/20 h-full bg-yellow-500"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Top countries by visitor count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { country: "United States", visitors: "4,231", flag: "🇺🇸" },
                { country: "Germany", visitors: "2,543", flag: "🇩🇪" },
                { country: "United Kingdom", visitors: "1,876", flag: "🇬🇧" },
                { country: "Canada", visitors: "1,234", flag: "🇨🇦" },
                { country: "France", visitors: "987", flag: "🇫🇷" },
              ].map((item) => (
                <div
                  key={item.country}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.flag}</span>
                    <span className="text-sm">{item.country}</span>
                  </div>
                  <span className="text-sm font-medium">{item.visitors}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
