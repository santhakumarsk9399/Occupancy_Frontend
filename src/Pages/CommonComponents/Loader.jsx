// // Loader.js
// import React from 'react';
// import { Spinner } from 'react-bootstrap';
// import '../../Components/Styles/Loader.css';

// const Loader = () => {
//   return (
//     <div className="loader-container">
//       <Spinner animation="border" variant="primary" />
//     </div>
//   );
// };

// export default Loader;
import React from 'react';
import { Spinner } from 'react-bootstrap';
import '../../Components/Styles/Loader.css';

const Loader = ({ size = 'md' }) => {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'spinner-border-sm';
      case 'lg':
        return 'spinner-border-lg'; // custom class (you can define it)
      default:
        return '';
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center">
      <Spinner
        animation="border"
        role="status"
        className={getSize()}
        variant="primary"
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default Loader;

