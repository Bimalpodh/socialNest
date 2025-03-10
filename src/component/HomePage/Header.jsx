import "./header.css";
import { Link } from "react-router";
const Header = () => {
  return (
    <div className="Header">
      <ul className="header-element">
        <div className="bar">
        <Link className="link" to="/home">
          <li className="Home"></li>
          <span className="nav-name">Home</span>
          </Link>
        </div>
        <div className="bar">
          <Link className="link" to="/chat">
          <li className="chat"></li>
          <span className="nav-name">Message</span>
          </Link>
          
        </div>
        <div className="bar">
          <Link className="link" to="/setting">
            <li className="setting"></li>
            <span className="nav-name">Setting</span>
          </Link>
        </div>
      </ul>
    </div>
  );
};
export default Header;
