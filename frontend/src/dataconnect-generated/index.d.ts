import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Client_Key {
  id: UUIDString;
  __typename?: 'Client_Key';
}

export interface CreateClientData {
  client_insert: Client_Key;
}

export interface CreateClientVariables {
  name: string;
  email: string;
  createdAt: TimestampString;
}

export interface GetMenuItemData {
  menuItems: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    price: number;
    category?: string | null;
  } & MenuItem_Key)[];
}

export interface ListMenusData {
  menus: ({
    id: UUIDString;
    name: string;
    description?: string | null;
  } & Menu_Key)[];
}

export interface MenuItem_Key {
  id: UUIDString;
  __typename?: 'MenuItem_Key';
}

export interface MenuMenuItem_Key {
  menuId: UUIDString;
  menuItemId: UUIDString;
  __typename?: 'MenuMenuItem_Key';
}

export interface Menu_Key {
  id: UUIDString;
  __typename?: 'Menu_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface UpdateOrderData {
  order_update?: Order_Key | null;
}

export interface UpdateOrderVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateClientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateClientVariables): MutationRef<CreateClientData, CreateClientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateClientVariables): MutationRef<CreateClientData, CreateClientVariables>;
  operationName: string;
}
export const createClientRef: CreateClientRef;

export function createClient(vars: CreateClientVariables): MutationPromise<CreateClientData, CreateClientVariables>;
export function createClient(dc: DataConnect, vars: CreateClientVariables): MutationPromise<CreateClientData, CreateClientVariables>;

interface GetMenuItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMenuItemData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMenuItemData, undefined>;
  operationName: string;
}
export const getMenuItemRef: GetMenuItemRef;

export function getMenuItem(): QueryPromise<GetMenuItemData, undefined>;
export function getMenuItem(dc: DataConnect): QueryPromise<GetMenuItemData, undefined>;

interface UpdateOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateOrderVariables): MutationRef<UpdateOrderData, UpdateOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateOrderVariables): MutationRef<UpdateOrderData, UpdateOrderVariables>;
  operationName: string;
}
export const updateOrderRef: UpdateOrderRef;

export function updateOrder(vars: UpdateOrderVariables): MutationPromise<UpdateOrderData, UpdateOrderVariables>;
export function updateOrder(dc: DataConnect, vars: UpdateOrderVariables): MutationPromise<UpdateOrderData, UpdateOrderVariables>;

interface ListMenusRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMenusData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMenusData, undefined>;
  operationName: string;
}
export const listMenusRef: ListMenusRef;

export function listMenus(): QueryPromise<ListMenusData, undefined>;
export function listMenus(dc: DataConnect): QueryPromise<ListMenusData, undefined>;

