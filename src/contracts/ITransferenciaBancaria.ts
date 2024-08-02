export interface ITransferenciaBancariaIn {
    origem: string;
    destino: string;
    valor: number;
}

export interface ITransferenciaBancariaOut {
    valor: number | Error;
}
export interface ITransferenciaBancaria {
    processa(entrada: ITransferenciaBancariaIn): ITransferenciaBancariaOut;
}
