package com.example.web.user;

import com.example.web.chatroom.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "${application.config.host}")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;
    private final UserRepository userRepository;

    @PatchMapping("/password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Principal connectedUser
    ) {
        service.changePassword(request, connectedUser);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/name")
    public ResponseEntity<?> changeName(
            @RequestBody ChangeNameRequest request,
            Principal connectedUser
    ) {
        service.changeName(request, connectedUser);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/emails")
    public ResponseEntity<List<UserDTO>> getAllUserNicknames() {
        List<UserDTO> nicknames = service.getAllUserNicknames();
        return ResponseEntity.ok(nicknames);
    }

    @GetMapping("/user")
    public ResponseEntity<UserDTO> getUser(Principal principal) {
        User user = userRepository.findByNickname(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new UserDTO(user.getNickname()));
    }
}
