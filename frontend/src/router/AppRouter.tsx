import { createBrowserRouter, type RouteObject } from "react-router-dom";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import CommentPage from "../pages/CommentPage";
import Profile from "../pages/Profile";
import EditProfile from "../pages/EditProfile";
import Login from "../pages/Login";
import Register from "../pages/Register";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "edit-profile", element: <EditProfile /> },
      { path: "profile", element: <Profile /> },
      { path: "comment", element: <CommentPage /> },
    ],
  },

  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  // { path: '*', element: <NOTFOUND />,},
];

const router = createBrowserRouter(routes);

export default router;
