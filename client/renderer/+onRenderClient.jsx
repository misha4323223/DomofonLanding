export { onRenderClient }

import { hydrateRoot } from 'react-dom/client'
import { Router } from 'wouter'
import '../src/index.css'

async function onRenderClient(pageContext) {
  const { Page } = pageContext
  
  const root = document.getElementById('root')
  
  hydrateRoot(
    root,
    <Router>
      <Page />
    </Router>
  )
}
