import { Navigate, Outlet } from "react-router";
import { Button } from "./components/ui/button";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { toast, Toaster } from "sonner";
import authStore from "./store/useAuthStore";
import { useState } from "react";
import { cn } from "./lib/utils";

function App() {
  const {isAuthenticated}=authStore()
  const [sidebarOpen , setSidebarOpen]=useState(true)
  // console.log(isAuthenticated);
  // if(!isAuthenticated){
  //   return <Navigate to={"/login"}/>
  // }
  return (
    <>
        <Toaster />

    {!isAuthenticated?( <Navigate to={"/login"}/>):(

      <div className="h-screen flex bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className={cn("flex flex-col flex-1 max-w-[--breakpoint-2xl] ml-64",sidebarOpen?"md:ml-64":"md:ml-20")}>
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
      
    </div>
    )}
  </>
  );
}

export default App;
