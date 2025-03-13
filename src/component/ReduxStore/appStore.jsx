import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"; // Corrected import

const appStore = configureStore({
  reducer: {
    user: userReducer, // Fixed reducer reference
  },
});

export default appStore;
