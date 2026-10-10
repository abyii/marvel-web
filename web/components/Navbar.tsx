"use client";

import { Appbar, Button, IconButton } from "@marvel/ui/ui";
import { LoadingPulser } from "@marvel/ui/ui/client";
import { Avatar } from "./Avatar";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import {
  HiChevronDoubleDown as DownIcon,
  HiOutlineBars2 as MenuIcon,
} from "react-icons/hi2";
import { useMemo, useState } from "react";
import MenuDialog from "./MenuDialog";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const path = usePathname();

  // close the menu on navigation (state adjusted during render, not in an effect)
  const [menuPath, setMenuPath] = useState(path);
  if (path !== menuPath) {
    setMenuPath(path);
    setMenuOpen(false);
  }

  useMemo(() => {
    typeof window !== "undefined" &&
      window.addEventListener(
        "keydown",
        (e) => {
          if (e.ctrlKey && e.key == "m") {
            if (!menuOpen) {
              setMenuOpen(true);
              document.getElementById("search-marvel")?.focus();
            }
          } else if (e.key == "Escape") {
            setMenuOpen(false);
          }
        },
        false
      );
  }, []);

  return (
    <>
      {menuOpen && <MenuDialog menuOpen={menuOpen} setMenuOpen={setMenuOpen} />}
      <Appbar className={"bottom-0 z-max border-y-0 fixed inset-x-0"}>
        <div
          className={`w-full max-w-screen-lg flex justify-between items-center relative `}
        >
          <div className="flex items-center">
            <IconButton
              onPress={() => setMenuOpen((p) => !p)}
              variant={"text"}
              className="mr-2"
            >
              {menuOpen ? (
                <DownIcon className="h-6 w-6 text-p-0 dark:text-p-10" />
              ) : (
                <MenuIcon className="h-6 w-6 text-p-0 dark:text-p-10" />
              )}
            </IconButton>
          </div>
          <Link href={"/"}>
            <span className="text-p-2 dark:text-p-8 font-semibold text-center cursor-pointer">
              UVCE MARVEL.
            </span>
          </Link>
          {session?.user ? (
            <Link
              href={`/u/${session?.user?.slug}`}
              className="mr-3 flex items-center"
            >
              <Avatar
                className="w-10"
                src={session?.user?.profilePic}
                alt={session?.user?.name}
              />
            </Link>
          ) : status === "loading" ? (
            <LoadingPulser />
          ) : (
            <Button onPress={() => signIn("google", { redirect: false })}>
              Sign In
            </Button>
          )}
        </div>
      </Appbar>
    </>
  );
};

export default Navbar;
