import React from "react";
import { Link } from "react-router";
import "./home.css";
import Story from "./Story";
import Post from "./Post";
import Suggest from "./Suggest";
export default function Home() {
  return (
    <div className="firstContainer">
  
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
