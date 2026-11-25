import React from "react";
import "../../Components/Styles/Card.css"; 

const CustomCard = ({ title, children, size , className="" }) => {
  return (
    <div className={`custom-card custom-card-${size} ${className}`}>
      {title && <h5 className="custom-card-title">{title}</h5>}
      <div className="custom-card-body">{children}</div>
    </div>
  );
};

export default CustomCard;
