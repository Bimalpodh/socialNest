import { createSlice } from "@reduxjs/toolkit";

const notificationSlice= createSlice({
  name:"notification",
  initialState:{
    list:[],  // notifications are store in this list
    isOpen:false, // controls sidebar visibility
  },

reducers:{
  addNotification:(state,action)=>{
    state.list.unshift(action.payload); // add new notificartion 
  },
  setNotifications:(state,action)=>{
    state.list=action.payload;    //set notification from firebase
  },
  clearNotification:(state)=>{
    state.list=[];
  },
  toggleNotificationBar:(state)=>{
    state.isOpen=!state.isOpen;   // to maintain the side bar visibility

  },
  closeNotificationBar:(state)=>{
    state.isOpen= false;
  }
}


});

export const {addNotification,setNotifications,clearNotification,toggleNotificationBar,closeNotificationBar}=notificationSlice.actions;

export default notificationSlice.reducer;