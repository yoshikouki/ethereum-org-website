// Libraries
import React, { useEffect, useState } from "react"
import { graphql } from "gatsby"
import { getImage, GatsbyImage } from "gatsby-plugin-image"
import Select from "react-select"
import styled from "styled-components"
import { useIntl } from "gatsby-plugin-intl"

// Data
import cexSupport from "../data/layer-2/cex-layer-2-support.json"
import layer2Data from "../data/layer-2/layer-2.json"
import validiumData from "../data/validium.json"

// Components
import ButtonLink from "../components/ButtonLink"
import Card from "../components/Card"
import Emoji from "../components/Emoji"
import ExpandableCard from "../components/ExpandableCard"
import InfoBanner from "../components/InfoBanner"
import Link from "../components/Link"
import PageHero from "../components/PageHero"
import PageMetadata from "../components/PageMetadata"
import Pill from "../components/Pill"
import ProductCard from "../components/ProductCard"
import ProductList from "../components/ProductList"
import { CardGrid, Content, Page } from "../components/SharedStyledComponents"

// Utils
import { translateMessageId } from "../utils/translations"

// Styles
const GappedPage = styled(Page)`
  gap: 4rem;
  @media (max-width: ${({ theme }) => theme.breakpoints.l}) {
    gap: 3rem;
  }
  * {
    scroll-margin-top: 5.5rem;
  }
`

const HeroContainer = styled.div`
  width: 100%;
`

const Hero = styled(PageHero)`
  padding-bottom: 2rem;
`

const FlexContainer = styled.div`
  flex: ${(props) => props.flexPercent}%;
  @media (max-width: ${({ theme }) => theme.breakpoints.m}) {
    flex: 100%;
  }
`

const Flex50 = styled.div`
  flex: 50%;
  @media (max-width: ${({ theme }) => theme.breakpoints.m}) {
    flex: 100%;
  }
`

const TwoColumnContent = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 2rem;
  @media (max-width: ${({ theme }) => theme.breakpoints.l}) {
    flex-direction: column;
    align-items: flex-start;
    margin-left: 0rem;
    margin-right: 0rem;
  }
`

const InfoGrid = styled(CardGrid)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
  gap: 1rem 2rem;
  & > div {
    height: fit-content;
    &:hover {
      transition: 0.1s;
      transform: scale(1.01);
      img {
        transition: 0.1s;
        transform: scale(1.1);
      }
    }
  }
`

const StyledCardGrid = styled(CardGrid)`
  margin-bottom: 4rem;
  margin-top: 4rem;
`

const RollupCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: ${(props) => props.theme.colors.ednBackground};
  border-radius: 2px;
  border: 1px solid ${(props) => props.theme.colors.lightBorder};
  padding: 1.5rem;
  flex: 50%;
  @media (max-width: ${({ theme }) => theme.breakpoints.m}) {
    flex: 100%;
  }
`

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  margin-bottom: 4rem;
  @media (max-width: ${({ theme }) => theme.breakpoints.m}) {
    flex-direction: column;
  }
`

const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  flex: 33%;
  padding: 0 20px;
  text-align: center;
  align-content: center;
  justify-content: center;
  @media (max-width: ${({ theme }) => theme.breakpoints.m}) {
    flex: 100%;
  }
`

const StatPrimary = styled.p`
  font-weight: bold;
  font-size: ${(props) => props.theme.fontSizes.xl};
  color: ${(props) => props.theme.colors.primary};
`

const StatDescription = styled.p`
  opacity: 0.8;
  margin: 0;
`

const StatDivider = styled.div`
  border-left: 1px solid ${({ theme }) => theme.colors.homeDivider};
  max-height: 100px;
  @media (max-width: ${({ theme }) => theme.breakpoints.m}) {
    border-left: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.homeDivider};
    width: 100%;
    height: 0%;
    margin: 2rem 0;
  }
