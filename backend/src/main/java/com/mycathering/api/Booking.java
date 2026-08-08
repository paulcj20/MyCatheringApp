package com.mycathering.api;

public class Booking {

    private String id;

    private String clientName;
    private String email;
    private String eventDate; // Firestore stores as String for simplicity or we convert
    private String eventTime;
    private Integer guestCount;
    private String eventType; // Wedding, Corporate, etc.
    private String message;

    public Booking() {
    }

    public Booking(String clientName, String email, String eventDate, String eventTime, Integer guestCount,
            String eventType, String message) {
        this.clientName = clientName;
        this.email = email;
        this.eventDate = eventDate;
        this.eventTime = eventTime;
        this.guestCount = guestCount;
        this.eventType = eventType;
        this.message = message;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEventDate() {
        return eventDate;
    }

    public void setEventDate(String eventDate) {
        this.eventDate = eventDate;
    }

    public String getEventTime() {
        return eventTime;
    }

    public void setEventTime(String eventTime) {
        this.eventTime = eventTime;
    }

    public Integer getGuestCount() {
        return guestCount;
    }

    public void setGuestCount(Integer guestCount) {
        this.guestCount = guestCount;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
