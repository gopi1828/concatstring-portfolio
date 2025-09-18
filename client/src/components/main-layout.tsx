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
  Building2,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../lib/api";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navigation: NavigationItem[] = [
  { name: "Users", href: "/dashboard/users", icon: UserPlus, adminOnly: true },
  { name: "Portfolio", href: "/dashboard", icon: FolderOpen },
  { name: "Categories", href: "/dashboard/categories", icon: Layers },
  { name: "Industries", href: "/dashboard/industries", icon: Building2 },
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

      const roleFromToken = (payload?.user?.role ??
        (Array.isArray(payload?.roles) ? payload.roles[0] : null)) as
        | string
        | null;
      if (typeof roleFromToken === "string") {
        detectedRole = roleFromToken;
      }

      const usernameFromToken = payload?.username || payload?.user?.username;
      if (typeof usernameFromToken === "string") {
        detectedUsername = usernameFromToken;
      }
    }
    if (!detectedRole && userData) {
      try {
        const parsed = JSON.parse(userData);

        const roleFromUser = (parsed?.role ??
          (Array.isArray(parsed?.roles) ? parsed.roles[0] : null)) as
          | string
          | null;
        if (typeof roleFromUser === "string") {
          detectedRole = roleFromUser;
        }
      } catch {
        console.error("userdata not found");
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
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setUsername(null);

        toast.success("Logged out");
        navigate("/");
      }
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="flex h-12 sm:h-14 lg:h-16 items-center justify-between border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-2">
        <div className="flex items-center justify-center">
          <img
            src="/frame.svg"
            alt="logo"
            className="h-6 w-auto sm:h-8 lg:h-12"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden h-6 w-6 sm:h-8 sm:w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
      <nav className="flex-1 px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6">
        <ul className="space-y-1 sm:space-y-2">
          {navigation
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 max-w-[2500px] mx-auto">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 [&>button]:hidden">
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
          <div className="flex h-12 sm:h-14 lg:h-16 items-center justify-between px-2 sm:px-4 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
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
                  <div className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-sm sm:text-base lg:text-lg select-none">
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
              <DropdownMenuContent
                className="w-48 sm:w-56"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs sm:text-sm font-medium leading-none">
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
                  <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600"
                  onClick={logOut}
                >
                  <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-2 sm:p-4 lg:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
}
