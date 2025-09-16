import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { AddUserModal } from "../components/add-user-modal";
import {
  Search,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { ConfirmDialog } from "./ui/confirm-delete";
import { Skeleton } from "./ui/skeleton";
import api from "../lib/api";
import { toast } from "react-hot-toast";

type UserItem = {
  _id: string;
  name: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

const TableSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead>Name</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="w-20">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(6)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-32 mb-2" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16 rounded-full" />
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);


export function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [usernameToDelete, setUsernameToDelete] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const itemsPerPage = 10;

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

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/auth/users", {
        headers: {
          "Cache-Control": "no-store",
        },
      });

      const data = response.data;
      const userList = Array.isArray(data) ? data : data.result || [];
      setUsers(userList);
    } catch (error) {
      toast.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let detectedRole: string | null = null;

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
    }

    if (!detectedRole) {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log("111",user);
          
          const roleFromUser = (user?.role ??
            user?.user?.role ??
            user?.data?.role ??
            (Array.isArray(user?.roles) ? user.roles[0] : null)) as
            | string
            | null;
          if (typeof roleFromUser === "string") {
            detectedRole = roleFromUser;
          }
        } catch {
          detectedRole = null;
        }
      }
    }

    setUserRole(detectedRole ? detectedRole.toUpperCase() : null);
    const hasUserData = !!localStorage.getItem("user");
    setIsLoggedIn(!!token || hasUserData);
  }, []);

  const isAdmin = (userRole ?? "").toUpperCase() === "ADMIN";

  // Callback function to refresh data when user is added
  const handleUserAdded = () => {
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    const user = users.find(u => u._id === id);
    setUserToDelete(id);
    setUsernameToDelete(user?.username || null);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await api.delete(`/api/auth/users/${userToDelete}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = response.data;

      if (result?.success === false) {
        throw new Error(result.error || "Delete operation failed");
      }

      setUsers((prev) =>
        prev.filter((user) => user._id !== userToDelete)
      );
      toast.success("User deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      setUsernameToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
    setUsernameToDelete(null);
  };

  const filteredUsers = users.filter((user) => {
    const name = user.name?.toLowerCase() || "";
    const username = user.username?.toLowerCase() || "";
    const role = user.role?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return (
      name.includes(search) ||
      username.includes(search) ||
      role.includes(search)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-50 text-red-700";
      case "user":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const TableView = () => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            {isLoggedIn && isAdmin && <TableHead className="w-20">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.map((user) => (
            <TableRow key={user._id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="font-medium text-gray-900">
                    {user.name}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600">
                  @{user.username}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={getRoleBadgeColor(user.role)}
                >
                  {user.role.toUpperCase()}
                </Badge>
              </TableCell>
              {isLoggedIn && isAdmin && (
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-600"
                      onClick={() => handleDelete(user._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>

        {/* Skeleton Loader */}
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts</p>
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn && isAdmin && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Content */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {users.length === 0
              ? "No users found."
              : "No users match your search."}
          </div>
        </div>
      ) : (
        <TableView />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {/* Previous */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {/* Page Numbers */}
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                    isActive={currentPage === i + 1}
                    size="icon"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onUserAdded={handleUserAdded}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete User"
        description={`Are you sure you want to delete the user "${usernameToDelete || 'Unknown'}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
