// SingleView.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "./api";
import Loader from "../CommonComponents/Loader";

const SingleView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const getQueryParams = () => {
    return new URLSearchParams(location.search);
  };

  useEffect(() => {
    const doFlow = async () => {
      // setIsLoading(true);
      try {
        const params = getQueryParams();
        const key = params.get("key");
        const ViewDash = params.get("view");
        console.log(key, "key");
        if (!key) {
          setError("Missing key in URL");
          return;
        }

        // 1️⃣ Login
        const { token, user } = await login(key);
        console.log(key);
        if (!token) {
          setError("Login failed");
          return;
        }

        // Save user session
        // Save user session
        const { id, vid, username, role } = user;

        sessionStorage.setItem("token", token);
        sessionStorage.setItem("id", id);
        sessionStorage.setItem("vid", vid);
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("role", role);

        // Optional - store complete user object
        sessionStorage.setItem(
          "userData",
          JSON.stringify({
            token,
            user,
          }),
        );
        if (ViewDash === "singlezone") {
          navigate("/singlezoneDashboard");
        } else if (ViewDash === "multizone") {
          navigate("/MultizonesView");
        } else if (ViewDash === "Heatmap_Mallwise-View") {
          navigate("/Heatmap-malldashboard");
        } else if (ViewDash === "Heatmap_Zonewise-View") {
          navigate("/Heatmap-zonedashboard");
        } else if (ViewDash === "Titan-View") {
          navigate("/TitanDashboard");
        } else {
          navigate("/singlezoneDashboard");
        }
      } catch (err) {
        console.error("Error in flow:", err);

        const msg = err?.message || "";

        // Ignore aborted/cancelled requests
        if (
          err?.name === "AbortError" ||
          err?.code === "ERR_ABORTED" ||
          msg.includes("signal is aborted") ||
          msg.includes("aborted")
        ) {
          return;
        }

        let errorMsg = "Server error";

        if (err?.response?.data?.message) {
          errorMsg = err.response.data.message;
        } else if (msg) {
          try {
            const parsed = JSON.parse(msg);
            errorMsg = parsed?.message || errorMsg;
          } catch {
            errorMsg = msg;
          }
        }

        setError(errorMsg);
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
