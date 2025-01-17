import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, TextContent, Text, TextVariants } from '@patternfly/react-core';
import { rawComponents } from '@data-driven-forms/pf4-component-mapper';

const createOptions = (options, inputValue, isRequired) => {
  if (inputValue && isRequired) {
    return options;
  }

  let selectOptions = [ ...options ];
  return selectOptions.find(({ value }) => value === undefined)
    ? [ ...selectOptions ]
    : [{ label: isRequired ? 'Please choose' : 'None' }, ...selectOptions ];
};

const Select = ({
  input,
  options,
  isReadOnly,
  isDisabled,
  FieldProvider,
  isRequired,
  formOptions: { change },
  multi,
  ...rest
}) => (
  <rawComponents.Select
    hideSelectedOptions={ false }
    { ...input }
    { ...rest }
    onChange={ (value, ...args) => {
      if (rest.onChange) {
        rest.onChange(value);
        change(input.name, value);
      } else {
        input.onChange(value, ...args);
      }
    } }
    isMulti={ multi }
    options={ createOptions(options, input.value, isRequired) }
    isDisabled={ isDisabled || isReadOnly }
    closeMenuOnSelect={ !multi }
  />
);

Select.propTypes = {
  input: PropTypes.object.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any,
    label: PropTypes.string.isRequired
  })),
  isReadOnly: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isRequired: PropTypes.bool,
  isSearchable: PropTypes.bool,
  FieldProvider: PropTypes.any,
  formOptions: PropTypes.shape({
    change: PropTypes.func
  }),
  multi: PropTypes.bool
};

Select.defaultProps = {
  formOptions: {},
  isSearchable: false,
  multi: false,
  options: []
};

const Pf4SelectWrapper = ({
  componentType,
  label,
  isRequired,
  helperText,
  meta,
  description,
  hideLabel,
  formOptions,
  dataType,
  initialKey,
  id,
  initialValue,
  ...rest
}) => {
  const { error, touched } = meta;
  const showError = touched && error;
  const { name } = rest.input;

  return (
    <FormGroup
      isRequired={ isRequired }
      label={ !hideLabel && label }
      fieldId={ id || name }
      isValid={ !showError }
      helperText={ helperText }
      helperTextInvalid={ meta.error }
    >
      { description && <TextContent><Text component={ TextVariants.small }>{ description }</Text></TextContent> }
      <Select formOptions={ formOptions } id={ id || name } label={ label } isValid={ !showError } isRequired={ isRequired } { ...rest }/>
    </FormGroup>
  );
};

Pf4SelectWrapper.propTypes = {
  componentType: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  isRequired: PropTypes.bool,
  helperText: PropTypes.string,
  meta: PropTypes.object,
  description: PropTypes.string,
  hideLabel: PropTypes.bool,
  formOptions: PropTypes.object,
  dataType: PropTypes.string,
  initialKey: PropTypes.any,
  initialValue: PropTypes.any
};

export default Pf4SelectWrapper;