`

// https://react-select.com/styles#using-classnames
// Pass menuIsOpen={true} to component to debug
const StyledSelect = styled(Select)`
  width: 100%;
  max-width: 640px;
  color: black;
  /* Component */
  .react-select__control {
    border: 1px solid ${(props) => props.theme.colors.searchBorder};
    background: ${(props) => props.theme.colors.searchBackground};
    /* Dropdown arrow */
    .react-select__indicator {
      color: ${(props) => props.theme.colors.searchBorder};
    }
    &.react-select__control--is-focused {
      border-color: ${(props) => props.theme.colors.primary} !important;
      box-shadow: 0 0 0 1px ${(props) => props.theme.colors.primary} !important;
      .react-select__value-container {
        border-color: ${(props) => props.theme.colors.primary} !important;
      }
    }
  }
  .react-select__placeholder {
    color: ${(props) => props.theme.colors.text200};
  }
  .react-select__single-value {
    color: ${(props) => props.theme.colors.text};
  }
  .react-select__menu {
    background: ${(props) => props.theme.colors.searchBackground};
    color: ${(props) => props.theme.colors.text};
  }
  .react-select__input {
    color: ${(props) => props.theme.colors.text};
  }
  .react-select__option {
    &:hover {
      background-color: ${(props) => props.theme.colors.selectHover};
    }
    &:active {
      background-color: ${(props) => props.theme.colors.selectActive};
      color: ${(props) => props.theme.colors.buttonColor} !important;
    }
  }
  .react-select__option--is-focused {
    background-color: ${(props) => props.theme.colors.selectHover};
  }
  .react-select__option--is-selected {
    background-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.buttonColor};
    &:hover {
      background-color: ${(props) => props.theme.colors.primary};
    }
  }
`

const ButtonLinkMargin = styled(ButtonLink)`
  margin-top: 2.5rem;
