"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { Bars3Icon, PlusIcon } from "@heroicons/react/24/outline";
import CreateQuestModal from "~~/components/CreateQuestModal";
// TODO: Fix QuestDetailModal to work with multi-submission contract structure
// import QuestDetailModal from "~~/components/QuestDetailModal";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Explore",
    href: "/explore",
  },
  {
    label: "My Quests",
    href: "/my-quests",
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "text-blue-600 font-semibold" : "text-gray-700"
              } hover:text-blue-600 transition-colors duration-200 py-2 px-4 text-sm font-medium`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { isConnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  const handleCreateQuest = () => {
    if (isConnected) {
      setShowCreateModal(true);
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
  };

  const handleQuestSubmit = (questData: any) => {
    // The CreateQuestModal handles the actual contract interaction
    setShowCreateModal(false);
  };

  return (
    <>
      <div className="sticky lg:static top-0 navbar bg-white/95 backdrop-blur-sm min-h-0 shrink-0 justify-between z-20 shadow-sm border-b border-gray-100 px-4 sm:px-6 lg:px-8">
        <div className="navbar-start w-auto lg:w-1/2">
          <details className="dropdown" ref={burgerMenuRef}>
            <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            </summary>
            <ul
              className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-white rounded-lg w-52 border border-gray-100"
              onClick={() => {
                burgerMenuRef?.current?.removeAttribute("open");
              }}
            >
              <HeaderMenuLinks />
            </ul>
          </details>

          <Link href="/" passHref className="flex items-center gap-3 ml-4 mr-6 shrink-0">
            <div className="flex relative w-10 h-10">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-xl text-gray-900">PhotoQuest</span>
            </div>
          </Link>

          <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-6">
            <HeaderMenuLinks />
          </ul>
        </div>

        <div className="navbar-end flex items-center gap-4">
          {/* Create Quest Button */}
          <button
            onClick={handleCreateQuest}
            disabled={!isConnected}
            className={`btn btn-primary btn-sm gap-2 ${
              !isConnected
                ? "btn-disabled opacity-50 cursor-not-allowed"
                : "hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            }`}
            title={!isConnected ? "Connect wallet to create a quest" : "Create a new photo quest"}
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Create Quest</span>
          </button>

          <RainbowKitCustomConnectButton />
          {isLocalNetwork && <FaucetButton />}
        </div>
      </div>

      {/* Create Quest Modal */}
      {showCreateModal && <CreateQuestModal onClose={handleModalClose} onSubmit={handleQuestSubmit} />}
    </>
  );
};
