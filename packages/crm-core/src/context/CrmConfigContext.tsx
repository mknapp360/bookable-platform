import { createContext, useContext } from 'react'
import type { ReactNode, ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'

export type ExtraNavItem = {
  to: string
  icon: LucideIcon
  label: string
}

export type ExtraRoute = {
  path: string
  element: ReactNode
}

/**
 * Render prop injected into the Case Detail sidebar, below the Contact card.
 * Receives the case ID and (optionally) the contact ID so the client app
 * can render app-specific links — e.g. a Fact Find shortcut.
 */
export type CaseDetailSidebarFn = (caseId: string, contactId?: string) => ReactNode

export type CrmConfig = {
  extraNavItems: ExtraNavItem[]
  extraRoutes: ExtraRoute[]
  /** Optional extra card(s) rendered below the Contact card on Case Detail */
  caseDetailSidebar?: CaseDetailSidebarFn
}

const CrmConfigContext = createContext<CrmConfig>({
  extraNavItems: [],
  extraRoutes: [],
})

export function CrmConfigProvider({
  config,
  children,
}: {
  config: Partial<CrmConfig>
  children: ReactNode
}) {
  return (
    <CrmConfigContext.Provider
      value={{
        extraNavItems:     config.extraNavItems     ?? [],
        extraRoutes:       config.extraRoutes       ?? [],
        caseDetailSidebar: config.caseDetailSidebar,
      }}
    >
      {children}
    </CrmConfigContext.Provider>
  )
}

export function useCrmConfig(): CrmConfig {
  return useContext(CrmConfigContext)
}

// Re-export for convenience so client apps don't need to import ComponentType themselves
export type { ComponentType }
