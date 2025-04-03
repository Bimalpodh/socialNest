import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { closeNotificationBar } from "../ReduxStore/notificationSlice";
import "../Notification/notification.css";

const Notification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, isOpen } = useSelector((store) => store.notification);

  const handleClose = () => {
    dispatch(closeNotificationBar());
  };

  const handleNotificationClick = (postId) => {
    navigate(`/post/${postId}`); // Redirect to the post
    dispatch(closeNotificationBar());
  };

  return (
    <div className={`notification-bar ${isOpen ? "show" : ""}`}>
      <div className="notification-header">
        <h3>Notifications</h3>
        <span className="close-btn" onClick={handleClose}>X</span>
      </div>

      <ul className="notification-list">
        {list.length > 0 ? (
          list.map((notify, index) => (
            <li key={index} className="notification-item" onClick={() => handleNotificationClick(notify.postId)}>
              <p className="notif-message">{notify.message}</p>
              <span className="notif-time">{notify.time}</span>
            </li>
          ))
        ) : (
          <p className="no-notification">No notifications yet</p>
        )}
      </ul>
    </div>
  );
};

export default Notification;
