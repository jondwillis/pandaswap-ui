import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { PortisConnector } from '@web3-react/portis-connector'

import { FortmaticConnector } from './Fortmatic'
import { NetworkConnector } from './NetworkConnector'
import { BscConnector } from '@binance-chain/bsc-connector'

const NETWORK_URL = process.env.REACT_APP_NETWORK_URL
const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID

export const NETWORK_CHAIN_ID: number = parseInt(process.env.REACT_APP_CHAIN_ID ?? '56')

if (typeof NETWORK_URL === 'undefined') {
  throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`)
}

export const network = new NetworkConnector({
  urls: { [NETWORK_CHAIN_ID]: NETWORK_URL }
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

export const injected = new InjectedConnector({
  supportedChainIds: [56]
})

export const bsc = new BscConnector({
  supportedChainIds: [56]
})

export const walletconnect = new WalletConnectConnector({
  rpc: { 56: 'https://bsc-dataseed.binance.org/' },
  bridge: 'https://bsc-dataseed.binance.org/',
  qrcode: true,
  pollingInterval: 5000
})

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: FORMATIC_KEY ?? '',
  chainId: 1
})

export const portis = new PortisConnector({
  dAppId: PORTIS_ID ?? '',
  networks: [100]
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: 'Pandaswap',
  appLogoUrl: 'https://i.imgur.com/QdfaOR1.png'
})
