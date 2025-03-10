export const checkValidData=(email,password,name)=>{
  
  const isEmailValid= /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(email);

  const isPasswordValid=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password);

  const isNameValid=/^[a-zA-Z][0-9a-zA-Z .,'-]*$/.test(name)

  const isPhoneValid=/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/

  // if(!isNameValid) return "enter valid name"
  if(!isEmailValid) return "Email is not valid";
  if(!isPasswordValid) return "incorrect Password";
  if(!isPhoneValid) return "Enter Valid Number"

  return null;

};