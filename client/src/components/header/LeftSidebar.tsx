import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { smallLogo } from "@/assets/image";
import { useOutsideClick } from "@/hooks";
import {
  Baby,
  Heart,
  HelpCircle,
  Home,
  LogIn,
  LogOut,
  Package,
  Phone,
  ShoppingBag,
  Star,
  Store,
  Tag,
  Truck,
  User,
  UserCircle,
  UserPlus,
} from "lucide-react";
import { useUserStore } from "@/lib/store";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface SideBarProps {
  isOpen: boolean;
  onClosed: () => void;
}
const LeftSidebar: React.FC<SideBarProps> = ({ isOpen, onClosed }) => {
  const sidebarRef = useOutsideClick<HTMLDivElement>(onClosed);
  const { isAuthenticated, authUser, logoutUser } = useUserStore();

  const handleLogout = () => {
    logoutUser();
    onClosed();
    toast.success("User Logout Successfully!");
  };
  return (
    <div
      className={`fixed inset-y-0 h-screen left-0 z-50 w-full bg-babyshopBlack/50 shadow-xl transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform ease-in-out duration-300`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        ref={sidebarRef}
        className="min-w-70  max-w-80 bg-babyshopWhite text-babyshopBlack z-50 h-screen border-r border-r-babyshopRed flex flex-col gap-6 relative"
      >
        <div className="flex items-center justify-baseline border-b p-5">
          <Link href={"/"} className="flex items-end gap-2">
            <Image src={smallLogo} alt="LogoImage" className="w-8" />
            <p className="text-base font-medium">Ready to Deliver</p>
          </Link>
        </div>
        <div className="flex flex-col justify-between flex-1 px-5 overflow-hidden">
          <div className="overflow-y-auto flex-1 pr-2">
            {/* Quick Links Sections */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/"
                  onClick={onClosed}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg  hover:bg-gray-50 transition-colors"
                >
                  <Home size={18} />
                  <span>Home</span>
                </Link>
                <Link
                  href="/shop"
                  onClick={onClosed}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg  hover:bg-gray-50 transition-colors"
                >
                  <Store size={18} />
                  <span>Shop All</span>
                </Link>
                <Link
                  href="/shop?sortOrder=desc"
                  onClick={onClosed}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg  hover:bg-gray-50 transition-colors"
                >
                  <Star size={18} />
                  <span>New Arrivals</span>
                </Link>
                <Link
                  href="//shop?priceRange=0-500"
                  onClick={onClosed}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg  hover:bg-gray-50 transition-colors"
                >
                  <Tag size={18} />
                  <span>Under PKR 500</span>
                </Link>
              </div>
            </div>
            {/* Shop by Age Section */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Shop by Age
              </h3>
              <div className="space-y-2">
                <Link
                  href="/shop?search=newborn"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClosed}
                >
                  <Baby size={18} />
                  <span>Newborn (0-6 Months)</span>
                </Link>
                <Link
                  href="/shop?search=infant"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClosed}
                >
                  <Baby size={18} />
                  <span>Infant (6-12 Months)</span>
                </Link>
                <Link
                  href="/shop?search=toddler"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClosed}
                >
                  <Baby size={18} />
                  <span>Toddler (1-2 Years)</span>
                </Link>
                <Link
                  href="/shop?search=kids"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClosed}
                >
                  <Baby size={18} />
                  <span>Kids (2+ Years)</span>
                </Link>
              </div>
            </div>
            {isAuthenticated && authUser ? (
              <div className="space-y-4 mb-6">
                <div className="mb-4 border-b">
                  <p className="text-sm text-gray-600">Welcome back,</p>
                  <p className="font-semibold text-lg">{authUser.name}</p>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  My Account
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/user/profile"
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={onClosed}
                  >
                    <UserCircle size={18} />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/user/orders"
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={onClosed}
                  >
                    <Package size={18} />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    href="/user/wishlist"
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={onClosed}
                  >
                    <Heart size={18} />
                    <span>My Wishlist</span>
                  </Link>
                  <Link
                    href="/user/cart"
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={onClosed}
                  >
                    <ShoppingBag size={18} />
                    <span>My Cart</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p>Access your account to view orders and wishlist</p>
              </div>
            )}
            {/* Help & Support Section */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Help & Support
              </h3>
              <div className="space-y-2">
                <Link
                  href="/help"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClosed}
                >
                  <HelpCircle size={18} />
                  <span>Help Center</span>
                </Link>
                <Link
                  href="/help/shipping"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClosed}
                >
                  <Truck size={18} />
                  <span>Shipping Info</span>
                </Link>
                <Link
                  href="/help/contact"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClosed}
                >
                  <Phone size={18} />
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>
            {/* Fixed Footer Section */}
            <div className="py-4 border-t bg-white">
              <div className="space-y-3">
                {isAuthenticated && authUser ? (
                  <Button
                    onClick={handleLogout}
                    variant={"outline"}
                    className="w-full p-5.5 text-base font-semibold hover:bg-babyshopSky/20 border-babyshopSky "
                  >
                    <LogOut /> Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="flex items-center gap-1 font-medium">
                      <User /> My Account
                    </p>
                    <Link href={"/auth/signin"} onClick={onClosed}>
                      <Button className="w-full py-5.5 text-base font-medium bg-babyshopSky">
                        <LogIn /> Login
                      </Button>
                    </Link>
                    <Link href={"/auth/signup"} onClick={onClosed}>
                      <Button
                        className="w-full py-5.5 text-base font-medium border-babyshopSky"
                        variant={"outline"}
                      >
                        <UserPlus /> Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LeftSidebar;
