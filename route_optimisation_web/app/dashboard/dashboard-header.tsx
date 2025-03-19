"use client"

import { Bell, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger />
      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
      </div>
      <div className="hidden w-full max-w-sm md:flex">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[300px]"
          />
        </div>
      </div>
      <Button variant="outline" size="icon" className="rounded-full">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Notifications</span>
      </Button>
    </header>
  )
}

