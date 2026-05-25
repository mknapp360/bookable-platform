// Public API for @bookable/crm-core
// Client apps import from here — only add things that are safe to share.

export { createCrmApp } from './App'
export { CrmConfigProvider, useCrmConfig } from './context/CrmConfigContext'
export type { CrmConfig, ExtraNavItem, ExtraRoute } from './context/CrmConfigContext'
