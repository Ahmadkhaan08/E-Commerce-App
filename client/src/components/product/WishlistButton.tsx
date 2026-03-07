import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import React from "react";

const WishlistButton = ({ className }: { className?: string }) => {
  return (
    <div>
      <button
        className={cn(
          "p-2 rounded-full transition-colors hover:bg-gray-100",
          className,
        )}
      >
        <Heart size={20} />
      </button>
    </div>
  );
};

export default WishlistButton;
