import { Conta } from "entities/Conta";

export interface IContaRepository{
    findById(id: string): Conta | Error;
    update(id:string, conta:Conta): Conta | Error;
}