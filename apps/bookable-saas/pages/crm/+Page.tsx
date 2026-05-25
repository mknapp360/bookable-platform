import { BrowserRouter } from 'react-router-dom'
import { createCrmApp } from '@bookable/crm-core'
import '@bookable/crm-core/dist/index.css'

const CrmApp = createCrmApp()

export default function CrmSpa() {
  return (
    <BrowserRouter>
      <CrmApp />
    </BrowserRouter>
  )
}
