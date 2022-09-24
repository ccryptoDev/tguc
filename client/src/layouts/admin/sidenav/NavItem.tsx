import React from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";

type Props = {
  item: {
    route: string;
    icon?: any;
    title: string;
  };
  active: string;
};

const NavItem: React.FC<Props> = ({
  item: { route, icon: Icon, title },
  active,
}) => {
  const isActive = active === route;
  return (
    <li key={route} className={`listItem ${isActive ? "active" : ""}`}>
      <Button>
        <Link to={route}>
          <Icon sx={{ fontSize: 24 }} />
          <span>{title}</span>
        </Link>
      </Button>
    </li>
  );
};

export default NavItem;
