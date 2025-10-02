import api from './api';

const getAll = async () => {
  try {
    const response = await api.get('/vehicles');
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

const get = async (id) => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

const create = async (data) => {
  const response = await api.post('/vehicles', data);
  return response.data;
};

const update = async (id, data) => {
  const response = await api.put(`/vehicles/${id}`, data);
  return response.data;
};

const remove = async (id) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};

const VehicleService = {
  getAll,
  get,
  create,
  update,
  remove
};

export default VehicleService;