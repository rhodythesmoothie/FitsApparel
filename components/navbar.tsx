"use client";

import { Badge } from "@heroui/badge";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";

import NextLink from "next/link";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";

import {
  ProfileIcon,
  CartIcon,
} from "@/components/icons";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const BUYER_NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/shop" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
];

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Products", href: "/admin/products" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Sales", href: "/admin/sales" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  const isProfileSection = pathname.startsWith("/profile") || pathname.startsWith("/login");
  const { user, role, logout, loading } = useAuth();
  const { items } = useCart();
  const isAdmin = role === "admin";
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : BUYER_NAV_ITEMS;
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
  const cartBadgeContent = cartItemCount > 99 ? "99+" : cartItemCount;

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <HeroUINavbar
      maxWidth="xl"
      position={isHomePage ? "static" : "sticky"}
      className={clsx(
        isHomePage
          ? "absolute left-0 right-0 top-0 z-50 bg-white/95 shadow-md border-none backdrop-blur-sm"
          : "bg-white shadow-md",
        "min-h-20 px-3 py-3 sm:px-4 md:min-h-24 md:px-8 md:py-4",
      )}
      style={isHomePage ? { backgroundColor: "rgba(255, 255, 255, 0.95)" } : undefined}
    >
      <NavbarContent className="basis-1/5 sm:basis-full gap-3 md:gap-6" justify="start">
        <NextLink
          aria-label="Home"
          className="mr-2 flex items-center justify-center text-black transition-opacity hover:opacity-80 md:mr-4"
          href="/"
        >
          <img
            alt="Fits Apparel Logo"
            className="h-14 w-14 rounded-full object-contain md:h-16 md:w-16"
            height={64}
            src="/fa-logo.png"
            width={64}
          />
        </NextLink>
        <ul className="hidden lg:flex gap-5 justify-start ml-2 md:gap-6 md:ml-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" &&
                item.href !== "/admin" &&
                pathname.startsWith(item.href));
            return (
              <NavbarItem key={item.href}>
                <NextLink
                  className={clsx(
                    "text-base text-black md:text-lg transition-colors duration-200 pb-1",
                    isActive 
                      ? "font-semibold border-b-2 border-black" 
                      : "hover:text-black/70"
                  )}
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            );
          })}
        </ul>
      </NavbarContent>

      <NavbarContent className="basis-1/5 sm:basis-full gap-1 sm:gap-2 md:gap-4" justify="end">
        <NavbarItem className="flex gap-1 items-center sm:gap-2 md:gap-4">
          {!loading && (
            <>
              {user && !isAdmin ? (
                <>
                  <NextLink
                    aria-label="Profile"
                    className={clsx(
                      "hidden rounded-full p-2 text-black transition-colors hover:bg-default-100 sm:inline-flex sm:p-2.5 md:p-3",
                      isProfileSection && "bg-black/5 ring-1 ring-black/10",
                    )}
                    href="/profile"
                  >
                    <ProfileIcon className="text-lg md:text-xl" />
                  </NextLink>
                  <button
                    onClick={handleLogout}
                    className="hidden text-sm font-medium text-black transition-colors hover:text-black/70 sm:inline md:text-base"
                  >
                    Sign Out
                  </button>
                </>
              ) : user && isAdmin ? (
                <button
                  onClick={handleLogout}
                  className="hidden rounded-lg border border-black/20 px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white sm:inline-flex"
                >
                  Logout
                </button>
              ) : (
                <NextLink
                  aria-label="Profile"
                  className={clsx(
                    "hidden rounded-full p-2 text-black transition-colors hover:bg-default-100 sm:inline-flex sm:p-2.5 md:p-3",
                    isProfileSection && "bg-black/5 ring-1 ring-black/10",
                  )}
                  href="/login"
                >
                  <ProfileIcon className="text-lg md:text-xl" />
                </NextLink>
              )}
            </>
          )}
          {!isAdmin && (
            <Badge
              showOutline
              classNames={{
                badge:
                  "h-5 min-w-5 border-2 border-white bg-black px-1 text-[10px] font-semibold text-white",
              }}
              content={cartBadgeContent}
              isInvisible={cartItemCount === 0}
              placement="top-right"
              shape="circle"
              size="sm"
            >
              <NextLink
                aria-label={`Cart with ${cartItemCount} item${cartItemCount === 1 ? "" : "s"}`}
                className="rounded-full p-2 text-black transition-colors hover:bg-default-100 sm:p-2.5 md:p-3"
                href="/cart"
              >
                <CartIcon className="text-lg md:text-xl" />
              </NextLink>
            </Badge>
          )}
          <NavbarMenuToggle className="lg:hidden" />
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavbarMenuItem key={item.href}>
              <NextLink className="text-black text-lg" href={item.href}>
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}
          {user && !isAdmin && (
            <NavbarMenuItem key="mobile-profile">
              <NextLink className="text-black text-lg" href="/profile">
                Profile
              </NextLink>
            </NavbarMenuItem>
          )}
          {!isAdmin && (
            <NavbarMenuItem key="mobile-cart">
              <NextLink className="text-black text-lg" href="/cart">
                Cart
              </NextLink>
            </NavbarMenuItem>
          )}
          {user && (
            <NavbarMenuItem key="mobile-logout">
              <button
                onClick={handleLogout}
                className="text-left text-black text-lg"
                type="button"
              >
                Logout
              </button>
            </NavbarMenuItem>
          )}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
