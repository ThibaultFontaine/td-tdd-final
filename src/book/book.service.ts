import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookDto } from './create.dto';
import { Book } from './book.entity';
import { User } from '../user/user.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) // Injecte le repository Book
    private readonly booksRepository: Repository<Book>,

    @InjectRepository(User) // Injecte le repository User (si nécessaire)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Crée un nouveau livre en base de données
   * @param createBookDto Détails du livre à créer
   * @param user L'utilisateur connecté qui crée le livre
   */
  async createBook(createBookDto: CreateBookDto, user: User): Promise<Book> {
    try {
      // Crée un nouvel objet livre
      const book = this.booksRepository.create({
        ...createBookDto, // Utilise les données du DTO
        user, // Associe le livre à l'utilisateur connecté
      });

      // Sauvegarde le livre dans la base
      return await this.booksRepository.save(book);
    } catch (error) {
      console.error('Error creating a book:', error.message);
      throw new UnauthorizedException('Could not create the book.');
    }
  }
}
