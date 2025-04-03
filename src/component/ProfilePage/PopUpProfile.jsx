import { onAuthStateChanged } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import { auth ,db} from '../Utils/firebase';
import { getDoc ,doc} from 'firebase/firestore';

const PopUpProfile = () => {
  const [reqList,setReqList]=useState([]);
  

  useEffect(()=>{
    const unsubscribe=onAuthStateChanged(auth,async (currentUser)=>{
      if(currentUser){
        const userRef=doc(db,"users",currentUser.uid);
        const userDoc=(await getDoc(userRef)).data();
        const friendReq= userDoc.friendReq || [];


        const friendList =await Promise.all(
          friendReq.map(async (p)=>{
            const friendRef=doc(db,"users",p);
            const friendDoc=await getDoc(friendRef);
            return friendDoc.exists()?{
              id:friendDoc.id,...friendDoc.data()
            }:null;
          })
        );
        const valid=friendList.filter(friends=>friends !==null);
        setReqList(valid);


      }
    })
  },[])
  return (
    <div>
      <div>
          {reqList.map((f)=>(
            <div className="x">{f.displayName}</div>
          ))}
      </div>
    </div>
  )
}

export default PopUpProfile