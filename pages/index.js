import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Nav from '../components/Nav.jsx';
import { useState } from 'react';
import * as fcl from '@onflow/fcl'
import { useEffect } from 'react'

export default function Home() {
  const [newGreeting, setNewGreeting] = useState('');
  const [greeting, setGreeting] = useState('');
  const [txStatus, setTxStatus] = useState('Run Transaction');

  const [mintStatus, setMintStatus] = useState('Mint Race Number Token')


  async function runTransaction() {
    setTxStatus('Requesting...')
    console.log("Running Transaction!")
    console.log("Changing the greeting to: " + newGreeting);

    const txId = await fcl.mutate({
      cadence: `
      import HelloWorld from 0xd55b625258390fec
      transaction(myNewGreeting: String) {

        prepare(signer: AuthAccount) {}
  
        execute {
          HelloWorld.changeGreeting(newGreeting: myNewGreeting)
        }
      }
      `,
      args: (arg, t) => [
        arg(newGreeting, t.String)
      ],
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999,
    })

    console.log('Here is the transaction: ' + txId)
    fcl.tx(txId).subscribe(res => {
      console.log(res)
      if (res.status === 0 || res.status === 1) {
        setTxStatus('Pending...');
      } else if (res.status === 2) {
        setTxStatus('Finalized...')
      } else if (res.status === 3) {
        setTxStatus('Executed...');
      } else if (res.status === 4) {
        setTxStatus('Sealed!');

        setTimeout(() => setTxStatus('Run Transaction'), 2000); // We added this line
      }
    })

    await fcl.tx(txId).onceSealed()
    executeScript()
  }

  async function mintRaceNumber() {
    setMintStatus('Requesting...')
    console.log("Running Transaction!")

    const txId = await fcl.mutate({
      cadence: `
      // import RaceNumberContract from 0xf8d6e0586b0a20c7

      // testnet
      import RaceNumberContract from 0x16fa33cab0a7b7c2
      
      transaction {
          let receiverRef: &{RaceNumberContract.NFTReceiver}
      
          let minterRef: &RaceNumberContract.NFTMinter
      
          let metadata: {String: String}
      
          prepare(account: AuthAccount) {
              if account.borrow<&RaceNumberContract.NFTCollection>(from: /storage/NFTCollectionRaceNumber) == nil {
                  account.save(<-RaceNumberContract.createNFTCollection(), to: /storage/NFTCollectionRaceNumber)
                  account.link<&{RaceNumberContract.NFTReceiver}>(/public/NFTReceiverRaceNumber, target: /storage/NFTCollectionRaceNumber)
              }
      
              if account.borrow<&RaceNumberContract.NFTMinter>(from: /storage/NFTMinterRaceNumber) == nil{
                  account.save(<-RaceNumberContract.createNFTMinter(), to: /storage/NFTMinterRaceNumber)
              }
       
              self.receiverRef = account.getCapability<&{RaceNumberContract.NFTReceiver}>(/public/NFTReceiverRaceNumber)
                  .borrow()
                  ?? panic("Could not borrow receiver reference")
      
              self.minterRef = account.borrow<&RaceNumberContract.NFTMinter>(from: /storage/NFTMinterRaceNumber)
                  ?? panic("Could not borrow minter reference")
      
              self.metadata = {
              "number": "001",
              "gameType": "1",
              "templateType": "1",
              "imgUrl": "abcdefg"
              }
          }
      
          execute {
              let newToken <- self.minterRef.mint(self.metadata)
              self.receiverRef.deposit(token: <-newToken)
          }
      }
      `,
      args: (arg, t) => [
        // arg(newGreeting, t.String)
      ],
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999,
    })

    console.log('Here is the transaction: ' + txId)
    fcl.tx(txId).subscribe(res => {
      console.log(res)
      if (res.status === 0 || res.status === 1) {
        setMintStatus('Pending...');
      } else if (res.status === 2) {
        setMintStatus('Finalized...')
      } else if (res.status === 3) {
        setMintStatus('Executed...');
      } else if (res.status === 4) {
        setMintStatus('Sealed!');

        setTimeout(() => setMintStatus('Mint Race Number Token'), 2000); // We added this line
      }
    })

    await fcl.tx(txId).onceSealed()
  }

  async function executeScript() {
    const resp = await fcl.query({
      cadence: `
      import HelloWorld from 0xd55b625258390fec

      pub fun main(): String {
          return HelloWorld.greeting
      }
      `,
      args: (arg, t) => []
    })

    setGreeting(resp)

    console.log("Response from our script: " + resp)
  }

  useEffect(() => {
    executeScript()
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Emerald DApp</title>
        <meta name="description" content="Created by Emerald Academy" />
        <link rel="icon" href="https://i.imgur.com/hvNtbgD.png" />
      </Head>

      <Nav />

      <div className={styles.welcome}>
        <h1 className={styles.title}>
          Welcome to my <a href="https://academy.ecdao.org" target="_blank" rel="noreferrer">Flow DApp!</a>
        </h1>
        <p>This is a DApp created by Fenix.</p>
      </div>

      <main className={styles.main}>
        <p>{greeting}</p>
        <div className={styles.flex}>
          <input onChange={(e) => setNewGreeting(e.target.value)} placeholder="Hello, Idiots!" />
          <button onClick={runTransaction} disabled={txStatus != 'Run Transaction'}>{txStatus}</button>
          <button onClick={mintRaceNumber} disabled={mintStatus != 'Mint Race Number Token'}>{mintStatus}</button>

        </div>

      </main>
    </div>
  )
}