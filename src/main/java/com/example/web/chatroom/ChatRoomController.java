package com.example.web.chatroom;

import com.example.web.user.User;
import com.example.web.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/chatrooms")
@CrossOrigin(origins = "${application.config.host}")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    @PostMapping
    public ResponseEntity<ChatRoom> createChatRoom(
            @RequestBody CreateChatRoomRequestDTO createChatRoomRequestDTO,
            Principal principal) {
        return ResponseEntity.ok(chatRoomService.createChatRoom(createChatRoomRequestDTO, principal));
    }

    @GetMapping
    public ResponseEntity<List<ChatRoomDTO>> getUserChatRooms(Principal principal) {
        User currentUser = userRepository.findByNickname(principal.getName()).orElseThrow();
        List<ChatRoom> chatRooms = chatRoomRepository.findByUsersContains(currentUser);
        List<ChatRoomDTO> chatRoomDTOs = chatRooms.stream()
                .map(room -> new ChatRoomDTO(
                        room.getId(),
                        room.getName(),
                        room.getBook(),
                        room.getAuthor(),
                        room.isPasswordProtected()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(chatRoomDTOs);
    }
    @PostMapping("/{chatRoomId}/connect")
    public ResponseEntity<ChatRoom> connectToChatRoom(
            @PathVariable Long chatRoomId,
            @RequestParam(required = false) String password,
            Principal principal) {
        return ResponseEntity.ok(chatRoomService.connectToChatRoom(chatRoomId, password, principal));
    }


    @PostMapping("/{chatRoomId}/addUser")
    public ResponseEntity<ChatRoom> addUserToChatRoom(
            @PathVariable Long chatRoomId,
            @RequestParam String nickname
    ) {
        return ResponseEntity.ok(chatRoomService.addUserToChatRoom(chatRoomId, nickname));
    }
    @PostMapping("/{chatRoomId}/removeUser")
    public ResponseEntity<Void> removeUserFromChat(
            @PathVariable Long chatRoomId,
            @RequestParam String nickname
    ) {
        chatRoomService.removeUserFromChat(chatRoomId, nickname);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{chatRoomId}/promote")
    public ResponseEntity<ChatRoom> promoteUserToAdmin(
            @PathVariable Long chatRoomId,
            @RequestParam String nickname,
            Principal principal
    ) {
        return ResponseEntity.ok(chatRoomService.promoteUserToAdmin(chatRoomId, nickname, principal));
    }

    @PostMapping("/{chatRoomId}/demote")
    public ResponseEntity<ChatRoom> demoteAdminToUser(
            @PathVariable Long chatRoomId,
            @RequestParam String nickname,
            Principal principal
    ) {
        return ResponseEntity.ok(chatRoomService.demoteAdminToUser(chatRoomId, nickname, principal));
    }

    @PostMapping("/{chatRoomId}/changeRole")
    public ResponseEntity<Void> changeUserRole(
            @PathVariable Long chatRoomId,
            @RequestParam String nickname,
            Principal principal
    ) {
        chatRoomService.changeUserRole(chatRoomId, nickname, principal);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{chatroomId}/users")
    public ResponseEntity<Map<String, List<UserDTO>>> getUsersInChatroom(@PathVariable Long chatroomId) {
        List<UserDTO> users = chatRoomService.getUsersInChatroom(chatroomId);
        List<UserDTO> admins = chatRoomService.getAdminsInChatroom(chatroomId);
        Map<String, List<UserDTO>> response = new HashMap<>();
        response.put("users", users);
        response.put("admins", admins);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{chatRoomId}/excludedUsers")
    public ResponseEntity<List<UserDTO>> getUsersNotInChatRoom(@PathVariable Long chatRoomId) {
        return ResponseEntity.ok(chatRoomService.getUsersNotInChatRoom(chatRoomId));
    }

    @GetMapping("/not-in")
        public ResponseEntity<List<ChatRoomDTO>> getAvailableChatRooms(Principal principal) {
        User currentUser = userRepository.findByNickname(principal.getName()).orElseThrow();
        List<ChatRoom> availableChatRooms = chatRoomRepository.findByUsersNotContains(currentUser);
        List<ChatRoomDTO> chatRoomDTOs = availableChatRooms.stream()
                .map(room -> new ChatRoomDTO(
                        room.getId(),
                        room.getName(),
                        room.getBook(),
                        room.getAuthor(),
                        room.isPasswordProtected()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(chatRoomDTOs);
    }

    @DeleteMapping("/{chatRoomId}")
    public ResponseEntity<Void> deleteChatRoom(@PathVariable Long chatRoomId, Principal principal) {
        chatRoomService.deleteChatRoom(chatRoomId, principal);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{chatRoomId}/quit")
    public ResponseEntity<Void> quitChatRoom(@PathVariable Long chatRoomId, Principal principal) {
        chatRoomService.quitChatRoom(chatRoomId, principal);
        return ResponseEntity.ok().build();
    }
}