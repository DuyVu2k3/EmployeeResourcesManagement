import axiosClient from './axiosClient'

export const getBranches = async () => await axiosClient.get('/branches')
