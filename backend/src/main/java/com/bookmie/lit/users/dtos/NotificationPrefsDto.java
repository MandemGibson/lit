package com.bookmie.lit.users.dtos;

public record NotificationPrefsDto(
    boolean secretUpdatesEnabled,
    boolean collabRequestsEnabled,
    boolean cliActivityEnabled) {
}
