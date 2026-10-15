import { useState } from 'react'
import { Layout, type Page } from './components/Layout'
import { Calculator } from './components/Calculator'
import { OffersBank } from './components/OffersBank'
import { OfferPresentation } from './components/OfferPresentation'

export default function App() {
  const [page, setPage] = useState<Page>('calculadora')

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {page === 'calculadora' && <Calculator />}
      {page === 'ofertas' && <OffersBank />}
      {page === 'apresentacao' && <OfferPresentation />}
    </Layout>
  )
}
