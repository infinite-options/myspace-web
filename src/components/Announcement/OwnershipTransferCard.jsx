import { Typography, Box, Chip } from "@mui/material";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { calculateAge } from "../utils/helper";

function OwnershipTransferCard({ transfer, onClick }) {
  const formattedPercent = parseFloat(transfer.proposed_percent || 0).toFixed(1);

  return (
    <div 
      className='announcement-list-card' 
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className='announcement-list-card-picture-container'>
        <div
          className='announcement-list-card-picture'
          style={{ 
            width: "40px", 
            height: "40px", 
            border: "4px solid #FF9800", 
            borderRadius: "50%", 
            overflow: "hidden",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFF3E0',
          }}
        >
          <HomeWorkIcon sx={{ fontSize: 24, color: '#FF9800' }} />
        </div>
      </div>
      <div className='announcement-list-card-text-container'>
        <div className='announcement-list-card-text-from'>
          From: {transfer.owner_first_name} {transfer.owner_last_name}
        </div>
        <div className='announcement-list-card-text-from'>
          {transfer.owner_email}
        </div>
        <div className='announcement-list-card-text-from'>
          <strong>Property Transfer</strong>
        </div>
        <div className='announcement-list-card-text-contents'>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" component="span">
              Transfer Request:
            </Typography>
            <Chip 
              label={`${formattedPercent}% Ownership`}
              size="small"
              sx={{ 
                backgroundColor: '#FF9800',
                color: '#fff',
                fontWeight: 600,
                fontSize: '11px',
              }}
            />
          </Box>
        </div>
        <div className='announcement-list-card-text-contents'>
          Property: {transfer.property_id}
        </div>
        <div className='announcement-list-card-text-date'>
          Status: {transfer.transfer_status}
        </div>
      </div>
      <div className='announcement-list-card-options'>
        <Chip 
          label="PENDING"
          color="warning"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </div>
    </div>
  );
}

export default OwnershipTransferCard;
