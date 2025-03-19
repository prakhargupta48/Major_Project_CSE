"use client"

import { useState } from "react"
import Link from "next/link"
import { BarChart3, Home, LogOut, Map, MapPin, Plus, Settings, Truck, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DashboardHeader } from "./dashboard-header"
import { RouteHistoryTable } from "./route-history-table"
import { VehicleForm } from "./vehicle-form"
import { LocationForm } from "./location-form"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                  <TabsTrigger value="locations">Locations</TabsTrigger>
                  <TabsTrigger value="routes">Routes</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  {activeTab === "vehicles" && (
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Vehicle
                    </Button>
                  )}
                  {activeTab === "locations" && (
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Location
                    </Button>
                  )}
                  {activeTab === "routes" && (
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      New Optimization
                    </Button>
                  )}
                </div>
              </div>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
                      <Map className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24</div>
                      <p className="text-xs text-muted-foreground">+5 from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
                      <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,245 km</div>
                      <p className="text-xs text-muted-foreground">-12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Delivery Locations</CardTitle>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">48</div>
                      <p className="text-xs text-muted-foreground">+8 from last month</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Recent Route Optimizations</CardTitle>
                      <CardDescription>Your recent route optimization history for the last 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RouteHistoryTable />
                    </CardContent>
                  </Card>
                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Route Efficiency</CardTitle>
                      <CardDescription>Average load capacity and distance optimization metrics.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center bg-muted/40 rounded-md">
                        <BarChart3 className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Chart visualization</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="vehicles" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Management</CardTitle>
                    <CardDescription>Add, edit, or remove vehicles from your fleet.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VehicleForm />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="locations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Location Management</CardTitle>
                    <CardDescription>Add, edit, or remove delivery locations.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LocationForm />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="routes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Route Optimization</CardTitle>
                    <CardDescription>Create and manage optimized routes for your fleet.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] flex items-center justify-center bg-muted/40 rounded-md">
                      <Map className="h-8 w-8 text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Map visualization will appear here</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Truck className="h-6 w-6" />
          <span>RouteOptimizer</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard?tab=vehicles">
                <Truck className="h-4 w-4" />
                <span>Vehicles</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard?tab=locations">
                <MapPin className="h-4 w-4" />
                <span>Locations</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard?tab=routes">
                <Map className="h-4 w-4" />
                <span>Routes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              <span>John Doe</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

