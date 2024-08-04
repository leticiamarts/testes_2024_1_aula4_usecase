import { ITransferenciaBancariaIn } from "contracts/ITransferenciaBancaria";
import { TransferenciaBancariaUseCase } from "../../src/usecases/transferencia-bancaria-usecase";
import { Conta } from "../../src/entities/Conta";
import { IContaRepository } from "contracts/IContaRepository";
import exp from "constants";


class FakeRepository implements IContaRepository {
    contas: Conta[] = [];
    deveFalharAoAtualizarOrigem: boolean = false;
    deveFalharAoAtualizarDestino: boolean = false;

    setContas(contas: Conta[]): void {
        this.contas = contas;
    }    
    findById(id: string): Conta | Error {
        return this.contas.find(c => c.id === id) || new Error("Conta não encontrada");
    }
    update(id: string, conta: Conta): Conta | Error {
        if (this.deveFalharAoAtualizarOrigem && id === "origem") {
            return new Error("Erro ao atualizar conta de origem");
        }
        if (this.deveFalharAoAtualizarDestino && id === "destino") {
            return new Error("Erro ao atualizar conta de destino");
        }
        const index = this.contas.findIndex(c => c.id === id);
        if (index === -1) {
            return new Error("Conta não encontrada");
        }
        this.contas[index] = conta;
        return conta;
    }
}

describe('Transferencia Bancária UseCase', () => {
    test("Deve retornar um erro caso o valor da transferência seja menor ou igual a zero", () => {
        // Arrange (setup)
        const sut = new TransferenciaBancariaUseCase({} as IContaRepository);
        // Act
        const dados_de_transferencia: ITransferenciaBancariaIn = {
            origem: "123",
            destino: "456",
            valor: 0
        }
        const resultado_obtido_caso_de_uso = sut.processa(dados_de_transferencia);
        // Assert (tratar a expectativa)
        expect(resultado_obtido_caso_de_uso.valor).toBeInstanceOf(Error);
    });
    //os alunos devem implementar os testes restantes
    test("Solicita transferencia sem saldo da conta de origem", ()=> {
        const repoFake = new FakeRepository();
        const conta1: Conta = {
            id: "123",
            saldo: 0,
            ativo: true
        };
        const conta2: Conta = {
            id: "321",
            saldo: 0,
            ativo: true
        };
        repoFake.setContas([conta1, conta2])
        const sut = new TransferenciaBancariaUseCase(repoFake);

        const retorno = sut.processa({
            origem: conta1.id,
            destino: conta2.id,
            valor: 100
        });

        expect(retorno.valor).toBeInstanceOf(Error)
        expect((retorno.valor as Error).message).toEqual("Saldo insuficiente");
    });

    test("Deve atualizar as contas corretamente em caso de sucesso na transferência", () => {
        const repoFake = new FakeRepository();
        const conta1: Conta = {
            id: "123",
            saldo: 200,
            ativo: true
        };
        const conta2: Conta = {
            id: "321",
            saldo: 100,
            ativo: true
        };
        repoFake.setContas([conta1, conta2]);
        const sut = new TransferenciaBancariaUseCase(repoFake);

        const retorno = sut.processa({
            origem: conta1.id,
            destino: conta2.id,
            valor: 100
        });

        expect(retorno.valor).toBe(100);
        const conta1Atualizada = repoFake.findById(conta1.id);
        if (conta1Atualizada instanceof Conta) {
            expect(conta1Atualizada.saldo).toBe(100);
        } else {
            throw new Error("Conta de origem não encontrada");
        }

        const conta2Atualizada = repoFake.findById(conta2.id);
        if (conta2Atualizada instanceof Conta) {
            expect(conta2Atualizada.saldo).toBe(200);
        } else {
            throw new Error("Conta de destino não encontrada");
        }
    });

    test("Deve retornar um erro caso a conta de origem não seja encontrada", () => {
        const repoFake = new FakeRepository();
        const sut = new TransferenciaBancariaUseCase(repoFake);

        const retorno = sut.processa({
            origem: "999",
            destino: "123",
            valor: 100
        });

        expect(retorno.valor).toBeInstanceOf(Error);
        expect((retorno.valor as Error).message).toEqual("Conta de origem não encontrada");
    });

    test("Deve retornar um erro caso a conta de destino não seja encontrada", () => {
        const repoFake = new FakeRepository();
        const conta1: Conta = {
            id: "123",
            saldo: 100,
            ativo: true
        };
        repoFake.setContas([conta1]);
        const sut = new TransferenciaBancariaUseCase(repoFake);

        const retorno = sut.processa({
            origem: conta1.id,
            destino: "999",
            valor: 100
        });
    });

    test("Deve retornar um erro ao atualizar a conta de origem", () => {
        const repoFake = new FakeRepository();
        repoFake.deveFalharAoAtualizarOrigem = true; // Simula falha na atualização da conta de origem
        const conta1: Conta = {
            id: "origem",
            saldo: 200,
            ativo: true
        };
        const conta2: Conta = {
            id: "destino",
            saldo: 100,
            ativo: true
        };
        repoFake.setContas([conta1, conta2]);
        const sut = new TransferenciaBancariaUseCase(repoFake);
    
        const retorno = sut.processa({
            origem: conta1.id,
            destino: conta2.id,
            valor: 100
        });
    
        expect(retorno.valor).toBeInstanceOf(Error);
        expect((retorno.valor as Error).message).toEqual("Erro ao atualizar conta de origem");
    });

});