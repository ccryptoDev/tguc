import { useHistory } from "react-router-dom";

const PageNotFound = () => {
  const history = useHistory();
  return history.goBack();
};

export default PageNotFound;
