package com.library.dto.book;

import com.library.entity.Book;

import java.util.Set;
import java.util.stream.Collectors;

public record BookResponse(
        Long id,
        String title,
        String author,
        String isbn,
        int totalCopies,
        int availableCopies,
        Set<String> categories
) {
    public static BookResponse from(Book book) {
        return new BookResponse(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getIsbn(),
                book.getTotalCopies(),
                book.getAvailableCopies(),
                book.getCategories().stream().map(c -> c.getName()).collect(Collectors.toSet())
        );
    }
}
