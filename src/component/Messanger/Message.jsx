import { useState } from "preact/hooks";
import "./chat.css";
const Message = () => {
  const [recieverProfile, setRecieverProfile] = useState();

  return (
    <div className="message-container">
      <div className="messageHeader">
        <div className="profileContainer">
          <img src="https://imgs.search.brave.com/z_7_jZD7O6KpJ9M4Lgjl3JWhbrO49elKcD2vBIU1M6A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL00v/TVY1QlptVTJOV0Zt/TUdJdE5UbGlNaTAw/WVRNMkxXSXhaakV0/WlRVNVpUaGlNak15/WlRJeFhrRXlYa0Zx/Y0djQC5qcGc"></img>
          <label>sai_pallavi</label>
        </div>
        <div className="contact">
          <img
            className="icon"
            src="./src/assets/image/call.png"
            alt="call"
            srcset=""
          />
          <img
            className="icon"
            src="./src/assets/image/videocall.png"
            alt=""
            srcset=""
          />
        </div>
      </div>
      <div className="message-box">

        {Array.from({length:100},(_,i)=>(
         <>
          <div className="reciev-box">
          <div className="reciever">Hello</div>
          </div>
          <div className="send-box">
            <div className="sender">Hiii</div>
          </div></>
        ))}
        
       
      </div>
      <div className="typeBoxContainer">
        <input type="text" />
        <button className="send-btn" type="button">Send</button>
      </div>
    </div>
  );
};

export default Message;
