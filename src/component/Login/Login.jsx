import "../Login/login.css";
import { useState, useRef } from "preact/hooks";
import { auth, db } from "../Utils/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { addUser } from "../ReduxStore/userSlice";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { defaultProfilePic } from "../Utils/constant";
import Footer from "../Footer/Footer";

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState(true);
  const [usePhoneAuth, setUsePhoneAuth] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const name = useRef(null);
  const email = useRef(null);
  const password = useRef(null);
  const phone = useRef(null);
  const otp = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const ProfilePic = defaultProfilePic;

  const setUpRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA verified");
          },
        },
        auth
      );
    }
  };

  const sendOtp = async () => {
    const phoneNumber = "+91" + phone.current.value;
    setUpRecaptcha();

    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (error) {
      console.error("OTP send error:", error);
      setErrorMessage(error.message);
    }
  };

  const verifyOtp = async () => {
    try {
      const result = await confirmationResult.confirm(otp.current.value);
      const user = result.user;

      // Check if user is new (optional: store data in Firestore)
      const { uid, phoneNumber } = user;
      dispatch(
        addUser({
          uid,
          email: phoneNumber,
          displayName: "User",
          photoURL: ProfilePic,
        })
      );

      await setDoc(doc(db, "users", uid), {
        uid,
        email: phoneNumber,
        displayName: "User",
        userName: "",
        photoURL: ProfilePic,
        bio: "",
        followers: [],
        following: [],
        accountType: "public",
        friends: [],
        gender: "",
        createdAt: serverTimestamp(),
      });

      navigate("/home");
    } catch (error) {
      setErrorMessage("Invalid OTP. Try again.");
    }
  };

  const handleButtonClick = async () => {
    setErrorMessage(null);

    if (usePhoneAuth) {
      if (!otpSent) {
        if (!phone.current.value) return setErrorMessage("Enter phone number");
        sendOtp();
      } else {
        verifyOtp();
      }
      return;
    }

    // Email/Password login
    if (!email.current.value || !password.current.value) {
      return setErrorMessage("Please fill all fields");
    }

    if (!isSignInForm) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.current.value,
          password.current.value
        );
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: name.current.value,
          photoURL: ProfilePic,
        });

        const { uid, email: userEmail, displayName, photoURL } = auth.currentUser;

        dispatch(addUser({ uid, email: userEmail, displayName, photoURL }));

        await setDoc(doc(db, "users", uid), {
          uid,
          email: userEmail,
          displayName,
          userName: "",
          photoURL,
          bio: "",
          followers: [],
          following: [],
          accountType: "public",
          friends: [],
          gender: "",
          createdAt: serverTimestamp(),
        });

        navigate("/home");
      } catch (error) {
        setErrorMessage(error.message);
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email.current.value,
          password.current.value
        );
        navigate("/home");
      } catch (error) {
        setErrorMessage(error.message);
      }
    }
  };

  const toggleHandling = () => {
    setIsSignInForm(!isSignInForm);
    setErrorMessage(null);
  };

  const toggleAuthMethod = () => {
    setUsePhoneAuth(!usePhoneAuth);
    setErrorMessage(null);
    setOtpSent(false);
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
            {!isSignInForm && !usePhoneAuth && (
              <input ref={name} type="text" placeholder="Name" />
            )}

            {usePhoneAuth ? (
              <>
                <input ref={phone} type="tel" placeholder="Phone Number" />
                {otpSent && (
                  <input ref={otp} type="text" placeholder="Enter OTP" />
                )}
              </>
            ) : (
              <>
                <input
                  ref={email}
                  type="text"
                  placeholder={isSignInForm ? "Phone number or Email" : "Email"}
                />
                <input
                  ref={password}
                  type="password"
                  placeholder="Password"
                  required
                />
              </>
            )}

            <p className="errorMsg">{errorMessage}</p>

            <button onClick={handleButtonClick}>
              {usePhoneAuth
                ? otpSent
                  ? "Verify OTP"
                  : "Send OTP"
                : isSignInForm
                ? "Sign In"
                : "Sign Up"}
            </button>

            {isSignInForm && !usePhoneAuth && <p>Forgotten Password</p>}

            <p>
              {isSignInForm
                ? "Don't have an account?"
                : "Already have an account?"}
              <span onClick={toggleHandling}>
                {isSignInForm ? " Sign up" : " Sign in"}
              </span>
            </p>

            <p>
              Use {usePhoneAuth ? "Email/Password" : "Phone Number"} instead?{" "}
              <span onClick={toggleAuthMethod}>Click here</span>
            </p>
          </form>
        </div>
        <div id="recaptcha-container"></div>
      </div>
      <div className="footerCont">
        <Footer />
      </div>
    </div>
  );
};

export default Login;
