import { Formik, Form, Field, FormikBag } from "formik";
import * as Yup from "yup";
// import { Button } from "./ui/atoms/Button";
import {
	DialogTitle,
	Dialog,
	DialogActions,
	DialogContent,
	Button,
	Stack,
	Box,
} from "@mui/material";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import { TextField } from "formik-mui";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";

// import { ButtonUploadSong } from "./ButtonUploadSong";
// import { ButtonUploadImage } from "./ButtonUploadImage";
import React from "react";
import useWeb3Storage from "../hooks/useWeb3Storage";
import { useAppContext } from "../context/AppContext";

const Transition = React.forwardRef(function Transition(
	props: TransitionProps & { children: React.ReactElement<any, any> },
	ref: React.Ref<unknown>
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const IMAGE_SUPPORTED_FORMATS = [
	"image/jpg",
	"image/jpeg",
	"image/gif",
	"image/png",
];
const SONG_SUPPORTED_FORMATS = ["audio/mpeg", "audio/mp3"];

const validationSchema = Yup.object({
	artistName: Yup.string()
		.max(15, "Must be 15 characters or less")
		.required("Please fill artist name"),
	songTitle: Yup.string()
		.max(100, "Must be 100 characters or less")
		.required("Please fill song title"),
	coverImage: Yup.mixed()
		.nullable()
		.notRequired()
		.test(
			"fileType",
			"Unsupported File Format",
			(value) => value && IMAGE_SUPPORTED_FORMATS.includes(value.type)
		),
	song: Yup.mixed()
		.required()
		.test(
			"fileType",
			"Unsupported File Format",
			(value) => value && SONG_SUPPORTED_FORMATS.includes(value.type)
		)
		.nullable(),
});

interface IValues {
	artistName: string;
	songTitle: string;
	genre: string;
	coverImage: File | null;
	song: File | null;
}

const initialValues: IValues = {
	artistName: "",
	songTitle: "",
	genre: "",
	coverImage: null,
	song: null,
};

const UploadSongForm = () => {
	const [selectedSong, setSelectedSong] = React.useState<File>();
	const [selectedImage, setSelectedImage] = React.useState<File>();
	const [open, setOpen] = React.useState(false);

	const { gemz, selectedAccount } = useAppContext();
	const { uploadFiles, getFiles } = useWeb3Storage();

	const onSubmit = async (values: IValues) => {
		try {
			// upload files and get the cid
			if (values.coverImage && values.song) {
				const songCid = await uploadFiles([values.song]);

				const imageCid = await uploadFiles([values.coverImage]);

				console.log(songCid);
				console.log(imageCid);

				// getting uploaded files using the cid
				const songFile = await getFiles(songCid);
				const imageFile = await getFiles(imageCid);
				if (songFile && imageFile) {
					const [song] = songFile;
					const [image] = imageFile;

					// if files are there send the data to the blockchain
					console.log("giving data to the blockchain");
					if (gemz) {
						const response = await gemz.uploadFile(
							song.cid,
							image.cid,
							values.songTitle,
							values.artistName
						);

						await response.wait();
						toast("Song uploaded successfully", { type: "success" });
						setSelectedImage(undefined);
						setSelectedSong(undefined);
						handleClose();
					}
				}
			}
		} catch (err: any) {
			if (err.code === 4001) {
				toast("You rejected the transaction", { type: "error" });
				return;
			}
			console.log(err);
			toast("Something went wrong", { type: "error" });
		}
	};

	function playSong() {
		if (selectedSong) {
			let audio = new Audio(URL.createObjectURL(selectedSong));
			if (audio.paused) {
				audio.play();
			}
		}
	}

	const handleClickOpen = () => {
		if (!selectedAccount) {
			toast("Please connect your wallet first", { type: "info" });
			return;
		}
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<div>
			<Button onClick={handleClickOpen} variant="contained">
				Upload Music
			</Button>
			<Dialog
				open={open}
				TransitionComponent={Transition}
				onClose={handleClose}
				maxWidth="lg"
				aria-describedby="upload-song-dialog"
			>
				<DialogTitle sx={{ fontSize: "1.6rem" }}>
					Upload your song here
				</DialogTitle>

				<DialogContent sx={{ p: 3, mt: 2 }}>
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={onSubmit}
					>
						{({ isSubmitting, setFieldValue }) => (
							<Stack component={Form} spacing={3} my={2}>
								<Stack direction="row" spacing={2}>
									<Field
										component={TextField}
										fullWidth
										required
										name="songTitle"
										type="text"
										id="song-title"
										label="Song Title"
									/>

									<Field
										component={TextField}
										fullWidth
										required
										variant="outlined"
										name="artistName"
										type="text"
										id="name"
										label="Artist Name"
									/>
								</Stack>

								<div>
									<label htmlFor="song">Upload Song*: </label>
									<input
										type="file"
										name="song"
										id="song"
										accept="audio/mpeg, audio/mp3"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											if (e.target.files && e.target.files.length > 0) {
												setSelectedSong(e.target.files[0]);
												setFieldValue("song", e.target.files[0]);
											}
										}}
									/>
									{selectedSong && (
										<button onClick={playSong}>play song</button>
									)}
								</div>

								<div>
									<label htmlFor="image">Upload cover image*: </label>
									<input
										type="file"
										name="coverImage"
										id="image"
										accept="image/jpg, image/jpeg, image/png"
										onChange={(e) => {
											if (e.target.files && e.target.files.length > 0) {
												setSelectedImage(e.target.files[0]);
												setFieldValue("coverImage", e.target.files[0]);
											}
										}}
									/>
									{selectedImage && (
										<Box sx={{ width: 1, height: 1, mt: 2 }}>
											<img
												src={URL.createObjectURL(selectedImage)}
												style={{ width: "100%", height: "100%" }}
												alt="Thumb"
											/>
										</Box>
									)}
								</div>
								<LoadingButton
									loading={isSubmitting}
									type="submit"
									variant="contained"
									fullWidth
									disableElevation
								>
									Submit
								</LoadingButton>
							</Stack>
						)}
					</Formik>
					{/* </div> */}
				</DialogContent>
				<DialogActions>
					<Button variant="contained" color="warning" onClick={handleClose}>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default UploadSongForm;
