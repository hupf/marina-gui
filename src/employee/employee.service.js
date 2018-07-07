import { url, handleResponse, makeRequestOptions } from '../common/service.helper';

export const employeeService = {
  getEmployee,
  getCurrentEmployee,
  makeCurrentEmployee,
  getEmployees,
};

function getEmployee(email) {
  return fetch(url(`/employees/email?email=${encodeURIComponent(email)}`), makeRequestOptions('GET'))
    .then(handleResponse);
}

function getCurrentEmployee() {
  return fetch(url('/employees/user'), makeRequestOptions('GET'))
    .then(handleResponse);
}

function makeCurrentEmployee() {
  return fetch(url('/employees/user'), makeRequestOptions('POST'))
    .then(handleResponse);
}

function getEmployees() {
  return fetch(url('/employees'), makeRequestOptions('GET'))
    .then(handleResponse);
}
