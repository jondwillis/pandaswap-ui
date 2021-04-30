import { ChainId, Currency, CurrencyAmount, ETHER, Token, TokenAmount, WETH } from 'uniswap-bsc-sdk'
import {
  ETHER as PancakeETHER,
  WETH as PancakeWETH,
  Token as PancakeToken,
  ChainId as PancakeChainId,
  Currency as PancakeCurrency,
} from '@pancakeswap-libs/sdk-v2'

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency === ETHER ? WETH[chainId] : currency instanceof Token ? currency : undefined
}

export function wrappedPancakeCurrency(
  currency: PancakeCurrency | undefined,
  chainId: PancakeChainId | undefined
): PancakeToken | undefined {
  return chainId && currency === PancakeETHER
    ? PancakeWETH[chainId]
    : currency instanceof PancakeToken
    ? currency
    : undefined
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount | undefined,
  chainId: ChainId | undefined
): TokenAmount | undefined {
  const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.currency, chainId) : undefined
  return token && currencyAmount ? new TokenAmount(token, currencyAmount.raw) : undefined
}

export function unwrappedToken(token: Token): Currency {
  if (token.equals(WETH[token.chainId])) return ETHER
  return token
}
