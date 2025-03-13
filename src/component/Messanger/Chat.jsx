import "./chat.css";
import Message from "./Message";
import Header from "../HomePage/Header";

const Chat = () => {

  
  return (
    <div className="chat-box-container">
            <div>
          <Header/>
        </div>
      <div className="chat-box">

        <div className="Chat-Header">
          <h3>Bimal_babu_08</h3>
          <div className="search-container">
            <input type="text" />
            <img src="./src/assets/image/search 2.png"></img>
          </div>
        </div>
        <div className="friends-List">
          {Array.from({ length: 100 }, (_, i) => (
            <div className="friends">
              <img
                src="https://imgs.search.brave.com/z_7_jZD7O6KpJ9M4Lgjl3JWhbrO49elKcD2vBIU1M6A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL00v/TVY1QlptVTJOV0Zt/TUdJdE5UbGlNaTAw/WVRNMkxXSXhaakV0/WlRVNVpUaGlNak15/WlRJeFhrRXlYa0Zx/Y0djQC5qcGc"
                alt="MyImg"
              />
              <label>Sai_Pallavi</label>
            </div>
          ))}
        </div>
      </div>
      
        <Message/>
      
    </div>
  );
};

export default Chat;
