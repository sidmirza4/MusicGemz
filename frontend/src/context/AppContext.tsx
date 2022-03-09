import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";

import { ethers, Contract } from "ethers";

import contractAddress from "../contracts/contract-address.json";
import gemzArtifacts from "../contracts/Gemz.json";

declare global {
	interface Window {
		ethereum: any;
	}
}
interface IAppContext {
	isMetamaskInstalled: boolean;
	connectWallet: () => void;
	selectedAccount: string;
	gemz?: Contract;
	allSongs: Array<any>;
	sendTip: () => void;
}

const AppContext = createContext<IAppContext>({
	isMetamaskInstalled: false,
	connectWallet: () => {},
	selectedAccount: "",
	allSongs: [],
	sendTip: () => {},
});

const AppContextProvider: React.FC = ({ children }) => {
	const [isMetamaskInstalled, setIsMetamaskInstalled] = useState(false);
	const [selectedAccount, setSelectedAccount] = useState("");
	const [gemz, setGemz] = useState<Contract>();
	const [allSongs, setAllSongs] = useState<any[]>([]);

	const _initializeContract = useCallback(async () => {
		let provider: any;

		if (window.ethereum) {
			provider = new ethers.providers.Web3Provider(window.ethereum);
		} else {
			provider = new ethers.providers.JsonRpcProvider(
				process.env.REACT_APP_POLYGON_URL
			);
		}

		const signer = provider.getSigner(
			selectedAccount ? selectedAccount : undefined
		);

		// get gemz contract instance
		const gemzContract = new ethers.Contract(
			contractAddress.Gemz,
			gemzArtifacts.abi,
			signer._address ? signer : provider
		);

		setGemz(gemzContract);

		const accounts = await provider.listAccounts();
		if (accounts !== null && accounts.length > 0) {
			setSelectedAccount(accounts[0]);
		}
	}, [selectedAccount]);

	useEffect(() => {
		if (window.ethereum) {
			setIsMetamaskInstalled(true);
		}
		_initializeContract();
	}, [selectedAccount, _initializeContract]);

	const connectWallet = async () => {
		const [selectedAccount] = (await window.ethereum.request({
			method: "eth_requestAccounts",
		})) as string[];

		if (selectedAccount) {
			setSelectedAccount(selectedAccount);
		}
	};

	const sendTip = async () => {
		console.log("tip in contexts");
		if (gemz) {
			const response = await gemz.donate(1, {
				value: ethers.utils.parseUnits("0.01", "ether"),
			});
			console.log(response);
		}
	};

	const _getAllSongs = useCallback(async () => {
		const songs = [];

		if (gemz) {
			try {
				const _fileCount = await gemz.fileCount();
				const fileCount = parseInt(_fileCount.toString());

				// get all songs from contract
				for (let i = 0; i < fileCount; i++) {
					const song = await gemz.files(i);
					songs.push(song);
				}

				// structure songs
				const structuredSongs = songs.reverse().map((song) => {
					return {
						id: song.fileID.toNumber(),
						artistAddr: song.artistAddr,
						artistName: song.artistName,
						songTitle: song.fileName,
						genre: song.genre,
						songFile: song.fileHash,
						coverPhoto: song.coverHash,
					};
				});

				console.log(structuredSongs);

				setAllSongs(structuredSongs);
			} catch (error) {
				console.log(error);
			}
		}
	}, [gemz]);

	useEffect(() => {
		_getAllSongs();
		setInterval(_getAllSongs, 20000);
	}, [gemz, _getAllSongs]);

	const value = {
		gemz,
		isMetamaskInstalled,
		connectWallet,
		selectedAccount,
		allSongs,
		sendTip,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

export default AppContextProvider;
