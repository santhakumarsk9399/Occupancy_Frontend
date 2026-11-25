import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Pages/Sidebar";
import LoginPage from "./Pages/Login/LoginPage";
import UnauthorizedPage from "./Pages/UnauthorizedPage";
import UserPage from "./Pages/Users/UserPage";
import { AuthProvider } from "./Context/ContextProvider";
import ProtectedRoute from "./Context/ProtectedRoute";
import GetAllZoneList from "./Pages/Zones/GetAllZoneList";
import "./Components/Styles/Mainpage.css";
import UnderDevelopment from "./Pages/CommonComponents/UnderDevlopment";
import ProtectedLayout from "./Context/ProtectedLayout";
import DashboardPage from "./Pages/Dashboard/Dashboard";
import LogReportPage from "./Pages/Logs/LogReportPage";
import SMSTab from "./Pages/SMS/SMSTab";
import EmailTab from "./Pages/Email/EmailTab";
import { ToasterContainer } from "./Pages/CommonComponents/Toaster";
import ThresholdsPage from "./Pages/Threshold/pages/ThresholdsPage";
// import ZoneDetailsPage from "./Pages/Dashboard/SingleZoneView";
import Dashboard from "./Pages/SingleViewDashboards/Dashboard";
import SingleView from "./Pages/SingleViewDashboards/SingleDashboardLogin";
import HistoricalMainpage from "./Pages/Historical Analytics/HistoricalMainpage";
import MultizoneaDashboard from "./Pages/MultiZoneViewDashboard/Dashboard";
import Licensing from "./Pages/Licensing/LicensingMain";
import CarryForward from "./Pages/CarryForward/CarryForward";
import OverallPerformancePage from "./Pages/POS/OverallPerformancePage";
import Heatmap from "./Pages/Settings_heatmap/components/Heatmaps/Heatmap";
import HealthDashboard from "./Pages/Health/HealthDashboard";
import HeatmapDashboard from "./Pages/HeatmapDashboard/HeatmapDashboard";
import WeatherCalendar from "./Pages/weather/WeatherCalendarPage";
import MallWiseTV from "./Pages/HeatmapDashboard/Tabs/mallwiseTV-view/MallwiseTV";
import ZonewiseTV from "./Pages/HeatmapDashboard/Tabs/mallwiseTV-view/ZonewiseTv";
import TitanDashboard from "./Pages/TitanDashboard/TitanDashboard";
import HistoricalReports from "./Pages/Reports/HistoricalReports/HistoricalReports";
import HistoricalReportResults from "./Pages/Reports/HistoricalReports/HistoricalReportResults";
import HealthReportFilters from "./Pages/Reports/HealthReports/HealthReportFilters";
import HealthReportResults from "./Pages/Reports/HealthReports/HealthReportResults";

function App() {
  return (
    <div className="Mainapp">
      <AuthProvider>
        <Router>
          <ToasterContainer />
          <div className="Header_app">
            <div className="main-content">
              {/* <MainHeader /> */}
              {/* Public Routes */}
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/not-found" element={<UnauthorizedPage />} />

                {/* <single Zone & Multizone page Dashboards /> */}
                <Route path="/singlezoneDashboard" element={<Dashboard />} />
                <Route path="/dashboardViewLogin" element={<SingleView />} />

                {/* <Dashboard idenfier middleware page /> */}
                <Route
                  path="/MultizonesView"
                  element={<MultizoneaDashboard />}
                />

                {/* <Heatmap single page Dashboards /> */}
                <Route path="/Heatmap-zonedashboard" element={<ZonewiseTV />} />
                <Route path="/Heatmap-malldashboard" element={<MallWiseTV />} />
                <Route path="/TitanDashboard" element={<TitanDashboard />} />
                
                {/* <POS & Calendar /> */}
                <Route path="/pos" element={<OverallPerformancePage />} />
                <Route path="/weatherCalendar" element={<WeatherCalendar />} />
                <Route path="*" element={<LoginPage />} />

                {/* Protected Routes */}

                {/*Dashboard Routes*/}
                <Route element={<ProtectedLayout />}>
                  <Route
                    path="/liveOccupancy"
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Operator", "Viewer"]}
                      >
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/historicalAnalytics"
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Operator", "Viewer"]}
                      >
                        <HistoricalMainpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/Historical_Reports"
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Operator", "Viewer"]}
                      >
                        <HistoricalReports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/Historical_Reports/results"
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Operator", "Viewer"]}
                      >
                        <HistoricalReportResults />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/HealthReports"
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Operator", "Viewer"]}
                      >
                        <HealthReportFilters />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/HealthReports/results"
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Operator", "Viewer"]}
                      >
                        <HealthReportResults />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/deviceHealthDashboard"
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Operator", "Viewer"]}
                      >
                        <HealthDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/heatmapDashboard"
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Operator", "Viewer"]}
                      >
                        <HeatmapDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/predictions"
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Operator", "Viewer"]}
                      >
                        <UnderDevelopment />
                      </ProtectedRoute>
                    }
                  />

                  {/*---------------------------Settings  Routes-------------------------*/}

                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Operator", "Viewer"]}
                      >
                        {/* <GetAllUsersList /> */}
                        <UserPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/zones"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <GetAllZoneList />
                        {/* <UnderDevelopment /> */}
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/threshold"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <ThresholdsPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/sms"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        {/* <UnderDevelopment /> */}
                        <SMSTab />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/email"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        {/* <UnderDevelopment /> */}
                        <EmailTab />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/logs"
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Operator", "Viewer"]}
                      >
                        {/* <UnderDevelopment /> */}
                        <LogReportPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/licensing"
                    element={
                      <ProtectedRoute allowedRoles={["Licensing"]}>
                        {/* <UnderDevelopment /> */}
                        <Licensing />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/carryforward"
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Operator", "Viewer"]}
                      >
                        {/* <UnderDevelopment /> */}
                        <CarryForward />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/heatmap"
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Operator", "Viewer"]}
                      >
                        <Heatmap />
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
