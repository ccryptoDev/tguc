import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styled from "styled-components";
import { getUser } from "../../../../api/admin-dashboard/index";
import { formatDate, formatCurrency } from "../../../../utils/formats";
import Loader from "../../../molecules/Loaders/LoaderWrapper";
import { AdminTableWrapper } from "../../../atoms/Table/Table-paginated";
import { routes } from "../../../../routes/Admin/routes.config";
import { H4 as Heading } from "../../../atoms/Typography";
import Table from "../../../atoms/Table/Details-horizontal";
import Card from "../../../atoms/Cards/Large";

const Styles = styled.div`
  .heading {
    text-align: center;
    margin-top: 2rem;
  }
`;

const TableWrapper = styled(AdminTableWrapper)`
  border-radius: 6px;
  overflow: hidden;
  table tr {
    & td {
      padding: 1.4rem;
      &:first-child {
        width: 300px;
      }
    }
  }
`;

// PERSONAL INFO TABLE
const renderTable = (user: any) => [
  { title: "User Reference", value: user?.userReference || "--" },
  { title: "Name", value: `${user?.firstName} ${user?.lastName}` },
  { title: "Email", value: user?.email || "--" },
  { title: "Phone", value: user?.phone || "--" },
  { title: "Street", value: user?.street || "--" },
  { title: "State", value: user?.state || "--" },
  { title: "Zip Code", value: user?.zipCode || "--" },
  { title: "Social Security Number", value: user?.ssnNumber || "--" },
  { title: "Registration Date", value: formatDate(user?.registeredDate) },
  { title: "Last Update", value: formatDate(user?.lastProfileUpdateTime) },
  { title: "Monthly Income", value: formatCurrency(user?.monthlyIncome) },
  { title: "Annual Income", value: formatCurrency(user?.annualIncome) },
  {
    title: "Anticipated Amount",
    value: formatCurrency(user?.anticipatedFinancedAmount),
  },
];

const Details = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params: any = useParams();

  const fetchUser = async (id: string) => {
    const result = await getUser(id);
    if (result && !result.error) {
      setUser(result.data);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (params?.id) {
      fetchUser(params.id);
    }
  }, [params?.id]);

  return (
    <Styles>
      <Loader loading={loading}>
        {user ? (
          <Card>
            <TableWrapper>
              <Table>
                <tbody>
                  {renderTable(user).map(({ title, value }) => {
                    return (
                      <tr key={title}>
                        <td>
                          <b>{title}</b>
                        </td>
                        <td>{value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>
          </Card>
        ) : (
          ""
        )}
        {user && !user?.paymentManagements?.length && !loading ? (
          <Heading className="heading">This user has no loans yet</Heading>
        ) : (
          ""
        )}
        {user && user?.paymentManagements?.length ? (
          <Card>
            <TableWrapper>
              <table>
                <thead>
                  <tr>
                    <th>Loan Reference</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {user.paymentManagements.map((pm: any) => {
                    return (
                      <tr key={pm.screenTracking}>
                        <td>
                          <Link
                            to={`${routes.LOAN_DETAILS}/${pm.screenTracking}`}
                          >
                            {pm.loanReference}
                          </Link>
                        </td>
                        <td>{pm.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrapper>
          </Card>
        ) : (
          ""
        )}
      </Loader>
    </Styles>
  );
};

export default Details;
