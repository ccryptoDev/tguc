import { Box, Typography } from "@mui/material";

import cardBackground from "../assets/card-background.svg";
import archivedCardBackground from "../assets/archived-card-background.svg";
import { ReactComponent as VisaLogo } from "../assets/visa-logo.svg";
import { ReactComponent as AlchemyLogoWhite } from "../assets/alchemy-logo-white.svg";

interface CreditCardProps {
  cardNumber: string;
  expiryDate: string;
  cardHolder: string;
  isArchived?: boolean;
}

const CreditCard = ({
  cardNumber,
  expiryDate,
  cardHolder,
  isArchived,
}: CreditCardProps) => {
  return (
    <Box
      sx={{
        width: "478px",
        height: "305px",
        position: "relative",
        borderRadius: "20px",
        backgroundColor: `${isArchived ? "#D6D6D6" : "#004CD0"}`,
        backgroundImage: `url(${
          isArchived ? archivedCardBackground : cardBackground
        })`,
        boxShadow: 3,
      }}
    >
      <Box sx={{ position: "absolute", left: "8.33%", top: "12.56%" }}>
        <AlchemyLogoWhite />
      </Box>
      <Typography
        sx={{
          position: "absolute",
          top: "43.04%",
          left: "8.68%",
          color: "primary.contrastText",
          fontSize: "1.8rem",
          width: "24.69rem",
          height: "1.661rem",
          textAlign: "center",
          fontFamily: "Credit Card",
        }}
      >
        {cardNumber}
      </Typography>
      <Typography
        sx={{
          position: "absolute",
          top: "59.6%",
          left: "41.71%",
          width: "1.305rem",
          fontSize: "0.7rem",
          lineHeight: "13px",
          color: "primary.contrastText",
        }}
      >
        VALID THRU
      </Typography>
      <Typography
        sx={{
          position: "absolute",
          top: "61.71%",
          left: "50.87%",
          width: "3.18rem",
          fontSize: "0.75rem",
          fontWeight: "bold",
          lineHeight: "13px",
          color: "primary.contrastText",
          fontFamily: "Credit Card",
        }}
      >
        {expiryDate}
      </Typography>
      <Typography
        sx={{
          position: "absolute",
          top: "82.08%",
          left: "8.52%",
          height: "0.84rem",
          fontSize: "1rem",
          fontWeight: "bold",
          lineHeight: "13px",
          color: "primary.contrastText",
        }}
      >
        {cardHolder}
      </Typography>
      <Box sx={{ position: "absolute", bottom: "2.48rem", right: "8.47%" }}>
        <VisaLogo />
      </Box>
    </Box>
  );
};

export default CreditCard;
