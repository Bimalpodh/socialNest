import React, { useState, useRef, useEffect } from "react";
import "./home.css";
import Story from "../Story/Story";
import Post from "./Post";
import Suggest from "./Suggest";
import Header from "./Header";
import UploadFeedPopup from "../PopPage/UploadFeedPopup"; // ✅ Import correctly
import { auth } from "../Utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router";

export default function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [popupWidth, setPopupWidth] = useState("650px");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  //  Check if user is logged in and persist authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (!user) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (containerRef.current) {
      setPopupWidth(`${containerRef.current.offsetWidth}px`);
    }
  }, []);

  if (loading) return null; // ✅ Prevents flashing of Home page before redirect

  return currentUser ? ( // ✅ Ensures the page only renders when user is authenticated
    <div className="firstContainer">
      <Header popHandling={() => setIsPopupOpen(true)} />

      <div className="Containt-box" ref={containerRef}>
        <div className="story">
          <Story />
        </div>

        <div className="popHandler">
          {isPopupOpen && (
            <UploadFeedPopup
              isOpen={isPopupOpen}
              closePopup={() => setIsPopupOpen(false)}
              popupWidth={popupWidth} // ✅ Pass dynamic width
            />
          )}
        </div>

        
        <Post />
      </div>
      <Suggest />
    </div>
  ) : null; // ✅ Prevents rendering if user is null
}
