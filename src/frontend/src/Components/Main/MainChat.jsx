import React, { useState, useEffect  } from 'react';
import ChatRoomList from './ChatList/ChatRoomList';
import ChatField from './ChatField/ChatField';
import MemberList from './MemberList/MemberList';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import { TextField, IconButton, Icon, Box, Modal, Typography, Tabs, Tab, List, ListItem, ListItemText, Button } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    maxHeight: '450px',
};

function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
}

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <Box
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
        sx={{ padding: "0px" }}
      >
        {value === index && <Box sx={{ height: "calc(100% - 8px)" }}>{children}</Box>}
      </Box>
    );
  }

const MainChat = () => {
    const [chatRooms, setChatRooms] = useState([]);
    const [availableChatRooms, setAvailableChatRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [email, setEmail] = useState(false);
    const [searchRoom, setSearchRoom] = useState('');
    const [isAdmin, setIsAdmin] = useState(false)

    const fetchChatRooms = async () => {
        const token = Cookies.get('access_token');
        try {
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

    const fetchAvailableChatRooms = async () => {
        const token = Cookies.get('access_token');
        try {
            const response = await axiosInstance.get('/api/v1/chatrooms/not-in', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAvailableChatRooms(response.data);
        } catch (error) {
            console.error('Error fetching available chat rooms:', error);
        }
    };
    
    const navigate = useNavigate();

    useEffect(() => {
        if (!(Cookies.get('access_token'))) {
            navigate('/login')
        }
        else{
            getUserEmail().then(fetchChatRooms);
        }
    }, []);

    const handleCreateChat = async (chatName, chatBook, bookAuthor, chatPassword) => {
        const token = Cookies.get('access_token');
        try {
            await axiosInstance.post('/api/v1/chatrooms', {
                name: chatName,
                book: chatBook,
                author: bookAuthor,
                password: chatPassword
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchChatRooms();
            handleUpdateChatRooms();
        } catch (error) {
            console.error('Error creating chat room:', error);
        }
    };

    const handleJoinChat = async (chatRoomId, password = '') => {
        const token = Cookies.get('access_token');
        try {
            await axiosInstance.post(`/api/v1/chatrooms/${chatRoomId}/connect`, null, {
                params: { password },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchChatRooms();
        } catch (error) {
            console.error('Error joining chat room:', error);
        }
    };

    const getUserEmail = async () => {
        const token = Cookies.get('access_token');
        const email = jwtDecode(token).sub;
        setEmail(email);
    };

    const handleRoomDeleted = () => {
        setSelectedRoom(null);
        fetchChatRooms();
    };

    const handleUserRemoved = () => {
        setSelectedRoom(null);
        fetchChatRooms();
    };

    const handleUpdateChatRooms = () => {
        fetchChatRooms();
    };

    const handleClickClear = () => {
        setSearchRoom("");
    }

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredRooms = availableChatRooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.book.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleJoin = (roomId, isPasswordProtected) => {
        if (isPasswordProtected) {
            const enteredPassword = prompt("Введите пароль для комнаты:");
            handleJoinChat(roomId, enteredPassword);
            handleClose();
        } else {
            const confirmJoin = window.confirm("Вы уверены, что хотите присоединиться к этой комнате?");
            if (confirmJoin) {
                handleJoinChat(roomId, '');
                handleClose();  
            }
        }
    };

    const [formData, setFormData] = useState({
        chatName: '',
        chatBook: '',
        bookAuthor: '',
        chatPassword: '',
    });

    const handleChangeForm = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.chatName.trim()) {
            // setError('Имя комнаты не может быть пустым');
            return;
        }
        handleCreateChat(formData.chatName.trim(), formData.chatBook.trim(), formData.bookAuthor.trim(), formData.chatPassword.trim());
    };

    const handleChangeAdmin = (value) => {
        setIsAdmin(value)
    }

    return (
        <Box component="div" display="flex"
            sx={{
                bgcolor: 'background.paper', 
                height: "calc(100vh - 47px)", 
                width: "100vw",
            }}
        >
            <Box component="div" 
                sx={{ 
                    overflow: 'auto', 
                    p: 1, 
                    minWidth: 1/4, 
                    display: { xs: 'none', sm: 'none', md: 'block' }
                }}  
            >
                <Box
                    display="flex"
                    alignItems="center"
                >
                <TextField 
                    fullWidth 
                    placeholder="Поиск" 
                    id="fullWidth" 
                    value={searchRoom}
                    onChange={(e) => setSearchRoom(e.target.value)}
                    InputProps={{
                        endAdornment: (<IconButton 
                                            onClick={handleClickClear} 
                                            sx={{visibility: searchRoom ? "visible" : "hidden"}}>
                                            <ClearIcon/>
                                        </IconButton>)
                    }}
                />
                <IconButton 
                    onClick={ () => {fetchAvailableChatRooms(); handleOpen()}}
                > <AddIcon fontSize={'large'}/> 
                </IconButton>
                </Box>
                <ChatRoomList userEmail={email} onSelectRoom={setSelectedRoom} search={searchRoom}/>
                
            </Box>
            <Box component="div" display="flex"
                sx={{ minWidth: { xs: 1, sm: 1, md: 'calc(100vw - 25%)' } }}
            >
                <ChatField selectedRoom={selectedRoom} senderEmail={email} onUserRemoved={handleUserRemoved} onRefresh={handleUpdateChatRooms} isAdmin={isAdmin} onRoomDeleted={handleRoomDeleted}/>
                <MemberList selectedRoom={selectedRoom} currentUser={email} onRoomDeleted={handleRoomDeleted} onChangeAdmin={handleChangeAdmin}/>
            </Box>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                padding="0px"
            >
                <Box sx={style} style={{height: "100%"}}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" variant="fullWidth">
                        <Tab label="присоединиться" {...a11yProps(0)} />
                        <Tab label="создать" {...a11yProps(1)} />
                    </Tabs>
                    <CustomTabPanel value={value} index={0} style={{height: "calc(100% - 56px)"}}>
                        
                        <TextField
                            fullWidth
                            style={{'margin-top': "6px"}}
                            type="text"
                            placeholder="Поиск комнаты..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Box sx={{ height: "calc(100% - 8px)" }}>   
                        {/* padding: "10px", height: "-webkit-fill-available" */}
                        <List style={{overflowY: "auto", height: "calc(100% - 8px)" }} dense={true}>
                            {filteredRooms.map(room => (
                                <ListItem 
                                    alignItems="flex-start" 
                                    button
                                    style={{padding: 4}}
                                    key={room.id}
                                    onClick={() => handleJoin(room.id, room.passwordProtected)}
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
                                                {room.book} — {room.author}
                                            </Typography>
                                                {room.passwordProtected && (
                                                    <Icon><LockIcon/></Icon>
                                                )} 
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                        </Box>
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1}>
                        <form onSubmit={handleSubmit} style={{'margin-top': "6px", display: "flex", 'flex-direction': "column", gap: "10px"}}>
                            <TextField
                                fullWidth
                                type="text"
                                name="chatName"
                                value={formData.chatName}
                                onChange={handleChangeForm}
                                placeholder="Имя комнаты"
                            />
                            <TextField
                                fullWidth
                                type="text"
                                name="chatBook"
                                value={formData.chatBook}
                                onChange={handleChangeForm}
                                placeholder="Название книги"
                            />
                            <TextField
                                fullWidth
                                type="text"
                                name="bookAuthor"
                                value={formData.bookAuthor}
                                onChange={handleChangeForm}
                                placeholder="Автор книги"
                            />
                            <TextField
                                fullWidth
                                type="password"
                                name="chatPassword"
                                value={formData.chatPassword}
                                onChange={handleChangeForm}
                                placeholder="Пароль (опционально)"
                            />
                            {/* {error && <div style={{ color: 'red' }}>{error}</div>} */}
                            <Button type="submit" variant="contained" >Создать</Button>
                        </form>
                    </CustomTabPanel>
                </Box>
            </Modal>
        </Box>
    );
};

export default MainChat;
