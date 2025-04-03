import { createSlice } from "@reduxjs/toolkit";


const allUserSlice=createSlice({
  name:"allUser",
  initialState:{
    users:[]
  },
  reducers:{
    setAllUsers:(state,action)=>{

      state.users=action.payload;
    },
  },
});


export const {setAllUsers}=allUserSlice.actions;
export default allUserSlice.reducer;