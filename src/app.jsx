import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import appStore from "./component/ReduxStore/appStore.jsx";
import AuthHandler from "./component/Login/AuthHandler.jsx";
import Home from "./component/HomePage/Home.jsx";
import Setting from "./component/SettingPage/Setting.jsx";
import Chat from "./component/Messanger/Chat.jsx";
import Login from "./component/Login/Login.jsx";
import "./app.css";
import Profile from "./component/ProfilePage/Profile.jsx";
import FriendsProfile from "./component/friendsProfile/FriendsProfile.jsx";
import PostDetail from "./component/PostDetails/Postdetail.jsx";
import Test from "./Test.jsx";
import SearchPage from "./component/SearchPage/SearchPage.jsx";

// Layout component to wrap routes
const AppLayout = () => {
  return (
    <div className="app">
      <><Outlet />
      </>
      
    </div>
  );
};

// Define Routes
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AuthHandler />, // Global auth management
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/setting",
        element: <Setting />,
      },
      {
        path: "/chat",
        element: <Chat />,
      },
      {
        path: "/friendprofile",
        element: <FriendsProfile />,
      },
      {
        path: "/post/:postId",
        element: <PostDetail />,
      },
      // {
        
      //     path: "/search",
      //     element: <SearchPage />,
        
      // }
      ,
      {
        path:"/test",
        element:<Test />
      }
      
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

