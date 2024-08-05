import { Emprestimo } from "../entities/Emprestimo";

export interface IEmprestimoRepository {
    findById(id: string): Emprestimo | Error;
    save(emprestimo: Emprestimo): Emprestimo | Error;
    findEmprestimosByContaId(contaId: string): Emprestimo[] | Error;
}
