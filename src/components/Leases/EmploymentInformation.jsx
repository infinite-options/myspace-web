import React from 'react';
import {
  Grid, Typography, TextField, Button, InputAdornment, Select, MenuItem, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const EmploymentInformation = ({ employmentList, setEmploymentList, salaryFrequencies }) => {
  
  // Function to handle changes for each employment field
  const handleEmploymentChange = (index, field, value) => {
    const updatedEmploymentList = employmentList.map((employment, i) => (
      i === index ? { ...employment, [field]: value } : employment
    ));
    setEmploymentList(updatedEmploymentList);
  };

  // Function to add a new employment entry
  const handleAddEmployment = () => {
    setEmploymentList([...employmentList, { jobTitle: "", companyName: "", salary: "", frequency: "" }]);
  };

  // Function to remove an employment entry
  const handleRemoveEmployment = (index) => {
    const updatedEmploymentList = employmentList.filter((_, i) => i !== index);
    setEmploymentList(updatedEmploymentList);
  };

  return (
    <>
      {employmentList.map((employment, index) => (
        <Grid container spacing={2} key={index} sx={{ marginBottom: '16px' }}>
          {/* Job Title */}
          <Grid item xs={6}>
            <Typography>Job Title</Typography>
            <TextField
              variant="filled"
              fullWidth
              placeholder="Job Title"
              value={employment.jobTitle}
              onChange={(e) => handleEmploymentChange(index, 'jobTitle', e.target.value)}
            />
          </Grid>

          {/* Company Name */}
          <Grid item xs={6}>
            <Typography>Company</Typography>
            <TextField
              variant="filled"
              fullWidth
              placeholder="Company Name"
              value={employment.companyName}
              onChange={(e) => handleEmploymentChange(index, 'companyName', e.target.value)}
            />
          </Grid>

          {/* Salary */}
          <Grid item xs={6}>
            <Typography>Current Salary</Typography>
            <TextField
              variant="filled"
              fullWidth
              placeholder="Current Salary"
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              value={employment.salary}
              onChange={(e) => handleEmploymentChange(index, 'salary', e.target.value)}
            />
          </Grid>

          {/* Salary Frequency */}
          <Grid item xs={6}>
            <Typography>Frequency</Typography>
            <Select
              variant="filled"
              fullWidth
              value={employment.frequency}
              onChange={(e) => handleEmploymentChange(index, 'frequency', e.target.value)}
            >
              {salaryFrequencies?.map((freq, idx) => (
                <MenuItem key={idx} value={freq.list_item}>{freq.list_item}</MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Delete Button */}
          <Grid item xs={12} textAlign="right">
            <IconButton color="secondary" onClick={() => handleRemoveEmployment(index)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      {/* Add Employment Button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddEmployment}
        sx={{ marginTop: '16px' }}
      >
        Add Employment
      </Button>
    </>
  );
};

export default EmploymentInformation;
