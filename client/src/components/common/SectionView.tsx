import React from "react";
import { Title } from "./Text";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Props {
  title: string;
  href: string;
  hrefTitle: string;
}
const SectionView = ({ title, href, hrefTitle }: Props) => {
  return (
    <div className="flex items-center justify-between gap-5">
      <Title className="text-xl">{title}</Title>
      <Link
        href={href}
        className="text-babyshopSky text-sm font-medium hover:text-babyshopRed"
      >
        <p className="flex items-center gap-0.5 ">
          {hrefTitle} <ChevronRight size={18} />
        </p>
      </Link>
    </div>
  );
};

export default SectionView;
