import { fontString } from "chart.js/helpers";

export const textFieldInputProps = {  
    sx: {
      border: 'none',
      width: '100%',    
      height: '40px',
      fontFamily: 'inherit',
      fontWeight: 'inherit',
      color: '#3D5CAC',
      opacity: '1',
      paddingLeft: '2px',
      borderRadius: '5px',
      backgroundColor: '#FFFFFF',
    },
};
  
export const textFieldSX = {
    width: '100%',
    "& .MuiInputBase-root": {
      borderRadius: "5px",    
      border: "1px solid #3D5CAC",
      // border: 'none',
    },              
    "& .MuiInputBase-root.Mui-focused": {
      borderColor: "#3D5CAC",
      border: "2px solid #3D5CAC"                
    },
    "& input": {
      padding: "5px",
      height: "40px",
      color: "#3D5CAC",
      fontSize: "16px",
    },
    // "& .MuiFormControl-root": {
    //   width: '100%',
    // },
    // "& .MuiTextField-root": {
    //   width: '100%',
    // },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'white',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
      '&.Mui-focused fieldset': {      
        border: 'none',
      },
    },
}
  
export const datePickerSlotProps = {
    // textField: {
    //     size: 'small',
    //     sx: {
    //     width: '100%',
    //     marginTop: '6px',
    //     height: '38px',
    //     fontSize: 24,
    //     backgroundColor: '#FFFFFF',
    //     borderRadius: '5px',
    //     border: '1px solid #3D5CAC',
    //     transition: 'border-color 0.3s',
    //     "& .MuiInputBase-root": {
    //         // borderRadius: '5px',
    //         borderColor: '#3D5CAC',                      
    //     },
    //     "&:hover .MuiInputBase-root": {
    //         borderColor: '#3D5CAC', // Change border color on hover
            
    //     },
    //     "& .MuiInputBase-root.Mui-focused": {
    //         borderColor: '#3D5CAC', // Change border color on focus                      
    //     },
    //     "& input": {
    //         padding: '0 10px',
    //         height: '38px',
    //         color: '#3D5CAC',
    //         // border: '1px solid #3D5CAC',
    //         // borderColor: '#3D5CAC',
    //         // borderRadius: '5px',                      
    //     },
    //     "& input:focus": {
    //         borderColor: '#3D5CAC',        

    //         // outline: 'none', // Remove the default outline
    //     },
    //     "& input:hover": {
    //         borderColor: '#3D5CAC', 
    //     },
    //     '& .MuiOutlinedInput-root': {
    //         '& fieldset': {
    //         borderColor: 'white',
    //         },
    //         '&:hover fieldset': {
    //         borderColor: 'white',
    //         },
    //         '&.Mui-focused fieldset': {      
    //         // border: 'none',
    //         border: '1px solid #3D5CAC',
    //         },
    //     },

    //     },
    // },
    textField: {
      size: 'small',
      sx: {
        width: '100%',
        marginTop: '6px',
        height: '38px',
        fontSize: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: '5px',
        border: '1px solid #3D5CAC',
        transition: 'border-color 0.3s',
        "& .MuiInputBase-root": {
          borderColor: '#3D5CAC',                      
        },
        "&:hover .MuiInputBase-root": {
          borderColor: '#3D5CAC', // Change border color on hover
          
        },
        "& .MuiInputBase-root.Mui-focused": {
          borderColor: '#3D5CAC', // Change border color on focus                      
        },
        "& input": {
          padding: '0 10px',
          paddingRight: "0px",
          height: '38px',
          color: '#3D5CAC',
          fontSize: '16px',                    
        },
        "& input:focus": {
          borderColor: '#3D5CAC',        
  
        },
        "& input:hover": {
          borderColor: '#3D5CAC', 
        },
        '& .MuiOutlinedInput-root': {
          paddingRight: '2px',
          '& fieldset': {
          borderColor: 'white',
          },
          '&:hover fieldset': {
          borderColor: 'white',
          },
          '&.Mui-focused fieldset': {      
          // border: 'none',
          border: '1px solid #3D5CAC',
          },
        },
      },
    },
}