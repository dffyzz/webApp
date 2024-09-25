package com.example.web.chatroom;

import com.example.web.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    List<ChatRoom> findByUsers(User user);

//    List<ChatRoom> findByDescription(String keyword);
    @Query("SELECT c FROM ChatRoom c WHERE :user NOT MEMBER OF c.users AND :user NOT MEMBER OF c.admins")
    List<ChatRoom> findByUsersNotContains(@Param("user") User user);

    @Query("SELECT c FROM ChatRoom c WHERE :user MEMBER OF c.users OR :user MEMBER OF c.admins")
    List<ChatRoom> findByUsersContains(@Param("user") User user);
    @Query("SELECT c FROM ChatRoom c LEFT JOIN c.users u LEFT JOIN c.admins a WHERE :user NOT IN (u, a)")
    List<ChatRoom> findChatRoomsWhereUserNotMember(@Param("user") User user);

}