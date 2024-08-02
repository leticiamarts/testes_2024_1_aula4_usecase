import { IAnimalQueNada } from "contracts/IAnimalQueNada";
import { IAnimalVoador } from "../contracts/IAnimalVoador";

export class Pato implements IAnimalVoador, IAnimalQueNada {
    voar(): void {
    }
    nadar(): void {
        // TODO: falta implementar
    }
}

export class Pinguim implements IAnimalQueNada {
    nadar(): void {
    }
}

const animaisVoadores: Array<IAnimalVoador> = [];

animaisVoadores.push(new Pato());
animaisVoadores.push(new Pinguim()); // Erro de compilação

