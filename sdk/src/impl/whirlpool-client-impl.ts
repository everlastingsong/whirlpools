import { AddressUtil } from "@orca-so/common-sdk";
import { Address } from "@project-serum/anchor";
import { WhirlpoolContext } from "../context";
import { AccountFetcher } from "../network/public";
import { WhirlpoolData, TokenInfo } from "../types/public";
import { WhirlpoolClient, Whirlpool, Position } from "../whirlpool-client";
import { PositionImpl } from "./position-impl";
import { WhirlpoolImpl } from "./whirlpool-impl";

export class WhirlpoolClientImpl implements WhirlpoolClient {
  constructor(readonly ctx: WhirlpoolContext, readonly fetcher: AccountFetcher) {}

  public async getPool(poolAddress: Address): Promise<Whirlpool> {
    const account = await this.fetcher.getPool(poolAddress, true);
    if (!account) {
      throw new Error(`Unable to fetch Whirlpool at address at ${poolAddress}`);
    }
    const tokenInfos = await getTokenInfos(this.fetcher, account);
    return new WhirlpoolImpl(
      this.ctx,
      this.fetcher,
      AddressUtil.toPubKey(poolAddress),
      tokenInfos[0],
      tokenInfos[1],
      account
    );
  }

  public async getPosition(positionAddress: Address): Promise<Position> {
    const account = await this.fetcher.getPosition(positionAddress, true);
    if (!account) {
      throw new Error(`Unable to fetch Position at address at ${positionAddress}`);
    }
    return new PositionImpl(this.ctx, this.fetcher, AddressUtil.toPubKey(positionAddress), account);
  }
}

async function getTokenInfos(fetcher: AccountFetcher, data: WhirlpoolData): Promise<TokenInfo[]> {
  const mintA = data.tokenMintA;
  const infoA = await fetcher.getMintInfo(mintA);
  if (!infoA) {
    throw new Error(`Unable to fetch MintInfo for mint - ${mintA}`);
  }
  const mintB = data.tokenMintB;
  const infoB = await fetcher.getMintInfo(mintB);
  if (!infoB) {
    throw new Error(`Unable to fetch MintInfo for mint - ${mintB}`);
  }
  return [
    { mint: mintA, ...infoA },
    { mint: mintB, ...infoB },
  ];
}
