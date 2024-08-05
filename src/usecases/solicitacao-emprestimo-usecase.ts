import { IEmprestimoRepository } from "../contracts/IEmprestimoRepository";
import { IContaRepository } from "../contracts/IContaRepository";
import { Emprestimo } from "../entities/Emprestimo";

export interface SolicitacaoEmprestimoIn {
    contaId: string;
    valor: number;
}

export interface SolicitacaoEmprestimoOut {
    emprestimo: Emprestimo | Error;
}

export class SolicitacaoEmprestimoUseCase {
    constructor(private emprestimoRepo: IEmprestimoRepository, private contaRepo: IContaRepository) {}

    processa(entrada: SolicitacaoEmprestimoIn): SolicitacaoEmprestimoOut {
        if (entrada.valor <= 0) {
            return { emprestimo: new Error("O valor do empréstimo deve ser maior que zero") };
        }

        const conta = this.contaRepo.findById(entrada.contaId);
        if (conta instanceof Error) {
            return { emprestimo: conta };
        }

        if (!conta.ativo) {
            return { emprestimo: new Error("Conta inativa") };
        }

        const emprestimosExistentes = this.emprestimoRepo.findEmprestimosByContaId(entrada.contaId);
        if (emprestimosExistentes instanceof Error) {
            return { emprestimo: emprestimosExistentes };
        }

        const totalDevido = emprestimosExistentes.reduce((sum, emprestimo) => sum + (emprestimo.aprovado ? emprestimo.valor : 0), 0);
        if (totalDevido + entrada.valor > conta.saldo * 0.5) {
            return { emprestimo: new Error("Limite de empréstimo excedido") };
        }

        const emprestimo = new Emprestimo();
        emprestimo.id = Date.now().toString();
        emprestimo.contaId = entrada.contaId;
        emprestimo.valor = entrada.valor;
        emprestimo.aprovado = true;

        const emprestimoSalvo = this.emprestimoRepo.save(emprestimo);
        if (emprestimoSalvo instanceof Error) {
            return { emprestimo: emprestimoSalvo };
        }

        return { emprestimo: emprestimoSalvo };
    }
}
