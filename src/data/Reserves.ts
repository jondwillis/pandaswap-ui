import { TokenAmount, Pair, Currency, Token, ChainId, JSBI, Percent } from 'uniswap-bsc-sdk'
import { useMemo } from 'react'
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { Interface } from '@ethersproject/abi'
import { useActiveWeb3React } from '../hooks'

import { useMultipleContractSingleData, useSingleContractMultipleData } from '../state/multicall/hooks'
import { wrappedCurrency, wrappedPancakeCurrency } from '../utils/wrappedCurrency'
import { useMasterChefContract } from '../hooks/useContract'
import { FarmablePool } from '../constants/bao'
import { PNDA } from '../constants'

import {
  Pair as PancakePair,
  TokenAmount as PancakeTokenAmount,
  Currency as PancakeCurrency,
} from '@pancakeswap-libs/sdk-v2'

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI)

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export interface UserInfoFarmablePool extends FarmablePool {
  stakedAmount: TokenAmount
  pendingReward: TokenAmount
  userFeeStage: Percent
}

export interface PoolInfoFarmablePool extends FarmablePool {
  stakedAmount: TokenAmount
  totalSupply: TokenAmount
  accBaoPerShare: TokenAmount
  newRewardPerBlock: JSBI
  poolWeight: JSBI
}

export function usePairs(
  currencies: [Currency | undefined, Currency | undefined][],
  changedChainId: ChainId = ChainId.XDAI
): [PairState, Pair | null][] {
  const { chainId: activeChainId } = useActiveWeb3React()

  const chainId = useMemo(() => changedChainId ?? activeChainId, [changedChainId, activeChainId])

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ]),
    [chainId, currencies]
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
      }),
    [tokens]
  )

  const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves')

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]

      if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString())),
      ]
    })
  }, [results, tokens])
}

export function usePancakePairs(
  currencies: [PancakeCurrency | undefined, PancakeCurrency | undefined][]
): [PairState, PancakePair | null][] {
  const { chainId } = useActiveWeb3React()

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedPancakeCurrency(currencyA, chainId?.valueOf() ?? 56),
        wrappedPancakeCurrency(currencyB, chainId?.valueOf() ?? 56),
      ]),
    [chainId, currencies]
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB) ? PancakePair.getAddress(tokenA, tokenB) : undefined
      }),
    [tokens]
  )

  const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves')

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]

      if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new PancakePair(
          new PancakeTokenAmount(token0, reserve0.toString()),
          new PancakeTokenAmount(token1, reserve1.toString())
        ),
      ]
    })
  }, [results, tokens])
}

export function usePair(
  tokenA?: Currency,
  tokenB?: Currency,
  changedChainId: ChainId = ChainId.XDAI
): [PairState, Pair | null] {
  return usePairs([[tokenA, tokenB]], changedChainId)[0]
}

export function useRewardToken(): Token {
  return PNDA
}

