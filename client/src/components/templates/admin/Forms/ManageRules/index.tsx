import React, { useState, useEffect, SyntheticEvent } from "react";
import styled from "styled-components";
import { Box, Paper, Tab, useTheme, useMediaQuery } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { IRuleProps } from "./config";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import BankDetails from "./PaymentMethod";
import { Wrapper, Banks } from "./styles";
import Offers from "./Offers";
import ZipCode from "./ZipCode";
import Verticals from "./Verticals";

const TabsWrapper = styled(TabList)`
  button {
    font-size: 14px;
    font-family: Poppins;
  }
`;

const parseRulesObjectToArray = (rules: any) => {
  const newRules: any[] = [];
  Object.keys(rules).forEach((key) => {
    const newRule = { ...rules[key] };
    newRule.name = key;
    newRules.push(newRule);
  });

  return newRules;
};

const RulesDetails = () => {
  const [rules, setRules] = useState<IRuleProps[] | []>([]);
  const [loading, setLoading] = useState(false);

  /* new code */
  const [activeTab, setActiveTab] = useState("1");
  const [practiceId, setPracticeId] = useState<string | undefined>(undefined);
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("sm"));

  const onTabChange = (_event: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const updateRulesCb = (updatedRules: any) => {
    // UPDATE LIST ONCE IT IS RETURNED FROM THE HTTP REQUEST
    const rulesArray = parseRulesObjectToArray(updatedRules);
    setRules(rulesArray);
  };

  return (
    <Loader loading={loading}>
      <Box sx={{ mt: 6, mx: 4, mb: 4 }}>
        <Box sx={{ mt: 2 }}>
          <Paper sx={{ mt: 6 }}>
            <TabContext value={activeTab}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabsWrapper
                  onChange={onTabChange}
                  variant={isLargeScreen ? "standard" : "scrollable"}
                  scrollButtons
                  allowScrollButtonsMobile
                >
                  <Tab label="Zip code" value="1" />
                  <Tab label="Verticals" value="2" />
                  <Tab label="Offers" value="3" />
                  <Tab label="Bank Account Settings" value="4" />
                </TabsWrapper>
              </Box>
              {activeTab === "1" && (
                <TabPanel value="1">
                  <Wrapper>
                    <ZipCode />
                  </Wrapper>
                </TabPanel>
              )}
              {activeTab === "2" && (
                <TabPanel value="2">
                  <Wrapper>
                    <Verticals />
                  </Wrapper>
                </TabPanel>
              )}
              {activeTab === "3" && (
                <TabPanel value="3">
                  <Wrapper>
                    <Offers />
                  </Wrapper>
                </TabPanel>
              )}
              {activeTab === "4" && (
                <TabPanel value="4">
                  <Banks>
                    <BankDetails />
                  </Banks>
                </TabPanel>
              )}
            </TabContext>
          </Paper>
        </Box>
      </Box>
    </Loader>
  );
};

export default RulesDetails;
