import UserSkeleton from "@/components/skeleton/UserSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { userSchema } from "@/lib/validation";
import authStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { motion } from "framer-motion";
import ImageUpload from "@/components/ui/ImageUpload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

type FormData = z.infer<typeof userSchema>;

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [isViewModelOpen, setIsViewModelOpen] = useState(false);
  const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false);
  const [isEditModelOpen, setIsEditModelOpen] = useState(false);
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

  const addForm = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      avatar: "",
    },
  });

  const editForm = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      avatar: "",
    },
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get("/users");
      console.log("res", response.data);
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
    // setLoading(true)
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
      // setLoading(false)
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchMatches =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const searchRoles = roleFilter === "all" || user.role === roleFilter;

    return searchMatches && searchRoles;
  });

  const handleAddUser = async (data: FormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.post("/users", data);
      toast.success("User Created Successfully!");
      addForm.reset();
      setIsAddModelOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Failed to create new user", error);
      toast.error("Failed to create new user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (data: FormData) => {
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      await axiosPrivate.put(`/users/${selectedUser._id}`, data);
      console.log("SUBMIT DATA:", data);
      toast.success("User Updated Successfully!");
      setIsEditModelOpen(false);
      fetchUsers();
    } catch (error) {
      console.log("Failed to update user", error);
      toast.error("Failed to update user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await axiosPrivate.delete(`/users/${selectedUser._id}`);
      toast.success("User Delete Successfully!");
      setIsDeleteModelOpen(false);
      fetchUsers();
    } catch (error) {
      console.log("Failed to delete user", error);
      toast.error("Failed to delete user");
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
    setIsEditModelOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModelOpen(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewModelOpen(true);
  };

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

  if (loading) {
    return (
      <div>
        <UserSkeleton isAdmin={isAdmin} />
      </div>
    );
  }
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
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setIsAddModelOpen(true)}
            >
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
                        onClick={() => handleView(user)}
                        title="View User Details!"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant={"ghost"}
                            size={"icon"}
                            onClick={() => handleEdit(user)}
                            title="Edit User Details!"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={"ghost"}
                            size={"icon"}
                            onClick={() => handleDelete(user)}
                            title="Delete User Details!"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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
      {/* Add User Model */}{" "}
      <Dialog open={isAddModelOpen} onOpenChange={setIsAddModelOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account.</DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddUser)}
              className="space-y-6 mt-4"
            >
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          placeholder="Enter your name..."
                          disabled={loading}
                          {...field}
                          className="border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duartion-200"
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          placeholder="Enter your email..."
                          type="email"
                          disabled={loading}
                          {...field}
                          className="border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duartion-200"
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          placeholder="Enter your password..."
                          type="password"
                          disabled={loading}
                          {...field}
                          className="border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duartion-200"
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="deliveryman">
                          Delivery Person
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <FormControl>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ImageUpload
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          disabled={formLoading}
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModelOpen(false)}
                  disabled={formLoading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                  {formLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Edit User Model */}
      <Dialog open={isEditModelOpen} onOpenChange={setIsEditModelOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update User</DialogTitle>
            <DialogDescription>Update User Information.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdateUser)}
              className="space-y-6 mt-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          placeholder="Enter your name..."
                          disabled={loading}
                          {...field}
                          className="border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duartion-200"
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          placeholder="Enter your email..."
                          type="email"
                          disabled={loading}
                          {...field}
                          className="border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duartion-200"
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="deliveryman">
                          Delivery Person
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <FormControl>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ImageUpload
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          disabled={formLoading}
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModelOpen(false)}
                  disabled={formLoading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                  {formLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update User"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Delete User Model */}
      <AlertDialog open={isDeleteModelOpen} onOpenChange={setIsDeleteModelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">{selectedUser?.name}</span>'s
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* View User Dialog */}
      <Dialog open={isViewModelOpen} onOpenChange={setIsViewModelOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View complete user information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-indigo-600 font-semibold shadow-sm overflow-hidden">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt="Image"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{selectedUser.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <Badge className={cn("capitalize mt-2",getRoleColor(selectedUser.role))}>{selectedUser.role}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-20">
                <div>
                  <Label className="text-sm font-medium text-gray-600">User ID</Label>
                  <p className="text-lg font-medium">{selectedUser._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600" >Created At</Label>
                  <p className="text-lg font-medium">{new Date(selectedUser.createdAt).toDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
