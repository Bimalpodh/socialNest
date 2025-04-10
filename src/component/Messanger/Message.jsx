import { useEffect, useState } from "react";
import { auth, db } from "../Utils/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import "./message.css";

const Message = ({ friend }) => {
  const [messages, setMessages] = useState([]);
  const [suggestion,setSuggetion]=useState([])
  const [newMessage, setNewMessage] = useState("");
  const currentUser = auth.currentUser;

  if (!currentUser || !friend) return null;
  
  const chatId = [currentUser.uid, friend.id].sort().join("_");

  useEffect(() => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const currentUserRef = doc(db, "users", currentUser.uid);
    const friendRef = doc(db, "users", friend.id);
    
    const currentUserSnap = await getDoc(currentUserRef);
    const friendSnap = await getDoc(friendRef);

  
    
    if (
      currentUserSnap.exists() && 
      friendSnap.exists() && 
      currentUserSnap.data().friends.includes(friend.id) && 
      friendSnap.data().friends.includes(currentUser.uid)
    ) {
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        senderId: currentUser.uid,
        receiverId: friend.id,
        text: newMessage,
        timestamp: new Date(),
      });
      await setDoc(doc(db,"suggestChat",currentUser.uid),{
        userId:currentUser.uid,
        suggestionChat:arrayUnion(newMessage)
      },
      {merge:true}
    );
      setNewMessage("");
    } else {
      alert("You must be mutual friends to send messages.");
    }
  };
  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  useEffect(()=>{
    const suggestChat=doc(db,"suggestChat",currentUser.uid);
    const snapShot=onSnapshot(suggestChat,(s)=>{
      if(s.exists()){
        setSuggetion(s.data().suggestionChat||[])
      }
    })
    return()=>snapShot()
  },[])





  const filteredSuggestions = suggestion.filter(
    (msg) => msg.toLowerCase().startsWith(newMessage.toLowerCase()) && newMessage.trim() !== ""
  )


  return (
    <div className="message-container">
      <div className="messageHeader">
        <div className="profileContainer">
          <img src={friend.photoURL} alt={friend.displayName} />
          <label>{friend.displayName}</label>
        </div>
      </div>

      <div className="message-box">
        {messages.map((msg) => (
          <div className={msg.senderId === currentUser.uid ? "send-box" : "receive-box"}>
        <span className="mm">{msg.text}</span>
        <span className="time-stamp">
          {msg.timestamp?.Time || formatTime(msg.timestamp)}
        </span>
      </div>
        ))}
      </div>
      <div className="ss">
      <div className="suggetion">
        {filteredSuggestions.length > 0 && (
          <div className="suggetion-msg">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => setNewMessage(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      <div className="typeBoxContainer">
      
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="send-btn" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Message;
