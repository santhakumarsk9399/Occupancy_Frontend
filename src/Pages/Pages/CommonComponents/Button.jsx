// src/components/common/Button.js

import React from "react";
import { Button, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import { IconContext } from "react-icons";
/**
 * Common Bootstrap Button Component
 *
 * Props:
 * - type: button | submit | reset
 * - onClick: click handler
 * - children: button label
 * - icon: icon component (from react-icons)
 * - iconPosition: 'left' | 'right'
 * - variant: Bootstrap button variant (e.g., primary, danger)
 * - size: 'sm' | 'md' | 'lg'
 * - disabled: boolean
 * - className: extra class names
 */
const Buttons = ({
  type,
  text,
  onClick,
  children,
  iconPosition,
  variant,
  block = false,
  isLoading = false,
  icon ,
  tooltip = "",
  size,
  disabled,
  className,
}) => {
  const renderContent = () => (
    <>
      {isLoading && <Spinner animation="border" size="sm" className="me-2" />}
      {icon && iconPosition === "left" && (
        <IconContext.Provider value={{ className: "me-2" }}>
          {icon}
        </IconContext.Provider>
      )}
      {text}
      {icon && iconPosition === "right" && (
        <IconContext.Provider value={{ className: "ms-2" }}>
          {icon}
        </IconContext.Provider>
      )}
    </>
  );

  const button = (
    <Button
      variant={variant}
      size={size === "md" ? undefined : size}
      className={`${block ? "w-100" : ""} ${className}`}
      onClick={onClick}
      disabled={isLoading || disabled}
      icon={icon}
    >
      {renderContent()}
    </Button>
  );

  return tooltip ? (
    <OverlayTrigger overlay={<Tooltip>{tooltip}</Tooltip>}>
      {button}
    </OverlayTrigger>
  ) : (
    button
  );
};
//   const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
//   return (
//     <button
//       type={type}
//       text={text}
//       onClick={onClick}
//       disabled={disabled}
//       className={`btn btn-${variant} ${sizeClass} d-inline-flex align-items-center gap-2 ${className}`}
//     >
//       {iconPosition === 'left' && Icon && <Icon />}
//       {children}
//       {iconPosition === 'right' && Icon && <Icon />}
//     </button>
//   );
// };

export default Buttons;
