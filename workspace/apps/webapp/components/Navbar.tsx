'use client';

import { Appbar, Button, IconButton, LoadingPulser } from '@marvel/web-ui';
import { Avatar } from './Avatar';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  HiChevronDoubleDown as DownIcon,
  HiOutlineBars2 as MenuIcon,
} from 'react-icons/hi2';
import { useState } from 'react';
import MenuDialog from './MenuDialog';

const Navbar = () => {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <>
      {menuOpen && <MenuDialog menuOpen={menuOpen} setMenuOpen={setMenuOpen} />}
      <Appbar className={'bottom-0 z-max'}>
        <div
          className={`w-full max-w-screen-lg flex justify-between items-center relative `}
        >
          <div className="flex items-center">
            <IconButton
              onClick={() => setMenuOpen((p) => !p)}
              variant={'text'}
              className="mr-2"
            >
              {menuOpen ? (
                <DownIcon className="h-6 w-6 text-p-10" />
              ) : (
                <MenuIcon className="h-6 w-6 text-p-10" />
              )}
            </IconButton>
            <Link href={'/'}>
              <span className="text-p-8 font-semibold text-center cursor-pointer">
                MARVEL.
              </span>
            </Link>
          </div>
          {session?.user ? (
            <div className="flex items-center">
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
              <Button
                onClick={() => signOut()}
                className="text-sm hidden md:block"
              >
                Sign Out
              </Button>
            </div>
          ) : status === 'loading' ? (
            <LoadingPulser />
          ) : (
            <Button
              onClick={() => signIn('google', { redirect: false })}
              className={'text-sm'}
            >
              Sign In
            </Button>
          )}
        </div>
      </Appbar>
    </>
  );
};

export default Navbar;
