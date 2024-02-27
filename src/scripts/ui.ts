import { createDiscreteApi } from 'naive-ui'

export const { message, notification } = createDiscreteApi(['message', 'notification'], {
  messageProviderProps: {
    placement: 'top-right'
  },
  notificationProviderProps: {
    keepAliveOnHover: true
  }
})
