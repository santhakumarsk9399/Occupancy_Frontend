// SingleView.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "./api";
import Loader from "../CommonComponents/Loader";

const SingleView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getQueryParams = () => {
    return new URLSearchParams(location.search);
  };

  useEffect(() => {
    const doFlow = async () => {
      setIsLoading(true);
      try {
        const params = getQueryParams();
        // const username = params.get("username");
        // const password = params.get("password");
         const key = params.get("key");
          // console.log(key,"key")
        if (!key) {
          setError("Missing key in URL");
          return;
        }

        // 1️⃣ Login
        const { token, user } = await login(key);
        console.log(key)
        if (!token) {
          setError("Login failed");
          return;
        }

        // Save user session
        sessionStorage.setItem("userData", JSON.stringify({ token, user }));
        navigate("/singlezoneDashboard");
      } catch (err) {
        console.error("Error in flow:", err);

        let msg = "Server error"; // default
        if (err?.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err?.message) {
          try {
            const parsed = JSON.parse(err.message);
            msg = parsed?.message || msg;
          } catch {
            msg = err.message || msg;
          }
        }

        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    doFlow();
  }, [location, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      {isLoading && !error && (
        <h4>
          <Loader />
        </h4>
      )}
      {error && <h3 className="text-danger">{error}</h3>}
    </div>
  );
};

export default SingleView;
