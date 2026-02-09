import { Navigate, Outlet } from "react-router";
import { Button } from "./components/ui/button";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { toast, Toaster } from "sonner";
import authStore from "./store/useAuthStore";

function App() {
  const {isAuthenticated}=authStore()
  console.log(isAuthenticated);
  if(!isAuthenticated){
    return <Navigate to={"/login"}/>
  }
  return (
    <div className="h-screen flex bg-background">
      <Sidebar />
      <Button onClick={()=>toast.info("Hello",{position:"top-center"})}>Click Me</Button>
      <div className="flex flex-col flex-1 max-w-[--breakpoint-2xl] ml-64 bg-gray-600">
        <Header />
        <main>
          <Outlet />
        </main>
        <Toaster />
      </div>
      
    </div>
  );
}

export default App;
