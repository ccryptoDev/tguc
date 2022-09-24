/*eslint-disable*/
import React, { useCallback, useState, useEffect } from "react";
import { getLinkToken, loginToPlain } from "../../../../../../../api/application";
import {
  usePlaidLink,
  PlaidLinkOnSuccess,
  PlaidLinkOnEvent,
  PlaidLinkOnExit,
  PlaidLinkOptions,
} from "react-plaid-link";
import Button from "../../../../../../atoms/Buttons/Button";

const PlaidLink = ({ cb }: any) => {
  const [token, setToken] = useState<string | null>(null);

  // get a link_token from your API when component mounts
  useEffect(() => {
    const createLinkToken = async () => {
      const response: any = await getLinkToken();
      if (response) {
        const { link_token } = response;
        setToken(link_token);
      }
    };
    createLinkToken();
  }, []);

  const onSuccess = useCallback<PlaidLinkOnSuccess>((publicToken, metadata) => {
    // send public_token to your server
    loginToPlain(publicToken).then((res) => {
      console.log(res);
    });
    // https://plaid.com/docs/api/tokens/#token-exchange-flow
    cb();
    console.log(publicToken, metadata);
  }, []);
  const onEvent = useCallback<PlaidLinkOnEvent>((eventName, metadata) => {
    // log onEvent callbacks from Link
    // https://plaid.com/docs/link/web/#onevent
    console.log(eventName, metadata);
  }, []);

  const onExit = useCallback<PlaidLinkOnExit>((error, metadata) => {
    console.log(error, metadata);
  }, []);

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
    onEvent,
    onExit,
  };

  const { open, ready, error, exit } = usePlaidLink(config);

  return (
    <Button
      type="button"
      variant="contained"
      onClick={() => open()}
      disabled={!ready}
    >
      Connect a bank account
    </Button>
  );
};

export default PlaidLink;