export function useUserInfoFarmablePools(pairFarmablePools: FarmablePool[]): [UserInfoFarmablePool[], boolean] {
  const { account } = useActiveWeb3React()
  const masterChefContract = useMasterChefContract()

  const baoRewardToken = useRewardToken()
  const accountAddress = account || '0x0000000000000000000000000000000000000000'

  const poolIdsAndLpTokens = useMemo(() => {
    const matrix = pairFarmablePools.map((farmablePool) => {
      return [farmablePool.pid, accountAddress]
    })
    return matrix
  }, [pairFarmablePools, accountAddress])

  const results = useSingleContractMultipleData(masterChefContract, 'userInfo', poolIdsAndLpTokens)
  const pendingRewardResults = useSingleContractMultipleData(masterChefContract, 'pendingReward', poolIdsAndLpTokens)
  const anyLoading: boolean = useMemo(
    () => results.some((callState) => callState.loading) || pendingRewardResults.some((callState) => callState.loading),
    [results, pendingRewardResults]
  )

  const userInfoFarmablePool = useMemo(() => {
    return pairFarmablePools
      .map((farmablePool, i) => {
        const stakedAmountResult = results?.[i]?.result?.[0]
        const pendingReward = pendingRewardResults?.[i]?.result?.[0]
        const userDelta: number | undefined = results?.[i]?.result?.[5]
        const feeBookends = [
          0,
          0,
          1,
          1,
          1201,
          28800,
          28801,
          86400,
          86401,
          144000,
          144001,
          403200,
          403201,
          806400,
          806401,
        ]
        const fees = [new Percent('100', '1'), new Percent('100', '1')]
        const lastUserDeltaFeeBookendIndex = userDelta && feeBookends.findIndex((item) => (item < userDelta ? true : false))
        let userFeeStage: Percent = new Percent('100', '1')
        if (lastUserDeltaFeeBookendIndex) {
          const feeIndex = (lastUserDeltaFeeBookendIndex % feeBookends.length) / 2
          userFeeStage = fees[feeIndex]
        }
        const mergeObject =
          stakedAmountResult && pendingReward && userDelta
            ? {
                stakedAmount: new TokenAmount(farmablePool.token, stakedAmountResult),
                pendingReward: new TokenAmount(baoRewardToken, pendingReward),
                userFeeStage,
              }
            : {
                stakedAmount: new TokenAmount(farmablePool.token, '0'),
                pendingReward: new TokenAmount(baoRewardToken, '0'),
                userFeeStage,
              }

        return {
          ...farmablePool,
          stakedAmount: mergeObject.stakedAmount,
          pendingReward: mergeObject.pendingReward,
          userFeeStage: mergeObject.userFeeStage,
        }
      })
      .filter(({ stakedAmount }) => stakedAmount.greaterThan('0'))
  }, [pairFarmablePools, results, pendingRewardResults, baoRewardToken])

  return [userInfoFarmablePool, anyLoading]
}

export function usePoolInfoFarmablePools(
  pairFarmablePools: FarmablePool[],
  allNewRewardPerBlock: JSBI[]
): [PoolInfoFarmablePool[], boolean] {
  const masterChefContract = useMasterChefContract()

  const baoRewardToken = useRewardToken()

  const poolIds = useMemo(() => {
    return pairFarmablePools.map((farmablePool) => [farmablePool.pid])
  }, [pairFarmablePools])
  const pairAddresses = useMemo(() => {
    return pairFarmablePools.map((farmablePool) => farmablePool.address)
  }, [pairFarmablePools])

  const results = useSingleContractMultipleData(masterChefContract, 'poolInfo', poolIds)
  const pairResults = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'totalSupply')
  const stakedAmounts = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'balanceOf', [
    masterChefContract?.address,
  ])

  const anyLoading: boolean = useMemo(
    () => results.some((callState) => callState.loading) || pairResults.some((callState) => callState.loading),
    [results, pairResults]
  )

  const userInfoFarmablePool = useMemo(() => {
    return pairFarmablePools.map((farmablePool, i) => {
      const accBaoPerShare = results?.[i]?.result?.[3] // [1] is pool weight
      const totalSupply = pairResults?.[i]?.result?.[0]
      const stakedAmount = stakedAmounts?.[i]?.result?.[0]
      const poolWeight = results?.[i]?.result?.[1]
      const newRewardPerBlock = allNewRewardPerBlock[i]

      const mergeObject =
        accBaoPerShare && totalSupply && stakedAmount
          ? {
              totalSupply: new TokenAmount(farmablePool.token, totalSupply),
              stakedAmount: new TokenAmount(farmablePool.token, stakedAmount),
              accBaoPerShare: new TokenAmount(baoRewardToken, accBaoPerShare),
              newRewardPerBlock,
              poolWeight: JSBI.BigInt(poolWeight),
            }
          : {
              stakedAmount: new TokenAmount(farmablePool.token, '0'),
              totalSupply: new TokenAmount(farmablePool.token, '1'),
              accBaoPerShare: new TokenAmount(baoRewardToken, '0'),
              newRewardPerBlock,
              poolWeight: JSBI.BigInt(0),
            }

      return {
        ...farmablePool,
        ...mergeObject,
      }
    })
  }, [pairFarmablePools, results, pairResults, stakedAmounts, allNewRewardPerBlock, baoRewardToken])

  return [userInfoFarmablePool, anyLoading]
}
