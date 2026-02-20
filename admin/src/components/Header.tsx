import authStore from "@/store/useAuthStore";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";

const Header = () => {
  const { user } = authStore();
  return (
    <header className="sticky top-0 z-10 flex items-center h-16  px-4
     backdrop-blur-xl  bg-black/90
      border-b border-white/5
      shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-4 ml-auto ">
        <Button variant="ghost" size="icon" className="rounded-full text-white">
          <Bell size={18}  />
        </Button>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <div className="text-sm capitalize font-medium text-white">{user?.name}</div>
            <div className="text-xs text-muted-foreground capitalize font-semibold ">{user?.role}</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-primary  font-semibold overflow-hidden">{user?.avatar?(
            <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover "/>
          ):(user?.name.charAt(0).toUpperCase())}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
