import React from "react";
import TopHeader from "./TopHeader";
import Container from "../common/Container";
import Logo from "../common/Logo";
import SearchInput from "./SearchInput";
import OrderIcon from "./OrderIcon";
import WhishlistIcon from "./WhishlistIcon";
import UserButton from "./UserButton";
import CartIcon from "./CartIcon";

const Header = () => {
  return (
    <header className="border-b sticky top-0 z-50 bg-babyshopWhite">
      <TopHeader />
      <Container className="flex items-center justify-between gap-10 py-4">
        <div className="flex flex-1 items-center justify-between md:justify-start md:gap-12">
          {/* Slidebar */}
          <Logo />
          <div className="md:hidden flex items-center gap-3">
            <OrderIcon /> <WhishlistIcon /> <CartIcon />
          </div>
          <SearchInput />
        </div>
        <div className="hidden md:inline-flex items-center gap-5">
          <OrderIcon /> <WhishlistIcon /> <UserButton /> <CartIcon />{" "}
        </div>
      </Container>
    </header>
  );
};

export default Header;
