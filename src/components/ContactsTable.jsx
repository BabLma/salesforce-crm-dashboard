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
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddContactDialog from "./AddContactDialog";
import { deleteContact } from "../services/salesforceApi";

function ContactsTable({ contacts, loading, error, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    contact: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleDeleteClick = (contact) => {
    setDeleteDialog({ open: true, contact });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleDeleteConfirm = async () => {
    const { contact } = deleteDialog;
    setDeleteDialog({ open: false, contact: null });

    setDeleting(contact.Id);
    try {
      await deleteContact(contact.Id);
      setSnackbar({
        open: true,
        message: `${contact.Name} deleted successfully`,
        severity: "success",
      });
      onRefresh(); // Refresh the list
    } catch (err) {
      console.error("Error deleting contact:", err);
      setSnackbar({
        open: true,
        message: `Failed to delete: ${err.message}`,
        severity: "error",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleContactAdded = (contactName) => {
    setSnackbar({
      open: true,
      message: `${contactName} added successfully`,
      severity: "success",
    });
    onRefresh(); // Refresh the list after adding
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.Name?.toLowerCase().includes(searchLower) ||
      contact.Email?.toLowerCase().includes(searchLower) ||
      contact.Phone?.includes(searchTerm) ||
      contact.Account?.Name?.toLowerCase().includes(searchLower)
    );
  });

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
          gap: 2,
        }}
      >
        <Typography variant="h5" component="h2">
          Contacts ({filteredContacts.length})
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            label="Search Contacts"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
            placeholder="Search by name, email, phone..."
            inputProps={{
              "aria-label": "Search contacts by name, email, or phone",
            }}
          />
          <Tooltip title="Refresh Contacts">
            <IconButton
              color="primary"
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Refresh contacts list"
            >
              {refreshing ? (
                <CircularProgress size={24} aria-label="Loading contacts" />
              ) : (
                <RefreshIcon />
              )}
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            aria-label="Add new contact"
          >
            Add Contact
          </Button>
        </Box>
      </Box>

      {filteredContacts.length === 0 ? (
        <Box
          sx={{ p: 3, textAlign: "center" }}
          role="status"
          aria-live="polite"
        >
          <Typography color="text.secondary">
            {searchTerm
              ? "No contacts found matching your search."
              : "No contacts available."}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 650 }} aria-label="Contacts data table">
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
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
                  Account
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Created Date
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow
                  key={contact.Id}
                  sx={{
                    "&:nth-of-type(odd)": { bgcolor: "action.hover" },
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight="medium">
                        {contact.Name}
                      </Typography>
                      {contact.convertedFromLead && (
                        <Tooltip title="Converted from Lead">
                          <Chip
                            icon={<TrendingUpIcon />}
                            label="From Lead"
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {contact.Email ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" color="action" />
                        <a
                          href={`mailto:${contact.Email}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          {contact.Email}
                        </a>
                      </Box>
                    ) : (
                      <Typography color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {contact.Phone ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon fontSize="small" color="action" />
                        {contact.Phone}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {contact.Account?.Name ? (
                      <Chip
                        icon={<BusinessIcon />}
                        label={contact.Account.Name}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(contact.CreatedDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Delete Contact">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(contact)}
                        disabled={deleting === contact.Id}
                        aria-label={`Delete contact ${contact.Name}`}
                      >
                        {deleting === contact.Id ? (
                          <CircularProgress
                            size={20}
                            aria-label="Deleting contact"
                          />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </Tooltip>
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

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, contact: null })}
      >
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{deleteDialog.contact?.Name}</strong>? This action cannot be
            undone.
          </DialogContentText>
          {deleteDialog.contact?.convertedFromLead && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This contact was created from a converted Lead. The Lead record
              will remain as "Closed - Converted" for audit purposes.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, contact: null })}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <AddContactDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onContactAdded={handleContactAdded}
      />
    </Box>
  );
}

export default ContactsTable;
