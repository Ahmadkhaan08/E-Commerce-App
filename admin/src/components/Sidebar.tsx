// // import authStore from "@/store/useAuthStore";
// // import {
// //   Bookmark,
// //   ChevronLeft,
// //   ChevronRight,
// //   FileText,
// //   Layers,
// //   LayoutDashboard,
// //   LogOut,
// //   Package,
// //   ShoppingBag,
// //   Tag,
// //   User,
// //   Users,
// // } from "lucide-react";
// // import { AnimatePresence, motion } from "framer-motion";
// // import { cn } from "@/lib/utils";
// // import { Button } from "./ui/button";
// // import { NavLink, useLocation } from "react-router";

// // type SlidebarProps = {
// //   open: boolean;
// //   setOpen: (open: boolean) => void;
// // };

// // type NavItemsProps = {
// //   to: string;
// //   icon: React.ReactNode;
// //   label: string;
// //   pathname:string;
// //   open: boolean;
// //   end?: boolean;
// // };

// // const NavigationsItems = [
// //   {
// //     to: "/dashboard",
// //     icon: <LayoutDashboard size={20} />,
// //     label: "Dashboard",
// //     end: true,
// //   },
// //   {
// //     to: "/dashboard/accounts",
// //     icon: <User size={20} />,
// //     label: "Accounts",
// //   },
// //   {
// //     to: "/dashboard/users",
// //     icon: <Users />,
// //     label: "Users",
// //   },
// //   {
// //     to: "/dashboard/orders",
// //     icon: <Package size={20} />,
// //     label: "Orders",
// //   },
// //   {
// //     to: "/dashboard/invoices",
// //     icon: <FileText size={20} />,
// //     label: "Invoices",
// //   },
// //   {
// //     to: "/dashboard/banners",
// //     icon: <Layers size={20} />,
// //     label: "Banners",
// //   },
// //   {
// //     to: "/dashboard/products",
// //     icon: <ShoppingBag size={20} />,
// //     label: "Products",
// //   },
// //   {
// //     to: "/dashboard/categories",
// //     icon: <Tag size={20} />,
// //     label: "Categories",
// //   },
// //   {
// //     to: "/dashboard/brands",
// //     icon: <Bookmark size={20} />,
// //     label: "Brands",
// //   },
// // ];
// // const Sidebar = ({ open, setOpen }: SlidebarProps) => {
// //   const { user, logout } = authStore();
// //   const { pathname } = useLocation();
// //   return (
// //     <motion.aside
// //       className={cn(
// //         "fixed inset-y-0 left-0 z-20 flex flex-col border-r border-r-slate-800/50 hoverEffect min-h-screen w-64",
// //         open ? "w-64" : "w-20",
// //       )}
// //       initial={{ width: open ? 256 : 80 }}
// //       animate={{ width: open ? 256 : 80 }}
// //       transition={{ duration: 0.3, ease: "easeInOut" }}
// //     >
// //       <div className="flex items-center justify-center p-4 h-16 border-b border-slate-600/50 gap-2  bg-black  text-white">
// //         <motion.div
// //           className={cn(
// //             "flex items-center overflow-hidden",
// //             open ? "w-auto opacity-100" : "w-0 opacity-0",
// //           )}
// //           initial={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
// //           animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
// //           transition={{ duration: 0.2 }}
// //         >
// //           <span className="font-bold text-xl text-white drop-shadow-lg">
// //             BabyMall Admin{" "}
// //           </span>
// //         </motion.div>
// //         <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
// //           <Button
// //             variant="ghost"
// //             size="icon"
// //             onClick={() => setOpen(!open)}
// //             className="rounded-full bg-white/30 hover:text-black hover:bg-white text-white/90 border backdrop-blur-sm "
// //           >
// //             <motion.div
// //               animate={{ rotate: open ? 0 : 180 }}
// //               transition={{ duration: 0.3 }}
// //             >
// //               {open ? (
// //                 <ChevronLeft size={20} />
// //               ) : (
// //                 <ChevronRight className="rotate-180" size={20} />
// //               )}
// //             </motion.div>
// //           </Button>
// //         </motion.div>
// //       </div>
// //       {/* Sidebar */}
// //       <div className="flex flex-col gap-1 flex-1 p-3 ">
// //         {NavigationsItems?.map((item) => (
// //           <NavItems 
// //           key={item?.to}
// //           to={item.to}
// //           icon={item.icon}
// //           label={item.label}
// //           open={open}
// //           end={item.end}
// //           pathname={pathname}
// //           />
// //         ))}
// //       </div>
// //       {/* Logout */}
// //       <div className="p-4 border-t border-slate-600/50 bg-gray-200 ">
// //         <motion.div
// //           className={cn(
// //             "flex items-center gap-3 mb-4",
// //             open ? "justify-start" : "justify-center",
// //           )}
// //           initial={{ opacity: 0, y: 10 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.3, delay: 0.2 }}
// //         >
// //           <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#29beb3] to-[#a96bde] flex items-center justify-center text-white font-semibold overflow-hidden shadow-lg ring-2 ring-white/20">
// //             {user?.avatar ? (
// //               <img
// //                 src={user.avatar}
// //                 alt={user.name}
// //                 className="rounded-full object-cover h-full w-full"
// //               />
// //             ) : (
// //               user?.name.charAt(0).toUpperCase()
// //             )}
// //           </div>

