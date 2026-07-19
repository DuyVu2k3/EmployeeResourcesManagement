import axiosClient from './axiosClient'

export const getDashboardStats    = () => axiosClient.get('/dashboard/stats')
export const getRecentActivities  = () => axiosClient.get('/dashboard/recent-activities')
export const getDepartmentSummary = () => axiosClient.get('/dashboard/departments')
