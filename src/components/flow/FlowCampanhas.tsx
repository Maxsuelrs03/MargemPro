import { useMargemPro } from '../../state/AppContext'
import { CampaignStudioInner } from '../campaign/CampaignStudio'

export function FlowCampanhas() {
  const { state, actions } = useMargemPro()
  return <CampaignStudioInner flowMode={true} />
}
