package com.example.web.message;

import com.example.web.chatroom.ChatRoom;
import com.example.web.user.User;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "message")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(name = "LONG_TEXT", columnDefinition="TEXT")
    private String content;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User sender;
    @ManyToOne
    @JoinColumn(name = "chatroom_id")
    @JsonBackReference
    private ChatRoom chatRoom;

    private LocalDateTime timestamp;
}
