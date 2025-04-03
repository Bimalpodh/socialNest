import { useEffect, useState } from "react";
import { auth, db } from "../Utils/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import "./message.css";

const Message = ({ friend }) => {
  const [messages, setMessages] = useState([]);
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
      setNewMessage("");
    } else {
      alert("You must be mutual friends to send messages.");
    }
  };

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
          <div key={msg.id} className={msg.senderId === currentUser.uid ? "send-box" : "reciev-box"}>
            <div className={msg.senderId === currentUser.uid ? "sender" : "reciever"}>{msg.text}</div>
          </div>
        ))}
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
