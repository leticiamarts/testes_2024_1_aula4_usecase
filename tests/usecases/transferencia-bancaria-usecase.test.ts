import { ITransferenciaBancariaIn } from "contracts/ITransferenciaBancaria";
import { TransferenciaBancariaUseCase } from "../../src/usecases/transferencia-bancaria-usecase";
import { Conta } from "entities/Conta";
import { IContaRepository } from "contracts/IContaRepository";
import exp from "constants";


class FakeRepository implements IContaRepository {
    contas: Conta[] = [];

    setContas(contas: Conta[]): void {
        this.contas = contas;
    }    
    findById(id: string): Conta | Error {
        return this.contas.find(c => c.id === id) || new Error("Conta não encontrada");
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
    })
});