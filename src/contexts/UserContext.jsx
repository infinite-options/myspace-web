import React, { createContext, useContext, useState, useEffect } from "react";
import { useCookies, Cookies } from "react-cookie";

const UserContext = createContext();

export const UserProvider = ({ children, cookiesObj = new Cookies() }) => {
  const [cookies, setCookie] = useCookies(["user", "token", "selectedRole"]);
  const [user, setUser] = useState(cookies.user);
  const [selectedRole, setSelectedRole] = useState(cookies.selectedRole);
  const [isLoggedIn, setLoggedIn] = useState(!!cookies.user);
  const [onboardingState, setOnboardingState] = useState();
  const [supervisor, setSupervisor] = useState(null);
  const setAuthData = (data) => {
    //console.log("setAuthData - data - ", data);

    // Update user state
    setUser((prevUser) => {
      const newUserData = { ...prevUser, ...data.user };

      // Perform side effects after updating state
      setCookie("user", newUserData);
      setCookie("token", data.access_token);

      // Return the new state
      return newUserData;
    });
  };

  // useEffect(() => {
  //   //console.log("$user set to", user);
  //   //console.log("cookies set to", cookies);    
  // }, [user]);

  const selectRole = (role) => {
    setSelectedRole(role);
    setCookie("selectedRole", role);
  };
  const isBusiness = () => {
    return selectedRole === "MANAGER" || selectedRole === "MAINTENANCE";
  };
  const isManager = () => {
    return selectedRole === "MANAGER";
  };
  const isManagement = () => {
    return selectedRole === "MANAGER" || selectedRole === "PM_EMPLOYEE";
  };
  const isManagementEmployee = () => {
    return selectedRole === "PM_EMPLOYEE";
  };
  const isEmployee = () => {
    return selectedRole === "PM_EMPLOYEE" || selectedRole === "MAINT_EMPLOYEE";
  };

  const isMaintenance = () => {
    return selectedRole === "MAINTENANCE" || selectedRole === "MAINT_EMPLOYEE";
  };

  const isOwner = () => {
    return selectedRole === "OWNER";
  };

  const roleName = (role = selectedRole) => {
    switch (role) {
      case "MANAGER":
        return "Manager";
      case "MAINTENANCE":
        return "Maintenance";
      case "PM_EMPLOYEE":
        return "PM Employee";
      case "MAINT_EMPLOYEE":
        return "Maintenance Employee";
      case "OWNER":
        return "Owner";
      default:
        return "Tenant";
    }
  };
  const updateProfileUid = (profileUidObj) => {
    // //console.log("updateProfileUid - profileUidObj - ", profileUidObj)    
    // //console.log("updateProfileUid - selectedRole - ", selectedRole) 
    // console.log('In UserContext');   
    if (isBusiness() || isEmployee()) {
      setUser((prev) => updateUser(prev, profileUidObj));
    } else {
      setUser((prev) => ({ ...prev, ...profileUidObj }));
    }
  };

  const updateEmployeeProfileUid = (profileUidObj, role) => {
    // //console.log("updateEmployeeProfileUid - profileUidObj - ", profileUidObj)    
    // //console.log("updateEmployeeProfileUid - role - ", role)    
    if (["PM_EMPLOYEE", "MAINT_EMPLOYEE"].includes(role)) {      
      setUser((prev) => updateUserEmployee(prev, profileUidObj, role));
      // setUser((prev) => updateUser(prev, profileUidObj));
    } else {
      setUser((prev) => ({ ...prev, ...profileUidObj }));
    }
  };

  const updateAppSettings = (settingsObj) => {    
    // //console.log("updateAppSettings - settingsObj - ", settingsObj);    
    setUser((prevUser) => {
      const newUserData = { ...prevUser, ...settingsObj };

      setCookie("user", newUserData);            
      return newUserData;
    });
  };

  const updateUser = (prevUser, profileUidObj) => {
    // //console.log("updateUser - prevUser - ", prevUser)
    // //console.log("updateUser - profileUidObj - ", profileUidObj)
    let newBusinesses;
    if (selectedRole === "MANAGER" || selectedRole === "PM_EMPLOYEE") {
      newBusinesses = {
        ...prevUser?.businesses,
        MANAGEMENT: updateBusinessSection(prevUser?.businesses?.MANAGEMENT, profileUidObj),
      };
    } else {
      newBusinesses = {
        ...prevUser?.businesses,
        MAINTENANCE: updateBusinessSection(prevUser?.businesses?.MAINTENANCE, profileUidObj),
      };
    }
    // //console.log("updateUser - newBusinesses - ", newBusinesses)
    return {
      ...prevUser,
      businesses: newBusinesses,
    };
  };

  const updateUserEmployee = (prevUser, profileUidObj, role) => {
    // //console.log("updateUserEmployee - prevUser - ", prevUser)
    // //console.log("updateUserEmployee - profileUidObj - ", profileUidObj)
    let newBusinesses;
    if (role === "PM_EMPLOYEE") {
      newBusinesses = {
        ...prevUser?.businesses,
        MANAGEMENT: updateBusinessSection(prevUser?.businesses?.MANAGEMENT, profileUidObj),
      };
    } else {
      newBusinesses = {
        ...prevUser?.businesses,
        MAINTENANCE: updateBusinessSection(prevUser?.businesses?.MAINTENANCE, profileUidObj),
      };
    }
    // //console.log("updateUserEmployee - newBusinesses - ", newBusinesses)
    return {
      ...prevUser,
      businesses: newBusinesses,
    };
  };

  const updateBusinessSection = (prevSection, profileObj) => {
    if (prevSection) {
      return Object.assign({}, prevSection, profileObj);
    }
    return profileObj;
  };
  const getBusiness = (user, type) => user.businesses[type].business_uid;  //"600-000003"
  const getProfileId = () => {
    // //console.log('getProfileId - ', user.businesses.MANAGEMENT.business_employee_id)
    // //console.log('selectedRole - ', selectedRole)
    if (selectedRole === "PM_EMPLOYEE") return user.businesses.MANAGEMENT.business_employee_id;
    if (selectedRole === "MAINT_EMPLOYEE") return user.businesses.MAINTENANCE.business_employee_id;
    if (isManagement()) return getBusiness(user, "MANAGEMENT");
    if (isMaintenance()) return getBusiness(user, "MAINTENANCE");
    if (selectedRole === "TENANT") return user.tenant_id;
    if (selectedRole === "OWNER") return user.owner_id;
  };

  const getRoleId = () => {
    // //console.log('Raminsss', user)
    if (selectedRole === "PM_EMPLOYEE") return user.businesses.MANAGEMENT.business_employee_id;
    if (selectedRole === "MAINT_EMPLOYEE") return user.businesses.MAINTENANCE.business_employee_id;
    if (isManagement()) return user.businesses.MANAGEMENT.business_owner_id;
    if (isMaintenance()) return user.businesses.MAINTENANCE.business_owner_id;
    if (selectedRole === "TENANT") return user.tenant_id;
    if (selectedRole === "OWNER") return user.owner_id;
  };
  const logout = () => {
    // //console.log("In logout as ", user);
    sessionStorage.clear();
    cookiesObj.remove("user");
    cookiesObj.remove("token");
    cookiesObj.remove("selectedRole");
    cookiesObj.remove("default_form_vals");
    window.location.href = "/";
  };

  const maintenanceRoutingBasedOnSelectedRole = () => {
    const role = roleName();
    if (role === "Manager") {
      return "/managerMaintenance";
    } else if (role === "Owner") {
      return "/ownerMaintenance";
    } else if (role === "Maintenance") {
      return "/workerMaintenance";
    } else if (role === "PM Employee") {
      return "/managerMaintenance";
    } else if (role === "Maintenance Employee") {
      return "/workerMaintenance";
    } else if (role === "Tenant") {
      return "/tenantMaintenance";
    }
  };

  const paymentRoutingBasedOnSelectedRole = () => {
    const role = roleName();
    if (role === "Manager") {
      return "/payments";
    }
    // } else if (role === "Property Owner"){
    // return "/ownerMaintenance"
    // } else if (role === "Maintenance"){
    // return "/workerMaintenance"
    // } else if (role === "PM Employee"){
    // return "/managerMaintenance"
    // } else if (role === "Maintenance Employee"){
    // return "/workerMaintenance"
    else if (role === "Tenant") {
      return "/payments";
    }
  };

  const leaseRoutingBasedOnSelectedRole = () => {
    // //console.log("routingWithSelectedRole selectedRole", selectedRole)
    const role = roleName();
    if (role === "Manager") {
      return "/Leases";
    } else if (role === "Owner") {
      return "/Leases";
    }
  };

  const propertyRoutingBasedOnSelectedRole = () => {
    // //console.log("routingWithSelectedRole selectedRole", selectedRole)
    const role = roleName();
    if (role === "Manager") {
      sessionStorage.removeItem("isrent");
      return "/properties";
    } else if (role === "Owner") {
      return "/properties";
    }
  };

  const dashboardRoutingBasedOnSelectedRole = () => {
    // //console.log("dashboardRoutingBasedOnSelectedRole selectedRole", selectedRole)
    const role = roleName();
    if (role === "Manager") {
      return "/managerDashboard";
    } else if (role === "Owner") {
      return "/ownerDashboard";
    } else if (role === "Maintenance") {
      return "/maintenanceDashboard2";
    } else if (role === "PM Employee") {
      return "/managerDashboard";
    } else if (role === "Maintenance Employee") {
      return "/maintenanceDashboard2";
    } else if (role === "Tenant") {
      return "/tenantDashboard";
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        selectedRole,
        selectRole,
        setAuthData,
        onboardingState,
        setOnboardingState,
        isBusiness,
        isManager,
        isEmployee,
        isManagementEmployee,
        supervisor,
        setSupervisor,
        isOwner,
        roleName,
        isLoggedIn,
        setLoggedIn,
        updateProfileUid,
        updateEmployeeProfileUid,
        getProfileId,
        getRoleId,
        logout,
        maintenanceRoutingBasedOnSelectedRole,
        paymentRoutingBasedOnSelectedRole,
        leaseRoutingBasedOnSelectedRole,
        propertyRoutingBasedOnSelectedRole,
        dashboardRoutingBasedOnSelectedRole,
        updateAppSettings,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  // //console.log("In useUser");
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
