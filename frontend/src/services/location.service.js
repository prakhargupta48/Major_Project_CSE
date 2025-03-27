import api from './api';

const getAll = () => {
  return api.get('/locations');
};

const get = (id) => {
  return api.get(`/locations/${id}`);
};

const create = (data) => {
  return api.post('/locations', data);
};

const update = (id, data) => {
  return api.put(`/locations/${id}`, data);
};

const remove = (id) => {
  return api.delete(`/locations/${id}`);
};

const LocationService = {
  getAll,
  get,
  create,
  update,
  remove
};

export default LocationService;