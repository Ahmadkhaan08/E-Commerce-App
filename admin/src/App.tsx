import { Navigate, Outlet } from "react-router";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import authStore from "./store/useAuthStore";
import { useState } from "react";
import { cn } from "./lib/utils";
import { motion } from "framer-motion";
function App() {
  const {isAuthenticated}=authStore()
  const [sidebarOpen , setSidebarOpen]=useState(true)
  
  return (
    <>
    {!isAuthenticated?( <Navigate to={"/login"}/>):(

      <div className="flex bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <motion.div className={cn("flex flex-col flex-1 ")}
      animate={{marginLeft:sidebarOpen?256:80}}
      transition={{ duration: 0.3, ease: "easeInOut" }}>
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
      </motion.div>
      
    </div>
    )}
  </>
  );
}

export default App;
