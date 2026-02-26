import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function OwnershipTransferPopup({ 
  open, 
  onClose, 
  transfer, 
  onAccept, 
  onDecline, 
  loading 
}) {
  if (!transfer) return null;

  const formattedPercent = parseFloat(transfer.proposed_percent || 0).toFixed(1);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '8px',
        },
      }}
    >
      <DialogTitle sx={{
        p: 2,
        textAlign: 'center',
        position: 'relative',
      }}>
        <Button 
          sx={{ 
            position: 'absolute',
            right: 4,
            top: 4,
            color: '#666',
            minWidth: 'auto',
            padding: '4px',
          }} 
          onClick={onClose}
          disabled={loading}
        >
          <CloseIcon />
        </Button>
        
        <Typography 
          variant="h6" 
          fontWeight="600" 
          color="#160449"
        >
          Ownership Transfer Request
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="#666" mb={0.5}>
            Property
          </Typography>
          <Typography variant="body1" fontWeight="600" color="#160449">
            {transfer.property_address ? (
              <>
                {transfer.property_address}
                {transfer.property_unit ? `, Unit ${transfer.property_unit}` : ''}
              </>
            ) : (
              `Property ID: ${transfer.property_id}`
            )}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="#666" mb={0.5}>
            From
          </Typography>
          <Typography variant="body1" fontWeight="600" color="#160449">
            {transfer.owner_first_name} {transfer.owner_last_name}
          </Typography>
          <Typography variant="body2" color="#666">
            {transfer.owner_email}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="#666" mb={0.5}>
            Ownership Transfer
          </Typography>
          <Typography variant="h5" fontWeight="700" color="#3D5CAC">
            {formattedPercent}%
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={() => {
            onDecline(transfer.transfer_id);
            onClose();
          }}
          disabled={loading}
          sx={{
            flex: 1,
            textTransform: 'none',
            color: '#F44336',
            borderColor: '#F44336',
            '&:hover': {
              borderColor: '#D32F2F',
              backgroundColor: '#FFEBEE',
            },
          }}
        >
          Decline
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onAccept(transfer.transfer_id);
            onClose();
          }}
          disabled={loading}
          sx={{
            flex: 1,
            textTransform: 'none',
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Accept'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
