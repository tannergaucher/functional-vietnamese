"use client";

import { Disclosure } from "@headlessui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Suspense } from "react";

import { Filters } from "./filters";
import { Search } from "./search";

export function Header({ title }: { title: string }) {
  const pathname = usePathname();

  return (
    <header className="p-4 bg-bg-2-light dark:bg-bg-2-dark grid grid-cols-1 sm:grid-cols-3 items-center sticky top-0 w-full">
      <Link
        href="/"
        className="text-2xl font-bold hover:text-accent-1-light dark:hover:text-accent-1-dark"
      >
        <h1>{title}</h1>
      </Link>
      <div className="block sm:hidden">
        <MobileMenu />
      </div>
      <div className="hidden sm:block">
        <Search />
      </div>
      {pathname === "/" ? (
        <Suspense>
          <div className="hidden sm:block">
            <Filters />
          </div>
        </Suspense>
      ) : null}
    </header>
  );
}

function MobileMenu() {
  return (
    <Disclosure>
      {({}) => (
        <>
          <Disclosure.Button className="p-2 text-xl hover:text-accent-1-light dark:hover:text-accent-1-dark">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </Disclosure.Button>
          <Disclosure.Panel>
            <div className="py-">
              <h2>Search Content</h2>
              <Search />
              <h2>Filter Content</h2>
              <br />
              <Filters mobile />
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