// //           <AnimatePresence>
// //             {open && (
// //               <motion.div
// //                 initial={{ opacity: 0, x: -10 }}
// //                 animate={{ opacity: 1, x: 0 }}
// //                 exit={{ opacity: 0, x: -10 }}
// //                 transition={{ duration: 0.2 }}
// //                 className="flex flex-col gap-2"
// //               >
// //                 <span className="text-sm  capitalize text-white font-medium truncate bg-slate-700/50 px-2 py-1 rounded-full backdrop-blur-sm max-w-[150px]">
// //                   {user?.name}
// //                 </span>
// //                 <span className="text-xs  text-[#29beb3] capitalize font-medium bg-slate-700/50 px-2 py-1 rounded-full backdrop-blur-sm">
// //                   {user?.role}
// //                 </span>
// //               </motion.div>
// //             )}
// //           </AnimatePresence>
// //         </motion.div>

// //         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
// //           <Button
// //             variant={"outline"}
// //             size={open ? "default" : "icon"}
// //             onClick={logout}
// //           >
// //             <LogOut size={16} className={cn("mr-2", !open && "mr-0")} />
// //             {open && "Logout"}
// //           </Button>
// //         </motion.div>
// //       </div>
// //     </motion.aside>
// //   );
// // };

// // const NavItems = ({
// //   to,
// //   icon,
// //   label,
// //   open, pathname,
// //   end = false,
 
// // }: NavItemsProps) => {
// //   return (
// //     <NavLink
// //       to={to}
// //       end={end}
// //       className={cn(
// //         "flex items-center p-3 rounded-xl text-sm font-medium hoverEffect gap-3 overflow-hidden text-white/80 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:shadow-lg hover:backdrop-blur-sm",
// //         pathname === to
// //           ? "bg-gradient-to-r from-[#29beb3]/20 to-[#a96bde]/20 text-white shadow-lg shadow-[#29beb3]/20 scale-105 ring-1 ring-[#29beb3]/30 border border-white/10 backdrop-blur-sm"
// //           : "text-slate-300 hover:scale-102",
// //       )}
// //     >
// //       <span>{icon}</span>
// //       {open && label}
// //     </NavLink>
// //   );
// // };
// // export default Sidebar;


// import authStore from "@/store/useAuthStore";
// import {
//   Bookmark,
//   ChevronLeft,
//   ChevronRight,
//   FileText,
//   Layers,
//   LayoutDashboard,
//   LogOut,
//   Package,
//   ShoppingBag,
//   Tag,
//   User,
//   Users,
// } from "lucide-react";
// import { AnimatePresence, motion } from "framer-motion";
// import { cn } from "@/lib/utils";
// import { Button } from "./ui/button";
// import { NavLink, useLocation } from "react-router";

// type SlidebarProps = {
//   open: boolean;
//   setOpen: (open: boolean) => void;
// };

// type NavItemsProps = {
//   to: string;
//   icon: React.ReactNode;
//   label: string;
//   pathname: string;
//   open: boolean;
//   end?: boolean;
// };

