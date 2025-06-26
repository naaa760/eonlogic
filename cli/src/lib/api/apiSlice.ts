import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define types
export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    projects: number;
    websites: number;
    templates: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  businessType: string;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
  userId: string;
  websites?: Website[];
  _count: {
    websites: number;
    aiContent: number;
  };
}

export interface Website {
  id: string;
  name: string;
  domain?: string;
  subdomain: string;
  status: "BUILDING" | "REVIEW" | "LIVE" | "MAINTENANCE";
  isPublished: boolean;
  theme: string;
  primaryColor: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  projectId: string;
  templateId?: string;
  pages?: Page[];
  project?: Pick<Project, "id" | "name" | "businessType">;
  template?: Template;
  _count: {
    pages: number;
  };
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  title: string;
  content: PageContent;
  isHomePage: boolean;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  websiteId: string;
}

export interface PageContent {
  sections: Array<{
    id: string;
    type: string;
    content: Record<string, unknown>;
  }>;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  businessType: string;
  thumbnail: string;
  isPublic: boolean;
  structure: TemplateStructure;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  creator?: Pick<User, "id" | "firstName" | "lastName">;
  _count: {
    websites: number;
  };
}

export interface TemplateStructure {
  pages: Array<{
    name: string;
    slug: string;
    content: PageContent;
  }>;
}

export interface AIContent {
  id: string;
  type:
    | "WEBSITE_STRUCTURE"
    | "PAGE_CONTENT"
    | "BLOG_POST"
    | "SEO_CONTENT"
    | "MARKETING_COPY"
    | "BUSINESS_DESCRIPTION";
  prompt: string;
  content: Record<string, unknown>;
  status: "PROCESSING" | "COMPLETED" | "FAILED" | "PENDING";
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  websiteId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardStats {
  projects: number;
  websites: number;
  templates: number;
  aiGenerations: number;
}

export interface WebsiteGenerationRequest {
  businessType: string;
  businessName: string;
  description?: string;
  targetAudience?: string;
  features?: string[];
  style?: string;
}

export interface ContentGenerationRequest {
  type: string;
  topic: string;
  keywords?: string[];
  tone?: string;
  length?: string;
}

// Create the API slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000",
    prepareHeaders: (headers) => {
      // We'll get the token from Clerk in the component level
      return headers;
    },
  }),
  tagTypes: ["User", "Project", "Website", "Template", "AIContent", "Page"],
  endpoints: (builder) => ({
    // User endpoints
    getUserProfile: builder.query<ApiResponse<User>, void>({
      query: () => "/api/users/profile",
      providesTags: ["User"],
    }),

    updateUserProfile: builder.mutation<ApiResponse<User>, Partial<User>>({
      query: (data) => ({
        url: "/api/users/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    getUserDashboard: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => "/api/users/dashboard",
      providesTags: ["User", "Project", "Website"],
    }),

    // Project endpoints
    getProjects: builder.query<
      PaginatedResponse<Project>,
      { page?: number; limit?: number; status?: string; search?: string }
    >({
      query: ({ page = 1, limit = 10, status, search } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (status) params.append("status", status);
        if (search) params.append("search", search);
        return `/api/projects?${params}`;
      },
      providesTags: ["Project"],
    }),

    getProject: builder.query<ApiResponse<Project>, string>({
      query: (id) => `/api/projects/${id}`,
      providesTags: (result, error, id) => [{ type: "Project", id }],
    }),

    createProject: builder.mutation<
      ApiResponse<Project>,
      { name: string; description?: string; businessType: string }
    >({
      query: (data) => ({
        url: "/api/projects",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),

    updateProject: builder.mutation<
      ApiResponse<Project>,
      { id: string; data: Partial<Project> }
    >({
      query: ({ id, data }) => ({
        url: `/api/projects/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Project", id }],
    }),

    deleteProject: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/api/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),

    // Website endpoints
    getWebsites: builder.query<
      PaginatedResponse<Website>,
      {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        projectId?: string;
      }
    >({
      query: ({ page = 1, limit = 10, status, search, projectId } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (status) params.append("status", status);
        if (search) params.append("search", search);
        if (projectId) params.append("projectId", projectId);
        return `/api/websites?${params}`;
      },
      providesTags: ["Website"],
    }),

    getWebsite: builder.query<ApiResponse<Website>, string>({
      query: (id) => `/api/websites/${id}`,
      providesTags: (result, error, id) => [{ type: "Website", id }],
    }),

    createWebsite: builder.mutation<
      ApiResponse<Website>,
      {
        name: string;
        subdomain: string;
        projectId: string;
        templateId?: string;
        theme?: string;
        primaryColor?: string;
      }
    >({
      query: (data) => ({
        url: "/api/websites",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Website", "Project"],
    }),

    updateWebsite: builder.mutation<
      ApiResponse<Website>,
      { id: string; data: Partial<Website> }
    >({
      query: ({ id, data }) => ({
        url: `/api/websites/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Website", id }],
    }),

    publishWebsite: builder.mutation<ApiResponse<Website>, string>({
      query: (id) => ({
        url: `/api/websites/${id}/publish`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Website", id }],
    }),

    checkSubdomain: builder.query<
      ApiResponse<{ available: boolean; message: string }>,
      string
    >({
      query: (subdomain) => `/api/websites/check-subdomain/${subdomain}`,
    }),

    // Template endpoints
    getTemplates: builder.query<
      PaginatedResponse<Template>,
      {
        page?: number;
        limit?: number;
        category?: string;
        businessType?: string;
        search?: string;
      }
    >({
      query: ({
        page = 1,
        limit = 12,
        category,
        businessType,
        search,
      } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (category) params.append("category", category);
        if (businessType) params.append("businessType", businessType);
        if (search) params.append("search", search);
        return `/api/templates?${params}`;
      },
      providesTags: ["Template"],
    }),

    getTemplate: builder.query<ApiResponse<Template>, string>({
      query: (id) => `/api/templates/${id}`,
      providesTags: (result, error, id) => [{ type: "Template", id }],
    }),

    getPopularTemplates: builder.query<ApiResponse<Template[]>, number>({
      query: (limit = 6) => `/api/templates/featured/popular?limit=${limit}`,
      providesTags: ["Template"],
    }),

    // AI endpoints
    generateWebsite: builder.mutation<
      ApiResponse<Record<string, unknown>>,
      WebsiteGenerationRequest
    >({
      query: (data) => ({
        url: "/api/ai/generate-website",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AIContent"],
    }),

    generateContent: builder.mutation<
      ApiResponse<Record<string, unknown>>,
      ContentGenerationRequest
    >({
      query: (data) => ({
        url: "/api/ai/generate-content",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AIContent"],
    }),

    getAIHistory: builder.query<
      PaginatedResponse<AIContent>,
      { page?: number; limit?: number; type?: string }
    >({
      query: ({ page = 1, limit = 10, type } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (type) params.append("type", type);
        return `/api/ai/history?${params}`;
      },
      providesTags: ["AIContent"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetUserDashboardQuery,
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetWebsitesQuery,
  useGetWebsiteQuery,
  useCreateWebsiteMutation,
  useUpdateWebsiteMutation,
  usePublishWebsiteMutation,
  useCheckSubdomainQuery,
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useGetPopularTemplatesQuery,
  useGenerateWebsiteMutation,
  useGenerateContentMutation,
  useGetAIHistoryQuery,
} = apiSlice;
