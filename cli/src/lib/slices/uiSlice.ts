import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebar: {
    isOpen: boolean;
    activeItem?: string;
  };
  modals: {
    createProject: boolean;
    createWebsite: boolean;
    aiGenerator: boolean;
    settings: boolean;
  };
  loading: {
    global: boolean;
    page: boolean;
  };
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    timestamp: number;
  }>;
  theme: "light" | "dark" | "system";
}

const initialState: UIState = {
  sidebar: {
    isOpen: true,
    activeItem: "dashboard",
  },
  modals: {
    createProject: false,
    createWebsite: false,
    aiGenerator: false,
    settings: false,
  },
  loading: {
    global: false,
    page: false,
  },
  notifications: [],
  theme: "light",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },
    setActiveSidebarItem: (state, action: PayloadAction<string>) => {
      state.sidebar.activeItem = action.payload;
    },
    openModal: (state, action: PayloadAction<keyof UIState["modals"]>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState["modals"]>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof UIState["modals"]] = false;
      });
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.page = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<
        Omit<UIState["notifications"][0], "id" | "timestamp">
      >
    ) => {
      const notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setTheme: (state, action: PayloadAction<UIState["theme"]>) => {
      state.theme = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setActiveSidebarItem,
  openModal,
  closeModal,
  closeAllModals,
  setGlobalLoading,
  setPageLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;
