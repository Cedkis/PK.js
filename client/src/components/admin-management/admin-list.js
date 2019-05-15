import React from 'react';
import { withRouter } from 'react-router-dom';
import { gql } from 'apollo-boost';
import { Query } from "react-apollo";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Media,
  NavLink, Row,
  Table
} from "reactstrap";

import AddAdmin from './add-admin';
import RemoveAdmin from './remove-admin';

const QUERY = gql`
  query AdminList($serverID: Int!){
    server(id: $serverID){
      adminPermissions {
        admin {
          steamID
          displayName
          avatar
        }
        player {
          guid
        }
      }
    }
  }
`;

class AdminList extends React.Component {
  constructor(){
    super();
    this.addAdminSteamIDInput = React.createRef();
    this.editAdminRedirect = this.editAdminRedirect.bind(this);
  }

  editAdminRedirect(steamID){
    this.props.history.push(
      this.props.match.path
        .replace(':serverID', this.props.serverID)
        .replace('/:steamID', '')
      + ((steamID) ? '/' + steamID : '')
    );
  }

  render(){
    return(
      <Card>
        <CardHeader className="border-0">
          <h3 className="mb-0">Admins</h3>
        </CardHeader>

        <Query
          query={QUERY}
          variables={{
            serverID: this.props.serverID
          }}
        >
          {({ loading, error, data }) => {
            if (loading) return (
              <CardBody>
                <div className="text-center mt-2 mb-3">
                  Loading...
                </div>
                <div className="btn-wrapper text-center">
                  <i className="fas fa-circle-notch fa-spin fa-4x" />
                </div>
              </CardBody>
            );

            if (error) return (
              <CardBody>
                <div className="text-center mt-2 mb-3">
                  Loading...
                </div>
                <div className="btn-wrapper text-center">
                  <i className="fas fa-circle-notch fa-spin fa-4x" />
                </div>
              </CardBody>
            );

            return (
              <>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                  <tr>
                    <th scope="col">Admin</th>
                    <th scope="col">GUID</th>
                    <th scope="col">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {
                    data.server.adminPermissions.map((adminPermission, key) => (
                      <tr key={key}>
                        <td>
                          <NavLink
                            href={"/admin/profile/" + adminPermission.admin.steamID}
                            target="_blank"
                          >
                            <Media className="align-items-center">
                              <span className="avatar avatar-sm rounded-circle">
                                <img
                                  alt="..."
                                  src={adminPermission.admin.avatar}
                                />
                              </span>
                              <Media className="ml-2">
                                <span className="mb-0 text-sm font-weight-bold">
                                  {adminPermission.admin.displayName}
                                </span>
                              </Media>
                            </Media>
                          </NavLink>
                        </td>
                        <td>{(adminPermission.player) ? adminPermission.player.guid : 'GUID not set.'}</td>
                        <td>
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => { this.editAdminRedirect(adminPermission.admin.steamID); }}
                          >
                            Edit Permission
                          </Button>
                          <RemoveAdmin
                            serverID={this.props.serverID}
                            steamID={adminPermission.admin.steamID}
                            refetchQueries={[{
                              QUERY,
                              variables: {
                                serverID: this.props.serverID
                              }
                            }]}
                            onCompleted={() => {
                              this.editAdminRedirect();
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  }
                  </tbody>
                </Table>
                <CardBody className="text-center">
                  <Row className="justify-content-center">
                    <Col lg="6">
                      <AddAdmin
                        serverID={this.props.serverID}
                        refetchQueries={[{
                          QUERY,
                          variables: {
                            serverID: this.props.serverID
                          }
                        }]}
                        onCompleted={(data) => {
                          this.editAdminRedirect(
                            data.addAdminPermission.admin.steamID
                          );
                        }}
                      />
                    </Col>
                  </Row>
                </CardBody>
              </>
            );
          }}
        </Query>
      </Card>
    );
  }
}

export default withRouter(AdminList);