"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  Award,
  Briefcase,
  Users,
  Building2,
  BarChart3,
  Settings,
  GraduationCap,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const studentNav = [
  { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { title: "Profile", href: "/student/profile", icon: User },
  { title: "Skills", href: "/student/skills", icon: Award },
  { title: "Jobs", href: "/student/jobs", icon: Briefcase },
]

const executiveNav = [
  { title: "Dashboard", href: "/executive/dashboard", icon: LayoutDashboard },
  { title: "Students", href: "/executive/students", icon: Users },
  { title: "Companies", href: "/executive/companies", icon: Building2 },
  { title: "Jobs", href: "/executive/jobs", icon: Briefcase },
  { title: "Statistics", href: "/executive/stats", icon: BarChart3 },
]

const adminNav = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Companies", href: "/admin/companies", icon: Building2 },
  { title: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { title: "Skills Master", href: "/admin/skills", icon: Settings },
]

export function AppSidebar() {
  const { role } = useAuth()
  const pathname = usePathname()

  const navItems =
    role === "student"
      ? studentNav
      : role === "executive"
        ? executiveNav
        : adminNav

  const roleLabel =
    role === "student"
      ? "Student"
      : role === "executive"
        ? "Executive"
        : "Admin"

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5">
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <GraduationCap className="h-6 w-6 text-sidebar-primary" />
          <span className="text-lg font-bold text-sidebar-foreground">
            SmartPlace
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{roleLabel} Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* <SidebarFooter className="px-4 py-3">
        <p className="text-xs text-sidebar-foreground/50">
          CareerQuant v1.0
        </p>
      </SidebarFooter> */}
    </Sidebar>
  )
}
