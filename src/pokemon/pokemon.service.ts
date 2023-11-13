import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Model, isValidObjectId } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor (
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    try{
      createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    }catch(error){
      this.handleExceptions(error);
    }       
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    if(!isNaN(+term))
    {
      pokemon = await this.pokemonModel.findOne({no:term});
    }
    if(!pokemon && isValidObjectId(term))
    {
      pokemon = await this.pokemonModel.findById(term);
    }
    if(!pokemon)
    {
      pokemon = await this.pokemonModel.findOne({name:term})
    }
    if(!pokemon)
    throw new NotFoundException(`Pokemon with id, name or no ${term}`)
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    let pokemon = await this.findOne(term);
    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }
    try{
      await pokemon.updateOne(updatePokemonDto, {new:true})
      return {...pokemon.toJSON(),...updatePokemonDto};
    }
    catch(error){
      this.handleExceptions(error);
    }    
  }

  async remove(id: string) {
    //const pokemon = await this.findOne(id);
    //await pokemon.deleteOne();    
    const {acknowledged, deletedCount} = await this.pokemonModel.deleteOne({_id:id});
    if(deletedCount === 0)
    {
      throw new BadRequestException(`Pokemon with ${id} not found`);
    }
  }

  private handleExceptions(error:any){
    if(error.code === 11000)
      {
        throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`);
      }
      console.log(error)
      throw new InternalServerErrorException(`Cannot create pokemon in the db`);
  }
}
