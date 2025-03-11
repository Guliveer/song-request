import * as React from 'react';
import {Box,TextField,Stack,Button} from '@mui/material';



export default function AddSongForm() {
    return (
        <Box
            sx={{
                border: "2px solid green",
                borderRadius: "8px",
                padding: 2,
                maxWidth: "600px",
                margin: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <h1>Add Song Request</h1>
            <br />
            <Box
                component="form"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    gap: 2,
                    padding: 1,
                }}

            >
                {/* Kontener dla pól Title i Artist w proporcji 2:1 */}
                <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                    <TextField
                        id="title"
                        label="Title"
                        variant="outlined"
                        fullWidth
                        sx={{
                            flex: 2, // Title zajmuje 2/3 szerokości
                            '& label.Mui-focused': { color: 'green' },
                            '& .MuiOutlinedInput-root': {'&.Mui-focused fieldset': { borderColor: 'green',borderRadius: "20px" },
                            },
                        }}

                    />
                    <TextField
                        id="artist"
                        label="Artist"
                        variant="outlined"
                        fullWidth
                        sx={{
                            flex: 1, // Artist zajmuje 1/3 szerokości
                            '& label.Mui-focused': { color: 'green' },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: 'green',borderRadius: "20px" },
                            },
                        }}

                    />
                </Box>

                {/* URL na pełną szerokość Title + Artist */}
                <TextField
                    id="url"
                    label="URL"
                    variant="outlined"
                    fullWidth
                    sx={{
                        '& label.Mui-focused': { color: 'green' },
                        '& .MuiOutlinedInput-root': {'&.Mui-focused fieldset': { borderColor: 'green',borderRadius: "20px" },},

                    }}

                />

                {/* Przycisk wyśrodkowany pod polem URL */}
                <Stack direction="row" justifyContent="center" sx={{ width: "100%", marginTop: 2 }}>
                    <Button type="submit" variant="contained" sx={{ backgroundColor: "green", color: "white", "&:hover": { backgroundColor: "darkgreen" }, borderRadius: "20px", }}>
                        Add
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}