// const NavigationsItems = [
//   { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard", end: true },
//   { to: "/dashboard/accounts", icon: <User size={20} />, label: "Accounts" },
//   { to: "/dashboard/users", icon: <Users />, label: "Users" },
//   { to: "/dashboard/orders", icon: <Package size={20} />, label: "Orders" },
//   { to: "/dashboard/invoices", icon: <FileText size={20} />, label: "Invoices" },
//   { to: "/dashboard/banners", icon: <Layers size={20} />, label: "Banners" },
//   { to: "/dashboard/products", icon: <ShoppingBag size={20} />, label: "Products" },
//   { to: "/dashboard/categories", icon: <Tag size={20} />, label: "Categories" },
//   { to: "/dashboard/brands", icon: <Bookmark size={20} />, label: "Brands" },
// ];

// const Sidebar = ({ open, setOpen }: SlidebarProps) => {
//   const { user, logout } = authStore();
//   const { pathname } = useLocation();

//   return (
//     <motion.aside
//       className={cn(
//         "fixed inset-y-0 left-0 z-20 flex flex-col border-r border-pink-200 hoverEffect min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50",
//         open ? "w-64" : "w-20",
//       )}
//       initial={{ width: open ? 256 : 80 }}
//       animate={{ width: open ? 256 : 80 }}
//       transition={{ duration: 0.3, ease: "easeInOut" }}
//     >
//       <div className="flex items-center justify-center p-4 h-16 border-b border-pink-200 gap-2 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 text-white">
//         <motion.div
//           className={cn("flex items-center overflow-hidden", open ? "w-auto opacity-100" : "w-0 opacity-0")}
//           initial={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
//           animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
//           transition={{ duration: 0.2 }}
//         >
//           <span className="font-bold text-xl text-white drop-shadow-md">
//             BabyMall Admin
//           </span>
//         </motion.div>

//         <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setOpen(!open)}
//             className="rounded-full bg-white/40 hover:text-pink-600 hover:bg-white text-pink-700 border backdrop-blur-sm"
//           >
//             <motion.div animate={{ rotate: open ? 0 : 180 }} transition={{ duration: 0.3 }}>
//               {open ? <ChevronLeft size={20} /> : <ChevronRight className="rotate-180" size={20} />}
//             </motion.div>
//           </Button>
//         </motion.div>
//       </div>

//       {/* Sidebar */}
//       <div className="flex flex-col gap-1 flex-1 p-3">
//         {NavigationsItems.map((item) => (
//           <NavItems
//             key={item.to}
//             to={item.to}
//             icon={item.icon}
//             label={item.label}
//             open={open}
//             end={item.end}
//             pathname={pathname}
//           />
//         ))}
//       </div>

//       {/* Logout */}
//       <div className="p-4 border-t border-pink-200 bg-gradient-to-r from-pink-100 to-purple-100">
//         <motion.div
//           className={cn("flex items-center gap-3 mb-4", open ? "justify-start" : "justify-center")}
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3, delay: 0.2 }}
//         >
//           <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white/40">
//             {user?.avatar ? (
//               <img src={user.avatar} alt={user.name} className="rounded-full object-cover h-full w-full" />
//             ) : (
//               user?.name.charAt(0).toUpperCase()
//             )}
//           </div>

//           <AnimatePresence>
//             {open && (
//               <motion.div
//                 initial={{ opacity: 0, x: -10 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -10 }}
//                 transition={{ duration: 0.2 }}
//                 className="flex flex-col gap-2"
//               >
//                 <span className="text-sm capitalize text-pink-900 font-medium truncate bg-white/60 px-2 py-1 rounded-full backdrop-blur-sm max-w-[150px]">
//                   {user?.name}
//                 </span>
//                 <span className="text-xs text-purple-700 capitalize font-medium bg-white/60 px-2 py-1 rounded-full backdrop-blur-sm">
//                   {user?.role}
//                 </span>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </motion.div>

