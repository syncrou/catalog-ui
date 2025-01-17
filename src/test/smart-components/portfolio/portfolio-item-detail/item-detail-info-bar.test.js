import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import ItemDetailInfoBar from '../../../../smart-components/portfolio/portfolio-item-detail/item-detail-info-bar';

describe('<ItemDetailInfoBar />', () => {
  let initialProps;
  beforeEach(() => {
    initialProps = {
      product: {
        distributor: 'foo',
        updated_at: 'Fri Mar 22 2019 08:36:57 GMT+0100 (Central European Standard Time)',
        created_at: 'Fri Mar 22 2019 08:36:57 GMT+0100 (Central European Standard Time)'
      },
      source: {
        name: 'bar'
      },
      portfolio: {
        display_name: 'baz',
        name: 'quux'
      }
    };
  });

  it('should render correctly', () => {
    const wrapper = mount(<ItemDetailInfoBar { ...initialProps } />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly with fallback values withouth vendor', () => {
    initialProps = {
      product: {
        created_at: 'Fri Mar 22 2019 08:36:57 GMT+0100 (Central European Standard Time)'
      },
      source: {
        name: 'bar'
      },
      portfolio: {
        name: 'quux'
      }
    };
    const wrapper = mount(<ItemDetailInfoBar { ...initialProps } />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly with vendor', () => {
    const wrapper = mount(<ItemDetailInfoBar { ...initialProps } distributor="Foo distributor" />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
