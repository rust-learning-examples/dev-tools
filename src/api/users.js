import { apiAxios } from '@/api'
export const getUsers = (params) => apiAxios.get('/users', { params })
