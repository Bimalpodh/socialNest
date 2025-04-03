import { useEffect, useState } from "preact/hooks";
import "./suggest.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../hooks/fetchAllUser"; // ✅ Rename it
import { useNavigate } from "react-router";

const Suggest = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((store) => store.allUser);
  const currentUser = useSelector((store) => store.user);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllUsers()); // ✅ Normal function
  }, []);

  const filteredUser = users.filter(
    (user) =>
      user.uid !== currentUser?.uid &&
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleFriends=(f)=>{
    
    navigate("/friendprofile",{state:{friendsId:f}})
    
  }

  return (
    <div className="suggetion">
      <div className="logo">
        <div className="bird"></div>
      </div>

      <div className="sug-header">
        <h3>People to follow</h3>
        <h4>See all</h4>
      </div>

      <div className="sug-container">
        <div className="sug-holder">
          <div className="frndSearch">
            <input
              type="text"
              placeholder="search people"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <img className="searchImg" src="..\src\assets\image\search.png" alt="search" /> 
          </div>
          {filteredUser.map((user) => (
            <div className="frnd-sug" key={user.uid} onClick={()=>handleFriends(user.uid)}>
              <div className="sug-profile">
                <img className="frnd-sug-img" alt="" src={user.photoURL} />
                <p>{user?.displayName}</p>
              </div>
              <button className="follow">Follow</button>
            </div>
          ))}
        </div>
      </div>

      <div className="SaveContainer">
        Your collection
        <div className="saveHeader">
          {Array.from({ length: 10 }, (_, i) => (
            <div className="your-save" key={i}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Suggest;
