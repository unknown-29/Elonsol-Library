import jwtDecode from "jwt-decode";
import { createContext, useState, useEffect } from "react";

export let UserContext = createContext('');

export default function UserContextProvider(props) {

  function getUserData() {
    try {
      const encodedToken = localStorage.getItem('userToken');
      const userData = jwtDecode(encodedToken);
      return userData;
    } catch (error) {
      return ""
    }
  }
  return (
    <UserContext.Provider value={{ getUserData }}>
      {props.children}
    </UserContext.Provider >
  );
}
