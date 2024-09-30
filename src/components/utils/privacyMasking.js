import CryptoJS from "crypto-js";

function maskSSN(ssn) {
  console.log("SSN input: ", ssn);
  // ssn = ssn.replace(/\D/g, "");
  // console.log("SSN: ", ssn);

  // Encrypted value (you'll get this from your data source)
  const encryptedValue = ssn; // Replace this with the actual encrypted value
  const encryptionKey = process.env.REACT_APP_ENKEY; // Your encryption key
  console.log("Encrypted Text:", encryptedValue); // This will log the decrypted SSN
  console.log("Encryption Key:", encryptionKey);

  // Decrypting the value
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedValue, encryptionKey);
  const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

  console.log("Decrypted Text:", decryptedText); // This will log the decrypted SSN

  ssn = decryptedText.replace(/\D/g, "");
  console.log("SSN: ", ssn);

  if (ssn.length !== 9) {
    console.error("Invalid SSN Length");
    return "<SSN-invalid length>";
  }

  console.log("***-**-" + ssn.slice(5));
  return "***-**-" + ssn.slice(5);
  // return `${ssn.slice(0, 3)}-${ssn.slice(3, 5)}-${ssn.slice(5)}`;
}

function maskEIN(ein) {
  ein = ein.replace(/\D/g, "");

  if (ein.length !== 9) {
    console.error("Invalid EIN Length");
    return "**";
  }

  return ein.slice(0, 2) + "-*******";
}

function formattedPhoneNumber(phoneNumber) {
  phoneNumber = phoneNumber.replace(/\D/g, "");

  if (phoneNumber.length !== 10) {
    console.error("Invalid Phone Number Length");
    // return '<PHONE_NUMBER> - invalid length';
    return phoneNumber;
  }

  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
}

export { maskSSN, maskEIN, formattedPhoneNumber };
