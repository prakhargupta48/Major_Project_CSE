import api from './api';

const getAll = () => {
  return api.get('/optimization');
};

const get = (id) => {
  return api.get(`/optimization/${id}`);
};

const create = (data) => {
  return api.post('/optimization', data);
};

const remove = (id) => {
  return api.delete(`/optimization/${id}`);
};

const OptimizationService = {
  getAll,
  get,
  create,
  remove
};

export default OptimizationService;