import "./chat.css";
import Message from "./Message";
import Header from "../HomePage/Header";
import { useEffect, useState } from "preact/hooks";
import { onAuthStateChanged } from "firebase/auth";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../Utils/firebase";

const Chat = () => {
  const [inputSearch, setSearchInput] = useState("");
  const [myFollowFriend, setMyFollowFriend] = useState([]);
  const [chatUser, setChatUser] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [cTuser, setCTuser] = useState([]);
  const [messageShow, setMessageShow] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userRef);

        if (!userDocSnap.exists()) return;

        const userDoc = userDocSnap.data();
        const friends = userDoc?.following|| userDoc?.followers ||[];

        const friendList = await Promise.all(
          friends.map(async (f) => {
            const friendRef = doc(db, "users", f);
            const friendDoc = await getDoc(friendRef);
            return friendDoc.exists() ? { id: friendDoc.id, ...friendDoc.data() } : null;
          })
        );

        setMyFollowFriend(friendList.filter((friend) => friend !== null));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setChatUser(
      myFollowFriend.filter(
        (friend) =>
          friend.displayName.toLowerCase().startsWith(inputSearch.toLowerCase()) &&
          friend.friends?.includes(auth.currentUser.uid) // ✅ Ensure mutual friendship
      )
    );
  }, [inputSearch, myFollowFriend]);
  


  const handleInput = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSelectFriend = async (friend) => {
    if (!auth.currentUser) return;
  
    const currentUserId = auth.currentUser.uid;
    const friendId = friend.id;
  
    // Fetch current user data
    const currentUserRef = doc(db, "users", currentUserId);
    const currentUserSnap = await getDoc(currentUserRef);
    const currentUserData = currentUserSnap.exists() ? currentUserSnap.data() : {};
  
    // Fetch friend's data
    const friendRef = doc(db, "users", friendId);
    const friendSnap = await getDoc(friendRef);
    const friendData = friendSnap.exists() ? friendSnap.data() : {};
  
    // ✅ Ensure mutual friendship
    if (
      currentUserData.friends?.includes(friendId) &&
      friendData.friends?.includes(currentUserId)
    ) {
      setSelectedFriend(friend);
      setMessageShow(true);
  
      // ✅ Add chatUser to current user's chat list (if not already there)
      if (!currentUserData.chatUser?.includes(friendId)) {
        await updateDoc(currentUserRef, {
          chatUser: arrayUnion(friendId),
        });
      }
    } else {
      alert("You must be mutual friends to start a chat.");
    }
  
    setSearchInput("");
  };
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userRef);
  
          if (!userDocSnap.exists()) return;
  
          const userDoc = userDocSnap.data();
          const ctuser = userDoc.chatUser || [];
  
          const chatList = await Promise.all(
            ctuser.map(async (p) => {
              const ctRef = doc(db, "users", p);
              const cc = await getDoc(ctRef);
              const friendData = cc.exists() ? { id: cc.id, ...cc.data() } : null;
              
              // ✅ Ensure mutual friendship before adding to chat list
              return friendData?.friends?.includes(currentUser.uid) ? friendData : null;
            })
          );
  
          setCTuser(chatList.filter((friend) => friend !== null));
        } catch (error) {
          console.error("Error fetching chat users:", error);
        }
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  return (
    <div className="chat-box-container">
      <Header />

      <div className="chat-box">
        <div className="Chat-Header">
          <div className="search-container">
            <input
              type="text"
              value={inputSearch}
              onChange={handleInput}
              placeholder="Search friends..."
            />
            {inputSearch && (
              <div className="search-results">
                {chatUser.length > 0 ? (
                  chatUser.map((f) => (
                    <div key={f.id} className="search-item" onClick={() => handleSelectFriend(f)}>
                      {f.displayName}
                    </div>
                  ))
                ) : (
                  <p>No friends found</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="friends-List">
          {cTuser.map((p) => (
            <div key={p.id} className="friend-item" onClick={() => handleSelectFriend(p)}>
              <img src={p.photoURL} alt={p.displayName} />
              <div>{p.displayName}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedFriend && <Message friend={selectedFriend} />}
    </div>
  );
};

export default Chat;
