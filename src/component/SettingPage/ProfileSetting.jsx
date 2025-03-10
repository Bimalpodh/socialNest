import { useState } from "preact/hooks";
import "./ProfileSetting.css";

const ProfileSetting = () => {
  const [isFormVisible, setFormVisible] = useState(false);

  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };

  return (
    <div className="profileSettingContainer">
      <div className="ProfileHeader">
        <h3>Edit Profile</h3>
        <button onClick={toggleFormVisibility}>Edit</button>
      </div>
      <div className="User-Detail">
        <div className="user-d">
          <img
            src="https://imgs.search.brave.com/7LLxW_4xhxzbpxX5gF1M822J18_GSdhKIWRoWmbD7L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvMjUy/MzEzNC5qcGc"
            alt="profileImg"
          />
          <div className="userName">
            <div>Gouranga_Kara_143</div>
            <div className="profile-name">🤍Killer-Boy-Goura🤍</div>
          </div>
        </div>
        <div>
          <button className="changeProfileImg-btn">Change photo</button>
        </div>
      </div>
      {isFormVisible && (
        <div className="offcanvas-form">
          <form className="form">
            <div className="form-group">
              <label >User Name:</label>
              <input id="zero" type="text" maxLength="20" />
            </div>
            <div className="form-group">
              <label >Profile Name:</label>
              <input id="one" type="text" maxLength="20" />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input  id="two" type="email" />
            </div>
            <div className="form-group">
              <label>Phone No:</label>
              <input id="three" type="tel" />
            </div>
            <div className="radio-container">
              <label>Gender:</label>
              <div>
                <input type="radio" id="male" name="gender" value="male" />
                <label for="male">Male</label>
              
                <input type="radio" id="female" name="gender" value="female" />
                <label for="female">Female</label>
                <input type="radio" id="other" name="gender" value="other" />
                <label for="other">Other</label>
              </div>
            </div>
            <div className="btn-container">
            <button className=" submit" type="submit">Save</button>
            <button className=" cancel" type="button" onClick={toggleFormVisibility}>
              cancel
            </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileSetting;
