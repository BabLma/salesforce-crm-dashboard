import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

function LeadConversionDialog({ open, onClose, lead, onLeadConverted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConvert = async () => {
    if (!lead) return;

    setLoading(true);
    setError(null);

    try {
      const { convertLead } = await import("../services/salesforceApi");

      const result = await convertLead(lead.Id);

      // Notify parent component
      onLeadConverted(lead.Name, result);
      onClose();
    } catch (err) {
      console.error("Error converting lead:", err);
      setError(err.message || "Failed to convert lead");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonAddIcon color="primary" />
          Convert Lead to Contact
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body1" paragraph>
          Are you sure you want to convert <strong>{lead?.Name}</strong>?
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          This will:
        </Typography>

        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
          <Typography component="li" variant="body2" color="text.secondary">
            Create a new Contact record
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Create a new Account for {lead?.Company}
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Mark the Lead as "Closed - Converted"
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          This action cannot be undone. The lead will become read-only.
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConvert}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} /> : <PersonAddIcon />
          }
        >
          {loading ? "Converting..." : "Convert Lead"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LeadConversionDialog;
