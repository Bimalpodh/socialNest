import { useDispatch, useSelector } from "react-redux";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "preact/hooks";
import { onAuthStateChanged, signOut } from "firebase/auth"; // ✅ Import signOut
import { auth } from "../Utils/firebase";
import { addUser, removeUser } from "../ReduxStore/userSlice"; // ✅ Import removeUser

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        dispatch(removeUser()); // ✅ Ensure user is removed from Redux store
        navigate("/"); // ✅ Redirect to login
      })
      .catch(() => {
        navigate("/error"); // Redirect to an error page if sign-out fails
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email, displayName, photoURL } = user;
        dispatch(addUser({ uid, email, displayName, photoURL }));
      } else {
        dispatch(removeUser()); // ✅ Ensure user is removed when signed out
      }
    });

    return () => unsubscribe(); // ✅ Cleanup subscription on unmount
  }, [dispatch]); // ✅ Added dependencies

  return (
    <div className="Header">
      <div className="logDiv" >
        <div>
        <img src="https://imgs.search.brave.com/Y3W4gav9OVTwx7TGgIqYtm0AgMjVxgCbQZmuXVmpyrc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvZmVhdHVy/ZWQvZGhvbmktaGQt/cGljdHVyZXMtMGFm/ZGhuY2gwM2Jjd3Rz/cS5qcGc" alt=""  />
        </div>
        <p onClick={handleSignOut}>Log Out</p>
      </div>
      <ul className="header-element">
        <div className="bar">
          <Link className="link" to="/home">
            <li className="Home"></li>
            <span className="nav-name">Home</span>
          </Link>
        </div>
        <div className="bar">
          <Link className="link" to="/chat">
            <li className="chat"></li>
            <span className="nav-name">Message</span>
          </Link>
        </div>
        <div className="bar">
          <Link className="link" to="/setting">
            <li className="setting"></li>
            <span className="nav-name">Setting</span>
          </Link>
        </div>
      </ul>
    </div>
  );
};

export default Header;
