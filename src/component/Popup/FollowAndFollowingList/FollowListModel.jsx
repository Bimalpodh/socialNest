import "./FollowListModal.css"; 
import { useEffect, useState } from "preact/hooks";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Utils/firebase";

const FollowListModal = ({ title, userIds, onClose }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const userData = await Promise.all(
        userIds.map(async (id) => {
          const docSnap = await getDoc(doc(db, "users", id));
          return docSnap.exists() ? { id, ...docSnap.data() } : null;
        })
      );
      setUsers(userData.filter(Boolean));
    };

    if (userIds?.length) {
      fetchUsers();
    }
  }, [userIds]);

  return (
    <div className="modalBackdrop" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <button className="closeBtn" onClick={onClose}>X</button>
        <div className="userList">
          {users.map((user) => (
            <div className="userItem" key={user.id}>
              <img src={user.photoURL || "default-profile.png"} alt="Profile" />
              <span>{user.displayName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;
