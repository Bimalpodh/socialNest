import React, { useEffect, useState } from "react";
import "./SearchPage.css";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../Utils/firebase";
import { useNavigate } from "react-router";

export default function SearchPage({openSearchBar}) {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const navigate=useNavigate();

  useEffect(() => {
    if (input.trim()) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [input]);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, "users"); // Make sure you're searching in the "users" collection
      const q = query(usersRef, where(`displayName`, ">=", input), where("displayName", "<=", input + "\uf8ff"));
      const querySnapshot = await getDocs(q);
      const userData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const handleNav=(i)=>{
    navigate("/friendprofile", { state: { friendsId: i} });
  }

  return (
    <div>
      <div className="searchContainer">
        <input
          type="text"
          placeholder="Search users..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="searchItems" >
          {users.map((user) => (
            <div className="userData" onClick={()=>handleNav(user.uid)}>
              <img src={user.photoURL}/>
              <p key={user.id}>{user.displayName}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
