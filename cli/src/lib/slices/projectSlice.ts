import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project } from "../api/apiSlice";

interface ProjectState {
  currentProject: Project | null;
  selectedProjects: string[];
  filters: {
    status?: string;
    search?: string;
    sortBy?: "name" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
  };
  view: "grid" | "list";
}

const initialState: ProjectState = {
  currentProject: null,
  selectedProjects: [],
  filters: {
    sortBy: "updatedAt",
    sortOrder: "desc",
  },
  view: "grid",
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    selectProject: (state, action: PayloadAction<string>) => {
      if (!state.selectedProjects.includes(action.payload)) {
        state.selectedProjects.push(action.payload);
      }
    },
    deselectProject: (state, action: PayloadAction<string>) => {
      state.selectedProjects = state.selectedProjects.filter(
        (id) => id !== action.payload
      );
    },
    toggleProjectSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedProjects.indexOf(action.payload);
      if (index >= 0) {
        state.selectedProjects.splice(index, 1);
      } else {
        state.selectedProjects.push(action.payload);
      }
    },
    selectAllProjects: (state, action: PayloadAction<string[]>) => {
      state.selectedProjects = action.payload;
    },
    clearSelectedProjects: (state) => {
      state.selectedProjects = [];
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<ProjectState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        sortBy: "updatedAt",
        sortOrder: "desc",
      };
    },
    setView: (state, action: PayloadAction<ProjectState["view"]>) => {
      state.view = action.payload;
    },
  },
});

export const {
  setCurrentProject,
  selectProject,
  deselectProject,
  toggleProjectSelection,
  selectAllProjects,
  clearSelectedProjects,
  setFilters,
  clearFilters,
  setView,
} = projectSlice.actions;

export default projectSlice.reducer;
