// src/Pages/CommonComponents/Footer.jsx
import React, { useEffect, useState } from 'react';
import "../../Components/Styles/Footer.css";
import footerlogo from "../../Components/Assets/footer-logo.png";

const Footer = () => {
      const [timeString, setTimeString] = useState('');

  const updateTime = () => {
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    const time = now.toLocaleTimeString('en-US', options).toLowerCase();
    const date = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
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
    <footer className="footer bg-light text-muted  d-flex justify-content-between align-items-center">
       <div className="footer-time">{timeString}</div>
       <div className="footer-copy">Copyright © 2025 All Rights Reserved 
        <img src={footerlogo} alt="footerlogo" className="footer_logo" width={131} height={38} /></div>
     </footer>
</>
  );
};

export default Footer;
