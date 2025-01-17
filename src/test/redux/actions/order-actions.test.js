import configureStore from 'redux-mock-store' ;
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { notificationsMiddleware, ADD_NOTIFICATION } from '@redhat-cloud-services/frontend-components-notifications/';
import { CATALOG_API_BASE } from '../../../utilities/constants';
import {
  fetchServicePlans,
  updateServiceData,
  setSelectedPlan,
  sendSubmitOrder
} from '../../../redux/actions/order-actions';
import {
  FETCH_SERVICE_PLANS,
  UPDATE_SERVICE_DATA,
  SET_SELECTED_PLAN,
  SUBMIT_SERVICE_ORDER
} from '../../../redux/action-types';

describe('Order actions', () => {
  const middlewares = [ thunk, promiseMiddleware(), notificationsMiddleware() ];
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore(middlewares);
  });

  it('should dispatch correct actions after fetching service plans', () => {
    const store = mockStore({});
    apiClientMock.get(`${CATALOG_API_BASE}/portfolio_items/1/service_plans`, mockOnce({
      body: [ 'Foo' ]
    }));
    const expectedActions = [{
      type: `${FETCH_SERVICE_PLANS}_PENDING`
    }, expect.objectContaining({
      type: `${FETCH_SERVICE_PLANS}_FULFILLED`
    }) ];

    return store.dispatch(fetchServicePlans(1)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should dispatch correct actions after fetching service plans fails', () => {
    const store = mockStore({});
    apiClientMock.get(`${CATALOG_API_BASE}/portfolio_items/1/service_plans`, mockOnce({
      status: 500
    }));
    const expectedActions = [{
      type: `${FETCH_SERVICE_PLANS}_PENDING`
    }, expect.objectContaining({
      type: ADD_NOTIFICATION,
      payload: expect.objectContaining({
        variant: 'danger'
      })
    }), expect.objectContaining({
      type: `${FETCH_SERVICE_PLANS}_REJECTED`
    }) ];

    return store.dispatch(fetchServicePlans(1)).catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should dispatch correct actions after calling update service data', () => {
    const store = mockStore({});
    const expectedActions = [{
      type: UPDATE_SERVICE_DATA,
      payload: { serviceData: { foo: 'bar' }}
    }];

    store.dispatch(updateServiceData({ foo: 'bar' }));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should dispatch correct actions after calling set selected plan', () => {
    const store = mockStore({});
    const expectedActions = [{
      type: SET_SELECTED_PLAN,
      payload: { foo: 'bar' }
    }];

    store.dispatch(setSelectedPlan({ foo: 'bar' }));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should dispatch correct actions after submitting order', () => {
    const store = mockStore({});
    apiClientMock.post(`${CATALOG_API_BASE}/orders`, mockOnce({
      body: { id: '123' }
    }));
    apiClientMock.post(`${CATALOG_API_BASE}/orders/123/order_items`, mockOnce((req, res) => {
      expect(JSON.parse(req.body())).toEqual({
        count: 1,
        provider_control_parameters: { namespace: 'default' },
        portfolio_item_id: 'Foo',
        service_plan_ref: 'Bar',
        service_parameters: { bax: 'quxx' }
      });
      return res.status(200);
    }));
    apiClientMock.post(`${CATALOG_API_BASE}/orders/123/submit_order`, mockOnce({
      body: { id: '123' }
    }));
    const expectedActions = [{
      type: `${SUBMIT_SERVICE_ORDER}_PENDING`
    }, expect.objectContaining({
      type: ADD_NOTIFICATION,
      payload: expect.objectContaining({
        variant: 'success',
        dismissable: true,
        title: 'Your order has been accepted successfully'
      })
    }),
    expect.objectContaining({
      type: `${SUBMIT_SERVICE_ORDER}_FULFILLED`
    }) ];

    return store.dispatch(sendSubmitOrder({
      portfolio_item_id: 'Foo',
      service_plan_ref: 'Bar',
      service_parameters: { bax: 'quxx', providerControlParameters: { namespace: 'default' }}
    })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should dispatch correct actions after submitting order fails to get new order', () => {
    const store = mockStore({});
    apiClientMock.post(`${CATALOG_API_BASE}/orders`, mockOnce({
      status: 500
    }));
    const expectedActions = [{
      type: `${SUBMIT_SERVICE_ORDER}_PENDING`
    }, expect.objectContaining({
      type: ADD_NOTIFICATION,
      payload: expect.objectContaining({
        variant: 'danger'
      })
    }), expect.objectContaining({
      type: `${SUBMIT_SERVICE_ORDER}_REJECTED`
    }) ];

    return store.dispatch(sendSubmitOrder({
      portfolio_item_id: 'Foo',
      service_plan_ref: 'Bar',
      service_parameters: 'Quxx'
    })).catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should dispatch correct actions after submitting order fails to add to new order', () => {
    const store = mockStore({});
    apiClientMock.post(`${CATALOG_API_BASE}/orders`, mockOnce({
      body: { id: 123 }
    }));

    apiClientMock.post(`${CATALOG_API_BASE}/orders/123/items`, mockOnce({
      status: 500
    }));

    const expectedActions = [{
      type: `${SUBMIT_SERVICE_ORDER}_PENDING`
    }, expect.objectContaining({
      type: ADD_NOTIFICATION,
      payload: expect.objectContaining({
        variant: 'danger'
      })
    }), expect.objectContaining({
      type: `${SUBMIT_SERVICE_ORDER}_REJECTED`
    }) ];

    return store.dispatch(sendSubmitOrder({})).catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should dispatch correct actions after submitting order fails to submit order', () => {
    const store = mockStore({});
    apiClientMock.post(`${CATALOG_API_BASE}/orders`, mockOnce({
      body: { id: 123 }
    }));

    apiClientMock.post(`${CATALOG_API_BASE}/orders/123/items`, mockOnce({
      status: 200
    }));
    apiClientMock.post(`${CATALOG_API_BASE}/orders/123`, mockOnce({
      status: 500
    }));

    const expectedActions = [{
      type: `${SUBMIT_SERVICE_ORDER}_PENDING`
    }, expect.objectContaining({
      type: ADD_NOTIFICATION,
      payload: expect.objectContaining({
        variant: 'danger'
      })
    }), expect.objectContaining({
      type: `${SUBMIT_SERVICE_ORDER}_REJECTED`
    }) ];

    return store.dispatch(sendSubmitOrder({})).catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
