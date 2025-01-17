/* eslint camelcase: 0 */
import { getAxiosInstance, getPortfolioItemApi, getOrderApi, getRequestsApi, getOrderItemApi } from '../shared/user-login';
import { CATALOG_API_BASE } from '../../utilities/constants';
import { defaultSettings } from '../shared/pagination';

const orderApi = getOrderApi();
const orderItemApi = getOrderItemApi();
const portfolioItemApi = getPortfolioItemApi();
const requestsApi = getRequestsApi();
const axiosInstance = getAxiosInstance();

export function getServicePlans(portfolioItemId) {
  return portfolioItemApi.listServicePlans(portfolioItemId);
}

export async function sendSubmitOrder({ service_parameters: { providerControlParameters, ...service_parameters }, ...parameters }) {
  let order = await orderApi.createOrder();
  let orderItem = {};
  orderItem.count = 1;
  orderItem = {
    ...orderItem,
    ...parameters,
    service_parameters,
    provider_control_parameters: providerControlParameters || {}
  };
  await orderApi.addToOrder(order.id, orderItem);
  return orderApi.submitOrder(order.id);
}

export function listRequests() {
  return requestsApi.listRequests().then(data => ({
    ...data,
    data: data.data.map(({ decision, ...item }) => ({
      ...item,
      state: decision
    })) }));
}

export function cancelOrder(orderId) {
  return orderApi.cancelOrder(orderId);
}

const OPEN_ORDER_STATES = [ 'Ordered', 'Approval Pending' ];
const CLOSED_ORDER_STATES = [ 'Completed', 'Failed', 'Denied', 'Canceled' ];

const getOrderItems = orderIds =>
  axiosInstance.get(`${CATALOG_API_BASE}/order_items?${orderIds.map(orderId => `filter[order_id][]=${orderId}`).join('&')}`);

const getOrderPortfolioItems = itemIds =>
  axiosInstance.get(`${CATALOG_API_BASE}/portfolio_items?${itemIds.map(itemId => `filter[id][]=${itemId}`).join('&')}`);

const getOrders = (states, pagination = defaultSettings) =>
  axiosInstance.get(`${CATALOG_API_BASE}/orders?limit=${pagination.limit}&offset=${pagination.offset}&${states.map(state => `filter[state][]=${state}`).join('&')}`) // eslint-disable-line max-len
  .then(orders =>
    getOrderItems(orders.data.map(({ id }) => id))
    .then(orderItems =>
      getOrderPortfolioItems(orderItems.data.map(({ portfolio_item_id }) => portfolio_item_id))
      .then((portfolioItems) => {
        return ({
          portfolioItems,
          ...orders,
          data: orders.data.map(order => ({
            ...order,
            orderItems: orderItems.data.filter(({ order_id }) => order_id === order.id)
          }))
        });
      })
    )
  );

export function getOpenOrders(_apiProps, pagination) {
  return getOrders(OPEN_ORDER_STATES, pagination);
}

export function getClosedOrders(_apiProps, pagination) {
  return getOrders(CLOSED_ORDER_STATES, pagination);
}

export function getOrderApprovalRequests(orderItemId) {
  return orderItemApi.listApprovalRequests(orderItemId);
}
