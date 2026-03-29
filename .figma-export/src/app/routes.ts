import { createBrowserRouter } from "react-router";
import AppRoot from "./AppRoot";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";
import Simulation from "./components/Simulation";
import Roadmap from "./components/Roadmap";
import Profile from "./components/Profile";

import Setup from "./components/Setup";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppRoot,
    children: [
      { index: true, Component: Home },
      { path: "setup", Component: Setup },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      {
        path: "dashboard",
        Component: DashboardLayout,
        children: [
          { index: true, Component: Dashboard },
        ],
      },
      {
        path: "simulation",
        Component: DashboardLayout,
        children: [
          { index: true, Component: Simulation },
        ],
      },
      {
        path: "roadmap",
        Component: DashboardLayout,
        children: [
          { index: true, Component: Roadmap },
        ],
      },
      {
        path: "profile",
        Component: DashboardLayout,
        children: [
          { index: true, Component: Profile },
        ],
      },
    ],
  },
]);
