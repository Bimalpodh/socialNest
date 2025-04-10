import React, { useState, useRef, useEffect } from "react";
import "./home.css";
import Story from "../Story/Story";
import Post from "./Post";
import Suggest from "./Suggest";
import Header from "./Header";
import UploadFeedPopup from "../PopPage/UploadFeedPopup"; 
import { auth } from "../Utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router";
import SearchPage from "../SearchPage/SearchPage";


export default function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [popupWidth, setPopupWidth] = useState("650px");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSearch,setOpenSeaarch]=useState(false) 

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

  if (loading) return null;

  return currentUser ? ( 
    <div className="firstContainer" >
      <Header popHandling={() => setIsPopupOpen(true) } openSearchBar={()=>setOpenSeaarch(true)} />

      <div className="Containt-box" ref={containerRef} onClick={()=>{setOpenSeaarch(false)}}>
        <div className="story">
          
        </div>

        <div className="popHandler">
          {isPopupOpen && (
            <UploadFeedPopup
              isOpen={isPopupOpen}
              closePopup={() => setIsPopupOpen(false)}
              popupWidth={popupWidth} 
            />
          )}
        </div>

        <Story />
        <Post />
      </div>
      {openSearch ? (<SearchPage/>):<Suggest/>}
    </div>
  ) : null; 
}
