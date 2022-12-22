
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";
import { Web3Provider } from "@ethersproject/providers";


export default function Home() {

// walletConnected keep track of whether the user's wallet is connected or not
const [walletConnected, setWalletConnected] = useState(false);
// joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not
const [joinedWhiteList, setJoinedWhiteList] = useState(false);
// loading is set to true when we are waiting for a transaction to get mined
const [loading, setLoading] = useState (false);
// numberOfWhitelisted tracks the number of addresses's whitelisted
const [numOfWhitelisted, setNumberOfWhitelisted] = useState(0);
// Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
const web3ModalRef :any = useRef();


const getProviderOrSigner = async (needSigner = false) => {
  // Connect to Metamask
  // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
   const provider = await web3ModalRef.current.connect();
   const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
  const { chainId } = await web3Provider.getNetwork();
  if (chainId !== 5) {
    window.alert("Change the network to Goerli");
    throw new Error ("Change network to Goerli");
  }

  if (needSigner) {
    const signer = web3Provider.getSigner();
    return signer;
  }
  return web3Provider;
};
  /**
   * addAddressToWhitelist: Adds the current connected address to the whitelist
   */
  const addAddressToWhitelist = async () => {
    try {
    // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const whitelistContract = new Contract (
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // call the addAddressToWhitelist from the contract
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading (true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading (false);
      // get the updated number of addresses in the whitelist
      await getNumberOfWhitelisted();
      setJoinedWhiteList(true);
    } catch (err) {
      console.error(err);
    }
  };
  /**
   * getNumberOfWhitelisted:  gets the number of whitelisted addresses
   */

  const getNumberOfWhitelisted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // call the numAddressesWhitelisted from the contract
        const _numberOfWhitelisted = 
          await whitelistContract.numAddressesWhitelisted();
          setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error (err);
      
    }
  };

  /**
   * checkIfAddressInWhitelist: Checks if the address is in whitelist
   */
  const checkIfAddressInWhitelist = async () => {
    try {
      // We will need the signer later to get the user's address
      // Even though it is a read transaction, since Signers are just special kinds of Providers,
      // We can use it in it's place
      const signer : any = await getProviderOrSigner(true);
      const whitelistContract = new Contract (
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      // call the whitelistedAddresses from the contract
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhiteList(_joinedWhitelist);
    } catch (err) {
      console.error (err);
    }
  };
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
    await getProviderOrSigner();
    setWalletConnected(true);

    checkIfAddressInWhitelist();
    getNumberOfWhitelisted();
    } catch (err) {
      console.error (err);
    }
  };
  /*
    renderButton: Returns a button based on the state of the dapp
  */

    const renderButton = () => {
      if (walletConnected) {
        if (joinedWhiteList) {
          return (
            <div className={styles.description}>
              Thanks for joining the Whitelist!
            </div>
          );
        } else if (loading) {
          return <button className={styles.button}> Loading... </button>;
        } else {
          return (
            <button onClick={addAddressToWhitelist} className= {styles.button}>
              Join the Whitelist
            </button>
          );
        }
      } else {
        return (
          <button onClick= {connectWallet} className={styles.button}>
            Connect your wallet
          </button>
        );
      }
    };
  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
},[walletConnected]);
  
  return (
    <div>
      <Head>
        <title> Whitelist dApp </title>
        <meta name="description" content="Whitelist-Dapp"/>
      </Head>
        <div className={styles.main}></div>
          <h1 className={styles.title}>
            Welcome to Crypto Devs!
          </h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
        <div className={styles.description}>
          {numOfWhitelisted} have already joined the Whitelist
          <div>
            {renderButton()}
          </div>
          <div>
          <img className={styles.image} src="./crypto-devs.svg" />
          </div>
        </div>
      <footer className={styles.footer}> 
        Made by &#xa9; Rozet
      </footer>
    </div>
  );
}
