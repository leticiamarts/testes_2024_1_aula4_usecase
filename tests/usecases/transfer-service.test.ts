// transferService.test.ts
import { TransferService } from '../../src/usecases/transfer-service';
import { AccountRepository } from '../../src/contracts/transfer-repository';

// Criar um mock para AccountRepository
const mockAccountRepository: jest.Mocked<AccountRepository> = {
  getBalance: jest.fn(),
  updateBalance: jest.fn(),
};

describe.skip('TransferService', () => {
  let transferService: TransferService;

  beforeEach(() => {
    // Reinicializa os mocks antes de cada teste
    jest.clearAllMocks();
    transferService = new TransferService(mockAccountRepository);
  });

  it('should transfer amount successfully', async () => {
    // Configurar os mocks
    mockAccountRepository.getBalance.mockResolvedValueOnce(100).mockResolvedValueOnce(50);

    await transferService.transfer('account1', 'account2', 50);

    // Verificar as chamadas do mock
    expect(mockAccountRepository.getBalance).toHaveBeenCalledWith('account1');
    expect(mockAccountRepository.getBalance).toHaveBeenCalledWith('account2');
    expect(mockAccountRepository.updateBalance).toHaveBeenCalledWith('account1', 50);
    expect(mockAccountRepository.updateBalance).toHaveBeenCalledWith('account2', 100);
  });

  it('should throw an error if insufficient funds', async () => {
    // Configurar os mocks
    mockAccountRepository.getBalance.mockResolvedValueOnce(30);

    await expect(transferService.transfer('account1', 'account2', 50)).rejects.toThrow('Insufficient funds');

    // Verificar que updateBalance não foi chamado
    expect(mockAccountRepository.updateBalance).not.toHaveBeenCalled();
  });
});
