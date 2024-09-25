import React, { useState, useEffect  } from 'react';
import './ChatField.css';
import MessageContainer from './MessageContainer';
import SendMessageForm from './SendMessageForm';
import axiosInstance from '../../axiosConfig';
import createSocketConnection from '../../sockJsConfig';
import { Box, IconButton, Typography, Button, Modal } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import Cookies from 'js-cookie';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    // width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
  };

  function ChildModal() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };

    return (
        <React.Fragment>
          <Button onClick={handleOpen}>Open Child Modal</Button>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="child-modal-title"
            aria-describedby="child-modal-description"
          >
            <Box sx={{ ...style, width: 200 }}>
              <h2 id="child-modal-title">Text in a child modal</h2>
              <p id="child-modal-description">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              </p>
              <Button onClick={handleClose}>Close Child Modal</Button>
            </Box>
          </Modal>
        </React.Fragment>
      );
    }



const ChatField = ({ selectedRoom, senderEmail, onUserRemoved, onRefresh, isAdmin, onRoomDeleted }) => {
    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [open, setOpen] = React.useState(false);

    useEffect(() => {
        if (selectedRoom) {
            const client = createSocketConnection();
            client.connect({}, () => {
                client.subscribe(`/topic/chat/${selectedRoom.id}`, onMessageReceived);
                client.subscribe(`/topic/chat/${selectedRoom.id}/update`, onUserRemovedMessage);
                client.subscribe(`/topic/${senderEmail}/update`, onChatUpdate);
                // setStompClient(client);
            }, onError);
            setStompClient(client);

            fetchMessages(selectedRoom.id);
        }

        return () => {
            if (stompClient) {
                stompClient.disconnect(() => {
                    // console.log('Disconnected from WebSocket');
                });
            }
        };
    }, [selectedRoom]);

    const fetchMessages = async (chatRoomId) => {
        try {
            const response = await axiosInstance.get(`/api/v1/messages/${chatRoomId}`);
            // if (response.status !== 200) {
            //     console.log("ВЫЙДИ");
            // }
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const onConnected = () => {
        if (stompClient && selectedRoom) {
            stompClient.subscribe(`/topic/chat/${selectedRoom.id}`, onMessageReceived);
            stompClient.subscribe(`/topic/chat/${selectedRoom.id}/update`, onUserRemovedMessage);
        }
    };

    const onError = (error) => {
        console.error('Could not connect to WebSocket server. Please refresh this page to try again!', error);
    };

    const onMessageReceived = (payload) => {
        const message = JSON.parse(payload.body);
        setMessages(prevMessages => [...prevMessages, message]);
    };

    const onChatUpdate = (e) => {
        const message = JSON.parse(e.body);
        // console.log(`message ${message}`)
        if (message === `refresh`) {
            onRefresh();
        }
    };

    const onUserRemovedMessage  = (payload) => {
        const removedUserEmail = JSON.parse(payload.body);
        // console.log(`Received user removed message: ${removedUserEmail}`);
        if (removedUserEmail === `remove ${senderEmail}`) {
            alert('Вас исключили из чата.');
            setMessages([]);
            if (typeof onUserRemoved === 'function') {
                onUserRemoved();
            }
        }
        if (removedUserEmail === `delete`){
            setMessages([]);
            if (typeof onRefresh === 'function') {
                onUserRemoved();
            }
        }
    };

    const handleSendMessage = (message) => {
        if (stompClient && selectedRoom) {
            const chatMessage = {
                chatRoomId: selectedRoom.id,
                content: message,
                nickname: senderEmail,
                time: new Date().toISOString()
            };
            stompClient.send(`/app/send/${selectedRoom.id}`, {}, JSON.stringify(chatMessage));
        }
    };

    if (!selectedRoom) {
        return (
            <div className="chat-field">
                <h2>Выберите комнату</h2>
            </div>
        );
    }

    
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleQuitChat = async () => {
        try {
            const token = Cookies.get('access_token');
            await axiosInstance.post(`/api/v1/chatrooms/${selectedRoom.id}/quit`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            onRoomDeleted();
            handleClose();
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    };

    const handleDeleteRoom = async () => {
        try {
            const token = Cookies.get('access_token');
            await axiosInstance.delete(`/api/v1/chatrooms/${selectedRoom.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            onRoomDeleted();
            handleClose();
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    };

    return (
        // <div className="chat-field">
        <Box component="div" sx={{ 
            overflowY: 'auto', p: 1, 
            minWidth: { xs: 1, sm: 1, md: 3/4 }, 
            maxWidth: { xs: '100vw', sm: '100vw', md: 3/4 }, 
            height: `calc(100vh - 47px)` }}>
                <Box display={'flex'}>
                    <Typography
                        sx={{ display: 'flex', 'flex-direction': 'column', margin: 'auto' }}
                        // component="span"
                        // variant="body2"
                        color="text.primary"
                    >
                        <h2>{selectedRoom.name}</h2>
                        <p>{selectedRoom.book} - {selectedRoom.author}</p>
                    </Typography>
                    <IconButton sx={{width: 60,borderRadius: 0,}} onClick={() => { handleOpen()}}><MoreVertIcon/></IconButton>
                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="parent-modal-title"
                    >
                        <Box sx={{ ...style }}>
                            <h2 id="parent-modal-title" style={{'text-align': 'center'}}>Опции</h2>
                            <Box display={'flex'} flexDirection={'column'}>
                                { isAdmin && (<Box ><IconButton onClick={handleDeleteRoom}><DeleteIcon sx={{fontSize: 30}}/></IconButton>Удалить</Box>)}
                                <Box><IconButton onClick={handleQuitChat} ><LogoutIcon sx={{fontSize: 30}}/></IconButton>Выйти</Box>
                            {/* <ChildModal /> */}
                            </Box>
                        </Box>
                    </Modal>
                </Box>
                <MessageContainer messages={messages} senderEmail={senderEmail} />
                <SendMessageForm onSendMessage={handleSendMessage} />
        </Box>
    );
};

export default ChatField;
