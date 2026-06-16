// src/Pages/CommonComponents/Footer.jsx
import React, { useEffect, useState } from 'react';
import "../../Components/Styles/Footer.css";
import footerlogo from "../../Components/Assets/footer-logo.svg";
import clockicon from "../../Components/Assets/clock-icon.svg";
const Footer = () => {
      const [timeString, setTimeString] = useState('');

  const updateTime = () => {
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    const time = now.toLocaleTimeString('en-US', options).toLowerCase();
    const date = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(',', '');
    setTimeString(`${time}, ${date}`);
  };

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
    <footer className="footer bg-light text-muted  d-flex justify-content-between align-items-center common">
       <div className="footer-time"><img src={clockicon} className="clock_icon" width={22} height={22} /> {timeString}</div>
        <div className="footer-copy">Copyright © {new Date().getFullYear()} All Rights Reserved
        <img src={footerlogo} alt="footerlogo" className="footer_logo" width={130} height={35} /></div>
     </footer>
</>
  );
};

export default Footer;