//         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//           <Button
//             variant={"outline"}
//             size={open ? "default" : "icon"}
//             onClick={logout}
//             className="border-pink-300 text-pink-700 hover:bg-pink-200 hover:text-pink-900"
//           >
//             <LogOut size={16} className={cn("mr-2", !open && "mr-0")} />
//             {open && "Logout"}
//           </Button>
//         </motion.div>
//       </div>
//     </motion.aside>
//   );
// };

// const NavItems = ({ to, icon, label, open, pathname, end = false }: NavItemsProps) => {
//   return (
//     <NavLink
//       to={to}
//       end={end}
//       className={cn(
//         "flex items-center p-3 rounded-xl text-sm font-medium hoverEffect gap-3 overflow-hidden text-pink-700 hover:bg-gradient-to-r hover:from-pink-200 hover:to-purple-200 hover:text-pink-900 hover:shadow-md hover:backdrop-blur-sm",
//         pathname === to
//           ? "bg-gradient-to-r from-pink-300/60 to-purple-300/60 text-pink-900 shadow-md ring-1 ring-pink-300 border border-white/30 backdrop-blur-sm scale-105"
//           : "text-pink-600 hover:scale-102",
//       )}
//     >
//       <span>{icon}</span>
//       {open && label}
//     </NavLink>
//   );
// };

// export default Sidebar;


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
  <div className="flex flex-col gap-1 flex-1 p-3">
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
    <motion.div className={cn("flex items-center gap-3 mb-4", open ? "justify-start" : "justify-center")}>
      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-100 font-bold shadow-md ring-2 ring-gray-500/40">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="rounded-full object-cover h-full w-full" />
        ) : (
          user?.name.charAt(0).toUpperCase()
        )}
      </div>
      {open && (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-100 font-semibold capitalize truncate max-w-[150px]">{user?.name}</span>
          <span className="text-xs text-gray-400 capitalize font-medium">{user?.role}</span>
        </div>
      )}
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


// import authStore from "@/store/useAuthStore";
// import {
//   Bookmark,
//   ChevronLeft,
//   ChevronRight,
//   FileText,
//   Layers,
//   LayoutDashboard,
//   LogOut,
//   Package,
//   ShoppingBag,
//   Tag,
//   User,
//   Users,
// } from "lucide-react";
// import { AnimatePresence, motion } from "framer-motion";
// import { cn } from "@/lib/utils";
// import { Button } from "./ui/button";
// import { NavLink, useLocation } from "react-router";

// type SlidebarProps = {
//   open: boolean;
//   setOpen: (open: boolean) => void;
// };

// type NavItemsProps = {
//   to: string;
//   icon: React.ReactNode;
//   label: string;
//   pathname: string;
//   open: boolean;
//   end?: boolean;
// };

// const NavigationsItems = [
//   { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard", end: true },
//   { to: "/dashboard/accounts", icon: <User size={20} />, label: "Accounts" },
//   { to: "/dashboard/users", icon: <Users />, label: "Users" },
//   { to: "/dashboard/orders", icon: <Package size={20} />, label: "Orders" },
//   { to: "/dashboard/invoices", icon: <FileText size={20} />, label: "Invoices" },
//   { to: "/dashboard/banners", icon: <Layers size={20} />, label: "Banners" },
//   { to: "/dashboard/products", icon: <ShoppingBag size={20} />, label: "Products" },
//   { to: "/dashboard/categories", icon: <Tag size={20} />, label: "Categories" },
//   { to: "/dashboard/brands", icon: <Bookmark size={20} />, label: "Brands" },
// ];

// const Sidebar = ({ open, setOpen }: SlidebarProps) => {
//   const { user, logout } = authStore();
//   const { pathname } = useLocation();

//   return (
//     <motion.aside
//       className={cn(
//         "fixed inset-y-0 left-0 z-20 flex flex-col border-r border-purple-800/40 min-h-screen bg-gradient-to-b from-[#0f0c1d] via-[#1a1433] to-[#1f1a3d]",
//         open ? "w-64" : "w-20",
//       )}
//       initial={{ width: open ? 256 : 80 }}
//       animate={{ width: open ? 256 : 80 }}
//       transition={{ duration: 0.3, ease: "easeInOut" }}
//     >
//       {/* Header */}
//       <div className="flex items-center justify-center p-4 h-16 border-b border-purple-800/40 gap-2 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-blue-500/30 text-white shadow-md">
//         <motion.div
//           className={cn("flex items-center overflow-hidden", open ? "w-auto opacity-100" : "w-0 opacity-0")}
//           initial={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
//           animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
//           transition={{ duration: 0.2 }}
//         >
//           <span className="font-extrabold text-xl text-pink-200 drop-shadow-lg">
//             🧸 BabyMall Admin
//           </span>
//         </motion.div>

