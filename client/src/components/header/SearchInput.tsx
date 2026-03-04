"use client";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Search, X } from "lucide-react";

const SearchInput = () => {
    const [search,setSearch]=useState("")
    console.log(search)
  return (
    <div className="relative lg:w-full">
      <form className="relative hidden lg:flex items-center">
        <Input
          placeholder="Search Products......"
          className="flex-1 rounded-md py-5 focus-visible:ring-0 focus-visible:border-babyshopRed bg-white text-babyshopTextLight placeholder:font-semibold placeholder:tracking-wide pr-16"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />
        {
            search?(<X onClick={()=>setSearch("")} className="w-5 h-5 absolute right-3 top-2.5 text-babyshopTextLight hover:text-babyshopRed hoverEffect cursor-pointer"/>):(<Search className="w-5 h-5 absolute right-3 top-2.5 text-babyshopTextLight"/>)
        }
      </form>
    </div>
  );
};

export default SearchInput;
