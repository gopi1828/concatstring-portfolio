import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import {
  UserPlus,
  FolderOpen,
  Tag,
  Menu,
  LogOut,
  Edit,
  Layers,
  Code2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../lib/api";

const navigation = [
  { name: "Add User", href: "/dashboard/register", icon: UserPlus },
  { name: "Portfolio", href: "/dashboard", icon: FolderOpen },
  { name: "Categories", href: "/dashboard/categories", icon: Layers },
  { name: "Technologies", href: "/dashboard/technologies", icon: Code2 },
  { name: "Tags", href: "/dashboard/tags", icon: Tag },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const decodeJwtPayload = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }

    let detectedRole: string | null = null;
    let detectedUsername: string | null = null;
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwtPayload(token);

      const roleFromToken = (payload?.role ??
        payload?.user?.role ??
        (Array.isArray(payload?.roles) ? payload.roles[0] : null)) as
        | string
        | null;
      if (typeof roleFromToken === "string") {
        detectedRole = roleFromToken;
      }

      // Extract username from token
      const usernameFromToken = payload?.username || payload?.user?.username;
      if (typeof usernameFromToken === "string") {
        detectedUsername = usernameFromToken;
      }
    }
    if (!detectedRole && userData) {
      try {
        const parsed = JSON.parse(userData);
        const roleFromUser = (parsed?.role ??
          parsed?.user?.role ??
          parsed?.data?.role ??
          (Array.isArray(parsed?.roles) ? parsed.roles[0] : null)) as
          | string
          | null;
        if (typeof roleFromUser === "string") {
          detectedRole = roleFromUser;
        }
      } catch {
        // ignore
      }
    }
    setUserRole(detectedRole ? detectedRole.toUpperCase() : null);
    setUsername(detectedUsername);
  }, []);

  const isAdmin = (userRole ?? "").toUpperCase() === "ADMIN";

  const logOut = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      const response = await api.get("/api/auth/logout");
      if (response.status === 200) {
        // Remove all auth-related data from local storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("selectedUserId");

        // Clear user state so UI updates immediately
        setUser(null);
        setUsername(null);

        // Redirect
        toast.success("Logged out");
        navigate("/");
      }
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">
            Portfolio Admin
          </span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {(isAdmin
            ? navigation
            : navigation.filter((item) => item.name !== "Add User")
          ).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          </SheetHeader>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1 lg:flex-none" />

            <DropdownMenu onOpenChange={setIsProfileDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`relative p-0 rounded-full hover:bg-gray-100 focus:outline-none ${
                    isProfileDropdownOpen
                      ? "ring-2 ring-black ring-offset-2"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-lg select-none">
                    {(() => {
                      const displayChar =
                        username?.[0]?.toUpperCase() ||
                        user?.username?.[0]?.toUpperCase() ||
                        user?.name?.[0]?.toUpperCase() ||
                        "U";
                      return displayChar;
                    })()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/dashboard/edit-user")}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600"
                  onClick={logOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
