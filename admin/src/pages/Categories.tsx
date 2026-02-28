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
import type { Category } from "@/lib/type";
import { categorySchema } from "@/lib/validation";
import authStore from "@/store/useAuthStore";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/ui/ImageUpload";
import { toast } from "sonner";
import { AxiosError } from "axios";

type FormData = z.infer<typeof categorySchema>;

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false);
  const [isEditModelOpen, setIsEditModelOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [formLoading, setFormLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = authStore();
  const isAdmin = checkIsAdmin();

  const addForm = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      image: "",
      categoryType: "Featured",
    },
  });

  const editForm = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      image: "",
      categoryType: "Featured",
    },
  });

  const fetchCategories=async()=>{
    setLoading(true)
    try {
      const response=await axiosPrivate.get("/categories",{
        params:{page,perPage,sortOrder}
      })
      // console.log(response);
      setCategories(response?.data?.category || [])
      setTotal(response.data.total || 0)
      setTotalPages(response.data.totalPages || 0)
    } catch (error) {
      console.log("Failed to load categories", error);
      toast.error("Failed to load categories");
    }finally{
      setLoading(false)
    }
  }

    const handleRefresh=async()=>{
    setRefreshing(true)
    try {
      const response=await axiosPrivate.get("/categories",{
        params:{page,perPage,sortOrder}
      })
      // console.log(response);
      setCategories(response?.data?.category || [])
      setTotal(response.data.total || 0)
      setTotalPages(response.data.totalPages || 0)
    } catch (error) {
      console.log("Failed to refresh categories", error);
      toast.error("Failed to refresh categories");
    }finally{
      setRefreshing(false)
    }
  }

  const handleAddCategory=async(data:FormData)=>{
    setFormLoading(true)
    try {
      await axiosPrivate.post("/categories",data)
      toast.success("Category added successfully!")
      addForm.reset()
      setIsAddModelOpen(false)
      setPage(1)
      fetchCategories()
    } catch (error) {
      console.log("Failed to create categories");
      let errorMessage="Failed to create categories"
      if(error instanceof AxiosError && error?.response?.data?.message){
        errorMessage=error.response.data.message
      }
      if(errorMessage.includes("already exists")){
        addForm.setError("name",{type:"manual",message:errorMessage })
      }else{
        toast.error(errorMessage)
      }
    }finally{
      setFormLoading(false)
    }
  }

  const handleUpdateCategory=async(data:FormData)=>{ 
    if(!selectedCategory) return 

    setFormLoading(true)
    try {
      await axiosPrivate.put(`/categories/${selectedCategory._id}`,data)
      toast.success("Category update successfully!")
      setIsEditModelOpen(false)
      fetchCategories()
    } catch (error) {
       console.log("Failed to update categories");
      let errorMessage="Failed to update categories"
      if(error instanceof AxiosError && error?.response?.data?.message){
        errorMessage=error.response.data.message
      }
      if(errorMessage.includes("already exists")){
        addForm.setError("name",{type:"manual",message:errorMessage })
      }else{
        toast.error(errorMessage)
      }
    }finally{
      setFormLoading(false)
    }
  }

  const handleDeleteCategory=async()=>{
    if(!selectedCategory) return
    try {
      setFormLoading(true)
      await axiosPrivate.delete(`/categories/${selectedCategory._id}`)
      toast.success("Category delete successfully!")
      setIsDeleteModelOpen(false)
      fetchCategories()
    } catch (error) {
      console.log("Failed to delete categories", error);
      toast.error("Failed to delete categories");
    }finally{
      setFormLoading(false)
    }
  }

  const handleSortChange=(newSortOrder:"asc"| "desc")=>{
    setSortOrder(newSortOrder)
    setPage(1)
  }

  const handleEdit=(category:Category)=>{
    setSelectedCategory(category)
    editForm.reset({
      name:category.name || "",
      categoryType:category.categoryType ,
      image:category.image || "",
    })
    setIsEditModelOpen(true)
  }
  const handleDelete=(category:Category)=>{
    setSelectedCategory(category)
    setIsDeleteModelOpen(true)
  }
  const handlePreviousPage=()=>{
    if(page>1){
      setPage(page-1)
    }
  }

  const handleNextPage=()=>{
    if(page<totalPages){
      setPage(page+1)
    }
  }
  useEffect(()=>{
    fetchCategories()
  },[page,sortOrder])
  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-end  gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm font-medium ">
            Total <span className="font-bold">{total}</span>{" "}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant={"outline"}
            disabled={refreshing}
            onClick={handleRefresh}
            className=" hover:bg-indigo-50"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Select value={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40  bg-background text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc" className="flex items-center">
                <span className="flex items-center">
                  <ArrowUp className="mr-2 h-4 w-4" /> Ascending
                </span>
              </SelectItem>
              <SelectItem value="desc" className="flex items-center">
                <span className="flex items-center">
                  <ArrowDown className="mr-2 h-4 w-4" /> Descending
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button onClick={() => setIsAddModelOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          )}
        </div>
      </div>
      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      {category.image ? (
                        <div className="h-12 w-12 rounded overflow-hidden b-muted">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center ">
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                          className=" hover:bg-blue-50 hover:text-blue-600 flex-shrink-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category)}
                          className=" hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4 " />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow className="hover:bg-gray-100">
                    <TableCell
                      colSpan={isAdmin ? 4 : 3}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No Categories Available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* // Pagination Control */}
          {total > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1} to{" "}
                {Math.min(page * perPage, total)} of {total} categories
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={"outline"}
                  size={"sm"}
                  disabled={page===1}
                  onClick={handlePreviousPage}
                  className="cursor-pointer "
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
                <Button
                  variant={"outline"}
                  size={"sm"}
                  onClick={handleNextPage}
                  disabled={page===totalPages}
                  className="cursor-pointer "
                >
                  <ChevronRight className="h-4 w-4 ml-2" /> Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Add Category Model */}{" "}
      <Dialog open={isAddModelOpen} onOpenChange={setIsAddModelOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new category.</DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddCategory)}
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
                          placeholder="Enter category name..."
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
                name="categoryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Type</FormLabel>
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
                        <SelectItem value="Featured">Featured</SelectItem>
                        <SelectItem value="Hot Categories">Hot Categories</SelectItem>
                        <SelectItem value="Top Categories">
                          Top Categories
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Image(Optional)</FormLabel>
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
                    "Create Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Edit Category Modal */}
      <Dialog open={isEditModelOpen} onOpenChange={setIsEditModelOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdateCategory)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="categoryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={formLoading}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="" disabled>
                          Select a category type
                        </option>
                        <option value="Featured">Featured</option>
                        <option value="Hot Categories">Hot Categories</option>
                        <option value="Top Categories">Top Categories</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Image (Optional)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModelOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <Dialog open={isDeleteModelOpen} onOpenChange={setIsDeleteModelOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              category{" "}
              <span className="font-semibold">{selectedCategory?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModelOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              onClick={handleDeleteCategory}
              className="bg-red-500 hover:bg-red-700"
            >
              {formLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
