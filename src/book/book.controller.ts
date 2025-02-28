import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookService } from './book.service';
import { CreateBookDto } from './create.dto';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createBookDto: CreateBookDto, @Request() req: any) {
    const userId = req.user.id; // Attache l'utilisateur connecté
    return this.bookService.createBook(createBookDto, userId);
  }
}
