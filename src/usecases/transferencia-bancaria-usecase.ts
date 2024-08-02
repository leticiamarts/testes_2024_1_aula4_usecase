import { IContaRepository } from "contracts/IContaRepository";
import { ITransferenciaBancaria, ITransferenciaBancariaIn, ITransferenciaBancariaOut } from "../contracts/ITransferenciaBancaria";

export class TransferenciaBancariaUseCase implements ITransferenciaBancaria {
    repo: IContaRepository;
    constructor(repo: IContaRepository) {
        this.repo = repo;
    }

    processa(entrada: ITransferenciaBancariaIn): ITransferenciaBancariaOut {
        // processa algo
        let retorno: ITransferenciaBancariaOut;
        if(entrada.valor<=0){
            retorno = {    
                valor: new Error("O valor da transferência deve ser maior que zero"),
            }
            return retorno;
        }
        const contaOrigem = this.repo.findById(entrada.origem);
        if(contaOrigem instanceof Error){
            const erro: ITransferenciaBancariaOut = {
                valor: new Error("Conta de origem não encontrada")
            }
            return erro;
        }
        const contaDestino = this.repo.findById(entrada.destino);
        if(contaDestino instanceof Error){
            const erro: ITransferenciaBancariaOut = {
                valor: new Error("Conta de destino não encontrada")
            }
            return erro;
        }

        if(contaOrigem.saldo < entrada.valor){
            const erro: ITransferenciaBancariaOut = {
                valor: new Error("Saldo insuficiente")
            }
            return erro;
        }
        contaOrigem.saldo -= entrada.valor;
        contaDestino.saldo += entrada.valor;
        const contaOrigemAtualizada = this.repo.update(entrada.origem, contaOrigem);
        if(contaOrigemAtualizada instanceof Error){
            const erro: ITransferenciaBancariaOut = {
                valor: new Error("Erro ao atualizar conta de origem")
            }
            return erro;
        }
        const contaDestinoAtualizada = this.repo.update(entrada.destino, contaDestino);
        if(contaDestinoAtualizada instanceof Error){
            const erro: ITransferenciaBancariaOut = {
                valor: new Error("Erro ao atualizar conta de destino")
            }
            return erro;
        }
        retorno = {    
            valor: entrada.valor,
        }
        return retorno;
    }
}