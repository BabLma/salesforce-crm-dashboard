import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Tab,
  Tabs,
  Paper,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ContactsIcon from "@mui/icons-material/Contacts";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import { logout } from "../auth/salesforceAuth";
import { getContacts, getLeads } from "../services/salesforceApi";
import ContactsTable from "../components/ContactsTable";
import LeadsTable from "../components/LeadsTable";

function Dashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [contactsError, setContactsError] = useState(null);
  const [leadsError, setLeadsError] = useState(null);

  // Fetch contacts function
  const fetchContacts = async () => {
    try {
      setContactsLoading(true);
      const response = await getContacts();
      console.log("📊 CONTACTS RESPONSE:", response);
      console.log("📊 Total Contacts Fetched:", response.records?.length);
      console.log(
        "📊 Contact Names:",
        response.records?.map((c) => c.Name),
      );
      setContacts(response.records || []);
      setContactsError(null);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setContactsError(err.message || "Failed to load contacts");
    } finally {
      setContactsLoading(false);
    }
  };

  // Fetch leads function
  const fetchLeads = async () => {
    try {
      setLeadsLoading(true);
      const response = await getLeads();
      setLeads(response.records || []);
      setLeadsError(null);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setLeadsError(err.message || "Failed to load leads");
    } finally {
      setLeadsLoading(false);
    }
  };

  // Fetch both contacts and leads when component mounts
  useEffect(() => {
    fetchContacts();
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 999,
          padding: '1rem',
          backgroundColor: 'primary.main',
          color: 'white',
          textDecoration: 'none',
          '&:focus': {
            left: '0',
            top: '0',
          },
        }}
      >
        Skip to main content
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        {/* App Bar */}
        <AppBar position="static" component="header" role="banner">
          <Toolbar>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              Personal CRM Dashboard
            </Typography>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              aria-label="Logout from dashboard"
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

      {/* Tabs Navigation */}
      <Container maxWidth="lg" sx={{ mt: 3 }} component="main" id="main-content">
        <Paper sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="CRM data navigation tabs"
          >
            <Tab
              icon={<ContactsIcon />}
              label="Contacts"
              iconPosition="start"
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab
              icon={<LeaderboardIcon />}
              label="Leads"
              iconPosition="start"
              id="tab-1"
              aria-controls="tabpanel-1"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box
          sx={{ mt: 3 }}
          role="tabpanel"
          id="tabpanel-0"
          aria-labelledby="tab-0"
          hidden={currentTab !== 0}
        >
          {currentTab === 0 && (
            <ContactsTable
              contacts={contacts}
              loading={contactsLoading}
              error={contactsError}
              onRefresh={fetchContacts}
            />
          )}
        </Box>

        <Box
          sx={{ mt: 3 }}
          role="tabpanel"
          id="tabpanel-1"
          aria-labelledby="tab-1"
          hidden={currentTab !== 1}
        >
          {currentTab === 1 && (
            <LeadsTable
              leads={leads}
              loading={leadsLoading}
              error={leadsError}
              onRefresh={fetchLeads}
            />
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default Dashboard;
