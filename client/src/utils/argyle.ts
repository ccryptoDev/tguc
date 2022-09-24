/* eslint no-underscore-dangle:0 */
import { saveArgyleDataApi } from "../api/application";

// step 4
export const connectArgyle = ({
  sId,
  cb,
  noEmployerHandler,
}: {
  sId: string;
  cb?: any;
  noEmployerHandler?: any;
}) => {
  if ((global as any).Argyle) {
    const argyle = (global as any).Argyle.create({
      apiHost: "https://api-sandbox.argyle.io/v1",
      pluginKey: "a4785ff9-5e16-4c54-aa5c-45894d5e17c6",
      companyName: "TGUC",
      showCloseButton: true,
      searchScreenTitle:
        "We need to verify your income by linking your employer's payroll software",
      searchScreenSubtitle: "",
      closeOnOutsideClick: false,
      cantFindLinkItemTitle: "cant find your emploeyer?",
      onAccountConnected: cb,
      onCantFindLinkItemClicked: () => noEmployerHandler(argyle.close),
      onAccountCreated: async (accCreateData: any) => {
        const body = {
          ...accCreateData,
          sId,
        };
        saveArgyleDataApi(body);
      },
    });
    argyle.open();
  }
};

// step 7
export const argylePayrollSplit = (
  config?: any,
  cb?: any,
  userId?: string,
  employerName?: string
) => {
  if ((global as any).Argyle) {
    const argyle = (global as any).Argyle.create({
      apiHost: "https://api-sandbox.argyle.io/v1",
      pluginKey: "a4785ff9-5e16-4c54-aa5c-45894d5e17c6",
      companyName: "TGUC",
      userToken: config.userToken,
      introSearchPlaceholder: "Update Pay Allocation",
      searchScreenTitle: "Update Pay Allocation",
      searchScreenSubtitle: "Update Pay Allocation",
      showCategories: false,
      payDistributionItemsOnly: true,
      payDistributionUpdateFlow: true,
      payDistributionConfig: config.payDistConf,
      showCloseButton: false,
      closeOnOutsideClick: true,
      linkItems: [employerName],
      onClose: () => {
        if (cb) {
          cb({ userId });
        }
      },
    });
    argyle.open();
  }
};

export const argyleScript = () => {
  const script = document.createElement("script");
  script.src = "https://plugin.argyle.io/argyle.web.v3.js";
  script.async = true;
  document.body.appendChild(script);
};
