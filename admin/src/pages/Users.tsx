import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type { User } from "@/lib/type";
import { cn } from "@/lib/utils";
import authStore from "@/store/useAuthStore";
import {
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addModelOpen, isAddModelOpen] = useState(false);
  const [viewModelOpen, isViewModelOpen] = useState(false);
  const [deleteModelOpen, isDeleteModelOpen] = useState(false);
  const [editModelOpen, isEditModelOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = authStore();
  const isAdmin = checkIsAdmin();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get("/users");
      // console.log("res",response.data.users.length)
      if (response?.data) {
        setUsers(response?.data?.users);
        setTotal(response?.data?.users.length);
      }
    } catch (error) {
      console.log("Failed to load users", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    setRefreshing(true);
    try {
      const response = await axiosPrivate.get("/users");
      console.log(response);
      if (response?.data) {
        setUsers(response?.data?.users);
        setTotal(response?.data?.users.length);
      }
    } catch (error) {
      console.log("Failed to load users", error);
      toast.error("Failed to load users");
    } finally {
      setRefreshing(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchMatches =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const searchRoles = roleFilter === "all" || user.role === roleFilter;

    return searchMatches && searchRoles;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "deliveryman":
        return "bg-indigo-100 text-indigo-800";
      case "user":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-0.5">
            View and Manage all system users
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users2 className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-indigo-600">{total}</span>
          </div>
          <Button
            variant={"outline"}
            disabled={refreshing}
            onClick={refreshUsers}
            className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          {isAdmin && (
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </div>
      </div>
      {/* Filter */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              placeholder="Search Users......"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by role.." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="deliveryman">Delivery Person</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* User Table  */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="font-semibold">Avatar</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Created At</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user._id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center  justify-center text-indigo-600 font-semibold shadow-sm overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn("capitalize", getRoleColor(user.role))}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={"ghost"}
                        size={"icon"}
                        title="View User Details!"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant={"ghost"}
                            size={"icon"}
                            title="Edit User Details!"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={"ghost"}
                            size={"icon"}
                            title="Delete User Details!"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Users2 className="h-12 w-12 text-gray-400" />
                    <div className="">
                      <p className="text-lg font-medium text-gray-900">
                        No Users Found
                      </p>
                      <p className="text-sm text-gray-500">
                        {searchTerm || roleFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Users will appear here when they register"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Add User Model */}
      {/* Edit User Model */}
      {/* Delete User Model */}
    </div>
  );
};

export default Users;
