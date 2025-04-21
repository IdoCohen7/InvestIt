const stage = 'prod'

const config = {
  dev: {
    apiUrl: 'https://localhost:7204/api',
    socketUrl: 'wss://localhost:7204/ws',
    uploadUrl: 'https://localhost:7204/uploadedFiles',
  },
  prod: {
    apiUrl: 'https://proj.ruppin.ac.il/cgroup75/prod/api',
    socketUrl: 'wss://proj.ruppin.ac.il/cgroup75/prod/ws',
    uploadUrl: 'https://proj.ruppin.ac.il/cgroup75/prod/uploadedFiles',
  },
}

export const API_URL = config[stage].apiUrl
export const SOCKET_URL = config[stage].socketUrl
export const UPLOAD_URL = config[stage].uploadUrl
