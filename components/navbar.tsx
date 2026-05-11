"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";

import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";

import { siteConfig } from "@/config/site";
import {
  ProfileIcon,
  CartIcon,
} from "@/components/icons";
import { useAuth } from "@/context/AuthContext";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
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
          ? "absolute left-0 right-0 top-0 z-50 bg-transparent shadow-none border-none backdrop-blur-0"
          : "bg-white shadow-sm",
        "min-h-20 px-3 py-3 sm:px-4 md:min-h-24 md:px-8 md:py-4",
      )}
      style={isHomePage ? { backgroundColor: "transparent" } : undefined}
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
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "text-base !text-black !opacity-100 data-[active=true]:!text-black data-[active=true]:font-medium md:text-lg",
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="basis-1/5 sm:basis-full gap-1 sm:gap-2 md:gap-4" justify="end">
        <NavbarItem className="flex gap-1 items-center sm:gap-2 md:gap-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <NextLink
                    aria-label="Profile"
                    className="hidden rounded-full p-2 text-black transition-colors hover:bg-default-100 sm:inline-flex sm:p-2.5 md:p-3"
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
              ) : (
                <NextLink
                  aria-label="Profile"
                  className="hidden rounded-full p-2 text-black transition-colors hover:bg-default-100 sm:inline-flex sm:p-2.5 md:p-3"
                  href="/login"
                >
                  <ProfileIcon className="text-lg md:text-xl" />
                </NextLink>
              )}
            </>
          )}
          <NextLink
            aria-label="Cart"
            className="rounded-full p-2 text-black transition-colors hover:bg-default-100 sm:p-2.5 md:p-3"
            href="/cart"
          >
            <CartIcon className="text-lg md:text-xl" />
          </NextLink>
          <NavbarMenuToggle className="lg:hidden" />
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className="!text-black !opacity-100"
                color="foreground"
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
