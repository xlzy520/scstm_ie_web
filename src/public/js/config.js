//export const serveUrl = 'http://120.77.10.58:6060'
export const serveUrl = 'http://218.6.173.219:8083'

export const moblieDomain = 'http://m.scstm.com'

export function getAjax(url, params, resolveBack, rejectErr, _this) {
  _this.$http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem('token'),
    _this.$http.post(
      serveUrl + '/' + url,
      params
    )
      .then((res) => {
        if (res.status === 200) {
          resolveBack(res.data)
        }
      })
      .catch((err) => {
        rejectErr(err.response)
      })
}

//是否是使用手机
export function isMoblie() {
  return /Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent)
}
