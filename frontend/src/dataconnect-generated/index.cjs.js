const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'frontend',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createClientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateClient', inputVars);
}
createClientRef.operationName = 'CreateClient';
exports.createClientRef = createClientRef;

exports.createClient = function createClient(dcOrVars, vars) {
  return executeMutation(createClientRef(dcOrVars, vars));
};

const getMenuItemRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMenuItem');
}
getMenuItemRef.operationName = 'GetMenuItem';
exports.getMenuItemRef = getMenuItemRef;

exports.getMenuItem = function getMenuItem(dc) {
  return executeQuery(getMenuItemRef(dc));
};

const updateOrderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateOrder', inputVars);
}
updateOrderRef.operationName = 'UpdateOrder';
exports.updateOrderRef = updateOrderRef;

exports.updateOrder = function updateOrder(dcOrVars, vars) {
  return executeMutation(updateOrderRef(dcOrVars, vars));
};

const listMenusRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMenus');
}
listMenusRef.operationName = 'ListMenus';
exports.listMenusRef = listMenusRef;

exports.listMenus = function listMenus(dc) {
  return executeQuery(listMenusRef(dc));
};
