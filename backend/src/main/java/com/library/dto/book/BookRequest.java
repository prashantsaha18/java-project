package com.library.dto.book;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;

public record BookRequest(
        @NotBlank String title,
        @NotBlank String author,
        @NotBlank String isbn,
        @Min(1) int totalCopies,
        Set<String> categories
) {
}
