"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Home,
  Globe,
  Users,
  FileText,
  Settings,
  HelpCircle,
  BarChart3,
  Edit,
  Eye,
  LogOut,
  X,
  User,
  Building,
  CreditCard,
  UserPlus,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface ProjectData {
  id: string;
  title: string;
  businessName: string;
  businessType: string;
  lastModified: string;
  status: "published" | "unpublished";
  previewImage: string;
  websiteData: {
    id: string;
    title: string;
    businessName: string;
    businessType: string;
    location: string;
    blocks: Array<{
      id: string;
      type: string;
      content: Record<string, unknown>;
      styles: Record<string, unknown>;
    }>;
    theme: {
      colors: Record<string, string>;
      fonts: Record<string, string>;
    };
  };
}

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [recentProjects, setRecentProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      window.location.href = "/";
    }
    // NO onboarding logic - dashboard is just a normal page
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Load recent projects from localStorage
      try {
        const projects: ProjectData[] = JSON.parse(
          localStorage.getItem(`recent_projects_${user.id}`) || "[]"
        );
        setRecentProjects(projects);
      } catch (error) {
        console.error("Error loading recent projects:", error);
        setRecentProjects([]);
      }
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentTime = new Date().getHours();
  const greeting =
    currentTime < 12
      ? "Good morning"
      : currentTime < 18
      ? "Good afternoon"
      : "Good evening";

  // Get the most recent project for the main website card
  const mostRecentProject =
    recentProjects.length > 0 ? recentProjects[0] : null;

  const mainNavItems = [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Website",
      url: "/website",
      icon: Globe,
    },
    {
      title: "Contacts",
      url: "/contacts",
      icon: Users,
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: FileText,
    },
  ];

  const bottomNavItems = [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      onClick: () => setShowUserMenu(true),
    },
    {
      title: "Help",
      url: "/help",
      icon: HelpCircle,
    },
  ];

  const handleLogout = () => {
    signOut(() => {
      window.location.href = "/";
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white flex w-full">
        <Sidebar className="fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l bg-white">
          <SidebarHeader className="p-4 bg-white flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">Menu</div>
          </SidebarHeader>

          <SidebarContent className="flex-1 bg-white">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1 p-4">
                  {mainNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.isActive}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          item.isActive
                            ? "bg-gray-100 text-gray-900 font-medium shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                        }`}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span
                            className={`text-sm ${
                              item.isActive ? "font-medium" : "font-normal"
                            }`}
                          >
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="bg-white">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1 p-4">
                  {bottomNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild={!item.onClick}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-all duration-200"
                        onClick={item.onClick}
                      >
                        {item.onClick ? (
                          <div>
                            <item.icon className="h-4 w-4" />
                            <span className="font-normal text-sm">
                              {item.title}
                            </span>
                          </div>
                        ) : (
                          <Link href={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span className="font-normal text-sm">
                              {item.title}
                            </span>
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Always Visible Sidebar Toggle */}
        <SidebarTrigger className="fixed top-4 left-4 z-20 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200 bg-white border border-gray-200 shadow-sm" />

        <SidebarInset className="flex-1">
          {/* Main Content */}
          <div className="flex-1 p-4 md:p-8 ml-16 pt-16">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="jsx-d1bf2febfabc5633 font-cursive italic text-2xl sm:text-3xl md:text-4xl font-normal text-gray-800 mb-3">
                {greeting}, welcome to EonLogic
              </h1>
            </div>

            {/* Top Section - Website Card and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Website Preview Card - Show Most Recent Project */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <span className="font-medium text-gray-900">Website</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mostRecentProject?.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      •{" "}
                      {mostRecentProject?.status === "published"
                        ? "Published"
                        : "Unpublished"}
                    </span>
                  </div>
                </div>

                {/* Website Preview */}
                <div className="relative">
                  {mostRecentProject ? (
                    <div
                      className="aspect-video flex items-center justify-center text-white bg-cover bg-center"
                      style={{
                        backgroundImage: mostRecentProject.previewImage
                          ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${mostRecentProject.previewImage})`
                          : "linear-gradient(to-br, #4f46e5, #7c3aed)",
                      }}
                    >
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">
                          {mostRecentProject.businessName}
                        </h3>
                        <p className="text-sm opacity-90 mb-4">
                          {mostRecentProject.businessType} • Last edited{" "}
                          {formatDate(mostRecentProject.lastModified)}
                        </p>
                        <div className="inline-block px-4 py-2 bg-blue-600 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                          Get Started
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white">
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">
                          Your Amazing Business
                        </h3>
                        <p className="text-sm opacity-90 mb-4">
                          Professional website coming soon
                        </p>
                        <div className="inline-block px-4 py-2 bg-blue-600 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                          Get Started
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <div className="flex space-x-2">
                      <button className="p-1 bg-black bg-opacity-20 rounded hover:bg-opacity-30 transition-colors">
                        <Eye className="h-4 w-4 text-white" />
                      </button>
                      <button className="p-1 bg-black bg-opacity-20 rounded hover:bg-opacity-30 transition-colors">
                        <Edit className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <Link href="/website">
                    <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 shadow-none">
                      Edit and publish website
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Analytics Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      Daily visits
                    </span>
                  </div>
                </div>

                {/* Simple Chart Placeholder */}
                <div className="h-40 flex items-end justify-center space-x-2 mb-4">
                  {[2, 4, 3, 7, 5, 8, 6].map((height, index) => (
                    <div
                      key={index}
                      className="bg-blue-200 w-8 rounded-t hover:bg-blue-300 transition-colors cursor-pointer"
                      style={{ height: `${height * 12}px` }}
                    />
                  ))}
                </div>

                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                    Sample Data
                  </span>
                </div>

                <div className="mt-4">
                  <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 shadow-none">
                    View analytics
                  </Button>
                </div>
              </div>
            </div>

            {/* Recent Projects Section - Show if we have more than one project */}
            {recentProjects.length > 1 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentProjects.slice(1, 4).map((project) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div
                        className="aspect-video flex items-center justify-center text-white bg-cover bg-center"
                        style={{
                          backgroundImage: project.previewImage
                            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${project.previewImage})`
                            : "linear-gradient(to-br, #4f46e5, #7c3aed)",
                        }}
                      >
                        <div className="text-center">
                          <h3 className="text-lg font-bold mb-1">
                            {project.businessName}
                          </h3>
                          <p className="text-xs opacity-90">
                            {project.businessType}
                          </p>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              project.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {project.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-500">
                          Last edited {formatDate(project.lastModified)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Section - Three Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Latest Contacts */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-700 text-sm">
                      Latest contacts
                    </span>
                  </div>
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-6">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-500">No contacts yet</p>
                    </div>
                    <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 shadow-none">
                      Go to contacts
                    </Button>
                  </div>
                </div>
              </div>

              {/* Latest Invoices */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-700 text-sm">
                      Latest invoices
                    </span>
                  </div>
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-6">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-500">No invoices yet</p>
                    </div>
                    <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 shadow-none">
                      Go to invoices
                    </Button>
                  </div>
                </div>
              </div>

              {/* Latest Blog Posts */}
              <div className="bg-white rounded-xl shadow-sm md:col-span-2 lg:col-span-1">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Edit className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-700 text-sm">
                      Latest blog posts
                    </span>
                  </div>
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-6">
                      <Edit className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-500">No blog posts yet</p>
                    </div>
                    <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 shadow-none">
                      Go to blog
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>

        {/* User Menu Popup */}
        {showUserMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.firstName?.charAt(0) ||
                        user?.emailAddresses[0]?.emailAddress.charAt(0) ||
                        "U"}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {user?.username || user?.firstName || "User"}
                  </span>
                </div>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Profile</span>
                </Link>

                <Link
                  href="/business"
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Building className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Business details</span>
                </Link>

                <Link
                  href="/team"
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <UserPlus className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Team</span>
                </Link>

                <Link
                  href="/invoicing"
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Receipt className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Invoicing</span>
                </Link>

                <Link
                  href="/subscription"
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Subscription</span>
                </Link>

                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <LogOut className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}
