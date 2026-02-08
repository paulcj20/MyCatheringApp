import { CreateClientData, CreateClientVariables, GetMenuItemData, UpdateOrderData, UpdateOrderVariables, ListMenusData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateClient(options?: useDataConnectMutationOptions<CreateClientData, FirebaseError, CreateClientVariables>): UseDataConnectMutationResult<CreateClientData, CreateClientVariables>;
export function useCreateClient(dc: DataConnect, options?: useDataConnectMutationOptions<CreateClientData, FirebaseError, CreateClientVariables>): UseDataConnectMutationResult<CreateClientData, CreateClientVariables>;

export function useGetMenuItem(options?: useDataConnectQueryOptions<GetMenuItemData>): UseDataConnectQueryResult<GetMenuItemData, undefined>;
export function useGetMenuItem(dc: DataConnect, options?: useDataConnectQueryOptions<GetMenuItemData>): UseDataConnectQueryResult<GetMenuItemData, undefined>;

export function useUpdateOrder(options?: useDataConnectMutationOptions<UpdateOrderData, FirebaseError, UpdateOrderVariables>): UseDataConnectMutationResult<UpdateOrderData, UpdateOrderVariables>;
export function useUpdateOrder(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateOrderData, FirebaseError, UpdateOrderVariables>): UseDataConnectMutationResult<UpdateOrderData, UpdateOrderVariables>;

export function useListMenus(options?: useDataConnectQueryOptions<ListMenusData>): UseDataConnectQueryResult<ListMenusData, undefined>;
export function useListMenus(dc: DataConnect, options?: useDataConnectQueryOptions<ListMenusData>): UseDataConnectQueryResult<ListMenusData, undefined>;
