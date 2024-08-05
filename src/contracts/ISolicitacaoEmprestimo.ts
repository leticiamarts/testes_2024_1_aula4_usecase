import { Emprestimo } from "entities/Emprestimo";

export interface ISolicitacaoEmprestimo {
    processa(entrada: SolicitacaoEmprestimoIn): SolicitacaoEmprestimoOut;
}

export interface SolicitacaoEmprestimoIn {
    contaId: string;
    valor: number;
}

export interface SolicitacaoEmprestimoOut {
    emprestimo: Emprestimo | Error;
}
