// src/Utils/AutoLogoutHandler.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AutoLogoutHandler = ({ timeout = 5 * 60 * 1000 }) => {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {

        sessionStorage.clear();
        window.location.href = "/login";
      }, timeout);
    };

    // Reset timer on activity
    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // Start timer on mount

    return () => {
      // Cleanup
      clearTimeout(timer);
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [timeout]);

  return null; // no UI
};

export default AutoLogoutHandler;
