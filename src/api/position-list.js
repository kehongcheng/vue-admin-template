import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/get/positionlist',
    method: 'get',
    params
  })
}

export function addList(params) {
  return request({
    url: '/add/positionlist',
    method: 'post',
    params
  })
}

export function delList(params) {
  return request({
    url: '/del/positionlist',
    method: 'post',
    params
  })
}

export function editList(params) {
  return request({
    url: '/edit/positionlist',
    method: 'post',
    params
  })
}