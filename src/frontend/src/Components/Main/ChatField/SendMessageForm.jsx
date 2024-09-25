import React, { useState } from 'react';
import './SendMessageForm.css';
import EmojiPicker from 'emoji-picker-react';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import IconButton from '@mui/material/IconButton';

const SendMessageForm = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSendMessage(message);
        setMessage('');
    };

    const handleEmojiClick = (emojiData) => {
        setMessage((prevMessage) => prevMessage + emojiData.emoji);
    };

    return (
        <form onSubmit={handleSendMessage} style={{display: "flex", padding: "10px", position: "relative"}}>
            <Stack 
                direction="row" 
                spacing={1}
                sx={{ width: '100%' }}
            >
            <TextField 
                fullWidth
                id="outlined-basic" 
                variant="outlined" 
                placeholder="Написать сообщение..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                // style={{width: "-webkit-fill-available"}}
            />
            <IconButton type="button" onClick={() => setShowEmojiPicker((prev) => !prev)}>
                <EmojiEmotionsIcon fontSize={'large'}/>
            </IconButton >
            {showEmojiPicker && (
                <div className="emoji-picker-container">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}
                <Button variant="contained" type="submit" onClick={() => setShowEmojiPicker(false)}><SendIcon/></Button>
            </Stack>
        </form>
    );
};

export default SendMessageForm;
