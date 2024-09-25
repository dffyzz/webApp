package com.example.web.chatroom;

import com.example.web.user.User;
import com.example.web.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatRoom createChatRoom(CreateChatRoomRequestDTO chatRoomRequestDTO, Principal principal) {
        User user = userRepository.findByNickname(principal.getName()).orElseThrow();
        ChatRoom chatRoom = ChatRoom.builder()
                .name(chatRoomRequestDTO.getName())
                .book(chatRoomRequestDTO.getBook())
                .author(chatRoomRequestDTO.getAuthor())
                .password(chatRoomRequestDTO.getPassword())
                .admins(List.of(user))
                .users(List.of())
                .build();
        messagingTemplate.convertAndSend("/topic/" + user.getNickname() + "/update", "refresh");
        return chatRoomRepository.save(chatRoom);
    }

    public ChatRoom addUserToChatRoom(Long chatRoomId, String nickname) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId).orElseThrow();
        User user = userRepository.findByNickname(nickname).orElseThrow();
        if (chatRoom.getAdmins().contains(user) || chatRoom.getUsers().contains(user)) {
            return chatRoomRepository.save(chatRoom);
        }
        chatRoom.getUsers().add(user);

        messagingTemplate.convertAndSend("/topic/" + nickname + "/update", "refresh");
        messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId + "/update", "members");
//        System.out.println("User added to chat: " + nickname);
        return chatRoomRepository.save(chatRoom);
    }

    public void removeUserFromChat(Long chatRoomId, String nickname) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        User user = userRepository.findByNickname(nickname)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (chatRoom.getAdmins().contains(user)) {
            chatRoom.getAdmins().remove(user);
        }
        else{
            chatRoom.getUsers().remove(user);
        }
        chatRoomRepository.save(chatRoom);

        messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId + "/update", "remove " + nickname);
        messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId + "/update", "members");
        messagingTemplate.convertAndSend("/topic/" + nickname + "/update", "refresh");
//        System.out.println("User removed from chat: " + nickname);
    }

    public ChatRoom promoteUserToAdmin(Long chatRoomId, String email, Principal principal) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId).orElseThrow();
        User currentUser = userRepository.findByNickname(principal.getName()).orElseThrow();
        if (!chatRoom.getAdmins().contains(currentUser)) {
            throw new RuntimeException("You cant");
        }
        User user = userRepository.findByNickname(email).orElseThrow();
        chatRoom.getAdmins().add(user);
        return chatRoomRepository.save(chatRoom);
    }

    public ChatRoom demoteAdminToUser(Long chatRoomId, String nickname, Principal principal) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId).orElseThrow();
        User currentUser = userRepository.findByNickname(principal.getName()).orElseThrow();
        if (!chatRoom.getAdmins().contains(currentUser)) {
            throw new RuntimeException("You cant");
        }
        User user = userRepository.findByNickname(nickname).orElseThrow();
        chatRoom.getAdmins().remove(user);
        return chatRoomRepository.save(chatRoom);
    }

    public void changeUserRole(Long chatRoomId, String nickname, Principal principal) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chatroom not found"));
        User user = userRepository.findByNickname(nickname)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User currentUser = userRepository.findByNickname(principal.getName()).orElseThrow();
        if (!chatRoom.getAdmins().contains(currentUser)) {
            throw new RuntimeException("You cant");
        }
        if (chatRoom.getAdmins().contains(user)) {
            chatRoom.getAdmins().remove(user);
            chatRoom.getUsers().add(user);
        } else if (chatRoom.getUsers().contains(user)) {
            chatRoom.getUsers().remove(user);
            chatRoom.getAdmins().add(user);
        }
        messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId + "/update", "members");
        chatRoomRepository.save(chatRoom);
    }

    public List<UserDTO> getUsersInChatroom(Long chatroomId) {
        ChatRoom chatroom = chatRoomRepository.findById(chatroomId)
                .orElseThrow(() -> new RuntimeException("Chatroom not found"));
        return chatroom.getUsers().stream()
                .map(user -> new UserDTO(user.getNickname()))
                .collect(Collectors.toList());
    }

    public List<UserDTO> getAdminsInChatroom(Long chatRoomId) {
        ChatRoom chatroom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chatroom not found"));
        return chatroom.getAdmins().stream()
                .map(user -> new UserDTO(user.getNickname()))
                .collect(Collectors.toList());
    }

    public List<UserDTO> getUsersNotInChatRoom(Long chatRoomId) {
        return userRepository.findAllUsersNotInChatRoom(chatRoomId).stream()
                .map(user -> new UserDTO(user.getNickname()))
                .collect(Collectors.toList());
    }

    public ChatRoom connectToChatRoom(Long chatRoomId, String password, Principal principal) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId).orElseThrow();
        if (chatRoom.isPasswordProtected() && !chatRoom.checkPassword(password)) {
            throw new RuntimeException("Invalid password");
        }
        User user = userRepository.findByNickname(principal.getName()).orElseThrow();
        if (chatRoom.getAdmins().contains(user) || chatRoom.getUsers().contains(user)) {
            return chatRoomRepository.save(chatRoom);
        }
        chatRoom.getUsers().add(user);

        messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId + "/update", "members");
        messagingTemplate.convertAndSend("/topic/" + user.getNickname() + "/update", "refresh");

        return chatRoomRepository.save(chatRoom);
    }

    public List<ChatRoom> findAvailableChatRooms(Principal principal) {
        User user = userRepository.findByNickname(principal.getName()).orElseThrow();
        return chatRoomRepository.findChatRoomsWhereUserNotMember(user);
    }

    public void deleteChatRoom(Long chatRoomId, Principal principal) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId).orElseThrow(() -> new RuntimeException("Chatroom not found"));
        User currentUser = userRepository.findByNickname(principal.getName()).orElseThrow();
        if (!chatRoom.getAdmins().contains(currentUser)) {
            throw new RuntimeException("You cant");
        }
        chatRoom.getUsers().forEach(user -> {
            messagingTemplate.convertAndSend("/topic/" + user.getNickname() + "/update", "remove " + user.getNickname());
        });

        chatRoom.getAdmins().forEach(admin -> {
            messagingTemplate.convertAndSend("/topic/" + admin.getNickname() + "/update", "remove " + admin.getNickname());
        });
        messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId + "/update", "delete");
        chatRoomRepository.delete(chatRoom);
    }

    public void quitChatRoom(Long chatRoomId, Principal principal) {
        User currentUser = userRepository.findByNickname(principal.getName()).orElseThrow();
        removeUserFromChat(chatRoomId, currentUser.getNickname());
    }

}
