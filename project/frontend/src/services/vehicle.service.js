import api from './api';

const getAll = () => {
  return api.get('/vehicles');
};

const get = (id) => {
  return api.get(`/vehicles/${id}`);
};

const create = (data) => {
  return api.post('/vehicles', data);
};

const update = (id, data) => {
  return api.put(`/vehicles/${id}`, data);
};

const remove = (id) => {
  return api.delete(`/vehicles/${id}`);
};

const VehicleService = {
  getAll,
  get,
  create,
  update,
  remove
};

export default VehicleService;