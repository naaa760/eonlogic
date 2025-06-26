"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Plus,
  Globe,
  BarChart3,
  Sparkles,
  Users,
  Settings,
  Eye,
  Edit,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      window.location.href = "/";
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mock data - will be replaced with real API calls
  const stats = [
    {
      title: "Total Projects",
      value: "3",
      change: "+2 this month",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "text-blue-600",
    },
    {
      title: "Published Websites",
      value: "2",
      change: "+1 this week",
      icon: <Globe className="h-6 w-6" />,
      color: "text-green-600",
    },
    {
      title: "AI Generations",
      value: "12",
      change: "+8 today",
      icon: <Sparkles className="h-6 w-6" />,
      color: "text-purple-600",
    },
    {
      title: "Team Members",
      value: "1",
      change: "Just you",
      icon: <Users className="h-6 w-6" />,
      color: "text-orange-600",
    },
  ];

  const recentProjects = [
    {
      id: "1",
      name: "Coffee Shop Website",
      description: "A modern coffee shop with online ordering",
      status: "Published",
      websiteCount: 1,
      updatedAt: "2 hours ago",
      color: "from-amber-400 to-orange-500",
    },
    {
      id: "2",
      name: "Tech Startup Landing",
      description: "SaaS product landing page",
      status: "Draft",
      websiteCount: 0,
      updatedAt: "1 day ago",
      color: "from-blue-400 to-purple-500",
    },
    {
      id: "3",
      name: "Photography Portfolio",
      description: "Creative portfolio for photographer",
      status: "In Progress",
      websiteCount: 1,
      updatedAt: "3 days ago",
      color: "from-pink-400 to-red-500",
    },
  ];

  const quickActions = [
    {
      title: "Create New Project",
      description: "Start a new business project",
      icon: <Plus className="h-8 w-8" />,
      action: () => {},
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Generate with AI",
      description: "Create website using AI",
      icon: <Sparkles className="h-8 w-8" />,
      action: () => {},
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Browse Templates",
      description: "Choose from templates",
      icon: <Globe className="h-8 w-8" />,
      action: () => {},
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  EonLogic
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
                {user?.imageUrl && (
                  <Image
                    src={user.imageUrl}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Let&apos;s continue building amazing websites with AI.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} bg-gray-50 p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-xs text-green-600">{stat.change}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={action.action}
                className={`${action.color} text-white p-6 rounded-xl hover:shadow-lg transition-all group`}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
                    {action.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Projects
            </h2>
            <Button variant="outline">View All Projects</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div
                  className={`h-32 bg-gradient-to-br ${project.color} flex items-center justify-center`}
                >
                  <div className="text-white text-center">
                    <Globe className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">{project.name}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {project.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        project.status === "Published"
                          ? "bg-green-100 text-green-800"
                          : project.status === "Draft"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>
                      {project.websiteCount} website
                      {project.websiteCount !== 1 ? "s" : ""}
                    </span>
                    <span>{project.updatedAt}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>

          <div className="space-y-4">
            {[
              {
                action: "Generated website content",
                project: "Coffee Shop Website",
                time: "2 hours ago",
                icon: <Sparkles className="h-5 w-5 text-purple-600" />,
              },
              {
                action: "Published website",
                project: "Tech Startup Landing",
                time: "1 day ago",
                icon: <Globe className="h-5 w-5 text-green-600" />,
              },
              {
                action: "Created new project",
                project: "Photography Portfolio",
                time: "3 days ago",
                icon: <Plus className="h-5 w-5 text-blue-600" />,
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="bg-gray-100 p-2 rounded-lg">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action} for{" "}
                    <span className="text-blue-600">{activity.project}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
