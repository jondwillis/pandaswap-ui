import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import 'inter-ui'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ChainId } from 'uniswap-bsc-sdk'
import { NetworkContextName } from './constants'
import './i18n'
import App from './pages/App'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'
import getLibrary from './utils/getLibrary'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if ('ethereum' in window) {
	;(window.ethereum as any).autoRefreshOnNetworkChange = false
}

function Updaters() {
	const activeAppUpdater = ApplicationUpdater()
	const activeTxnUpdater = TransactionUpdater()
	return (
		<>
			<ListsUpdater />
			<UserUpdater />
			{activeAppUpdater}
			{activeTxnUpdater}
			<MulticallUpdater chainId={ChainId.XDAI} />
		</>
	)
}

ReactDOM.render(
	<StrictMode>
		<FixedGlobalStyle />
		<Web3ReactProvider getLibrary={getLibrary}>
			<Web3ProviderNetwork getLibrary={getLibrary}>
				<Provider store={store}>
					<Updaters />
					<ThemeProvider>
						<ThemedGlobalStyle />
						<App />
					</ThemeProvider>
				</Provider>
			</Web3ProviderNetwork>
		</Web3ReactProvider>
	</StrictMode>,
	document.getElementById('root')
)
