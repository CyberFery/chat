package com.inf5190.chat.messages.repository;
import com.google.cloud.Timestamp;
public class FirestoreMessage {
    private String id;
private String username;
private Timestamp timestamp;
private String text;
private String imageUrl;

public FirestoreMessage() {
}
public FirestoreMessage(String id, String username, Timestamp timestamp, String text, String imageUrl) {
    this.id = id;
    this.username = username;
this.timestamp = timestamp;
this.text = text;
this.imageUrl = imageUrl;
}
public String getId() {
    return id;
}
public String getUsername() {
return username;
}
public void setUsername(String username) {
this.username = username;
}
public Timestamp getTimestamp() {
return timestamp;
}
public void setTimestamp(Timestamp timestamp) {
this.timestamp = timestamp;
}
public String getText() {
return text;
}
public void setText(String text) {
this.text = text;
}
public String getImageUrl() {
return imageUrl;
}
}
