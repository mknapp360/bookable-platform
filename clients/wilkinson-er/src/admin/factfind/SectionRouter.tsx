import type { FactFindRecord } from '../../hooks/useFactFind'

import { ClientDetails }      from './sections/ClientDetails'
import { PersonalDetails }    from './sections/PersonalDetails'
import { Medical }            from './sections/Medical'
import { OccupationIncome }   from './sections/OccupationIncome'
import { PostRetirement }     from './sections/PostRetirement'
import { Benefits }           from './sections/Benefits'
import { Mortgages }          from './sections/Mortgages'
import { UnsecuredDebts }     from './sections/UnsecuredDebts'
import { Expenditure }        from './sections/Expenditure'
import { SavingsInvestments } from './sections/SavingsInvestments'
import { Protection }         from './sections/Protection'
import { Objectives }         from './sections/Objectives'
import { PropertyDetails }    from './sections/PropertyDetails'
import { Vulnerability }      from './sections/Vulnerability'
import { MarketingPrefs }     from './sections/MarketingPrefs'
import { EquityRelease1 }     from './sections/EquityRelease1'
import { EquityRelease2 }     from './sections/EquityRelease2'
import { EquityRelease3 }     from './sections/EquityRelease3'
import { IdRequirements }     from './sections/IdRequirements'
import { AdminDetails }       from './sections/AdminDetails'
import { ErcChecklist }       from './sections/ErcChecklist'

type Props = {
  activeSection: string
  data: Record<string, unknown>
  onChange: (d: Record<string, unknown>) => void
  factFind: FactFindRecord | null
}

export function SectionRouter({ activeSection, data, onChange, factFind }: Props) {
  const mortgagesData       = (factFind?.mortgages        as Record<string, unknown>) ?? {}
  const unsecuredDebtsData  = (factFind?.unsecured_debts  as Record<string, unknown>) ?? {}
  const personalDetailsData = (factFind?.personal_details as Record<string, unknown>) ?? {}
  const clientDetailsData   = (factFind?.client_details   as Record<string, unknown>) ?? {}

  switch (activeSection) {
    case 'client_details':      return <ClientDetails data={data} onChange={onChange} />
    case 'personal_details':    return <PersonalDetails data={data} onChange={onChange} />
    case 'medical':             return <Medical data={data} onChange={onChange} />
    case 'occupation_income':   return <OccupationIncome data={data} onChange={onChange} />
    case 'post_retirement':     return <PostRetirement data={data} onChange={onChange} />
    case 'benefits':            return <Benefits data={data} onChange={onChange} />
    case 'mortgages':           return <Mortgages data={data} onChange={onChange} />
    case 'unsecured_debts':     return <UnsecuredDebts data={data} onChange={onChange} />
    case 'expenditure':         return <Expenditure data={data} onChange={onChange} mortgagesData={mortgagesData} unsecuredDebtsData={unsecuredDebtsData} />
    case 'savings_investments': return <SavingsInvestments data={data} onChange={onChange} />
    case 'protection':          return <Protection data={data} onChange={onChange} />
    case 'objectives':          return <Objectives data={data} onChange={onChange} />
    case 'property_details':    return <PropertyDetails data={data} onChange={onChange} />
    case 'vulnerability':       return <Vulnerability data={data} onChange={onChange} personalDetailsData={personalDetailsData} />
    case 'marketing_prefs':     return <MarketingPrefs data={data} onChange={onChange} />
    case 'equity_release_1':    return <EquityRelease1 data={data} onChange={onChange} />
    case 'equity_release_2':    return <EquityRelease2 data={data} onChange={onChange} />
    case 'equity_release_3':    return <EquityRelease3 data={data} onChange={onChange} />
    case 'id_requirements':     return <IdRequirements data={data} onChange={onChange} />
    case 'admin_details':       return <AdminDetails data={data} onChange={onChange} />
    case 'erc_checklist':       return <ErcChecklist data={data} onChange={onChange} clientDetailsData={clientDetailsData} />
    default:
      return (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
          Section not yet implemented: {activeSection}
        </div>
      )
  }
}
