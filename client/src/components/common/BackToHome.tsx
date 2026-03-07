import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

const BackToHome = ({className}:{className?:string}) => {
  return (
    <Link href={"/"}>
      <Button className={className}>Back To Home</Button>
    </Link>
  );
};

export default BackToHome;
