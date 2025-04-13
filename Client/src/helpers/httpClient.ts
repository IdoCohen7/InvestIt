import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://localhost:7204/api',
})

function HttpClient() {
  return {
    get: instance.get,
    post: instance.post,
    patch: instance.patch,
    put: instance.put,
    delete: instance.delete,
  }
}

export default HttpClient()
