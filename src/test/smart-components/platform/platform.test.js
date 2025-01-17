import React from 'react';
import configureStore from 'redux-mock-store' ;
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { MemoryRouter } from 'react-router-dom';
import { notificationsMiddleware } from '@redhat-cloud-services/frontend-components-notifications/';
import { mount, shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import Platform from '../../../smart-components/platform/platform';
import { TOPOLOGICAL_INVENTORY_API_BASE, SOURCES_API_BASE } from '../../../utilities/constants';
import { platformInitialState } from '../../../redux/reducers/platform-reducer';
import PlatformItem from '../../../presentational-components/platform/platform-item';
import { mockBreacrumbsStore } from '../../redux/redux-helpers';

describe('<Platform />', () => {
  let initialProps;
  const middlewares = [ thunk, promiseMiddleware(), notificationsMiddleware() ];
  let mockStore;
  let intiailState;

  beforeEach(() => {
    initialProps = {
      match: {
        params: {
          id: 1
        }
      }
    };
    mockStore = configureStore(middlewares);
    intiailState = {
      platformReducer: {
        ...platformInitialState,
        selectedPlatform: {
          id: '1',
          name: 'Foo'
        },
        platformItems: {
          1: {
            meta: {
              limit: 50,
              offset: 0,
              count: 0
            }
          }
        }
      }
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<Platform store={ mockStore(intiailState) } { ...initialProps } />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it('should mount and fetch data after mount and after source change', (done) => {
    const Provider = mockBreacrumbsStore();
    expect.assertions(1);
    apiClientMock.get(`${SOURCES_API_BASE}/sources/1`, mockOnce({ body: { name: 'Foo' }}));
    apiClientMock.get(`${SOURCES_API_BASE}/sources/2`, mockOnce({ body: { name: 'Foo' }}));

    apiClientMock.get(`${TOPOLOGICAL_INVENTORY_API_BASE}/sources/1/service_offerings?filter%5Barchived_at%5D%5Bnil%5D=&limit=50&offset=0`, mockOnce({
      body: {
        data: [{ id: 111 }]}
    }));

    apiClientMock.get(`${TOPOLOGICAL_INVENTORY_API_BASE}/sources/2/service_offerings?filter%5Barchived_at%5D%5Bnil%5D=&limit=50&offset=0`,
      mockOnce((req, res) => {
        expect(req).toBeTruthy();
        done();
        return res.status(200).body({
          data: [{ id: 111 }]
        });
      }));
    const Root = props => <Provider><MemoryRouter><Platform { ...props } store={ mockStore(intiailState) } /></MemoryRouter></Provider>;
    const wrapper = mount(<Root { ...initialProps } />);
    wrapper.setProps({ match: { params: { id: 2 }}});
    wrapper.update();
  });

  /**
   * issues with promisses
   */
  it('should filter platform items correctly', (done) => {
    const stateWithItems = {
      platformReducer: {
        selectedPlatform: {
          id: '1',
          name: 'Foo'
        },
        platforms: [{
          id: '1',
          name: 'Foo'
        }],
        platformItems: {
          1: {
            data: [
              { id: '111', name: 'Platform item 1', description: 'description 1' },
              { id: '222', name: 'Platform item 2', description: 'description 1' }
            ],
            meta: {
              limit: 50,
              offset: 0,
              count: 2
            }
          }
        }
      }
    };
    const Provider = mockBreacrumbsStore(stateWithItems);

    apiClientMock.get(`${SOURCES_API_BASE}/sources/1`, mockOnce({ body: { name: 'Foo', id: '11' }}));
    apiClientMock.get(`${TOPOLOGICAL_INVENTORY_API_BASE}/sources/1/service_offerings?filter%5Barchived_at%5D%5Bnil%5D=&limit=50&offset=0`, mockOnce({
      body: {
        data: []
      }
    }));

    const Root = props => <Provider><MemoryRouter><Platform { ...props } /></MemoryRouter></Provider>;
    const wrapper = mount(<Root { ...initialProps } />);
    setImmediate(() => {
      expect(wrapper.find(PlatformItem)).toHaveLength(2);
      const search = wrapper.find('input').first();
      search.getDOMNode().value = 'item 1';
      search.simulate('change');
      wrapper.update();
      expect(wrapper.find(Platform).children().instance().state.filterValue).toEqual('item 1');
      expect(wrapper.find(PlatformItem)).toHaveLength(1);
      done();
    });
  });
});
