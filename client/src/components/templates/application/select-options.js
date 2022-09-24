import { sort } from "./utils";

export const incomeTypeOptions = [
  {
    id: "disability",
    value: "disability",
    text: "Disability Income",
  },
  {
    id: "ssn",
    value: "ssn",
    text: "Social Security",
  },
  {
    id: "employed",
    value: "employed",
    text: "Employed",
  },
  {
    id: "unemployed",
    value: "unemployed",
    text: "Unemployed",
  },
  {
    id: "pension",
    value: "pension",
    text: "Pension",
  },
  {
    id: "others",
    value: "others",
    text: "Others (Child Support, Welfare, etc)",
  },
];

export const states = sort(
  [
    { id: "0", value: "", text: "" },
    { id: "1", value: "KY", text: "Kentucky" },
    { id: "2", value: "FL", text: "Florida" },
    { id: "3", value: "CA", text: "California" },
    { id: "4", value: "TX", text: "Texas" },
    { id: "5", value: "AL", text: "Alabama" },
    { id: "7", value: "AZ", text: "Arizona" },
    { id: "8", value: "AR", text: "Arkansas" },
    { id: "9", value: "CO", text: "Colorado" },
    { id: "10", value: "CT", text: "Connecticut" },
    { id: "11", value: "DE", text: "Delaware" },
    { id: "12", value: "DC", text: "District of Columbia" },
    { id: "13", value: "ME", text: "Maine" },
    { id: "14", value: "MT", text: "Montana" },
    { id: "15", value: "NE", text: "Nebraska" },
    { id: "16", value: "NV", text: "Nevada" },
    { id: "17", value: "NH", text: "New Hampshire" },
    { id: "18", value: "NJ", text: "New Jersey" },
    { id: "19", value: "NM", text: "New Mexico" },
    { id: "20", value: "NY", text: "New York" },
    { id: "21", value: "NC", text: "North Carolina" },
    { id: "22", value: "ND", text: "North Dakota" },
    { id: "23", value: "OH", text: "Ohio" },
    { id: "24", value: "OK", text: "Oklahoma" },
    { id: "25", value: "OR", text: "Oregon" },
    { id: "26", value: "MD", text: "Maryland" },
    { id: "27", value: "MA", text: "Massachusetts" },
    { id: "28", value: "MI", text: "Michigan" },
    { id: "29", value: "MS", text: "Mississippi" },
    { id: "30", value: "MN", text: "Minnesota" },
    { id: "31", value: "MO", text: "Missouri" },
    { id: "32", value: "PA", text: "Pennsylvania" },
    { id: "33", value: "RI", text: "Rhode Island" },
    { id: "34", value: "SC", text: "South Carolina" },
    { id: "35", value: "SD", text: "South Dakota" },
    { id: "36", value: "TN", text: "Tennessee" },
    { id: "37", value: "UT", text: "Utah" },
    { id: "38", value: "VT", text: "Vermont" },
    { id: "39", value: "VA", text: "Virginia" },
    { id: "40", value: "WA", text: "Washington" },
    { id: "41", value: "WV", text: "West Verginia" },
    { id: "42", value: "WI", text: "Wisconsin" },
    { id: "43", value: "WY", text: "Wyoming" },
    { id: "45", value: "IN", text: "Indiana" },
    { id: "46", value: "IA", text: "Iowa" },
    { id: "47", value: "KS", text: "Kansas" },
    { id: "48", value: "LA", text: "Louisiana" },
    { id: "49", value: "ID", text: "Idaho" },
    { id: "50", value: "IL", text: "Illinois" },
    { id: "51", value: "GA", text: "Georgia" },
  ],
  "text"
);

export const payonholidaysOptions = [
  {
    id: "before",
    value: "before",
    text: "Before",
  },
  {
    id: "after",
    value: "after",
    text: "Aafter",
  },
];

export const employerStatusOptions = [
  {
    id: "full-time",
    value: "full-time",
    text: "Full Time",
  },
  {
    id: "part-time",
    value: "part-time",
    text: "Part-Time",
  },
];

export const paymentFrequencyOptions = [
  {
    id: "bi-weekly",
    value: "bi-weekly",
    text: "Bi-Weekly",
  },
  {
    id: "semi-monthly",
    value: "semi-monthly",
    text: "Semi-Monthly",
  },
  {
    id: "weekly",
    value: "weekly",
    text: "Weekly",
  },
  {
    id: "monthly",
    value: "monthly",
    text: "Monthly",
  },
];
