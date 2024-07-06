// table.js

import request from '@/utils/request.js';

// 表格列表查询
export const tableListService = () => {
  return request.get('/table');
}

// 上传表格
export const uploadTableService = (formData) => {
  return request.post('/table/upload', formData);
}

// 删除表格
export const deleteTableService = (tabId) => {
  return request.delete(`/table/delete?tabId=${tabId}`);
}

// 获取表格详情
export const getTableDetailsService = (tabId) => {
  return request.get(`/table/${tabId}`);
}

// 更新表格
export const updateTableService = (tabId, formData) => {
  return request.post(`/table/update/${tabId}`, formData);
}
