import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"; 
import notificationReducer from "./notificationSlice";

import allUserReducer from "../ReduxStore/allUserSlice";


const appStore = configureStore({
  reducer: {
    user: userReducer, // Fixed reducer reference
    notification:notificationReducer,
    allUser:allUserReducer,
  },
});

export default appStore;
