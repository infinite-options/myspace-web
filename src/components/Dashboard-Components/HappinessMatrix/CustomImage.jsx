import React from "react";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

function CustomImage(props) {
  const navigate = useNavigate();
  const { cx, cy, payload, onClick, isVisible, contactDetails, happinessData, setOwnerUID, setHappinessData, page, currentOwnerUID } = props;
  
  // Check if this is the current owner
  const isCurrentOwner = currentOwnerUID && currentOwnerUID === payload.owner_uid;

  if (!isVisible) {
    return null;
  }

  const diameter = 30;
  const outlineWidth = isCurrentOwner ? 4 : 2; // Thicker border for the current owner

  const handleClick = (payload) => {
    if (onClick) {
      onClick(payload); // Call the passed onClick function
    }
    if (page === "OwnerContactDetails") {
      setHappinessData(happinessData);
      setOwnerUID(payload.property_owner_id);
    }
    console.log("ROHIT - payload - ", payload);
    navigate(`/ownerContactDetailsHappinessMatrix`, {
      state: {
        ownerUID: payload.property_owner_id,
        navigatingFrom: "HappinessMatrixWidget",
        happinessData: happinessData,
      },
    });
  };

  return (
    <g onClick={() => handleClick(payload)}>
      <foreignObject x={cx-10 - diameter / 2} y={cy -10 - diameter / 2} width={diameter} height={diameter}>
        {![null, undefined, ""].includes(payload?.photo) ? (
          <img
            src={payload.photo}
            alt='scatter-image'
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
              boxSizing: "border-box", // Ensure border doesn't cause layout issues
              border: `${outlineWidth}px solid ${payload.color}`, // Highlight with thick border if current owner
            }}
          />
        ) : (
          <AccountCircleIcon
            sx={{
              color: payload.color,
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              borderWidth: outlineWidth,
              borderStyle: "solid",
              filter: isCurrentOwner ? "brightness(0.7)" : "none",
            }}
          />
        )}
      </foreignObject>
    </g>
  );
}

export default CustomImage;

