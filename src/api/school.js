import request from '@/utils/request'

export function querySchool(query) {
  return request({
    url: '/getInfo',
    method: 'get',
    params: query
  })
}

export function getSchool(id) {
  return request({
    url: '/sch/getSchool',
    method: 'get',
    params: { id }
  })
}

export function editSchool(data) {
  return request({
    url: '/sch/editSchool',
    method: 'post',
    data
  })
}

