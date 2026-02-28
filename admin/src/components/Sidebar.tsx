import authStore from "@/store/useAuthStore";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Tag,
  User,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { NavLink, useLocation } from "react-router";

type SlidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

type NavItemsProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  pathname: string;
  open: boolean;
  end?: boolean;
};

const NavigationsItems = [
  { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard", end: true },
  { to: "/dashboard/accounts", icon: <User size={20} />, label: "Accounts" },
  { to: "/dashboard/users", icon: <Users />, label: "Users" },
  { to: "/dashboard/orders", icon: <Package size={20} />, label: "Orders" },
  { to: "/dashboard/invoices", icon: <FileText size={20} />, label: "Invoices" },
  { to: "/dashboard/banners", icon: <Layers size={20} />, label: "Banners" },
  { to: "/dashboard/products", icon: <ShoppingBag size={20} />, label: "Products" },
  { to: "/dashboard/categories", icon: <Tag size={20} />, label: "Categories" },
  { to: "/dashboard/brands", icon: <Bookmark size={20} />, label: "Brands" },
];

const Sidebar = ({ open, setOpen }: SlidebarProps) => {
  const { user, logout } = authStore();
  const { pathname } = useLocation();

  return (
    
    <motion.aside
  className={cn(
    "fixed inset-y-0 left-0 z-20 flex flex-col border-r border-gray-800 min-h-screen bg-black",
    open ? "w-64" : "w-20",
  )}
  initial={{ width: open ? 256 : 80 }}
  animate={{ width: open ? 256 : 80 }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
  
>
  {/* Header */}
  <div className="flex items-center justify-center p-4 h-16 border-b border-gray-800 gap-2 bg-gray-900 text-gray-100 shadow-sm">
    <motion.div
      className={cn("flex items-center overflow-hidden", open ? "w-auto opacity-100" : "w-0 opacity-0")}
      initial={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
      animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
      transition={{ duration: 0.2 }}
    >
      <span className="font-bold text-xl text-gray-100 drop-shadow-md"> 🧸 Dashboard Admin</span>
    </motion.div>

    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="rounded-full bg-gray-700/30 hover:bg-gray-600 text-gray-100 border border-gray-800"
      >
        <motion.div animate={{ rotate: open ? 0 : 180 }} transition={{ duration: 0.3 }}>
          {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </motion.div>
      </Button>
    </motion.div>
  </div>

  {/* Nav Items */}
  <div className="flex-1 flex flex-col overflow-y-auto p-3 gap-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
    {NavigationsItems?.map((item) => (
      <NavItems
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            open={open}
            end={item.end}
            pathname={pathname}
          />
    ))}
  </div>

  {/* Logout */}
  <div className="p-4 border-t border-gray-800 bg-gray-900">
    <motion.div className={cn("flex items-center gap-3 mb-4", open ? "justify-start" : "justify-center")} 
    initial={{opacity:0,y:10}}
    animate={{opacity:1,y:0}}
    transition={{duration:0.3 ,delay:0.2}}>
      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-100 font-bold shadow-md ring-2 ring-gray-500/40">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="rounded-full object-cover h-full w-full" />
        ) : (
          user?.name.charAt(0).toUpperCase()
        )}
      </div>
      <AnimatePresence>
      {open && (
        <motion.div
         initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -10 }}
                 transition={{ duration: 0.2 }} className="flex flex-col gap-1">
          <span className="text-sm text-gray-100 font-semibold capitalize truncate max-w-[150px]">{user?.name}</span>
          <span className="text-xs text-gray-400 capitalize font-medium">{user?.role}</span>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>

    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button variant="outline" size={open ? "default" : "icon"} onClick={logout} className="border-gray-600 text-black hover:bg-gray-700 hover:text-indigo-400 w-full rounded-xl">
        <LogOut size={16} className={cn("mr-2", !open && "mr-0")} />
        {open && "Logout"}
      </Button>
    </motion.div>
  </div>
</motion.aside>

  );
};

const NavItems = ({ to, icon, label, open, pathname, end = false }: NavItemsProps) => {
  return (
    <NavLink
      to={to}
      end={end}
     className={cn(
          "flex items-center p-3 rounded-xl text-sm font-medium gap-3 overflow-hidden text-gray-400 hover:bg-gray-800 hover:text-gray-100",
          pathname === to ? "bg-gray-800 text-indigo-400 shadow-lg" : "",
        )}
    >
      <span>{icon}</span>
      {open && label}
    </NavLink>
  );
};

export default Sidebar;

