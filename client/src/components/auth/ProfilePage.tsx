"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import authApi from "@/lib/authApi";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const {logoutUser}=useUserStore()
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.post("/auth/logout", {});
      if (response?.success) {
        logoutUser()
        toast.success("Logout Successfully!");
        router.push("/");
      }
    } catch (error) {
      console.error("Logout Failed:", error);
      toast.error("Logout Failed,Try again later!");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="p-10">
      <Button variant={"destructive"} onClick={handleLogout}>
        {isLoading ? (
          <span className="flex items-center gap-1">
            <Loader2 className="animate-spin" /> Logging Out....
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <LogOut /> LogOut
          </span>
        )}
      </Button>
    </div>
  );
};

export default ProfilePage;
