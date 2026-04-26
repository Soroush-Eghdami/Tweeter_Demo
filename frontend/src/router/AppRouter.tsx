import { createBrowserRouter, type RouteObject } from "react-router-dom";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Login from "../pages/Login";
import EditProfile from "../pages/EditProfile";
import Register from "../pages/Register";
import CommentPage from "../pages/CommentPage";

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
