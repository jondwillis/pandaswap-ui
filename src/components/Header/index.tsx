import { ChainId } from 'uniswap-bsc-sdk'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { Text } from 'rebass'

import styled from 'styled-components'

import { useActiveWeb3React } from '../../hooks'

import { useETHBalances } from '../../state/wallet/hooks'

import { YellowCard } from '../Card'
import Settings from '../Settings'
import Menu from '../Menu'

import { RowBetween } from '../Row'
import Web3Status from '../Web3Status'
import Logo from '../../assets/images/pnda-logo.png'
import '../../assets/fonts.css'

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
  top: 0;
  position: absolute;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 12px 0 0 0;
    width: calc(100%);
    position: relative;
  `};
  padding-bottom: 1rem;
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 0.5rem;
`};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  color: ${({ theme }) => theme.text6};
  :hover {
    cursor: pointer;
  }
  text-decoration: none;
`

const TitleText = styled.div`
  width: fit-content;
  white-space: nowrap;
  color: 
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
  font-family: "Kaushan Script", sans-serif;
  font-weight: 500;
  font-size: 32px;
  letter-spacing: 0.03rem;
  margin-top: -1rem;
  margin-left: 1rem;
`
const TitleSubText = styled.div`
  width: fit-content;
  white-space: nowrap;
  color: 
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
  font-family: "Reem Kufi", sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: .5rem;
  letter-spacing: 0.03rem;
`


const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  border-radius: 6px;
  white-space: nowrap;
  width: 100%;

  :focus {
    border: 1px solid blue;
  }
`

const TestnetWrapper = styled.div`
  white-space: nowrap;
  width: fit-content;
  margin-left: 10px;
  pointer-events: auto;
`

const NetworkCard = styled(YellowCard)`
  width: fit-content;
  margin-right: 10px;
  padding: 8px 12px;
  border: none;
  background-color: transparent;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  border-radius: 0.5rem;
  color: ${({ theme }) => theme.text6};
`

const PandaIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    img { 
      width: 0rem;
    }
  `};
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-end;
  `};
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const NETWORK_LABELS: { [chainId in ChainId]: string | null } = {
  [ChainId.MAINNET]: null,
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GÖRLI]: 'Görli',
  [ChainId.KOVAN]: 'Kovan',
  [ChainId.XDAI]: 'BSC'
}

export default function Header() {
  const { account, chainId } = useActiveWeb3React()

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

  return (
    <HeaderFrame>
      <RowBetween style={{ alignItems: 'flex-start' }} padding="1rem 1rem 0 1rem">
        <HeaderElement>
          <Title href=".">
            <PandaIcon>
              <img src={Logo} alt="logo" height="50px" width="59px" />
            </PandaIcon>
            <TitleText>
              PandaSwap
            <TitleSubText>
              by Bao.Finance
            </TitleSubText>
            </TitleText>
          </Title>
        </HeaderElement>
        <HeaderControls>
          <HeaderElement>
            <TestnetWrapper>
              {!isMobile && chainId && NETWORK_LABELS[chainId] && <NetworkCard>{NETWORK_LABELS[chainId]}</NetworkCard>}
            </TestnetWrapper>
            <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
              {account && userEthBalance ? (
                <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                  {userEthBalance?.toSignificant(4)} {chainId === 56 ? 'BNB' : 'ETH'}
                </BalanceText>
              ) : null}
              <Web3Status />
            </AccountElement>
          </HeaderElement>
          <HeaderElementWrap>
            {/* <VersionSwitch />*/}
            <Settings />
            <Menu />
          </HeaderElementWrap>
        </HeaderControls>
      </RowBetween>
    </HeaderFrame>
  )
}
