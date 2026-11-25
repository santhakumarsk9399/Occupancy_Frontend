import React, { useState, useRef, useEffect } from "react";
import { FiGrid, FiArrowRight, FiX, FiSend, FiArrowUpRight } from "react-icons/fi";
import {
    FiActivity,
    // FiGrid,
    FiMap,
    FiLayers,
    FiMapPin
} from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./QuickLink.css";
import { quickLinks } from "./QuickLinkData";
import { createPortal } from "react-dom";
export default function QuickLinks() {
  const [open, setOpen] = useState(false);
  const ref = useRef();
    const navigate = useNavigate();
    const [position, setPosition] = useState({
        left: 0,
        top: 0
    });

    const buttonRef = useRef();
    const popupRef = useRef();
    useEffect(() => {
        function close(e) {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(e.target) &&
                popupRef.current &&
                !popupRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);
    const handleOpen = () => {
        const rect = buttonRef.current.getBoundingClientRect();

        const popupWidth = 320;
        const popupHeight = 520;
        const gap = 20;

        // Position to the right of the button
        let left = rect.right + gap;

        // If popup goes outside screen, show it on the left
        if (left + popupWidth > window.innerWidth - 20) {
            left = rect.left - popupWidth - gap;
        }

        // Vertically center with the button
        let top = rect.top + rect.height / 2 - popupHeight / 2;

        // Keep popup inside viewport
        if (top < 20) top = 20;

        if (top + popupHeight > window.innerHeight - 20) {
            top = window.innerHeight - popupHeight - 20;
        }

        setPosition({
            left,
            top,
        });

        setOpen((prev) => !prev);
    };
  return (
    <div className="quick-links-wrapper" ref={ref}>
          <button
              ref={buttonRef}
              className="quick-btn"
              onClick={handleOpen}
          >
              <FiSend size={22} />
              {/* <span className="tooltip">Quick Links</span> */}
          </button>
          {open &&
              createPortal(
                  <div
                      ref={popupRef}
                      className="quick-popup"
                      style={{
                          left: position.left,
                          top: position.top
                      }}
            >
                      <div className="quick-header">
                          <div className="quick-title">
                              <FiSend className="rocket-icon" />
                              <h4>Quick Links</h4>
                          </div>
                          <FiX
                              onClick={() => setOpen(false)}
                              className="close"
                          />
                      </div>

                      <div className="quick-list">
                          {quickLinks.map((item) => {
                              const Icon = item.icon;

                              return (
                                  <div
                                      key={item.id}
                                      className="quick-item"
                                      onClick={() => {
                                          const userKey = sessionStorage.getItem("userKey");
                                          // Single dashboards
                                          if (item.type === "others") {
                                              const url = `/dashboardViewLogin?key=${userKey}&view=${item.view}`;
                                              window.open(url, "_blank", "noopener,noreferrer");
                                          } else {
                                              // Normal web dashboards
                                              navigate(item.path);

                                          }

                                          setOpen(false);
                                    }}
                                  >
                                      <div
                                          className="icon-box"
                                          style={{
                                              background: item.bgColor,
                                              color: item.iconColor,
                                          }}
                                      >
                                          <Icon />
                                      </div>
                                      {/* <div className="icon-box">
                                          <Icon />
                                      </div> */}

                                      <div className="text">
                                          <h5>{item.name}</h5>
                                          <p>{item.desc}</p>
                                      </div>

                                      {/* <FiArrowRight className="arrow" /> */}
                                      <FiArrowUpRight className="arrow" />
                                  </div>
                              );
                          })}
                      </div>
                  </div>,
                  document.body
              )}
    </div>
  );
}
