import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Header from "./component/HomePage/Header.jsx";
import Home from "./component/HomePage/Home.jsx";
import Setting from "./component/SettingPage/Setting.jsx";
import Chat from "./component/Messanger/Chat.jsx";
import Login from "../src/component/Login/Login.jsx"
import "./app.css";


// Layout component to wrap routes
const AppLayout = () => {
  return (
    <div className="app">
      
      <Header/>
      <Outlet />
    </div>
  );
};

// Define Routes
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // Root layout with Header
    children: [
      {
        index: true, // This makes Home the default child route
        element: <Home />,
      },
      {
        path: "home", // `/home` still works explicitly
        element: <Home />,
      },
      {
        path: "setting",
        element: <Setting />,
      },
      {
        path:"/chat",
        element:<Chat/>,
      }
    ],
  },
]);

// Render the App
const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={appRouter} />
  </React.StrictMode>
);
