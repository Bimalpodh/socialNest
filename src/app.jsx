import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import appStore from "./component/ReduxStore/appStore.jsx";

import Header from "./component/HomePage/Header.jsx";
import Home from "./component/HomePage/Home.jsx";
import Setting from "./component/SettingPage/Setting.jsx";
import Chat from "./component/Messanger/Chat.jsx";
import Login from "./component/Login/Login.jsx";
import "./app.css";

// Layout component to wrap routes
const AppLayout = () => {
  return (
    <div className="app">
      <Outlet />
    </div>
  );
};

// Define Routes
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/setting",
        element: <Setting />,
      },
      {
        path: "/chat",
        element: <Chat />,
      },
    ],
  },
]);

// Render the App with Redux Provider
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={appStore}>
      <RouterProvider router={appRouter} />
    </Provider>
  </React.StrictMode>
);

