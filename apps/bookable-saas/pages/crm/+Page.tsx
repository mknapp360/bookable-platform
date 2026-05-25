import { BrowserRouter } from 'react-router-dom'
import { createCrmApp } from '@bookable/crm-core'

const CrmApp = createCrmApp()

export default function CrmSpa() {
  return (
    <BrowserRouter>
      <CrmApp />
    </BrowserRouter>
  )
}
