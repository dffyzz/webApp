// ChatRoomList.js
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'
import axiosInstance from '../../axiosConfig';
import createSocketConnection from '../../sockJsConfig';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

const ChatRoomList = ({ userEmail, onSelectRoom, search }) => {
    const [chatRooms, setChatRooms] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [email, setEmail] = useState(false);

    const getUserEmail = () => {
        const token = Cookies.get('access_token');
        const email = jwtDecode(token).sub;
        setEmail(email);
    };

    useEffect(() => {
        setEmail(userEmail);
    }, [userEmail]);

    useEffect(() => {
        if (!email) return;

        // console.log("ChatRoomList");
        // console.log(email);
        fetchChatRooms();

        const client = createSocketConnection();
        client.connect({}, () => {
            client.subscribe(`/topic/${email}/update`, onChatUpdate);
            setStompClient(client);
        }, onError);

        return () => {
            if (stompClient) {
                stompClient.disconnect(() => {
                    // console.log('Disconnected from WebSocket');
                });
            }
        };
    }, [email]);

    const fetchChatRooms = async () => {
        try {
            const token = Cookies.get('access_token');
            const response = await axiosInstance.get('/api/v1/chatrooms', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setChatRooms(response.data);
        } catch (error) {
            console.error('Error fetching chat rooms:', error);
        }
    };

    const onChatUpdate = (message) => {
        fetchChatRooms();
    };

    const onError = (error) => {
        console.error('Could not connect to WebSocket server. Please refresh this page to try again!', error);
    };

    const filteredRooms = chatRooms.filter(room =>
        room.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <List style={{overflowY: "auto"}} > 
            {filteredRooms.map(room => (
                <ListItem alignItems="flex-start" button
                    key={room.id}
                    onClick={() => onSelectRoom(room)}
                >
                    <ListItemText 
                        primary={room.name} 
                        secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                Username
                              </Typography>
                              {" — something"}
                            </React.Fragment>
                          }
                    />
                </ListItem >
            ))}
        </List >
    );
};

export default ChatRoomList;
