import axiosClient from './axiosClient'; // Thay bằng instance axios của bạn nếu tên khác

/**
 * 1. Lấy toàn bộ danh sách Role kèm quyền hạn hiện tại từ DB
 * API BE: GET /api/permissions
 */
export const getAllRolesWithPermissions = async () => {
  const res = await axiosClient.get('/permissions');
  // Tự động kiểm tra: Nếu res có .data thì lấy .data, nếu không thì lấy chính res
  return res.data !== undefined ? res.data : res;
};

/**
 * 2. Lưu cập nhật quyền hạn cho 1 Role cụ thể
 * API BE: PUT /api/permissions/{roleId}
 */
export const updateRolePermissions = async (roleId, payload) => {
  const res = await axiosClient.put(`/permissions/${roleId}`, payload);
  return res.data !== undefined ? res.data : res;
};