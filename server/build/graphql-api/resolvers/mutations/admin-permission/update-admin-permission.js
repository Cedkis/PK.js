"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _models = require("../../../../models");

var _constants = require("shared/constants");

var _default = async (parent, args, context) => {
  if (context.user === null) throw new Error('You must be logged in to complete this action.');
  const currentAdmin = await _models.AdminPermission.findOne({
    server: args.serverID,
    admin: context.user
  });
  if (currentAdmin === null) throw new Error('You do not have permission to do that.');
  const selectedAdmin = await _models.AdminPermission.findOne({
    server: args.serverID,
    admin: args.steamID
  });
  if (selectedAdmin === null) throw new Error('Admin not found.'); // guid can be changed with no check

  if (currentAdmin.manageAdminGUIDs > 0) selectedAdmin.player = args.guid; // handle manageAssignPermissions first

  if ( // has a change been requested?
  args.manageAssignPermissions !== undefined && selectedAdmin.manageAssignPermissions !== args.manageAssignPermissions && // do they have permission to do the change?
  (0, _constants.assignPermissionCheck)(currentAdmin, selectedAdmin, 'manageAssignPermissions', args.manageAssignPermissions > 1) // apply change
  ) selectedAdmin.manageAssignPermissions = args.manageAssignPermissions;

  for (let permission of _constants.panelPermissions.concat(_constants.gamePermissions)) {
    // we handled this permission already, so skip
    if (permission.permission === 'manageAssignPermissions') continue;
    if ( // has a change been requested?
    args[permission.permission] !== undefined && selectedAdmin[permission.permission] !== args[permission.permission] && // do they have permission to do the change?
    (0, _constants.assignPermissionCheck)(currentAdmin, selectedAdmin, permission.permission, args[permission.permission] > 1) // apply change
    ) selectedAdmin[permission.permission] = args[permission.permission];
  } // if the manageAssignPermission was set to more than none, then apply
  // assign permissions for all other permissions


  if (selectedAdmin.manageAssignPermissions > 0) for (let permission of _constants.panelPermissions.concat(_constants.gamePermissions)) {
    if (permission.permission === 'manageAssignPermissions') continue;
    selectedAdmin[permission.permission] = 2;
  }
  await selectedAdmin.save();
  await new _models.AdminLog({
    server: selectedAdmin.server,
    admin: currentAdmin.admin,
    type: 'update_admin_permission',
    targetAdmin: selectedAdmin.admin
  }).save();
  return selectedAdmin;
};

exports.default = _default;