//         <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setOpen(!open)}
//             className="rounded-full bg-white/10 hover:text-pink-300 hover:bg-white/20 text-pink-200 border border-pink-400/30 shadow-sm backdrop-blur-sm"
//           >
//             <motion.div animate={{ rotate: open ? 0 : 180 }} transition={{ duration: 0.3 }}>
//               {open ? <ChevronLeft size={20} /> : <ChevronRight className="rotate-180" size={20} />}
//             </motion.div>
//           </Button>
//         </motion.div>
//       </div>

//       {/* Sidebar */}
//       <div className="flex flex-col gap-1 flex-1 p-3">
//         {NavigationsItems.map((item) => (
//           <NavItems
//             key={item.to}
//             to={item.to}
//             icon={item.icon}
//             label={item.label}
//             open={open}
//             end={item.end}
//             pathname={pathname}
//           />
//         ))}
//       </div>

// //       {/* Footer */}
// //       {/* Logout */}
// <div className="p-4 border-t border-purple-700 bg-gradient-to-r from-[#1a1433] to-[#241d44]">
//   <motion.div
//     className={cn(
//       "flex items-center gap-3 mb-4",
//       open ? "justify-start" : "justify-center"
//     )}
//     initial={{ opacity: 0, y: 10 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.3, delay: 0.2 }}
//   >
//     {/* User Avatar */}
//     <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/30 overflow-hidden">
//       {user?.avatar ? (
//         <img
//           src={user.avatar}
//           alt={user.name}
//           className="rounded-full object-cover h-full w-full"
//         />
//       ) : (
//         user?.name.charAt(0).toUpperCase()
//       )}

//       {/* Glow effect */}
//       <span className="absolute inset-0 rounded-full bg-pink-400/20 blur-xl animate-pulse"></span>
//     </div>

//     {/* User Info */}
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           initial={{ opacity: 0, x: -10 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: -10 }}
//           transition={{ duration: 0.2 }}
//           className="flex flex-col gap-1"
//         >
//           <span className="text-sm capitalize text-white font-semibold truncate bg-purple-800/40 px-3 py-1 rounded-full shadow-md max-w-[160px]">
//             {user?.name}
//           </span>
//           <span className="text-xs capitalize text-blue-300 font-medium bg-purple-800/40 px-3 py-1 rounded-full shadow-sm">
//             {user?.role}
//           </span>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   </motion.div>

//   {/* Logout Button */}
//   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//     <Button
//       variant={"outline"}
//       size={open ? "default" : "icon"}
//       onClick={logout}
//       className="flex items-center justify-center border-blue-400 text-blue-300 hover:bg-blue-400 hover:text-white shadow-lg transition-all duration-300"
//     >
//       <LogOut size={16} className={cn("mr-2", !open && "mr-0")} />
//       {open && "Logout"}
//     </Button>
//   </motion.div>
// </div>

// //     </motion.aside>
// //   );
// // };

// const NavItems = ({ to, icon, label, open, pathname, end = false }: NavItemsProps) => {
//   return (
//     <NavLink
//       to={to}
//       end={end}
//       className={cn(
//         "flex items-center p-3 rounded-xl text-sm font-semibold gap-3 overflow-hidden text-pink-200 hover:bg-gradient-to-r hover:from-pink-400/20 hover:to-purple-400/20 hover:text-white hover:shadow-md",
//         pathname === to
//           ? "bg-gradient-to-r from-pink-400/40 to-purple-400/40 text-white shadow-md ring-2 ring-pink-400/40 scale-105"
//           : "text-pink-300 hover:scale-102",
//       )}
//     >
//       <span>{icon}</span>
//       {open && label}
//     </NavLink>
//   );
// };

// export default Sidebar;
