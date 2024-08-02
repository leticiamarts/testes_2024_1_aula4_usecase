// transferService.ts
import { AccountRepository } from '../contracts/transfer-repository';

export class TransferService {
  constructor(private accountRepository: AccountRepository) {}

  async transfer(fromAccountId: string, toAccountId: string, amount: number): Promise<void> {
    const fromBalance = await this.accountRepository.getBalance(fromAccountId);
    const toBalance = await this.accountRepository.getBalance(toAccountId);

    if (fromBalance < amount) {
      throw new Error('Insufficient funds');
    }

    await this.accountRepository.updateBalance(fromAccountId, fromBalance - amount);
    await this.accountRepository.updateBalance(toAccountId, toBalance + amount);
  }
}


