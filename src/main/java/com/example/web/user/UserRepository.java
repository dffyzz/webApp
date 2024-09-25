package com.example.web.user;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Integer> {
  Optional<User> findByNickname(String nickname);

  @Query("SELECT u FROM User u WHERE u.id NOT IN " +
          "(SELECT u.id FROM ChatRoom c JOIN c.users u WHERE c.id = :chatRoomId) " +
          "AND u.id NOT IN " +
          "(SELECT u.id FROM ChatRoom c JOIN c.admins u WHERE c.id = :chatRoomId)")
  List<User> findAllUsersNotInChatRoom(Long chatRoomId);
}
