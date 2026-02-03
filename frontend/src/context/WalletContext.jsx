import { createContext, useState, useContext, useEffect } from 'react';

const WalletContext = createContext();

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [balance, setBalance] = useState(0);

    const connectWallet = async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });

                setWalletAddress(accounts[0]);
                setIsConnected(true);

                // Get balance (optional)
                const balanceWei = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [accounts[0], 'latest'],
                });

                const balanceEth = parseInt(balanceWei, 16) / 1e18;
                setBalance(balanceEth);

                return accounts[0];
            } else {
                throw new Error('MetaMask is not installed');
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
        setIsConnected(false);
        setBalance(0);
    };

    useEffect(() => {
        // Check if wallet is already connected
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setIsConnected(true);
                }
            });

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setIsConnected(true);
                } else {
                    disconnectWallet();
                }
            });
        }
    }, []);

    const value = {
        walletAddress,
        isConnected,
        balance,
        connectWallet,
        disconnectWallet,
    };

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
