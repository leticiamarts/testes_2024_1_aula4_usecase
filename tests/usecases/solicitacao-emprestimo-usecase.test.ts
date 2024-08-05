import { SolicitacaoEmprestimoUseCase } from "../../src/usecases/solicitacao-emprestimo-usecase";
import { IEmprestimoRepository } from "../../src/contracts/IEmprestimoRepository";
import { IContaRepository } from "../../src/contracts/IContaRepository";
import { Emprestimo } from "../../src/entities/Emprestimo";
import { Conta } from "../../src/entities/Conta";
import { SolicitacaoEmprestimoIn } from "contracts/ISolicitacaoEmprestimo";

class FakeEmprestimoRepository implements IEmprestimoRepository {
    emprestimos: Emprestimo[] = [];

    findById(id: string): Emprestimo | Error {
        return this.emprestimos.find(emprestimo => emprestimo.id === id) || new Error("Empréstimo não encontrado");
    }

    save(emprestimo: Emprestimo): Emprestimo | Error {
        this.emprestimos.push(emprestimo);
        return emprestimo;
    }

    findEmprestimosByContaId(contaId: string): Emprestimo[] | Error {
        return this.emprestimos.filter(emprestimo => emprestimo.contaId === contaId);
    }
}

class FakeContaRepository implements IContaRepository {
    contas: Conta[] = [];

    findById(id: string): Conta | Error {
        return this.contas.find(conta => conta.id === id) || new Error("Conta não encontrada");
    }

    update(id: string, conta: Conta): Conta | Error {
        const index = this.contas.findIndex(c => c.id === id);
        if (index === -1) {
            return new Error("Conta não encontrada");
        }
        this.contas[index] = conta;
        return conta;
    }
}

describe('SolicitacaoEmprestimoUseCase', () => {
    let emprestimoRepo: FakeEmprestimoRepository;
    let contaRepo: FakeContaRepository;
    let sut: SolicitacaoEmprestimoUseCase;

    beforeEach(() => {
        emprestimoRepo = new FakeEmprestimoRepository();
        contaRepo = new FakeContaRepository();
        sut = new SolicitacaoEmprestimoUseCase(emprestimoRepo, contaRepo);
    });

    test('deve retornar erro se o valor do empréstimo for menor ou igual a zero', () => {
        const requisicao: SolicitacaoEmprestimoIn = { contaId: '123', valor: 0 };
        const retorno = sut.processa(requisicao);
        expect(retorno.emprestimo).toBeInstanceOf(Error);
    });

    test('deve retornar erro se a conta não existir', () => {
        const requisicao: SolicitacaoEmprestimoIn = { contaId: '123', valor: 100 };
        const retorno = sut.processa(requisicao);
        expect(retorno.emprestimo).toBeInstanceOf(Error);
        expect((retorno.emprestimo as Error).message).toBe("Conta não encontrada");
    });

    test('deve retornar erro se a conta estiver inativa', () => {
        contaRepo.contas.push({ id: '123', saldo: 1000, ativo: false });
        const requisicao: SolicitacaoEmprestimoIn = { contaId: '123', valor: 100 };
        const retorno = sut.processa(requisicao);
        expect(retorno.emprestimo).toBeInstanceOf(Error);
        expect((retorno.emprestimo as Error).message).toBe("Conta inativa");
    });

    test('deve retornar erro se findEmprestimosByContaId retornar erro', () => {
        const emprestimoRepoComError = new FakeEmprestimoRepository();
        jest.spyOn(emprestimoRepoComError, 'findEmprestimosByContaId').mockImplementation(() => new Error("Erro ao buscar empréstimos"));
        const sutComErrorRepo = new SolicitacaoEmprestimoUseCase(emprestimoRepoComError, contaRepo);
        
        contaRepo.contas.push({ id: '123', saldo: 1000, ativo: true });
        const requisicao: SolicitacaoEmprestimoIn = { contaId: '123', valor: 300 };
        const retorno = sutComErrorRepo.processa(requisicao);
        
        expect(retorno.emprestimo).toBeInstanceOf(Error);
        expect((retorno.emprestimo as Error).message).toBe("Erro ao buscar empréstimos");
    });

    test('deve calcular corretamente o total devido considerando apenas empréstimos aprovados', () => {
        contaRepo.contas.push({ id: '123', saldo: 1000, ativo: true });
    
        emprestimoRepo.emprestimos.push({ id: '1', contaId: '123', valor: 300, aprovado: true });
        emprestimoRepo.emprestimos.push({ id: '2', contaId: '123', valor: 200, aprovado: false });
        emprestimoRepo.emprestimos.push({ id: '3', contaId: '123', valor: 100, aprovado: true });
    
        const requisicao: SolicitacaoEmprestimoIn = { contaId: '123', valor: 100 };
        const retorno = sut.processa(requisicao);
    
        expect(retorno.emprestimo).not.toBeInstanceOf(Error);
        expect((retorno.emprestimo as Emprestimo).valor).toBe(100);
        expect((retorno.emprestimo as Emprestimo).aprovado).toBe(true);
    });

    test('deve retornar erro se os empréstimos totais excederem 50% do saldo da conta', () => {
        contaRepo.contas.push({ id: '123', saldo: 1000, ativo: true });
        emprestimoRepo.emprestimos.push({ id: '1', contaId: '123', valor: 300, aprovado: true });
        const requisicao: SolicitacaoEmprestimoIn = { contaId: '123', valor: 300 };
        const retorno = sut.processa(requisicao);
        expect(retorno.emprestimo).toBeInstanceOf(Error);
        expect((retorno.emprestimo as Error).message).toBe("Limite de empréstimo excedido");
    });

    test('deve aprovar o empréstimo se as condições forem atendidas', () => {
        contaRepo.contas.push({ id: '123', saldo: 1000, ativo: true });
        const requisicao: SolicitacaoEmprestimoIn = { contaId: '123', valor: 300 };
        const retorno = sut.processa(requisicao);
        expect(retorno.emprestimo).not.toBeInstanceOf(Error);
        expect((retorno.emprestimo as Emprestimo).valor).toBe(300);
        expect((retorno.emprestimo as Emprestimo).aprovado).toBe(true);
    });

    test('deve salvar o empréstimo no repositório', () => {
        contaRepo.contas.push({ id: '123', saldo: 1000, ativo: true });
        const requisicao: SolicitacaoEmprestimoIn = { contaId: '123', valor: 300 };
        const retorno = sut.processa(requisicao);
        expect(retorno.emprestimo).not.toBeInstanceOf(Error);
        expect(emprestimoRepo.emprestimos.length).toBe(1);
        expect(emprestimoRepo.emprestimos[0].valor).toBe(300);
    });

    test('deve retornar erro se save retornar erro', () => {
        const emprestimoRepoComError = new FakeEmprestimoRepository();
        jest.spyOn(emprestimoRepoComError, 'save').mockImplementation(() => new Error("Erro ao salvar empréstimo"));
        const sutComErrorRepo = new SolicitacaoEmprestimoUseCase(emprestimoRepoComError, contaRepo);
        
        contaRepo.contas.push({ id: '123', saldo: 1000, ativo: true });
        const requisicao: SolicitacaoEmprestimoIn = { contaId: '123', valor: 300 };
        const retorno = sutComErrorRepo.processa(requisicao);
        
        expect(retorno.emprestimo).toBeInstanceOf(Error);
        expect((retorno.emprestimo as Error).message).toBe("Erro ao salvar empréstimo");
    });
});
