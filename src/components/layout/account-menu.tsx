"use client"

import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { useLogout } from "../home/logout-button"
import { monoCaption } from "../home/styles"
import { UserIcon } from "./icons"
import type { HeaderUser } from "./nav-config"
import { action, actionOutline, actionText } from "./styles"

const item =
  "cursor-pointer px-4 py-3 font-heading text-sm leading-6 font-bold tracking-[1.5px] uppercase focus:bg-foreground focus:text-black"

/** Desktop account menu: orders, wishlist, admin (for admins) and logout. */
export function AccountMenu({ user }: { user: HeaderUser }) {
  const { signOut, pending } = useLogout()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Account: ${user.username}`}
          className={cn(action, actionOutline, "gap-2 px-2.5 lg:px-3")}
        >
          <UserIcon />
          <span
            className={cn(
              actionText,
              "hidden max-w-[14ch] truncate px-0 lg:inline"
            )}
          >
            {user.username}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="dark w-60 border-4 border-foreground bg-background p-0 text-foreground"
      >
        <DropdownMenuLabel className="border-b-4 px-4 py-3">
          <span className={cn(monoCaption, "block uppercase")}>
            Signed in as
          </span>
          <span className="block truncate font-heading text-base font-bold text-foreground">
            {user.username}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild className={item}>
          <Link href="/orders">Orders</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={item}>
          <Link href="/wishlist">Wishlist</Link>
        </DropdownMenuItem>
        {user.isAdmin && (
          <DropdownMenuItem asChild className={cn(item, "text-gold")}>
            <Link href="/dashboard">Admin dashboard</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="mx-0 my-0 h-1 bg-foreground" />
        <DropdownMenuItem
          className={item}
          disabled={pending}
          onSelect={signOut}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
