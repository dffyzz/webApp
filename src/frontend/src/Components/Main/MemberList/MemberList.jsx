import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import './MemberList.css';
import axiosInstance from '../../axiosConfig';
import createSocketConnection from '../../sockJsConfig';
import { List, ListItemText, Typography, ListItemButton, Box, TextField, IconButton, Modal, ListItem, Button } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
    maxHeight: '450px',
  };

const MemberList = ({ selectedRoom, currentUser, onRoomDeleted, onChangeAdmin }) => {
    const [members, setMembers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSelectedUserAdmin, setIsSelectedUserAdmin] = useState(false);
    const [stompClient, setStompClient] = useState(null);
    const [searchUser, setSearchUser] = useState('');
    const [users, setUsers] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [openUser, setOpenUser] = React.useState(false);

    useEffect(() => {
        if (selectedRoom) {
            setAdmins([]);
            setMembers([]);
            fetchMembers();
            connectWebSocket();
        }

        return () => {
            if (stompClient) {
                stompClient.disconnect(() => {
                    // console.log('Disconnected from WebSocket');
                });
            }
        };
    }, [selectedRoom]);

    const connectWebSocket = () => {
        const client = createSocketConnection();
        client.connect({}, () => {
            client.subscribe(`/topic/chat/${selectedRoom.id}/update`, onUpdate);
            setStompClient(client);
        }, onError);
    };

    const onUpdate = (payload) => {
        const message = JSON.parse(payload.body);
        if (message === `members`) {
            fetchMembers();
        }
    };

    const onError = (error) => {
        console.error('Could not connect to WebSocket server. Please refresh this page to try again!', error);
    };

    const fetchMembers = async () => {
        try {
            const token = Cookies.get('access_token');
            const response = await axiosInstance.get(`/api/v1/chatrooms/${selectedRoom.id}/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMembers(response.data.users);
            setAdmins(response.data.admins);
            const isCurrentUserAdmin = response.data.admins.some(admin => admin.nickname === currentUser);
            onChangeAdmin(isCurrentUserAdmin);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const fetchExcludedUsers = async () => {
        try {
            const token = Cookies.get('access_token');
            const response = await axiosInstance.get(`/api/v1/chatrooms/${selectedRoom.id}/excludedUsers`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleAddUser = async (nickname) => {
        try {
            const token = Cookies.get('access_token');
            await axiosInstance.post(`/api/v1/chatrooms/${selectedRoom.id}/addUser`, null, {
                params: { nickname: nickname },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error adding user:', error);
        }
        fetchExcludedUsers();
        fetchMembers();
    };

    const handleRemoveUser = async (nickname) => {
        try {
            const token = Cookies.get('access_token');
            await axiosInstance.post(`/api/v1/chatrooms/${selectedRoom.id}/removeUser`, null, {
                params: { nickname: nickname },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error removing user:', error);
        }
        fetchMembers();
    };

    const handleChangeRole = async (nickname) => {
        try {
            const token = Cookies.get('access_token');
            await axiosInstance.post(`/api/v1/chatrooms/${selectedRoom.id}/changeRole`, null, {
                params: {  nickname },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error changing role:', error);
        }
        fetchMembers();
    };

    const isCurrentUserAdmin = admins.some(admin => admin.nickname === currentUser);

    if (!selectedRoom) {
        return <div className="member-list"><h3>Выберите комнату, чтобы увидеть пользователей</h3></div>;
    }

    const handleClickClear = () => {
        setSearchUser("");
    }

    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    }

    const handleOpenUser = () => {
        setOpenUser(true);
    }
    const handleCloseUser = () => {
        setOpenUser(false);
    }
    
    return (
        <Box component="div" sx={{ overflowY: 'auto', p: 1, minWidth: 1/4, display: { xs: 'none', sm: 'none', md: 'block' } }}>
            <Box
                    display="flex"
                    alignItems="center"
                >
                <TextField 
                    fullWidth 
                    placeholder="Поиск пользователя" 
                    id="fullWidth" 
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    InputProps={{
                        endAdornment: (<IconButton 
                                            onClick={handleClickClear} 
                                            sx={{visibility: searchUser ? "visible" : "hidden"}}>
                                            <ClearIcon/>
                                        </IconButton>)
                    }}
                />
                { isCurrentUserAdmin && (<IconButton 
                    onClick={ () => { fetchExcludedUsers(); handleOpen(); }}
                > <AddIcon fontSize={'large'}/> 
                </IconButton>)}
            </Box>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                padding="0px"
            >
                <Box sx={style} style={{height: "100%", width:'300px'}}>
                <TextField
                        fullWidth
                        style={{'margin-top': "6px"}}
                        type="text"
                        placeholder="Поиск пользователя..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Box sx={{ height: "calc(100% - 20px)" }}>   
                    {/* padding: "10px", height: "-webkit-fill-available" */}
                    <List style={{overflowY: "auto", height: "calc(100% - 20px)" }} dense={true}>
                        {users.filter(user=>user.nickname.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                            <ListItem 
                                alignItems="flex-start" 
                                button
                                style={{padding: 4}}
                                key={user.nickname}
                                onClick={() => {handleAddUser(user.nickname); fetchExcludedUsers();}}
                            >
                                <ListItemText primaryTypographyProps={{fontSize: '18px'}}
                                    primary={user.nickname} 
                                />
                            </ListItem>
                        ))}
                    </List>
                    </Box>
                </Box>
            </Modal>
            <Modal
                open={openUser}
                onClose={handleCloseUser}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                padding="0px"
            >
                <Box sx={style} style={{ width:'300px', display: "flex", 'flex-direction': 'column', 'align-items': 'center'}}>
                    <Typography variant="h5" gutterBottom>{selectedUser}</Typography>
                    <Box display={'flex'} flexDirection={'column'} gap={1}>
                        <Button variant="contained" onClick={() => { handleChangeRole(selectedUser); handleCloseUser(); }}>
                            {isSelectedUserAdmin ? 'Снять права администратора' : 'Дать права администратора'}
                        </Button>
                        <Button variant="contained" onClick={() => { handleRemoveUser(selectedUser); handleCloseUser(); }}>
                            Удалить пользователя
                        </Button>
                    </Box>
                </Box>
            </Modal>
            <Typography variant="subtitle1" fontWeight='bold' textTransform='uppercase' textAlign='left' >Администраторы</Typography>
            <List >
                {admins.filter(user=>user.nickname.toLowerCase().includes(searchUser.toLowerCase())).map(admin => (
                    <ListItemButton
                        alignItems="flex-start" 
                        style={{padding: 4}}
                        key={admin.nickname} 
                        button={isCurrentUserAdmin && admin.nickname!==currentUser}
                        onClick={() => {
                            if (isCurrentUserAdmin && admin.nickname !== currentUser) {
                                handleOpenUser();
                                setSelectedUser(admin.nickname);
                                setIsSelectedUserAdmin(true);
                            }
                        }}
                        >
                            <ListItemText 
                                primary={admin.nickname}
                            />
                    </ListItemButton>
                ))}
            </List>
            <Typography variant="subtitle1" fontWeight='bold' textTransform='uppercase' textAlign='start'>Пользователи</Typography>
            <List>
                {members.filter(user=>user.nickname.toLowerCase().includes(searchUser.toLowerCase())).map(member => (
                    <ListItemButton 
                        alignItems="flex-start" 
                        style={{padding: 4}}
                        key={member.nickname} 
                        button={isCurrentUserAdmin}
                        onClick={() => {
                            if (isCurrentUserAdmin && member.nickname !== currentUser) {
                                handleOpenUser();
                                setSelectedUser(member.nickname);
                                setIsSelectedUserAdmin(false);
                            }
                        }}
                        >
                            <ListItemText 
                                primary={member.nickname}
                            />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
};

export default MemberList;
