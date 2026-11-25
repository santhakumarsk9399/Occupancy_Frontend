import React from "react";
import { Tab, Nav } from "react-bootstrap";
import "./EmailTab.css";
import EmailForm from "./EmailForm";
import EmailGroupTable from "./EmailGroupTable";

// Match SMSTab design with Bootstrap tabs and shared layout classes
const EmailTab = () => {
  return (
    <div className="sms_email-container">
      <div className="tabsec">
        <Tab.Container defaultActiveKey="users">
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link eventKey="users">SMTP</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="zones">Email Group</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content className="bg-white border p-3">
            <Tab.Pane eventKey="zones">
              <EmailGroupTable />
            </Tab.Pane>

            <Tab.Pane eventKey="users">
              <div className="mt-3">
                <EmailForm />
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
};

export default EmailTab;