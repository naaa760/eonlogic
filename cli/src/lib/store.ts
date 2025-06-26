import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./api/apiSlice";
import authSlice from "./slices/authSlice";
import uiSlice from "@/lib/slices/uiSlice";
import projectSlice from "@/lib/slices/projectSlice";

export const store = configureStore({
  reducer: {
    // API slice for RTK Query
    [apiSlice.reducerPath]: apiSlice.reducer,

    // Feature slices
    auth: authSlice,
    ui: uiSlice,
    projects: projectSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
