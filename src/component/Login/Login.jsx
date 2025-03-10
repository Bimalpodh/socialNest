import "../Login/login.css";

import { useState, useRef } from "preact/hooks";
import { checkValidData } from "../Utils/validate";

const Login = () => {
  const [isSignIn, setIsSignIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const name = useRef(null);
  const email = useRef(null);
  const password = useRef(null);

  const handleButtonClick = () => {
    

    const message = checkValidData(
      name.current ? name.current.value : "",
      email.current.value,
      password.current.value
    );

    setErrorMessage(message);
    if (message) return;
  };

  const toggleHandling = () => {
    setIsSignIn(!isSignIn); // Toggle instead of setting only `true`
  };

  return (
    <div className="login-Container">
      <div className="login-box">
        <div className="header-container">
          <img
            className="logo"
            src="https://easydrawingguides.com/wp-content/uploads/2021/01/how-to-draw-a-cartoon-bird-featured-image-1200-1024x834.png"
            alt="Logo"
          />
          <h3>Social Nest</h3>
        </div>
        <div className="form-container">
          <form onSubmit={(e)=>e.preventDefault()} >
            {isSignIn && (
              <>
                <input ref={name} type="text" placeholder="Full Name" />
                <input type="text" placeholder="User Name" />
              </>
            )}

            <input
              ref={email}
              type="text"
              placeholder={isSignIn ? "Phone number or Email" : "Email"}
            />
            <input ref={password} type="password" placeholder="Password" />

            <p>{errorMessage}</p>
            <button onClick={handleButtonClick}>
              {!isSignIn ? "Sign In" : "Sign Up"}
            </button>

            {isSignIn && <p>Forgotten Password</p>}

            <p>
              {!isSignIn ? "Don't have an account?" : "Have an account?"}
              <span onClick={toggleHandling}>
                {isSignIn ? " Sign In" : " Sign Up"}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
