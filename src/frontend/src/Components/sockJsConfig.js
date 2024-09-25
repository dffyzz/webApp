import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const createSocketConnection = () => {
  const socket = new SockJS('http://localhost:8080/ws');
  const stompClient = Stomp.over(socket);
  stompClient.debug = () => {};
  return stompClient;
};

export default createSocketConnection;