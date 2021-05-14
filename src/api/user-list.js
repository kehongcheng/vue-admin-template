import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/get/userlist',
    method: 'get',
    params
  })
}

export function addList(params) {
  return request({
    url: '/add/userlist',
    method: 'post',
    params
  })
}

export function delList(params) {
  return request({
    url: '/del/userlist',
    method: 'post',
    params
  })
}