`

const Layer2Page = ({ data }) => {
  const intl = useIntl()

  const [tvl, setTVL] = useState(NaN)
  const [percentChangeL2, setL2PercentChange] = useState(NaN)
  const [averageFee, setAverageFee] = useState(NaN)
  const [selectedExchange, setSelectedExchange] = useState(undefined)
  const [selectedL2, setSelectedL2] = useState(undefined)

  useEffect(async () => {
    const l2beatResponse = await fetch("https://l2beat.com/api/tvl.json")
    const l2BeatData = await l2beatResponse.json()
    // formatted TVL from L2beat API formatted
    setTVL(
      new Intl.NumberFormat(intl.locale, {
        style: "currency",
        currency: "USD",
        notation: "compact",
        minimumSignificantDigits: 2,
        maximumSignificantDigits: 3,
      }).format(l2BeatData.data[l2BeatData.data.length - 1][1])
    )

    // Calculate percent change ((new value - old value) / old value) *100)
    setL2PercentChange(
      ((l2BeatData.data[l2BeatData.data.length - 1][1] -
        l2BeatData.data[l2BeatData.data.length - 31][1]) /
        l2BeatData.data[l2BeatData.data.length - 31][1]) *
        100
    )

    // Average eth transfer fee from L2's supported by cryptostats API
    const feeResponse = await fetch(
      "https://api.cryptostats.community/api/v1/l2-fees/feeTransferEth?metadata=false"
    )
    const feeData = await feeResponse.json()
    const feeAverage =
      feeData.data.reduce(
        (acc, curr) => (acc += curr.results.feeTransferEth),
        0
      ) / feeData.data.length
    setAverageFee(feeAverage)
  }, [])

  const heroContent = {
    title: "Layer 2",
    header: "Layer 2",
    subtitle:
      "Scaling Ethereum without compromising on security and decentralization.",
    image: getImage(data.ethBlocks),
    alt: "test",
    buttons: [
      {
        content: "What is layer 2",
        pathId: "what-is-layer-2",
      },
      {
        content: "Use layer 2",
        pathId: "use-layer-2",
        isSecondary: "isSecondary",
      },
    ],
  }

  const layer2Cards = [
    {
      emoji: ":money_with_wings:",
      title: "Lower fees",
      description:
        "By combining multiple transactions into a single transaction on layer 1, transaction fees are massively reduced, making Ethereum more accessible for all.",
    },
    {
      emoji: ":closed_lock_with_key:",
      className: "security-card",
      title: "Maintain Security",
      description:
        "Layer 2 blockchains settle their transactions on the Ethereum Mainnet, allowing users who use them to benefit from the security of the Ethereum network.",
    },
    {
      emoji: ":hammer_and_wrench:",
      title: "Expand Use Cases",
      description:
        "With higher transactions per second, lower fees, and new technology, projects will expand into new applications with improved user experience.",
    },
  ]

  const rollupCards = [
    {
      emoji: ":page_with_curl:",
      title: "Optimistic Rollups",
      description:
        "Optimistic rollups use fault proofs where transactions are assumed to be valid, but can be challenged if an invalid transaction is suspected. If an invalid tranaction is suspected, a fault proof is ran to see if this has taken place.",
      childSentence: "More on optimistic rollups",
      childLink: "/developers/docs/scaling/optimistic-rollups/",
    },
    {
      emoji: ":scroll:",
      title: "Zero Knowledge Rollups",
      description:
        "Zero Knowledge rollups use validity proofs where transactions calculations are computed off-chain, and then this data is then supplied to Ethereum Mainnet with a proof of their validity.",
      childSentence: "More on zk-rollups",
      childLink: "/developers/docs/scaling/zk-rollups/",
    },
  ]

  const toolsData = {
    information: [
      {
        title: "L2BEAT",
        description:
          "L2BEAT is a great resource for looking at technical risk assessments of layer 2 projects. We recommend checking out their resources when researching specific layer 2 projects.",
        link: "https://l2beat.com",
        image: getImage(data.l2beat),
        alt: "L2BEAT",
      },
      {
        title: "L2 Fees",
        description:
          "L2 Fees lets you see the current cost (denominated in USD) for doing transactions on different layer 2s.",
        link: "https://l2fees.info",
        image: getImage(data.impact),
        alt: "L2 Fees",
      },
      {
        title: "Chainlist",
        description:
          "Chainlist is a great resource for importing network RPC's into supporting wallets. You will find RPC's for layer 2 projects here to help get you connected.",
        link: "https://chainlist.org",
        image: getImage(data.chainlist),
        alt: "Chainlist",
      },
    ],
    walletManagers: [
      {
        title: "Zapper",
        link: "https://zapper.fi/",
        description:
          "Manage your entire web3 portfolio from DeFi to NFTs and whatever comes next. Invest in the latest opportunities from one convenient place.",
        image: getImage(data.zapper),
        alt: "Zapper",
      },
      {
        title: "Zerion",
        description:
          "Build and manage your entire DeFi portfolio from one place. Discover the world of decentralized finance today.",
        link: "https://zerion.io",
        image: getImage(data.zerion),
        alt: "Zerion",
      },
      {
        title: "DeBank",
        description:
          "Keep up with all the important happenings in the web3 world",
        link: "https://debank.com",
        image: getImage(data.debank),
        alt: "DeBank",
      },
    ],
    tokenLists: [
      {
        title: "tokenlists.org",
        description: "Token list for Optimism",
        link: "https://tokenlists.org/token-list?url=https://static.optimism.io/optimism.tokenlist.json",
        image: getImage(data.optimism),
        alt: "tokenlists.org",
      },
      {
        title: "arbucks",
        description: "Token list for Arbitrum One",
        link: "https://arbucks.io/tokens/",
        image: getImage(data.arbitrum),
        alt: "arbucks",
      },
    ],
    dappPortal: [
      {
        title: "Arbitrum One Portal",
        description: "Dapp portal for Arbitrum One",
        link: "https://portal.arbitrum.one/",
        image: getImage(data.arbitrum),
        alt: "Arbitrum One",
      },
      {
        title: "Optimism ecosystem",
        description: "Dapp portal for Optimism",
        link: "https://www.optimism.io/apps/all",
        image: getImage(data.optimism),
        alt: "Optimism",
      },
    ],
    blockExplorers: [
      {
        title: "Arbitrum One",
        description: "Arbitrum One block explorer",
        link: "https://explorer.arbitrum.io/",
        image: getImage(data.arbitrum),
        alt: "Arbitrum One",
      },
      {
        title: "Optimism",
        descrition: "Optimism block explorer",
        link: "https://optimistic.etherscan.io/",
        image: getImage(data.optimism),
        alt: "Optimism",
      },
      {
        title: "zkSync",
        description: "zkSync block explorer",
        link: "https://zkscan.io/",
        image: getImage(data.zksync),
        alt: "zkSync",
      },
      {
        title: "Metis",
        description: "Metis block explorer",
        link: "https://andromeda-explorer.metis.io/",
        image: getImage(data.metis),
        alt: "Metis",
      },
      {
        title: "Boba Network",
        description: "Boba Network block explorer",
        link: "https://blockexplorer.boba.network/",
        image: getImage(data.boba),
        alt: "Boba Network",
      },
      {
        title: "Loopring",
        description: "Loopring block explorer",
        link: "https://explorer.loopring.io/",
        image: getImage(data.loopring),
        alt: "Loopring",
      },
    ],
  }

  const layer2DataCombined = [...layer2Data.optimistic, ...layer2Data.zk]

  return (
    <GappedPage>
      <PageMetadata
        title={"Layer 2"}
        description={"Introduction page to layer 2"}
      />

      <HeroContainer>
        <Hero content={heroContent} isReverse />
      </HeroContainer>

      <Content>
        <StatsContainer>
          <StatBox>
            <StatPrimary>{tvl} (USD)</StatPrimary>
            <StatDescription>TVL locked in L2</StatDescription>
          </StatBox>
          <StatDivider />
          <StatBox>
            <StatPrimary>${averageFee.toFixed(2)} (USD)</StatPrimary>
            <StatDescription>Average ETH transfer fee</StatDescription>
          </StatBox>
          <StatDivider />
          <StatBox>
            <StatPrimary>{percentChangeL2.toFixed(2)}%</StatPrimary>
            <StatDescription>Last 30 days</StatDescription>
          </StatBox>
        </StatsContainer>
        <TwoColumnContent>
          <FlexContainer flexPercent="65">
            <h2>What is layer 1?</h2>
            <p>
              Before diving into "layer 2", it helps to understand what we
              consider "layer 1". Layer 1 blockchains, such as Ethereum and
              Bitcoin, are the{" "}
              <b>underlying foundation that layer 2 projects build on top of</b>
              . Examples of layer 2 projects built on top of these networks
              include <b>zero-knowledge rollups</b>
              and <b>optimistic rollups</b> on Ethereum and the Lighting Network
              on top of Bitcoin.
            </p>
            <p>
              <b>Ethereum as the layer 1 includes:</b>
            </p>
            <ul>
              <li>
                <b>a network of node operators</b> to secure and validate the
                network
              </li>
              <li>
                <b>a network of block proposers</b>
              </li>
              <li>
                <b>the blockchain</b> itself and the history of transaction data
              </li>
              <li>
                <b>the consensus mechanism</b> for the network
              </li>
            </ul>
          </FlexContainer>
          <FlexContainer flexPercent="35">
            <GatsbyImage image={getImage(data.impact)} />
          </FlexContainer>
        </TwoColumnContent>
      </Content>

      <Content>
        <h2>Why do we need layer 2?</h2>
        <p>
          The three desirable properties of a blockchain are that it is
          <b>decentralized, secure, and scalable</b>. The{" "}
          <Link to="https://www.ledger.com/academy/what-is-the-blockchain-trilemma">
            blockchain trilemma
          </Link>{" "}
          states that a simple blockchain architecture can only achieve two out
          of three. Want a secure and decentralized blockchain? You need to
          sacrifice scalability. This is where layer 2 networks come in.
        </p>
        <p>
          Ethereum has reached the network's current capacity with{" "}
          <Link to="https://etherscan.io/chart/tx">
            1+ million transactions per day
          </Link>
          , with high demand for each of these transactions. The success of
          Ethereum and the demand to use it has caused gas prices to rise
          substantially. Therefore the{" "}
          <Link to="/developers/docs/scaling/">need for scaling solutions</Link>{" "}
          has peaked as well.
        </p>

        <h3>Scalability</h3>
        <p>
          The main goal of scalability is to increase transaction speed (faster
          finality), and transaction throughput (high transactions per second),
          without sacrificing decentralization or security (more on the{" "}
          <Link to="/upgrades/vision/  ">Ethereum vision</Link>).
        </p>
        <p>
          The Ethereum community has taken a strong stance that it would not
          throw out decentralization or security in order to scale. Until
          sharding, Ethereum Mainnet (layer 1) will only be able to process{" "}
          <Link to="https://ethtps.info/Network/Ethereum">
            roughly 15 transactions per second
          </Link>
          . When demand to use Ethereum is high this causes network congestion,
          increasing transaction fees, and pricing out those who cannot afford
          it from using Ethereum until the fees reduce. That is where layer 2
          comes in to scale Ethereum today.
        </p>

        <h3>Benefits</h3>
        <InfoGrid>
          {layer2Cards.map(({ emoji, title, description }, idx) => (
            <Card
              description={description}
              title={title}
              emoji={emoji}
              key={idx}
            />
          ))}
        </InfoGrid>
      </Content>

      <Content id="what-is-layer-2">
        <h2>What is layer 2</h2>
        <p>
          Layer 2 is a collective term for Ethereum scaling solutions that
          handle transactions off Ethereum layer 1 while taking advantage of the
          robust decentralized security model of Ethereum layer 1. A layer 2 is
          a <b>separate blockchain that is connected to Ethereum</b>. It
          regularly communicates with Ethereum (by submitting bundles of
          transactions) in order to ensure it has similar security and
          decentralization guarantees, and requires no changes to the layer 1
          protocol. This lets layer 1 handle security, data availability, and
          decentralization, whilst everything on the layer above (layer 2) can
          handle scaling. Layer 2s takes the transactional burden away from the
          layer 1, and posts finalized proofs back to the layer 1 to finalize
          the state. By taking this load away from layer 1, the base layer will
          become less congested, and everything becomes more scalable.
        </p>
        <TwoColumnContent>
          <FlexContainer flexPercent="65">
            <h3>Rollups</h3>
            <p>
              Rollups are currently the preferred layer 2 solution for scaling
              Ethereum. By using rollups, users can{" "}
              <Link to="https://l2fees.info/">
                reduce gas fees by up to 100x
              </Link>{" "}
              when comparison to a layer 1 transaction.
            </p>
            <p>
              Rollups bundle (or ’roll up’) hundreds of transactions into a
              single transaction on layer 1. This allows the transaction fees to
              be shared across everyone in the rollup. These bundled
              transactions are posted to the layer 1 as validity, fraud, or
              fault proofs. Rollup transactions get executed outside of layer 1
              but the transaction data gets posted to layer 1. By posting
              transaction data onto layer 1, rollups are able to inherit the
              security of Ethereum.
            </p>
          </FlexContainer>
          <FlexContainer flexPercent="35">
            <GatsbyImage image={getImage(data.impact)} />
          </FlexContainer>
        </TwoColumnContent>
        <TwoColumnContent>
          {rollupCards.map(
            ({ emoji, title, description, childSentence, childLink }) => (
              <RollupCard>
                {emoji && <Emoji size={3} text={emoji} />}
                <h3>{title}</h3>
                <p>{description}</p>
                <p>
                  <Link to={childLink}>{childSentence}</Link>
                </p>
              </RollupCard>
            )
          )}
        </TwoColumnContent>
        <InfoBanner>
          <h2>Do your own research: Risks of layer 2</h2>
          <p>
            Because layer 2 chains inherit security from Ethereum, in an ideal
            world, they are as safe as L1 Ethereum. However, many of the
            <b>projects are still young and somewhat experimental</b>. After
            years of R&D, many of the L2 technologies that will scale Ethereum
            went live in 2021. This is not to say these L2s are not secure, only
            that no layer 2 is as battle tested as Ethereum Mainnet. Always do
            your own research and decide if you're comfortable with any risks
            involved.
          </p>
          <p>
            For more information on the technology, risks and trust assumptions
            of layer 2s, we recommend checking out L2BEAT, which provides a
            comprehensive risk assessment framework of each project.
          </p>
          <p>
            <Link to="https://l2beat.com">L2BEAT</Link>
          </p>
        </InfoBanner>
      </Content>

      <Content id="use-layer-2">
        <h2>Generalized layer 2s</h2>
        <p>
          Generalized layer 2s behave just like Ethereum — but cheaper. Anything
          that you can do on Ethereum layer 1, you can also do on layer 2. Many
          dapps have already begun to migrate to these networks, or are skipping
          deploying to Mainnet altogether.
        </p>
        <StyledCardGrid>
          {layer2DataCombined
            .filter((l2) => !l2.purpose.indexOf("universal"))
            .map((l2, idx) => {
              return (
                <ProductCard
                  key={idx}
                  background={l2.background}
                  image={getImage(data[l2.imageKey])}
                  description={l2.description}
                  url={l2.website}
                  note={translateMessageId(l2.noteKey, intl)}
                  name={l2.name}
                />
              )
            })}
        </StyledCardGrid>

        <h2>Application specific layer 2s</h2>
        <p>
          Application specific layer 2s are projects that specialize in
          optimizing for a specific application space, bringing improved
          performance.
        </p>
        <StyledCardGrid>
          {layer2DataCombined
            .filter((l2) => l2.purpose.indexOf("universal"))
            .map((l2, idx) => {
              return (
                <ProductCard
                  key={idx}
                  background={l2.background}
                  image={getImage(data[l2.imageKey])}
                  description={l2.description}
                  url={l2.website}
                  note={translateMessageId(l2.noteKey, intl)}
                  name={l2.name}
                >
                  {l2.purpose.map((purpose) => (
                    <Pill>{purpose}</Pill>
                  ))}
                </ProductCard>
              )
            })}
        </StyledCardGrid>
      </Content>

      <Content>
        <h2>A note on alt L1s, sidechains, and validiums</h2>
        <TwoColumnContent>
          <Flex50>
            <p>
              <b>Alternative layer 1s</b> have higher throughput and lower
              transaction fees than Ethereum. These alt L1s have had to{" "}
              <b>sacrifice on security or decentralization</b> in order to
              achieve higher transactions per second and lower fees. The
              Ethereum ecosystem is firmly aligned that{" "}
              <b>
                layer 2 scaling is the only way to solve the scalability
                trilemma
              </b>{" "}
              and remain decentralized and secure.
            </p>
          </Flex50>
          <Flex50>
            <p>
              <b>Sidechains and validiums</b> are blockchains that allow assets
              from one blockchain to be bridged over and used on another
              blockchain. Sidechains and validiums run in parallel with the main
              chain, and interact with the main chain through bridges, but they
              do not derive their security or data availability from the main
              chain. They scale similarly to layer 2s, but have different trust
              assumptions. They offer lower transaction fees, and higher
              transaction throughput. More on{" "}
              <Link to="/developers/docs/scaling/sidechains/">sidechains</Link>{" "}
              and <Link to="/developers/docs/scaling/validium/">validiums</Link>
              .
            </p>
          </Flex50>
        </TwoColumnContent>
      </Content>

      <Content>
        <InfoBanner>
          <h2>How to get onto a layer 2</h2>
          <p>
            There are two primary ways to get your assets onto a layer 2: bridge
            funds from Ethereum via a smart contract or withdraw your funds on
            an exchange directly onto the layer 2 network.
          </p>
          <TwoColumnContent>
            <Flex50>
              <h4>Funds in your wallet?</h4>
              <p>
                If you've already got your ETH in your wallet, you'll need to
                use a bridge to move it from Ethereum Mainnet to a layer 2.{" "}
                <Link to="/bridges/">More on bridges</Link>.
              </p>
              <StyledSelect
                className="react-select-container"
                classNamePrefix="react-select"
                options={layer2DataCombined.map((l2) => {
                  l2.label = l2.name
                  l2.value = l2.name
                  return l2
                })}
                onChange={(selectedOption) => setSelectedL2(selectedOption)}
                placeholder={"Select L2 you want to bridge to"}
              />
              {selectedL2 && (
                <ButtonLinkMargin to={selectedL2.bridge}>
                  {selectedL2.name} Bridge
                </ButtonLinkMargin>
              )}
            </Flex50>
            <Flex50>
              <h4>Funds on an exchange?</h4>
              <p>
                Some centralized exchanges now offer direct withdrawals and
                deposits to layer 2s. Check which exchanges support layer 2
                withdrawals and which layer 2s they support.
              </p>
              <StyledSelect
                className="react-select-container"
                classNamePrefix="react-select"
                options={cexSupport.map((cex) => {
                  cex.label = cex.name
                  cex.value = cex.name
                  return cex
                })}
                onChange={(selectedOption) =>
                  setSelectedExchange(selectedOption)
                }
                placeholder={"Check exchanges that support L2"}
              />
              {selectedExchange && (
                <div>
                  <TwoColumnContent>
                    <Flex50>
                      <h3>Deposits</h3>
                      <ul>
                        {selectedExchange.supports_deposits.map((l2) => (
                          <li>{l2}</li>
                        ))}
                      </ul>
                    </Flex50>
                    <Flex50>
                      <h3>Withdrawals</h3>
                      <ul>
                        {selectedExchange.supports_withdrawals.map((l2) => (
                          <li>{l2}</li>
                        ))}
                      </ul>
                    </Flex50>
                  </TwoColumnContent>
                  <ButtonLink to={selectedExchange.url}>
                    Go to {selectedExchange.name}
                  </ButtonLink>
                </div>
              )}
            </Flex50>
          </TwoColumnContent>
        </InfoBanner>
      </Content>

      <Content>
        <h2>Tools to be effective on layer 2</h2>
        <TwoColumnContent>
          <Flex50>
            <ProductList
              category="Information"
              content={toolsData.information}
            />
            <ProductList
              category="Block explorers"
              content={toolsData.blockExplorers}
            />
          </Flex50>
          <Flex50>
            <ProductList
              category="Wallet managers"
              content={toolsData.walletManagers}
            />
            <ProductList
              category="Token lists"
              content={toolsData.tokenLists}
            />
            <ProductList
              category="Dapp portal"
              content={toolsData.dappPortal}
            />
          </Flex50>
        </TwoColumnContent>
      </Content>

      <Content>
        <h2>FAQ</h2>
        <ExpandableCard title="Why is there no 'official' Ethereum L2?">
          <p>
            Just as there is no “official” Ethereum client, there is no
            “official” Ethereum layer 2. Multiple teams will implement their
            version of a layer 2, and the ecosystem as a whole will benefit from
            diversity in these clients as a decentralizing point. Much like we
            have multiple Ethereum clients developed by multiple teams in order
            to have diversity in the network, this too will be how layer 2s
            develop in the future.
          </p>
        </ExpandableCard>
        <ExpandableCard title="What is the difference between optimistic and zero knowledge rollups?">
          <p>
            Main difference being, validity proofs run the computations and post
            a proof, whereas fraud proofs only run the computations when fraud
            is suspected and needs to be checked. At the moment, most zk-rollups
            are application specific, in contrast with optimistic rollups which
            have largely been generalizable.
          </p>
        </ExpandableCard>
        <ExpandableCard title="Is scaling at layer 1 possible?">
          <p>
            Yes. Currently in the Ethereum roadmap there are plans for shard
            chains. While these are in the roadmap, further scaling through
            layer 2 networks is still necessary.{" "}
            <Link to="/upgrades/shard-chains/">More info on sharding</Link>.
          </p>
        </ExpandableCard>
        <ExpandableCard title="What are the risks with layer 2?">
          <p>
            Sequencers may go down, leading you to have to wait to access funds.
            While there may be a waiting period, you do still have access to
            your funds unlike alt-l1's or sidechains.
          </p>
          <p>
            Bridges are in their early stages of development, and it is likely
            that the optimal bridge design has not been discovered yet. There
            have been{" "}
            <Link to="https://rekt.news/wormhole-rekt/">
              recent hacks of bridges
            </Link>
            . <Link to="/bridges/">More information on bridges</Link>.
          </p>
        </ExpandableCard>
      </Content>

      <Content>
        <h2>Further reading</h2>
        <ul>
          <li>
            <Link to="https://eips.Ethereum.org/EIPS/eip-4488">
              EIP-4488 proposed to reduce transaction call data gas cost
            </Link>
          </li>
          <li>
            <Link to="/upgrades/shard-chains/">
              Scaling layer 1 with shard chains
            </Link>
          </li>
          <li>
            <Link to="https://barnabe.substack.com/p/understanding-rollup-economics-from?s=r">
              Understanding rollup economics from first principals
            </Link>{" "}
            <i>- Barnabé Monnot</i>
          </li>
        </ul>
      </Content>
    </GappedPage>
  )
}

export default Layer2Page

export const query = graphql`
  query {
    ethBlocks: file(relativePath: { eq: "developers-eth-blocks.png" }) {
      childImageSharp {
        gatsbyImageData(
          width: 624
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
    impact: file(relativePath: { eq: "impact_transparent.png" }) {
      childImageSharp {
        gatsbyImageData(
          width: 300
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
    arbitrum: file(relativePath: { eq: "layer-2/arbitrum.png" }) {
      childImageSharp {
        gatsbyImageData(
          width: 200
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
    boba: file(relativePath: { eq: "layer-2/boba.png" }) {
      childImageSharp {
        gatsbyImageData(
          width: 200
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
    chainlist: file(relativePath: { eq: "layer-2/chainlist.png" }) {
      childImageSharp {
        gatsbyImageData(
          width: 200
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
    debank: file(relativePath: { eq: "layer-2/debank.png" }) {
      childImageSharp {
        gatsbyImageData(
          width: 200
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
    dydx: file(relativePath: { eq: "layer-2/dydx.jpg" }) {
      childImageSharp {
        gatsbyImageData(
          width: 200
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
    l2beat: file(relativePath: { eq: "layer-2/l2beat.jpg" }) {
      childImageSharp {
        gatsbyImageData(
          width: 200
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
    loopring: file(relativePath: { eq: "layer-2/loopring.png" }) {
      childImageSharp {
        gatsbyImageData(
          width: 200
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
    metis: file(relativePath: { eq: "layer-2/metis-light.png" }) {
      childImageSharp {
        gatsbyImageData(
          width: 200
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
    optimism: file(relativePath: { eq: "layer-2/optimism.png" }) {
      childImageSharp {
        gatsbyImageData(layout: CONSTRAINED, placeholder: BLURRED, quality: 100)
      }
    }
    zapper: file(relativePath: { eq: "layer-2/zapper.png" }) {
      childImageSharp {
        gatsbyImageData(
          width: 200
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
    zerion: file(relativePath: { eq: "layer-2/zerion.png" }) {
      childImageSharp {
        gatsbyImageData(
          width: 200
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
    zkspace: file(relativePath: { eq: "layer-2/zkspace.png" }) {
      childImageSharp {
        gatsbyImageData(
          width: 200
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
    zksync: file(relativePath: { eq: "layer-2/zksync.png" }) {
      childImageSharp {
        gatsbyImageData(
          width: 80
          layout: CONSTRAINED
          placeholder: BLURRED
          quality: 100
        )
      }
    }
  }
`