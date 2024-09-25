import React, { useState, useEffect } from "react";
import { Card, Typography, Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function NewCardSlider(props) {
  //   const announcementList = [
  //       { announcement_title: "Announcement 1", announcement_msg: "Description of Announcement 1", announcement_uid: 1 },
  //       { announcement_title: "Announcement 2", announcement_msg: "Description of Announcement 2", announcement_uid: 2 },
  //       { announcement_title: "Announcement 3", announcement_msg: "Description of Announcement 3", announcement_uid: 3 },
  //       { announcement_title: "Announcement 4", announcement_msg: "Description of Announcement 4", announcement_uid: 4 },
  //       { announcement_title: "Announcement 5", announcement_msg: "Description of Announcement 5", announcement_uid: 5 }
  //   ];
  const announcementList = props.announcementList;

  const [currentIndex, setCurrentIndex] = useState(0);

  const [prevCardIndex, setPrevCardIndex] = useState(0);
  const [nextCardIndex, setNextCardIndex] = useState(0);
  const [prevCard, setPrevCard] = useState(false);
  const [nextCard, setNextCard] = useState(false);

  useEffect(() => {
    if (currentIndex - 1 >= 0) {
      // console.log("prev card", "true", currentIndex-1)
      setPrevCardIndex(currentIndex - 1);
      setPrevCard(true);
    } else {
      setPrevCard(false);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (currentIndex + 1 < announcementList.length) {
      // console.log("prev card", "true", currentIndex+1)
      setNextCardIndex(currentIndex + 1);
      setNextCard(true);
    } else {
      setNextCard(false);
    }
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : announcementList.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < announcementList.length - 1 ? prevIndex + 1 : 0));
  };

  return (
    <Box maxWidth='100%' sx={{ maxHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Button
        onClick={handlePrev}
        disabled={currentIndex === 0 ? true : false}
        sx={{
          padding: "0px",
          color: "#007AFF",
          "&:hover": {
            backgroundColor: "transparent",
          },
        }}
      >
        <ArrowBackIcon />
      </Button>
      <Box sx={{ overflow: "hidden", display: "flex", width: "auto", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
        {prevCard && !props.isMobile && (
          <Card sx={{ width: 500, padding: 5, margin: 2, opacity: "50%" }}>
            <Typography sx={{ color: "#000000", fontSize: "18px", fontWeight: 700, marginBottom : "10px" }}>{announcementList[prevCardIndex].announcement_title}</Typography>
            <Typography sx={{ color: "#000000", fontSize: "16px", fontWeight: 500, opacity: "50%", marginBottom: "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", }}>{announcementList[prevCardIndex].announcement_msg}</Typography>
            <Typography sx={{ color: "#000000", fontSize: "16px", fontWeight: 500, opacity: "50%" }}>{announcementList[prevCardIndex].announcement_uid}</Typography>
          </Card>
        )}
        <Card sx={{ width: props.isMobile ? 250 : 500, padding: 5, margin: 2, border: "1px solid #000" }}>
          <Typography sx={{ color: "#000000", fontSize: "18px", fontWeight: 700, marginBottom : "10px" }}>{announcementList[currentIndex].announcement_title}</Typography>
          <Typography sx={{ color: "#000000", fontSize: "16px", fontWeight: 500, opacity: "50%", marginBottom: "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", }}>{announcementList[currentIndex].announcement_msg}</Typography>
          <Typography sx={{ color: "#000000", fontSize: "16px", fontWeight: 500, opacity: "50%" }}>{announcementList[currentIndex].announcement_uid}</Typography>
        </Card>
        {!prevCard && nextCard && !props.isMobile && (
          <Card sx={{ width: 500, padding: 5, margin: 2, opacity: "50%" }}>
            <Typography sx={{ color: "#000000", fontSize: "18px", fontWeight: 700, marginBottom : "10px" }}>{announcementList[nextCardIndex].announcement_title}</Typography>
            <Typography sx={{ color: "#000000", fontSize: "16px", fontWeight: 500, marginBottom: "5px", opacity: "50%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", }}>{announcementList[nextCardIndex].announcement_msg}</Typography>
            <Typography sx={{ color: "#000000", fontSize: "16px", fontWeight: 500, opacity: "50%" }}>{announcementList[nextCardIndex].announcement_uid}</Typography>
          </Card>
        )}
      </Box>
      <Button
        onClick={handleNext}
        disabled={currentIndex === announcementList.length - 1 ? true : false}
        sx={{
          padding: "0px",
          color: "#007AFF",
          "&:hover": {
            backgroundColor: "transparent",
          },
        }}
      >
        <ArrowForwardIcon />
      </Button>
    </Box>
  );
}
