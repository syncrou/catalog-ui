import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import asyncFormValidator from '../utilities/async-form-validator';

const editPortfolioItemSchema = (loadWorkflows) => ({
  fields: [{
    component: componentTypes.TEXT_FIELD,
    name: 'name',
    label: 'Name',
    isRequired: true,
    validate: [{ type: validatorTypes.REQUIRED }]
  }, {
    component: componentTypes.TEXT_FIELD,
    name: 'description',
    label: 'Description'
  }, {
    component: componentTypes.TEXT_FIELD,
    name: 'long_description',
    label: 'Long description'
  }, {
    component: componentTypes.TEXT_FIELD,
    name: 'distributor',
    label: 'Vendor'
  }, {
    component: componentTypes.TEXT_FIELD,
    name: 'documentation_url',
    label: 'Documentation URL',
    validate: [{
      type: validatorTypes.URL
    }]
  }, {
    component: componentTypes.TEXT_FIELD,
    name: 'support_url',
    label: 'Support URL',
    validate: [{
      type: validatorTypes.URL
    }]
  }, {
    component: componentTypes.SELECT,
    name: 'workflow_ref',
    label: 'Approval workflow',
    loadOptions: asyncFormValidator(loadWorkflows),
    isSearchable: true,
    isClearable: true
  }]
});

export default editPortfolioItemSchema;
