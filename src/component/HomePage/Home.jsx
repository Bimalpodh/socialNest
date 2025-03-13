import React from "react";
import "./home.css";
import Story from "./Story";
import Post from "./Post";
import Suggest from "./Suggest";
import Header from "./Header";



export default function Home() {
  return (
    <div className="firstContainer">
      <div>
        <Header/>
      </div>
      <div className="Containt-box">
        <div className="story">
          <Story />
        </div>
        <div className="types">
          <ul className="type" >
            <li className="all" >All</li>
            <li className="follwer">Follower</li>
            <li className="following">Following</li>
            <li className="popular">Popular</li>
          </ul>
        </div>
        <Post/>
      </div>
       <Suggest/>
      
    </div>
  );
}
