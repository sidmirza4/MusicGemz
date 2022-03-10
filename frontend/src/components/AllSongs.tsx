import React from "react";
import Song from "../components/Song";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { useAppContext } from "../context/AppContext";
import { CircularProgress } from "@mui/material";

// Grid to display uploaded songs from
export default function AllSongs() {
	const { allSongs } = useAppContext();

	return (
		<Container sx={{ py: 8 }}>
			<Grid container spacing={5}>
				<>
					{!allSongs.length ? (
						<Grid container justifyContent="center">
							<CircularProgress />
						</Grid>
					) : (
						allSongs.map((song) => (
							<Grid item key={song.id} xs={12} sm={6} md={4}>
								<Song song={song} />
							</Grid>
						))
					)}
				</>
			</Grid>
		</Container>
	);
}
