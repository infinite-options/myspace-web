class DataValidator {
  static ssn_validate(ssn) {
    // Implement SSN validation logic here
    // For example, a basic validation could be checking if the SSN is a 9-digit number    
    // const ssnRegex = /^\d{9}$/;
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    return ssnRegex.test(ssn);
  }
  static ein_validate(ein) {
    // Implement EIN validation logic here
    // For example, a basic validation could be checking if the SSN is a 9-digit number
    // const ssnRegex = /^\d{9}$/;
    const einRegex = /^\d{2}-\d{7}$/;
    return einRegex.test(ein);
  }

  static phone_validate(phoneNumber) {
    // Implement phone number validation logic here
    // For example, a basic validation could be checking if the phone number is a valid US number
    // Valid US phone number example: (123)456-7890
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phoneNumber);
  }

  static email_validate(email) {
    // Implement email validation logic here
    // For example, a basic validation could be checking if the email has a valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static zipCode_validate(zipCode) {
    // Implement zip code validation logic here
    // For example, a basic validation could be checking if the zip code is a 5-digit number
    const zipCodeRegex = /^\d{5}$/;
    return zipCodeRegex.test(zipCode);
  }
}

export default DataValidator;
