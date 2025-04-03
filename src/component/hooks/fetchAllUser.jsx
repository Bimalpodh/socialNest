import { collection, getDocs } from "firebase/firestore";
import { setAllUsers } from "../ReduxStore/allUserSlice";
import { db } from "../Utils/firebase";

export const fetchAllUsers = () => async (dispatch) => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
    dispatch(setAllUsers(users));
  } catch (error) {
    console.log("Error fetching users:", error);
  }
};
