import "./Setting.css";
import SettingContainer from "./SettingComponent";
import ProfileSetting from "./ProfileSetting";
const Setting = () => {
  return (
    <div className="Setting">
      <div className="SettingContainer">
        <div className="SettingHeader">
          <h3>Setting</h3>
        </div>
        <SettingContainer />
      </div>
      <ProfileSetting/>



    </div>
  );
};

export default Setting;
