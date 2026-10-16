import { useState } from 'react'
import { Layout, type Page } from './components/Layout'
import { Calculator } from './components/Calculator'
import { OffersBank } from './components/OffersBank'
import { OfferPresentation } from './components/OfferPresentation'
import { AppProvider } from './state/AppContext'
import { Products } from './components/Products'
import { FlowShell } from './components/flow/FlowShell'
import { CampaignStudio } from './components/campaign/CampaignStudio'

export default function App() {
  const [page, setPage] = useState<Page>('calculadora')

  return (
    <AppProvider>
      <Layout currentPage={page} onNavigate={setPage}>
        {page === 'calculadora' && <Calculator />}
        {page === 'ofertas' && <OffersBank />}
        {page === 'apresentacao' && <OfferPresentation />}
        {page === 'fluxo' && <FlowShell />}
        {page === 'produtos' && <Products />}
        {page === 'campanhas' && <CampaignStudio />}
      </Layout>
    </AppProvider>
  )
}
