import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { Header } from "./components/ui/layout/Header";
import CallToAction from "./components/CallToAction";
import AllSongs from "./components/AllSongs";
import Footer from "./components/Footer";
import theme from "./mui/theme";

import "react-toastify/dist/ReactToastify.css";

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<div className="App">
				<Header />
				<CallToAction />
				<AllSongs />
				<div style={{ height: "300px" }}></div>
				<Footer />
			</div>
			<ToastContainer theme="colored" position="top-center" />
		</ThemeProvider>
	);
}

export default App;
