import AppProvidersWrapper from './components/wrappers/AppProvidersWrapper'
import AppRouter from './routes/router'
import '@/assets/scss/style.scss'

function App() {
  return (
    <AppProvidersWrapper>
      <AppRouter />
    </AppProvidersWrapper>
  )
}

export default App
