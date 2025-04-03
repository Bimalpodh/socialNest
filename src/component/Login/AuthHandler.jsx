import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Utils/firebase";
import { addUser, removeUser } from "../ReduxStore/userSlice";
import { useNavigate, Outlet, useLocation } from "react-router-dom";


const AuthHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Get current path

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email, displayName,photoURL } = user;
        dispatch(addUser({ uid:uid, email:email, displayName:displayName,photoURL:photoURL }));

        // Redirect only if the user was on the login page ("/")
        if (location.pathname === "/") {
          navigate("/home");
        }
      } else {
        dispatch(removeUser());
        navigate("/"); // Redirect to login if logged out
      }
    });

    return () => unsubscribe();
  }, []); // Include location.pathname

  return <Outlet />; // Render child routes
};

export default AuthHandler;
