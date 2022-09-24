/* eslint-disable */
export const initKukun = () => {
  const kukunIframe = document.getElementById("kukun_estimator");

  const kukunApi = {
    _allowedOrigins: [
      "https://qasservices-tguc.mykukun.com",  
      "https://qas-services-tguc.mykukun.com",
      "https://estimator-services-tguc.mykukun.com"
    ],
    _isListening: false,
    _getObj: null,
    _startListening() {
      if (kukunApi._isListening) return;
      kukunApi._isListening = true;

      const fetchKukun = (event) => {
        // If any of the allowedOrigins connect to us

        if (kukunApi._allowedOrigins.some((o) => event.origin.match(o))) {
          if (event.data.type === "START") {
            kukunApi._origin = event.origin;
            kukunApi._source = event.source;
            // Reply with confirmation
            kukunApi._sendPostMessage(kukunIframe);
            kukunApi._sendQueuedMessages();
          } else if (event.data.type === "ESTIMATION") {
            kukunApi._getObj = event.data.payload;
            return kukunApi._getObj;
          }
        } else {
          // The data was not sent from an allowedOrigin.
          return;
        }
      };

      window.addEventListener("message", fetchKukun);
    },
    _destination: null, // frame that we're talking with
    _origin: null, // origin of our iframe that we're talking with
    _sendPostMessage(destination) {
      kukunApi._destination = destination;
      kukunApi._destination.contentWindow.postMessage(
        { type: "CONFIRM_START" },
        destination.src
      );
    },

    _toSend: [], // queue of messages to send when we connect to the parent
    _send(obj) {
      // Keep a list of all the things to send in case we don't have a connection yet.
      kukunApi._toSend.push(obj);

      if (!kukunApi._isListening) {
        throw new Error(
          "Must call kukunApi._startListening() when the page loads and before we send anything."
        );
      }

      kukunApi._sendQueuedMessages();
    },
    _sendQueuedMessages() {
      if (kukunApi._destination && kukunApi._origin) {
        // Send all queued messages
        while (kukunApi._toSend.length > 0) {
          kukunApi._destination.contentWindow.postMessage(
            kukunApi._toSend[0],
            kukunApi._origin
          );
          kukunApi._toSend.shift(); // remove the object we sent
        }
      }
    },

    // ----------------------- Methods to Send info ----------------------- //
    // All data sent follows the { type: string, payload: any } format.

    // Ideally, this information gets sent as soon as it is known. It's
    //   okay to send any piece of info multiple times in case of changes.

    // e.g. kukunApi.sendError("Could not find Estimator data");;

    sendError(errorString) {
      kukunApi._send({
        type: "ERROR",
        payload: errorString,
      });
    },
  };

  kukunApi._startListening();
};
