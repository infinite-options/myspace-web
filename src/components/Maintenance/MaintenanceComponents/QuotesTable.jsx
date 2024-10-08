import {
	Grid,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import theme from '../../../theme/theme';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function QuotesTable({ maintenanceItem, onQuoteSelect, navigateParams, maintenanceQuotesForItem }) {
	//console.log('In QuotesTable');
	//console.log('maintenanceQuotesForItem: ', maintenanceQuotesForItem);
	// maintenanceQuotes is a state variable that is set in the grandparent component
	// maintenanceItem is a prop that is passed from the parent component
	let navigate = useNavigate();

	let request_status = maintenanceItem.maintenance_request_status;
	let status = maintenanceItem.maintenance_status;

	let tableText = { color: '#160449', fontWeight: 500, fontSize: '18px' };
	let tableHeader = { color: '#FFFFFF', fontWeight: 700, fontSize: '18px' };
	let tableCell = { padding: '0px', margin: '0px' };

	const [expanded, setExpanded] = useState(false);
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const handleChange = () => {
		setExpanded(!expanded);
	};

	const columns = [
		{ field: 'maint_business_name', headerName: 'Business Name', flex: 1 },
		{ field: 'maint_business_uid', headerName: 'ID', flex: 1 },
		{ field: 'quote_total_estimate', headerName: 'Amount', flex: 1 },
		{ field: 'quote_status', headerName: 'Status', flex: 1 },
		{ field: 'quote_created_date', headerName: 'Quote Date', flex: 1 },
	];

	const handleViewQuotesNavigate = (quote_id, params) => {
		console.log('In handleViewQuotesNavigate');
		console.log('quotes: ', maintenanceQuotesForItem);
		console.log(
			'index: ',
			maintenanceQuotesForItem.findIndex((item) => item.maintenance_quote_uid === quote_id)
		);
		if (isMobile) {
			navigate('/quoteAccept', {
				state: {
					maintenanceItem: maintenanceItem,
					navigateParams: navigateParams,
					quotes: maintenanceQuotesForItem,
					index: maintenanceQuotesForItem.findIndex((item) => item.maintenance_quote_uid === quote_id),
				},
			});
		} else {
      console.log('inside else Quotes table---', onQuoteSelect);
		const selectedIndex = maintenanceQuotesForItem.findIndex(item => item.maintenance_quote_uid === params.row.maintenance_quote_uid);
        onQuoteSelect(selectedIndex);
    
}
	};

	if (request_status !== 'NEW') {
		return (
			<Grid item xs={12}>
				<Typography sx={{ color: '#160449', fontWeight: 900, fontSize: '24px' }}>Quotes Table</Typography>
				<Typography sx={tableText}> {maintenanceQuotesForItem.length} Quotes</Typography>
				{maintenanceQuotesForItem.length > 0 ? (
					<DataGrid
						rows={maintenanceQuotesForItem}
						columns={columns}
						pageSize={5}
						rowsPerPageOptions={[5]}
						autoHeight
						// getRowId={(row) => row.maint_business_uid}
						getRowId={(row) => row.maintenance_quote_uid}
						hideFooter={true}
						sx={{
							'& .MuiDataGrid-cell': {
								fontSize: '14px', // Change the font size
								fontWeight: theme.typography.common.fontWeight, // Change the font weight
								color:'#160449',
							},
							'& .MuiDataGrid-columnHeaders': {
								fontSize: '16px', // Change the font size
								fontWeight: theme.typography.common.fontWeight, // Change the font weight
								color: '#160449', // Change the font color of the headers
							},
							border: 0,
							'& .MuiDataGrid-main': {
								border: 0, // Removes the inner border
							},
							'& .MuiDataGrid-columnSeparator': {
								display: 'none', // Remove vertical borders in the header
							},
						}}
						onRowClick={(params) => handleViewQuotesNavigate(params.row.maintenance_quote_uid, params)}
					/>
				) : null}
			</Grid>
		);
	}
}
