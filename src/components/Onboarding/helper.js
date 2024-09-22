const MaskCharacter = (str, mask, n = 1) => {
  return ("" + str).slice(0, -n).replace(/./g, mask) + ("" + str).slice(-n);
};

const formatPhoneNumber = (value) => {
  if (!value) return value;

  const phoneNumber = value.replace(/[^\d]/g, "");

  const phoneNumberLength = phoneNumber.length;

  if (phoneNumberLength < 4) return phoneNumber;

  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }

  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
    3,
    6
  )}-${phoneNumber.slice(6, 10)}`;
};

const formatSSN = (value) => {
  if (!value) return value;

  const SSN = value.replace(/[^\d]/g, "");

  const SSNLength = SSN.length;

  if (SSNLength < 4) return SSN;

  if (SSNLength < 6) {
    return `${SSN.slice(0, 3)}-${SSN.slice(3)}`;
  }

  return `${SSN.slice(0, 3)}-${SSN.slice(
    3,
    5
  )}-${SSN.slice(5, 9)}`;
};

const formatEIN = (value) => {
  if (!value) return value;

  const EIN = value.replace(/[^\d]/g, "");

  const EINLength = EIN.length;

  if (EINLength < 3) return EIN;

  // if (EINLength < 10) {
  //   return `${SSN.slice(0, 3)}-${SSN.slice(3)}`;
  // }

  return `${EIN.slice(0, 2)}-${EIN.slice(2,9)}`;
};

function identifyTaxIdType(taxId) {
  // SSN Regex: XXX-XX-XXXX
  const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
  // EIN Regex: XX-XXXXXXX
  const einRegex = /^\d{2}-\d{7}$/;

  if (ssnRegex.test(taxId)) {
      return 'SSN';
  } else if (einRegex.test(taxId)) {
      return 'EIN';
  } else {
      return 'Invalid format';
  }
}

const maskNumber = (value) => {
  const len = value.length;
  const mask = "***-**-****";
  if (len < 4) return mask.slice(0, len);
  if (len < 6) return mask.slice(0, len + 1);
  return mask.slice(0, len + 2);
};

const newmaskNumber = (value = '') => {
  // Ensure the value is in the correct format by removing non-numeric characters
  const formattedValue = value.replace(/[^0-9]/g, ''); // Removes dashes and non-numeric characters

  // Define the mask pattern and length of formattedValue
  const len = formattedValue.length;

  // Handle various input lengths to return the appropriate masked value
  if (len === 0) return "";
  if (len <= 3) return "*".repeat(len); // Mask up to the first 3 digits
  if (len <= 5) return "***-" + formattedValue.slice(3, len); // Mask for the first 3 digits and show the next 1 or 2
  if (len <= 9) return "***-**-" + formattedValue.slice(5, len); // Mask the first 5 digits, show the rest

  return "***-**-" + formattedValue.slice(-4); // If fully entered (9 digits), show the last 4 digits
};


const maskEin = (value) => {
  const len = value.length;
  const mask = "**-*******";
  if (len < 3) return mask.slice(0, len);
  return mask.slice(0, len + 1);
};


const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Credentials": "*",
};

const roleMap = {
  OWNER: {
    dashboardUrl: "/ownerDashboard",
    profileApi: "/profile",
  },
  MANAGER: {
    dashboardUrl: "/managerDashboard",
    profileApi: "/profile",
  },
  TENANT: {
    dashboardUrl: "/tenantDashboardPM", //change here to revert back to tenantDashboard
    profileApi: "/profile",
  },
  MAINTENANCE: {
    dashboardUrl: "/maintenanceDashboard2",
    profileApi: "/profile",
  },
  PM_EMPLOYEE: {
    dashboardUrl: "/managerDashboard",
    profileApi: "/employee",
  },
  MAINT_EMPLOYEE: {
    dashboardUrl: "/maintenanceDashboard2",
    profileApi: "/employee",
  },
};

const photoFields = new Set(["owner_photo", "employee_photo_url","owner_photo_url","business_photo_url", "tenant_photo", "tenant_photo_url","business_photo"]);

export {
  MaskCharacter,
  formatPhoneNumber,
  formatSSN,
  formatEIN,
  identifyTaxIdType,
  headers,
  maskNumber,
  newmaskNumber,
  maskEin,
  roleMap,
  photoFields,
};
