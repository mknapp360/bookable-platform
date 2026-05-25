import type { RouteSync } from 'vike/types'

const crmPaths = ['/dashboard', '/contacts', '/cases', '/pipeline', '/enquiries', '/tasks', '/calendar', '/documents', '/settings', '/login', '/signup', '/forgot-password', '/reset-password', '/auth']

export const route: RouteSync = (pageContext) => {
  const url = pageContext.urlPathname
  return crmPaths.some(p => url === p || url.startsWith(p + '/'))
}
