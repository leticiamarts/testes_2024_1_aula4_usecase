
export interface AccountRepository {
    getBalance(accountId: string): Promise<number>;
    updateBalance(accountId: string, amount: number): Promise<void>;
}


