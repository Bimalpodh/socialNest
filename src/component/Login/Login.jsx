import "../Login/login.css";

import { useState, useRef } from "preact/hooks";
import { checkValidData } from "../Utils/validate";
import { auth } from "../Utils/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showLoginForm,  setShowLoginForm] = useState(false);
  const navigate = useNavigate();
  const dispatch=useDispatch();
  const name = useRef(null);
  const email = useRef(null);
  const password = useRef(null);

  const handleButtonClick = () => {
    // Validate the form data
    const message = checkValidData(
      email.current?.value,
      password.current?.value,
      name.current?.value
    );
    setErrorMessage(message);
    if (message) return;

    //sign in sign up logic
    if (isSignInForm) {
      // sign up Logic
      createUserWithEmailAndPassword
      (
        auth, 
        email.current.value, 
        password.current.value
      )

        .then((userCredential) => {
          // Signed up (when user succesfully sign up )
          const user = userCredential.user;

          // Updating a user Profile
          updateProfile(user, {
            displayName: name.current.value,
            photoURL: "https://avatars.githubusercontent.com/u/172463907?v=4",
          })
            .then(() => {
              // Profile updated!
              const {uid,email,displayName,photoURL} = auth.currentUser;
                    dispatch(addUser(
                      {
                        uid:uid,
                        email:email,
                        displayName:displayName,
                        photoURL:photoURL
                      }
                    ));
              navigate("/home");

              // ...
            })
            .catch((error) => {
              // An error occurred
              setErrorMessage(error.message)
              // ...
            });
          console.log(user);

          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setErrorMessage(errorCode + " - " + errorMessage);
          // ..
        });
    } else {
      // sign in logic
      signInWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log(user);
          navigate("/home");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setErrorMessage(errorCode + " - " + errorMessage);
        });
    }
  };

  const handleSignInClick = () => {
    setShowLoginForm(true);
  };

  const toggleHandling = () => {
    setIsSignInForm(!isSignInForm); // Toggle instead of setting only `true`
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
          <form onSubmit={(e) => e.preventDefault()}>
            {isSignInForm && (
              <>
                <input ref={name} type="text" placeholder="Full Name" />
                <input type="text" placeholder="User Name" />
              </>
            )}

            <input
              ref={email}
              type="text"
              placeholder={isSignInForm ? "Phone number or Email" : "Email"}
            />
            <input ref={password} type="password" placeholder="Password" />

            <p>{errorMessage}</p>
            <button onClick={handleButtonClick}>
              {!isSignInForm ? "Sign In" : "Sign Up"}
            </button>

            {isSignInForm && <p>Forgotten Password</p>}

            <p>
              {!isSignInForm ? "Don't have an account?" : "Have an account?"}
              <span onClick={toggleHandling}>
                {isSignInForm ? " Sign In" : " Sign Up"}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
