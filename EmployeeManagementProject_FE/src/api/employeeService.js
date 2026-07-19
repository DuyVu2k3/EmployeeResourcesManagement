import axiosClient from './axiosClient'

export const getAllEmployees = (branchId) =>
  axiosClient.get('/employees', { params: branchId ? { branchId } : {} })

export const getEmployeeById = (id) => axiosClient.get(`/employees/${id}`)
export const createEmployee = (formData) =>
  axiosClient.post('/employees', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateEmployee = ({ id, formData }) =>
  axiosClient.put(`/employees/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteEmployee = (id) => axiosClient.delete(`/employees/${id}`)
export const exportTerminationContract = (id) =>
  axiosClient.get(`/employees/${id}/export-termination-contract`, { responseType: 'blob' })
export const exportPracticeCertificate = (id) =>
  axiosClient.get(`/employees/${id}/export-practice-certificate`, { responseType: 'blob' })
export const exportAssignmentDecision = (id) =>
  axiosClient.get(`/employees/${id}/export-assignment-decision`, { responseType: 'blob' })
export const exportTechnicalLeadAssignment = (id) =>
  axiosClient.get(`/employees/${id}/export-technical-lead-assignment`, { responseType: 'blob' })
export const exportClinicalTaskAssignment = (id) =>
  axiosClient.get(`/employees/${id}/export-clinical-task-assignment`, { responseType: 'blob' })
