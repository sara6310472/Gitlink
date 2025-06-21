import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../context";
import { useFetchData } from "./fetchData.js";

export function useLogout() {
  const { setCurrentUser } = useCurrentUser();
  const navigate = useNavigate();
  const fetchData = useFetchData();

  const logOut = () => {
    fetchData({
      type: "logout",
      method: "POST",
      onSuccess: () => {
        Cookies.remove("accessToken");
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
        navigate("/home");
      },
      onError: (err) => {
        console.error("Logout failed:", err);
      },
    });
  };
  return logOut;
}
