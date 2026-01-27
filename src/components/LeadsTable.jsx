import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LeadConversionDialog from "./LeadConversionDialog";
import { updateLeadStatus } from "../services/salesforceApi";

function LeadsTable({ leads, loading, error, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState(null);
  const [conversionDialog, setConversionDialog] = useState({
    open: false,
    lead: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const leadStatuses = [
    "Open - Not Contacted",
    "Working - Contacted",
    "Closed - Converted",
    "Closed - Not Converted",
  ];

  const handleStatusChange = async (leadId, newStatus, lead) => {
    // If changing to "Closed - Converted", show dialog first
    if (newStatus === "Closed - Converted") {
      setConversionDialog({ open: true, lead, pendingStatus: newStatus });
      return; // Don't update status yet
    }

    // For other statuses, update normally
    setUpdating(leadId);
    try {
      await updateLeadStatus(leadId, newStatus);
      onRefresh(); // Refresh the list
    } catch (err) {
      console.error("Error updating lead status:", err);
      setSnackbar({
        open: true,
        message: `Failed to update: ${err.message}`,
        severity: "error",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleConvertClick = (lead) => {
    setConversionDialog({ open: true, lead });
  };

  const handleLeadConverted = (leadName) => {
    setConversionDialog({ open: false, lead: null });
    setSnackbar({
      open: true,
      message: `${leadName} converted successfully to Contact`,
      severity: "success",
    });
    onRefresh(); // Refresh the list
  };

  const handleConversionCancel = () => {
    setConversionDialog({ open: false, lead: null });
    onRefresh(); // Refresh to revert dropdown to original status
  };

  // Filter leads based on search term
  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.Name?.toLowerCase().includes(searchLower) ||
      lead.Email?.toLowerCase().includes(searchLower) ||
      lead.Phone?.includes(searchTerm) ||
      lead.Company?.toLowerCase().includes(searchLower) ||
      lead.Status?.toLowerCase().includes(searchLower)
    );
  });

  // Get color for status chip
  const getStatusColor = (status) => {
    const statusMap = {
      "Open - Not Contacted": "default",
      "Working - Contacted": "primary",
      "Closed - Converted": "success",
      "Closed - Not Converted": "error",
    };
    return statusMap[status] || "default";
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h2">
          Leads ({filteredLeads.length})
        </Typography>
        <TextField
          label="Search Leads"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
          placeholder="Search by name, email, company..."
          inputProps={{
            "aria-label": "Search leads by name, email, or company",
          }}
        />
      </Box>

      {filteredLeads.length === 0 ? (
        <Box
          sx={{ p: 3, textAlign: "center" }}
          role="status"
          aria-live="polite"
        >
          <Typography color="text.secondary">
            {searchTerm
              ? "No leads found matching your search."
              : "No leads available."}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 650 }} aria-label="Leads data table">
            <TableHead>
              <TableRow sx={{ bgcolor: "secondary.main" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Email
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Phone
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Company
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Created Date
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow
                  key={lead.Id}
                  sx={{
                    "&:nth-of-type(odd)": { bgcolor: "action.hover" },
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body1" fontWeight="medium">
                      {lead.Name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {lead.Email ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" color="action" />
                        <a
                          href={`mailto:${lead.Email}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          {lead.Email}
                        </a>
                      </Box>
                    ) : (
                      <Typography color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.Phone ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon fontSize="small" color="action" />
                        {lead.Phone}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.Company ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <BusinessIcon fontSize="small" color="action" />
                        {lead.Company}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.Status ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          value={lead.Status}
                          onChange={(e) =>
                            handleStatusChange(lead.Id, e.target.value, lead)
                          }
                          disabled={updating === lead.Id}
                          inputProps={{
                            "aria-label": `Change status for lead ${lead.Name}`,
                          }}
                          renderValue={(value) => (
                            <Chip
                              label={value}
                              color={getStatusColor(value)}
                              size="small"
                            />
                          )}
                        >
                          {leadStatuses.map((status) => (
                            <MenuItem key={status} value={status}>
                              <Chip
                                label={status}
                                color={getStatusColor(status)}
                                size="small"
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(lead.CreatedDate).toLocaleDateString()}
                      </Typography>
                      {(lead.IsConverted ||
                        lead.Status === "Closed - Converted") && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Converted"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <LeadConversionDialog
        open={conversionDialog.open}
        onClose={handleConversionCancel}
        lead={conversionDialog.lead}
        onLeadConverted={handleLeadConverted}
      />
    </Box>
  );
}

export default LeadsTable;
