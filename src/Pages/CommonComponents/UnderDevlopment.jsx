// src/pages/UnderDevelopment.js
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaTools } from "react-icons/fa";
import "../../Components/Styles/UnderDevelopment.css"; // custom styles

const UnderDevelopment = () => {
  // Countdown logic (optional)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const targetDate = new Date("2025-09-01T00:00:00"); // Set your launch date here

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          mins: Math.floor((difference / 1000 / 60) % 60),
          secs: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container fluid className="under-development d-flex justify-content-center align-items-center text-center" >
      <Row>
        <Col>
          <FaTools size={80} className="icon-spin text-warning mb-4" />
          {/* <h2 className="text-white">Coming Soon</h2> */}
          <p className="text-light mb-4">This page is under development !</p>

          {/* <h4 className="text-light">
            {`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.mins}m ${timeLeft.secs}s`}
          </h4> */}

          {/* Optional Email Form */}
          {/* <Form className="mt-4">
            <Form.Group controlId="formBasicEmail">
              <Form.Control type="email" placeholder="Enter email for updates" className="mb-2" />
            </Form.Group>
            <Button variant="warning" type="submit">Notify Me</Button>
          </Form> */}
        </Col>
      </Row>
    </Container>
  );
};

export default UnderDevelopment;
