import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { rawComponents } from '@data-driven-forms/pf4-component-mapper';
import Pf4SelectWrapper from '../../../presentational-components/shared/pf4-select-wrapper';

describe('<Pf4SelectWrapper />', () => {
  let initialProps;
  beforeEach(() => {
    initialProps = {
      id: 'bazz',
      input: {
        name: 'bazz',
        value: '',
        onChange: jest.fn()
      },
      meta: {},
      options: [{
        label: 'Foo',
        value: 'bar'
      }],
      formOptions: {
        change: jest.fn()
      },
      FieldProvider: () => <div />
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<Pf4SelectWrapper { ...initialProps } />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should create empty option', () => {
    const wrapper = mount(<Pf4SelectWrapper { ...initialProps } />);
    const options = wrapper.find(rawComponents.Select).props().options;
    expect(options).toHaveLength(2);
  });

  it('should create empty option for required field', () => {
    const wrapper = mount(<Pf4SelectWrapper isRequired { ...initialProps } />);
    const options = wrapper.find(rawComponents.Select).props().options;
    expect(options).toHaveLength(2);
    expect(options[0].label).toEqual('Please choose');
  });

  it('should not create empty option', () => {
    const wrapper = mount(<Pf4SelectWrapper { ...initialProps } options={ [{ label: 'Foo', value: 'bar' }, { label: 'Empty value' }] } />);
    const options = wrapper.find(rawComponents.Select).props().options;
    expect(options).toHaveLength(2);
  });

  it('should not create empty option if select has value and is required', () => {
    const wrapper = mount(
      <Pf4SelectWrapper
        isRequired { ...initialProps }
        input={ { ...initialProps.input, value: 'some value' } }
        options={ [{ label: 'Foo', value: 'bar' }] }
      />);
    const options = wrapper.find(rawComponents.Select).props().options;
    expect(options).toHaveLength(1);
  });

  it('should render correctly in error state', () => {
    const wrapper = shallow(<Pf4SelectWrapper { ...initialProps } meta={ { error: 'Error', touched: true } } />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly with description', () => {
    const wrapper = shallow(<Pf4SelectWrapper { ...initialProps } description="description" />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
