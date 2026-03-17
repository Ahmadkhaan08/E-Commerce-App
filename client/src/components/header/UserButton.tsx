"use client";
import { useUserStore } from "@/lib/store";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const UserButton = () => {
  const { isAuthenticated, authUser } = useUserStore();
  // console.log(isAuthenticated,authUser)
  return (
    <Link
      href={isAuthenticated && authUser ? "/auth/profile" : "/auth/signin"}
      className="flex items-center gap-2 group hover:text-babyshopSky hoverEffect"
    >
      {isAuthenticated && authUser ? (
        <span className="h-12 w-12 rounded-full p-1 group-hover:border-babyshopSky hoverEffect">
          {authUser.avatar ? (
            <Image
              src={authUser.avatar}
              alt={authUser.name}
              width={25}
              height={25}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="h-full w-full rounded-full flex items-center justify-center text-babyshopSky bg-babyshopSky/10 text-sm font-semibold">
              {authUser.name.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </span>
      ) : (
        <User size={30} />
      )}
      <span className="flex flex-col">
        <span className="text-xs font-medium">Welcome</span>
        <span className="font-semibold text-sm">
          {isAuthenticated && authUser
            ? <span className="capitalize">{authUser.name || "My Profile"}</span>
            : "Sign In/Register"}
        </span>
      </span>
    </Link>
  );
};

export default UserButton;
