import { createBrowserRouter, type RouteObject } from "react-router-dom";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import CommentPage from "../pages/CommentPage";
import MyProfile from "../pages/MyProfile";
import UserProfile from "../pages/UserProfile";
import EditProfile from "../pages/EditProfile";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      {
        path: "edit-profile",
        element: (
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/:id",
        element: <UserProfile />,
      },
      { path: "comment", element: <CommentPage /> },
    ],
  },

  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  // { path: '*', element: <NOTFOUND />,},
];

const router = createBrowserRouter(routes);

export default router;
