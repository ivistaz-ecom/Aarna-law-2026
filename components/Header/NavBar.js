"use client";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { HeaderMenu } from "../../utils/data";
import SearchModal from "@/components/Header/SearchModal";
import { LanguageContext } from "../../app/context/LanguageContext";
import LanguageDropdown from "../Header/LanguageDropdown";

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const { language, setLanguage, translations } = useContext(LanguageContext);
  const newsPaths = ["/aarna-news", "/insight", "/publication", "/podcast"];

  // Function to format translation keys
  const formatKey = (key) => key.toLowerCase().replace(/[^a-z0-9]+/g, "");

  // Handle submenu toggle for mobile
  const handleSubmenuToggle = (menuName) => {
    setOpenSubmenu(openSubmenu === menuName ? null : menuName);
  };

  // Handle submenu item click
  const handleSubmenuClick = () => {
    setIsMenuOpen(false);
    setOpenSubmenu(null);
  };

  useEffect(() => {
    // Scroll to top whenever pathname changes (page load or route change)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });

    if (pathname === "/podcast") {
      router.replace("/podcasts");
    }

    // Close menu on route change
    setIsMenuOpen(false);
    setOpenSubmenu(null);
  }, [pathname, router]);

  return (
    <>
      <style>
        {`
          /* Common font size for Tamil and Malayalam across all screen sizes */
          .nav-menu {
            font-size: ${language === 'ta' || language === 'ml' ? '12px' : '16px'} !important; 
          }

          /* Specific adjustments for larger screens if needed */
          @media (min-width: 1600px) {
            .nav-menu {
              font-size: ${language === 'ta' || language === 'ml' ? '12px' : '16px'} !important; 
            }
          }
        `}
      </style>
      <div className="relative z-50 mx-auto w-11/12">
        <div className="absolute right-0 mt-5 origin-top-right ring-1 ring-black ring-opacity-5 focus:outline-none">
          <LanguageDropdown handleOptionClick={setLanguage} />
        </div>

        <nav className="absolute z-50 mt-20 w-full border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="md:px-5 flex items-center flex-wrap justify-between px-4 py-1 nav-menu">
            <div className="">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo/aarna-logo.png"
                  alt="Aarna Law"
                  width={700}
                  height={600}
                  className="size-16 md:size-20"
                  loading="lazy"
                />
              </Link>
            </div>

            <div className="flex w-2/5 justify-end lg:hidden">
              <SearchModal />
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="inline-flex size-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 lg:hidden"
              aria-controls="navbar-dropdown"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="size-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>

            {/* Desktop Menu */}
            <div className="hidden w-full lg:block lg:w-auto" id="navbar-dropdown">
              <ul className="borderfont-medium mt-1 flex flex-col rounded-lg dark:border-gray-700 md:flex-row md:space-x-3">
                {HeaderMenu.map((item, index) => {
                  const isContactUs = item.menu === "Contact Us";

                  return (
                    <li
                      key={index}
                      className={`group relative ${isContactUs ? "md:hidden" : ""}`}
                    >
                      {item.aboutSubMenu || item.subMenu ? (
                        <span className="flex cursor-pointer items-center px-3 py-2 md:hover:text-custom-red">
                          {translations.menu[formatKey(item.menu)] || item.menu}
                          <span className="ml-1 text-sm">&#9662;</span>
                        </span>
                      ) : (
                        <Link
                          href={item.slug || "#"}
                          className="flex items-center px-3 py-2 md:hover:text-custom-red"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {translations.menu[formatKey(item.menu)] || item.menu}
                        </Link>
                      )}

                      {(item.aboutSubMenu || item.subMenu) && (
                        <ul className="absolute z-10 hidden w-48 rounded-lg bg-white p-2 shadow-lg group-hover:block">
                          {(item.aboutSubMenu || item.subMenu).map((sub, subIndex) => (
                            <li key={subIndex}>
                              <Link
                                href={sub.slug || "#"}
                                className="block px-4 py-2 hover:bg-gray-100"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {translations.menu[formatKey(sub.name)] || sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Contact us for desktop view */}
            <div className="hidden gap-5 items-center justify-evenly lg:flex">
              <SearchModal />
              <Link
                href="/contact-us"
                className="my-2 border border-custom-red bg-white px-5 py-2.5 text-sm font-medium text-custom-red hover:bg-custom-red hover:text-white nav-menu"
                onClick={() => setIsMenuOpen(false)}
              >
                {translations.menu.contactus || "CONTACT US"}
              </Link>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <div className={`${isMenuOpen ? "block" : "hidden"} lg:hidden border-t border-gray-200`} id="navbar-dropdown">
            <ul className="py-2">
              {HeaderMenu.map((item, index) => {
                const hasSubmenu = item.aboutSubMenu || item.subMenu;
                const isSubmenuOpen = openSubmenu === item.menu;

                return (
                  <li key={index} className="border-b border-gray-100 last:border-b-0">
                    {hasSubmenu ? (
                      <>
                        <button
                          onClick={() => handleSubmenuToggle(item.menu)}
                          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          {translations.menu[formatKey(item.menu)] || item.menu}
                          <span className={`text-sm transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`}>
                            &#9662;
                          </span>
                        </button>
                        {isSubmenuOpen && (
                          <ul className="bg-gray-50 border-l-4 border-red-600 ml-4 mt-2 mb-2">
                            {(item.aboutSubMenu || item.subMenu).map((sub, subIndex) => (
                              <li key={subIndex}>
                                <Link
                                  href={sub.slug || "#"}
                                  className="block px-4 py-3 text-sm text-gray-600 hover:text-custom-red border-b border-gray-200 last:border-b-0"
                                  onClick={handleSubmenuClick}
                                >
                                  {translations.menu[formatKey(sub.name)] || sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.slug || "#"}
                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {translations.menu[formatKey(item.menu)] || item.menu}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavBar;
