import api from './api';

const getAll = async () => {
  try {
    const response = await api.get('/locations');
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

const get = async (id) => {
  const response = await api.get(`/locations/${id}`);
  return response.data;
};

const create = async (data) => {
  const response = await api.post('/locations', data);
  return response.data;
};

const update = async (id, data) => {
  const response = await api.put(`/locations/${id}`, data);
  return response.data;
};

const remove = async (id) => {
  const response = await api.delete(`/locations/${id}`);
  return response.data;
};

const LocationService = {
  getAll,
  get,
  create,
  update,
  remove
};

export default LocationService;