import Select from "../../../../../molecules/Form/Fields/Select/Default/index";
import CheckBox from "../../../../../molecules/Form/Fields/Checkbox/Default";

import {
  optionsAPlus,
  optionsA,
  optionsB,
  optionsC,
  optionsD,
  optionsE,
} from "./options";

export const offersInit = (offers) => {
  return {
    optionsAPlus: {
      value: offers?.optionsAPlus?.value || optionsAPlus[0].value,
    },
    optionsA: {
      value: offers?.optionsA?.value || optionsA[0].value,
    },
    optionsB: {
      value: offers?.optionsB?.value || optionsB[0].value,
    },
    optionsC: {
      value: offers?.optionsC?.value || optionsC[0].value,
    },
    optionsD: {
      value: offers?.optionsD?.value || optionsD[0].value,
    },
    optionsE: {
      value: offers?.optionsE?.value || optionsE[0].value,
    },
  };
};

export const renderOfferOptions = (form) => [
  {
    value: form.optionsAPlus.value,
    name: "optionsAPlus",
    component: Select,
    label: "Select Tier A+ Offers",
    options: optionsAPlus,
  },
  {
    value: form.optionsA.value,
    name: "optionsA",
    component: Select,
    label: "Select Tier A Offers",
    options: optionsA,
  },
  {
    value: form.optionsB.value,
    name: "optionsB",
    component: Select,
    label: "Select Tier B Offers",
    options: optionsB,
  },
  {
    value: form.optionsC.value,
    name: "optionsC",
    component: Select,
    label: "Select Tier C Offers",
    options: optionsC,
  },
  {
    value: form.optionsD.value,
    name: "optionsD",
    component: Select,
    label: "Select Tier D Offers",
    options: optionsD,
  },
  {
    value: form.optionsE.value,
    name: "optionsE",
    component: Select,
    label: "Select Tier E Offers",
    options: optionsE,
  },
];

export const minimumInterestFormInit = (form) => {
  return {
    terms6: { value: form?.terms6?.value || false },
    terms12: { value: form?.terms12?.value || false },
    terms18: { value: form?.terms18?.value || false },
    terms24: { value: form?.terms24?.value || false },
  };
};

export const renderMinimumInterestFields = (form) => [
  {
    value: form.terms6.value,
    name: "terms6",
    component: CheckBox,
    label: "Term- 6 months \n Dealer Discount- 3.75%",
  },
  {
    value: form.terms12.value,
    name: "terms12",
    component: CheckBox,
    label: "Term- 12 months \n 3 Dealer Discount- 4.75%",
  },
  {
    value: form.terms18.value,
    name: "terms18",
    component: CheckBox,
    label: "Term- 18 months \n Dealer Discount- 6.75%",
  },
  {
    value: form.terms24.value,
    name: "terms24",
    component: CheckBox,
    label: "Term- 24 months \n Dealer Discount- 10.00%",
  },
];

export const zeroInterestFormInit = (form) => {
  return {
    terms6: { value: form?.terms6?.value || false },
    terms12: { value: form?.terms12?.value || false },
    terms18: { value: form?.terms18?.value || false },
    terms24: { value: form?.terms24?.value || false },
  };
};

export const renderZeroInterestFields = (form) => [
  {
    value: form.terms6.value,
    name: "terms6",
    component: CheckBox,
    label: "Term- 6 months \n Dealer Discount- 4.00%",
  },
  {
    value: form.terms12.value,
    name: "terms12",
    component: CheckBox,
    label: "Term- 12 months \n Dealer Discount- 8.00%",
  },
  {
    value: form.terms18.value,
    name: "terms18",
    component: CheckBox,
    label: "Term- 18 months \n Dealer Discount- 12.00%",
  },
  {
    value: form.terms24.value,
    name: "terms24",
    component: CheckBox,
    label: "Term- 24 months \n Dealer Discount- 16.00%",
  },
];
