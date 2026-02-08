import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'frontend',
  location: 'us-east4'
};

export const createClientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateClient', inputVars);
}
createClientRef.operationName = 'CreateClient';

export function createClient(dcOrVars, vars) {
  return executeMutation(createClientRef(dcOrVars, vars));
}

export const getMenuItemRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMenuItem');
}
getMenuItemRef.operationName = 'GetMenuItem';

export function getMenuItem(dc) {
  return executeQuery(getMenuItemRef(dc));
}

export const updateOrderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateOrder', inputVars);
}
updateOrderRef.operationName = 'UpdateOrder';

export function updateOrder(dcOrVars, vars) {
  return executeMutation(updateOrderRef(dcOrVars, vars));
}

export const listMenusRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMenus');
}
listMenusRef.operationName = 'ListMenus';

export function listMenus(dc) {
  return executeQuery(listMenusRef(dc));
}

