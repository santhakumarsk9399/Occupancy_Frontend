import React from "react";
import { Tab, Nav } from "react-bootstrap";
import "./EmailTab.css";
import SMSForm from "./SMSForm";
import SMSGroupTable from "./SMSGroupTable";

// SMS settings section with Bootstrap Tabs UI
const SMSTab = () => {
  return (
    <div className="sms_email-container">
      <div className="tabsec">
        <Tab.Container defaultActiveKey="users">
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link eventKey="users">SMS</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="zones">SMS Group</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content className="sms-tabcontent">
            <Tab.Pane eventKey="zones">
              {/* Group list/table pane */}
              <SMSGroupTable />
            </Tab.Pane>

            <Tab.Pane eventKey="users">
              {/* SMS URL configuration pane */}
              <SMSForm />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
};

export default SMSTab;
