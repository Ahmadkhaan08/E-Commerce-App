"use client";
import { Menu } from 'lucide-react';
import React, { useState } from 'react'
import LeftSidebar from './LeftSidebar';

const Sidebar = () => {
    const [isSidebarOpen,setIsSidebarOpen]=useState<boolean>(false)
    const setIsToogle=()=>{
        setIsSidebarOpen(!isSidebarOpen)
    }
  return (
    <div className='md:hidden'>
        <button>
            <Menu onClick={setIsToogle}/>
        </button>
        <LeftSidebar isOpen={isSidebarOpen} onClosed={()=>setIsSidebarOpen(false)}/>
    </div>
  )
}

export default Sidebar